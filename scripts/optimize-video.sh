#!/usr/bin/env bash
# Transcode every clip to optimized H.264 mp4 (CRF 28, 24fps, faststart, no audio) and posters
mkdir -p public/media

for clip in home concert; do
  echo "Transcoding ${clip}.mp4..."
  # Poster
  ffmpeg -ss 00:00:00.500 -i public/${clip}.mp4 -vframes 1 -vf "scale=1280:-2" -q:v 75 -y public/media/${clip}-poster.webp

  # 720p Desktop
  ffmpeg -i public/${clip}.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 28 -preset slow -profile:v main -pix_fmt yuv420p -movflags +faststart -y public/media/${clip}-720p.mp4

  # 480p Mobile
  ffmpeg -i public/${clip}.mp4 -an -vf "scale=854:-2,fps=24" -c:v libx264 -crf 30 -preset slow -profile:v main -pix_fmt yuv420p -movflags +faststart -y public/media/${clip}-480p.mp4

  cp public/media/${clip}-720p.mp4 public/media/${clip}.mp4
done

echo "Transcoding complete."

