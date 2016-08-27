#!/bin/sh
#
# Local video capture sent over GStreamer RTP/H.264/UDP to local/remote hosts

REMOTE_HOST=nomad.local  # classify_video.py
REMOTE_PORT=5001         #   "           "

if [ $# = 1 ]; then
  REMOTE_HOST=$1
fi

if [ $# = 2 ]; then
  REMOTE_PORT=$2
fi

# Raspberry Pi camera
#
BIT_RATE=1000000
FPS=10
# Ratio 16:9 1.777
WIDTH=512
HEIGHT=288

# Local host UDP stream
#
HOST_L=127.0.0.1
PORT_L=5000
FPS_L=10/1
# Ratio: 1:1
WIDTH_L=128
HEIGHT_L=128

# Remote host UDP stream
#
HOST_R=$REMOTE_HOST
PORT_R=$REMOTE_PORT
FPS_R=10/1
# Ratio 16:9 1.777
WIDTH_R=512
HEIGHT_R=288

# If remote host can't be found, then stream to localhost
#
ping -c 1 -q $HOST_R >/dev/null 2>&1

if [ $? != 0 ]; then
  HOST_R=127.0.0.1
fi

echo Remote camera stream: $HOST_R:$PORT_R

OS=`uname`

if [ $OS = "Darwin" ]; then
  H264_DECODE=avdec_h264
# H264_ENCODE=x264enc 
# H264_ENCODE=avenc_mpeg4   # software encoder
  H264_ENCODE=vtenc_h264

  OVERLAY='queue'
else
  H264_DECODE=omxh264dec
  H264_ENCODE=omxh264enc

  OVERLAY='timeoverlay halignment=right valignment=top text="Elapsed: " shaded-background=true ! clockoverlay halignment=left valignment=top time-format="%Y/%m/%d %H:%M:%S" shaded-background=true'
fi

grep -q BCM270. /proc/cpuinfo >/dev/null 2>&1

if [ $? = 0 ]; then
  RASPIVID="raspivid --flush -hf -vf -n -t 0 -b $BIT_RATE -fps $FPS -w $WIDTH -h $HEIGHT -o -"
  CAMERA_SOURCE="fdsrc ! h264parse ! $H264_DECODE"
else
  RASPIVID="echo"
  CAMERA_SOURCE=autovideosrc
fi

$RASPIVID | gst-launch-1.0 $CAMERA_SOURCE ! \
  tee name=tee_local ! queue ! \
    videoscale !  videorate  ! videoconvert ! \
    video/x-raw,width=$WIDTH_L,height=$HEIGHT_L,framerate=$FPS_L ! \
    $H264_ENCODE ! \
    rtph264pay config-interval=5 pt=96 ! \
    udpsink host=$HOST_L port=$PORT_L sync=false async=true \
    tee_local. ! queue ! \
  tee name=tee_remote ! queue ! \
    videoscale !  videorate  ! videoconvert ! \
    video/x-raw,width=$WIDTH_R,height=$HEIGHT_R,framerate=$FPS_R ! \
    $OVERLAY ! \
    $H264_ENCODE ! \
    rtph264pay config-interval=5 pt=96 ! \
    udpsink host=$HOST_R port=$PORT_R sync=false async=true
