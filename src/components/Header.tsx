'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Scissors, ChevronDown } from 'lucide-react'

interface HeaderProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  onBookClick: () => void
}

export function Header({ isMobileMenuOpen, setIsMobileMenuOpen, onBookClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#servicos', label: 'Serviços' },
    { href: '#barbeiros', label: 'Barbeiros' },
    { href: '#galeria', label: 'Galeria' },
    { href: '#avaliacoes', label: 'Avaliações' },
    { href: '#contacto', label: 'Contacto' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-dark-950/95 backdrop-blur-sm shadow-sm border-b border-dark-200 dark:border-dark-800'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-custom" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="#"
            className="flex items-center gap-2 text-xl font-display font-bold text-dark-900 dark:text-white hover:opacity-80 transition-opacity"
            aria-label="KingsStudio 2020 - Página inicial"
          >
            <Scissors className="w-7 h-7 text-primary-500" aria-hidden="true" />
            <span>KingsStudio <span className="text-primary-500">2020</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-dark-700 dark:text-dark-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-500 after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={onBookClick}
              className="btn-primary text-sm px-6 py-2.5 hidden sm:inline-flex"
            >
              Agendar Online
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
          }`}
          role="navigation"
          aria-label="Menu mobile"
        >
          <div className="flex flex-col gap-2 pt-4 border-t border-dark-200 dark:border-dark-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-base font-medium text-dark-700 dark:text-dark-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-dark-50 dark:hover:bg-dark-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                onBookClick()
                setIsMobileMenuOpen(false)
              }}
              className="btn-primary mx-4 mt-2 w-full"
            >
              Agendar Online
            </button>
            <a
              href="tel:+351915271491"
              className="btn-secondary mx-4 mt-2 w-full justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ligar: 915 271 491
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}