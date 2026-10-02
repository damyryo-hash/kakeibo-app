export type TxType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TxType
  /** 整数の円 */
  amount: number
  /** カテゴリ名 */
  category: string
  /** YYYY-MM-DD（端末のローカル日付） */
  date: string
  memo: string
  createdAt: number
  updatedAt: number
  /** サンプルデータの印（一括削除用） */
  isSample?: boolean
}

export type TxInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>

export interface Category {
  id: string
  type: TxType
  name: string
  order: number
}

export type TxFilter = {
  month: string // 'YYYY-MM' または 'all'
  category: string // 'all' または カテゴリ名
  type: 'all' | TxType
  query: string
}

export const TYPE_LABEL: Record<TxType, string> = { income: '収入', expense: '支出' }
