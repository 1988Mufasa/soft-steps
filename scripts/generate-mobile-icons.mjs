/**
 * Generate simple PNG app icons for PWA + Capacitor without external image tools.
 * Soft awareness-blue square with two light circles (matches Soft Steps mark).
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i]
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1
    }
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  const crc = crc32(Buffer.concat([typeBuf, data]))
  crcBuf.writeUInt32BE(crc)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function rgba(r, g, b, a = 255) {
  return [r, g, b, a]
}

function writePng(size, outPath) {
  const bg = rgba(54, 97, 176)
  const light = rgba(255, 255, 255)
  const mid = rgba(116, 184, 210)
  const pixels = Buffer.alloc(size * size * 4)

  const set = (x, y, color) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    const i = (y * size + x) * 4
    pixels[i] = color[0]
    pixels[i + 1] = color[1]
    pixels[i + 2] = color[2]
    pixels[i + 3] = color[3]
  }

  const inCircle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2
  const radius = size * 0.18
  const smileY = size * 0.66
  const smileR = size * 0.28

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      // rounded square mask
      const m = size * 0.12
      const inRound =
        (x >= m && x < size - m) ||
        (y >= m && y < size - m) ||
        inCircle(x, y, m, m, m) ||
        inCircle(x, y, size - 1 - m, m, m) ||
        inCircle(x, y, m, size - 1 - m, m) ||
        inCircle(x, y, size - 1 - m, size - 1 - m, m)

      if (!inRound) {
        set(x, y, rgba(0, 0, 0, 0))
        continue
      }
      set(x, y, bg)
      if (inCircle(x, y, size * 0.34, size * 0.42, radius)) set(x, y, light)
      if (inCircle(x, y, size * 0.66, size * 0.42, radius)) set(x, y, mid)
      // soft smile arc
      if (
        y > smileY &&
        y < smileY + size * 0.08 &&
        Math.abs(Math.hypot(x - size / 2, y - smileY) - smileR) < size * 0.035 &&
        x > size * 0.28 &&
        x < size * 0.72
      ) {
        set(x, y, light)
      }
    }
  }

  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, png)
}

const targets = [
  join(root, 'public/icons/icon-192.png'),
  join(root, 'public/icons/icon-512.png'),
  join(root, 'resources/icon.png'),
  join(root, 'resources/splash.png'),
]

writePng(192, targets[0])
writePng(512, targets[1])
writePng(1024, targets[2])
writePng(1280, targets[3])

console.log('Wrote mobile icons:', targets.join(', '))
