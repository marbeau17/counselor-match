import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Input } from '../input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('accepts and displays a placeholder', () => {
    render(<Input placeholder="Enter text..." />)
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
  })

  it('accepts value and fires onChange', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'hello')
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('hello')
  })

  it('applies disabled state', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('applies disabled styling classes', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('disabled:cursor-not-allowed')
    expect(input.className).toContain('disabled:opacity-50')
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('renders with the correct type', () => {
    render(<Input type="email" data-testid="email-input" />)
    const input = screen.getByTestId('email-input')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('applies base styling classes', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('flex')
    expect(input.className).toContain('h-10')
    expect(input.className).toContain('w-full')
    expect(input.className).toContain('rounded-md')
    expect(input.className).toContain('border')
  })

  it('merges custom className', () => {
    render(<Input className="my-input" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('my-input')
    expect(input.className).toContain('flex')
  })
})
