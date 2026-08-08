import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Home,
  Map as MapIcon,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User,
  ListChecks,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

function Logo({ to, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-card">
        <MapPin size={18} />
      </span>
        <span className="font-display text-base font-bold tracking-tight text-ink-900">
        FixMy<span className="text-primary">City</span>
      </span>
      </Link>
  )
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)

  // Barcha sahifalar hamma vaqt ko'rinadi; auth: true linklar login talab qiladi
  // Profil sahifasi menyudan olib tashlandi — u endi faqat o'ng tarafdagi avatar tugmasi orqali ochiladi
  const links = [
    { to: '/home', label: 'Bosh sahifa', icon: Home },
    { to: '/map', label: 'Xarita', icon: MapIcon },
    { to: '/complaints/new', label: 'Shikoyat yuborish', icon: PlusCircle, auth: true },
    { to: '/my-complaints', label: 'Meninglarim', icon: ListChecks, auth: true },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ]

  // Login bo'lmagan foydalanuvchi himoyalangan linkni bossa — notification
  const guard = (e, l) => {
    if (l.auth && !user) {
      e.preventDefault()
      toast.info("Avval ro'yxatdan o'ting yoki tizimga kiring")
    }
    if (open) setOpen(false)
  }

  const handleLogout = async () => {
    setOpen(false)
    await logout()
  }

  return (
      <header className="sticky top-4 z-[1000] flex justify-center px-4">
        <div className="w-full max-w-5xl rounded-2xl border border-line bg-bone-50/90 shadow-card backdrop-blur-md">
          <div className="flex h-[64px] items-center justify-between gap-4 px-4 sm:px-6">
            <Logo to={user ? '/home' : '/'} onClick={() => setOpen(false)} />

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                  <NavLink
                      key={l.to}
                      to={l.to}
                      onClick={(e) => guard(e, l)}
                      className={({ isActive }) =>
                          `flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                              isActive
                                  ? 'bg-primary-100 text-primary'
                                  : 'text-ink-500 hover:bg-surface-2 hover:text-ink-900'
                          }`
                      }
                  >
                    <l.icon size={16} />
                    {l.label}
                  </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                  <>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-4 transition hover:border-primary ${
                                isActive ? 'border-primary' : ''
                            }`
                        }
                    >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {user.firstName?.[0] || 'U'}
                  </span>
                      <span className="max-w-[110px] truncate text-sm font-medium text-ink-900">
                    {user.firstName}
                  </span>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition hover:bg-surface-2 hover:text-danger"
                        title="Chiqish"
                    >
                      <LogOut size={17} />
                    </button>
                  </>
              ) : (
                  <>
                    <Link to="/login" className="btn btn-ghost btn-sm">
                      Kirish
                    </Link>
                    <Link to="/register" className="btn btn-primary btn-sm">
                      Ro'yxatdan o'tish
                    </Link>
                  </>
              )}
            </div>

            {/* Mobil burger */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 transition hover:bg-surface-2 md:hidden"
                aria-label="Menyu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobil menyu */}
          <AnimatePresence>
            {open && (
                <motion.nav
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden border-t border-line md:hidden"
                >
                  <div className="flex flex-col gap-1 px-4 py-4">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            onClick={(e) => guard(e, l)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                                    isActive ? 'bg-primary-100 text-primary' : 'text-ink-700 hover:bg-surface-2'
                                }`
                            }
                        >
                          <l.icon size={17} />
                          {l.label}
                        </NavLink>
                    ))}

                    {user ? (
                        <>
                          <NavLink
                              to="/profile"
                              onClick={() => setOpen(false)}
                              className={({ isActive }) =>
                                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                                      isActive ? 'bg-primary-100 text-primary' : 'text-ink-700 hover:bg-surface-2'
                                  }`
                              }
                          >
                            <User size={17} />
                            Profil
                          </NavLink>
                          <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-danger hover:bg-danger-bg"
                          >
                            <LogOut size={17} />
                            Chiqish
                          </button>
                        </>
                    ) : (
                        <div className="mt-2 flex flex-col gap-2">
                          <Link to="/login" onClick={() => setOpen(false)} className="btn btn-outline btn-block">
                            Kirish
                          </Link>
                          <Link to="/register" onClick={() => setOpen(false)} className="btn btn-primary btn-block">
                            Ro'yxatdan o'tish
                          </Link>
                        </div>
                    )}
                  </div>
                </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>
  )
}