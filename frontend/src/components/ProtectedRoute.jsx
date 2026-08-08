import { Outlet, useLocation, Link } from 'react-router-dom'
import { ShieldX, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { SpinnerWrap } from './Spinner.jsx'

// Rol tekshiruvi: ADMIN ichiga SUPER_ADMIN ham kiradi
export const hasRole = (user, roles) => {
  if (!user || !roles?.length) return true
  if (roles.includes('SUPER_ADMIN')) return user.role === 'SUPER_ADMIN'
  if (roles.includes('ADMIN')) return ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
  return roles.includes(user.role)
}

export default function ProtectedRoute({ requireAuth = true, roles = [] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="mx-auto min-h-[70vh] max-w-[1200px] px-6">
        <SpinnerWrap label="Tekshirilmoqda..." />
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1200px] items-center justify-center px-6 py-16">
        <div className="max-w-md rounded-3xl border border-line bg-surface p-10 text-center shadow-card">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-bone-100 text-primary">
            <Lock size={30} />
          </div>
          <h1 className="text-xl font-bold text-ink-900">Ro'yxatdan o'tmagansiz</h1>
          <p className="mt-2 text-sm text-ink-500">
            Bu sahifadan foydalanish uchun tizimga kiring yoki yangi hisob yarating.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
              Kirish
            </Link>
            <Link to="/register" className="btn btn-outline">
              Ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (user && !hasRole(user, roles)) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1200px] items-center justify-center px-6 py-16">
        <div className="max-w-md rounded-3xl border border-line bg-surface p-10 text-center shadow-card">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-bone-100 text-danger">
            <ShieldX size={30} />
          </div>
          <h1 className="text-xl font-bold text-ink-900">Ruxsat yo'q</h1>
          <p className="mt-2 text-sm text-ink-500">
            Bu sahifaga kirish uchun sizda yetarli huquq yo'q. Agar bu xato deb hisoblasangiz,
            administrator bilan bog'laning.
          </p>
          <Link to="/map" className="btn btn-primary mt-6">
            Xaritaga qaytish
          </Link>
        </div>
      </div>
    )
  }

  return <Outlet />
}
