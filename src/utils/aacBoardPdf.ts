import {
  coreButtonsInViewport,
  fringeCategories,
  buttonsForCategory,
  type AacLibrary,
} from '../data/aacPresets'

/** Open a printable low-tech AAC board backup in a new window. */
export function printAacBoard(library: AacLibrary) {
  const core = coreButtonsInViewport(library).filter((b) => !b.masked)
  const folders = fringeCategories(library)
  const rows = [
    '<h1>Soft Steps — Talk board (low-tech backup)</h1>',
    `<p>Printed ${new Date().toLocaleString()} · Mulberry Symbols © Steve Lee (CC BY-SA 4.0) where used</p>`,
    '<h2>Core</h2>',
    '<div class="grid">',
    ...core.map(
      (b) =>
        `<div class="tile"><div class="emoji">${escapeHtml(b.emoji)}</div><div class="label">${escapeHtml(b.label)}</div></div>`,
    ),
    '</div>',
  ]
  for (const folder of folders) {
    const words = buttonsForCategory(library, folder.id)
    if (!words.length) continue
    rows.push(`<h2>${escapeHtml(folder.emoji)} ${escapeHtml(folder.title)}</h2>`)
    rows.push('<div class="grid">')
    for (const b of words) {
      rows.push(
        `<div class="tile"><div class="emoji">${escapeHtml(b.emoji)}</div><div class="label">${escapeHtml(b.label)}</div></div>`,
      )
    }
    rows.push('</div>')
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Soft Steps AAC Board</title>
  <style>
    body{font-family:system-ui,sans-serif;padding:16px;color:#111}
    h1{font-size:20px;margin:0 0 8px}
    h2{font-size:16px;margin:18px 0 8px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .tile{border:3px solid #333;border-radius:12px;padding:10px;text-align:center;min-height:72px}
    .emoji{font-size:28px}
    .label{font-weight:800;margin-top:4px}
    @media print{.tile{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>${rows.join('\n')}</body></html>`
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!w) return false
  w.document.write(html)
  w.document.close()
  w.focus()
  window.setTimeout(() => {
    w.print()
  }, 250)
  return true
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
