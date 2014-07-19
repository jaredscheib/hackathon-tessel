var tessel = require( 'tessel' );
var camera = require( 'camera-vc0706' ).use( tessel.port['D'] );

var net = require('net');
var config = require('./config.js');

process.env.TESSEL_UPLOAD_DIR = './images';

var cameraConnection = net.connect(config.port, config.host);

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
      responseBody += data;
    });

    cameraConnection.on('end', function() {
      responseBody = JSON.parse(responseBody);
      console.log(responseBody);
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
  photo: function() {
    return capturePhoto();
  },

  video: function(frames) {
    return captureVideo(frames);
  }
};

var capturePhoto = function() {
  if( !camera.isReady ) return;

  camera.takePicture( function( err, image ) {
    if( err ){
      console.log( 'error taking image', err );
    }else{
      notificationLED.low();
      var name = 'IMG_' + Math.floor(Date.now()*1000) + '.jpg';
      console.log( 'Picture saving as', name, '...' );
      // process.sendfile( name, image );
      console.log( 'done.' );
      camera.disable();
    }
  });
};

var captureVideo = function( frames ) {
  if( !camera.isReady ) return;

  camera.setResolution( 'vga' ); //set picture resolution, highest is vga
  if( frames <= 0 ) camera.disable();
  frames = frames || 5;

  camera.takePicture( function( err, image ) {
    if( err ){
      console.log( 'error taking image', err );
    }else{
      notificationLED.low();
      var name = 'VID_' + Math.floor(Date.now()*1000) + '.jpg';
      console.log( 'Video frame saving as', name, '...' );
      // process.sendfile( name, image );
      console.log( 'done.' );
    }
    console.log( 'frames', frames );
    frames--;
    return captureVideo( frames );
  });
};

cameraInit();

module.exports = {
  capturePhoto: capturePhoto,
  captureVideo: captureVideo
}