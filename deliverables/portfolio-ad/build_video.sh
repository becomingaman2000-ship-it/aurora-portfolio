#!/usr/bin/env bash
set -euo pipefail

FFMPEG="${FFMPEG:-node_modules/@ffmpeg-installer/linux-x64/ffmpeg}"
if [[ ! -x "$FFMPEG" ]]; then
  FFMPEG="$(command -v ffmpeg || true)"
fi
if [[ -z "$FFMPEG" ]]; then
  echo "ffmpeg is required to rebuild the advertisement." >&2
  exit 1
fi

OUT="deliverables/portfolio-ad"
SCREENS="$OUT/screens"
CARDS="$OUT/cards"

# Generate the original ambient music bed used under the narration.
python3 "$OUT/make_music.py"

"$FFMPEG" -y \
  -i "$CARDS/00-opening.jpg" \
  -i "$SCREENS/01-home-light.jpg" \
  -i "$SCREENS/02-about.jpg" \
  -i "$SCREENS/03-services.jpg" \
  -i "$SCREENS/04-services-grid.jpg" \
  -i "$SCREENS/05-projects.jpg" \
  -i "$SCREENS/06-makeke-overview.jpg" \
  -i "$SCREENS/07-makeke-screens.jpg" \
  -ss 9 -t 2.5 -i "src/assets/Makeke-pitch.mp4" \
  -i "$SCREENS/08-hit-campus-guide.jpg" \
  -i "$SCREENS/09-leadership.jpg" \
  -i "$SCREENS/12-home-neutral.jpg" \
  -i "$SCREENS/10-contact.jpg" \
  -i "$SCREENS/11-contact-filled-dark.jpg" \
  -i "$CARDS/13-outro.jpg" \
  -filter_complex "
    [0:v]scale=1920:1080,zoompan=z='min(zoom+0.00022,1.032)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=105:s=1920x1080:fps=30,fade=t=in:st=0:d=0.45,setsar=1[v0];
    [1:v]scale=1920:1080,zoompan=z='min(zoom+0.00032,1.044)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=135:s=1920x1080:fps=30,setsar=1[v1];
    [2:v]scale=1920:1080,zoompan=z='min(zoom+0.00030,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,setsar=1[v2];
    [3:v]scale=1920:1080,zoompan=z='min(zoom+0.00036,1.043)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,setsar=1[v3];
    [4:v]scale=1920:1080,zoompan=z='min(zoom+0.00030,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,setsar=1[v4];
    [5:v]scale=1920:1080,zoompan=z='min(zoom+0.00048,1.043)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=90:s=1920x1080:fps=30,setsar=1[v5];
    [6:v]scale=1920:1080,zoompan=z='min(zoom+0.00025,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,setsar=1[v6];
    [7:v]scale=1920:1080,zoompan=z='min(zoom+0.00033,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=135:s=1920x1080:fps=30,setsar=1[v7];
    [8:v]fps=30,scale=1920:1080:flags=lanczos,trim=duration=2.5,setpts=PTS-STARTPTS,setsar=1[v8];
    [9:v]scale=1920:1080,zoompan=z='min(zoom+0.00025,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,setsar=1[v9];
    [10:v]scale=1920:1080,zoompan=z='min(zoom+0.00030,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,setsar=1[v10];
    [11:v]scale=1920:1080,zoompan=z='min(zoom+0.00058,1.043)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=75:s=1920x1080:fps=30,setsar=1[v11];
    [12:v]scale=1920:1080,zoompan=z='min(zoom+0.00058,1.043)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=75:s=1920x1080:fps=30,setsar=1[v12];
    [13:v]scale=1920:1080,zoompan=z='min(zoom+0.00036,1.043)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,setsar=1[v13];
    [14:v]scale=1920:1080,zoompan=z='min(zoom+0.00042,1.026)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=60:s=1920x1080:fps=30,fade=t=out:st=1.6:d=0.4,setsar=1[v14];
    [v0][v1][v2][v3][v4][v5][v6][v7][v8][v9][v10][v11][v12][v13][v14]concat=n=15:v=1:a=0,format=yuv420p[outv]
  " \
  -map "[outv]" -an -c:v libx264 -preset faster -crf 19 -profile:v high -level 4.1 \
  -pix_fmt yuv420p -movflags +faststart "$OUT/portfolio-ad-visuals.mp4"

"$FFMPEG" -y \
  -i "$OUT/portfolio-ad-visuals.mp4" \
  -i "$OUT/narration.mp3" \
  -i "$OUT/music-bed.wav" \
  -filter_complex "
    [0:v]subtitles='$OUT/captions.srt':force_style='FontName=DejaVu Sans,FontSize=22,PrimaryColour=&H00FFFFFF,BorderStyle=3,Outline=0,Shadow=0,BackColour=&HA8000914,MarginV=34,Alignment=2'[video];
    [1:a]volume=1.0,highpass=f=85,pan=stereo|c0=c0|c1=c0[narration];
    [2:a]volume=0.42,lowpass=f=4200[music];
    [narration][music]amix=inputs=2:duration=longest:dropout_transition=2,volume=2.0,alimiter=limit=0.92:level=false[audio]
  " \
  -map "[video]" -map "[audio]" -t 60 \
  -c:v libx264 -preset medium -crf 18 -profile:v high -level 4.1 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
  -metadata title="Eustace Madawu — Portfolio Walkthrough" \
  -metadata comment="60-second website and user-flow advertisement" \
  "$OUT/eustace-madawu-portfolio-ad.mp4"

rm -f "$OUT/music-bed.wav" "$OUT/portfolio-ad-visuals.mp4"
printf 'Created %s\n' "$OUT/eustace-madawu-portfolio-ad.mp4"
