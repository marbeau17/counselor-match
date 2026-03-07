import { render, screen, fireEvent } from '@testing-library/react'
import { Avatar } from '../avatar'

describe('Avatar', () => {
  it('renders initials from alt text when no src is provided', () => {
    render(<Avatar alt="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders fallback text when provided', () => {
    render(<Avatar fallback="AB" alt="John Doe" />)
    expect(screen.getByText('AB')).toBeInTheDocument()
    expect(screen.queryByText('JD')).not.toBeInTheDocument()
  })

  it('renders question mark when no alt or fallback provided', () => {
    render(<Avatar />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders an image when src is provided', () => {
    render(<Avatar src="/photo.jpg" alt="John Doe" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/photo.jpg')
    expect(img).toHaveAttribute('alt', 'John Doe')
  })

  it('does not render initials when src is provided', () => {
    render(<Avatar src="/photo.jpg" alt="John Doe" />)
    expect(screen.queryByText('JD')).not.toBeInTheDocument()
  })

  it('falls back to initials on image error', () => {
    render(<Avatar src="/broken.jpg" alt="Jane Smith" />)
    const img = screen.getByRole('img')
    fireEvent.error(img)
    expect(screen.getByText('JS')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('applies size sm classes', () => {
    render(<Avatar size="sm" alt="Test" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar.className).toContain('h-8')
    expect(avatar.className).toContain('w-8')
    expect(avatar.className).toContain('text-xs')
  })

  it('applies size md classes (default)', () => {
    render(<Avatar alt="Test" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar.className).toContain('h-10')
    expect(avatar.className).toContain('w-10')
    expect(avatar.className).toContain('text-sm')
  })

  it('applies size lg classes', () => {
    render(<Avatar size="lg" alt="Test" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar.className).toContain('h-12')
    expect(avatar.className).toContain('w-12')
    expect(avatar.className).toContain('text-base')
  })

  it('applies size xl classes', () => {
    render(<Avatar size="xl" alt="Test" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar.className).toContain('h-16')
    expect(avatar.className).toContain('w-16')
    expect(avatar.className).toContain('text-lg')
  })

  it('applies base styling classes', () => {
    render(<Avatar alt="Test" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar.className).toContain('rounded-full')
    expect(avatar.className).toContain('inline-flex')
    expect(avatar.className).toContain('items-center')
    expect(avatar.className).toContain('justify-center')
    expect(avatar.className).toContain('bg-emerald-100')
  })

  it('merges custom className', () => {
    render(<Avatar alt="Test" data-testid="avatar" className="my-avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar.className).toContain('my-avatar')
    expect(avatar.className).toContain('rounded-full')
  })

  it('extracts initials from multi-word alt text', () => {
    render(<Avatar alt="Alice Bob Charlie" />)
    // Should take first letter of each word, then slice to 2 chars
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('handles single-word alt text', () => {
    render(<Avatar alt="Alice" />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
