import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies rounded border and shadow classes', () => {
    render(<Card data-testid="card">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('rounded-xl')
    expect(card.className).toContain('border')
    expect(card.className).toContain('shadow-sm')
  })

  it('applies bg-white class', () => {
    render(<Card data-testid="card">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-white')
  })

  it('merges custom className', () => {
    render(<Card data-testid="card" className="extra-class">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('extra-class')
    expect(card.className).toContain('rounded-xl')
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Card ref={ref}>Content</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('applies base classes', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header.className).toContain('flex')
    expect(header.className).toContain('flex-col')
    expect(header.className).toContain('p-6')
  })

  it('merges custom className', () => {
    render(<CardHeader data-testid="header" className="my-header">Header</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header.className).toContain('my-header')
    expect(header.className).toContain('flex')
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<CardHeader ref={ref}>Header</CardHeader>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('CardTitle', () => {
  it('renders children', () => {
    render(<CardTitle>My Title</CardTitle>)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('applies base classes', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)
    const title = screen.getByTestId('title')
    expect(title.className).toContain('text-xl')
    expect(title.className).toContain('font-semibold')
    expect(title.className).toContain('tracking-tight')
  })

  it('merges custom className', () => {
    render(<CardTitle data-testid="title" className="custom-title">Title</CardTitle>)
    const title = screen.getByTestId('title')
    expect(title.className).toContain('custom-title')
    expect(title.className).toContain('font-semibold')
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<CardTitle ref={ref}>Title</CardTitle>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('CardDescription', () => {
  it('renders children', () => {
    render(<CardDescription>Some description</CardDescription>)
    expect(screen.getByText('Some description')).toBeInTheDocument()
  })

  it('applies base classes', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>)
    const desc = screen.getByTestId('desc')
    expect(desc.className).toContain('text-sm')
    expect(desc.className).toContain('text-gray-500')
  })

  it('merges custom className', () => {
    render(<CardDescription data-testid="desc" className="custom-desc">Desc</CardDescription>)
    const desc = screen.getByTestId('desc')
    expect(desc.className).toContain('custom-desc')
    expect(desc.className).toContain('text-sm')
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<CardDescription ref={ref}>Desc</CardDescription>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Main content</CardContent>)
    expect(screen.getByText('Main content')).toBeInTheDocument()
  })

  it('applies base classes', () => {
    render(<CardContent data-testid="content">Content</CardContent>)
    const content = screen.getByTestId('content')
    expect(content.className).toContain('p-6')
    expect(content.className).toContain('pt-0')
  })

  it('merges custom className', () => {
    render(<CardContent data-testid="content" className="custom-content">Content</CardContent>)
    const content = screen.getByTestId('content')
    expect(content.className).toContain('custom-content')
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<CardContent ref={ref}>Content</CardContent>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies base classes', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)
    const footer = screen.getByTestId('footer')
    expect(footer.className).toContain('flex')
    expect(footer.className).toContain('items-center')
    expect(footer.className).toContain('p-6')
    expect(footer.className).toContain('pt-0')
  })

  it('merges custom className', () => {
    render(<CardFooter data-testid="footer" className="custom-footer">Footer</CardFooter>)
    const footer = screen.getByTestId('footer')
    expect(footer.className).toContain('custom-footer')
    expect(footer.className).toContain('flex')
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<CardFooter ref={ref}>Footer</CardFooter>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
