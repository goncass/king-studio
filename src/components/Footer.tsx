'use client'

import Link from 'next/link'
import { Scissors, MapPin, Clock, Phone, Mail, Facebook, Instagram, Globe, ArrowRight } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    servicos: [
      { label: 'Corte de Cabelo', href: '#servicos' },
      { label: 'Barba & Navalha', href: '#servicos' },
      { label: 'Coloração', href: '#servicos' },
      { label: 'Tratamentos', href: '#servicos' },
      { label: 'Combos', href: '#servicos' },
    ],
    empresa: [
      { label: 'Sobre Nós', href: '#barbeiros' },
      { label: 'A Nossa Equipa', href: '#barbeiros' },
      { label: 'Galeria', href: '#galeria' },
      { label: 'Avaliações', href: '#avaliacoes' },
      { label: 'Contacto', href: '#contacto' },
    ],
    info: [
      { label: 'Horário: Seg-Sex 9h-19h', href: '#' },
      { label: 'Sábado 9h-17h', href: '#' },
      { label: 'Domingo Encerrado', href: '#' },
    ],
  }

  const socialLinks = [
    { href: 'https://facebook.com/kingsstudio2020', icon: Facebook, label: 'Facebook', color: 'hover:text-blue-500' },
    { href: 'https://instagram.com/kingsstudio2020', icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500' },
    { href: 'https://maps.google.com/?cid=KingsStudio2020', icon: Globe, label: 'Google Maps', color: 'hover:text-red-500' },
  ]

  return (
    <footer className="bg-dark-950 text-dark-400" role="contentinfo">
      <div className="container-custom py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="#" className="flex items-center gap-2 text-xl font-display font-bold text-white mb-4" aria-label="KingsStudio 2020 - Página inicial">
              <Scissors className="w-7 h-7 text-primary-500" aria-hidden="true" />
              <span>KingsStudio <span className="text-primary-400">2020</span></span>
            </Link>
            <p className="text-dark-500 mb-6 max-w-xs">
              A sua barbearia de confiança em Queluz. Cortes modernos, barba clássica e atendimento premium desde 2020.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-dark-500 transition-colors ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="font-semibold text-white mb-4">Serviços</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.servicos.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-dark-500 hover:text-primary-400 transition-colors text-sm flex items-center gap-2"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="font-semibold text-white mb-4">Empresa</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-dark-500 hover:text-primary-400 transition-colors text-sm flex items-center gap-2"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contacto</h3>
            <address className="not-italic space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-dark-500">R. Jose Cipriano da Silveira Machado 9 G</p>
                  <p className="text-dark-500">2745-200 Queluz, Lisboa</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" aria-hidden="true" />
                <a href="tel:+351915271491" className="text-dark-500 hover:text-primary-400 transition-colors">915 271 491</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" aria-hidden="true" />
                <a href="mailto:kingsstudio2020@gmail.com" className="text-dark-500 hover:text-primary-400 transition-colors">kingsstudio2020@gmail.com</a>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Clock className="w-5 h-5 text-primary-500 flex-shrink-0" aria-hidden="true" />
                <div className="text-dark-500">
                  <p>Seg-Sex: 9h00 - 19h00</p>
                  <p>Sáb: 9h00 - 17h00</p>
                  <p className="text-primary-500">Domingo: Encerrado</p>
                </div>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-600 text-sm">
            © {currentYear} KingsStudio 2020. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-dark-600">
            <Link href="/privacidade" className="hover:text-primary-400 transition-colors">Política de Privacidade</Link>
            <Link href="/termos" className="hover:text-primary-400 transition-colors">Termos de Uso</Link>
            <Link href="/cookies" className="hover:text-primary-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}