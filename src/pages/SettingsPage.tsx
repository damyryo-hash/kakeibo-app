import { useRef, useState } from 'react'
import { ConfirmDialog, MessageDialog } from '../components/Modal'
import { Segmented } from '../components/Segmented'
import { useStore } from '../hooks/useStore'
import type { ThemePref } from '../hooks/useTheme'
import { csvToInputs, readCsvFile, saveCsv, toCsv } from '../utils/csv'
import { toDateStr } from '../utils/date'
import { CategoryManager } from './CategoryManager'

interface Props {
  theme: ThemePref
  onTheme: (t: ThemePref) => void
}

export function SettingsPage({ theme, onTheme }: Props) {
  const { transactions, hasSamples, importTxs, removeSamples, resetAll } = useStore()
  const [view, setView] = useState<'main' | 'categories'>('main')
  const [message, setMessage] = useState<{ title: string; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (view === 'categories') return <CategoryManager onBack={() => setView('main')} />

  const exportCsv = async () => {
    if (!transactions.length) return setMessage({ title: 'エクスポート', text: '書き出すデータがありません。' })
    await saveCsv(toCsv(transactions), `kakeibo-${toDateStr(new Date()).replace(/-/g, '')}.csv`)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const { items, errors } = csvToInputs(await readCsvFile(file))
      const { added, skipped } = await importTxs(items)
      const lines = [`${added}件を取り込みました。`]
      if (skipped) lines.push(`${skipped}件は同じ内容がすでにあるためスキップしました。`)
      if (errors.length) lines.push('', `読み込めない行が${errors.length}件ありました:`, ...errors.slice(0, 5))
      setMessage({ title: 'インポート完了', text: lines.join('\n') })
    } catch {
      setMessage({ title: 'インポート失敗', text: 'ファイルを読み込めませんでした。' })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="page">
      <header className="large-title"><h1>設定</h1></header>

      <div className="group-title">表示</div>
      <div className="group pad">
        <Segmented<ThemePref> value={theme} onChange={onTheme}
          options={[{ value: 'system', label: '自動' }, { value: 'light', label: 'ライト' }, { value: 'dark', label: 'ダーク' }]} />
      </div>

      <div className="group-title">データ</div>
      <div className="group">
        <button className="row tap" onClick={() => setView('categories')}>
          <span>カテゴリー管理</span><span className="chev">›</span>
        </button>
        <button className="row tap" onClick={exportCsv}>
          <span>CSVエクスポート</span><span className="chev">›</span>
        </button>
        <button className="row tap" onClick={() => fileRef.current?.click()}>
          <span>CSVインポート</span><span className="chev">›</span>
        </button>
        {hasSamples && (
          <button className="row tap" onClick={() => removeSamples()}>
            <span>サンプルデータを削除</span><span className="chev">›</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept=".csv,text/csv" hidden
        onChange={(e) => onFile(e.target.files?.[0])} />
      <p className="footnote">
        データはこの端末のブラウザ内（IndexedDB）にのみ保存されます。
        機種変更や万一に備えて、ときどきCSVを書き出してバックアップしてください。
      </p>

      <div className="group-title">危険な操作</div>
      <div className="group">
        <button className="row tap danger" onClick={() => setConfirmReset(true)}>
          <span>全データ削除</span>
        </button>
      </div>
      <p className="footnote">登録した取引をすべて削除します。この操作は元に戻せません。</p>

      <p className="version">家計簿 v1.0.0 ・ 取引 {transactions.length} 件</p>

      {confirmReset && (
        <ConfirmDialog
          title="全データを削除しますか？"
          message="すべての取引が完全に削除され、カテゴリも初期状態に戻ります。元に戻せません。続けるには下の欄に「削除」と入力してください。"
          confirmLabel="すべて削除"
          requireText="削除"
          onCancel={() => setConfirmReset(false)}
          onConfirm={async () => { await resetAll(); setConfirmReset(false); setMessage({ title: '削除しました', text: 'すべてのデータを削除しました。' }) }}
        />
      )}
      {message && <MessageDialog title={message.title} message={message.text} onClose={() => setMessage(null)} />}
    </div>
  )
}
