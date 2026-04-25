import { render, screen } from '@testing-library/react'
import { Footer } from '../footer'

type AnyProps = Record<string, unknown>

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string } & AnyProps) =>
    <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
}))

vi.mock('lucide-react', () => ({
  Heart: (props: AnyProps) => <svg data-testid="heart-icon" {...props} />,
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
    expect(screen.getByText('コラム')).toBeInTheDocument()
    expect(screen.getByText('カウンセラー登録')).toBeInTheDocument()
  })

  it('renders 運営について section heading', () => {
    render(<Footer />)
    expect(screen.getByText('運営について')).toBeInTheDocument()
  })

  it('renders legal & company links under 運営について', () => {
    render(<Footer />)
    expect(screen.getByText('利用規約')).toBeInTheDocument()
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument()
    expect(screen.getByText('特定商取引法に基づく表記')).toBeInTheDocument()
    expect(screen.getByText('私たちについて')).toBeInTheDocument()
    expect(screen.getByText('選考基準')).toBeInTheDocument()
  })

  it('renders 無料ツール section with reflection tools', () => {
    render(<Footer />)
    expect(screen.getByText('無料ツール')).toBeInTheDocument()
    expect(screen.getByText('パーソナリティ診断')).toBeInTheDocument()
    expect(screen.getByText('タロット内省')).toBeInTheDocument()
    expect(screen.getByText('相性診断')).toBeInTheDocument()
  })

  it('renders copyright with AICREO NEXT', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(
      screen.getByText(`© ${currentYear} 合同会社AICREO NEXT. All rights reserved.`)
    ).toBeInTheDocument()
  })

  it('has correct href links for service section', () => {
    render(<Footer />)
    const counselorsLink = screen.getByText('カウンセラーを探す').closest('a')
    const columnLink = screen.getByText('コラム').closest('a')
    const forCounselorsLink = screen.getByText('カウンセラー登録').closest('a')

    expect(counselorsLink).toHaveAttribute('href', '/counselors')
    expect(columnLink).toHaveAttribute('href', '/column')
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
