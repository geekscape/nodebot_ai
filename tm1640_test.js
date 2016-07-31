#!/usr/bin/env node

var five       = require('johnny-five');
var board      = five.Board();
var led_screen = require('./tm1640_led_screen');

board.on('ready', function() {
  console.log('NodeBot ready');

  var screen = led_screen.initialize(five, board, 14, 15);

  led_screen.clear_screen(screen);
  led_screen.draw_character(screen, 6, 0, '?');
  led_screen.write_screen(screen);

//screen.matrix = new Buffer([     // Checkerboard
//  0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55,
//  0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55
//]);
//led_screen.write_screen(screen);
});
