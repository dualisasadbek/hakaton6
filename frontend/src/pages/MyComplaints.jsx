import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilePlus2 } from 'lucide-react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import ComplaintCard from '../components/ComplaintCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { SpinnerWrap } from '../components/Spinner.jsx'

// Backendda userId filtri yo'q — sahifalarni o'qib, joriy foydalanuvchinikini yig'amiz
async function fetchMyComplaints(userId) {
  const mine = []
  const MAX_PAGES = 12
  const LIMIT = 20

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await api.get('/complaints', { params: { page, limit: LIMIT, sort: 'newest' } })
    const items = res?.data || []
    mine.push(...items.filter((c) => c.user?.id === userId))
    const total = res?.meta?.total || 0
    const totalPages = Math.ceil(total / LIMIT)
    if (page >= totalPages || items.length === 0) break
  }

  return mine
}

export default function MyComplaints() {
  const { user } = useAuth()
  const [items, setItems] = useState(null)

  useEffect(() => {
    let active = true
    if (!user) return
    fetchMyComplaints(user.id)
      .then((list) => active && setItems(list))
      .catch(() => active && setItems([]))
    return () => {
      active = false
    }
  }, [user])

  return (
    <div className="mx-auto max-w-[820px] px-6 py-10">
      <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Mening shikoyatlarim</h1>
      <p className="mt-1 text-ink-500">Siz yuborgan shikoyatlar va ularning holati</p>

      <div className="mt-8">
        {items === null ? (
          <SpinnerWrap label="Shikoyatlaringiz yuklanmoqda..." />
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-line bg-surface shadow-card">
            <EmptyState
              icon="complaints"
              title="Hozircha shikoyatlaringiz yo'q"
              text="Shaharda muammo ko'rdingizmi? Suratga oling va birinchi shikoyatingizni yozing."
              action={
                <Link to="/complaints/new" className="btn btn-primary btn-sm">
                  <FilePlus2 size={16} />
                  Shikoyat yuborish
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm font-semibold text-ink-500">
              Jami: {items.length} ta shikoyat
            </p>
            <div className="space-y-3">
              {items.map((c) => (
                <ComplaintCard key={c.id} complaint={c} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
