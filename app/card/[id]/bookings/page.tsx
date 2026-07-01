'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

interface Booking {
  id: string
  createdAt: string
  name: string
  phone: string
  date: string
  time: string
  guests?: number | null
  note?: string | null
  status: string
}

interface ReplyState {
  booking: Booking
  message: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: '대기 중',
  confirmed: '확인됨',
  cancelled: '취소됨',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-400',
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`
}

function byDateTime(a: Booking, b: Booking) {
  return `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
}

function buildMessage(booking: Booking, address: string | null) {
  let msg = `안녕하세요, ${booking.name}님!\n예약이 확인되었습니다.\n\n`
  msg += `📅 날짜: ${formatDate(booking.date)}\n`
  msg += `🕐 시간: ${booking.time}\n`
  if (booking.guests) msg += `👥 인원: ${booking.guests}명\n`
  if (address) {
    msg += `\n📍 오시는 길\n${address}\n`
    msg += `지도 안내: https://map.kakao.com/?q=${encodeURIComponent(address)}`
  }
  msg += `\n\n궁금하신 점이 있으시면 언제든 연락 주세요.\n감사합니다!`
  return msg
}

interface BookingCardProps {
  booking: Booking
  updating: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

function BookingCard({ booking: b, updating, onConfirm, onCancel }: BookingCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-slate-800">{b.name}</p>
          <a href={`tel:${b.phone.replace(/[^0-9]/g, '')}`} className="text-sm text-blue-500">
            {b.phone}
          </a>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[b.status] ?? 'bg-slate-100 text-slate-500'}`}>
          {STATUS_LABEL[b.status] ?? b.status}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-2">
        <span>📅 {formatDate(b.date)}</span>
        <span>🕐 {b.time}</span>
        {b.guests && <span>👥 {b.guests}명</span>}
      </div>

      {b.note && (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-3 py-2 mb-3">
          💬 {b.note}
        </p>
      )}

      {(onConfirm || onCancel) && (
        <div className="flex gap-2 mt-3">
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={updating}
              className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
            >
              ✓ 확인 · 답장
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={updating}
              className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm disabled:opacity-50"
            >
              취소
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function BookingsPage({ params }: { params: { id: string } }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [cardAddress, setCardAddress] = useState<string | null>(null)
  const [reply, setReply] = useState<ReplyState | null>(null)
  const [copyToast, setCopyToast] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    load()
    fetch(`/api/cards/${params.id}`)
      .then(r => r.json())
      .then(d => setCardAddress(d.address ?? null))
      .catch(() => {})
  }, [])

  async function load() {
    const res = await fetch(`/api/cards/${params.id}/bookings`)
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function patchStatus(bookingId: string, status: string) {
    setUpdating(bookingId)
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await load()
    setUpdating(null)
  }

  async function confirmAndClose(bookingId: string) {
    await patchStatus(bookingId, 'confirmed')
    setReply(null)
  }

  function openReply(booking: Booking) {
    setReply({ booking, message: buildMessage(booking, cardAddress) })
  }

  async function sendSms() {
    if (!reply) return
    const id = reply.booking.id
    const phone = reply.booking.phone.replace(/[^0-9]/g, '')
    const body = encodeURIComponent(reply.message)
    await confirmAndClose(id)
    window.location.href = `sms:${phone}?body=${body}`
  }

  async function sendShare() {
    if (!reply) return
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: reply.message })
        await confirmAndClose(reply.booking.id)
      } catch {
        // user cancelled share — don't confirm
      }
    } else {
      await navigator.clipboard.writeText(reply.message)
      setCopyToast(true)
      setTimeout(() => setCopyToast(false), 2500)
      await confirmAndClose(reply.booking.id)
    }
  }

  const pending = bookings.filter(b => b.status === 'pending').sort(byDateTime)
  const confirmed = bookings.filter(b => b.status === 'confirmed').sort(byDateTime)
  const cancelled = bookings.filter(b => b.status === 'cancelled').sort(byDateTime)

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      <header className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href={`/card/${params.id}`} className="text-slate-400 text-xl leading-none">←</Link>
        <div>
          <h1 className="font-bold text-slate-800 text-base">예약 관리</h1>
          <p className="text-xs text-slate-400">전체 {bookings.length}건</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="ml-auto text-xs text-blue-500 font-semibold px-3 py-1.5 bg-blue-50 rounded-xl"
        >
          새로고침
        </button>
      </header>

      <div className="px-5 py-5 space-y-6">
        {loading && <p className="text-center text-slate-400 py-16">불러오는 중...</p>}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-slate-400 text-sm">아직 예약 신청이 없습니다</p>
          </div>
        )}

        {pending.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-amber-600 mb-3">대기 중 ({pending.length})</h2>
            <div className="space-y-3">
              {pending.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  updating={updating === b.id}
                  onConfirm={() => openReply(b)}
                  onCancel={() => patchStatus(b.id, 'cancelled')}
                />
              ))}
            </div>
          </section>
        )}

        {confirmed.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-green-600 mb-3">확인됨 ({confirmed.length})</h2>
            <div className="space-y-3">
              {confirmed.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  updating={updating === b.id}
                  onCancel={() => patchStatus(b.id, 'cancelled')}
                />
              ))}
            </div>
          </section>
        )}

        {cancelled.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-400 mb-3">취소됨 ({cancelled.length})</h2>
            <div className="space-y-3">
              {cancelled.map(b => (
                <BookingCard key={b.id} booking={b} updating={false} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── 답장 모달 ── */}
      {mounted && reply && createPortal(
        <div className="fixed inset-0" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setReply(null)} />
          <div className="absolute inset-x-0 bottom-0 flex justify-center" style={{ zIndex: 1 }}>
            <div className="w-full max-w-lg bg-white rounded-t-3xl px-5 pt-6 pb-10 max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">예약 확인 답장 보내기</h2>
                <button
                  type="button"
                  onClick={() => setReply(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Customer info */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 mb-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{reply.booking.name}</p>
                  <a href={`tel:${reply.booking.phone.replace(/[^0-9]/g, '')}`} className="text-sm text-blue-500">
                    {reply.booking.phone}
                  </a>
                </div>
                {reply.booking.guests && (
                  <span className="text-sm text-slate-500 bg-white rounded-xl px-3 py-1 border border-slate-200">
                    👥 {reply.booking.guests}명
                  </span>
                )}
              </div>

              {/* Editable message */}
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                답장 내용 (직접 수정 가능)
              </label>
              <textarea
                value={reply.message}
                onChange={e => setReply({ ...reply, message: e.target.value })}
                rows={10}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 mb-5"
              />

              {/* Send buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={sendSms}
                  disabled={updating === reply.booking.id}
                  className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50"
                >
                  📱 문자로 보내기
                </button>
                <button
                  type="button"
                  onClick={sendShare}
                  disabled={updating === reply.booking.id}
                  className="w-full py-4 bg-yellow-400 text-slate-900 rounded-2xl font-bold text-sm disabled:opacity-50"
                >
                  💛 카카오톡 · 공유하기
                </button>
                <button
                  type="button"
                  onClick={() => confirmAndClose(reply.booking.id)}
                  disabled={updating === reply.booking.id}
                  className="w-full py-3.5 border border-slate-200 text-slate-500 rounded-2xl text-sm font-semibold disabled:opacity-50"
                >
                  답장 없이 확인 처리만 하기
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 클립보드 복사 토스트 */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg" style={{ zIndex: 10000 }}>
          ✓ 메시지가 복사되었습니다
        </div>
      )}
    </div>
  )
}
