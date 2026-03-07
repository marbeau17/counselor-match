import { cn, formatPrice, formatDate } from '../utils'

describe('cn()', () => {
  it('merges multiple class strings', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conflicting tailwind classes by keeping the last one', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('handles conflicting text color classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles conflicting padding/margin classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('m-4', 'm-2')).toBe('m-2')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  it('handles undefined and null inputs', () => {
    expect(cn(undefined, 'px-4')).toBe('px-4')
    expect(cn(null, 'px-4')).toBe('px-4')
    expect(cn(undefined, null)).toBe('')
  })

  it('handles boolean conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible')
  })

  it('handles array inputs', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2')
  })

  it('handles object inputs for conditional classes', () => {
    expect(cn({ 'px-4': true, 'py-2': false })).toBe('px-4')
  })
})

describe('formatPrice()', () => {
  it('formats JPY correctly with yen symbol', () => {
    const result = formatPrice(5000)
    expect(result).toBe('\uFFE55,000')
  })

  it('formats JPY as default currency', () => {
    const result = formatPrice(5000, 'JPY')
    expect(result).toBe('\uFFE55,000')
  })

  it('handles 0', () => {
    const result = formatPrice(0)
    expect(result).toBe('\uFFE50')
  })

  it('handles large numbers with thousands separators', () => {
    const result = formatPrice(1000000)
    expect(result).toBe('\uFFE51,000,000')
  })

  it('handles small numbers', () => {
    const result = formatPrice(1)
    expect(result).toBe('\uFFE51')
  })

  it('formats USD when specified', () => {
    const result = formatPrice(5000, 'USD')
    expect(result).toContain('5,000')
    expect(result).toMatch(/\$/)
  })

  it('handles negative amounts', () => {
    const result = formatPrice(-5000)
    expect(result).toContain('5,000')
  })
})

describe('formatDate()', () => {
  it('formats a Date object in Japanese locale', () => {
    const date = new Date('2024-03-15T00:00:00')
    const result = formatDate(date)
    expect(result).toContain('2024')
    expect(result).toMatch(/3/)
    expect(result).toMatch(/15/)
  })

  it('formats a string date in Japanese locale', () => {
    const result = formatDate('2024-01-01')
    expect(result).toContain('2024')
    expect(result).toMatch(/1/)
  })

  it('uses ja-JP locale by default', () => {
    const result = formatDate('2024-03-15')
    // Japanese date format uses \u5E74 (year), \u6708 (month), \u65E5 (day) characters
    expect(result).toContain('\u5E74')
    expect(result).toContain('\u6708')
    expect(result).toContain('\u65E5')
  })

  it('accepts a custom locale', () => {
    const result = formatDate('2024-03-15', 'en-US')
    // en-US format: "March 15, 2024"
    expect(result).toContain('March')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('handles ISO date strings', () => {
    const result = formatDate('2024-12-25T10:30:00Z')
    expect(result).toContain('2024')
    expect(result).toMatch(/12/)
  })

  it('handles Date input and string input consistently for the same date', () => {
    const dateStr = '2024-06-15T00:00:00'
    const dateObj = new Date(dateStr)
    expect(formatDate(dateStr)).toBe(formatDate(dateObj))
  })
})
