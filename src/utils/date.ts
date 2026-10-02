const pad = (n: number) => String(n).padStart(2, '0')

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const todayStr = () => toDateStr(new Date())

/** 'YYYY-MM-DD' -> 'YYYY-MM' */
export const monthOf = (date: string) => date.slice(0, 7)

export const currentMonth = () => monthOf(todayStr())

export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  return `${y}年${Number(m)}月`
}

export function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

const WEEK = ['日', '月', '火', '水', '木', '金', '土']

/** '2026-10-02' -> '10月2日（金）' */
export function dayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const w = WEEK[new Date(y, m - 1, d).getDay()]
  return `${m}月${d}日（${w}）`
}

/** 'YYYY-MM-DD' または 'YYYY/M/D' を正規化。不正なら null */
export function normalizeDate(s: string): string | null {
  const m = s.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const dt = new Date(y, mo - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null
  return `${y}-${pad(mo)}-${pad(d)}`
}
