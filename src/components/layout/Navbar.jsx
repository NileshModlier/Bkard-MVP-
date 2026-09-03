import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-dark/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-black text-white">B</span>
          <span className="text-lg font-extrabold tracking-tight text-dark">Bkard</span>
        </Link>

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-dark/10 py-1.5 pl-1.5 pr-3.5 transition hover:border-dark/20"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {(user?.fullName || 'U').slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-sm font-medium text-dark sm:inline">{user?.fullName}</span>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-dark/5 bg-white py-1.5 shadow-2xl animate-scale-in">
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-dark/80 hover:bg-dark/5">Dashboard</Link>
                  <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-dark/80 hover:bg-dark/5">Settings</Link>
                  <Link to="/payment" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-dark/80 hover:bg-dark/5">Billing</Link>
                  <div className="my-1 h-px bg-dark/5" />
                  <button onClick={handleLogout} className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50">Log out</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/auth/login" className="rounded-xl bg-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
