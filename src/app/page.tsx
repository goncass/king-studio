'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Scissors,
  MapPin,
  Clock,
  Star,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Facebook,
  Instagram,
  Globe,
  Navigation,
  Mail,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  Crown,
} from 'lucide-react'
import { services, barbers, galleryImages, reviews } from '@/lib/data'
import { BookingModal } from '@/components/BookingModal'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ServiceCard } from '@/components/ServiceCard'
import { BarberCard } from '@/components/BarberCard'
import { ReviewCard } from '@/components/ReviewCard'
import { Gallery } from '@/components/Gallery'

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToBooking = () => {
    setIsBookingOpen(true)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-noir-1000">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onBookClick={scrollToBooking}
      />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://lh3.googleusercontent.com/p/AF1QipMxSampleBarbershopImage1=w1200-h800"
              alt="KingsStudio 2020 - Interior da barbearia"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-noir-gradient" />
            <div className="absolute inset-0 bg-gradient-to-t from-noir-1000/80 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 container-custom py-20">
            <div className="max-w-3xl animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 text-gold-400 text-sm font-medium mb-6 border border-gold-500/20 backdrop-blur-sm">
                <Crown className="w-4 h-4" />
                <span>4.9 ★ • 49 avaliações no Google</span>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                KingsStudio <span className="text-gold-gradient">2020</span>
              </h1>
              <p className="text-xl sm:text-2xl text-noir-300 mb-8 max-w-2xl leading-relaxed">
                A sua barbearia de confiança em Queluz. Cortes modernos, barba clássica e atendimento premium.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={scrollToBooking}
                  className="btn-primary text-lg px-8 py-4 gap-2"
                >
                  Agendar Online
                  <Calendar className="w-5 h-5" />
                </button>
                <a
                  href="tel:+351915271491"
                  className="btn-secondary text-lg px-8 py-4 gap-2 justify-center"
                >
                  <Phone className="w-5 h-5" />
                  Ligar: 915 271 491
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-8 text-noir-400 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gold-400" />
                  <span>R. Jose Cipriano da Silveira Machado 9 G, 2745-200 Queluz</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-400" />
                  <span>Seg-Sex: 9h-19h • Sáb: 9h-17h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-noir-400" />
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-12 bg-noir-50 dark:bg-noir-950 border-y border-noir-200 dark:border-noir-800">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="relative">
                <div className="font-display text-4xl sm:text-5xl font-bold text-gold-500 mb-2">4.9</div>
                <div className="text-noir-600 dark:text-noir-400">Avaliação Google</div>
                <div className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-gold-500" aria-hidden="true" />
              </div>
              <div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-gold-500 mb-2">49+</div>
                <div className="text-noir-600 dark:text-noir-400">Avaliações</div>
              </div>
              <div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-gold-500 mb-2">15+</div>
                <div className="text-noir-600 dark:text-noir-400">Serviços</div>
              </div>
              <div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-gold-500 mb-2">5+</div>
                <div className="text-noir-600 dark:text-noir-400">Anos de Experiência</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="py-20 lg:py-28">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 text-sm font-medium mb-4 badge-gold">
                Os Nossos Serviços
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-noir-950 dark:text-white mb-4">
                Tudo para o seu <span className="text-gold-gradient">estilo</span>
              </h2>
              <p className="text-lg text-noir-600 dark:text-noir-400">
                Desde cortes clássicos aos mais modernos, barba, coloração e tratamentos capilares.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            <div className="text-center mt-12">
              <button className="btn-secondary gap-2" onClick={scrollToBooking}>
                Ver Todos os Serviços e Agendar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Barbers Section */}
        <section id="barbeiros" className="py-20 lg:py-28 bg-noir-50 dark:bg-noir-950">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 text-sm font-medium mb-4 badge-gold">
                A Nossa Equipa
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-noir-950 dark:text-white mb-4">
                Barbeiros <span className="text-gold-gradient">Experientes</span>
              </h2>
              <p className="text-lg text-noir-600 dark:text-noir-400">
                Profissionais apaixonados pelo ofício, sempre atualizados nas últimas tendências.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {barbers.map((barber) => (
                <BarberCard key={barber.id} barber={barber} />
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="galeria" className="py-20 lg:py-28">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 text-sm font-medium mb-4 badge-gold">
                Galeria
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-noir-950 dark:text-white mb-4">
                O Nosso <span className="text-gold-gradient">Espaço</span>
              </h2>
              <p className="text-lg text-noir-600 dark:text-noir-400">
                Um ambiente acolhedor e moderno pensado para a sua melhor experiência.
              </p>
            </div>
            <Gallery images={galleryImages} />
          </div>
        </section>

        {/* Reviews Section */}
        <section id="avaliacoes" className="py-20 lg:py-28 bg-noir-50 dark:bg-noir-950">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 text-sm font-medium mb-4 badge-gold">
                Avaliações
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-noir-950 dark:text-white mb-4">
                O que dizem os <span className="text-gold-gradient">nossos clientes</span>
              </h2>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-1">
                  <Star className="w-6 h-6 fill-gold-400 text-gold-400" />
                  <Star className="w-6 h-6 fill-gold-400 text-gold-400" />
                  <Star className="w-6 h-6 fill-gold-400 text-gold-400" />
                  <Star className="w-6 h-6 fill-gold-400 text-gold-400" />
                  <Star className="w-6 h-6 fill-gold-400 text-gold-400" />
                </div>
                <span className="text-noir-600 dark:text-noir-400">4.9 (49 avaliações no Google)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            <div className="text-center mt-12">
              <a
                href="https://maps.google.com/?cid=KingsStudio2020"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary gap-2 inline-flex"
              >
                Ver todas no Google
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Booking CTA Section */}
        <section id="agendar" className="py-20 lg:py-28">
          <div className="container-custom">
            <div className="relative rounded-2xl overflow-hidden bg-noir-gradient p-8 md:p-16 text-center gold-glow">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 text-gold-400 text-sm font-medium mb-6 border border-gold-500/20 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Experiência Premium</span>
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                  Pronto para o seu <span className="text-gold-gradient">novo visual</span>?
                </h2>
                <p className="text-lg text-noir-300 mb-8">
                  Agende online em segundos. Escolha o barbeiro, o serviço e a hora que melhor lhe convier.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={scrollToBooking}
                    className="btn-primary text-lg px-8 py-4 gap-2"
                  >
                    Agendar Agora
                    <Calendar className="w-5 h-5" />
                  </button>
                  <a
                    href="tel:+351915271491"
                    className="btn-secondary text-lg px-8 py-4 gap-2 justify-center"
                  >
                    <Phone className="w-5 h-5" />
                    Ligar: 915 271 491
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact/Location Section */}
        <section id="contacto" className="py-20 lg:py-28 bg-noir-50 dark:bg-noir-950">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <span className="inline-block px-4 py-1 rounded-full bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 text-sm font-medium mb-4 badge-gold">
                  Visite-nos
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-noir-950 dark:text-white mb-6">
                  Encontre-nos em <span className="text-gold-gradient">Queluz</span>
                </h2>
                <p className="text-lg text-noir-600 dark:text-noir-400 mb-8">
                  Estamos localizados no coração de Queluz, com fácil acesso e estacionamento próximo.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-gold-600 dark:text-gold-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-noir-950 dark:text-white mb-1">Morada</h3>
                      <p className="text-noir-600 dark:text-noir-400">
                        R. Jose Cipriano da Silveira Machado 9 G<br />
                        2745-200 Queluz, Lisboa
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-gold-600 dark:text-gold-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-noir-950 dark:text-white mb-1">Horário</h3>
                      <div className="text-noir-600 dark:text-noir-400 space-y-1">
                        <p>Segunda a Sexta: 9h00 - 19h00</p>
                        <p>Sábado: 9h00 - 17h00</p>
                        <p className="text-gold-500 font-medium">Domingo: Encerrado</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-gold-600 dark:text-gold-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-noir-950 dark:text-white mb-1">Contacto</h3>
                      <p className="text-noir-600 dark:text-noir-400">
                        <a href="tel:+351915271491" className="hover:text-gold-500 transition-colors">915 271 491</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-gold-600 dark:text-gold-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-noir-950 dark:text-white mb-1">Email</h3>
                      <p className="text-noir-600 dark:text-noir-400">
                        <a href="mailto:kingsstudio2020@gmail.com" className="hover:text-gold-500 transition-colors">kingsstudio2020@gmail.com</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-[400px] rounded-xl overflow-hidden border border-noir-200 dark:border-noir-800 card-luxury">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3088.123456789!2d-9.256789!3d38.751234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd1ec5f123456789%3A0x123456789abcdef!2sR.%20Jose%20Cipriano%20da%20Silveira%20Machado%209%20G%2C%202745-200%20Queluz!5e0!3m2!1spt-PT!2spt!4v1234567890123!5m2!1spt-PT!2spt"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização KingsStudio 2020"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  )
}