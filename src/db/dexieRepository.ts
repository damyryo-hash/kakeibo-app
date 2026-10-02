import Dexie, { type Table } from 'dexie'
import type { Category, Transaction, TxInput } from '../types'
import { DEFAULT_CATEGORIES, makeSamples } from './defaults'
import type { Repository } from './repository'

interface Meta {
  key: string
  value: unknown
}

class KakeiboDB extends Dexie {
  transactions!: Table<Transaction, string>
  categories!: Table<Category, string>
  meta!: Table<Meta, string>

  constructor() {
    super('kakeibo-app')
    this.version(1).stores({
      transactions: 'id, date, type, category',
      categories: 'id, type',
      meta: 'key',
    })
  }
}

const newId = () => crypto.randomUUID()

function defaultCategoryRows(): Category[] {
  return (['expense', 'income'] as const).flatMap((type) =>
    DEFAULT_CATEGORIES[type].map((name, order) => ({ id: newId(), type, name, order })),
  )
}

export class DexieRepository implements Repository {
  private db = new KakeiboDB()

  async init() {
    // 初回のみ実行（StrictModeの二重呼び出しでも重複しないようトランザクション内で判定）
    await this.db.transaction('rw', this.db.categories, this.db.transactions, this.db.meta, async () => {
      if (await this.db.meta.get('initialized')) return
      await this.db.categories.bulkAdd(defaultCategoryRows())
      const now = Date.now()
      await this.db.transactions.bulkAdd(
        makeSamples().map((t, i) => ({ ...t, id: newId(), createdAt: now + i, updatedAt: now + i })),
      )
      await this.db.meta.put({ key: 'initialized', value: true })
    })
  }

  listTransactions() {
    return this.db.transactions.orderBy('date').reverse().toArray()
  }

  async addTransaction(input: TxInput) {
    const now = Date.now()
    const tx: Transaction = { ...input, id: newId(), createdAt: now, updatedAt: now }
    await this.db.transactions.add(tx)
    return tx
  }

  async updateTransaction(id: string, input: TxInput) {
    // 編集したらサンプル扱いを外す
    await this.db.transactions.update(id, { ...input, isSample: undefined, updatedAt: Date.now() })
  }

  deleteTransaction(id: string) {
    return this.db.transactions.delete(id)
  }

  async addTransactions(inputs: TxInput[]) {
    const now = Date.now()
    await this.db.transactions.bulkAdd(
      inputs.map((t, i) => ({ ...t, id: newId(), createdAt: now + i, updatedAt: now + i })),
    )
    return inputs.length
  }

  async deleteSampleTransactions() {
    await this.db.transactions.filter((t) => t.isSample === true).delete()
  }

  async listCategories() {
    const all = await this.db.categories.toArray()
    return all.sort((a, b) => a.order - b.order)
  }

  async addCategory(type: Category['type'], name: string) {
    const same = await this.db.categories.where('type').equals(type).toArray()
    if (same.some((c) => c.name === name)) return
    const order = same.reduce((m, c) => Math.max(m, c.order), -1) + 1
    await this.db.categories.add({ id: newId(), type, name, order })
  }

  async renameCategory(id: string, name: string) {
    await this.db.transaction('rw', this.db.categories, this.db.transactions, async () => {
      const cat = await this.db.categories.get(id)
      if (!cat || cat.name === name) return
      const dup = await this.db.categories.where('type').equals(cat.type).filter((c) => c.name === name).count()
      if (dup) return
      await this.db.categories.update(id, { name })
      await this.db.transactions
        .where('type').equals(cat.type)
        .filter((t) => t.category === cat.name)
        .modify({ category: name })
    })
  }

  deleteCategory(id: string) {
    return this.db.categories.delete(id)
  }

  async resetAll() {
    await this.db.transaction('rw', this.db.categories, this.db.transactions, this.db.meta, async () => {
      await this.db.transactions.clear()
      await this.db.categories.clear()
      await this.db.categories.bulkAdd(defaultCategoryRows())
      await this.db.meta.put({ key: 'initialized', value: true }) // サンプルは再投入しない
    })
  }
}
