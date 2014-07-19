// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
This basic accelerometer example logs a stream
of x, y, and z data from the accelerometer
*********************************************/

var tessel = require('tessel');
var accel = require('accel-mma84').use(tessel.port['A']);

var net = require( 'net' );
var config = require( '../config.js' );

accelConnection = net.connect( config.port, config.host , function() {
  console.log( 'connected' );
});

var lastX;
var lastZ;

var waitX = false;
var wait = false;

var click = function( data ) { 
  var x = parseInt( data[0] );
  var z = parseInt( data[1] );

  if( lastZ === undefined ) {
    lastZ = z;
  }  

  if( lastX === undefined ) {
    lastX = x;
  }

  if( Math.abs( x - lastX ) > 70 && waitX === false ) {
    waitX = true;
    noXClick();
    accelConnection.write( JSON.stringify( 'x-click' ) );
    console.log( 'X click' );
  }

  if( Math.abs( z - lastZ ) > 70 && wait === false ) {
    wait = true;
    noClick();
    accelConnection.write( JSON.stringify( 'z-click' ) );
    console.log( 'click' );
  }

  lastX = x;
  lastZ = z;
};

var noClick = function() {
  setTimeout( function() {
    wait = false;
  }, 1000 );
};

var noXClick = function() {
  setTimeout( function() {
    waitX = false;
  }, 1000 );
};

accel.on('ready', function () {
  accel.on('data', function (xyz) {
    click( [ xyz[0].toFixed(2).replace('.', '' ) , xyz[2].toFixed(2).replace('.', '' ) ] );
  });
});

accel.on('error', function(err){
  console.log('Error:', err);
});