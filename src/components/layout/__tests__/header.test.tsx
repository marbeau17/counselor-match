import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '../header'

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
  Menu: (props: any) => <svg data-testid="menu-icon" {...props} />,
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
}))

describe('Header', () => {
  it('renders the brand name', () => {
    render(<Header />)
    expect(screen.getByText('カウンセラーマッチ')).toBeInTheDocument()
  })

  it('renders the Heart icon', () => {
    render(<Header />)
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getAllByText('カウンセラーを探す').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('私たちについて').length).toBeGreaterThanOrEqual(1)
  })

  it('shows login and register buttons when no user is provided', () => {
    render(<Header />)
    expect(screen.getAllByText('ログイン').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('無料登録').length).toBeGreaterThanOrEqual(1)
  })

  it('shows dashboard button when user is logged in', () => {
    render(<Header user={{ email: 'test@test.com', full_name: 'Test User' }} />)
    expect(screen.getAllByText('ダッシュボード').length).toBeGreaterThanOrEqual(1)
  })

  it('does not show login/register when user is logged in', () => {
    render(<Header user={{ email: 'test@test.com', full_name: 'Test User' }} />)
    expect(screen.queryByText('ログイン')).not.toBeInTheDocument()
    expect(screen.queryByText('無料登録')).not.toBeInTheDocument()
  })

  it('does not show dashboard when no user is provided', () => {
    render(<Header />)
    expect(screen.queryByText('ダッシュボード')).not.toBeInTheDocument()
  })

  it('has correct href links for navigation', () => {
    render(<Header />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/counselors')
    expect(hrefs).toContain('/about')
  })

  it('has correct href links for login and register', () => {
    render(<Header />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('/login')
    expect(hrefs).toContain('/register')
  })

  it('has correct href link for dashboard when logged in', () => {
    render(<Header user={{ email: 'test@test.com' }} />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('/dashboard')
  })

  it('toggles mobile menu when menu button is clicked', async () => {
    const user = userEvent.setup()
    render(<Header />)
    const menuButton = screen.getByLabelText('メニュー')
    expect(menuButton).toBeInTheDocument()

    // Mobile menu links are rendered in both desktop and mobile nav;
    // before clicking, only the desktop set should be present (2 links for カウンセラーを探す)
    // Desktop nav has: カウンセラーを探す, 私たちについて
    const beforeLinks = screen.getAllByText('カウンセラーを探す')
    const beforeCount = beforeLinks.length

    // Click to open mobile menu
    await user.click(menuButton)

    // After clicking, mobile menu links should appear (extra occurrences)
    const afterLinks = screen.getAllByText('カウンセラーを探す')
    expect(afterLinks.length).toBeGreaterThan(beforeCount)
  })

  it('renders the mobile menu button with aria-label', () => {
    render(<Header />)
    const menuButton = screen.getByLabelText('メニュー')
    expect(menuButton).toBeInTheDocument()
  })
})
