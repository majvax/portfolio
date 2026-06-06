#!/usr/bin/env bash
# Generate the 1200x630 Open Graph banner: circular photo + title + subtitle.
# Requires ImageMagick (the `magick` command).

set -euo pipefail

# ---- Defaults ----
TITLE=""
SUBTITLE=""
PHOTO="public/photo.jpg"
OUTPUT="public/og.jpg"
BG="#f5f5f0"
TITLE_COLOR="#0a0a0a"
SUBTITLE_COLOR="#525252"
TITLE_SIZE="64"
SUBTITLE_SIZE="28"
TITLE_FONT="Adwaita-Sans-Bold"
SUBTITLE_FONT="Adwaita-Sans"
PHOTO_SIZE="420"
PHOTO_X="70"
TITLE_X="540"
TITLE_Y="260"
SUBTITLE_X="540"
SUBTITLE_Y="340"
QUALITY="85"

usage() {
    cat <<EOF
Generate a 1200x630 OG banner with a circular photo, title, and subtitle.

Usage: $(basename "$0") --title "Name" --subtitle "Tagline" [options]

Required:
  --title TEXT             Main heading text
  --subtitle TEXT          Tagline below the title

Optional:
  --photo PATH             Source photo                 (default: $PHOTO)
  --output PATH            Output JPEG                  (default: $OUTPUT)
  --bg COLOR               Background color             (default: $BG)
  --title-color COLOR      Title text color             (default: $TITLE_COLOR)
  --subtitle-color COLOR   Subtitle text color          (default: $SUBTITLE_COLOR)
  --title-size N           Title pointsize              (default: $TITLE_SIZE)
  --subtitle-size N        Subtitle pointsize           (default: $SUBTITLE_SIZE)
  --title-font NAME        Title font                   (default: $TITLE_FONT)
  --subtitle-font NAME     Subtitle font                (default: $SUBTITLE_FONT)
  --photo-size N           Circular photo diameter px   (default: $PHOTO_SIZE)
  --photo-x N              Photo x offset from left     (default: $PHOTO_X)
  --title-x N              Title x position             (default: $TITLE_X)
  --title-y N              Title y position             (default: $TITLE_Y)
  --subtitle-x N           Subtitle x position          (default: $SUBTITLE_X)
  --subtitle-y N           Subtitle y position          (default: $SUBTITLE_Y)
  --quality N              JPEG quality 1-100           (default: $QUALITY)
  -h, --help               Show this message

Tip: bold and regular fonts have different left side-bearings, so the title
and subtitle may not visually left-align even with the same x. To compensate,
nudge --subtitle-x a few px less than --title-x (e.g. 536 vs 540).

List available fonts:  magick -list font | grep -i sans

Example:
  $(basename "$0") --title "Jane Doe" --subtitle "Software Engineer" \\
      --bg "#0a0a0a" --title-color "#fafafa" --subtitle-color "#a3a3a3"
EOF
    exit "${1:-0}"
}

# ---- Parse args ----
while [[ $# -gt 0 ]]; do
    case $1 in
        --title)          TITLE="$2"; shift 2 ;;
        --subtitle)       SUBTITLE="$2"; shift 2 ;;
        --photo)          PHOTO="$2"; shift 2 ;;
        --output)         OUTPUT="$2"; shift 2 ;;
        --bg)             BG="$2"; shift 2 ;;
        --title-color)    TITLE_COLOR="$2"; shift 2 ;;
        --subtitle-color) SUBTITLE_COLOR="$2"; shift 2 ;;
        --title-size)     TITLE_SIZE="$2"; shift 2 ;;
        --subtitle-size)  SUBTITLE_SIZE="$2"; shift 2 ;;
        --title-font)     TITLE_FONT="$2"; shift 2 ;;
        --subtitle-font)  SUBTITLE_FONT="$2"; shift 2 ;;
        --photo-size)     PHOTO_SIZE="$2"; shift 2 ;;
        --photo-x)        PHOTO_X="$2"; shift 2 ;;
        --title-x)        TITLE_X="$2"; shift 2 ;;
        --title-y)        TITLE_Y="$2"; shift 2 ;;
        --subtitle-x)     SUBTITLE_X="$2"; shift 2 ;;
        --subtitle-y)     SUBTITLE_Y="$2"; shift 2 ;;
        --quality)        QUALITY="$2"; shift 2 ;;
        -h|--help)        usage 0 ;;
        *) echo "Unknown option: $1" >&2; usage 1 ;;
    esac
done

# ---- Validate ----
if [[ -z "$TITLE" || -z "$SUBTITLE" ]]; then
    echo "Error: --title and --subtitle are required." >&2
    usage 1
fi

if [[ ! -f "$PHOTO" ]]; then
    echo "Error: photo not found at $PHOTO" >&2
    exit 1
fi

if ! command -v magick >/dev/null 2>&1; then
    echo "Error: ImageMagick not installed (need the 'magick' command)." >&2
    exit 1
fi

# ---- Build ----
TMP_CIRCLE=$(mktemp --suffix=.png)
TMP_PNG=$(mktemp --suffix=.png)
trap 'rm -f "$TMP_CIRCLE" "$TMP_PNG"' EXIT

RADIUS=$((PHOTO_SIZE / 2))

echo "→ circular crop ${PHOTO_SIZE}x${PHOTO_SIZE} from $PHOTO"
magick "$PHOTO" \
    -resize "${PHOTO_SIZE}x${PHOTO_SIZE}^" -gravity center -extent "${PHOTO_SIZE}x${PHOTO_SIZE}" \
    \( -size "${PHOTO_SIZE}x${PHOTO_SIZE}" xc:none -fill white -draw "circle ${RADIUS},${RADIUS} ${RADIUS},0" \) \
    -alpha set -compose DstIn -composite \
    "$TMP_CIRCLE"

echo "→ compose 1200x630 banner"
magick -size 1200x630 "xc:$BG" \
    "$TMP_CIRCLE" -gravity west -geometry "+${PHOTO_X}+0" -composite \
    \( -background none -fill "$TITLE_COLOR" -font "$TITLE_FONT" -pointsize "$TITLE_SIZE" label:"$TITLE" -trim +repage \) \
    -gravity northwest -geometry "+${TITLE_X}+${TITLE_Y}" -composite \
    \( -background none -fill "$SUBTITLE_COLOR" -font "$SUBTITLE_FONT" -pointsize "$SUBTITLE_SIZE" label:"$SUBTITLE" -trim +repage \) \
    -gravity northwest -geometry "+${SUBTITLE_X}+${SUBTITLE_Y}" -composite \
    "$TMP_PNG"

echo "→ encode JPEG quality=$QUALITY"
magick "$TMP_PNG" -quality "$QUALITY" "$OUTPUT"

echo "✓ wrote $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
