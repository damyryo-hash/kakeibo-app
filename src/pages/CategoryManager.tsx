import { useState } from 'react'
import { CategoryNameSheet } from '../components/CategoryNameSheet'
import { ChevronLeft } from '../components/Icons'
import { ConfirmDialog } from '../components/Modal'
import { Segmented } from '../components/Segmented'
import { useStore } from '../hooks/useStore'
import type { Category, TxType } from '../types'

type Editing = { mode: 'add'; type: TxType } | { mode: 'rename'; cat: Category }

export function CategoryManager({ onBack }: { onBack: () => void }) {
  const { categories, transactions, addCategory, renameCategory, removeCategory, reorderCategories } = useStore()
  const [type, setType] = useState<TxType>('expense')
  const [editing, setEditing] = useState<Editing | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const list = categories.filter((c) => c.type === type)

  const usage = (c: Category) => transactions.filter((t) => t.type === c.type && t.category === c.name).length

  const move = (index: number, delta: -1 | 1) => {
    const ids = list.map((c) => c.id)
    const j = index + delta
    if (j < 0 || j >= ids.length) return
    ;[ids[index], ids[j]] = [ids[j], ids[index]]
    reorderCategories(ids)
  }

  const deletingCount = deleting ? usage(deleting) : 0

  return (
    <div className="page">
      <header className="nav-title">
        <button className="back" onClick={onBack}><ChevronLeft />設定</button>
        <h1>カテゴリー管理</h1>
      </header>

      <Segmented<TxType> value={type} onChange={setType}
        options={[{ value: 'income', label: '収入' }, { value: 'expense', label: '支出' }]} />

      <div className="group">
        {list.map((c, i) => (
          <div className="row" key={c.id}>
            <span className="reorder">
              <button aria-label={`${c.name}を上へ`} disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
              <button aria-label={`${c.name}を下へ`} disabled={i === list.length - 1} onClick={() => move(i, 1)}>▼</button>
            </span>
            <span className="cat-name">{c.name}</span>
            <span className="row-actions">
              <button className="link" onClick={() => setEditing({ mode: 'rename', cat: c })}>編集</button>
              <button className="link danger" onClick={() => setDeleting(c)}>削除</button>
            </span>
          </div>
        ))}
        {list.length === 0 && <p className="empty">カテゴリーがありません</p>}
      </div>
      <button className="plain-btn" onClick={() => setEditing({ mode: 'add', type })}>＋ カテゴリーを追加</button>
      <p className="footnote">
        ▲▼で並び順を変えられます（入力画面の表示順にも反映されます）。
        名前を変更すると、過去の取引のカテゴリー名も同じように変わります。
      </p>

      {editing && (
        <CategoryNameSheet
          title={editing.mode === 'add' ? 'カテゴリーを追加' : 'カテゴリー名を変更'}
          initial={editing.mode === 'rename' ? editing.cat.name : ''}
          existing={categories
            .filter((c) => c.type === (editing.mode === 'add' ? editing.type : editing.cat.type))
            .filter((c) => editing.mode === 'add' || c.id !== editing.cat.id)
            .map((c) => c.name)}
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
          message={deletingCount > 0
            ? `このカテゴリーは${deletingCount}件の取引で使われています。削除しても過去の取引は消えず、カテゴリー名もそのまま残ります（新しい入力の選択肢からだけ外れます）。`
            : 'このカテゴリーを選択肢から削除します。'}
          confirmLabel="削除"
          onCancel={() => setDeleting(null)}
          onConfirm={() => { removeCategory(deleting.id); setDeleting(null) }}
        />
      )}
    </div>
  )
}
