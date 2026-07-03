'use client'

import { useRef, useState } from 'react'
import { COLOR_PALETTE, TEXT_COLOR_PALETTE } from '@/lib/types'
import { compressImage, uploadOneFile } from '@/lib/upload-utils'

interface Props {
  heroMode: string
  onHeroModeChange: (mode: string) => void
  cardImage: string
  onCardImageChange: (url: string) => void
  profilePhoto: string
  onProfilePhotoChange: (url: string) => void
  name: string
  title: string
  phone: string
  onNameChange: (v: string) => void
  onTitleChange: (v: string) => void
  onPhoneChange: (v: string) => void
  theme: string
  onThemeChange: (c: string) => void
  textColor: string
  onTextColorChange: (c: string) => void
}

function ColorSwatch({ color, selected, onClick, withBorder = false }: {
  color: string; selected: boolean; onClick: () => void; withBorder?: boolean
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

export default function BasicInfoStep({
  heroMode, onHeroModeChange,
  cardImage, onCardImageChange,
  profilePhoto, onProfilePhotoChange,
  name, title, phone,
  onNameChange, onTitleChange, onPhoneChange,
  theme, onThemeChange, textColor, onTextColorChange,
}: Props) {
  const [cardImageUploading, setCardImageUploading] = useState(false)
  const [profileUploading, setProfileUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const cardImageInput = useRef<HTMLInputElement>(null)
  const profileInput = useRef<HTMLInputElement>(null)

  const isCardImage = heroMode === 'card-image'
  const bg = theme || '#0f172a'
  const tc = textColor || '#ffffff'

  async function uploadCardImage(files: FileList) {
    if (!files.length) return
    setCardImageUploading(true); setUploadError('')
    try {
      const url = await uploadOneFile(await compressImage(files[0]))
      onCardImageChange(url)
    } catch (e) {
      setUploadError('명함 사진 업로드 실패: ' + (e as Error).message)
    } finally { setCardImageUploading(false) }
  }

  async function uploadProfile(files: FileList) {
    if (!files.length) return
    setProfileUploading(true); setUploadError('')
    try {
      const url = await uploadOneFile(await compressImage(files[0]))
      onProfilePhotoChange(url)
    } catch (e) {
      setUploadError('프로필 사진 업로드 실패: ' + (e as Error).message)
    } finally { setProfileUploading(false) }
  }

  return (
    <div className="space-y-6">
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
          ⚠️ {uploadError}
        </div>
      )}

      {/* 1. 방식 선택 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">📋 명함 첫 화면 방식 선택</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onHeroModeChange('profile')}
            className={`p-4 rounded-2xl border-2 text-left transition-colors ${
              !isCardImage ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
            }`}
          >
            <p className="text-xl mb-1">👤</p>
            <p className="text-sm font-bold text-slate-700">프로필 작성</p>
            <p className="text-xs text-slate-400 mt-0.5">이름·사진·소개 직접 입력</p>
          </button>
          <button
            type="button"
            onClick={() => onHeroModeChange('card-image')}
            className={`p-4 rounded-2xl border-2 text-left transition-colors ${
              isCardImage ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
            }`}
          >
            <p className="text-xl mb-1">🪪</p>
            <p className="text-sm font-bold text-slate-700">명함 사진</p>
            <p className="text-xs text-slate-400 mt-0.5">내 명함을 사진으로 올리기</p>
          </button>
        </div>
      </div>

      {/* 2. 명함 사진 업로드 */}
      {isCardImage && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-slate-700 mb-1">🪪 명함 사진 업로드</p>
          <p className="text-xs text-slate-400 mb-3">올린 사진이 첫 화면 전체에 크게 표시됩니다</p>
          {cardImage ? (
            <div className="space-y-3">
              <img src={cardImage} alt="명함 사진" className="w-full rounded-2xl object-contain border border-slate-100 max-h-56" />
              <div className="flex gap-2">
                <button type="button" onClick={() => cardImageInput.current?.click()} disabled={cardImageUploading}
                  className="flex-1 py-2.5 border border-blue-300 text-blue-500 rounded-xl text-sm font-semibold">
                  사진 변경
                </button>
                <button type="button" onClick={() => onCardImageChange('')}
                  className="flex-1 py-2.5 border border-red-200 text-red-400 rounded-xl text-sm font-semibold">
                  삭제
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => cardImageInput.current?.click()} disabled={cardImageUploading}
              className="w-full aspect-[2/1] rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2 disabled:opacity-60">
              {cardImageUploading ? <><span className="text-3xl">⏳</span><span className="text-sm">업로드 중...</span></> :
                <><span className="text-4xl">🪪</span><span className="text-sm font-semibold text-slate-600">명함 사진 올리기</span><span className="text-xs">JPG · PNG · HEIC 가능</span></>}
            </button>
          )}
          <input ref={cardImageInput} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files && uploadCardImage(e.target.files)} />

          <div className="mt-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">💡 명함 사진에 이름·연락처가 있으면 추가 입력 없이 바로 완성이에요!</p>
          </div>
        </div>
      )}

      {/* 프로필 모드: 사진 + 이름/직함/전화 + 색상 */}
      {!isCardImage && (
        <>
          {/* 2. 프로필 사진 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-slate-700 mb-3">👤 프로필 사진</p>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => profileInput.current?.click()} disabled={profileUploading}
                className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0 disabled:opacity-60">
                {profileUploading ? <span className="text-2xl animate-spin">⏳</span> :
                  profilePhoto ? <img src={profilePhoto} alt="프로필" className="w-full h-full object-cover" /> :
                  <span className="text-3xl">👤</span>}
              </button>
              <div>
                <button type="button" onClick={() => profileInput.current?.click()} disabled={profileUploading}
                  className="text-blue-500 font-semibold text-sm disabled:opacity-60">
                  {profileUploading ? '업로드 중...' : profilePhoto ? '사진 변경' : '사진 추가'}
                </button>
                <p className="text-xs text-slate-400 mt-1">원형으로 표시됩니다</p>
                {profilePhoto && (
                  <button type="button" onClick={() => onProfilePhotoChange('')} className="text-xs text-red-400 mt-1 block">삭제</button>
                )}
              </div>
              <input ref={profileInput} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files && uploadProfile(e.target.files)} />
            </div>
          </div>

          {/* 3. 이름 / 직함 / 전화번호 */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-700">✏️ 기본 정보</p>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">이름 / 상호명</label>
              <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)}
                placeholder="예) 김철수, 철수네 카페"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">직함 / 하는 일</label>
              <input type="text" value={title} onChange={(e) => onTitleChange(e.target.value)}
                placeholder="예) 인테리어 전문가, 카페 운영"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">전화번호</label>
              <input type="tel" value={phone} onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="예) 010-1234-5678"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <p className="text-xs text-slate-400 mt-1">입력하면 전화·문자 버튼이 자동으로 나타납니다</p>
            </div>
          </div>

          {/* 4. 배경색 */}
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">🎨 배경색</p>
            <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
              {COLOR_PALETTE.flat().map((color) => (
                <ColorSwatch key={color} color={color} selected={theme === color} onClick={() => onThemeChange(color)} />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-5 h-5 rounded border border-slate-200" style={{ backgroundColor: bg }} />
              <span className="text-xs font-mono text-slate-400 uppercase">{bg}</span>
            </div>
          </div>

          {/* 5. 글자색 */}
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">✏️ 글자색</p>
            <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
              {TEXT_COLOR_PALETTE.flat().map((color) => (
                <ColorSwatch key={color} color={color} selected={textColor === color} onClick={() => onTextColorChange(color)} withBorder />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-5 h-5 rounded border border-slate-200" style={{ backgroundColor: tc }} />
              <span className="text-xs font-mono text-slate-400 uppercase">{tc}</span>
            </div>
          </div>

          {/* 미리보기 */}
          <div>
            <p className="text-xs text-slate-400 mb-2">미리보기</p>
            <div className="rounded-2xl p-5"
              style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0)), ${bg}` }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${tc}20` }}>
                  {profilePhoto
                    ? <img src={profilePhoto} alt="프로필" className="w-full h-full object-cover" />
                    : <span className="text-xl">👤</span>}
                </div>
                <div>
                  <p className="font-bold" style={{ color: tc }}>{name || '이름'}</p>
                  <p className="text-sm" style={{ color: tc, opacity: 0.7 }}>{title || '직함'}</p>
                  <p className="text-xs mt-0.5" style={{ color: tc, opacity: 0.5 }}>{phone || '010-0000-0000'}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
