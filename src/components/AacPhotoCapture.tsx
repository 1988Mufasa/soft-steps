import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { cropPhotoToSquare, readPhotoAsDataUrl, type CropNorm } from '../utils/imageFile'

type Props = {
  onCapture: (dataUrl: string) => void
  onCancel: () => void
  title?: string
}

/**
 * In-editor snap → square crop for real-life AAC photos (sippy cup, Grandma…).
 * Uses device camera when available; falls back to file picker.
 */
export function AacPhotoCapture({ onCapture, onCancel, title = 'Snap a photo' }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [phase, setPhase] = useState<'camera' | 'crop'>('camera')
  const [rawSrc, setRawSrc] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [crop, setCrop] = useState<CropNorm>({ x: 0.15, y: 0.1, size: 0.7 })
  const dragRef = useRef<{ startX: number; startY: number; orig: CropNorm } | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          void videoRef.current.play().catch(() => undefined)
        }
      } catch {
        if (!cancelled) {
          setError('Camera unavailable — use Choose photo instead.')
        }
      }
    })()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const snapFromVideo = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      setError('Wait for the camera to start, then tap Snap.')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    stopCamera()
    setRawSrc(canvas.toDataURL('image/jpeg', 0.92))
    setPhase('crop')
    setError('')
  }

  const onFile = (file: File | null) => {
    if (!file) return
    void readPhotoAsDataUrl(file).then((result) => {
      if (!result.ok) {
        setError(result.error)
        return
      }
      stopCamera()
      setRawSrc(result.dataUrl)
      setPhase('crop')
      setError('')
    })
  }

  const confirmCrop = () => {
    if (!rawSrc) return
    setBusy(true)
    void cropPhotoToSquare(rawSrc, crop).then((result) => {
      setBusy(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      onCapture(result.dataUrl)
    })
  }

  const onCropPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, orig: crop }
  }

  const onCropPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const box = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - dragRef.current.startX) / box.width
    const dy = (e.clientY - dragRef.current.startY) / box.height
    const size = dragRef.current.orig.size
    setCrop({
      x: Math.min(1 - size, Math.max(0, dragRef.current.orig.x + dx)),
      y: Math.min(1 - size, Math.max(0, dragRef.current.orig.y + dy)),
      size,
    })
  }

  const onCropPointerUp = () => {
    dragRef.current = null
  }

  return (
    <div className="aac-photo-capture" role="dialog" aria-modal="true" aria-label={title}>
      <div className="aac-photo-capture-sheet">
        <header className="aac-photo-capture-head">
          <h3>{phase === 'camera' ? title : 'Crop for the button'}</h3>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </header>

        {phase === 'camera' ? (
          <div className="aac-photo-camera">
            <video ref={videoRef} playsInline muted autoPlay className="aac-photo-video" />
            <div className="confirm-row">
              <button type="button" className="btn btn-primary" onClick={snapFromVideo}>
                Snap
              </button>
              <label className="btn btn-ghost upload-btn">
                Choose photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
        ) : rawSrc ? (
          <div className="aac-photo-crop">
            <div
              className="aac-photo-crop-stage"
              onPointerDown={onCropPointerDown}
              onPointerMove={onCropPointerMove}
              onPointerUp={onCropPointerUp}
              onPointerCancel={onCropPointerUp}
            >
              <img src={rawSrc} alt="" draggable={false} />
              <div
                className="aac-photo-crop-frame"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.size * 100}%`,
                  height: `${crop.size * 100}%`,
                }}
              />
            </div>
            <p className="fine-print">Drag the square to frame Grandma, the sippy cup, or the toy.</p>
            <label className="field-label">
              Zoom
              <input
                type="range"
                min={0.35}
                max={1}
                step={0.01}
                value={crop.size}
                onChange={(e) => {
                  const size = Number(e.target.value)
                  setCrop((c) => ({
                    size,
                    x: Math.min(1 - size, c.x),
                    y: Math.min(1 - size, c.y),
                  }))
                }}
              />
            </label>
            <div className="confirm-row">
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={confirmCrop}
              >
                {busy ? 'Saving…' : 'Use photo'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setPhase('camera')
                  setRawSrc(null)
                }}
              >
                Retake
              </button>
            </div>
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}
      </div>
    </div>
  )
}
