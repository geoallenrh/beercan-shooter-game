'use strict';

var config         = require('./bin/config.js'),
    express        = require('express');

var app = express();

var routes  = require('./routes/routes.js');
var status  = require('./routes/status.js');
var backend = require('./routes/backend.js');

//Simple request time logger
app.use(function(req, res, next){
  console.log("Requested: " + req.path);
  next();
});

// Static files
app.use('/assets', express.static('assets'));
app.use('/node_modules', express.static('node_modules'));
app.use('/bin', express.static('bin'));
// Status page
app.use('/status', status);
// Application
app.use('/', routes);
app.use('/ws', backend);
// Anything else
app.get('*', function(req, res){
  res.send('Sorry, this URL is not defined');
});


app.listen(config.get('PORT'), config.get('IP'), function () {
  console.log( 'Listening on ' + config.get('IP') + ', port ' + config.get('PORT') )
});