'use client'

interface Props {
  address: string
  onChange: (field: string, value: string) => void
}

export default function MapStep({ address, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">주소 (선택)</label>
        <input
          type="text"
          value={address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="예) 서울시 마포구 합정동 123-45"
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-slate-400 mt-1">입력하면 카카오맵·네이버맵 길찾기 버튼이 자동으로 나타납니다</p>
      </div>

      {address && (
        <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold text-slate-700">길찾기 버튼 미리보기</p>
          <div className="flex gap-2">
            <span className="px-3 py-2 bg-yellow-400 text-slate-900 rounded-xl text-sm font-semibold">
              카카오맵
            </span>
            <span className="px-3 py-2 bg-naver text-white rounded-xl text-sm font-semibold">
              네이버지도
            </span>
          </div>
          <p className="text-xs text-slate-500">방문자가 버튼을 누르면 바로 길찾기가 시작됩니다</p>
        </div>
      )}
    </div>
  )
}
