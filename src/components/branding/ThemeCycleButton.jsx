import { Moon, Monitor, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme.js'

const THEME_UI = {
  light: { icon: Sun, label: 'Theme: light. Switch to dark' },
  dark: { icon: Moon, label: 'Theme: dark. Switch to system' },
  system: { icon: Monitor, label: 'Theme: system. Switch to light' }
}

export default function ThemeCycleButton({ className = '' }) {
  const { theme, cycleTheme } = useTheme()
  const ThemeIcon = THEME_UI[theme]?.icon || Monitor

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={`grid h-9 w-9 place-items-center rounded-xl text-dark/70 transition hover:bg-dark/5 hover:text-dark ${className}`}
      aria-label={THEME_UI[theme]?.label || 'Toggle theme'}
    >
      <ThemeIcon className="h-4 w-4" strokeWidth={2} />
    </button>
  )
}
