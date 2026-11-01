/**
 * Pure 3D Projected Space Ring Geometry Solver (Handbook Section 6.1 & Part B)
 *
 * u(θ) = f · R · sin(θ) / (c + R · cos(θ))
 * w(θ) = f · cardW / (c + R · cos(θ))
 *
 * Each card is positioned at (x, 0, z) with:
 * x = R · sin(θ)
 * z = -(c + R · cos(θ)) + c0
 * rotateY = -(θ · 180 / π)
 */

export interface CardPlacement {
  index: number
  theta: number        // angle in radians
  x: number            // 3D CSS x = R * sin(theta)
  z: number            // 3D CSS z = -(c + R * cos(theta)) + c0
  rotateY: number      // degrees, faces inward toward viewer
  u: number            // projected center X on screen in px
  w: number            // projected width on screen in px
  depth: number        // distance from camera (c + R * cos(theta))
  opacity: number      // depth brightness (0.7 to 1.0)
  visible: boolean     // within visible arc
  zIndex: number
}

// Projection helpers
export function depthAt(theta: number, R: number, c: number): number {
  return c + R * Math.cos(theta)
}

export function uAt(theta: number, R: number, c: number, f: number): number {
  const d = Math.max(depthAt(theta, R, c), 1)
  return (f * R * Math.sin(theta)) / d
}

export function wAt(theta: number, cardW: number, R: number, c: number, f: number): number {
  const d = Math.max(depthAt(theta, R, c), 1)
  return (f * cardW) / d
}

export function leftEdge(theta: number, cardW: number, R: number, c: number, f: number): number {
  return uAt(theta, R, c, f) - wAt(theta, cardW, R, c, f) / 2
}

export function rightEdge(theta: number, cardW: number, R: number, c: number, f: number): number {
  return uAt(theta, R, c, f) + wAt(theta, cardW, R, c, f) / 2
}

/**
 * Solve theta > prevTheta such that leftEdge(theta) == targetLeftEdge
 * via bisection.
 */
function solveThetaForLeftEdge(
  targetLeftEdge: number,
  prevTheta: number,
  cardW: number,
  R: number,
  c: number,
  f: number,
  maxTheta = Math.PI * 0.46
): number {
  let low = prevTheta
  let high = maxTheta
  for (let iter = 0; iter < 24; iter++) {
    const mid = (low + high) / 2
    const edge = leftEdge(mid, cardW, R, c, f)
    if (Math.abs(edge - targetLeftEdge) < 0.001) {
      return mid
    }
    if (edge < targetLeftEdge) {
      low = mid
    } else {
      high = mid
    }
  }
  return (low + high) / 2
}

/**
 * Solve theta < nextTheta such that rightEdge(theta) == targetRightEdge
 * via bisection.
 */
function solveThetaForRightEdge(
  targetRightEdge: number,
  nextTheta: number,
  cardW: number,
  R: number,
  c: number,
  f: number,
  minTheta = -Math.PI * 0.46
): number {
  let low = minTheta
  let high = nextTheta
  for (let iter = 0; iter < 24; iter++) {
    const mid = (low + high) / 2
    const edge = rightEdge(mid, cardW, R, c, f)
    if (Math.abs(edge - targetRightEdge) < 0.001) {
      return mid
    }
    if (edge < targetRightEdge) {
      low = mid
    } else {
      high = mid
    }
  }
  return (low + high) / 2
}

/**
 * Solve nominal step deltaTheta0 at center theta=0 such that:
 * leftEdge(deltaTheta0) == rightEdge(0) + gapPx
 */
export function solveCenterStep(
  cardW: number,
  gapPx: number,
  R: number,
  c: number,
  f: number
): number {
  const target = rightEdge(0, cardW, R, c, f) + gapPx
  return solveThetaForLeftEdge(target, 0, cardW, R, c, f)
}

/**
 * Pure function: solveAngles
 * Computes exact angles and 3D coordinates for n cards with even projected gaps.
 *
 * @param n Total items in gallery
 * @param R Ring radius (e.g. 900 desktop, 420 mobile)
 * @param c Camera distance (e.g. 200)
 * @param f Perspective focal distance (e.g. 1000)
 * @param cardW Card width (e.g. 300 desktop, 150 mobile)
 * @param gapPx Projected screen gap in pixels (e.g. 32)
 * @param rotation Continuous rotation offset in radians
 * @param maxArcRad Visible arc threshold (default +-65 degrees = 1.134 rad)
 */
export function solveAngles(
  n: number,
  R = 900,
  c = 200,
  f = 1000,
  cardW = 300,
  gapPx = 32,
  rotation = 0,
  maxArcRad = (65 * Math.PI) / 180
): CardPlacement[] {
  // Nominal angular step at center
  const deltaTheta0 = solveCenterStep(cardW, gapPx, R, c, f)
  const c0 = f // Camera plane offset so center card is at z = -(c+R) + f

  // Continuous position in card index units
  // Positive rotation moves cards to the right (theta increases)
  const floatIndex = rotation / deltaTheta0
  const nearestCenterStep = Math.round(floatIndex)
  const centerCardIdx = (((-nearestCenterStep) % n) + n) % n

  // Angle of the card nearest center
  const centerTheta = (floatIndex - nearestCenterStep) * deltaTheta0

  // Result array initialized with hidden defaults
  const result: CardPlacement[] = Array.from({ length: n }, (_, i) => ({
    index: i,
    theta: 0,
    x: 0,
    z: -2000,
    rotateY: 0,
    u: 0,
    w: cardW,
    depth: c + R,
    opacity: 0,
    visible: false,
    zIndex: 0,
  }))

  const maxCardsOutward = Math.min(Math.floor(n / 2), 7)

  // 1. Place the center card
  if (Math.abs(centerTheta) <= maxArcRad) {
    const depth = depthAt(centerTheta, R, c)
    const u = uAt(centerTheta, R, c, f)
    const w = wAt(centerTheta, cardW, R, c, f)
    // Brightness: edge cards 1.0, middle 0.9, never below 0.7
    const brightness = 0.9 + 0.1 * (Math.abs(centerTheta) / maxArcRad)

    result[centerCardIdx] = {
      index: centerCardIdx,
      theta: centerTheta,
      x: R * Math.sin(centerTheta),
      z: -(depth) + c0,
      rotateY: -((centerTheta * 180) / Math.PI),
      u,
      w,
      depth,
      opacity: brightness,
      visible: true,
      zIndex: 500,
    }
  }

  // 2. Step outward to the RIGHT (+theta)
  let prevTheta = centerTheta
  for (let step = 1; step <= maxCardsOutward; step++) {
    const cardIdx = (centerCardIdx + step) % n
    const targetLeft = rightEdge(prevTheta, cardW, R, c, f) + gapPx
    const theta = solveThetaForLeftEdge(targetLeft, prevTheta, cardW, R, c, f, maxArcRad + 0.1)

    if (theta > maxArcRad || theta <= prevTheta || isNaN(theta)) {
      break
    }

    const depth = depthAt(theta, R, c)
    const u = uAt(theta, R, c, f)
    const w = wAt(theta, cardW, R, c, f)
    const brightness = 0.9 + 0.1 * (Math.abs(theta) / maxArcRad)

    result[cardIdx] = {
      index: cardIdx,
      theta,
      x: R * Math.sin(theta),
      z: -(depth) + c0,
      rotateY: -((theta * 180) / Math.PI),
      u,
      w,
      depth,
      opacity: Math.min(brightness, 1.0),
      visible: true,
      zIndex: 500 - step * 10,
    }

    prevTheta = theta
  }

  // 3. Step outward to the LEFT (-theta)
  let nextTheta = centerTheta
  for (let step = 1; step <= maxCardsOutward; step++) {
    const cardIdx = (((centerCardIdx - step) % n) + n) % n
    const targetRight = leftEdge(nextTheta, cardW, R, c, f) - gapPx
    const theta = solveThetaForRightEdge(targetRight, nextTheta, cardW, R, c, f, -maxArcRad - 0.1)

    if (theta < -maxArcRad || theta >= nextTheta || isNaN(theta)) {
      break
    }

    const depth = depthAt(theta, R, c)
    const u = uAt(theta, R, c, f)
    const w = wAt(theta, cardW, R, c, f)
    const brightness = 0.9 + 0.1 * (Math.abs(theta) / maxArcRad)

    result[cardIdx] = {
      index: cardIdx,
      theta,
      x: R * Math.sin(theta),
      z: -(depth) + c0,
      rotateY: -((theta * 180) / Math.PI),
      u,
      w,
      depth,
      opacity: Math.min(brightness, 1.0),
      visible: true,
      zIndex: 500 - step * 10,
    }

    nextTheta = theta
  }

  return result
}
