import { useCallback, useEffect, useState } from 'react'

export type ThemePref = 'system' | 'light' | 'dark'
const KEY = 'kakeibo-theme'

function load(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch { /* 無視 */ }
  return 'system'
}

function apply(pref: ThemePref) {
  const dark = pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  // ステータスバーの色（Safari/PWA）
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove())
  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.content = dark ? '#000000' : '#f2f2f7'
  document.head.appendChild(meta)
}

/** 起動直後のチラつき防止用に、描画前に一度だけ呼ぶ */
export const applySavedTheme = () => apply(load())

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(load)

  useEffect(() => {
    apply(pref)
    if (pref !== 'system') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => apply('system')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [pref])

  const update = useCallback((p: ThemePref) => {
    try { localStorage.setItem(KEY, p) } catch { /* 無視 */ }
    setPref(p)
  }, [])

  return [pref, update] as const
}
