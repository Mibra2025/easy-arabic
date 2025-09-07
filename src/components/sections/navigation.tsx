'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/hooks/useRole'
import Link from 'next/link'
import { Menu, X, User, LogOut, Shield, BookOpen } from 'lucide-react'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { isAdmin } = useRole()
  const { isTeacher } = useRole()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
    } catch (error) {
      console.error('Logout error:', error)
      logout() // Выходим локально даже если API запрос не удался
    }
  }

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex-shrink-0">
              <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ع</span>
                </div>
                Easy Arabic
              </h2>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-baseline space-x-8">
              <a
                href="/#home"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </a>
              <a
                href="/#features"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="/#teachers"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Teachers
              </a>
              <a
                href="/#pricing"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Pricing
              </a>
                <a
                  href="/#contact"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Contact
                </a>
                <Link
                  href="/catalog"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Каталог
                </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Profile
                  </Link>
                  {(isTeacher() || isAdmin()) && (
                    <Link
                      href="/courses"
                      className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <BookOpen className="h-4 w-4" />
                      Курсы
                    </Link>
                  )}
                  {isAdmin() && (
                    <Link
                      href="/admin"
                      className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
            
            {/* Auth Section */}
            <div className="flex items-center space-x-4 ml-8">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 p-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b shadow-lg">
            <a
              href="/#home"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a
              href="/#features"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a
              href="/#teachers"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Teachers
            </a>
            <a
              href="/#pricing"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <a
              href="/#contact"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
            <Link
              href="/catalog"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Каталог
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                {(isTeacher() || isAdmin()) && (
                  <Link
                    href="/courses"
                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookOpen className="h-4 w-4" />
                    Курсы
                  </Link>
                )}
                {isAdmin() && (
                  <Link
                    href="/admin"
                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </>
            )}
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="w-full justify-start text-left text-gray-600 hover:text-red-600 px-3 py-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-blue-600 hover:text-blue-700">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth" onClick={() => setIsOpen(false)}>
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
