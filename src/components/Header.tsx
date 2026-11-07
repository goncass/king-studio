'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Scissors, Crown } from 'lucide-react'

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
          ? 'bg-white/95 dark:bg-noir-1000/95 backdrop-blur-sm shadow-sm border-b border-noir-200 dark:border-noir-800'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-custom" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="#"
            className="flex items-center gap-2 text-xl font-display font-bold text-noir-950 dark:text-white hover:opacity-80 transition-opacity"
            aria-label="KingsStudio 2020 - Página inicial"
          >
            <img
              src="https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SoXDzaDWPTm2FHzjuWHjTAJtl6MqlfrCmJQs-43vyUJQiQDV2fYrfkavlnUqp_jbYkDSUVNH8r-xphumNzBr2CU6Y1Soafu8UVw3e0EKILM6WFZNBQstCSe3qAUIKAMqP-Ig8H=s680-w680-h510-rw"
              alt="KingsStudio 2020"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span>KingsStudio <span className="text-gold-500">2020</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-noir-700 dark:text-noir-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gold-500 after:transition-all hover:after:w-full"
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
            className="lg:hidden p-2 rounded-lg text-noir-700 dark:text-noir-300 hover:bg-noir-100 dark:hover:bg-noir-800 transition-colors"
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
          <div className="flex flex-col gap-2 pt-4 border-t border-noir-200 dark:border-noir-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-base font-medium text-noir-700 dark:text-noir-300 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-noir-50 dark:hover:bg-noir-800 rounded-lg transition-colors"
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