import { useState, type ReactNode } from 'react'

/** 下からせり上がるシート */
export function Sheet({ title, onClose, children, footer }: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header className="sheet-head">
          <button className="link" onClick={onClose}>キャンセル</button>
          <h2>{title}</h2>
          <span className="sheet-head-spacer" />
        </header>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  )
}

export interface ActionItem {
  label: string
  onClick: () => void
  danger?: boolean
}

/** iOS風アクションシート */
export function ActionSheet({ title, actions, onClose }: {
  title?: string
  actions: ActionItem[]
  onClose: () => void
}) {
  return (
    <div className="overlay action" onClick={onClose}>
      <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="action-group">
          {title && <div className="action-title">{title}</div>}
          {actions.map((a) => (
            <button key={a.label} className={`action-btn ${a.danger ? 'danger' : ''}`}
              onClick={() => { onClose(); a.onClick() }}>
              {a.label}
            </button>
          ))}
        </div>
        <div className="action-group">
          <button className="action-btn bold" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  )
}

/** 確認ダイアログ。requireText を指定すると、その文字を入力しないと実行できない */
export function ConfirmDialog({ title, message, confirmLabel, requireText, onConfirm, onCancel }: {
  title: string
  message: string
  confirmLabel: string
  requireText?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const ok = !requireText || text.trim() === requireText
  return (
    <div className="overlay center" onClick={onCancel}>
      <div className="dialog" role="alertdialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        {requireText && (
          <input className="text-input" value={text} onChange={(e) => setText(e.target.value)}
            placeholder={`「${requireText}」と入力`} autoFocus />
        )}
        <div className="dialog-btns">
          <button className="dialog-btn" onClick={onCancel}>キャンセル</button>
          <button className="dialog-btn danger" disabled={!ok} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function MessageDialog({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return (
    <div className="overlay center" onClick={onClose}>
      <div className="dialog" role="alertdialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="pre">{message}</p>
        <div className="dialog-btns">
          <button className="dialog-btn bold" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )
}
