var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var dotenv = require('dotenv');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

dotenv.load();

var routes = require('./routes/index');
var user = require('./routes/user');


// This will configure Passport to use Auth0
var strategy = new Auth0Strategy({
    domain:       process.env.AUTH0_DOMAIN,
    clientID:     process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:  process.env.AUTH0_CALLBACK_URL
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    
	console.log(extraParams);
	// accessToken is the JWT access token
    // extraParams.id_token is the JWT id token
    // profile has all the information from the user
    console.log('access token: ' + accessToken);
    console.log('refresh token: ' + refreshToken);
    console.log('id token: ' + extraParams.id_token);
    extraParams.refresh_token = refreshToken;

    return done(null, {
      profile: profile,
      extraParams: extraParams,
    });
  });

passport.use(strategy);

// you can use this section to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var app = express();
// make env available in jade templates
app.locals.env = process.env;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view options', { pretty: true });


app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(session({
  secret: 'yourSessionSecret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/user', user);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port 3000!')
})
//module.exports = app;
