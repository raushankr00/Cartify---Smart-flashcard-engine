import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Upload, BarChart2, LogOut, Layers, Menu, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const nav = [
  { to: '/',       icon: Layers,    label: 'My Decks' },
  { to: '/upload', icon: Upload,    label: 'New Deck' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/login') }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-sand-200">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sand-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
            <BookOpen size={15} className="text-sand-50" />
          </div>
          <span className="font-display font-semibold text-ink-900 text-lg tracking-tight">Cartify</span>
        </div>
        <p className="text-sand-400 text-xs font-body mt-1 ml-0.5">Smart flashcard engine</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-150
               ${isActive ? 'bg-ink-900 text-sand-50' : 'text-ink-700 hover:bg-sand-100'}`
            }>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-sand-200 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sand-50 border border-sand-200">
          <div className="w-7 h-7 rounded-full bg-ink-800 flex items-center justify-center flex-shrink-0">
            <span className="text-sand-100 text-xs font-display font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-ink-900 text-sm font-medium font-body truncate">{user?.name}</p>
            <p className="text-sand-400 text-xs font-body truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl
                     text-sand-500 hover:text-rose hover:bg-rose-light
                     text-sm font-body font-medium transition-all duration-150">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-sand-50 dot-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full"><Sidebar /></div>
          <div className="flex-1 bg-ink-900/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-sand-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-ink-900 rounded-lg flex items-center justify-center">
              <BookOpen size={13} className="text-sand-50" />
            </div>
            <span className="font-display font-semibold text-ink-900">Cartify</span>
          </div>
          <button onClick={() => setOpen(!open)} className="text-ink-700 p-1">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
