#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/deliverables/portfolio-ad-v2"
SCENES="$OUT/scenes"
CLIPS="$OUT/clips"
FFMPEG="$ROOT/node_modules/@ffmpeg-installer/linux-x64/ffmpeg"
FPS=30

if [[ ! -x "$FFMPEG" ]]; then
  echo "Missing ffmpeg at $FFMPEG" >&2
  exit 1
fi

mkdir -p "$CLIPS"
rm -f "$CLIPS"/*.mp4 "$OUT/visuals-v2.mp4"

"$OUT/compose_scenes.sh"
python3 "$OUT/make_soundtrack.py"

encode_still() {
  local input="$1" output="$2" duration="$3" mode="${4:-wide}"
  local zoom
  if [[ "$mode" == "close" ]]; then
    zoom="if(eq(on,1),1.115,min(zoom+0.00065,1.235))"
  elif [[ "$mode" == "pull" ]]; then
    zoom="if(eq(on,1),1.085,max(1.0,zoom-0.00035))"
  else
    zoom="min(zoom+0.00030,1.095)"
  fi

  "$FFMPEG" -loglevel error -y -loop 1 -framerate "$FPS" -i "$input" \
    -vf "zoompan=z='$zoom':x='iw/2-(iw/zoom/2)+sin(on/54)*5':y='ih/2-(ih/zoom/2)+cos(on/71)*4':d=1:s=1920x1080:fps=$FPS,format=yuv420p" \
    -t "$duration" -an -c:v libx264 -preset fast -crf 18 -profile:v high -level 4.1 \
    -g 60 -keyint_min 60 -sc_threshold 0 -pix_fmt yuv420p "$output"
}

encode_makeke_motion() {
  local output="$1" duration="$2"
  "$FFMPEG" -loglevel error -y \
    -loop 1 -framerate "$FPS" -i "$SCENES/04-makeke.jpg" \
    -ss 0.35 -i "$ROOT/src/assets/Makeke-pitch.mp4" \
    -filter_complex "[0:v]zoompan=z='min(zoom+0.00035,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=$FPS[bg];[1:v]scale=990:557:force_original_aspect_ratio=increase,crop=990:557,pad=1018:585:14:14:color=0x071318,drawbox=x=12:y=12:w=994:h=561:color=0x58f1ff@0.65:t=2,fps=$FPS[product];[bg][product]overlay=92:220:shortest=1,format=yuv420p[out]" \
    -map '[out]' -t "$duration" -an -c:v libx264 -preset fast -crf 18 -profile:v high -level 4.1 \
    -g 60 -keyint_min 60 -sc_threshold 0 -pix_fmt yuv420p "$output"
}

printf 'Encoding cinematic scene movement...\n'
encode_still "$SCENES/00-opening.jpg"    "$CLIPS/00.mp4" 4.2 pull
encode_still "$SCENES/01-portrait.jpg"   "$CLIPS/01.mp4" 5.6 wide
encode_still "$SCENES/02-home.jpg"       "$CLIPS/02a.mp4" 3.5 wide
encode_still "$SCENES/02-home.jpg"       "$CLIPS/02b.mp4" 2.4 close
encode_still "$SCENES/03-services.jpg"   "$CLIPS/03a.mp4" 3.8 pull
encode_still "$SCENES/03-services.jpg"   "$CLIPS/03b.mp4" 2.3 close
encode_still "$SCENES/04-makeke.jpg"     "$CLIPS/04a.mp4" 4.0 wide
encode_makeke_motion                       "$CLIPS/04b.mp4" 2.6
encode_still "$SCENES/05-campus.jpg"     "$CLIPS/05a.mp4" 4.0 pull
encode_still "$SCENES/05-campus.jpg"     "$CLIPS/05b.mp4" 2.5 close
encode_still "$SCENES/06-leadership.jpg" "$CLIPS/06.mp4" 4.1 wide
encode_still "$SCENES/07-themes.jpg"     "$CLIPS/07.mp4" 3.0 close
encode_still "$SCENES/08-contact.jpg"    "$CLIPS/08a.mp4" 3.6 wide
encode_still "$SCENES/08-contact.jpg"    "$CLIPS/08b.mp4" 2.4 close
encode_still "$SCENES/09-outro.jpg"      "$CLIPS/09.mp4" 8.0 pull

cat > "$CLIPS/concat.txt" <<EOF
file '$CLIPS/00.mp4'
file '$CLIPS/01.mp4'
file '$CLIPS/02a.mp4'
file '$CLIPS/02b.mp4'
file '$CLIPS/03a.mp4'
file '$CLIPS/03b.mp4'
file '$CLIPS/04a.mp4'
file '$CLIPS/04b.mp4'
file '$CLIPS/05a.mp4'
file '$CLIPS/05b.mp4'
file '$CLIPS/06.mp4'
file '$CLIPS/07.mp4'
file '$CLIPS/08a.mp4'
file '$CLIPS/08b.mp4'
file '$CLIPS/09.mp4'
EOF

"$FFMPEG" -loglevel error -y -f concat -safe 0 -i "$CLIPS/concat.txt" -c copy "$OUT/visuals-v2.mp4"

printf 'Mixing narration, original score, and transition sound design...\n'
"$FFMPEG" -loglevel error -y \
  -i "$OUT/visuals-v2.mp4" \
  -i "$OUT/soundtrack-v2.wav" \
  -i "$OUT/narration-v2.mp3" \
  -filter_complex "[1:a]volume=0.92[music];[2:a]pan=stereo|c0=c0|c1=c0,adelay=1500|1500,volume=1.35[narration];[music][narration]amix=inputs=2:duration=first:dropout_transition=0,volume=1.5,alimiter=limit=0.94[audio]" \
  -map 0:v:0 -map '[audio]' -c:v copy -c:a aac -b:a 256k -ar 48000 \
  -t 56 -movflags +faststart \
  -metadata title='Eustace Madawu — Build What Comes Next' \
  -metadata comment='Cinematic portfolio advertisement' \
  "$OUT/eustace-madawu-cinematic-ad.mp4"

printf 'Built %s\n' "$OUT/eustace-madawu-cinematic-ad.mp4"
