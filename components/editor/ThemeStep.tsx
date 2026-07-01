'use client'

import { COLOR_PALETTE, TEXT_COLOR_PALETTE } from '@/lib/types'

interface Props {
  theme: string
  onChange: (color: string) => void
  textColor: string
  onTextColorChange: (color: string) => void
}

function ColorSwatch({
  color,
  selected,
  onClick,
  withBorder = false,
}: {
  color: string
  selected: boolean
  onClick: () => void
  withBorder?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="aspect-square rounded transition-transform"
      style={{
        backgroundColor: color,
        border: withBorder ? '1px solid #e2e8f0' : undefined,
        outline: selected ? '2.5px solid #3b82f6' : undefined,
        outlineOffset: selected ? '2px' : undefined,
        transform: selected ? 'scale(1.15)' : undefined,
        boxShadow: selected ? '0 0 0 1px #fff' : undefined,
      }}
      aria-label={color}
    />
  )
}

export default function ThemeStep({ theme, onChange, textColor, onTextColorChange }: Props) {
  const bg = theme || '#0f172a'
  const tc = textColor || '#ffffff'

  return (
    <div>
      <h2 className="text-base font-bold text-slate-800 mb-1">명함 색상</h2>
      <p className="text-sm text-slate-400 mb-5">배경색과 글자색을 각각 선택하세요</p>

      {/* ── 배경색 ── */}
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">배경색</p>
      <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {COLOR_PALETTE.flat().map((color) => (
          <ColorSwatch
            key={color}
            color={color}
            selected={theme === color}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mb-6 mt-2">
        <div className="w-5 h-5 rounded border border-slate-200" style={{ backgroundColor: bg }} />
        <span className="text-xs font-mono text-slate-400 uppercase">{bg}</span>
      </div>

      {/* ── 글자색 ── */}
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">글자색</p>
      <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {TEXT_COLOR_PALETTE.flat().map((color) => (
          <ColorSwatch
            key={color}
            color={color}
            selected={textColor === color}
            onClick={() => onTextColorChange(color)}
            withBorder
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mb-6 mt-2">
        <div className="w-5 h-5 rounded border border-slate-200" style={{ backgroundColor: tc }} />
        <span className="text-xs font-mono text-slate-400 uppercase">{tc}</span>
      </div>

      {/* ── 미리보기 ── */}
      <p className="text-xs text-slate-400 mb-2">미리보기</p>
      <div
        className="rounded-2xl p-5"
        style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0)), ${bg}` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: `${tc}20` }}>
            👤
          </div>
          <div>
            <p className="font-bold" style={{ color: tc }}>홍길동</p>
            <p className="text-sm" style={{ color: tc, opacity: 0.7 }}>프리랜서 디자이너</p>
            <p className="text-xs mt-0.5" style={{ color: tc, opacity: 0.5 }}>010-1234-5678</p>
          </div>
        </div>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: tc, opacity: 0.75 }}>
          한 줄 소개가 여기에 표시됩니다.
        </p>
      </div>
    </div>
  )
}
