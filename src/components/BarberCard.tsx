'use client'

import Image from 'next/image'
import { Barber } from '@/lib/data'
import { Instagram, Star } from 'lucide-react'

interface BarberCardProps {
  barber: Barber
}

export function BarberCard({ barber }: BarberCardProps) {
  return (
    <article className="card-luxury overflow-hidden relative group">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={barber.image}
          alt={barber.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-1000/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Social */}
        {barber.instagram && (
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <a
              href={`https://instagram.com/${barber.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              <Instagram className="w-4 h-4" aria-hidden="true" />
              @{barber.instagram.replace('@', '')}
            </a>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 text-xs font-medium badge-gold">
            {barber.role}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-noir-950 dark:text-white mb-2">
          {barber.name}
        </h3>

        <p className="text-noir-600 dark:text-noir-400 text-sm mb-4 line-clamp-3">
          {barber.bio}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 pt-4 border-t border-noir-200 dark:border-noir-800">
          <div className="flex items-center gap-0.5">
            <Star className="w-4 h-4 fill-gold-400 text-gold-400" aria-hidden="true" />
            <Star className="w-4 h-4 fill-gold-400 text-gold-400" aria-hidden="true" />
            <Star className="w-4 h-4 fill-gold-400 text-gold-400" aria-hidden="true" />
            <Star className="w-4 h-4 fill-gold-400 text-gold-400" aria-hidden="true" />
            <Star className="w-4 h-4 fill-gold-400 text-gold-400" aria-hidden="true" />
          </div>
          <span className="text-sm text-noir-500 dark:text-noir-400">(49 avaliações)</span>
        </div>
      </div>
    </article>
  )
}