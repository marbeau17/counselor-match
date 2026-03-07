"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Menu, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  user?: { email: string; full_name?: string } | null
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-7 w-7 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">カウンセラーマッチ</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/counselors" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              カウンセラーを探す
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              私たちについて
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">ダッシュボード</Button>
                </Link>
              </div>
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
              カウンセラーを探す
            </Link>
            <Link href="/about" className="block py-2 text-base font-medium text-gray-600 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
              私たちについて
            </Link>
            {user ? (
              <Link href="/dashboard" className="block py-2 text-base font-medium text-emerald-600" onClick={() => setMobileMenuOpen(false)}>
                ダッシュボード
              </Link>
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
