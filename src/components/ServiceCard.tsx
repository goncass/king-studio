'use client'

import { Service } from '@/lib/data'
import { Scissors, CheckCircle, Star } from 'lucide-react'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cabelo':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Barba':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Combos':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'Tratamentos':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'Rosto':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      default:
        return 'bg-dark-100 text-dark-700 dark:bg-dark-800 dark:text-dark-300'
    }
  }

  return (
    <article className="card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
          <Scissors className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        </div>
        {service.popular && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium flex-shrink-0">
            <Star className="w-3 h-3 fill-current" aria-hidden="true" />
            Popular
          </div>
        )}
      </div>

      <div className="mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
          {service.category}
        </span>
      </div>

      <h3 className="font-display text-xl font-bold text-dark-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
        {service.name}
      </h3>

      <p className="text-dark-600 dark:text-dark-400 text-sm mb-4 line-clamp-2">
        {service.description}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500 dark:text-dark-500 mb-4">
        <div className="flex items-center gap-1">
          <Scissors className="w-4 h-4" aria-hidden="true" />
          <span>{service.duration}</span>
        </div>
        <div className="flex items-center gap-1 font-medium text-dark-900 dark:text-white">
          <span>{service.price}</span>
        </div>
      </div>

      <button
        className="w-full btn-secondary text-sm py-2 gap-2 justify-center border border-dark-300 dark:border-dark-600 hover:border-primary-500 hover:text-primary-500 transition-colors group"
      >
        Agendar este serviço
        <Scissors className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </article>
  )
}