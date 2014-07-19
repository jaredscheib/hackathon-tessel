var net = require('net');
var config = require('./config.js');


var server = net.createServer(function(conn) {
  console.log('connected');
  conn.on('data', function(data) {
    conn.write(data);
  });
  conn.on('end', function() {
    console.log('disconnected');
  });
});

server.listen(config.port, function() {
  console.log('Listening at ' + config.host + ':' + config.port);
});
