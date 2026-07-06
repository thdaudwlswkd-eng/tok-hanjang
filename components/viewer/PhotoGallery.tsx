'use client'

import { useState } from 'react'

interface Props {
  photos: string[]
}

export default function PhotoGallery({ photos }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!photos.length) return null

  function open(url: string, index: number) {
    setSelected(url)
    setSelectedIndex(index)
  }

  function close() {
    setSelected(null)
  }

  function prev() {
    const i = (selectedIndex - 1 + photos.length) % photos.length
    setSelectedIndex(i)
    setSelected(photos[i])
  }

  function next() {
    const i = (selectedIndex + 1) % photos.length
    setSelectedIndex(i)
    setSelected(photos[i])
  }

  return (
    <>
      <section className="px-4 py-5 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800 mb-3">🖼️ 갤러리</h2>

        {/* 3열 격자 */}
        <div className="grid grid-cols-3 gap-1">
          {photos.map((url, i) => (
            <button
              key={url}
              onClick={() => open(url, i)}
              className="aspect-square overflow-hidden rounded-lg bg-slate-100 focus:outline-none"
            >
              <img
                src={url}
                alt={`갤러리 ${i + 1}`}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </button>
          ))}
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-slate-400 text-center mt-2">사진 누르면 크게 보기</p>
      </section>

      {/* 라이트박스 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
        >
          {/* 닫기 버튼 */}
          <button
            className="absolute top-4 right-4 text-white text-3xl leading-none z-10 w-10 h-10 flex items-center justify-center"
            onClick={close}
          >
            ✕
          </button>

          {/* 이전 버튼 */}
          {photos.length > 1 && (
            <button
              className="absolute left-2 text-white text-3xl z-10 w-12 h-12 flex items-center justify-center opacity-70"
              onClick={(e) => { e.stopPropagation(); prev() }}
            >
              ‹
            </button>
          )}

          {/* 이미지 */}
          <img
            src={selected}
            alt="크게 보기"
            className="max-w-full max-h-full object-contain px-12"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 다음 버튼 */}
          {photos.length > 1 && (
            <button
              className="absolute right-2 text-white text-3xl z-10 w-12 h-12 flex items-center justify-center opacity-70"
              onClick={(e) => { e.stopPropagation(); next() }}
            >
              ›
            </button>
          )}

          {/* 페이지 표시 */}
          {photos.length > 1 && (
            <p className="absolute bottom-5 left-0 right-0 text-center text-white/60 text-sm">
              {selectedIndex + 1} / {photos.length}
            </p>
          )}
        </div>
      )}
    </>
  )
}
