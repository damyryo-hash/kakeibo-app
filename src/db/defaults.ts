import type { TxInput, TxType } from '../types'
import { toDateStr } from '../utils/date'

export const DEFAULT_CATEGORIES: Record<TxType, string[]> = {
  expense: [
    '食費', 'コンビニ', '外食', '交通費', '車', '娯楽', '音楽',
    '衣服', '美容', '医療', 'サブスク', '日用品', '交際費', 'その他',
  ],
  income: ['給料', '音楽', 'MIX', 'ライブ', '副業', 'その他'],
}

/** 開発確認用サンプル（今月・先月の日付で生成） */
export function makeSamples(now = new Date()): TxInput[] {
  // 今月分は「今日」より未来にならないよう日付を丸める
  const day = (monthOffset: number, d: number) =>
    toDateStr(new Date(now.getFullYear(), now.getMonth() + monthOffset, monthOffset === 0 ? Math.min(d, now.getDate()) : d))
  const s = (
    type: TxType, amount: number, category: string, date: string, memo: string,
  ): TxInput => ({ type, amount, category, date, memo, isSample: true })
  return [
    s('income', 280000, '給料', day(0, 1), '今月分'),
    s('income', 15000, 'ライブ', day(0, 3), 'ライブ出演'),
    s('expense', 1280, '食費', day(0, 2), 'スーパー'),
    s('expense', 640, 'コンビニ', day(0, 3), '朝ごはん'),
    s('expense', 2400, '外食', day(0, 4), 'ランチ'),
    s('expense', 1100, '交通費', day(0, 4), '電車'),
    s('expense', 1480, 'サブスク', day(0, 5), '音楽配信'),
    s('expense', 5200, '日用品', day(0, 5), ''),
    s('income', 280000, '給料', day(-1, 1), '先月分'),
    s('expense', 32000, '食費', day(-1, 10), ''),
    s('expense', 12000, '交通費', day(-1, 12), ''),
    s('expense', 8000, 'サブスク', day(-1, 15), ''),
  ]
}
