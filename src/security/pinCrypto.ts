/** Parent PIN hashing via Web Crypto (PBKDF2). Never store plaintext PINs. */

/** New hashes use this; older hashes keep their stored iteration count. */
export const PIN_ITERATIONS_CURRENT = 210_000
const LEGACY_ITERATIONS = 120_000
const KEY_BITS = 256

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

function randomSaltHex(bytes = 16): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return toHex(buf.buffer)
}

async function deriveKey(
  pin: string,
  saltHex: string,
  iterations: number,
): Promise<string> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromHex(saltHex) as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    KEY_BITS,
  )
  return toHex(bits)
}

export type PinSecrets = {
  pinHash: string
  pinSalt: string
  pinIsDefault: boolean
  /** PBKDF2 iterations used for this hash */
  pinIterations: number
}

export async function hashPin(pin: string, isDefault = false): Promise<PinSecrets> {
  const pinSalt = randomSaltHex()
  const pinIterations = PIN_ITERATIONS_CURRENT
  const pinHash = await deriveKey(pin, pinSalt, pinIterations)
  return { pinHash, pinSalt, pinIsDefault: isDefault, pinIterations }
}

export async function verifyPin(
  pin: string,
  secrets: { pinHash: string; pinSalt: string; pinIterations?: number },
): Promise<boolean> {
  if (!secrets.pinHash || !secrets.pinSalt) return false
  const iterations = secrets.pinIterations || LEGACY_ITERATIONS
  const attempt = await deriveKey(pin, secrets.pinSalt, iterations)
  if (attempt.length !== secrets.pinHash.length) return false
  // Constant-time-ish compare
  let diff = 0
  for (let i = 0; i < attempt.length; i += 1) {
    diff |= attempt.charCodeAt(i) ^ secrets.pinHash.charCodeAt(i)
  }
  return diff === 0
}

/** Derive an AES-GCM CryptoKey from PIN for backup encryption. */
export async function deriveBackupKey(
  pin: string,
  saltHex: string,
  iterations = PIN_ITERATIONS_CURRENT,
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, [
    'deriveKey',
  ])
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromHex(saltHex) as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

export function base64ToBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export { toHex, fromHex, randomSaltHex }
