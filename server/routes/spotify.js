/*
Manages Spotify API and service requests.
*/

var express = require('express');
var request = require('request');
var path = require('path');
var pythonShell = require('python-shell')
var querystring = require('querystring');
var SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

var router = express.Router();

// Spotify API
var spotifyAPI = new SpotifyWebApi();

// IDs
const client_id = 'c7cca4bb63634ddf8e6d205c9b23a7b6';
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://catchthatflow.com:9000/spotify/callback/';
const stateKey = 'spotify_auth_state';

var getSongData = function(song, features, playlistID) {
	// gets audio features + any additional data from song
	return {
		features: features,
		name: song.name,
		artists: song.artists.map(artist => artist.name),
		images: song.album.images,
		album: song.album.name,
		uri: song.uri.replace("spotify:track:", ""),
	};
};

const getAudioFeatures = (trackIds) => {
	return spotifyAPI.getAudioFeaturesForTracks(trackIds)
	.then(res => {
		let features
		try {
			features = res.body.audio_features.map(rawFeatures => ({
				danceability: rawFeatures.danceability,
				energy: rawFeatures.energy,
				speechiness: rawFeatures.speechiness,
				acousticness: rawFeatures.acousticness,
				instrumentalness: rawFeatures.instrumentalness,
				liveness: rawFeatures.liveness,
				valence: rawFeatures.valence,
				tempo: rawFeatures.tempo,
			}))
		}
		catch (err) {
			console.log(err)
		}
		return features
	})
}

router.post('/analyzePlaylist', (req, res) => {
	let song_data = req.body
	target_path = path.join(path.resolve(__dirname, '..'), 'services', 'analysis.py')
	let song_scores
	let pyshell = new pythonShell.PythonShell(target_path)
	pyshell.send(JSON.stringify(song_data))
	pyshell.on('message', function (message) {
		// received a message sent from the Python script (a simple "print" statement)
		song_scores = message
	})

	pyshell.end((err, code, signal) => {
		if (err) {
			console.log(err)
			console.log('The exit code was: ' + code);
			console.log('The exit signal was: ' + signal);
		}
		
		res.send(song_scores)
	})

});

router.post('/createPlaylist/:name/:token', (req, res) => {
	let songURIs = req.body.data
	let playlistName = req.params["name"];
	let accessToken = req.params["token"]
	
	try {
		spotifyAPI.setAccessToken(accessToken);
		spotifyAPI.createPlaylist(playlistName, { 'description': 'Flow generated playlist!', 'public': false })
		.then(data => {
			let id = data.body.id
			return spotifyAPI.addTracksToPlaylist(id, songURIs, null)
		})
		.then(data => {
			res.send(data)
		})
	}
	catch (err) {
		console.log(err)
	}
});

router.get('/userData/:token', function(req, res, next) {	
	// gets users playlists, sends username, profilePic, and playlists
    let access_token = req.params["token"]
    spotifyAPI.setAccessToken(access_token)
    let data = {};
    spotifyAPI.getMe()
    .then(userInfo => {
        let body = userInfo.body
        data.username = body.display_name
		try {
			data.profilePic = body.images[0].url
		}
		catch (err) {
			data.profilePic = ""
		}

        spotifyAPI.getUserPlaylists()
        .then(playlists => {
            //data.body.items.forEach(playlist => {playlists[playlist.id] = playlist.name});
            data.playlists = playlists.body.items
				.map(playlist => ({"name": playlist.name, "id": playlist.id, "images": playlist.images}))
				.filter(playlist => playlist.name !== "Liked Songs")
            res.send(data)
        })
        .catch(err => {
            console.log("Error: " + err);
            res.send(err)
        })
    })
    .catch(err => {
            console.log("Error: " + err);
            res.send(err)
    })
});

router.get('/userPlaylists/:token', function(req, res, next) {
    let access_token = req.params["token"];
    spotifyAPI.setAccessToken(access_token);
	spotifyAPI.getUserPlaylists()
	.then(playlists => {
		res.send({
			playlists: playlists.body.items.map(playlist => ({"name": playlist.name, "id": playlist.id, "images": playlist.images}))
		});
	})
	.catch(err => {
		console.log("Error: " + err);
		res.send(err);
	});
});

router.get('/songFeatures/:id/:token', function(req, res, next) {
    let access_token = req.params["token"];
    spotifyAPI.setAccessToken(access_token);
	let songID = req.params.id;
	spotifyAPI.getAudioFeaturesForTrack(songID)
	.then(features =>
		res.send({features: features}))
	.catch(err => {
		console.log("Error: " + err);
		res.send(err);
	});
});

router.get('/playlist/:id/:token', function(req, res, next) {
	// takes in id of playlist, returns list of songs information
	let playlistID = req.params.id;
    let access_token = req.params["token"];
    spotifyAPI.setAccessToken(access_token);
	spotifyAPI.getPlaylist(req.params.id)  // get playlist info
	.then(data => {
		let songs = data.body.tracks.items;  // list of songs in playlist
		let trackIds = songs.map(song => song.track.id)
		getAudioFeatures(trackIds)
		.then(trackFeatures => {
			let finalData = {playlist: trackFeatures.map((features, i) => getSongData(songs[i].track, features, playlistID))}
			res.send(finalData)
		})
		.catch(err => {
			console.log("Error: " + err);
			res.send(err);
		})
	})
	.catch(err => {
		console.log("Error: " + err);
		res.send(err);
	})
})

router.get('/login', function(req, res, next) {
	// log in to account
	let state = generateRandomString(16);
	let scope = "user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private"
	let queryString = querystring.stringify({
		response_type: 'code',
		client_id: client_id,
		scope: scope,
		redirect_uri: redirect_uri,
		state: state,
        show_dialog: true,
	})
	
	res.cookie(stateKey, state);

	// requesting authorization
	res.redirect('https://accounts.spotify.com/authorize?' + queryString);
});


router.get('/callback', function(req, res) {
	// callback after logging in to spotify, requesting refresh and access tokens after checking the state parameter
	let state = req.query.state || null;  // grab state if present else set to null
	let storedState = req.cookies ? req.cookies[stateKey] : null;  // grab cookies if present else set to null

	if (state === null || state !== storedState) {  // validate state
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	}
	else {  // state matches
		res.clearCookie(stateKey);  // remove cookie, already validated state
		let authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: req.query.code || null,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		};
		request.post(authOptions, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				let access_token = body.access_token
				let refresh_token = body.refresh_token
				//spotifyAPI.setAccessToken(access_token)
				//spotifyAPI.setRefreshToken(refresh_token)

				tokenExpirationEpoch = new Date().getTime() / 1000 + body['expires_in'];

				console.log('Retrieved token. It expires in ' +
					Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
					' seconds!'
				);

				// passing the token to the browser to make requests from there
				//TODO: send expiration info (expires_in, refresh_token) to client and have client make request to refresh when it gets close to expiration
				res.redirect('http://catchthatflow.com/' + '#login-success-' + access_token);
			}
			else {
				res.redirect('/#' +
				querystring.stringify({
					error: 'invalid_token'
				}))
			}
		})
	}
})

router.get('/refresh_token', function(req, res) {
	// requesting access token from refresh token
	let authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		},
		json: true
	};

	request.post(authOptions, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			let access_token = body.access_token;
			spotifyAPI.setAccessToken(access_token);
			res.send({accessToken: access_token})
		}
	});
});

var generateRandomString = function(size) {
	// needed for cookies
	let text = '';
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < size; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.size));
	}
	return text;
};

module.exports = router;
