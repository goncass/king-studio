'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { GalleryImage } from '@/lib/data'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'

interface GalleryProps {
  images: GalleryImage[]
}

export function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setIsFullscreen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
    setIsFullscreen(false)
    document.body.style.overflow = ''
  }

  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
    }
  }

  // Keyboard navigation
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isFullscreen])
  }

  // Lightbox
  if (isFullscreen && selectedIndex !== null) {
    const image = images[selectedIndex]
    return (
      <div
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={`Imagem ${selectedIndex + 1} de ${images.length}: ${image.alt}`}
      >
        <button
          onClick={closeLightbox}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Fechar lightbox"
        >
          <X className="w-6 h-6" />
        </button>

        <button
          onClick={prevImage}
          className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors hidden sm:flex"
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div className="relative max-w-5xl max-h-[90vh] w-full">
          <Image
            src={image.src}
            alt={image.alt}
            width={1200}
            height={800}
            className="max-w-full max-h-[80vh] object-contain"
            priority
          />
        </div>

        <button
          onClick={nextImage}
          className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors hidden sm:flex"
          aria-label="Próxima imagem"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Galeria de imagens">
      {images.map((image, index) => (
        <article
          key={image.id}
          className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-zoom-in card"
          role="listitem"
          onClick={() => openLightbox(index)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openLightbox(index)
            }
          }}
          tabIndex={0}
          aria-label={`Ver ${image.alt} em tamanho real`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="w-full flex items-center justify-between text-white">
              <div>
                <p className="font-medium text-sm">{image.category}</p>
                <p className="text-xs text-white/70">{image.alt}</p>
              </div>
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

