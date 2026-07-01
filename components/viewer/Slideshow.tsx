'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  photos: string[]
}

export default function Slideshow({ photos }: Props) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-advance slideshow
  useEffect(() => {
    if (photos.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % photos.length)
    }, 3500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [photos.length])

  if (!photos.length) return null

  return (
    <section className="relative">
      {/* Slideshow */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
        {photos.map((url, i) => (
          <div
            key={url}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={url}
              alt={`슬라이드 ${i + 1}`}
              className={`w-full h-full object-cover ${i === current ? 'kenburns' : ''}`}
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
