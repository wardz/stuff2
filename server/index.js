const dotenv = require('dotenv').config();
const express = require('express');
const wagner = require('wagner-core');
const passport = require('passport');
const favicon = require('serve-favicon');
const headers = require('./libs/headers');

const ROOT_PUBLIC = __dirname + '/public';

// Configurate middlewares
require('./config/winston')(wagner);
require('./config/db')(wagner);
require('./config/s3form')(wagner);

// Initialize app & top middlewares
const app = express();
app.disable('x-powered-by');
app.use(favicon(ROOT_PUBLIC + '/img/favicon.png'));
app.use(headers.default());
if (app.get('env') === 'production')
	app.set('trust proxy', 1);

// Passport middleware
require('./config/sessions')(app);
require('./libs/passport')(passport, wagner);
app.use(passport.initialize());
app.use(passport.session());

// Serve up static pages from file system
app.use(express.static(ROOT_PUBLIC));

// Express subrouters
app.use('/api/v1', require('./routes/api')(wagner));
app.use('/api/secure/', headers.noCache(), require('./routes/secure')(passport, wagner));

// Make angular work with url hotlinking in html5 mode
app.all('/*', function(req, res) {
	res.status(200).sendFile(ROOT_PUBLIC + '/index.html');
});

// Let's roll
var server = app.listen(process.env.PORT || 1337, function() {
	console.log('Listening on port ' + (process.env.PORT || 1337));
});
server.timeout = process.env.SERVER_TIMEOUT || 20000;
