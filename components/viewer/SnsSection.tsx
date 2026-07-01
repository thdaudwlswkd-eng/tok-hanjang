import { SnsLinks, SNS_PLATFORMS } from '@/lib/types'

interface Props {
  snsLinks?: SnsLinks | null
}

export default function SnsSection({ snsLinks }: Props) {
  if (!snsLinks) return null

  const active = SNS_PLATFORMS.filter(p => snsLinks[p.id])
  if (active.length === 0) return null

  return (
    <section className="px-5 py-5 border-t border-slate-100">
      <h2 className="text-base font-bold text-slate-800 mb-3">🔗 SNS</h2>
      <div className="flex flex-wrap gap-2">
        {active.map((p) => (
          <a
            key={p.id}
            href={snsLinks[p.id]!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white active:opacity-80 transition-opacity"
            style={{ backgroundColor: p.color }}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
