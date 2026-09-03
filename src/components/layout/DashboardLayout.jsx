import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

const MOBILE_LINKS = [
  { to: '/dashboard', label: 'Home', icon: '⌂' },
  { to: '/cards', label: 'Cards', icon: '▭' },
  { to: '/create', label: 'Create', icon: '+' },
  { to: '/settings', label: 'Settings', icon: '⚙' }
]

export default function DashboardLayout({ children }) {
  const [, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-dark/5 bg-white/95 backdrop-blur-xl lg:hidden">
        {MOBILE_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `
              flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium
              ${isActive ? 'text-primary' : 'text-dark/45'}
            `}
          >
            <span className="text-lg leading-none">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
