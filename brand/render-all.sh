#!/bin/sh
# Every render of the Vibrolux identity, the loop video, then the posters and plates.
# Blender 3.4+ (Cycles on CPU; Eevee — on the GPU — for the exploded lines and the loop), ffmpeg, Node + Playwright.
#   sh brand/render-all.sh            stills and video side by side, then compose (≈ 2 h on a dual-core laptop)
#   sh brand/render-all.sh stills     the Cycles stills only, then compose
#   sh brand/render-all.sh video      the loop only, then compose
#   sh brand/render-all.sh compose    posters and plates from the renders already there
# 64 samples are enough: adaptive sampling plus the OpenImageDenoise pass clean these studio scenes.
set -e
cd "$(dirname "$0")/.."
B=${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}
run() { echo "· $*"; "$B" -b -y -P "$@" 2>&1 | grep -E "RENDERED|Error|Traceback" || true; }

stills() {
  for m in corindone sfere chips granulato; do run brand/blender/materia.py -- $m 1280 1600 64; done
  run brand/blender/ingranaggio.py -- pezzo 1280 1600 64
  run brand/blender/ingranaggio.py -- gear45 1280 1600 64
  run brand/blender/ingranaggio.py -- gear 1920 1080 64
  run brand/blender/vibratore.py -- beauty 1920 1080 64
  run brand/blender/vibratore.py -- beauty45 1280 1600 64
  run brand/blender/vibratore.py -- specs 1600 2000 1
  run brand/blender/materia.py -- microsfere 1200 1500 64
  run brand/blender/lavaggio.py -- acqua 1200 1500 64
  run brand/blender/lavaggio.py -- cesto 1280 1600 64
}

video() {
  rm -f brand/renders/loop/*.png
  run brand/blender/vibratore.py -- loop 1280 720 12
  mkdir -p public/assets/identity/video
  ffmpeg -y -v error -framerate 25 -i brand/renders/loop/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 28 -preset slow \
    -movflags +faststart -an public/assets/identity/video/vibratore-loop.mp4
  ffmpeg -y -v error -i brand/renders/loop/0001.png -q:v 3 public/assets/identity/video/vibratore-loop.jpg
}

case "$1" in
  compose) ;;
  stills) stills ;;
  video) video ;;
  *) video & stills; wait ;;
esac

node brand/compose/compose.mjs
