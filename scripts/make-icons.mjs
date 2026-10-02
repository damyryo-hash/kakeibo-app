// 依存なしでアイコンPNGを生成するスクリプト（npm run icons）
import { deflateSync, crc32 } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

function png(size, glyphScale) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  const c = size / 2
  const s = (size * glyphScale) / 100 // 100単位の座標系 -> px（1単位あたりのpx）
  const segs = [
    // ¥ の形
    [[-24, -34], [0, 0]],
    [[24, -34], [0, 0]],
    [[0, 0], [0, 36]],
    [[-18, 6], [18, 6]],
    [[-18, 20], [18, 20]],
  ]
  const half = 5.5 * s
  const dist = (px, py, [a, b]) => {
    const ax = c + a[0] * s, ay = c + a[1] * s
    const bx = c + b[0] * s, by = c + b[1] * s
    const dx = bx - ax, dy = by - ay
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
  }
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    for (let x = 0; x < size; x++) {
      const k = y * (size * 4 + 1) + 1 + x * 4
      const t = (x + y) / (size * 2)
      let r = 10 + (52 - 10) * t, g = 132 + (199 - 132) * t, b = 255 + (89 - 255) * t
      let d = Infinity
      for (const sg of segs) d = Math.min(d, dist(x + 0.5, y + 0.5, sg))
      const a = Math.max(0, Math.min(1, half - d + 0.5))
      r = r + (255 - r) * a; g = g + (255 - g) * a; b = b + (255 - b) * a
      raw[k] = r; raw[k + 1] = g; raw[k + 2] = b; raw[k + 3] = 255
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0)
    return Buffer.concat([len, body, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', png(192, 0.95))
writeFileSync('public/icons/icon-512.png', png(512, 0.95))
writeFileSync('public/icons/icon-maskable-512.png', png(512, 0.7))
writeFileSync('public/icons/apple-touch-icon.png', png(180, 0.95))
console.log('icons generated')

