'use client'

import { useRef, useState } from 'react'
import { compressImage, uploadOneFile } from '@/lib/upload-utils'

interface Props {
  cardImage: string
  onCardImageChange: (url: string) => void
  name: string
  title: string
  phone: string
  fax: string
  email: string
  address: string
  onNameChange: (v: string) => void
  onTitleChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onFaxChange: (v: string) => void
  onEmailChange: (v: string) => void
  onAddressChange: (v: string) => void
}

export default function BasicInfoStep({
  cardImage, onCardImageChange,
  name, title, phone, fax, email, address,
  onNameChange, onTitleChange, onPhoneChange, onFaxChange, onEmailChange, onAddressChange,
}: Props) {
  const [cardImageUploading, setCardImageUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const cardImageInput = useRef<HTMLInputElement>(null)

  async function uploadCardImage(files: FileList) {
    if (!files.length) return
    setCardImageUploading(true); setUploadError('')
    try {
      const url = await uploadOneFile(await compressImage(files[0]))
      onCardImageChange(url)
    } catch (e) {
      setUploadError('이미지 업로드 실패: ' + (e as Error).message)
    } finally { setCardImageUploading(false) }
  }

  return (
    <div className="space-y-6">
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
          {uploadError}
        </div>
      )}

      {/* 이미지 업로드 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-slate-700 mb-1">이미지 업로드 (명함)</p>
        <p className="text-xs text-slate-400 mb-3">업로드한 이미지가 명함 첫 화면 전체에 표시됩니다</p>
        {cardImage ? (
          <div className="space-y-3">
            <img src={cardImage} alt="명함 이미지" className="w-full rounded-2xl object-contain border border-slate-100 max-h-56" />
            <div className="flex gap-2">
              <button type="button" onClick={() => cardImageInput.current?.click()} disabled={cardImageUploading}
                className="flex-1 py-2.5 border border-blue-300 text-blue-500 rounded-xl text-sm font-semibold">
                이미지 변경
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
            {cardImageUploading
              ? <><span className="text-3xl">⏳</span><span className="text-sm">업로드 중...</span></>
              : <><span className="text-4xl">🪪</span><span className="text-sm font-semibold text-slate-600">명함 이미지 올리기</span><span className="text-xs">JPG · PNG · HEIC 가능</span></>}
          </button>
        )}
        <input ref={cardImageInput} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files && uploadCardImage(e.target.files)} />
      </div>

      {/* 기본 정보 — 첫 화면 노출 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-1">기본 정보 <span className="text-blue-500 font-normal text-xs">첫 화면에 표시</span></p>
        <p className="text-xs text-slate-400 mb-3">이미지 위에 이름과 직함이 표시됩니다</p>
        <div className="space-y-3">
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
        </div>
      </div>

      {/* 연락처 — 첫 화면 미노출 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-1">연락처 정보 <span className="text-slate-400 font-normal text-xs">첫 화면 아래에 표시</span></p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">전화번호</label>
            <input type="tel" value={phone} onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="예) 010-1234-5678"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">팩스번호</label>
            <input type="tel" value={fax} onChange={(e) => onFaxChange(e.target.value)}
              placeholder="예) 02-1234-5678"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">이메일</label>
            <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)}
              placeholder="예) example@email.com"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">주소</label>
            <input type="text" value={address} onChange={(e) => onAddressChange(e.target.value)}
              placeholder="예) 서울시 강남구 테헤란로 123"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
      </div>

      {/* 미리보기 */}
      {cardImage && (
        <div>
          <p className="text-xs text-slate-400 mb-2">미리보기 (명함 첫 화면)</p>
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            {/* 이미지: 너비 꽉 차게, 자연 비율 유지 */}
            <div>
              <img src={cardImage} alt="미리보기" className="w-full block" />
            </div>
            {/* 이름/직함 */}
            {(name || title) && (
              <div className="px-4 py-3 bg-white border-t border-slate-100">
                {name && <p className="text-sm font-bold leading-tight text-slate-800">{name}</p>}
                {title && <p className="text-xs mt-0.5 text-slate-500">{title}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
