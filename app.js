var express = require( 'express' );

var tessel = require( 'tessel' );
var camera = require( './tessel-modules/camera.js' );

var app = express();

app.get( '/', function( req, res ){
  res.send('Hello world');
});

var server = app.listen( 3000, function() {
  console.log( 'Server listening on port %d', server.address().port );
});