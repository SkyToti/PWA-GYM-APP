import { useState, useEffect } from 'react'
import { getTheme, setTheme as setThemeStorage, subscribeTheme, applyTheme, type Theme } from '../lib/theme'

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(getTheme)

  useEffect(() => {
    applyTheme(getTheme())
    return subscribeTheme(() => setThemeState(getTheme()))
  }, [])

  const set = (t: Theme) => {
    setThemeStorage(t)
    setThemeState(t)
  }

  return [theme, set]
}
