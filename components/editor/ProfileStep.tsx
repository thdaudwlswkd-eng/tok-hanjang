'use client'

interface Props {
  name: string
  title: string
  bio: string
  career: string
  onChange: (field: string, value: string) => void
  heroMode?: string
}

export default function ProfileStep({ name, title, bio, career, onChange, heroMode }: Props) {
  const isCardImage = heroMode === 'card-image'

  return (
    <div className="space-y-5">
      {isCardImage && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2">
          <span className="text-amber-500 mt-0.5">🪪</span>
          <p className="text-xs text-amber-700">명함 사진 모드예요. 이름·직함·한줄소개는 명함 사진에 있으므로 입력하지 않아도 됩니다.</p>
        </div>
      )}

      <Field
        label="이름 / 상호명"
        placeholder="예) 김철수, 철수네 카페"
        value={name}
        onChange={(v) => onChange('name', v)}
        disabled={isCardImage}
      />
      <Field
        label="직함 / 하는 일"
        placeholder="예) 인테리어 전문가, 카페 운영"
        value={title}
        onChange={(v) => onChange('title', v)}
        disabled={isCardImage}
      />
      <div>
        <label className={`block text-sm font-semibold mb-2 ${isCardImage ? 'text-slate-300' : 'text-slate-700'}`}>한 줄 소개</label>
        <textarea
          value={bio}
          onChange={(e) => onChange('bio', e.target.value)}
          placeholder="예) 20년 경력의 인테리어 전문가입니다. 무료 상담 환영!"
          rows={3}
          disabled={isCardImage}
          className={`w-full px-4 py-3 rounded-2xl border text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            isCardImage
              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
              : 'border-slate-200 bg-white text-slate-800'
          }`}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">경력 / 소개 (선택)</label>
        <textarea
          value={career}
          onChange={(e) => onChange('career', e.target.value)}
          placeholder="경력, 수상 이력, 자격증 등을 자유롭게 적어주세요"
          rows={5}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>
  )
}

function Field({
  label, placeholder, value, onChange,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  )
}
