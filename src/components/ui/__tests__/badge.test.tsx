import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge', () => {
  it('renders with children text', () => {
    render(<Badge>Status</Badge>)
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Badge data-testid="badge">Default</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('bg-emerald-100')
    expect(badge.className).toContain('text-emerald-800')
    expect(badge.className).toContain('border-transparent')
  })

  it('applies secondary variant classes', () => {
    render(<Badge data-testid="badge" variant="secondary">Secondary</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-800')
  })

  it('applies destructive variant classes', () => {
    render(<Badge data-testid="badge" variant="destructive">Error</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('bg-red-100')
    expect(badge.className).toContain('text-red-800')
  })

  it('applies warning variant classes', () => {
    render(<Badge data-testid="badge" variant="warning">Warning</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('bg-yellow-100')
    expect(badge.className).toContain('text-yellow-800')
  })

  it('applies outline variant classes', () => {
    render(<Badge data-testid="badge" variant="outline">Outline</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('text-gray-700')
    expect(badge.className).not.toContain('bg-emerald-100')
  })

  it('applies base classes for all variants', () => {
    render(<Badge data-testid="badge">Base</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('inline-flex')
    expect(badge.className).toContain('items-center')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('text-xs')
    expect(badge.className).toContain('font-semibold')
  })

  it('merges custom className', () => {
    render(<Badge data-testid="badge" className="my-badge">Custom</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('my-badge')
    expect(badge.className).toContain('inline-flex')
  })
})
