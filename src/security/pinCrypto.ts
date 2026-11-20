/** Parent PIN hashing via Web Crypto (PBKDF2). Never store plaintext PINs. */

const ITERATIONS = 120_000
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

async function deriveKey(pin: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromHex(saltHex) as BufferSource,
      iterations: ITERATIONS,
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
}

export async function hashPin(pin: string, isDefault = false): Promise<PinSecrets> {
  const pinSalt = randomSaltHex()
  const pinHash = await deriveKey(pin, pinSalt)
  return { pinHash, pinSalt, pinIsDefault: isDefault }
}

export async function verifyPin(
  pin: string,
  secrets: { pinHash: string; pinSalt: string },
): Promise<boolean> {
  if (!secrets.pinHash || !secrets.pinSalt) return false
  const attempt = await deriveKey(pin, secrets.pinSalt)
  if (attempt.length !== secrets.pinHash.length) return false
  // Constant-time-ish compare
  let diff = 0
  for (let i = 0; i < attempt.length; i += 1) {
    diff |= attempt.charCodeAt(i) ^ secrets.pinHash.charCodeAt(i)
  }
  return diff === 0
}
