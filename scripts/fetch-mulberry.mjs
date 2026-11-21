#!/usr/bin/env node
/**
 * Fetch Mulberry Symbols (CC BY-SA 4.0) into public/symbols/mulberry.
 * Safe to re-run — refreshes SVGs + index from the official GitHub release.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'symbols', 'mulberry')
const tmp = path.join(root, '.tmp-mulberry')

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

console.log('Fetching Mulberry Symbols v3.6.1…')
fs.rmSync(tmp, { recursive: true, force: true })
fs.mkdirSync(tmp, { recursive: true })
execSync(
  'git clone --depth 1 --filter=blob:none --sparse https://github.com/mulberrysymbols/mulberry-symbols.git repo',
  { cwd: tmp, stdio: 'inherit' },
)
execSync('git sparse-checkout set EN', { cwd: path.join(tmp, 'repo'), stdio: 'inherit' })

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(path.dirname(outDir), { recursive: true })
fs.cpSync(path.join(tmp, 'repo', 'EN'), outDir, { recursive: true })
fs.copyFileSync(
  path.join(tmp, 'repo', 'LICENSE.txt'),
  path.join(root, 'public', 'symbols', 'MULBERRY-LICENSE.txt'),
)

const csvUrl =
  'https://github.com/mulberrysymbols/mulberry-symbols/releases/download/v3.6.1/symbol-info.csv'
const csv = await (await fetch(csvUrl)).text()
fs.writeFileSync(path.join(root, 'public', 'symbols', 'symbol-info.csv'), csv)

const files = new Set(fs.readdirSync(outDir).filter((f) => f.endsWith('.svg')))
const byFile = new Map()
for (const line of csv.split(/\r?\n/).slice(1)) {
  if (!line.trim()) continue
  const parts = []
  let cur = ''
  let inQ = false
  for (const c of line) {
    if (c === '"') {
      inQ = !inQ
      continue
    }
    if (c === ',' && !inQ) {
      parts.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  parts.push(cur)
  const stem = parts[5]
  if (!stem) continue
  const file = `${stem}.svg`
  if (!files.has(file)) continue
  byFile.set(file, {
    file,
    label: stem.replace(/_,_to$/, '').replace(/_/g, ' ').trim(),
    grammar: parts[2] || '',
    category: parts[6] || '',
    tags: (parts[4] || '').split(/\s+/).filter(Boolean),
    keys: [...new Set([norm(stem), norm(parts[5]), ...String(parts[4] || '').split(/\s+/).map(norm)].filter(Boolean))],
  })
}
for (const f of files) {
  if (byFile.has(f)) continue
  const stem = f.replace(/\.svg$/, '')
  byFile.set(f, {
    file: f,
    label: stem.replace(/_,_to$/, '').replace(/_/g, ' '),
    grammar: '',
    category: '',
    tags: [],
    keys: [norm(stem)],
  })
}
const list = [...byFile.values()].sort((a, b) => a.label.localeCompare(b.label))
const index = {
  source: 'Mulberry Symbols',
  version: '3.6.1',
  license: 'CC BY-SA 4.0',
  attribution:
    'Mulberry Symbols © Steve Lee — Creative Commons Attribution-ShareAlike 4.0',
  count: list.length,
  symbols: list,
}
fs.writeFileSync(
  path.join(root, 'public', 'symbols', 'mulberry-index.json'),
  JSON.stringify(index),
)

const byKey = {}
for (const s of list) {
  for (const k of s.keys) if (!byKey[k]) byKey[k] = s.file
}
const lookup = {
  attribution: index.attribution,
  version: index.version,
  byKey,
}
fs.writeFileSync(
  path.join(root, 'public', 'symbols', 'mulberry-lookup.json'),
  JSON.stringify(lookup),
)
fs.writeFileSync(path.join(root, 'src', 'data', 'mulberry-lookup.json'), JSON.stringify(lookup))

fs.rmSync(tmp, { recursive: true, force: true })
console.log(`Done — ${list.length} Mulberry SVGs in public/symbols/mulberry`)
