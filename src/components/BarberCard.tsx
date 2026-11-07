'use client'

import Image from 'next/image'
import { Barber } from '@/lib/data'
import { Instagram, Scissors, Star } from 'lucide-react'

interface BarberCardProps {
  barber: Barber
}

export function BarberCard({ barber }: BarberCardProps) {
  return (
    <article className="card overflow-hidden relative group">
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
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
          <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-medium">
            {barber.role}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-dark-900 dark:text-white mb-2">
          {barber.name}
        </h3>

        <p className="text-dark-600 dark:text-dark-400 text-sm mb-4 line-clamp-3">
          {barber.bio}
        </p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {barber.specialties.map((specialty) => (
            <span
              key={specialty}
              className="px-2.5 py-1 rounded-full bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-medium border border-dark-200 dark:border-dark-700"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 pt-4 border-t border-dark-200 dark:border-dark-800">
          <div className="flex items-center gap-0.5">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
          </div>
          <span className="text-sm text-dark-500 dark:text-dark-400">(49 avaliações)</span>
        </div>
      </div>
    </article>
  )
}