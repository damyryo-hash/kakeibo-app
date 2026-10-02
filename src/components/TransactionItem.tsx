import type { Transaction } from '../types'
import { signedYen } from '../utils/format'

export function TransactionItem({ tx, showDate, onClick }: {
  tx: Transaction
  showDate?: boolean
  onClick?: () => void
}) {
  const [, m, d] = tx.date.split('-')
  return (
    <button className="tx" onClick={onClick}>
      <span className={`tx-badge ${tx.type}`}>{tx.type === 'income' ? '収' : '支'}</span>
      <span className="tx-main">
        <span className="tx-cat">{tx.category}</span>
        <span className="tx-sub">
          {showDate && `${Number(m)}/${Number(d)}`}
          {showDate && tx.memo && ' ・ '}
          {tx.memo}
        </span>
      </span>
      <span className={`tx-amount ${tx.type}`}>{signedYen(tx.type, tx.amount)}</span>
    </button>
  )
}
