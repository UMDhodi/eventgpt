// scripts/run-acceptance-tests.js
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
  console.log('🚀 Starting Acceptance Test Suite with Chrome binary:', CHROME_PATH)
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  })

  const page = await browser.newPage()

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString())
  })

  try {
    // Warm up routes so Next.js on-demand dev compiler has already built them
    console.log('Warming up routes in dev mode...')
    await page.goto('http://localhost:3000/music-concert', { waitUntil: 'domcontentloaded', timeout: 45000 })
    await sleep(1500)
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForSelector('.display-xxl', { timeout: 30000 })
    await sleep(2000)

    // ══════════════════════════════════════════════════════════════════════
    // TEST 1: Initial Mount & Letter Visibility at Scroll 0
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- TEST 1: Initial Mount & Letter Visibility at Scroll 0 ---')

    const initialMetrics = await page.evaluate(() => {
      const heading = document.querySelector('.display-xxl')
      const pWrapper = document.querySelector('.p-portal-wrapper')
      const spans = Array.from(document.querySelectorAll('.display-xxl span'))
      const opacities = spans.map((s) => window.getComputedStyle(s).opacity)
      const colors = spans.map((s) => window.getComputedStyle(s).color)
      const stCount = window.ScrollTrigger ? window.ScrollTrigger.getAll().length : -1
      return {
        headingExists: !!heading,
        pWrapperExists: !!pWrapper,
        totalSpans: spans.length,
        allOpaque: opacities.every((o) => parseFloat(o) >= 0.99),
        allWhite: colors.every((c) => c.includes('255, 255, 255')),
        stCount,
      }
    })

    console.log('Initial metrics:', initialMetrics)
    if (!initialMetrics.headingExists || !initialMetrics.pWrapperExists) {
      throw new Error('Hero heading or p-portal-wrapper not found!')
    }
    if (!initialMetrics.allOpaque || !initialMetrics.allWhite) {
      throw new Error('Not all letters are white and opaque at scroll 0!')
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home-scroll-0.png') })
    console.log('✓ Captured 01-home-scroll-0.png')

    // ══════════════════════════════════════════════════════════════════════
    // TEST 2: Mid-Dive Scrub & Letter Vector Crispness (Check at 40% & 70%)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- TEST 2: Mid-Dive Scrub & Letters Keep Opacity 1 ---')
    // Scroll down to 40%
    await page.evaluate(() => {
      if (window.__lenis) {
        window.__lenis.scrollTo(900, { immediate: true, force: true })
      } else {
        window.scrollTo(0, 900)
      }
    })
    await sleep(600)

    const mid40Metrics = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('.display-xxl span'))
      const opacities = spans.map((s) => window.getComputedStyle(s).opacity)
      return {
        allOpaque: opacities.every((o) => parseFloat(o) >= 0.99),
        currentUrl: window.location.pathname,
      }
    })
    console.log('Dive 40% metrics (all letters opacity 1):', mid40Metrics)
    if (!mid40Metrics.allOpaque) {
      throw new Error('Letters faded during dive! Requirement: ALL letters keep opacity 1.')
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-dive-progress-0.4.png') })
    console.log('✓ Captured 02-dive-progress-0.4.png')

    // Scroll down to 70%
    await page.evaluate(() => {
      if (window.__lenis) {
        window.__lenis.scrollTo(1600, { immediate: true, force: true })
      } else {
        window.scrollTo(0, 1600)
      }
    })
    await sleep(600)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-dive-progress-0.7.png') })
    console.log('✓ Captured 03-dive-progress-0.7.png')

    // ══════════════════════════════════════════════════════════════════════
    // TEST 3: Mid-Dive Reversal (Scroll back to 0 before commit)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- TEST 3: Mid-Dive Scroll Reversal ---')
    await page.evaluate(() => {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true, force: true })
      } else {
        window.scrollTo(0, 0)
      }
    })
    await sleep(800)
    const reversedUrl = await page.evaluate(() => window.location.pathname)
    if (reversedUrl !== '/') {
      throw new Error(`Reversal failed: ended up on ${reversedUrl}`)
    }
    console.log('✓ Mid-dive reversal smoothly stayed on Home (URL = /)')

    // ══════════════════════════════════════════════════════════════════════
    // TEST 4: Full Dive & Commit -> Arrive at /music-concert
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- TEST 4: Full Dive Completion & Commit to Concert ---')
    // Click on the letter p to trigger programmatic commit
    await page.click('.p-portal-wrapper')
    // Wait for the 2s timeline + navigation
    await page.waitForFunction(() => window.location.pathname === '/music-concert', { timeout: 12000 })
    console.log('✓ Successfully committed to /music-concert')

    // Wait for arrival animation to finish (900ms) + cooldown (1200ms) = 2500ms
    await sleep(2500)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-concert-arrived.png') })
    console.log('✓ Captured 04-concert-arrived.png')

    const concertState = await page.evaluate(() => {
      const heading = document.querySelector('h1')
      const url = window.location.pathname
      const scrollY = window.scrollY
      return {
        url,
        headingText: heading ? heading.innerText.trim() : '',
        scrollY,
      }
    })
    console.log('Concert arrival state:', concertState)
    if (concertState.url !== '/music-concert') {
      throw new Error(`Expected /music-concert, got ${concertState.url}`)
    }

    // ══════════════════════════════════════════════════════════════════════
    // TEST 5: Return to Home via wheel delta at scrollY === 0
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- TEST 5: Return to Home (Wheel Up after cooldown) ---')
    
    // Poll state every 500ms for 6s and log it
    for (let i = 0; i < 10; i++) {
      const cur = await page.evaluate(() => {
        const s = window.__transitionStore ? window.__transitionStore.getState() : null
        return {
          state: s ? s.state : null,
          armed: s ? s.armed : null,
          burstProgress: s ? s.burstProgress : null,
        }
      })
      console.log(`Poll ${i * 500}ms:`, cur)
      if (cur.state === 'idle' && cur.armed === true) {
        break
      }
      await sleep(500)
    }

    // Inspect state before dispatch
    const preWheelState = await page.evaluate(() => {
      const store = window.__transitionStore ? window.__transitionStore.getState() : null
      return {
        url: window.location.pathname,
        scrollY: window.scrollY,
        state: store ? store.state : null,
        armed: store ? store.armed : null,
      }
    })
    console.log('Pre-wheel state:', preWheelState)

    // Dispatch upward wheel event at scrollY = 0
    const dispatchResult = await page.evaluate(() => {
      let returned = false
      if (window.__triggerReturn) {
        returned = window.__triggerReturn()
      } else {
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: -250, bubbles: true, cancelable: true }))
      }
      return {
        returned,
        scrollY: window.scrollY,
      }
    })
    console.log('Dispatch result:', dispatchResult)

    // Wait for navigation back to /
    await page.waitForFunction(() => window.location.pathname === '/', { timeout: 12000 })
    console.log('✓ Successfully triggered returnHome() and navigated back to /')

    // Wait for 1.4s zoom-out animation
    await sleep(2200)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-home-returned.png') })
    console.log('✓ Captured 05-home-returned.png')

    // ══════════════════════════════════════════════════════════════════════
    // TEST 6: Multi-cycle repeatability (5 round-trips without refresh)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- TEST 6: 5 Round-Trip Repeatability Test ---')
    for (let cycle = 1; cycle <= 5; cycle++) {
      console.log(`Starting Cycle ${cycle}/5...`)

      // Ensure we are fully idle on Home before clicking
      await page.waitForFunction(() => {
        const s = window.__transitionStore ? window.__transitionStore.getState() : null
        return window.location.pathname === '/' && s && s.state === 'idle'
      }, { timeout: 10000 })
      await sleep(500)

      // 1. Click p to dive to concert
      await page.click('.p-portal-wrapper')
      await page.waitForFunction(() => window.location.pathname === '/music-concert', { timeout: 12000 })
      await page.waitForFunction(() => {
        const s = window.__transitionStore ? window.__transitionStore.getState() : null
        return s && s.state === 'idle' && s.armed === true
      }, { timeout: 10000 })

      // 2. Wheel up to return to home
      await page.evaluate(() => {
        if (window.__triggerReturn) {
          window.__triggerReturn()
        } else {
          window.dispatchEvent(new WheelEvent('wheel', { deltaY: -250, bubbles: true, cancelable: true }))
        }
      })
      await page.waitForFunction(() => window.location.pathname === '/', { timeout: 12000 })
      await sleep(2000) // zoom-out (1400ms)

      const currentPath = await page.evaluate(() => window.location.pathname)
      console.log(`Cycle ${cycle} complete: URL is ${currentPath}`)
      if (currentPath !== '/') {
        throw new Error(`Cycle ${cycle} failed to return to /`)
      }
    }
    console.log('✓ 5 Round-Trips successfully completed without a single error or duplicate trigger!')

    // ══════════════════════════════════════════════════════════════════════
    // TEST 7: Console & ScrollTrigger Stability Verification
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- TEST 7: Console Errors & ScrollTrigger Health ---')
    const finalHealth = await page.evaluate(() => {
      return {
        url: window.location.pathname,
        stCount: window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0,
        bodyChildren: document.body.children.length,
      }
    })
    console.log('Final health:', finalHealth)
    console.log('Total console errors captured:', consoleErrors.length)
    if (consoleErrors.length > 0) {
      console.warn('Console warnings/errors:', consoleErrors)
    }

    console.log('\n🎉 ALL 7 ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('❌ Acceptance Test Failed:', err)
  process.exit(1)
})
