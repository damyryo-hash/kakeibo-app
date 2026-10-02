import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { TransactionForm, type FormTarget } from './components/TransactionForm'
import { StoreProvider, useStore } from './hooks/useStore'
import { useTheme } from './hooks/useTheme'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { SettingsPage } from './pages/SettingsPage'

function Shell() {
  const { ready } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [form, setForm] = useState<FormTarget | null>(null)
  const [theme, setTheme] = useTheme()

  if (!ready) return <div className="splash">読み込み中…</div>

  return (
    <>
      <main className="screen">
        {tab === 'home' && (
          <HomePage
            onAdd={(type) => setForm({ type })}
            onEdit={(tx) => setForm({ tx })}
            onShowHistory={() => setTab('history')}
          />
        )}
        {tab === 'history' && <HistoryPage onEdit={(tx) => setForm({ tx })} />}
        {tab === 'analytics' && <AnalyticsPage />}
        {tab === 'settings' && <SettingsPage theme={theme} onTheme={setTheme} />}
      </main>
      <TabBar tab={tab} onChange={setTab} onAdd={() => setForm({})} />
      {form && <TransactionForm target={form} onClose={() => setForm(null)} />}
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
