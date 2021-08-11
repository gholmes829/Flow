/*
Manages Spotify API.
*/

var express = require('express');
var request = require('request');
var querystring = require('querystring');
var SpotifyWebApi = require('spotify-web-api-node');

var router = express.Router();

// Spotify API
var spotifyAPI = new SpotifyWebApi();
var refresh_token = '';

// IDs
var client_id = 'c7cca4bb63634ddf8e6d205c9b23a7b6';
var client_secret = '';
var redirect_uri = 'http://catchthatflow.com:9000/spotify/callback/';
var stateKey = 'spotify_auth_state';

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


var getAudioFeatures = function(id, retries=25) {
    //console.log("GETTING FEATURES: " + id);
    return new Promise((resolve, reject) => {
        let features = [];
        if (!retries) {
            console.log("Rejecting!!!");
            reject(null);
        }
        //console.log(id);
        spotifyAPI.getAudioFeaturesForTrack(id)
        .then(res => {
            //console.log("Complete!");
            features = res;
            resolve(features);
        })
        .catch(err => {
           console.log("BIG ERROR: " + JSON.stringify(err));
           console.log(retries + " " + (10.25 - retries));
           let result = null;
           setTimeout(() => {
               getAudioFeatures(id, retries-1)
               .then(res => resolve(res));
            }, 100 * Math.min(5, 10.25 - retries));
        });
        
    });
};

router.get('/makePlaylist/:id-name-token', function(req, res, next) {
	// Create a private playlist
	let id = req.params["id"];
	let name = req.params["name"];
    let access_token = req.params["token"];
    spotifyAPI.setAccessToken(access_token);
	spotifyApi.createPlaylist(name, { 'description': 'Flow generated playlist', 'public': true })  // change this to private?
	.then(function(data) {
		console.log('Created playlist!');
	}, function(err) {
		console.log('Error: ', err);
	});
});

router.get('/addTracksToPlaylist/:playlistID-:tracks(spotify:track:*((-spotify:track:*)+)?)-token', function(req, res, next) {
	let playlistID = req.params["playlistID"];
    let access_token = req.params["token"];
    spotifyAPI.setAccessToken(access_token);
	let tracks = req.params.tracks.split('-');  // I sure hope the regex works...
	spotifyApi.addTracksToPlaylist(playlistID, tracks)
	.then(function(data) {
		console.log('Added tracks to playlist!');
	}, function(err) {
		console.log('Something went wrong!', err);
	});
});

// maybe don't include this one...
router.get('/removeTrackFromPlaylist/:playlistID-songURI-token', function(req, res, next) {
	// Remove all occurrence of a track
	let playlistID = req.params["playlistID"];
	let songURI = req.params["songURI"];
    let access_token = req.params["token"];
    spotifyAPI.setAccessToken(access_token);
	var tracks = [{ uri : songURI }];
	var options = {} // does this work?
	//var options = { snapshot_id : "0wD+DKCUxiSR/WY8lF3fiCTb7Z8X4ifTUtqn8rO82O4Mvi5wsX8BsLj7IbIpLVM9" };
	spotifyApi.removeTracksFromPlaylist(playlistId, tracks, options)
	.then(function(data) {
		console.log('Tracks removed from playlist!');
	}, function(err) {
		console.log('Something went wrong!', err);
	});
});

router.get('/userData/:token', function(req, res, next) {	
	// gets users playlists, sends username, profilePic, and playlists
    let access_token = req.params["token"];
    spotifyAPI.setAccessToken(access_token);
    let data = {};
    spotifyAPI.getMe()
    .then(userInfo => {
        let body = userInfo.body;
        data.username = body.display_name;
        data.profilePic = body.images[0].url;
        spotifyAPI.getUserPlaylists()
        .then(playlists => {
            //data.body.items.forEach(playlist => {playlists[playlist.id] = playlist.name});
            data.playlists = playlists.body.items.map(playlist => ({"name": playlist.name, "id": playlist.id, "images": playlist.images}))
            console.log("Data: " + data);
            res.send(data);
        })
        .catch(err => {
            console.log("Error: " + err);
            res.send(err);
        });
    })
    .catch(err => {
            console.log("Error: " + err);
            res.send(err);
    });
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
		res.send({features: features.body}))
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
		Promise.all(data.body.tracks.items.map(song => getAudioFeatures(song.track.id)))  // get audio features
		.then(songData => res.send({"playlist": songData.map((data, i) => getSongData(songs[i].track, data.body, playlistID))}))  // refine and send data
		.catch(err => {
			console.log("Error: " + err);
			res.send(err);
		});
	})
	.catch(err => {
		console.log("Error: " + err);
		res.send(err);
	});
});

router.get('/login', function(req, res, next) {
	// log in to account
	let state = generateRandomString(16);
	let scope = 'user-read-private user-read-email';
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
	let state = req.query.state || null;
	let storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	}
	else {
		res.clearCookie(stateKey);
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
		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {
				let access_token = body.access_token;
				let refresh_token = body.refresh_token;
				spotifyAPI.setAccessToken(access_token);

				// passing the token to the browser to make requests from there
				res.redirect('http://catchthatflow.com/' + '#login-success-' + access_token);
			}
			else {
				res.redirect('/#' +
				querystring.stringify({
					error: 'invalid_token'
				}));
			}
		});
	}
});

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

	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			let access_token = body.access_token;
			spotifyAPI.setAccessToken(access_token);
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
