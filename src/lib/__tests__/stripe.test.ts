class MockStripe {
  customers = {}
  paymentIntents = {}
}

const mockStripeConstructor = vi.fn(function (this: MockStripe) {
  Object.assign(this, new MockStripe())
} as unknown as (...args: unknown[]) => void)

vi.mock('stripe', () => {
  return {
    default: mockStripeConstructor,
  }
})

describe('getStripe()', () => {
  const MOCK_STRIPE_KEY = 'sk_test_mock_key_123'

  beforeEach(() => {
    vi.resetModules()
    mockStripeConstructor.mockClear()
    process.env.STRIPE_SECRET_KEY = MOCK_STRIPE_KEY
  })

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY
  })

  it('returns a Stripe instance', async () => {
    const { getStripe } = await import('../stripe')
    const stripe = getStripe()
    expect(stripe).toBeDefined()
    expect(stripe).toHaveProperty('customers')
    expect(stripe).toHaveProperty('paymentIntents')
  })

  it('constructs Stripe with the correct secret key and options', async () => {
    const { getStripe } = await import('../stripe')
    getStripe()
    expect(mockStripeConstructor).toHaveBeenCalledWith(MOCK_STRIPE_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  })

  it('returns the same instance on multiple calls (singleton)', async () => {
    const { getStripe } = await import('../stripe')
    const first = getStripe()
    const second = getStripe()
    expect(first).toBe(second)
    expect(mockStripeConstructor).toHaveBeenCalledTimes(1)
  })

  it('creates a new instance after module re-import', async () => {
    const mod1 = await import('../stripe')
    mod1.getStripe()
    expect(mockStripeConstructor).toHaveBeenCalledTimes(1)

    vi.resetModules()

    // Re-mock after resetModules since reset clears the mock registry
    vi.doMock('stripe', () => ({
      default: mockStripeConstructor,
    }))

    const mod2 = await import('../stripe')
    mod2.getStripe()
    expect(mockStripeConstructor).toHaveBeenCalledTimes(2)
  })
})
