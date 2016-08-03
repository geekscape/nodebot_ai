from __future__ import print_function

import cv2
import numpy as np
import tensorflow as tf
import socket

video_output = True

from time import time
time_next  = time()

if video_output:
  time_delay = 0.2
else:
  time_delay = 0.05

import train

udp_host = "localhost"
udp_port = 4000
sock     = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

key_wait_time = 10
input_size = 128

capture = cv2.VideoCapture(0)

# video_size = (int(capture.get(cv2.CAP_PROP_FRAME_WIDTH)),
#               int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT)))
# print "Video width, height: " + str(video_size)

model = train.build_model()
model.load('checkpoints/road_model1-72')

def process_frame(frame):
  pr = model.predict(frame[np.newaxis, :, :, np.newaxis])
  return pr[0][0]

while capture.isOpened():
  success, frame = capture.read()

  if success:
    time_now = time()
    if time_now >= time_next:
      time_next = time_now + time_delay

      frame_gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
      frame_small = cv2.resize(frame_gray, (128, 128))
#     frame_small = cv2.resize(frame_gray, (128, 128 + 95))
      frame_small = cv2.flip(frame_small, 0)  # horizontal flip
      frame_small = cv2.flip(frame_small, 1)  # vertical flip
#     frame_small = frame_small[-128:,]
      if video_output:
        cv2.imshow('video', frame_small)

      output_value =  process_frame(frame_small)
      print(output_value)
      sock.sendto('ai: %.6f' % output_value, (udp_host, udp_port))

    ch = cv2.waitKey(key_wait_time) & 0xFF
    if ch == 27:
      break
    if ch == ord('q'):
      break

capture.release()
cv2.destroyAllWindows()
