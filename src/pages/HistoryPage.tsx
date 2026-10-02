import { useMemo, useState } from 'react'
import { ActionSheet, ConfirmDialog } from '../components/Modal'
import { Segmented } from '../components/Segmented'
import { TransactionItem } from '../components/TransactionItem'
import { useStore } from '../hooks/useStore'
import type { Transaction, TxFilter } from '../types'
import { summarize } from '../utils/aggregate'
import { currentMonth, dayLabel, monthLabel, monthOf } from '../utils/date'
import { yen } from '../utils/format'

export function HistoryPage({ onEdit }: { onEdit: (tx: Transaction) => void }) {
  const { transactions, categories, removeTx } = useStore()
  const [filter, setFilter] = useState<TxFilter>({
    month: currentMonth(), category: 'all', type: 'all', query: '',
  })
  const [picked, setPicked] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const set = (patch: Partial<TxFilter>) => setFilter((f) => ({ ...f, ...patch }))

  const months = useMemo(() => {
    const s = new Set(transactions.map((t) => monthOf(t.date)))
    s.add(currentMonth())
    return [...s].sort().reverse()
  }, [transactions])

  const categoryOptions = useMemo(() => {
    const names = new Set(categories.filter((c) => filter.type === 'all' || c.type === filter.type).map((c) => c.name))
    // 削除済みカテゴリの取引も絞り込めるように
    for (const t of transactions) if (filter.type === 'all' || t.type === filter.type) names.add(t.category)
    return [...names]
  }, [categories, transactions, filter.type])

  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase()
    return transactions
      .filter((t) =>
        (filter.month === 'all' || monthOf(t.date) === filter.month) &&
        (filter.type === 'all' || t.type === filter.type) &&
        (filter.category === 'all' || t.category === filter.category) &&
        (!q || t.memo.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  }, [transactions, filter])

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of filtered) map.set(t.date, [...(map.get(t.date) ?? []), t])
    return [...map.entries()]
  }, [filtered])

  const sum = summarize(filtered)

  return (
    <div className="page">
      <header className="large-title"><h1>履歴</h1></header>

      <input className="search" type="search" placeholder="メモ・カテゴリを検索"
        value={filter.query} onChange={(e) => set({ query: e.target.value })} />

      <Segmented<TxFilter['type']>
        value={filter.type}
        onChange={(type) => set({ type, category: 'all' })}
        options={[{ value: 'all', label: 'すべて' }, { value: 'expense', label: '支出' }, { value: 'income', label: '収入' }]}
      />

      <div className="filters">
        <label className="select">
          <select value={filter.month} onChange={(e) => set({ month: e.target.value })} aria-label="月">
            <option value="all">すべての月</option>
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </label>
        <label className="select">
          <select value={filter.category} onChange={(e) => set({ category: e.target.value })} aria-label="カテゴリ">
            <option value="all">すべてのカテゴリ</option>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <div className="summary-line">
        <span>{filtered.length}件</span>
        <span><b className="income">+{yen(sum.income)}</b>　<b className="expense">-{yen(sum.expense)}</b></span>
      </div>

      {groups.length === 0 && <div className="group"><p className="empty">該当する取引がありません</p></div>}
      {groups.map(([date, txs]) => (
        <section key={date}>
          <h3 className="day-head">{dayLabel(date)}</h3>
          <div className="group">
            {txs.map((t) => <TransactionItem key={t.id} tx={t} onClick={() => setPicked(t)} />)}
          </div>
        </section>
      ))}

      {picked && (
        <ActionSheet
          title={`${picked.category}  ${yen(picked.amount)}`}
          onClose={() => setPicked(null)}
          actions={[
            { label: '編集', onClick: () => onEdit(picked) },
            { label: '削除', danger: true, onClick: () => setDeleting(picked) },
          ]}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="この取引を削除しますか？"
          message={`${deleting.date}  ${deleting.category}  ${yen(deleting.amount)}`}
          confirmLabel="削除"
          onCancel={() => setDeleting(null)}
          onConfirm={() => { removeTx(deleting.id); setDeleting(null) }}
        />
      )}
    </div>
  )
}
