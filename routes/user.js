var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var request = require('request');

var apiData;

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {
  // console.log('apiData: ' + apiData);
  res.render('user', {
    user: req.user,
    apiData: apiData,
    title: 'NodeJS Cross-origin Auth Demo'
  });
apiData = null;
});

router.get('/apicall', ensureLoggedIn, function(req, res, next) {
  
  // invoke diag endpoint with authn header
    var options = {
      url: 'https://atbpotapi.desmaximus.com/api/private',
      headers: {
        'Authorization': 'Bearer ' + req.user.extraParams.access_token
      }
    };

    request(options, function(error, response, body) {
	console.log(error);
	console.log(body);
      if (response.statusCode === 401) {
        // need a refresh token
        return res.redirect('/user/refresh');
      }
      
      apiData = JSON.parse(body).message;
      return res.redirect('/user');
    });

});

router.get('/refresh', ensureLoggedIn, function(req, res, next) {
  // get refresh token
  getRefreshToken(req, function (error, response, body) {
   console.log(error);
   console.log(body);
    req.user.extraParams.id_token = body.id_token;
    req.user.extraParams.access_token = body.access_token;
    return res.redirect('/user/apicall');
  });
});

function getRefreshToken(req, cb) {
  // get refresh token
  
  var options = { method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    body: { 
      grant_type: 'refresh_token',
      client_id: `${process.env.AUTH0_CLIENT_ID}`,
      client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
      refresh_token: req.user.extraParams.refresh_token,
      redirect_uri: `${process.env.AUTH0_CALLBACK_URL}` 
    }, 
    json: true 
  };

  request(options, cb);

}

module.exports = router;
