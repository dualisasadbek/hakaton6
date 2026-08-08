import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Outlet, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { SpinnerWrap } from './components/Spinner.jsx'

// Sahifalarni lazy-load qilish (bundle hajmini kamaytirish)
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const MapView = lazy(() => import('./pages/MapView.jsx'))
const ComplaintDetail = lazy(() => import('./pages/ComplaintDetail.jsx'))
const ComplaintNew = lazy(() => import('./pages/ComplaintNew.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const MyComplaints = lazy(() => import('./pages/MyComplaints.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))
const AdminUsers = lazy(() => import('./pages/AdminUsers.jsx'))
const AdminCategories = lazy(() => import('./pages/AdminCategories.jsx'))

function PageLoader() {
  return (
    <div className="container-fmc">
      <SpinnerWrap label="Sahifa yuklanmoqda..." />
    </div>
  )
}

// Sahifa almashganda tepaga qaytish
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function PageTransition() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </motion.main>
  )
}

function NotFound() {
  return (
    <div className="container-fmc flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100 text-primary">
        <Compass size={36} />
      </span>
      <h1 className="font-display text-5xl font-bold text-ink-900">404</h1>
      <p className="mt-3 text-ink-500">Sahifa topilmadi. U o'chirilgan yoki manzil noto'g'ri bo'lishi mumkin.</p>
      <Link to="/map" className="btn btn-primary mt-7">
        Xaritaga qaytish
      </Link>
    </div>
  )
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <PageTransition />
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Mustaqil (Layoutsiz) — navbar/footer yo'q */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/complaints/:id" element={<ComplaintDetail />} />

        {/* Login talab qiladigan sahifalar */}
        <Route element={<ProtectedRoute requireAuth />}>
          <Route path="/complaints/new" element={<ComplaintNew />} />
          <Route path="/complaints/:id/edit" element={<ComplaintNew />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
        </Route>

        {/* Admin (ADMIN +) */}
        <Route element={<ProtectedRoute requireAuth roles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Super admin */}
        <Route element={<ProtectedRoute requireAuth roles={['SUPER_ADMIN']} />}>
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
