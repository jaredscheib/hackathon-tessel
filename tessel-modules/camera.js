var tessel = require( 'tessel' );
var camera = require( 'camera-vc0706' ).use( tessel.port['D'] );

var net = require('net');
var config = require('../config.js');

process.env.TESSEL_UPLOAD_DIR = './images';

var cameraConnection = net.connect(config.port, config.host, function(){
  console.log('Camera connected to server');
});

var cameraInit = function() {
  var notificationLED = tessel.led[3]; //LED to notify when we're taking a picture
  camera.isReady = false;
  camera.setResolution( 'vga' ); //set picture resolution, highest is vga

  camera.on( 'ready', function() {
    notificationLED.high();
    // camera.setCompression( 0 ); //set compression, minimum is ?
    camera.isReady = true;

    var responseBody = '';

    cameraConnection.on('data', function(data) {
      responseBody += data.toString();
      console.log('data: ', responseBody);
      cameraRouter[responseBody.command].apply(null, responseBody.params);
    });

    cameraConnection.on('end', function() {
      responseBody = JSON.parse(responseBody);
      console.log('end: ', responseBody);
      cameraRouter[responseBody.command].apply(null, responseBody.params);
    });
  });

  camera.on( 'picture', function(buffer) {
    cameraConnection.write(buffer);
  });
};

camera.on ('error', function( err ) {
  console.error( err );
});

cameraRouter = {
  capturePhoto: function(frames) {
    return stream(frames);
  }
};

var stream = function( frames ) {
  if( !camera.isReady ) return;

  camera.setResolution( 'vga' ); //set picture resolution, highest is vga
  if( frames <= 0 ) camera.disable();
  frames = frames || 1;

  camera.takePicture( function( err, image ) {
    if( err ){
      console.log( 'error taking image', err );
    }else{
      notificationLED.low();
      var name = 'VID_' + Math.floor(Date.now()*1000) + '.jpg';
      console.log( 'Saving frame as', name, '...' );
      // process.sendfile( name, image );
      console.log( 'done.' );
    }
    console.log( 'frames', frames );
    frames--;
    return stream( frames );
  });
};

cameraInit();

module.exports = {
  stream: stream
}