import { NavLink } from 'react-router-dom'
import { CreditCard, LayoutDashboard, Plus, Settings, Wallet } from 'lucide-react'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cards', label: 'My Cards', icon: CreditCard },
  { to: '/create', label: 'Create Card', icon: Plus },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/payment', label: 'Billing', icon: Wallet }
]

export default function Sidebar() {
  return (
    <aside className="glass sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r px-4 py-6 lg:block">
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `
                flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition
                ${isActive ? 'bg-primary text-white shadow-sm' : 'text-dark/60 hover:bg-dark/5 hover:text-dark'}
              `}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
