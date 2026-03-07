import { render, screen } from '@testing-library/react'
import { Footer } from '../footer'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Heart: (props: any) => <svg data-testid="heart-icon" {...props} />,
}))

describe('Footer', () => {
  it('renders the brand name', () => {
    render(<Footer />)
    expect(screen.getByText('カウンセラーマッチ')).toBeInTheDocument()
  })

  it('renders the Heart icon', () => {
    render(<Footer />)
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
  })

  it('renders the platform description', () => {
    render(<Footer />)
    expect(
      screen.getByText(/ホリスティック心理学に基づく/)
    ).toBeInTheDocument()
  })

  it('renders service section heading', () => {
    render(<Footer />)
    expect(screen.getByText('サービス')).toBeInTheDocument()
  })

  it('renders service links', () => {
    render(<Footer />)
    expect(screen.getByText('カウンセラーを探す')).toBeInTheDocument()
    expect(screen.getByText('私たちについて')).toBeInTheDocument()
    expect(screen.getByText('カウンセラー登録')).toBeInTheDocument()
  })

  it('renders legal section heading', () => {
    render(<Footer />)
    expect(screen.getByText('法的情報')).toBeInTheDocument()
  })

  it('renders legal links', () => {
    render(<Footer />)
    expect(screen.getByText('利用規約')).toBeInTheDocument()
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument()
    expect(screen.getByText('特定商取引法に基づく表記')).toBeInTheDocument()
  })

  it('renders copyright with AICREO NEXT', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(
      screen.getByText(`\u00A9 ${currentYear} 合同会社AICREO NEXT. All rights reserved.`)
    ).toBeInTheDocument()
  })

  it('has correct href links for service section', () => {
    render(<Footer />)
    const counselorsLink = screen.getByText('カウンセラーを探す').closest('a')
    const aboutLink = screen.getByText('私たちについて').closest('a')
    const forCounselorsLink = screen.getByText('カウンセラー登録').closest('a')

    expect(counselorsLink).toHaveAttribute('href', '/counselors')
    expect(aboutLink).toHaveAttribute('href', '/about')
    expect(forCounselorsLink).toHaveAttribute('href', '/for-counselors')
  })

  it('has correct href links for legal section', () => {
    render(<Footer />)
    const termsLink = screen.getByText('利用規約').closest('a')
    const privacyLink = screen.getByText('プライバシーポリシー').closest('a')
    const commercialLink = screen.getByText('特定商取引法に基づく表記').closest('a')

    expect(termsLink).toHaveAttribute('href', '/terms')
    expect(privacyLink).toHaveAttribute('href', '/privacy')
    expect(commercialLink).toHaveAttribute('href', '/commercial')
  })
})
