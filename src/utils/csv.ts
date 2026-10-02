import type { Transaction, TxInput } from '../types'
import { normalizeDate } from './date'

export const CSV_HEADER = ['type', 'amount', 'category', 'date', 'memo']

const escape = (s: string) => (/[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)

/** UTF-8 BOM + CRLF（Excel/Numbersで文字化けしにくい形式） */
export function toCsv(txs: Transaction[]): string {
  const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
  const rows = sorted.map((t) =>
    [t.type, String(t.amount), t.category, t.date, t.memo].map(escape).join(','),
  )
  return '﻿' + [CSV_HEADER.join(','), ...rows].join('\r\n') + '\r\n'
}

/** RFC4180 風の簡易パーサ（引用符・改行入りセルに対応） */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++ } else quoted = false
      } else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell); cell = ''
      rows.push(row); row = []
    } else cell += ch
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

export interface ImportResult {
  items: TxInput[]
  errors: string[]
}

function parseType(s: string): 'income' | 'expense' | null {
  const v = s.trim().toLowerCase()
  if (v === 'income' || v === '収入') return 'income'
  if (v === 'expense' || v === '支出') return 'expense'
  return null
}

export function csvToInputs(text: string): ImportResult {
  const rows = parseCsv(text)
  const errors: string[] = []
  const items: TxInput[] = []
  if (!rows.length) return { items, errors: ['データがありません'] }

  const head = rows[0].map((h) => h.trim().toLowerCase())
  const idx = Object.fromEntries(CSV_HEADER.map((k) => [k, head.indexOf(k)])) as Record<string, number>
  if (idx.type < 0 || idx.amount < 0 || idx.category < 0 || idx.date < 0) {
    return { items, errors: ['ヘッダー行が正しくありません（type,amount,category,date,memo）'] }
  }

  rows.slice(1).forEach((r, i) => {
    const line = i + 2
    const type = parseType(r[idx.type] ?? '')
    const amount = Number((r[idx.amount] ?? '').replace(/[,¥円\s]/g, ''))
    const date = normalizeDate(r[idx.date] ?? '')
    const category = (r[idx.category] ?? '').trim()
    if (!type) return errors.push(`${line}行目: typeが不正です`)
    if (!Number.isInteger(amount) || amount <= 0) return errors.push(`${line}行目: 金額が不正です`)
    if (!date) return errors.push(`${line}行目: 日付が不正です`)
    if (!category) return errors.push(`${line}行目: カテゴリが空です`)
    items.push({ type, amount, category, date, memo: idx.memo >= 0 ? (r[idx.memo] ?? '') : '' })
  })
  return { items, errors }
}

/** UTF-8 を優先し、失敗したら Shift_JIS として読む */
export async function readCsvFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    return new TextDecoder('shift_jis').decode(buf)
  }
}

/** 共有シート（iPhone）が使えれば共有、なければダウンロード */
export async function saveCsv(csv: string, filename: string): Promise<void> {
  const file = new File([csv], filename, { type: 'text/csv' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
