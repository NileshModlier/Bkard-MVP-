import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { to: '/cards', label: 'My Cards', icon: '▭' },
  { to: '/create', label: 'Create Card', icon: '+' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
  { to: '/payment', label: 'Billing', icon: '$' }
]

export default function Sidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-dark/5 bg-white/60 px-4 py-6 lg:block">
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition
              ${isActive ? 'bg-primary text-white shadow-sm' : 'text-dark/60 hover:bg-dark/5 hover:text-dark'}
            `}
          >
            <span className="w-4 text-center">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
