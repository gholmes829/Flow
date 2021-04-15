var express = require('express');
var request = require('request');
var querystring = require('querystring');
var SpotifyWebApi = require('spotify-web-api-node');

var router = express.Router();

//Spotify API
var spotifyAPI = new SpotifyWebApi();
var access_token = '';
var refresh_token = '';

var client_id = 'c7cca4bb63634ddf8e6d205c9b23a7b6'; // Your client id
var client_secret = '849cf7b45dd849ed97ec6990bb6896a6';
var redirect_uri = 'http://catchthatflow.com:9000/spotify/callback/';
var stateKey = 'spotify_auth_state';

var username = '';
var playlists = [];
var playlist = [];
var profilePic = '';

var sendSongs = function(id, res, size) {
	// gets audio 
	// convert to promises?
	var songData = {};
	spotifyAPI.getAudioFeaturesForTrack(id, function(err, data) {
		if (err) {
			console.log("ERROR: " + err);
		} else {
			songData = data.body;
			console.log(playlist.length);
			playlist.push(songData);
			if (playlist.length === size) {
				res.send({"playlist": playlist});
			}
		}
	});
};

router.get('/userData', function(req, res, next) {
	console.log("Recieved user info request!");		
	// gets users playlists, sends username, profilePic, and playlists
	spotifyAPI.getUserPlaylists().then(
		function(data) {
			playlists = data.body.items;
			var response = {
				username: username,
				profilePic: profilePic,
				playlists: playlists
			}
			//console.log(response);
			res.send(response);
		},
		function(err) {
			res.send(err);
		}
	);
});

router.get('/playlist/:id', function(req, res, next) {
	// sends multiple song data?
	console.log('Finding playlist...');
	playlist = [];
	var songs;
	var size;
	spotifyAPI.getPlaylist(req.params.id).then(
		function(data) {
			console.log("A Playlist!");
			size = data.body.tracks.items.length;			
			songs = data.body.tracks.items;
		},
		function(err) {
			res.send(err);
		}
	)
	.then( function () {
		console.log("Entering send song loop...");
		songs.forEach(function (song) {
			console.log("Sending song from caller: " + song.track.name);
			sendSongs(song.track.id, res, size);
		});
		//console.log("SENDING", playlist.length, size);
		//res.send({"playlist": playlist});
	});
});

router.get('/login', function(req, res, next) {
  // log in to account
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  
  // requesting authorization
  var scope = 'user-read-private user-read-email';
  var url = 'https://accounts.spotify.com/authorize?' + 
             querystring.stringify({
               response_type: 'code',
               client_id: client_id,
               scope: scope,
               redirect_uri: redirect_uri,
               state: state
             });

  res.redirect(url);

});


router.get('/callback', function(req, res) {
  // callback after logging in to spotify
  // requesting refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
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
        access_token = body.access_token;
        refresh_token = body.refresh_token;
	spotifyAPI.setAccessToken(access_token);
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // using the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          username = body.display_name;
	  profilePic = body.images.length === 0 ? []: [body.images[0].url];
        });

        // passing the token to the browser to make requests from there
        res.redirect('http://catchthatflow.com/' + '#login-success');
      } else {
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
	var authOptions = {
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
			access_token = body.access_token;
			spotifyAPI.use(access_token);
		}
	});
});

// needed for cookies
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

module.exports = router;
