import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 })

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN missing' }, { status: 503 })
    }

    const { put } = await import('@vercel/blob')
    const urls: string[] = []
    const ALLOWED = ['jpg','jpeg','png','gif','webp','heic','heif','mp4','mov','webm','avi','mkv','m4v']

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      if (!ALLOWED.includes(ext)) {
        return NextResponse.json({ error: 'Not allowed: ' + ext }, { status: 400 })
      }
      const fn = 'uploads/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext
      const blob = await put(fn, file, { access: 'public' })
      urls.push(blob.url)
    }

    return NextResponse.json({ urls })
  } catch (e) {
    const msg = (e as Error).message ?? String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
