"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Menu, X, Heart, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface HeaderProps {
  user?: { email: string; full_name?: string; role?: string | null } | null
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-700 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-7 w-7 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">カウンセラーマッチ</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/counselors" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors dark:text-gray-300 dark:hover:text-emerald-400">
              カウンセラー
            </Link>

            {/* 無料診断 dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors dark:text-gray-300 dark:hover:text-emerald-400"
                onClick={() => setToolsOpen(!toolsOpen)}
                aria-haspopup="true"
                aria-expanded={toolsOpen}
              >
                無料診断
                <ChevronDown className="h-4 w-4" />
              </button>
              {toolsOpen && (
                <div className="absolute left-0 top-full pt-2 w-56">
                  <div className="rounded-md border border-gray-200 bg-white shadow-lg py-1 dark:border-gray-700 dark:bg-gray-900">
                    <Link
                      href="/tools/personality"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setToolsOpen(false)}
                    >
                      パーソナリティ診断
                    </Link>
                    <Link
                      href="/tools/tarot"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setToolsOpen(false)}
                    >
                      タロット内省
                    </Link>
                    <Link
                      href="/tools/compatibility"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setToolsOpen(false)}
                    >
                      相性診断
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/column" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors dark:text-gray-300 dark:hover:text-emerald-400">
              コラム
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors dark:text-gray-300 dark:hover:text-emerald-400">
              私たちについて
            </Link>
            <Link href="/about/screening" className="text-xs font-medium text-gray-500 hover:text-emerald-600 transition-colors">
              選考基準
            </Link>

            {user ? (
              <>
              <NotificationBell />
              <div
                className="relative"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  ダッシュボード
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 w-56">
                    <div className="rounded-md border border-gray-200 bg-white shadow-lg py-1 dark:border-gray-700 dark:bg-gray-900">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        ダッシュボード
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/dashboard/admin"
                          className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-800 dark:text-purple-300 dark:hover:bg-purple-950 font-medium"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          管理者ダッシュボード
                        </Link>
                      )}
                      {user.role === "counselor" && (
                        <>
                          <Link
                            href="/dashboard/counselor"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            カウンセラー画面
                          </Link>
                          <Link
                            href="/dashboard/counselor/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            プロフィール編集
                          </Link>
                          <Link
                            href="/dashboard/counselor/availability"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            受付状態
                          </Link>
                        </>
                      )}
                      <Link
                        href="/dashboard/journey"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        わたしの旅路
                      </Link>
                      <Link
                        href="/dashboard/journal"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        ジャーナル
                      </Link>
                      <Link
                        href="/dashboard/wallet"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        ウォレット
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                      <form action="/api/auth/signout" method="POST">
                        <button
                          type="submit"
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          ログアウト
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">ログイン</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">無料登録</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="メニュー"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="space-y-1 px-4 py-4">
            <Link href="/counselors" className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
              カウンセラー
            </Link>

            {/* 無料診断 collapsible */}
            <button
              type="button"
              className="flex w-full items-center justify-between py-2 text-base font-medium text-gray-600 hover:text-emerald-600"
              onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
              aria-expanded={mobileToolsOpen}
            >
              <span>無料診断</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${mobileToolsOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileToolsOpen && (
              <div className="pl-4 space-y-1">
                <Link href="/tools/personality" className="block py-2 text-sm text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                  パーソナリティ診断
                </Link>
                <Link href="/tools/tarot" className="block py-2 text-sm text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                  タロット内省
                </Link>
                <Link href="/tools/compatibility" className="block py-2 text-sm text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                  相性診断
                </Link>
              </div>
            )}

            <Link href="/column" className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
              コラム
            </Link>
            <Link href="/about" className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
              私たちについて
            </Link>
            <Link href="/about/screening" className="block py-2 text-sm font-medium text-gray-500 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
              選考基準
            </Link>

            {user ? (
              <div className="space-y-1 pt-2 border-t border-gray-100 mt-2">
                <Link href="/dashboard" className="block py-2 text-base font-medium text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                  ダッシュボード
                </Link>
                {user.role === "admin" && (
                  <Link href="/dashboard/admin" className="block py-2 text-base font-medium text-purple-700 dark:text-purple-300" onClick={() => setMobileMenuOpen(false)}>
                    管理者ダッシュボード
                  </Link>
                )}
                {user.role === "counselor" && (
                  <>
                    <Link href="/dashboard/counselor" className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                      カウンセラー画面
                    </Link>
                    <Link href="/dashboard/counselor/profile" className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                      プロフィール編集
                    </Link>
                  </>
                )}
                <Link href="/dashboard/journey" className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                  わたしの旅路
                </Link>
                <Link href="/dashboard/journal" className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                  ジャーナル
                </Link>
                <Link href="/dashboard/wallet" className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                  ウォレット
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="block w-full text-left py-2 text-base font-medium text-red-600 hover:text-red-700"
                  >
                    ログアウト
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">ログイン</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">無料登録</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
