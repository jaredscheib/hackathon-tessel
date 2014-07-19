var tessel = require( 'tessel' );
var camera = require( 'camera-vc0706' ).use( tessel.port['D'] );

// process.env.TESSEL_UPLOAD_DIR = './images';

var notificationLED = tessel.led[3]; //LED to notify when we're taking a picture
camera.isReady = false;

camera.on( 'ready', function() {
  notificationLED.high();
  camera.setCompression( 0 ); //set compression, minimum is 0
  camera.setResolution( 'vga' ); //set picture resolution, highest is vga
  camera.isReady = true;
});

camera.on ('error', function( err ) {
  console.error( err );
});

var takePicture = function() {
  if( !camera.isReady ) return;

  camera.takePicture( function( err, image ) {
    if( err ){
      console.log( 'error taking image', err );
    }else{
      notificationLED.low();
      var name = 'IMG_' + Math.floor(Date.now()*1000) + '.jpg';
      console.log( 'Picture saving as', name, '...' );
      process.sendfile( name, image );
      console.log( 'done.' );
      camera.disable();
    }
  });
};

module.exports = {
  takePicture: takePicture
}