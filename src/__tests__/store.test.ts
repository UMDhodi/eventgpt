// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock uuid
jest.mock('uuid', () => ({ v4: () => 'test-uuid-' + Math.random().toString(36).slice(2) }))

describe('Store', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.resetModules()
  })

  it('creates a wedding event with correct defaults', async () => {
    const { useStore } = await import('@/store')
    useStore.getState().createEvent('wedding', 'Test Wedding', '2027-06-15', 100, 50000)

    const state = useStore.getState()
    expect(state.activeEvent).not.toBeNull()
    expect(state.activeEvent?.type).toBe('wedding')
    expect(state.activeEvent?.title).toBe('Test Wedding')
    expect(state.activeEvent?.guestCount).toBe(100)
    expect(state.activeEvent?.totalBudget).toBe(50000)
  })

  it('creates a birthday event', async () => {
    const { useStore } = await import('@/store')
    useStore.getState().createEvent('birthday', 'Birthday Party', '2027-03-20', 50, 5000)

    const state = useStore.getState()
    expect(state.activeEvent?.type).toBe('birthday')
    expect(state.activeEvent?.budgetCategories.length).toBeGreaterThan(0)
    expect(state.activeEvent?.timeline.length).toBeGreaterThan(0)
  })

  it('creates a community event', async () => {
    const { useStore } = await import('@/store')
    useStore.getState().createEvent('community', 'Summer Festival', '2027-08-10', 500, 25000)

    const state = useStore.getState()
    expect(state.activeEvent?.type).toBe('community')
    expect(state.isOnboarding).toBe(false)
  })

  it('adds a budget category', async () => {
    const { useStore } = await import('@/store')
    useStore.getState().createEvent('wedding', 'Test Wedding', '2027-06-15', 100, 50000)

    const eventId = useStore.getState().activeEvent!.id
    const initialCount = useStore.getState().activeEvent!.budgetCategories.length

    useStore.getState().addBudgetCategory(eventId, {
      name: 'Photography', allocated: 5000, spent: 0, icon: '📸', color: '#7c3aed'
    })

    expect(useStore.getState().activeEvent!.budgetCategories.length).toBe(initialCount + 1)
  })

  it('toggles timeline item status', async () => {
    const { useStore } = await import('@/store')
    useStore.getState().createEvent('birthday', 'Test Party', '2027-06-15', 30, 3000)

    const eventId = useStore.getState().activeEvent!.id
    const firstTask = useStore.getState().activeEvent!.timeline[0]
    expect(firstTask.status).toBe('pending')

    useStore.getState().toggleTimelineStatus(eventId, firstTask.id)
    expect(useStore.getState().activeEvent!.timeline[0].status).toBe('completed')

    useStore.getState().toggleTimelineStatus(eventId, firstTask.id)
    expect(useStore.getState().activeEvent!.timeline[0].status).toBe('pending')
  })

  it('adds and deletes guests', async () => {
    const { useStore } = await import('@/store')
    useStore.getState().createEvent('wedding', 'Test Wedding', '2027-06-15', 100, 50000)

    const eventId = useStore.getState().activeEvent!.id

    useStore.getState().addGuest(eventId, {
      name: 'Jane Doe', email: 'jane@test.com', phone: '', rsvpStatus: 'confirmed',
      plusOne: false, dietaryRestrictions: '', tableNumber: 1
    })

    expect(useStore.getState().activeEvent!.guests.length).toBe(1)
    const guestId = useStore.getState().activeEvent!.guests[0].id

    useStore.getState().deleteGuest(eventId, guestId)
    expect(useStore.getState().activeEvent!.guests.length).toBe(0)
  })

  it('adds and manages vendors', async () => {
    const { useStore } = await import('@/store')
    useStore.getState().createEvent('wedding', 'Test Wedding', '2027-06-15', 100, 50000)

    const eventId = useStore.getState().activeEvent!.id

    useStore.getState().addVendor(eventId, {
      category: 'Photography', name: 'Best Photos', contact: 'photo@test.com',
      price: 3000, status: 'contacted', notes: 'Package A', rating: 5
    })

    expect(useStore.getState().activeEvent!.vendors.length).toBe(1)
    expect(useStore.getState().activeEvent!.vendors[0].status).toBe('contacted')

    const vendorId = useStore.getState().activeEvent!.vendors[0].id
    useStore.getState().updateVendor(eventId, vendorId, { status: 'booked' })

    expect(useStore.getState().activeEvent!.vendors[0].status).toBe('booked')
  })
})
