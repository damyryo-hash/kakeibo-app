import type { ReactNode } from 'react'
import { ChartIcon, GearIcon, HomeIcon, ListIcon, PlusIcon } from './Icons'

export type Tab = 'home' | 'history' | 'analytics' | 'settings'

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'ホーム', icon: <HomeIcon /> },
  { id: 'history', label: '履歴', icon: <ListIcon /> },
  { id: 'analytics', label: '分析', icon: <ChartIcon /> },
  { id: 'settings', label: '設定', icon: <GearIcon /> },
]

interface Props {
  tab: Tab
  onChange: (t: Tab) => void
  onAdd: () => void
}

export function TabBar({ tab, onChange, onAdd }: Props) {
  const button = (t: (typeof TABS)[number]) => (
    <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
      {t.icon}
      <span>{t.label}</span>
    </button>
  )
  return (
    <nav className="tabbar" aria-label="メインメニュー">
      {TABS.slice(0, 2).map(button)}
      <button className="tab-add" onClick={onAdd} aria-label="収支を追加">
        <PlusIcon />
      </button>
      {TABS.slice(2).map(button)}
    </nav>
  )
}
