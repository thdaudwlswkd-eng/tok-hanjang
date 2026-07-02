export interface BusinessHours {
  mon: { open: boolean; from: string; to: string }
  tue: { open: boolean; from: string; to: string }
  wed: { open: boolean; from: string; to: string }
  thu: { open: boolean; from: string; to: string }
  fri: { open: boolean; from: string; to: string }
  sat: { open: boolean; from: string; to: string }
  sun: { open: boolean; from: string; to: string }
}

export const DAY_LABELS: Record<keyof BusinessHours, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
  sun: '일',
}

export const DEFAULT_HOURS: BusinessHours = {
  mon: { open: true, from: '09:00', to: '18:00' },
  tue: { open: true, from: '09:00', to: '18:00' },
  wed: { open: true, from: '09:00', to: '18:00' },
  thu: { open: true, from: '09:00', to: '18:00' },
  fri: { open: true, from: '09:00', to: '18:00' },
  sat: { open: false, from: '10:00', to: '17:00' },
  sun: { open: false, from: '10:00', to: '17:00' },
}

export interface SnsLinks {
  instagram?: string
  youtube?: string
  tiktok?: string
  x?: string
  threads?: string
  blog?: string
}

export const SNS_PLATFORMS: {
  id: keyof SnsLinks
  label: string
  emoji: string
  color: string
  placeholder: string
}[] = [
  { id: 'instagram', label: '인스타그램', emoji: '📷', color: '#E1306C', placeholder: 'https://instagram.com/아이디' },
  { id: 'youtube',   label: '유튜브',     emoji: '▶️', color: '#FF0000', placeholder: 'https://youtube.com/@채널명' },
  { id: 'tiktok',    label: '틱톡',       emoji: '🎵', color: '#FE2C55', placeholder: 'https://tiktok.com/@아이디' },
  { id: 'x',         label: 'X (트위터)', emoji: '🐦', color: '#1D9BF0', placeholder: 'https://x.com/아이디' },
  { id: 'threads',   label: '스레드',     emoji: '🧵', color: '#111827', placeholder: 'https://threads.net/@아이디' },
  { id: 'blog',      label: '블로그',     emoji: '📝', color: '#03C75A', placeholder: 'https://blog.naver.com/아이디' },
]

// Color palette: 6 rows (dark→medium) × 10 columns (color families)
// Columns: slate, red, orange, amber, green, teal, blue, indigo, purple, rose
export const COLOR_PALETTE: string[][] = [
  ['#0f172a', '#450a0a', '#431407', '#451a03', '#052e16', '#042f2e', '#172554', '#1e1b4b', '#2e1065', '#4c0519'],
  ['#1e293b', '#7f1d1d', '#7c2d12', '#78350f', '#14532d', '#134e4a', '#1e3a8a', '#312e81', '#4a044e', '#881337'],
  ['#334155', '#991b1b', '#9a3412', '#92400e', '#166534', '#115e59', '#1e40af', '#3730a3', '#581c87', '#9f1239'],
  ['#475569', '#b91c1c', '#c2410c', '#b45309', '#15803d', '#0f766e', '#1d4ed8', '#4338ca', '#6b21a8', '#be123c'],
  ['#64748b', '#dc2626', '#ea580c', '#d97706', '#16a34a', '#0d9488', '#2563eb', '#4f46e5', '#7e22ce', '#e11d48'],
  ['#94a3b8', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#9333ea', '#f43f5e'],
]

export const DEFAULT_THEME_COLOR = '#0f172a'

// Text color palette: 6 rows (light→dark) × 10 columns
// Columns: neutral, red, orange, amber, green, cyan, blue, indigo, purple, pink
export const TEXT_COLOR_PALETTE: string[][] = [
  ['#ffffff', '#fef2f2', '#fff7ed', '#fffbeb', '#f0fdf4', '#ecfeff', '#eff6ff', '#eef2ff', '#faf5ff', '#fdf2f8'],
  ['#e2e8f0', '#fecaca', '#fed7aa', '#fde68a', '#bbf7d0', '#a5f3fc', '#bfdbfe', '#c7d2fe', '#e9d5ff', '#fbcfe8'],
  ['#cbd5e1', '#fca5a5', '#fdba74', '#fcd34d', '#86efac', '#67e8f9', '#93c5fd', '#a5b4fc', '#d8b4fe', '#f9a8d4'],
  ['#94a3b8', '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#22d3ee', '#60a5fa', '#818cf8', '#c084fc', '#f472b6'],
  ['#475569', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'],
  ['#1e293b', '#991b1b', '#9a3412', '#92400e', '#166534', '#155e75', '#1e3a8a', '#3730a3', '#581c87', '#9d174d'],
]

export const DEFAULT_TEXT_COLOR = '#ffffff'

export interface BookingData {
  id: string
  createdAt: string
  cardId: string
  name: string
  phone: string
  date: string
  time: string
  guests?: number | null
  note?: string | null
  status: string
}

export interface CardData {
  id: string
  name?: string | null
  title?: string | null
  bio?: string | null
  career?: string | null
  profilePhoto?: string | null
  photos?: string[] | null
  phone?: string | null
  kakaoLink?: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  hours?: BusinessHours | null
  slideshowUrl?: string | null
  videoUrl?: string | null
  ogImage?: string | null
  theme?: string | null
  textColor?: string | null
  snsLinks?: SnsLinks | null
  bookingEnabled?: boolean | null
  heroMode?: string | null
  cardImage?: string | null
}
