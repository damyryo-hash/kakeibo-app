import type { Transaction } from '../types'
import { monthOf, shiftMonth } from './date'

export interface Summary {
  income: number
  expense: number
  balance: number
}

export function summarize(txs: Transaction[]): Summary {
  let income = 0
  let expense = 0
  for (const t of txs) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense, balance: income - expense }
}

export interface CategoryTotal {
  category: string
  amount: number
  ratio: number // 0-1
}

/** 支出のカテゴリ別合計（金額の多い順） */
export function expenseByCategory(txs: Transaction[]): CategoryTotal[] {
  const map = new Map<string, number>()
  let total = 0
  for (const t of txs) {
    if (t.type !== 'expense') continue
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
    total += t.amount
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount, ratio: total ? amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount)
}

export interface MonthTotal {
  month: string
  expense: number
}

/** endMonth を末尾とする直近 count か月の支出合計 */
export function monthlyExpense(txs: Transaction[], endMonth: string, count: number): MonthTotal[] {
  const months = Array.from({ length: count }, (_, i) => shiftMonth(endMonth, i - (count - 1)))
  const map = new Map(months.map((m) => [m, 0]))
  for (const t of txs) {
    if (t.type !== 'expense') continue
    const m = monthOf(t.date)
    if (map.has(m)) map.set(m, map.get(m)! + t.amount)
  }
  return months.map((month) => ({ month, expense: map.get(month)! }))
}

/** カテゴリ順位に応じたグラフ色（iOSのシステムカラー系） */
export const CHART_COLORS = [
  '#0a84ff', '#30d158', '#ff9f0a', '#ff453a', '#bf5af2',
  '#64d2ff', '#ffd60a', '#ff6482', '#5e5ce6', '#66d4cf',
  '#ac8e68', '#8e8e93',
]
export const chartColor = (i: number) => CHART_COLORS[i % CHART_COLORS.length]
