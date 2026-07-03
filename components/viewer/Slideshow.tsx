'use client'

import { useRef, useState } from 'react'

interface Props {
  photos: string[]
}

export default function Slideshow({ photos }: Props) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)

  if (!photos.length) return null

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrent(c => (c + 1) % photos.length)
      } else {
        setCurrent(c => (c - 1 + photos.length) % photos.length)
      }
    }
  }

  return (
    <section className="relative">
      <div
        className="relative aspect-square w-full overflow-hidden bg-slate-900"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {photos.map((url, i) => (
          <div
            key={url}
            className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={url}
              alt={`슬라이드 ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Dots */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}