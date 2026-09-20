import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { CreditCard, LayoutDashboard, Plus, Settings } from 'lucide-react'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import GradientMesh from '../branding/GradientMesh.jsx'

const MOBILE_LINKS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/cards', label: 'Cards', icon: CreditCard },
  { to: '/create', label: 'Create', icon: Plus },
  { to: '/settings', label: 'Settings', icon: Settings }
]

export default function DashboardLayout({ children }) {
  const [, setOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-bg">
      <GradientMesh />
      <Navbar />
      <div className="relative mx-auto flex max-w-7xl">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
          {children}
        </main>
      </div>

      <nav className="glass fixed bottom-0 left-0 right-0 z-40 flex border-t lg:hidden">
        {MOBILE_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `
                flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium
                ${isActive ? 'text-primary' : 'text-dark/45'}
              `}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
