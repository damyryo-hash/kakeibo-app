import { useMemo, useState } from 'react'
import { ActionSheet, ConfirmDialog } from '../components/Modal'
import { TransactionItem } from '../components/TransactionItem'
import { useStore } from '../hooks/useStore'
import type { Transaction, TxType } from '../types'
import { summarize } from '../utils/aggregate'
import { currentMonth, monthLabel, monthOf } from '../utils/date'
import { yen } from '../utils/format'

interface Props {
  onAdd: (type: TxType) => void
  onEdit: (tx: Transaction) => void
  onShowHistory: () => void
}

export function HomePage({ onAdd, onEdit, onShowHistory }: Props) {
  const { transactions, hasSamples, removeSamples, removeTx } = useStore()
  const month = currentMonth()
  const [picked, setPicked] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [confirmSamples, setConfirmSamples] = useState(false)

  const monthTxs = useMemo(() => transactions.filter((t) => monthOf(t.date) === month), [transactions, month])
  const { income, expense, balance } = summarize(monthTxs)
  const recent = useMemo(
    () => [...monthTxs].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 5),
    [monthTxs],
  )

  return (
    <div className="page">
      <header className="large-title">
        <p className="eyebrow">{monthLabel(month)}</p>
        <h1>今月の残額</h1>
        <p className={`hero-amount ${balance < 0 ? 'negative' : ''}`}>{yen(balance)}</p>
      </header>

      <div className="cards">
        <div className="card stat">
          <span className="stat-label">今月の収入</span>
          <span className="stat-value income">{yen(income)}</span>
        </div>
        <div className="card stat">
          <span className="stat-label">今月の支出</span>
          <span className="stat-value expense">{yen(expense)}</span>
        </div>
        <div className="card stat wide">
          <span className="stat-label">今月の残額</span>
          <span className={`stat-value ${balance < 0 ? 'expense' : ''}`}>{yen(balance)}</span>
        </div>
      </div>

      <div className="big-btns">
        <button className="big-btn expense" onClick={() => onAdd('expense')}>支出を追加</button>
        <button className="big-btn income" onClick={() => onAdd('income')}>収入を追加</button>
      </div>

      <div className="section-head">
        <h2>最近の取引</h2>
        <button className="link" onClick={onShowHistory}>すべて見る</button>
      </div>
      <div className="group">
        {recent.length === 0 && <p className="empty">今月の取引はまだありません</p>}
        {recent.map((t) => <TransactionItem key={t.id} tx={t} showDate onClick={() => setPicked(t)} />)}
      </div>

      {hasSamples && (
        <div className="notice">
          <span>サンプルデータが入っています</span>
          <button className="link danger" onClick={() => setConfirmSamples(true)}>削除</button>
        </div>
      )}

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
          message={`${deleting.category}  ${yen(deleting.amount)}`}
          confirmLabel="削除"
          onCancel={() => setDeleting(null)}
          onConfirm={() => { removeTx(deleting.id); setDeleting(null) }}
        />
      )}
      {confirmSamples && (
        <ConfirmDialog
          title="サンプルデータを削除"
          message="サンプルとして入っている取引だけを削除します。自分で入力したデータは残ります。"
          confirmLabel="削除"
          onCancel={() => setConfirmSamples(false)}
          onConfirm={() => { removeSamples(); setConfirmSamples(false) }}
        />
      )}
    </div>
  )
}
