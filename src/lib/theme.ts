const KEY = 'prime_tracker_theme'

export type Theme = 'dark' | 'light' | 'system'

let themeListeners: Array<() => void> = []

export function getTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'dark' || v === 'light' || v === 'system') return v
  } catch { /* ignore */ }
  return 'dark'
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
  themeListeners.forEach((fn) => fn())
}

export function subscribeTheme(fn: () => void): () => void {
  themeListeners.push(fn)
  return () => { themeListeners = themeListeners.filter((f) => f !== fn) }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)
}
