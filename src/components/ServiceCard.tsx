'use client'

import { Service } from '@/lib/data'
import { Scissors, CheckCircle, Star } from 'lucide-react'

interface ServiceCardProps {
  service: Service
  onBook?: (serviceId: string) => void
}

export function ServiceCard({ service, onBook }: ServiceCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cabelo':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Barba':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'Combos':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'Tratamentos':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'Rosto':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      default:
        return 'bg-noir-100 text-noir-700 dark:bg-noir-800 dark:text-noir-300'
    }
  }

  return (
    <article className="card-luxury p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center flex-shrink-0">
          <Scissors className="w-6 h-6 text-gold-600 dark:text-gold-400" aria-hidden="true" />
        </div>
      </div>

      <div className="mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
          {service.category}
        </span>
      </div>

      <h3 className="font-display text-xl font-bold text-noir-950 dark:text-white mb-2 group-hover:text-gold-500 transition-colors">
        {service.name}
      </h3>

      <p className="text-noir-600 dark:text-noir-400 text-sm mb-4 line-clamp-2">
        {service.description}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-noir-500 dark:text-noir-500 mb-4">
        <div className="flex items-center gap-1">
          <Scissors className="w-4 h-4" aria-hidden="true" />
          <span>{service.duration}</span>
        </div>
        <div className="flex items-center gap-1 font-medium text-noir-950 dark:text-white">
          <span>{service.price}</span>
        </div>
      </div>

      <button
        onClick={() => onBook?.(service.id)}
        className="w-full btn-tertiary text-sm py-2 gap-2 justify-center border border-noir-300 dark:border-noir-600 hover:border-gold-500 hover:text-gold-500 transition-colors group"
      >
        Agendar este serviço
        <Scissors className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </article>
  )
}