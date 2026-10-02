import type { Category, Transaction, TxInput } from '../types'

/**
 * 保存処理の窓口。UIはこのインターフェースだけを使うので、
 * 将来クラウド同期版（例: Firebase / Supabase）に差し替える場合は
 * この interface を実装した別クラスを db/index.ts で差し替えるだけで済みます。
 */
export interface Repository {
  /** 初回起動時のカテゴリ・サンプルデータ投入 */
  init(): Promise<void>

  listTransactions(): Promise<Transaction[]>
  addTransaction(input: TxInput): Promise<Transaction>
  updateTransaction(id: string, input: TxInput): Promise<void>
  deleteTransaction(id: string): Promise<void>
  /** 複数追加（CSVインポート用） */
  addTransactions(inputs: TxInput[]): Promise<number>
  deleteSampleTransactions(): Promise<void>

  listCategories(): Promise<Category[]>
  addCategory(type: Category['type'], name: string): Promise<void>
  /** 名前変更。同じ種別の既存取引のカテゴリ名も更新する */
  renameCategory(id: string, name: string): Promise<void>
  deleteCategory(id: string): Promise<void>

  /** 取引・カテゴリをすべて削除し、カテゴリは初期状態に戻す */
  resetAll(): Promise<void>
}
