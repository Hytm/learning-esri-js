//Définition des modules utilisés sous express
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var routes = require('./routes/index');
var circulation = require('./routes/circulation');
var travaux = require('./routes/travaux');

var app = express();

app.enable('etag');
app.set('etag', 'strong'); //génération des etag par MD5
app.set('view engine', 'jade'); //moteur de rendu des pages express

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//définition des racines de routes utilisable par l'api
app.use('/', routes);
app.use('/circulation', circulation);
app.use('/travaux', travaux);

module.exports = app;
