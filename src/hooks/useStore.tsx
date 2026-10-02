import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { repository as repo } from '../db'
import type { Category, Transaction, TxInput, TxType } from '../types'

export interface ImportSummary {
  added: number
  skipped: number
}

interface Store {
  ready: boolean
  transactions: Transaction[]
  categories: Category[]
  hasSamples: boolean
  categoryNames: (type: TxType) => string[]
  addTx: (input: TxInput) => Promise<void>
  updateTx: (id: string, input: TxInput) => Promise<void>
  removeTx: (id: string) => Promise<void>
  importTxs: (inputs: TxInput[]) => Promise<ImportSummary>
  removeSamples: () => Promise<void>
  addCategory: (type: TxType, name: string) => Promise<void>
  renameCategory: (id: string, name: string) => Promise<void>
  removeCategory: (id: string) => Promise<void>
  resetAll: () => Promise<void>
}

const Ctx = createContext<Store | null>(null)

const txKey = (t: Pick<Transaction, 'type' | 'amount' | 'category' | 'date' | 'memo'>) =>
  [t.type, t.amount, t.category, t.date, t.memo].join('\u0000')

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const reload = useCallback(async () => {
    const [t, c] = await Promise.all([repo.listTransactions(), repo.listCategories()])
    setTransactions(t)
    setCategories(c)
  }, [])

  useEffect(() => {
    repo.init().then(reload).then(() => setReady(true))
  }, [reload])

  const store = useMemo<Store>(() => {
    const run = <A extends unknown[]>(fn: (...a: A) => Promise<unknown>) =>
      async (...a: A) => {
        await fn(...a)
        await reload()
      }
    return {
      ready,
      transactions,
      categories,
      hasSamples: transactions.some((t) => t.isSample),
      categoryNames: (type) => categories.filter((c) => c.type === type).map((c) => c.name),
      addTx: run((input: TxInput) => repo.addTransaction(input)),
      updateTx: run((id: string, input: TxInput) => repo.updateTransaction(id, input)),
      removeTx: run((id: string) => repo.deleteTransaction(id)),
      removeSamples: run(() => repo.deleteSampleTransactions()),
      addCategory: run((type: TxType, name: string) => repo.addCategory(type, name)),
      renameCategory: run((id: string, name: string) => repo.renameCategory(id, name)),
      removeCategory: run((id: string) => repo.deleteCategory(id)),
      resetAll: run(() => repo.resetAll()),
      importTxs: async (inputs) => {
        // 同じ内容の取引は重複として取り込まない（再インポートしても二重にならない）
        const seen = new Set(transactions.map(txKey))
        const fresh: TxInput[] = []
        for (const t of inputs) {
          const k = txKey(t)
          if (seen.has(k)) continue
          seen.add(k)
          fresh.push(t)
        }
        // 未登録のカテゴリは自動で追加
        for (const type of ['expense', 'income'] as const) {
          const known = new Set(categories.filter((c) => c.type === type).map((c) => c.name))
          for (const name of new Set(fresh.filter((t) => t.type === type).map((t) => t.category))) {
            if (!known.has(name)) await repo.addCategory(type, name)
          }
        }
        if (fresh.length) await repo.addTransactions(fresh)
        await reload()
        return { added: fresh.length, skipped: inputs.length - fresh.length }
      },
    }
  }, [ready, transactions, categories, reload])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const v = useContext(Ctx)
  if (!v) throw new Error('StoreProvider がありません')
  return v
}
