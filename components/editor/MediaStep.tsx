'use client'

import { useEffect, useRef, useState } from 'react'
import { compressImage, uploadOneFile } from '@/lib/upload-utils'

const MAX_PHOTOS = 30
const PER_PHOTO_SEC = 2.5

interface Props {
  bio: string
  career: string
  onBioChange: (v: string) => void
  onCareerChange: (v: string) => void
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  videoUrl: string
  onVideoChange: (url: string) => void
  slideshowVideoUrl: string
  onSlideshowVideoUrlChange: (url: string) => void
  heroMode?: string
}

export default function MediaStep({
  bio, career, onBioChange, onCareerChange,
  photos, onPhotosChange,
  videoUrl, onVideoChange,
  slideshowVideoUrl, onSlideshowVideoUrlChange,
  heroMode,
}: Props) {
  const isCardImage = heroMode === 'card-image'

  const [galleryUploading, setGalleryUploading] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [slideshowUrl, setSlideshowUrl] = useState<string | null>(null)
  const [slideshowSaving, setSlideshowSaving] = useState(false)
  const [slideshowSaveError, setSlideshowSaveError] = useState('')
  const [slideshowSaved, setSlideshowSaved] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [audioError, setAudioError] = useState('')

  useEffect(() => {
    if (slideshowVideoUrl && !slideshowUrl) setSlideshowUrl(slideshowVideoUrl)
  }, [slideshowVideoUrl])

  useEffect(() => {
    if (!audioFile) { setAudioBlobUrl(null); return }
    const url = URL.createObjectURL(audioFile)
    setAudioBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [audioFile])

  const photoInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const audioInput = useRef<HTMLInputElement>(null)

  async function uploadGallery(files: FileList) {
    if (!files.length) return
    setGalleryUploading(true); setUploadError('')
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
    } finally { setGalleryUploading(false) }
  }

  async function uploadVideo(file: File) {
    setVideoUploading(true); setUploadError('')
    try {
      const url = await uploadOneFile(file)
      onVideoChange(url)
    } catch (e) {
      setUploadError('동영상 업로드 실패: ' + (e as Error).message)
    } finally { setVideoUploading(false) }
  }

  function removePhoto(idx: number) {
    onPhotosChange(photos.filter((_, i) => i !== idx))
    setSlideshowUrl(null)
  }

  async function generateSlideshow() {
    if (photos.length < 2 || generating) return
    setGenerating(true); setGenStep(0); setSlideshowUrl(null)
    let audioCtx: AudioContext | null = null
    let audioSource: AudioBufferSourceNode | null = null
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 540; canvas.height = 540
      const ctx = canvas.getContext('2d')!
      const withAudio = !!audioFile
      const mimeType = withAudio
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus'
          : 'video/webm')
        : (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm')
      const videoStream = canvas.captureStream(15)
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
          const audioTracks = dest.stream.getAudioTracks()
          if (audioTracks.length > 0) {
            recordStream = new MediaStream([...videoStream.getTracks(), ...audioTracks])
            setAudioError('')
          } else {
            audioCtx = null; audioSource = null; recordStream = videoStream
            setAudioError('이 기기에서는 음악 합치기가 지원되지 않아요. 영상만 만들어집니다.')
          }
        } catch (e) {
          audioCtx = null; audioSource = null; recordStream = videoStream
          setAudioError('음악 합치기 실패 — 영상만 만들어집니다. (' + (e as Error).message + ')')
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
      const fps = 15
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
            ctx.clearRect(0, 0, 540, 540)
            if (img.width && img.height) {
              ctx.save(); ctx.globalAlpha = fadeAlpha
              const s = Math.max(540 / img.width, 540 / img.height) * scale
              const x = (540 - img.width * s) / 2; const y = (540 - img.height * s) / 2
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
      const localUrl = URL.createObjectURL(blob)
      setSlideshowUrl(localUrl)
      setSlideshowSaving(true); setSlideshowSaveError(''); setSlideshowSaved(false)
      try {
        const file = new File([blob], 'slideshow.webm', { type: 'video/webm' })
        const serverUrl = await uploadOneFile(file)
        await onSlideshowVideoUrlChange(serverUrl)
        setSlideshowUrl(serverUrl); setSlideshowSaved(true)
      } catch (e) {
        setSlideshowSaveError('저장 실패: ' + (e as Error).message)
      } finally { setSlideshowSaving(false) }
    } finally { setGenerating(false) }
  }

  const genProgress = generating ? Math.round((genStep / photos.length) * 100) : 0
  const remainingSec = generating ? Math.round((photos.length - genStep) * PER_PHOTO_SEC) : 0

  return (
    <div className="space-y-7">
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
          ⚠️ {uploadError}
        </div>
      )}

      {/* 1. 한 줄 소개 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">
          ✏️ 한 줄 소개
          {isCardImage && <span className="ml-2 text-xs text-slate-400 font-normal">(선택)</span>}
        </p>
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="예) 20년 경력의 인테리어 전문가입니다. 무료 상담 환영!"
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 2. 경력 / 소개 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-1">📋 경력 / 소개 <span className="font-normal text-slate-400">(선택)</span></p>
        <p className="text-xs text-slate-400 mb-3">경력, 수상이력, 자격증 등을 자유롭게 적어주세요</p>
        <textarea
          value={career}
          onChange={(e) => onCareerChange(e.target.value)}
          placeholder={`예)\n2010 - 인테리어 자격증 취득\n2015 - 방송 출연\n2020 - 서울 인테리어 대상 수상`}
          rows={5}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 3. 갤러리 */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-sm font-bold text-slate-700">
            📸 갤러리 사진 <span className="font-normal text-slate-400">(최대 {MAX_PHOTOS}장)</span>
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
              {galleryUploading ? <span className="animate-spin text-xl">⏳</span> :
                <><span className="text-2xl">+</span><span>사진 추가</span></>}
            </button>
          )}
        </div>
        <input ref={photoInput} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => e.target.files && uploadGallery(e.target.files)} />

        {/* 4. 슬라이드쇼 + 음악 */}
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎵</span>
                    <span className="text-xs text-slate-700 truncate flex-1">{audioFile.name}</span>
                  </div>
                  {audioBlobUrl && (
                    <audio src={audioBlobUrl} controls className="w-full h-9" style={{ borderRadius: '12px' }} />
                  )}
                  {audioError && <p className="text-xs text-red-400">⚠️ {audioError}</p>}
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
              <input ref={audioInput} type="file" accept="audio/*,.mp3,.aac,.wav,.ogg,.flac,.m4a" className="hidden"
                onChange={(e) => e.target.files?.[0] && setAudioFile(e.target.files[0])} />
            </div>

            {!generating && !slideshowUrl && (
              <button type="button" onClick={generateSlideshow}
                className="w-full py-3.5 bg-violet-500 text-white rounded-2xl font-bold text-sm active:opacity-80">
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
                  <div className="h-full bg-violet-500 transition-all duration-500 rounded-full" style={{ width: `${genProgress}%` }} />
                </div>
                <p className="text-xs text-slate-400 text-center">약 {remainingSec}초 남았습니다</p>
              </div>
            )}

            {slideshowUrl && !generating && (
              <div className="space-y-3">
                {slideshowSaving && (
                  <div className="w-full py-3 bg-violet-50 border border-violet-200 rounded-2xl text-center text-sm text-violet-600 font-semibold">
                    ☁️ 서버에 저장 중... 잠시 기다려주세요
                  </div>
                )}
                {slideshowSaved && !slideshowSaving && (
                  <div className="w-full py-3 bg-green-50 border border-green-200 rounded-2xl text-center text-sm text-green-600 font-semibold">
                    ✅ 저장 완료! 이제 나갔다 와도 유지돼요
                  </div>
                )}
                {slideshowSaveError && (
                  <div className="w-full py-3 bg-red-50 border border-red-200 rounded-2xl text-center text-sm text-red-500">
                    ⚠️ {slideshowSaveError}
                  </div>
                )}
                <p className="text-xs font-semibold text-slate-500">미리보기{audioFile ? ' 🎵' : ''}</p>
                <video src={slideshowUrl} controls playsInline className="w-full rounded-2xl bg-black" style={{ maxHeight: '60vw' }} />
                <button type="button" onClick={generateSlideshow}
                  className="w-full py-2.5 border border-slate-200 text-slate-500 rounded-2xl text-sm">
                  다시 만들기
                </button>
              </div>
            )}
          </div>
        )}

        {photos.length === 0 && (
          <p className="text-xs text-center text-slate-400 py-2 mt-2">사진을 추가하면 슬라이드쇼가 자동 생성됩니다</p>
        )}
      </div>

      {/* 5. 동영상 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-1">🎥 동영상 업로드 <span className="font-normal text-slate-400">(선택)</span></p>
        <p className="text-xs text-slate-400 mb-3">업로드한 영상이 명함 페이지에서 재생됩니다</p>

        {videoUrl ? (
          <div>
            <video src={videoUrl} controls playsInline className="w-full rounded-2xl bg-black" style={{ maxHeight: '60vw' }} />
            <button type="button" onClick={() => onVideoChange('')}
              className="mt-3 w-full py-3 border border-red-200 text-red-500 rounded-2xl text-sm font-semibold">
              영상 삭제
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => videoInput.current?.click()} disabled={videoUploading}
            className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2 active:bg-slate-100 disabled:opacity-60">
            {videoUploading ? (
              <><span className="text-3xl">⏳</span><span className="text-sm font-semibold">업로드 중...</span><span className="text-xs">파일 크기에 따라 시간이 걸릴 수 있습니다</span></>
            ) : (
              <><span className="text-4xl">🎥</span><span className="text-sm font-semibold text-slate-600">동영상을 탭해서 업로드</span><span className="text-xs">MP4 · MOV · WebM · AVI 지원</span></>
            )}
          </button>
        )}
        <input ref={videoInput} type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,.mp4,.mov,.webm,.avi,.m4v,.mkv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
      </div>
    </div>
  )
}
