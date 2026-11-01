import {
  solveAngles,
  leftEdge,
  rightEdge,
  wAt,
  uAt,
} from '@/lib/projectedRing'

describe('Part B: 3D Ring Gallery Geometry (Projected Space Math & B3)', () => {
  it('solves card angles where projected screen gaps are equal within 0.5px at 3 rotations', () => {
    const n = 11
    const R = 900
    const c = 200
    const f = 1000
    const cardW = 300
    const targetGap = 32

    const rotations = [0, 0.12, -0.18]

    rotations.forEach((rot) => {
      const placements = solveAngles(n, R, c, f, cardW, targetGap, rot)
      const visible = placements.filter((p) => p.visible).sort((a, b) => a.u - b.u)

      expect(visible.length).toBeGreaterThanOrEqual(5)

      // Test gaps between every adjacent pair of visible cards on screen
      for (let i = 0; i < visible.length - 1; i++) {
        const cur = visible[i]
        const nxt = visible[i + 1]

        const curRight = rightEdge(cur.theta, cardW, R, c, f)
        const nxtLeft = leftEdge(nxt.theta, cardW, R, c, f)
        const gap = nxtLeft - curRight

        expect(Math.abs(gap - targetGap)).toBeLessThan(0.5)
      }
    })
  })

  it('verifies center card ~273px and edge cards larger and leaning in (B2 specification)', () => {
    const placements = solveAngles(11, 900, 200, 1000, 300, 32, 0)
    const centerCard = placements.find((p) => p.visible && Math.abs(p.theta) < 0.001)

    expect(centerCard).toBeDefined()
    // w(0) = f * cardW / (c + R) = 1000 * 300 / 1100 = 272.72px ~ 273px
    expect(centerCard!.w).toBeCloseTo(272.7, 0)

    // Check right-hand card
    const rightCards = placements.filter((p) => p.visible && p.theta > 0.05).sort((a, b) => a.theta - b.theta)
    expect(rightCards.length).toBeGreaterThan(0)
    const rightOuter = rightCards[rightCards.length - 1]

    // Edge cards are closer (smaller depth), projected wider, and lean inward (negative rotateY)
    expect(rightOuter.w).toBeGreaterThan(centerCard!.w)
    expect(rightOuter.rotateY).toBeLessThan(0)
  })

  it('guards against division by <= 0 and produces no NaN values', () => {
    const testCases = [
      solveAngles(7, 900, 200, 1000, 300, 32, 0),
      solveAngles(5, 420, 200, 1000, 150, 20, 0.5),
      solveAngles(9, 100, 0, 500, 100, 10, -1.0),
    ]

    testCases.forEach((placements) => {
      placements.forEach((p) => {
        expect(isNaN(p.x)).toBe(false)
        expect(isNaN(p.z)).toBe(false)
        expect(isNaN(p.u)).toBe(false)
        expect(isNaN(p.w)).toBe(false)
        expect(isNaN(p.rotateY)).toBe(false)
        expect(isNaN(p.depth)).toBe(false)
      })
    })
  })
})
