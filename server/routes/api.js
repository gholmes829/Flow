var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

    res.send('Hello from the server!');

});

//Spotify API
var clientID = '9586133394724f65b7fc986b34fa1a2c';
var redirect_uri = 'http://catchthatflow.com/';
var scopes = 'user-read-private user-read-email';

router.get('/login', function(req, res, next) {
    res.redirect('https://accounts.spotify.com/authorize' +
                 '?response_type=code' +
                 '&client_id=' +
                 clientID +
                 (scopes ? '&scope=' +
                 encodeURIComponent(scopes) : '') +
                 '&redirect_uri=' +
                 encodeURIComponent(redirect_uri)
    );
});

module.exports = router;
