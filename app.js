var net = require('net');
var camera = require('tessel-modules/camera');

var server = net.createServer( function(c) {
  console.log('server connected');
  c.on('end', function(){
    console.log('server disconnected');
  });
  c.write('hello\r\n');
  c.pipe(c);
});

server.listen(8124, function() {
  console.log('listening');
})