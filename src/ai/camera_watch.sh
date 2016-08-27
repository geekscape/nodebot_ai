#!/bin/sh
#
# Watch remote GStreamer RTP/H.264/UDP video stream

LOCAL_PORT=5001

if [ $# = 1 ]; then
  LOCAL_PORT=$1
fi

# sync=f: Play as soon as data arrives
# sync=t: Play depending upon video buffer timestamps
#
VIDEO_SYNC="sync=f"
VIDEO_SINK=ximagesink

OS=`uname`

if [ $OS = "Darwin" ]; then
  VIDEO_SINK=osxvideosink
fi

gst-launch-1.0 udpsrc port=$LOCAL_PORT \
  caps='application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264' ! \
  rtph264depay ! avdec_h264 ! videoconvert ! $VIDEO_SINK $VIDEO_SYNC
