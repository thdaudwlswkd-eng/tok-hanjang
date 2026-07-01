'use client'

interface Props {
  name: string
  title: string
  bio: string
  career: string
  onChange: (field: string, value: string) => void
}

export default function ProfileStep({ name, title, bio, career, onChange }: Props) {
  return (
    <div className="space-y-5">
      <Field
        label="이름 / 상호명"
        placeholder="예) 김철수, 철수네 카페"
        value={name}
        onChange={(v) => onChange('name', v)}
      />
      <Field
        label="직함 / 하는 일"
        placeholder="예) 인테리어 전문가, 카페 운영"
        value={title}
        onChange={(v) => onChange('title', v)}
      />
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">한 줄 소개</label>
        <textarea
          value={bio}
          onChange={(e) => onChange('bio', e.target.value)}
          placeholder="예) 20년 경력의 인테리어 전문가입니다. 무료 상담 환영!"
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
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
