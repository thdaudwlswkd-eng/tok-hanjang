export async function compressImage(file: File, maxWidth = 1400, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/heic' || file.type === 'image/heif') {
    return file
  }
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round(height * maxWidth / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export async function uploadOneFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('files', file)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30000)
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: form, signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error('서버 오류 ' + res.status + ': ' + (data.error ?? res.statusText))
    }
    const { urls } = await res.json()
    if (!urls?.[0]) throw new Error('업로드 결과 없음')
    return urls[0]
  } catch (e) {
    clearTimeout(timer)
    if ((e as Error).name === 'AbortError') throw new Error('업로드 타임아웃 (30초)')
    throw e
  }
}
