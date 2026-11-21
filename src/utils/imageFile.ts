/** Resize / compress photos before storing as data URLs (protects localStorage). */

export const MAX_PHOTO_EDGE = 1280
export const MAX_PHOTO_BYTES = 450_000
export const JPEG_QUALITY = 0.72
/** Square crop edge for AAC button icons */
export const AAC_CROP_EDGE = 512

export type PhotoReadResult =
  | { ok: true; dataUrl: string }
  | { ok: false; error: string }

/** Normalized crop rectangle (0–1 fractions of the source image). */
export type CropNorm = { x: number; y: number; size: number }

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read image'))
    img.src = src
  })
}

function compressCanvas(canvas: HTMLCanvasElement): PhotoReadResult {
  let quality = JPEG_QUALITY
  let dataUrl = canvas.toDataURL('image/jpeg', quality)
  while (dataUrl.length > MAX_PHOTO_BYTES && quality > 0.4) {
    quality -= 0.08
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }
  if (dataUrl.length > MAX_PHOTO_BYTES) {
    return { ok: false, error: 'Photo is still too big after shrink. Try another.' }
  }
  return { ok: true, dataUrl }
}

/**
 * Read an image file into a resized JPEG/PNG data URL under size budget.
 * Rejects non-images and very large originals before decode when possible.
 */
export async function readPhotoAsDataUrl(file: File): Promise<PhotoReadResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Please choose a photo (image file).' }
  }
  // Soft pre-check — we still compress, but refuse multi‑MB monsters early
  if (file.size > 12 * 1024 * 1024) {
    return { ok: false, error: 'Photo is too large. Try a smaller picture.' }
  }

  try {
    const img = await loadImage(file)
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return { ok: false, error: 'Could not process photo on this device.' }
    ctx.drawImage(img, 0, 0, w, h)
    return compressCanvas(canvas)
  } catch {
    return { ok: false, error: 'Could not read that photo.' }
  }
}

/**
 * Crop a square region from a data URL / blob URL and compress for AAC buttons.
 * `crop` uses normalized coords (x,y,size as fractions of the shorter edge for size,
 * and of width/height for x/y).
 */
export async function cropPhotoToSquare(
  src: string,
  crop: CropNorm = { x: 0, y: 0, size: 1 },
  edge = AAC_CROP_EDGE,
): Promise<PhotoReadResult> {
  try {
    const img = await loadImageFromUrl(src)
    const minSide = Math.min(img.width, img.height)
    const sizePx = Math.max(1, Math.round(minSide * Math.min(1, Math.max(0.05, crop.size))))
    const maxX = Math.max(0, img.width - sizePx)
    const maxY = Math.max(0, img.height - sizePx)
    const sx = Math.min(maxX, Math.max(0, Math.round(crop.x * img.width)))
    const sy = Math.min(maxY, Math.max(0, Math.round(crop.y * img.height)))
    const canvas = document.createElement('canvas')
    canvas.width = edge
    canvas.height = edge
    const ctx = canvas.getContext('2d')
    if (!ctx) return { ok: false, error: 'Could not process photo on this device.' }
    ctx.drawImage(img, sx, sy, sizePx, sizePx, 0, 0, edge, edge)
    return compressCanvas(canvas)
  } catch {
    return { ok: false, error: 'Could not crop that photo.' }
  }
}

/** Center-square crop helper when the parent skips manual framing. */
export async function centerCropPhoto(src: string): Promise<PhotoReadResult> {
  try {
    const img = await loadImageFromUrl(src)
    const minSide = Math.min(img.width, img.height)
    const x = (img.width - minSide) / 2 / img.width
    const y = (img.height - minSide) / 2 / img.height
    return cropPhotoToSquare(src, { x, y, size: minSide / Math.min(img.width, img.height) })
  } catch {
    return { ok: false, error: 'Could not crop that photo.' }
  }
}
