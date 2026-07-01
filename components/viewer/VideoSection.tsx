'use client'

interface Props {
  videoUrl: string
}

export default function VideoSection({ videoUrl }: Props) {
  return (
    <section className="border-t border-slate-100">
      <div className="px-5 pt-5 pb-2">
        <h2 className="text-base font-bold text-slate-800 mb-3">🎥 영상</h2>
      </div>
      <video
        src={videoUrl}
        controls
        playsInline
        className="w-full bg-black"
        style={{ maxHeight: '75vw' }}
      />
    </section>
  )
}
