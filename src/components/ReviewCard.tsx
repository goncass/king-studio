'use client'

import Image from 'next/image'
import { Review } from '@/lib/data'
import { Star, Quote, Calendar, Crown } from 'lucide-react'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRandomColor = (str: string) => {
    const colors = [
      'bg-gold-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-orange-500',
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <article className="card-luxury p-6 relative">
      {/* Quote icon */}
      <Quote className="absolute top-6 right-6 w-10 h-10 text-gold-500/10 dark:text-gold-500/5" aria-hidden="true" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRandomColor(review.author)} flex-shrink-0`}
          aria-label={`${review.author} avatar`}
        >
          {review.avatar ? (
            <Image
              src={review.avatar}
              alt=""
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            getInitials(review.author)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-noir-950 dark:text-white truncate">
              {review.author}
            </h4>
            {review.service && (
              <span className="px-2 py-0.5 rounded-full bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 text-xs font-medium whitespace-nowrap flex-shrink-0 badge-gold">
                {review.service}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-noir-500 dark:text-noir-400">
            <div className="flex items-center gap-0.5" aria-label={`${review.rating} de 5 estrelas`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'fill-gold-400 text-gold-400' : 'text-noir-300 dark:text-noir-600'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <time className="flex items-center gap-1" dateTime={review.date}>
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {review.date}
            </time>
          </div>
        </div>
      </div>

      {/* Review text */}
      <p className="text-noir-700 dark:text-noir-300 leading-relaxed relative z-10">
        &ldquo;{review.text}&rdquo;
      </p>
    </article>
  )
}