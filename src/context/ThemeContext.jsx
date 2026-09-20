import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys.js'

const ThemeContext = createContext(null)

const THEMES = ['light', 'dark', 'system']

function readStoredTheme() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME)
    if (THEMES.includes(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'system'
}

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveDark(theme) {
  return theme === 'dark' || (theme === 'system' && systemPrefersDark())
}

export function applyDocumentTheme(theme) {
  document.documentElement.classList.toggle('dark', resolveDark(theme))
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)

  useEffect(() => {
    applyDocumentTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme)
    } catch {
      /* ignore */
    }

    if (theme !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyDocumentTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return
    setThemeState(next)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState((current) => THEMES[(THEMES.indexOf(current) + 1) % THEMES.length])
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: resolveDark(theme),
      setTheme,
      cycleTheme
    }),
    [theme, setTheme, cycleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider')
  return ctx
}
