import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, LogOut, Moon, Monitor, Settings, Sun, Wallet } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useTheme } from '../../hooks/useTheme.js'

const THEME_UI = {
  light: { icon: Sun, label: 'Theme: light. Switch to dark' },
  dark: { icon: Moon, label: 'Theme: dark. Switch to system' },
  system: { icon: Monitor, label: 'Theme: system. Switch to light' }
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { theme, cycleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const ThemeIcon = THEME_UI[theme]?.icon || Monitor

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-black text-white">B</span>
          <span className="text-lg font-extrabold tracking-tight text-dark">Bkard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleTheme}
            className="grid h-9 w-9 place-items-center rounded-xl text-dark/70 transition hover:bg-dark/5 hover:text-dark"
            aria-label={THEME_UI[theme]?.label || 'Toggle theme'}
          >
            <ThemeIcon className="h-4 w-4" strokeWidth={2} />
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-dark/10 py-1.5 pl-1.5 pr-3.5 transition hover:border-dark/20"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary/20 dark:text-primary-200">
                  {(user?.fullName || 'U').slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium text-dark sm:inline">{user?.fullName}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="glass absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl py-1.5 shadow-2xl animate-scale-in">
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark/80 hover:bg-dark/5">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark/80 hover:bg-dark/5">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <Link to="/payment" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark/80 hover:bg-dark/5">
                      <Wallet className="h-4 w-4" />
                      Billing
                    </Link>
                    <div className="my-1 h-px bg-dark/10" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/auth/login" className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-ink dark:hover:bg-slate-200">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
