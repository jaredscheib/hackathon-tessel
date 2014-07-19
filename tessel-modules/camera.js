var tessel = require( 'tessel' );
var camera = require( 'camera-vc0706' ).use( tessel.port['D'] );

var net = require('net');
var config = require('../config.js');

process.env.TESSEL_UPLOAD_DIR = './images';

var cameraConnection = net.connect(config.port, config.host, function(){
  console.log('Camera connected to server');
});

var notificationLED = tessel.led[3]; //LED to notify when we're taking a picture

var cameraInit = function() {
  camera.isReady = false;
  camera.setResolution( 'vga' ); //set picture resolution, highest is vga

  camera.on( 'ready', function() {
    notificationLED.high();
    // camera.setCompression( 0 ); //set compression, minimum is ?
    camera.isReady = true;
    console.log('camera ready');

    cameraConnection.on('data', function(data) {
      console.log(data);
      data = JSON.parse(data.toString());
      console.log('data: ', data);
      cameraRouter[data.command].call(null, data.param);
    });
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
  if( frames <= 0 ) {
    console.log('disable camera');
    return camera.disable();
  }
  frames = frames || 1;
  console.log( frames, 'photos remaining. capturing photo...' );

  camera.takePicture( function( err, image ) {
    if( err ){
      console.log( 'error taking image', err );
    }else{
      notificationLED.low();
      // console.log('hello');
      // var name = 'VID_' + Math.floor(Date.now()*1000) + '.jpg';
      // console.log( 'Saving frame as', name, '...' );
      // process.sendfile( name, image );
      console.log('sending photo buffer to server: ', image)
      cameraConnection.write(image);
      console.log( 'photo sent to server.' );
    }
    frames--;
    return stream( frames );
  });
};

cameraInit();

module.exports = {
  stream: stream
}