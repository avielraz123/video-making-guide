#!/usr/bin/env bash
# Ken Burns slideshow: 4 still images -> slow zoom/pan on each -> crossfades -> MP4.
# Uses nothing but ffmpeg (the images come from gen_images.py).
#
# Run:  bash slideshow.sh          -> out/ffmpeg-slideshow.mp4
set -e
cd "$(dirname "$0")"
mkdir -p out

SLIDE=4      # seconds each image is on screen
FADE=1       # crossfade length in seconds
FPS=30
D=$((SLIDE * FPS))   # frames per slide for zoompan

# zoompan tips:
#  - upscale first (scale=3840:-1) so the slow zoom doesn't jitter
#  - 'on' = output frame number, 'zoom' = current zoom, iw/ih = input size
#  - x/y pick the top-left corner of the visible window
ZOOM_IN="scale=3840:-1,zoompan=z='1+0.18*on/$D':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=$D:s=1280x720:fps=$FPS"
ZOOM_OUT="scale=3840:-1,zoompan=z='1.18-0.18*on/$D':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=$D:s=1280x720:fps=$FPS"
PAN_RIGHT="scale=3840:-1,zoompan=z=1.2:x='(iw-iw/zoom)*on/$D':y='ih/2-ih/zoom/2':d=$D:s=1280x720:fps=$FPS"
PAN_UP="scale=3840:-1,zoompan=z=1.2:x='iw/2-iw/zoom/2':y='(ih-ih/zoom)*(1-on/$D)':d=$D:s=1280x720:fps=$FPS"

# xfade 'offset' = when the fade starts on the combined timeline:
#   1st fade at SLIDE-FADE, then every (SLIDE-FADE) seconds after that.
O1=$((SLIDE - FADE)); O2=$((O1 + SLIDE - FADE)); O3=$((O2 + SLIDE - FADE))
TOTAL=$((O3 + SLIDE))

ffmpeg -y -v error \
  -i media/slide1.png -i media/slide2.png -i media/slide3.png -i media/slide4.png \
  -filter_complex "
    [0]$ZOOM_IN[a]; [1]$PAN_RIGHT[b]; [2]$ZOOM_OUT[c]; [3]$PAN_UP[d];
    [a][b]xfade=transition=fade:duration=$FADE:offset=$O1[ab];
    [ab][c]xfade=transition=smoothleft:duration=$FADE:offset=$O2[abc];
    [abc][d]xfade=transition=fade:duration=$FADE:offset=$O3[v0];
    [v0]fade=t=in:d=0.5,fade=t=out:st=$((TOTAL - 1)):d=1,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset slow -crf 23 -movflags +faststart \
  out/ffmpeg-slideshow.mp4

echo "done: out/ffmpeg-slideshow.mp4 ($TOTAL s)"
