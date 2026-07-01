'use client'

import { useRef, useState } from 'react'

const MAX_PHOTOS = 30
const PER_PHOTO_SEC = 2.5

interface Props {
  photos: string[]
  profilePhoto: string
  onPhotosChange: (photos: string[]) => void
  onProfilePhotoChange: (url: string) => void
  videoUrl: string
  onVideoChange: (url: string) => void
}

async function compressImage(file: File, maxWidth = 1400, quality = 0.82): Promise<File> {
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

async function uploadOneFile(file: File): Promise<string> {
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
    if ((e as Error).name === 'AbortError') throw new Error('업로드 타임아웃 (30초) - 파일이 너무 크거나 네트워크가 느린 것 같습니다')
    throw e
  }
}

export default function PhotoStep({
  photos, profilePhoto, onPhotosChange, onProfilePhotoChange, videoUrl, onVideoChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'video'>('gallery')

  const [profileUploading, setProfileUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [slideshowUrl, setSlideshowUrl] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const photoInput = useRef<HTMLInputElement>(null)
  const profileInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const audioInput = useRef<HTMLInputElement>(null)

  async function uploadProfile(files: FileList) {
    if (!files.length) return
    setProfileUploading(true)
    setUploadError('')
    try {
      const compressed = await compressImage(files[0])
      const url = await uploadOneFile(compressed)
      onProfilePhotoChange(url)
    } catch (e) {
      setUploadError('프로필 사진 업로드 실패: ' + (e as Error).message)
    } finally {
      setProfileUploading(false)
    }
  }

  async function uploadGallery(files: FileList) {
    if (!files.length) return
    setGalleryUploading(true)
    setUploadError('')
    try {
      const remaining = MAX_PHOTOS - photos.length
      const selected = Array.from(files).slice(0, remaining)
      const urls: string[] = []
      for (const file of selected) {
        const compressed = await compressImage(file)
        const url = await uploadOneFile(compressed)
        urls.push(url)
      }
      if (!urls.length) { setUploadError('업로드된 사진이 없어요.'); return }
      onPhotosChange([...photos, ...urls].slice(0, MAX_PHOTOS))
      setSlideshowUrl(null)
    } catch (e) {
      setUploadError('갤러리 업로드 실패: ' + (e as Error).message)
    } finally {
      setGalleryUploading(false)
    }
  }

  async function uploadVideo(file: File) {
    if (!file) return
    setVideoUploading(true)
    setUploadError('')
    try {
      const url = await uploadOneFile(file)
      onVideoChange(url)
    } catch (e) {
      setUploadError('동영상 업로드 실패: ' + (e as Error).message)
    } finally {
      setVideoUploading(false)
    }
  }

  function removePhoto(idx: number) {
    onPhotosChange(photos.filter((_, i) => i !== idx))
    setSlideshowUrl(null)
  }

  async function generateSlideshow() {
    if (photos.length < 2 || generating) return
    setGenerating(true)
    setGenStep(0)
    setSlideshowUrl(null)

    let audioCtx: AudioContext | null = null
    let audioSource: AudioBufferSourceNode | null = null

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')!

      const withAudio = !!audioFile
      const mimeType = withAudio
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus'
          : 'video/webm')
        : (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9'
          : 'video/webm')

      const videoStream = canvas.captureStream(30)
      let recordStream: MediaStream = videoStream

      if (audioFile) {
        try {
          audioCtx = new AudioContext()
          await audioCtx.resume()
          const arrayBuffer = await audioFile.arrayBuffer()
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
          const dest = audioCtx.createMediaStreamDestination()
          audioSource = audioCtx.createBufferSource()
          audioSource.buffer = audioBuffer
          audioSource.loop = true
          audioSource.connect(dest)
          recordStream = new MediaStream([
            ...videoStream.getTracks(),
            ...dest.stream.getTracks(),
          ])
        } catch {
          audioCtx = null
          audioSource = null
          recordStream = videoStream
        }
      }

      const recorder = new MediaRecorder(recordStream, { mimeType })
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

      const loaded = await Promise.all(
        photos.map((src) => new Promise<HTMLImageElement>((resolve) => {
          const img = new window.Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = () => resolve(img)
          img.src = src
        }))
      )

      const fps = 30
      const framesPerPhoto = Math.round(PER_PHOTO_SEC * fps)
      const frameInterval = Math.round(1000 / fps)

      recorder.start()
      if (audioSource) audioSource.start(0)

      for (let i = 0; i < loaded.length; i++) {
        const img = loaded[i]
        setGenStep(i + 1)

        await new Promise<void>((resolve) => {
          let f = 0
          function draw() {
            const t = f / framesPerPhoto
            const fadeAlpha = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1
            const scale = 1 + 0.04 * Math.sin(t * Math.PI)
            ctx.clearRect(0, 0, 1080, 1080)
            if (img.width && img.height) {
              ctx.save()
              ctx.globalAlpha = fadeAlpha
              const s = Math.max(1080 / img.width, 1080 / img.height) * scale
              const x = (1080 - img.width * s) / 2
              const y = (1080 - img.height * s) / 2
              ctx.drawImage(img, x, y, img.width * s, img.height * s)
              ctx.restore()
            }
            f++
            if (f < framesPerPhoto) setTimeout(draw, frameInterval)
            else resolve()
          }
          draw()
        })
      }

      try { audioSource?.stop() } catch {}
      recorder.stop()
      await new Promise<void>((resolve) => { recorder.onstop = () => resolve() })
      if (audioCtx) await audioCtx.close()

      const blob = new Blob(chunks, { type: 'video/webm' })
      setSlideshowUrl(URL.createObjectURL(blob))
    } finally {
      setGenerating(false)
    }
  }

  const genProgress = generating ? Math.round((genStep / photos.length) * 100) : 0
  const remainingSec = generating ? Math.round((photos.length - genStep) * PER_PHOTO_SEC) : 0

  return (
    <div className="space-y-6">
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
          ⚠️ {uploadError}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-slate-700 mb-3">👤 프로필 사진</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => profileInput.current?.click()}
            disabled={profileUploading}
            className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0 disabled:opacity-60"
          >
            {profileUploading ? (
              <span className="text-2xl animate-spin">⏳</span>
            ) : profilePhoto ? (
              <img src={profilePhoto} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </button>
          <div>
            <button
              type="button"
              onClick={() => profileInput.current?.click()}
              disabled={profileUploading}
              className="text-blue-500 font-semibold text-sm disabled:opacity-60"
            >
              {profileUploading ? '업로드 중...' : profilePhoto ? '사진 변경' : '사진 추가'}
            </button>
            <p className="text-xs text-slate-400 mt-1">원형으로 표시됩니다</p>
            {profilePhoto && (
              <button
                type="button"
                onClick={() => onProfilePhotoChange('')}
                className="text-xs text-red-400 mt-1 block"
              >
                삭제
              </button>
            )}
          </div>
          <input
            ref={profileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && uploadProfile(e.target.files)}
          />
        </div>
      </div>

      <div>
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'gallery' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            📸 갤러리 사진
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'video' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            🎥 동영상
          </button>
        </div>

        {activeTab === 'gallery' && (
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-sm font-semibold text-slate-700">
                갤러리 사진 <span className="text-slate-400 font-normal">(최대 {MAX_PHOTOS}장)</span>
              </p>
              <span className="text-xs text-slate-400">{photos.length}/{MAX_PHOTOS}</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">올린 사진으로 슬라이드쇼가 자동 생성됩니다</p>

            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img src={url} alt={`사진 ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => photoInput.current?.click()}
                  disabled={galleryUploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-xs gap-1 disabled:opacity-60"
                >
                  {galleryUploading ? (
                    <span className="animate-spin text-xl">⏳</span>
                  ) : (
                    <>
                      <span className="text-2xl">+</span>
                      <span>사진 추가</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && uploadGallery(e.target.files)}
            />

            {photos.length >= 2 && (
              <div className="mt-5 space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">🎵 배경음악 (선택)</p>
                    {audioFile && (
                      <button type="button" onClick={() => setAudioFile(null)} className="text-xs text-red-400 font-semibold">삭제</button>
                    )}
                  </div>
                  {audioFile ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎵</span>
                      <span className="text-xs text-slate-700 truncate flex-1">{audioFile.name}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => audioInput.current?.click()}
                      className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-xs text-slate-400 flex items-center justify-center gap-1.5 bg-white"
                    >
                      <span>➕</span>
                      <span>음악 파일 추가 (MP3 · AAC · WAV · FLAC)</span>
                    </button>
                  )}
                  <input
                    ref={audioInput}
                    type="file"
                    accept="audio/*,.mp3,.aac,.wav,.ogg,.flac,.m4a"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setAudioFile(e.target.files[0])}
                  />
                </div>

                {!generating && !slideshowUrl && (
                  <button
                    type="button"
                    onClick={generateSlideshow}
                    className="w-full py-3.5 bg-violet-500 text-white rounded-2xl font-bold text-sm active:opacity-80"
                  >
                    🎬 슬라이드로 만들기{audioFile ? ' (음악 포함)' : ''}
                  </button>
                )}

                {generating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>슬라이드 영상 만드는 중{audioFile ? ' 🎵' : ''}...</span>
                      <span>{genStep} / {photos.length}장</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 transition-all duration-500 rounded-full"
                        style={{ width: `${genProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-center">약 {remainingSec}초 남았습니다</p>
                  </div>
                )}

                {slideshowUrl && !generating && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500">미리보기{audioFile ? ' 🎵 음악 포함' : ''}</p>
                    <video src={slideshowUrl} controls playsInline className="w-full rounded-2xl bg-black" style={{ maxHeight: '60vw' }} />
                    <a href={slideshowUrl} download="slideshow.webm" className="block w-full py-3.5 bg-violet-500 text-white rounded-2xl font-bold text-sm text-center active:opacity-80">
                      💾 영상 저장하기
                    </a>
                    <button type="button" onClick={generateSlideshow} className="w-full py-2.5 border border-slate-200 text-slate-500 rounded-2xl text-sm">
                      다시 만들기
                    </button>
                  </div>
                )}
              </div>
            )}

            {photos.length === 0 && (
              <p className="text-xs text-center text-slate-400 py-2">사진을 추가하면 슬라이드쇼가 자동 생성됩니다</p>
            )}
          </div>
        )}

        {activeTab === 'video' && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">동영상 업로드 (선택)</p>
            <p className="text-xs text-slate-400 mb-4">업로드한 영상이 완성된 명함 페이지에서 재생됩니다</p>

            {videoUrl ? (
              <div>
                <video src={videoUrl} controls playsInline className="w-full rounded-2xl bg-black" style={{ maxHeight: '60vh' }} />
                <button
                  type="button"
                  onClick={() => onVideoChange('')}
                  className="mt-3 w-full py-3 border border-red-200 text-red-500 rounded-2xl text-sm font-semibold"
                >
                  영상 삭제
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInput.current?.click()}
                disabled={videoUploading}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2 active:bg-slate-100 disabled:opacity-60"
              >
                {videoUploading ? (
                  <>
                    <span className="text-3xl">⏳</span>
                    <span className="text-sm font-semibold">업로드 중...</span>
                    <span className="text-xs">파일 크기에 따라 시간이 걸릴 수 있습니다</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl">🎥</span>
                    <span className="text-sm font-semibold text-slate-600">동영상을 탭해서 업로드</span>
                    <span className="text-xs">MP4 · MOV · WebM · AVI 지원</span>
                  </>
                )}
              </button>
            )}

            <input
              ref={videoInput}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,.mp4,.mov,.webm,.avi,.m4v,.mkv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])}
            />
          </div>
        )}
      </div>
    </div>
  )
}
