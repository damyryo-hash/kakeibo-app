import { useState } from 'react'
import { Sheet } from './Modal'

/** カテゴリー名の入力シート（追加・名前変更の共通UI） */
export function CategoryNameSheet({ title, initial = '', existing, onClose, onSave }: {
  title: string
  initial?: string
  /** 同じ種別の既存名（重複チェック用） */
  existing: string[]
  onClose: () => void
  onSave: (name: string) => void | Promise<void>
}) {
  const [name, setName] = useState(initial)
  const trimmed = name.trim()
  const dup = existing.includes(trimmed)
  return (
    <Sheet title={title} onClose={onClose}
      footer={<button className="primary-btn" disabled={!trimmed || dup} onClick={() => onSave(trimmed)}>保存</button>}>
      <input className="text-input" value={name} autoFocus maxLength={20} placeholder="例：ガソリン代"
        onChange={(e) => setName(e.target.value)} />
      {dup && <p className="footnote danger">同じ名前のカテゴリーがすでにあります</p>}
    </Sheet>
  )
}
