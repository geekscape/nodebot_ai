#!/usr/bin/env node

/*
 * Description
 * ~~~~~~~~~~~
 * NodeBots (Johnny-Five) support for MakeBlock LED Matrix peripheral.
 * Contains a simple driver for TM1640 16 x 8 LED driver IC.
 * Provides simple low-level graphics support, e.g clear screen,
 *   draw point, line,horizontal line, vertical line, rectangle and cirle.
 *
 * Author(s): Andrew Fisher (@ajfisher)  https://github.com/ajfisher
 *            Andy Gelme    (@geekscape) https://github.com/geekscape
 *
 * Requirements
 * ~~~~~~~~~~~~
 * An Arduino running Firmata with a MakeBlock TM1640 LED Matrix.
 *
 *   npm install johnny-five
 *   npm install oled-font-5x7
 *
 * Usage: NodeBot (NodeJS + Johnny-Five) module
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Application code must maintain a reference to the "screen" variable.
 *
 *   var five       = require('johnny-five');
 *   var board      = five.Board();
 *   var led_screen = require('./tm1640_led_screen');
 *
 *   board.on('ready', function() {
 *     var screen = led_screen.initialize(five, board, 14, 15);
 *     led_screen.clear_screen(screen);
 *     led_screen.draw_character(screen, 6, 0, '?');
 *     led_screen.write_screen(screen);
 *     screen.matrix = new Buffer([     // Checkerboard
 *       0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55,
 *       0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55
 *     ]);
 *     led_screen.write_screen(screen);
 *   });
 *
 * Usage: Command line testing using NodeBots (Johnny-Five) REPL
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * This test environment automatically maintains an internal "screen" variable.
 *
 *   $ node tm1640_led_screen.js test
 *   1469988451381 Device(s) /dev/cu.wchusbserial1410
 *   1469988451391 Connected /dev/cu.wchusbserial1410
 *   1469988455308 Repl Initialized
 *   NodeBot ready, type "help()" for help !
 *   >> help();
 *   >> test();  // stop test running
 *   >> clear_screen();
 *   >> draw_character(6, 0, '?');
 *
 * Resources
 * ~~~~~~~~~
 * Titan Micro Electronics TM1640: 16 x 8 LED driver datasheet (Chinese)
 * https://dl.dropboxusercontent.com/u/8663580/TM1640.pdf
 *
 * To Do
 * ~~~~~
 * - Check all function parameters are within range (bounds).
 */

var WIDTH  = 16;
var HEIGHT =  8;

var font = require('oled-font-5x7');

var test_enabled = (process.argv.length === 3  &&  process.argv[2] === 'test');

if (test_enabled) {
  var five  = require('johnny-five');
  var board = five.Board();

  board.on('ready', function() {
    console.log('NodeBot ready, type "help()" for help !');

    var PIN_CLOCK = 14;
    var PIN_DATA  = 15;
    var screen    = initialize(five, board, PIN_CLOCK, PIN_DATA);

    clear_screen(screen);

    if (true) {
      draw_character(screen,  1, 0, 'G');
      draw_character(screen,  7, 0, 'o');
      draw_character(screen, 13, 0, '!');
      write_screen(screen);
    }
    else {
      screen.matrix = new Buffer([     // Checkerboard
        0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55,
        0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55
      ]);
      write_screen(screen);
    }

    clear_screen(screen);

    var state_running = true;
    var state_visible = false;

    setInterval(function() {
      if (state_running) {
        state_visible = ! state_visible;

        if (true) {                                         // Face ?
          draw_rectangle(screen, 0, 0, WIDTH, HEIGHT, state_visible);
          draw_circle(screen,  5, 3, 1, state_visible);
          draw_circle(screen, 10, 3, 1, state_visible);
          draw_lineh(screen,   7, 5, 2, state_visible);
        }
        else {                                     // X marks the spot !
          draw_line(screen, 0, 0, H - 1, HEIGHT - 1,     state_visible);
          draw_line(screen, 0, HEIGHT - 1, WIDTH - 1, 0, state_visible);
        }

//      invert_screen(screen);

        write_screen(screen);
      }
    }.bind(this), 1000);

    this.repl.inject({
      help: function() {
        console.log('Columns: 0 - 15, rows, 0 - 7, optional value: 0 - 1');
        console.log('Functions:');
        console.log('  clear_screen(value)');
        console.log('  draw_character(column, row, character, value)');
        console.log('  draw_circle(column, row, radius, value)');
        console.log('  draw_line(column0, row0, column1, row1, value)');
        console.log('  draw_lineh(column, row, length, value)');
        console.log('  draw_linev(column, row, length, value)');
        console.log('  draw_point(column, row, value)');
        console.log('  draw_rectangle(column, row, width, height, value)');
        console.log('  fill_circle(column, row, radius, value)');
        console.log('  fill_rectangle(column, row, width, height, value)');
        console.log('  test(): Toggle between test running or not');
      },
      clear_screen: function(value) {
        clear_screen(screen, value);
      },
      draw_character: function(column, row, character, value) {
        draw_character(screen, column, row, character, value);
        write_screen(screen);
      },
      draw_circle: function(column, row, radius, value) {
        draw_circle(screen, column, row, radius, value);
        write_screen(screen);
      },
      draw_line: function(column0, row0, column1, row1, value) {
        draw_line(screen, column0, row0, column1, row1, value);
        write_screen(screen);
      },
      draw_lineh: function(column, row, length, value) {
        draw_lineh(screen, column, row, length, value);
        write_screen(screen);
      },
      draw_linev: function(column, row, length, value) {
        draw_linev(screen, column, row, length, value);
        write_screen(screen);
      },
      draw_point: function(column, row, value) {
        draw_point(screen, column, row, value);
        write_screen(screen);
      },
      draw_rectangle: function(column, row, width, height, value) {
        draw_rectangle(screen, column, row, width, height, value);
        write_screen(screen);
      },
      fill_circle: function(column, row, radius, value) {
        fill_circle(screen, column, row, radius, value);
        write_screen(screen);
      },
      fill_rectangle: function(column, row, width, height, value) {
        draw_rectangle(screen, column, row, width, height, value);
        write_screen(screen);
      },
      invert_screen: function(value) {
        invert_screen(screen);
        write_screen(screen);
      },
      test: function(value) {
        state_running = ! state_running;
      console.log('Test run state: ' + state_running);
      }
    });
  });
}

function initialize(five, board, pin_clock_number, pin_data_number) {
  var MODE_ADDRESS_AUTO_ADD_1 = 0x40;
  var MODE_PERMANENT_ADDRESS  = 0x44;

  var pin_clock = five.Pin({
    pin:  pin_clock_number,
    mode: board.io.MODES.OUTPUT,
  });

  var pin_data = five.Pin({
    pin:  pin_data_number,
    mode: board.io.MODES.OUTPUT,
  });

  write_byte(pin_clock, pin_data, MODE_ADDRESS_AUTO_ADD_1);
  write_byte(pin_clock, pin_data, 0x8c);

  var screen = {
    pin_clock: pin_clock, pin_data: pin_data, matrix: new Buffer(16)
  };

  return(screen);
}

function write_byte(pin_clock, pin_data, buffer) {
  pin_clock.high();  pin_data.low();

  for (var bit = 0;  bit < 8; bit ++) {
    pin_clock.low();
    pin_data.write(buffer & 0x01);
    pin_clock.high();
    buffer = buffer >> 1;
  }

  pin_clock.low();   pin_data.low();
  pin_clock.high();  pin_data.high();
}

function write_bytes_to_address(pin_clock, pin_data, address, buffer) {
  address = address | 0xc0;

  pin_clock.high();  pin_data.low();

  for (var bit = 0;  bit < 8; bit ++) {
    pin_clock.low();
    pin_data.write(address & 0x01);
    pin_clock.high();
    address = address >> 1;
  }

  for (var byte = 0;  byte < buffer.length;  byte ++) {
    var data = buffer[byte];

    for (bit = 0; bit < 8; bit ++) {
      pin_clock.low();
      pin_data.write(data & 0x01);
      pin_clock.high();
      data = data >> 1;
    }
  }

  pin_clock.low();   pin_data.low();
  pin_clock.high();  pin_data.high();
}

function write_screen(screen) {
  write_bytes_to_address(screen.pin_clock, screen.pin_data, 0, screen.matrix);
}

function clear_screen(screen, value) {  // value = 0xff for all LEDS on
  if (typeof(value) === 'undefined') value = 0;
  screen.matrix.fill(value);
  write_screen(screen);
}

function invert_screen(screen) {
  for (var index = 0;  index < screen.matrix.length;  index ++) {
    screen.matrix[index] = screen.matrix[index] ^ 0xff;
  }
}

function draw_point(screen, column, row, value) {
  var bit  = (typeof(value) === 'undefined')  ?  1  :  value;
  var mask = 0xff ^ (1 << row);
  screen.matrix[column] = screen.matrix[column] & mask | (bit << row);

// TODO: This should work and would be much more efficient !
//write_bytes_to_address(
//  screen.pin_clock, screen.pin_data, column, new Buffer(screen.matrix[column])
//);
}

// Bresenham's line algorithm

function draw_line(screen, column0, row0, column1, row1, value) {
  var column_delta = Math.abs(column1 - column0);
  var row_delta    = Math.abs(row1    - row0);

  var column_increment = column0 < column1 ? 1 : -1;
  var row_increment    = row0    < row1    ? 1 : -1;

  var error = (column_delta > row_delta ? column_delta : -row_delta) / 2;

  while (true) {
    draw_point(screen, column0, row0, value);

    if (column0 === column1  &&  row0 === row1) break;

    var error2 = error;

    if (error2 > -column_delta) {
      error   -= row_delta;
      column0 += column_increment;
    }

    if (error2 < row_delta) {
      error += column_delta;
      row0  += row_increment;
    }
  }
}

function draw_lineh(screen, column, row, length, value) {
  for (var index = column;  index < column + length;  index ++) {
    draw_point(screen, index, row, value);
  }

// TODO: More efficient to write_bytes_to_address() for only changed columns !
}

function draw_linev(screen, column, row, length, value) {
  var bit  = (typeof(value) === 'undefined')  ?  1  :  value;
  var byte = (Math.pow(2, length) - 1) << row;
  var mask = 0xff ^ byte;
  if (bit === false) byte = 0;
  screen.matrix[column] = screen.matrix[column] & mask | byte;

// TODO: This should work and would be much more efficient !
//write_bytes_to_address(
//  screen.pin_clock, screen.pin_data, column, new Buffer(screen.matrix[column])
//);
}

function draw_rectangle(screen, row, column, width, height, value) {
  draw_lineh(screen, column, row,              width,  value);
  draw_lineh(screen, column, row + height - 1, width,  value);
  draw_linev(screen, column, row,              height, value);
  draw_linev(screen, column + width - 1, row,  height, value);
}

function fill_rectangle(screen, column, row, width, height, value) {
  for (var index = 0;  index < width;  index ++) {
    draw_linev(screen, column + index, row, height, value);
  }
}

// Bresenham's line algorithm extended for circles

function draw_circle(screen, column, row, radius, value) {
  var x = radius, y = 0;
  var radiusError = 1 - x;

  while (x >= y) {
    draw_point(screen, -y + column, -x + row, value);
    draw_point(screen,  y + column, -x + row, value);
    draw_point(screen, -x + column, -y + row, value);
    draw_point(screen,  x + column, -y + row, value);
    draw_point(screen, -x + column,  y + row, value);
    draw_point(screen,  x + column,  y + row, value);
    draw_point(screen, -y + column,  x + row, value);
    draw_point(screen,  y + column,  x + row, value);
    y++;

    if (radiusError < 0) {
      radiusError += 2 * y + 1;
    }
    else {
      x --;
      radiusError += 2 * (y - x + 1);
    }
  }
}

function fill_circle(screen, column, row, radius, value) {
  var x = radius, y = 0;
  var radiusError = 1 - x;

  while (x >= y) {
    draw_line(screen, -y + column, -x + row, y + column, -x + row, value);
    draw_line(screen, -x + column, -y + row, x + column, -y + row, value);
    draw_line(screen, -x + column,  y + row, x + column,  y + row, value);
    draw_line(screen, -y + column,  x + row, y + column,  x + row, value);
    y++;

    if (radiusError < 0) {
      radiusError += 2 * y + 1;
    }
    else {
      x --;
      radiusError+= 2 * (y - x + 1);
    }
  }
}

// Thanks Suz (@noopkat) !
// https://github.com/noopkat/oled-font-5x7

function draw_character(screen, column, row, character, value) {
  var lookup   = index = font.lookup.indexOf(character) * 5;
  var fontData = font.fontData.slice(lookup, lookup + 5);

  for (var index = 0;  index < fontData.length;  index ++) {
    screen.matrix[column + index] = fontData[index] << 1;
  }
}

module.exports = {
  initialize:             initialize,
  write_byte:             write_byte,
  write_bytes_to_address: write_bytes_to_address,
  write_screen:           write_screen,
  clear_screen:           clear_screen,
  invert_screen:          invert_screen,
  draw_point:             draw_point,
  draw_line:              draw_line,
  draw_lineh:             draw_lineh,
  draw_linev:             draw_linev,
  draw_rectangle:         draw_rectangle,
  fill_rectangle:         fill_rectangle,
  draw_circle:            draw_circle,
  fill_circle:            fill_circle,
  draw_character:         draw_character
};
