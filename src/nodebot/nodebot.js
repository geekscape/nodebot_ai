#!/usr/bin/env node

/*
 * Usage
 * ~~~~~
 *   node nodebot.js            # keyboard enabled,  search for port
 *   node nodebot.js stdin_off  # keyboard disabled, search for port
 *   node nodebot.js port       # specific Johnny-Five board port
 *
 * Operating
 * ~~~~~~~~~
 * - LED matrix: pin 14 clock, pin 15 data
 * - Ultrasonic sensor (ping): pin A3
 *
 * To Do
 * ~~~~~
 * - Implement "h" for help
 * - LED screen: Motor speed as vertical bars
 * - LED screen: AI output as horizontal bar
 * - LED screen: Current state: f, b, l, r, s, ai on / off
 *
 * - Implement line following: reflectance sensors
 * - Implement LEDs (pin 7 ?)
 * - Implement button sensor
 * - Implement light sensor
 * - Implement buzzer
 *
 * Resources
 * ~~~~~~~~~
 * github.com/Makeblock-official/mbot_nodebots/blob/master/examples/button.js
 *
 * github.com/Makeblock-official/mbot_nodebots/blob/master/examples/leds.js
 *
 * github.com/Makeblock-official/mbot_nodebots/blob/master/examples/light.js
 *
 * github.com/rwaldron/johnny-five/wiki/Motor
 * github.com/Makeblock-official/mbot_nodebots/blob/master/examples/motors.js
 *
 * github.com/Makeblock-official/mbot_nodebots/blob/master/examples/piezo.js
 *
 * github.com/Makeblock-official/mbot_nodebots/blob/master/examples/reflectance.js
 *
 * github.com/rwaldron/johnny-five/wiki/Proximity
 * github.com/Makeblock-official/mbot_nodebots/blob/master/examples/sonar.js
 * https://gist.githubusercontent.com/rwaldron/0519fcd5c48bfe43b827/raw/f17fb09b92ed04722953823d9416649ff380c35b/PingFirmata.ino
 */

var board_port;
var stdin_off = false;

if (process.argv.length === 3) {
  if (process.argv[2] === 'stdin_off') {
    stdin_off = true;
  }
  else {
    board_port = process.argv[2]
  }
}

var UDP_PORT = 4000;

var ai_fudge_factor = 0.011;

var proximity_limit = 20.0;  // centimeters
var proximity_last  =  0.0;

var speed_min    =  80;
var speed_max    = 120;
var speed_factor = 0.5;
var speed_motor  = speed_factor * (speed_max - speed_min) + speed_min;

var dgram       = require('dgram');
var johnny_five = require('johnny-five');
var led_screen  = require('./tm1640_led_screen');

console.log('NodeBot: Connecting');
var board = new johnny_five.Board({port: board_port});

var motor_left, motor_right;
var screen;
var state    = 'setup';
var state_ai = false;

board.on('ready', function(error) {
  if (error) {
    console.log(error);
    return;
  }

  console.log('NodeBot: Connected');

  screen = led_screen.initialize(johnny_five, board, 14, 15);
  led_screen.clear_screen(screen);
  led_screen.draw_character(screen, 6, 1, '?');
  led_screen.write_screen(screen);

  motor_left = new johnny_five.Motor({
    pins: { pwm: 6, dir: 7 }
  });

  motor_right = new johnny_five.Motor({
    pins: { pwm: 5, dir: 4 }
  });

  motor_left.stop();
  motor_right.stop();
  state = 'stop';
  console.log('State: ' + state + ', ai: ' + state_ai);

  var proximity = new johnny_five.Proximity({
    freq:       250,
    controller: 'HCSR04',
    pin:        'A3'
  });

  proximity.on('data', function() {
    var proximity = this.cm;

    var proximity_delta = Math.abs(proximity - proximity_last);
    if (proximity <= 100  &&  proximity_delta >=  1.0  ||
        proximity >= 100  &&  proximity_delta >= 10.0) {

      console.log('cm: ' + proximity.toFixed(0));
      proximity_last = proximity;
    }

    if (state === 'run'  &&  proximity < proximity_limit) {
      motor_left.stop();
      motor_right.stop();
      state = 'pause';
      console.log('State: ' + state + ', ai: ' + state_ai);
    }

    if (state === 'pause'  &&  proximity > proximity_limit) {
      motor_left.reverse(speed_motor);
      motor_right.forward(speed_motor);
      state = 'run';
      console.log('State: ' + state + ', ai: ' + state_ai);
    }
  });

  console.log('NodeBot: Ready');
});

function action(command) {
  if (state === 'setup') return;

  if (command >= '0'  &&  command <= '9') {
    value = parseInt(command);
    if (value === 0) value = 10;
    speed_factor = value / 10;
    speed_motor  = speed_factor * (speed_max - speed_min) + speed_min;

    motor_left.reverse(speed_motor);
    motor_right.forward(speed_motor);
    state = 'run';
  }

  switch (command) {
    case ' ':
      motor_left.stop();
      motor_right.stop();
      state = 'stop';
      console.log('State: ' + state + ', ai: ' + state_ai);
      break;

    case 'a':
      state_ai = ! state_ai;
      console.log('State: ' + state + ', ai: ' + state_ai);
      break;

    case 'f':
      motor_left.reverse(speed_motor);
      motor_right.forward(speed_motor);
      state = 'run';
      console.log('State: ' + state + ', ai: ' + state_ai);
      break;

    case 'b':
      motor_left.forward(speed_motor);
      motor_right.reverse(speed_motor);
      state = 'run';
      console.log('Turn: back');
      break;

    case 'l':
      motor_left.forward(speed_motor);
      motor_right.forward(speed_motor);
      state = 'run';
      console.log('Turn: left');
      break;

    case 'r':
      motor_left.reverse(speed_motor);
      motor_right.reverse(speed_motor);
      state = 'run';
      console.log('Turn: right');
      break;

    case 'q':
      console.log('Exiting');
      motor_left.stop();
      motor_right.stop();
      state = 'stop';
      process.exit();
      break;

    case 'mood:clear':
      led_screen.clear_screen(screen);
      led_screen.write_screen(screen);
      break;

    case 'mood:happy':
      screen.matrix = new Buffer([
        0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0x44, 0x40,
        0x40, 0x44, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);
      led_screen.write_screen(screen);
      break;

    case 'mood:sad':
      screen.matrix = new Buffer([
        0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x24, 0x20,
        0x20, 0x24, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);
      led_screen.write_screen(screen);
      break;
  }
}

if (stdin_off === false) {
  var stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  stdin.on('data', function(key) {
    action(key);
  });
}

var server = dgram.createSocket('udp4');
var ai_output_last = 0.0;

server.on('message', function (message, rinfo) {
//console.log('Received: ' + rinfo.address + ':' + rinfo.port + ': ' + message);
//console.log('Received: ' + message);

  message = message.toString();

  if (message.startsWith('ai:')) {
    if (state === 'run'  &&  state_ai === true) {
      var ai_output = parseFloat(message.substring(3)) - ai_fudge_factor;

      if (Math.abs(ai_output - ai_output_last) >= 0.0) {
        ai_output_last = ai_output;

        var ai_motor_left  = (-1.666 *  ai_output) + 0.5;
        var ai_motor_right =   1.666 * (ai_output + 0.3);

        var precision = 2;
        console.log('ai: ' + ai_output.toFixed(precision)      +
                  ', ml: ' + ai_motor_left.toFixed(precision)  +
                  ', mr: ' + ai_motor_right.toFixed(precision) +
                  ', ms: ' + speed_motor);

        motor_left.reverse(ai_motor_left   * speed_motor * 2);
        motor_right.forward(ai_motor_right * speed_motor * 2);
      }
    }
  }
  else if (message.startsWith('mood:')) {
    action(message.substring(0, message.length -1));  // remove newline
  }
  else {
    action(message.substring(0,1));  // use first character
  }
});

server.bind(UDP_PORT);
