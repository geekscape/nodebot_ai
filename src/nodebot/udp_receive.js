#!/usr/bin/env node

var dgram = require('dgram');

var UDP_PORT = 4000;

var server = dgram.createSocket('udp4');

server.on('message', function (msg, rinfo) {
  console.log('Received: ' + rinfo.address + ':' + rinfo.port + ': ' + msg);
});

server.bind(UDP_PORT);
