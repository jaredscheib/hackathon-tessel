var tessel = require( 'tessel' );
var camera = require( 'camera-vc0706' ).use( tessel.port['D'] );

var net = require('net');
var config = require('../config.js');

var fs = require('fs');

process.env.TESSEL_UPLOAD_DIR = './images';
var cameraConnection;

var cameraConnectionInit = function() {
  cameraConnection = net.connect(config.port, config.host, function(){
    console.log('Camera connected to server');
  });

  cameraConnection.on('data', function(data) {
    data = JSON.parse(data.toString());
    console.log('data: ', data);
    cameraRouter[data.command].call(null, data.param);
  });
};

var notificationLED = tessel.led[3]; //LED to notify when we're taking a picture

var cameraInit = function() {
  camera.isReady = false;
  camera.setResolution( 'vga' ); //set picture resolution, highest is vga

  camera.on( 'ready', function() {
    notificationLED.high();
    camera.setResolution( 'vga', function(){
      // camera.setCompression( 0 ); //set compression, minimum is ?
      camera.isReady = true;
    }); //set picture resolution, highest is vga
  });

  camera.on ('error', function( err ) {
    console.error( err );
  });
};

//various commands that client might receive from server
cameraRouter = {
  cameraCapture: function(frames) {
    return stream(frames);
  },
  cameraStart: function() {
    cameraInit();
    console.log('camera initialized');
  },
  cameraStop: function() {
    camera.disable();
    console.log('camera disabled');
  },
  cameraConnect: function() {
    cameraConnectionInit();
  },
  cameraDisconnect: function(callback) {
    cameraConnection.end(function(){
      callback();
    });
  }
};

var stream = function( frames ) {
  if( !camera.isReady ) return;

  if( frames === undefined ) frames = 1;
  if( frames <= 0 ) return console.log( 'all photos captured');
  frames = frames || 1;
  console.log( frames, 'photos remaining. capturing photo...' );

  camera.takePicture( function( err, image ) {
    if( err ){
      console.log( 'error taking image', err );
    }else{
      notificationLED.low();
      var name = 'IMG_' + Math.floor(Date.now()*1000) + '.jpg';
      console.log( 'Saving frame as', name, '...' );
      console.log(_dirname);
      fs.writeFileSync( __dirname + '/images/' + name, image );
      console.log('file done');
      cameraRouter.cameraStop();
      console.log('sending photo buffer to server: ', image)
      cameraConnection.write(image, function(){
        console.log( 'photo sent to server.' );
        cameraRouter.cameraDisconnect(function(){
          console.log('camera disconnected from server');
          cameraRouter.cameraConnect();
        });
      });
    }
    frames--;
    return stream( frames );
  });
};

cameraRouter.cameraStart();
cameraRouter.cameraConnect();

module.exports = {
  stream: stream
};