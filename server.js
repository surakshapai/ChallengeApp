// Bootstrapping the application from this file 

var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');

var configDB = require('./config/database.js');

//Configure the database to connect 

mongoose.connect(configDB.url); // On heroku, the URl needs to be configured on the Mongo extension 

// Pass passport object first to passport module 
require('./config/passport')(passport);

app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname + '/views')));
app.use(morgan('dev')); //logs every request to the dev's console
app.set('view engine', 'html');
app.use(cookieParser());
app.use(bodyParser());

app.use(expressSession({secret: 'nodeAuthProject'})); 

app.use(passport.initialize());
//Persists user sessions 
app.use(passport.session());
app.use(flash());


require('./routes.js')(app, passport);
app.listen(port);