#!/usr/bin/env bash
#
# Re-encode the two hero cards for mobile delivery, and cut a poster from each.
#
# The masters came off the editor at 5.6 Mbps (EN) and 8.4 Mbps (VI) for ten
# seconds of an almost-static 1080x1920 card — film-grade bitrates spent on
# footage that barely moves. CRF asks for a quality target instead of a
# bitrate, so the encoder spends only what the picture actually needs: the
# same card lands around 2 MB with no visible difference at arm's length.
#
# Deliberately NOT reducing the resolution. A phone reporting 393pt of width
# paints on ~1170 physical pixels, and the couple's own names are set into
# this footage — the last thing to soften. 1080x1920 stays.
#
#   ./scripts/encode-hero.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

encode() {
  local src=$1 out=$2

  # -crf 24        chosen by measurement, not by feel: against the master,
  #                crf 22/24/26 score SSIM 0.9918 / 0.9904 / 0.9888 at
  #                3.14 / 2.43 / 1.92 MB, and a 1080-wide crop of the "Dear"
  #                and wishes lines is indistinguishable across all three. 24
  #                takes 65% off the master while staying a hair from 22 on
  #                the one thing that matters — the type set into the footage.
  # -preset veryslow  encode time is free here (two ten-second clips, once)
  # -profile high / -level 4.0  the widest baseline that still allows CABAC
  # -pix_fmt yuv420p  Safari and QuickTime refuse 4:2:2 and 4:4:4
  # -an            the card is silent; the page's music is a separate track
  # -movflags +faststart  moov atom to the front, so playback can begin on the
  #                first bytes instead of after the whole file has landed —
  #                this one flag matters as much as the bitrate on mobile
  ffmpeg -y -loglevel error -i "$src" \
    -c:v libx264 -crf 24 -preset veryslow \
    -profile:v high -level:v 4.0 -pix_fmt yuv420p \
    -an -movflags +faststart \
    "$out"

  # Frame 0 as the poster, so the hero is the invitation from the first paint
  # rather than a black rectangle waiting on a buffer. JPEG rather than WebP:
  # `poster` takes a plain URL with no <source> negotiation behind it, so it
  # cannot fall back, and Homebrew's ffmpeg ships without libwebp anyway.
  ffmpeg -y -loglevel error -i "$src" -frames:v 1 -q:v 4 \
    "${out%.mp4}.jpg"
}

encode "public/hero final.mp4"      "public/assets/hero-en.mp4"
encode "public/hero final viet.mp4" "public/assets/hero-vi.mp4"

ls -la public/assets/hero-*
