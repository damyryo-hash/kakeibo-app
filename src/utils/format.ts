/** 3桁区切りの円表記（例: ¥12,500 / -¥300） */
export function yen(n: number): string {
  const abs = Math.abs(Math.round(n)).toLocaleString('ja-JP')
  return `${n < 0 ? '-' : ''}¥${abs}`
}

/** 符号付き（収入 +、支出 -） */
export function signedYen(type: 'income' | 'expense', amount: number): string {
  return `${type === 'income' ? '+' : '-'}${yen(amount)}`
}

/** 入力文字列を整数の円に。数字以外は無視（全角数字も可） */
export function parseAmount(input: string): number {
  const half = input.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
  const digits = half.replace(/[^0-9]/g, '')
  if (!digits) return 0
  return Math.min(parseInt(digits, 10), 999_999_999)
}
