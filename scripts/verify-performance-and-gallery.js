// scripts/verify-performance-and-gallery.js
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-core')

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const SCREENSHOT_DIR = path.join(__dirname, '..', 'public', 'test-captures')
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function run() {
  console.log('🚀 Running Comprehensive Performance & Ring Gallery Verification...')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  })

  const page = await browser.newPage()

  try {
    // ══════════════════════════════════════════════════════════════════════
    // PART B VERIFICATION: 3D Ring Gallery at 1440x900 and 1920x1080
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- PART B: Testing 3D Ring Gallery at 1440x900 ---')
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/music-concert', { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(2000)

    // Scroll to Ring Gallery section
    await page.evaluate(() => {
      const gallery = document.querySelector('section[aria-label="3D Ring Gallery"]')
      if (gallery) {
        gallery.scrollIntoView({ behavior: 'instant' })
      }
    })
    await sleep(1000)

    // Capture rotation 0 screenshot
    const rot0Path = path.join(SCREENSHOT_DIR, 'gallery-1440-rot0.png')
    await page.screenshot({ path: rot0Path })
    console.log('✓ Captured 1440x900 gallery at rotation 0:', rot0Path)

    // Check heading visibility (B1: not under navbar)
    const headingMetrics = await page.evaluate(() => {
      const nav = document.querySelector('header, nav')
      const navBottom = nav ? nav.getBoundingClientRect().bottom : 0
      const heading = document.querySelector('section[aria-label="3D Ring Gallery"] h2')
      const headingTop = heading ? heading.getBoundingClientRect().top : 0

      // Card metrics
      const cards = Array.from(document.querySelectorAll('section[aria-label="3D Ring Gallery"] [role="option"]'))
      const visibleCards = cards.filter((c) => {
        const style = window.getComputedStyle(c)
        return style.display !== 'none' && parseFloat(style.opacity) > 0.05
      })

      const cardRects = visibleCards.map((c) => {
        const r = c.getBoundingClientRect()
        return {
          left: r.left,
          right: r.right,
          width: r.width,
          height: r.height,
          centerX: r.left + r.width / 2,
        }
      }).sort((a, b) => a.centerX - b.centerX)

      // Calculate gaps between visible cards
      const gaps = []
      for (let i = 0; i < cardRects.length - 1; i++) {
        gaps.push(cardRects[i + 1].left - cardRects[i].right)
      }

      return {
        navBottom,
        headingTop,
        isHeadingClear: headingTop > navBottom + 10,
        visibleCardCount: visibleCards.length,
        cardWidths: cardRects.map(c => Math.round(c.width)),
        gaps: gaps.map(g => Math.round(g * 10) / 10),
      }
    })

    console.log('1440x900 Heading & Card Metrics:', headingMetrics)
    if (!headingMetrics.isHeadingClear) {
      console.warn('⚠️ Warning: Heading is close to or under navbar!')
    }

    // Step rotation (click Next button)
    await page.evaluate(() => {
      const nextBtn = document.querySelector('button[aria-label="Next card in ring gallery"]')
      if (nextBtn) nextBtn.click()
    })
    await sleep(600)

    const rotStepPath = path.join(SCREENSHOT_DIR, 'gallery-1440-rot-step.png')
    await page.screenshot({ path: rotStepPath })
    console.log('✓ Captured 1440x900 gallery after rotation step:', rotStepPath)

    // Test mobile at 390x844
    console.log('\n--- PART B: Testing 3D Ring Gallery on Mobile (390x844) ---')
    await page.setViewport({ width: 390, height: 844, isMobile: true })
    await sleep(800)
    const mobilePath = path.join(SCREENSHOT_DIR, 'gallery-390-mobile.png')
    await page.screenshot({ path: mobilePath })
    console.log('✓ Captured 390x844 mobile gallery:', mobilePath)

    // ══════════════════════════════════════════════════════════════════════
    // PART A VERIFICATION: Frame Times & Freeze Budget During Dive
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- PART A: Measuring Transition Frame Budget & Long Tasks ---')
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(1500)

    // Enable Performance tracking in page
    await page.evaluate(() => {
      window.__frameTimes = []
      window.__longTasks = []
      let lastFrame = performance.now()

      function frameLoop(now) {
        const delta = now - lastFrame
        lastFrame = now
        window.__frameTimes.push(delta)
        requestAnimationFrame(frameLoop)
      }
      requestAnimationFrame(frameLoop)

      if ('PerformanceObserver' in window) {
        try {
          const obs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              window.__longTasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
              })
            }
          })
          obs.observe({ entryTypes: ['longtask'] })
        } catch (e) {
          // ignore
        }
      }
    })

    // Trigger Dive
    const diveStartTime = Date.now()
    await page.click('.p-portal-wrapper')

    // Wait for transition to /music-concert
    await page.waitForFunction(() => window.location.pathname === '/music-concert', { timeout: 15000 })
    const navTime = Date.now() - diveStartTime
    console.log(`✓ Navigated to /music-concert in ${navTime}ms`)

    // Wait for arrival animation to settle
    await sleep(1500)

    const perfMetrics = await page.evaluate(() => {
      const frames = window.__frameTimes || []
      // Skip initial 5 frames
      const diveFrames = frames.slice(5)
      diveFrames.sort((a, b) => a - b)

      const median = diveFrames[Math.floor(diveFrames.length / 2)] || 16.6
      const p95 = diveFrames[Math.floor(diveFrames.length * 0.95)] || 16.6
      const max = diveFrames[diveFrames.length - 1] || 16.6
      const framesOver50 = diveFrames.filter((f) => f > 50).length

      const scrollY = window.scrollY
      const stCount = window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0

      return {
        totalFramesRecorded: diveFrames.length,
        medianFrameTimeMs: Math.round(median * 10) / 10,
        p95FrameTimeMs: Math.round(p95 * 10) / 10,
        maxFrameTimeMs: Math.round(max * 10) / 10,
        framesOver50ms: framesOver50,
        scrollYOnArrival: scrollY,
        scrollTriggerCount: stCount,
        longTasksCount: (window.__longTasks || []).length,
      }
    })

    console.log('\n📊 Performance Measurement Results:')
    console.log(perfMetrics)

    // Save metrics to JSON for reporting
    fs.writeFileSync(
      path.join(__dirname, '..', 'perf-results.json'),
      JSON.stringify({ headingMetrics, perfMetrics }, null, 2)
    )

    console.log('\n🎉 Performance & Gallery Verification Complete!')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('❌ Verification Failed:', err)
  process.exit(1)
})

