var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Embedded Auth with SSO Demo' });
});

router.get('/login',
  function(req, res){
    res.redirect('/');
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/loggedOut', function(req, res){
  res.json({status: 'logged out'});
});

router.post('/callback', function(req, res) {
  res.redirect(req.session.returnTo || '/user');
});

router.get('/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/error',
  }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/user');
  });


router.get('/unauthorized', function(req, res) {
  res.render('unauthorized');
});


module.exports = router;
