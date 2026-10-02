import { useState } from 'react'
import { ChevronLeft } from '../components/Icons'
import { ConfirmDialog, Sheet } from '../components/Modal'
import { Segmented } from '../components/Segmented'
import { useStore } from '../hooks/useStore'
import type { Category, TxType } from '../types'

type Editing = { mode: 'add'; type: TxType } | { mode: 'rename'; cat: Category }

export function CategoryManager({ onBack }: { onBack: () => void }) {
  const { categories, addCategory, renameCategory, removeCategory } = useStore()
  const [type, setType] = useState<TxType>('expense')
  const [editing, setEditing] = useState<Editing | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const list = categories.filter((c) => c.type === type)

  return (
    <div className="page">
      <header className="nav-title">
        <button className="back" onClick={onBack}><ChevronLeft />設定</button>
        <h1>カテゴリ管理</h1>
      </header>

      <Segmented<TxType> value={type} onChange={setType}
        options={[{ value: 'expense', label: '支出' }, { value: 'income', label: '収入' }]} />

      <div className="group">
        {list.map((c) => (
          <div className="row" key={c.id}>
            <span>{c.name}</span>
            <span className="row-actions">
              <button className="link" onClick={() => setEditing({ mode: 'rename', cat: c })}>名前変更</button>
              <button className="link danger" onClick={() => setDeleting(c)}>削除</button>
            </span>
          </div>
        ))}
        {list.length === 0 && <p className="empty">カテゴリがありません</p>}
      </div>
      <button className="plain-btn" onClick={() => setEditing({ mode: 'add', type })}>＋ カテゴリを追加</button>
      <p className="footnote">
        名前を変更すると、過去の取引のカテゴリ名も同じように変わります。
        カテゴリを削除しても、過去の取引はそのまま残ります。
      </p>

      {editing && (
        <NameSheet
          title={editing.mode === 'add' ? 'カテゴリを追加' : 'カテゴリ名を変更'}
          initial={editing.mode === 'rename' ? editing.cat.name : ''}
          existing={categories.filter((c) => c.type === (editing.mode === 'add' ? editing.type : editing.cat.type))
            .filter((c) => editing.mode === 'add' || c.id !== editing.cat.id).map((c) => c.name)}
          onClose={() => setEditing(null)}
          onSave={async (name) => {
            if (editing.mode === 'add') await addCategory(editing.type, name)
            else await renameCategory(editing.cat.id, name)
            setEditing(null)
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={`「${deleting.name}」を削除しますか？`}
          message="このカテゴリは選択肢から消えます。過去の取引は残ります。"
          confirmLabel="削除"
          onCancel={() => setDeleting(null)}
          onConfirm={() => { removeCategory(deleting.id); setDeleting(null) }}
        />
      )}
    </div>
  )
}

function NameSheet({ title, initial, existing, onClose, onSave }: {
  title: string
  initial: string
  existing: string[]
  onClose: () => void
  onSave: (name: string) => void
}) {
  const [name, setName] = useState(initial)
  const trimmed = name.trim()
  const dup = existing.includes(trimmed)
  return (
    <Sheet title={title} onClose={onClose}
      footer={<button className="primary-btn" disabled={!trimmed || dup} onClick={() => onSave(trimmed)}>保存</button>}>
      <input className="text-input" value={name} autoFocus maxLength={20} placeholder="カテゴリ名"
        onChange={(e) => setName(e.target.value)} />
      {dup && <p className="footnote danger">同じ名前のカテゴリがすでにあります</p>}
    </Sheet>
  )
}
