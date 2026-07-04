'use client'

interface Props {
  address?: string | null
}

export default function MapSection({ address }: Props) {
  if (!address) {
    return (
      <section className="px-5 py-6 border-t border-slate-100">
        <h2 className="text-base font-bold text-slate-800 mb-3">📍 찾아오시는 길</h2>
        <div className="bg-slate-50 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">🗺️</p>
          <p className="text-sm text-slate-400 leading-relaxed">주소를 등록하면<br />카카오맵·네이버지도 길찾기를 이용할 수 있어요</p>
        </div>
      </section>
    )
  }

  const encoded = encodeURIComponent(address)
  const kakaoUrl = `https://map.kakao.com/link/search/${encoded}`
  const naverUrl = `https://map.naver.com/v5/search/${encoded}`
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encoded}&output=embed&z=15`

  return (
    <section className="px-5 py-6 border-t border-slate-100">
      <h2 className="text-base font-bold text-slate-800 mb-3">📍 찾아오시는 길</h2>

      {/* Static map preview via Google */}
      <div className="rounded-2xl overflow-hidden mb-3 bg-slate-100 h-40 relative">
        <iframe
          src={mapEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          title="지도"
        />
      </div>

      <p className="text-sm text-slate-600 mb-3">{address}</p>

      <div className="flex gap-2">
        <a
          href={kakaoUrl}
        