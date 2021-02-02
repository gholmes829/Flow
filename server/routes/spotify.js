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

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get('/playlist', function(req, res, next) {
		
		spotifyAPI.getUserPlaylists().then(
			function(data) {
				console.log(data);
			},
			function(err) {
				console.log(err);
			}
		);
});

router.get('/login', function(req, res, next) {
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
		// modify
		accessToken = access_token;
		refreshToken = refresh_token;
		spotifyAPI.setAccessToken(access_token);
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // using the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // passing the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
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
  var refresh_token = req.query.refresh_token;
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
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

module.exports = router;
