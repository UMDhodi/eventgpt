const path = require('path')
const fs = require('fs')
const { spawnSync } = require('child_process')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path

const publicDir = path.resolve(__dirname, '../public')
const mediaDir = path.resolve(__dirname, '../public/media')

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true })
}

const clips = [
  { name: 'home', input: path.join(publicDir, 'home.mp4') },
  { name: 'concert', input: path.join(publicDir, 'concert.mp4') },
]

console.log('Using ffmpeg at:', ffmpegPath)

clips.forEach(({ name, input }) => {
  if (!fs.existsSync(input)) {
    console.warn(`Input not found: ${input}`)
    return
  }

  console.log(`\n--- Optimizing ${name}.mp4 ---`)

  // 1. Generate poster frame at 0.5s
  const posterOut = path.join(mediaDir, `${name}-poster.webp`)
  console.log(`Generating poster: ${posterOut}`)
  spawnSync(
    ffmpegPath,
    ['-ss', '00:00:00.500', '-i', input, '-vframes', '1', '-vf', 'scale=1280:-2', '-q:v', '75', '-y', posterOut],
    { stdio: 'inherit' }
  )

  // 2. Generate 720p H.264 mp4 (target < 1.5MB - 2MB)
  const mp4_720p = path.join(mediaDir, `${name}-720p.mp4`)
  console.log(`Generating 720p mp4: ${mp4_720p}`)
  spawnSync(
    ffmpegPath,
    [
      '-i', input,
      '-an',
      '-vf', 'scale=1280:-2,fps=24',
      '-c:v', 'libx264',
      '-crf', '28',
      '-preset', 'slow',
      '-profile:v', 'main',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-y', mp4_720p,
    ],
    { stdio: 'inherit' }
  )

  // 3. Generate 480p H.264 mp4 (for mobile < 768px and saveData)
  const mp4_480p = path.join(mediaDir, `${name}-480p.mp4`)
  console.log(`Generating 480p mp4: ${mp4_480p}`)
  spawnSync(
    ffmpegPath,
    [
      '-i', input,
      '-an',
      '-vf', 'scale=854:-2,fps=24',
      '-c:v', 'libx264',
      '-crf', '30',
      '-preset', 'slow',
      '-profile:v', 'main',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-y', mp4_480p,
    ],
    { stdio: 'inherit' }
  )

  // 4. Also copy/link standard out.mp4 for default reference
  const mp4_default = path.join(mediaDir, `${name}.mp4`)
  fs.copyFileSync(mp4_720p, mp4_default)
})

console.log('\nVideo optimization complete!')

