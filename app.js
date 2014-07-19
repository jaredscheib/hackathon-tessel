var net = require('net');
var config = require('./config.js');
var camera = require('tessel-modules/camera');

var server = net.createServer( function(c) {
  console.log('server connected');
  c.on('end', function(){
    console.log('server disconnected');
  });
  c.write('hello\r\n');
  c.pipe(c);
});

server.listen(config.port, function() {
  console.log('Listening at ' + config.host + ':' + config.port);
})