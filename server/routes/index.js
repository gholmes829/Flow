/*
Default route, reroutes to website.
*/

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('http://catchthatflow.com/');
});

module.exports = router;
