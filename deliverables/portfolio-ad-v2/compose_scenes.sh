#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/deliverables/portfolio-ad-v2"
GEN="$OUT/generated"
CAP="$ROOT/deliverables/portfolio-ad/screens"
PHOTOS="$ROOT/src/assets/Eustace_Madawu_Photos"
SCENES="$OUT/scenes"
PANELS="$OUT/panels"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

mkdir -p "$SCENES" "$PANELS"

bg() {
  convert "$1" -resize '1920x1080^' -gravity center -extent 1920x1080 \
    -fill '#02070a44' -colorize 16 "$2"
}

panel() {
  local src="$1" out="$2" size="$3"
  convert "$src" -resize "${size}^" -gravity center -extent "$size" \
    -bordercolor '#071318' -border 12x12 \
    -bordercolor '#58f1ff88' -border 2x2 "$out"
}

label() {
  local input="$1" output="$2" text="$3" x="$4" y="$5" point="$6" gravity="${7:-NorthWest}"
  convert "$input" -gravity "$gravity" -font "$BOLD" -pointsize "$point" -kerning 4 \
    -fill '#f3fbfc' -stroke '#04101388' -strokewidth 2 -annotate "+${x}+${y}" "$text" "$output"
}

# Source panels: real portfolio UI and real portrait photography.
panel "$CAP/01-home-light.jpg" "$PANELS/home.png" '1230x692'
panel "$CAP/04-services-grid.jpg" "$PANELS/services.png" '1270x714'
panel "$CAP/06-makeke-overview.jpg" "$PANELS/makeke-main.png" '990x557'
panel "$CAP/07-makeke-screens.jpg" "$PANELS/makeke-detail.png" '600x338'
panel "$CAP/08-hit-campus-guide.jpg" "$PANELS/campus-main.png" '1050x591'
panel "$CAP/08-hit-campus-guide.jpg" "$PANELS/campus-detail.png" '600x338'
panel "$CAP/09-leadership.jpg" "$PANELS/leadership-ui.png" '980x551'
panel "$CAP/01-home-light.jpg" "$PANELS/theme-dark.png" '650x366'
panel "$CAP/12-home-neutral.jpg" "$PANELS/theme-neutral.png" '650x366'
panel "$CAP/01-home-light.jpg" "$PANELS/theme-light.png" '650x366'
panel "$CAP/11-contact-filled-dark.jpg" "$PANELS/contact.png" '1010x568'

convert "$PHOTOS/123375.jpg" -resize '620x880^' -gravity center -extent 620x880 \
  -bordercolor '#071318' -border 12x12 -bordercolor '#58f1ff88' -border 2x2 "$PANELS/portrait.png"

# 00 — high-contrast, declarative opening.
bg "$GEN/06-cyan-horizon.jpg" "$SCENES/00-base.jpg"
convert "$SCENES/00-base.jpg" \
  -fill '#02080acc' -draw 'rectangle 0,0 1920,1080' \
  -gravity center -font "$BOLD" -pointsize 102 -kerning 9 -fill '#f5fdff' \
  -annotate '+0-68' 'DON’T JUST SAY IT.' \
  -fill '#63efff' -annotate '+0+70' 'SHOW IT.' \
  -font "$FONT" -pointsize 22 -kerning 8 -fill '#afc5c9' -annotate '+0+196' 'A DIGITAL PRODUCT STORY' \
  "$SCENES/00-opening.jpg"

# 01 — hero portrait inside an obsidian studio.
bg "$GEN/01-obsidian-studio.jpg" "$SCENES/01-base.jpg"
convert "$SCENES/01-base.jpg" \
  -fill '#020608aa' -draw 'rectangle 0,0 850,1080' \
  "$PANELS/portrait.png" -geometry '+1135+95' -composite \
  -gravity northwest -font "$FONT" -pointsize 22 -kerning 8 -fill '#62efff' -annotate '+110+195' 'MEET' \
  -font "$BOLD" -pointsize 104 -kerning 2 -fill '#f5fbfc' -annotate '+100+255' 'EUSTACE' \
  -annotate '+100+370' 'MADAWU' \
  -font "$FONT" -pointsize 25 -kerning 4 -fill '#b8c9cc' -annotate '+110+570' 'SOFTWARE  ·  PRODUCTS  ·  PEOPLE' \
  -fill '#62efff' -draw 'roundrectangle 110,653 416,709 28,28' \
  -font "$BOLD" -pointsize 21 -kerning 3 -fill '#031012' -annotate '+142+665' 'HARARE, ZIMBABWE' \
  "$SCENES/01-portrait.jpg"

# 02 — floating real homepage in the glass data tunnel.
bg "$GEN/02-data-tunnel.jpg" "$SCENES/02-base.jpg"
convert "$SCENES/02-base.jpg" \
  -fill '#00080b66' -draw 'rectangle 0,0 1920,1080' \
  -fill '#5defff1f' -draw 'roundrectangle 282,165 1658,946 36,36' \
  "$PANELS/home.png" -geometry '+333+180' -composite \
  -gravity northwest -font "$BOLD" -pointsize 36 -kerning 5 -fill '#f4fdff' -annotate '+110+82' 'BUILT LIKE A PRODUCT.' \
  -font "$FONT" -pointsize 17 -kerning 5 -fill '#67efff' -annotate '+1432+100' '01  /  EXPERIENCE' \
  "$SCENES/02-home.jpg"

# 03 — capabilities, direct and dimensional.
bg "$GEN/02-data-tunnel.jpg" "$SCENES/03-base.jpg"
convert "$SCENES/03-base.jpg" -modulate 75,90,105 \
  -fill '#02080aa8' -draw 'rectangle 0,0 1920,1080' \
  "$PANELS/services.png" -geometry '+325+205' -composite \
  -gravity northwest -font "$FONT" -pointsize 18 -kerning 6 -fill '#65efff' -annotate '+112+92' 'FULL-STACK ENGINEERING  /  PRODUCT  /  DATA  /  AUTOMATION' \
  -font "$BOLD" -pointsize 70 -kerning 3 -fill '#f4fbfc' -annotate '+102+125' 'DEPTH, BY DESIGN.' \
  "$SCENES/03-services.jpg"

# 04 — Makeke product world.
bg "$GEN/03-makeke-world.jpg" "$SCENES/04-base.jpg"
convert "$SCENES/04-base.jpg" \
  -fill '#0207088c' -draw 'rectangle 0,0 1920,1080' \
  -fill '#f1b76026' -draw 'roundrectangle 68,190 1138,824 32,32' \
  "$PANELS/makeke-main.png" -geometry '+92+220' -composite \
  "$PANELS/makeke-detail.png" -geometry '+1205+638' -composite \
  -gravity northwest -font "$FONT" -pointsize 18 -kerning 6 -fill '#ffc76e' -annotate '+1234+218' 'MAKEKE' \
  -font "$BOLD" -pointsize 66 -kerning 2 -fill '#fffaf3' -annotate '+1220+270' 'ONE' \
  -annotate '+1220+345' 'CONNECTED' \
  -annotate '+1220+420' 'MARKETPLACE.' \
  -font "$FONT" -pointsize 18 -kerning 3 -fill '#ddcbb4' -annotate '+1224+532' 'BAKERS  ·  SUPPLIERS  ·  DELIVERY' \
  "$SCENES/04-makeke.jpg"

# 05 — Campus Guide in an imagined spatial interface.
bg "$GEN/04-campus-world.jpg" "$SCENES/05-base.jpg"
convert "$SCENES/05-base.jpg" \
  -fill '#01070a99' -draw 'rectangle 0,0 1920,1080' \
  "$PANELS/campus-main.png" -geometry '+110+270' -composite \
  "$PANELS/campus-detail.png" -geometry '+1240+542' -composite \
  -gravity northwest -font "$FONT" -pointsize 18 -kerning 6 -fill '#66efff' -annotate '+118+115' 'HIT CAMPUS GUIDE' \
  -font "$BOLD" -pointsize 66 -kerning 2 -fill '#f3fdff' -annotate '+106+156' 'EVERY DESTINATION.' \
  -fill '#66efff' -annotate '+106+228' 'WITHIN REACH.' \
  "$SCENES/05-campus.jpg"

# 06 — people-first leadership.
bg "$GEN/05-leadership-stage.jpg" "$SCENES/06-base.jpg"
convert "$PHOTOS/123383.jpg" -resize '520x760^' -gravity center -extent 520x760 \
  -bordercolor '#071318' -border 10x10 -bordercolor '#67efff77' -border 2x2 "$PANELS/leadership-portrait.png"
convert "$SCENES/06-base.jpg" \
  -fill '#010609a1' -draw 'rectangle 0,0 1920,1080' \
  "$PANELS/leadership-ui.png" -geometry '+830+312' -composite \
  "$PANELS/leadership-portrait.png" -geometry '+1188+102' -composite \
  -gravity northwest -font "$FONT" -pointsize 18 -kerning 6 -fill '#65efff' -annotate '+112+214' 'LEADERSHIP' \
  -font "$BOLD" -pointsize 76 -kerning 2 -fill '#f5fdff' -annotate '+100+260' 'PEOPLE' \
  -annotate '+100+346' 'AT THE' \
  -fill '#65efff' -annotate '+100+432' 'CENTRE.' \
  -font "$FONT" -pointsize 23 -kerning 3 -fill '#b8c9cc' -annotate '+110+582' 'PROGRAMMES. COMMUNITY. RESPONSIBILITY.' \
  "$SCENES/06-leadership.jpg"

# 07 — theme system as layered, physical screens.
bg "$GEN/01-obsidian-studio.jpg" "$SCENES/07-base.jpg"
convert "$PANELS/theme-light.png" -background none -rotate -5 "$PANELS/theme-light-angle.png"
convert "$PANELS/theme-dark.png" -background none -rotate 5 "$PANELS/theme-dark-angle.png"
convert "$SCENES/07-base.jpg" \
  -fill '#010609b5' -draw 'rectangle 0,0 1920,1080' \
  "$PANELS/theme-light-angle.png" -geometry '+64+390' -composite \
  "$PANELS/theme-neutral.png" -geometry '+632+340' -composite \
  "$PANELS/theme-dark-angle.png" -geometry '+1190+388' -composite \
  -gravity center -font "$FONT" -pointsize 18 -kerning 7 -fill '#61efff' -annotate '+0-420' 'THEME SYSTEM' \
  -font "$BOLD" -pointsize 72 -kerning 3 -fill '#f5fdff' -annotate '+0-350' 'ONE EXPERIENCE. THREE MOODS.' \
  "$SCENES/07-themes.jpg"

# 08 — contact flow and final interaction.
bg "$GEN/06-cyan-horizon.jpg" "$SCENES/08-base.jpg"
convert "$SCENES/08-base.jpg" \
  -fill '#01070999' -draw 'rectangle 0,0 1920,1080' \
  "$PANELS/contact.png" -geometry '+780+250' -composite \
  -gravity northwest -font "$FONT" -pointsize 18 -kerning 6 -fill '#65efff' -annotate '+110+240' 'CONTACT' \
  -font "$BOLD" -pointsize 72 -kerning 2 -fill '#f4fdff' -annotate '+98+287' 'FROM HELLO' \
  -annotate '+98+369' 'TO SEND' \
  -fill '#65efff' -annotate '+98+451' 'IN SECONDS.' \
  -font "$FONT" -pointsize 20 -kerning 4 -fill '#b7c9cc' -annotate '+108+612' 'CLEAR. DIRECT. HUMAN.' \
  "$SCENES/08-contact.jpg"

# 09 — premium end card.
bg "$GEN/06-cyan-horizon.jpg" "$SCENES/09-base.jpg"
convert "$SCENES/09-base.jpg" \
  -fill '#010708b8' -draw 'rectangle 0,0 1920,1080' \
  -gravity center -font "$FONT" -pointsize 18 -kerning 10 -fill '#62efff' -annotate '+0-190' 'ENGINEER  ·  BUILDER  ·  LEADER' \
  -font "$BOLD" -pointsize 106 -kerning 2 -fill '#f5fdff' -annotate '+0-65' 'EUSTACE MADAWU' \
  -font "$BOLD" -pointsize 42 -kerning 7 -fill '#62efff' -annotate '+0+66' 'BUILD WHAT COMES NEXT.' \
  -font "$FONT" -pointsize 23 -kerning 4 -fill '#c0d1d3' -annotate '+0+180' 'EUSTACEMADAWU1@GMAIL.COM' \
  -stroke '#62efff' -strokewidth 3 -fill none -draw 'roundrectangle 740,789 1180,865 38,38' \
  -stroke none -font "$BOLD" -pointsize 20 -kerning 5 -fill '#f3fdff' -annotate '+0+290' 'START A CONVERSATION' \
  "$SCENES/09-outro.jpg"

rm -f "$SCENES"/*-base.jpg
printf 'Composed %s cinematic scene frames.\n' "$(find "$SCENES" -maxdepth 1 -name '*.jpg' | wc -l)"
