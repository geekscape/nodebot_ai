NodeBot AI project(s)
=====================

Contents
--------
- [Hardware](#hardware)
- [Hardware assembly](#hardware-assembly)
- [Hardware power supply](#hardware-power-supply)

<a name="hardware" />
Hardware
--------

<a name="hardware-assembly" />
Hardware assembly
-----------------

See [Hardware directory](hardware)

<a name="hardware-power-supply" />
Hardware power supply
---------------------

All measurements at 5 VDC.  Raspberry Pi 2 has Wi-Pi (USB Wi-Fi dongle).

- mBot idle (with LED matrix, line following, etc): 0.15 mA
- mBot motors running (@ 100 out of 255): 0.21 mA
- mBot motors starting/spinning up: 0.27 mA
- Pixy camera starting up: 0.25 mA
- Pixy camera idle: 0.18 mA
- RPi2 starting up: 0.38 mA
- RPi2 idle: 0.28 mA
- RPi2 Wi-Fi data transfer: 0.38 mA to 0.44 mA
- RPi2 capturing video: 0.46 mA (note: CPU is idling)
- RPi2 capturing video and Wi-Fi data transfer: 0.66 mA
- RPi2 one CPU thread busy loop (25%): 0.31 mA
- RPi2 four CPU threads busy loop (100%): 0.41 mA
- RPi2 CPU 100%, video and Wi-Fi transfer: 0.76 mA

All up: RPi2 0.76 mA + Pixy 0.25 mA + mBot 0.27 mA = 1.28 mA total
