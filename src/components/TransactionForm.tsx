import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import { TYPE_LABEL, type Transaction, type TxType } from '../types'
import { CategoryNameSheet } from './CategoryNameSheet'
import { todayStr } from '../utils/date'
import { parseAmount } from '../utils/format'
import { Sheet } from './Modal'
import { Segmented } from './Segmented'

export interface FormTarget {
  /** 編集対象。なければ新規 */
  tx?: Transaction
  /** 新規時の初期種別 */
  type?: TxType
}

export function TransactionForm({ target, onClose }: { target: FormTarget; onClose: () => void }) {
  const { categoryNames, addTx, updateTx, addCategory } = useStore()
  const [adding, setAdding] = useState(false)
  const editing = target.tx
  const [type, setType] = useState<TxType>(editing?.type ?? target.type ?? 'expense')
  const [amountText, setAmountText] = useState(editing ? editing.amount.toLocaleString('ja-JP') : '')
  const [category, setCategory] = useState(editing?.category ?? '')
  const [date, setDate] = useState(editing?.date ?? todayStr())
  const [memo, setMemo] = useState(editing?.memo ?? '')
  const [saving, setSaving] = useState(false)

  const amount = parseAmount(amountText)
  const names = categoryNames(type)
  // 削除済みカテゴリの取引を編集するときも、元のカテゴリを選択肢に残す
  const options = editing && editing.type === type && !names.includes(editing.category)
    ? [...names, editing.category]
    : names
  const selected = options.includes(category) ? category : (options[0] ?? '')
  const canSave = amount > 0 && !!selected && !!date && !saving

  const save = async () => {
    if (!canSave) return
    setSaving(true)
    const input = { type, amount, category: selected, date, memo: memo.trim(), isSample: undefined }
    if (editing) await updateTx(editing.id, input)
    else await addTx(input)
    onClose()
  }

  return (
    <>
    <Sheet
      title={editing ? '取引を編集' : type === 'expense' ? '支出を追加' : '収入を追加'}
      onClose={onClose}
      footer={<button className={`primary-btn ${type}`} disabled={!canSave} onClick={save}>保存</button>}
    >
      <div className="amount-box">
        <span className="amount-yen">¥</span>
        <input
          className={`amount-input ${type}`}
          inputMode="numeric"
          placeholder="0"
          value={amountText}
          autoFocus={!editing}
          onChange={(e) => {
            const n = parseAmount(e.target.value)
            setAmountText(n ? n.toLocaleString('ja-JP') : '')
          }}
          aria-label="金額"
        />
      </div>

      <Segmented<TxType>
        value={type}
        onChange={setType}
        options={[{ value: 'expense', label: '支出' }, { value: 'income', label: '収入' }]}
      />

      <div className="field-label">カテゴリ</div>
      <div className="chips">
        {options.map((c) => (
          <button key={c} className={`chip ${selected === c ? 'on ' + type : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
        <button className="chip add" onClick={() => setAdding(true)}>＋カテゴリーを追加</button>
      </div>

      <div className="group">
        <label className="row">
          <span>日付</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="row">
          <span>メモ</span>
          <input type="text" className="memo-input" value={memo} placeholder="任意"
            onChange={(e) => setMemo(e.target.value)} maxLength={100} />
        </label>
      </div>
    </Sheet>
      {adding && (
        <CategoryNameSheet
          title={`${TYPE_LABEL[type]}カテゴリーを追加`}
          existing={options}
          onClose={() => setAdding(false)}
          onSave={async (name) => {
            await addCategory(type, name)
            setCategory(name) // 追加したカテゴリーをそのまま選択
            setAdding(false)
          }}
        />
      )}
    </>
  )
}
