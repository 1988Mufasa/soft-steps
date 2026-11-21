/** Resize / compress photos before storing as data URLs (protects localStorage). */

export const MAX_PHOTO_EDGE = 1280
export const MAX_PHOTO_BYTES = 450_000
export const JPEG_QUALITY = 0.72

export type PhotoReadResult =
  | { ok: true; dataUrl: string }
  | { ok: false; error: string }

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
  } catch {
    return { ok: false, error: 'Could not read that photo.' }
  }
}
