var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var validator = require('express-validator');
var index = require('./routes/index');
var compression = require('compression');
var helmet = require('helmet');

var app = express();
app.use(compression()); //Compress all routes
app.use(helmet()); // Secure Express app with various HTTP headers

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Setup database connection
var username = "postgres" 
var password = "postgres" 
var host = "localhost:5432"
var database = "spatial"
conString = process.env.DATABASE_URL || "postgres://" + username + ":" + password + "@" + host + "/" + database; 


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(validator());
app.use(cookieParser());
var pgSession = require('connect-pg-simple')(session);
app.use(session({
  store: new pgSession({
    conString: conString 
  }),
  secret: 'badumtaradx',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 24 * 60 * 60 * 1000
  },
  secure: true
}));
app.use(express.static(__dirname + '/public'));
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('pages/error');
});

module.exports = app;
