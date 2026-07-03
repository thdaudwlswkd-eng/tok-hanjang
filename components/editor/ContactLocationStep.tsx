'use client'

interface Props {
  phone: string
  kakaoLink: string
  bookingEnabled: boolean
  address: string
  onAddressChange: (v: string) => void
}

export default function ContactLocationStep({
  phone, kakaoLink, bookingEnabled, address, onAddressChange,
}: Props) {
  return (
    <div className="space-y-7">
      {/* 연락처 버튼 미리보기 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">📞 연락처 버튼 미리보기</p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {phone && (
              <>
                <span className="px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold">📞 전화</span>
                <span className="px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold">💬 문자</span>
              </>
            )}
            {kakaoLink && (
              <span className="px-3 py-2 bg-yellow-400 text-slate-800 rounded-xl text-sm font-semibold">💛 카카오톡</span>
            )}
            {bookingEnabled && (
              <span className="px-3 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold">📅 예약하기</span>
            )}
            {!phone && !kakaoLink && !bookingEnabled && (
              <p className="text-sm text-slate-400">1페이지에서 전화번호를 입력하거나<br />3페이지에서 카카오 링크를 입력하면<br />버튼이 여기에 표시됩니다</p>
            )}
          </div>
          <p className="text-xs text-slate-400">실제 명함 페이지에서 이 버튼들이 나타납니다</p>
        </div>
      </div>

      {/* 주소 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-1">🗺️ 주소 <span className="font-normal text-slate-400">(선택)</span></p>
        <p className="text-xs text-slate-400 mb-3">입력하면 카카오맵·네이버맵 길찾기 버튼이 자동으로 나타납니다</p>
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="예) 서울시 마포구 합정동 123-45"
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 길찾기 버튼 미리보기 */}
      {address && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-3">🧭 길찾기 버튼 미리보기</p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex gap-2">
              <span className="px-4 py-2.5 bg-yellow-400 text-slate-900 rounded-xl text-sm font-semibold">🟡 카카오맵</span>
              <span className="px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold">🟢 네이버지도</span>
            </div>
            <p className="text-xs text-slate-400">방문자가 버튼을 누르면 바로 길찾기가 시작됩니다</p>
            <p className="text-xs text-slate-500 font-medium">{address}</p>
          </div>
        </div>
      )}
    </div>
  )
}
