import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Search, SlidersHorizontal, Map as MapIcon, List } from 'lucide-react'
import api from '../api/client.js'
import { STATUS_META, ALL_STATUSES, categoryIcon } from '../utils/constants.js'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/constants.js'
import { timeAgo } from '../utils/format.js'
import ComplaintCard from '../components/ComplaintCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import Dropdown from '../components/Dropdown.jsx'
import Pagination from '../components/Pagination.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { SpinnerWrap } from '../components/Spinner.jsx'
import { pinIcon } from '../components/MapMarker.jsx'

const LIMIT = 8

function MapMarkers({ markers }) {
  return (
    <>
      {markers.map((c) => (
        <Marker key={c.id} position={[c.latitude, c.longitude]} icon={pinIcon(STATUS_META[c.status]?.color)}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="text-sm font-bold text-ink-900">{c.title}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-1.5 text-xs text-ink-500">
                {c._count?.votes ?? 0} ovoz · {timeAgo(c.createdAt)}
              </p>
              <Link
                to={`/complaints/${c.id}`}
                className="mt-2.5 inline-flex rounded-lg bg-charcoal px-3 py-1.5 text-xs font-semibold text-bone-50 transition hover:bg-charcoal-2"
              >
                Batafsil →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default function MapView() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: LIMIT })
  const [markers, setMarkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMap, setLoadingMap] = useState(true)
  const [tab, setTab] = useState('list') // mobil: list | map

  // Qidiruvni debounce qilish
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => setPage(1), [debouncedSearch, categoryId, status, sort])

  // Kategoriyalar
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res?.data || []))
      .catch(() => {})
  }, [])

  // Ro'yxat
  useEffect(() => {
    let active = true
    setLoading(true)
    const params = {
      page,
      limit: LIMIT,
      sort,
      search: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
      status: status || undefined,
    }
    api
      .get('/complaints', { params })
      .then((res) => {
        if (!active) return
        setItems(res?.data || [])
        setMeta(res?.meta || { total: 0, page: 1, limit: LIMIT })
      })
      .catch(() => {
        if (active) {
          setItems([])
          setMeta({ total: 0, page: 1, limit: LIMIT })
        }
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [page, sort, debouncedSearch, categoryId, status])

  // Xarita markerlari
  useEffect(() => {
    api
      .get('/complaints/map')
      .then((res) => setMarkers(res?.data || []))
      .catch(() => {})
      .finally(() => setLoadingMap(false))
  }, [])

  const totalPages = useMemo(() => Math.max(1, Math.ceil((meta.total || 0) / LIMIT)), [meta.total])

  const activeFilters = Boolean(debouncedSearch || categoryId || status)

  const resetFilters = useCallback(() => {
    setSearch('')
    setCategoryId('')
    setStatus('')
    setSort('newest')
  }, [])

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col md:flex-row">
      {/* Chap panel */}
      <div
        className={`w-full flex-col border-line bg-bone-50 md:flex md:w-[410px] md:shrink-0 md:overflow-y-auto md:border-r ${
          tab === 'list' ? 'flex' : 'hidden'
        }`}
      >
        <div className="border-b border-line p-4">
          {/* Qidiruv */}
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Shikoyat qidirish..."
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none transition focus:border-bronze-600 focus:ring-4 focus:ring-bronze-glow"
            />
          </div>

          {/* Kategoriya chiplari */}
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryId('')}
              className={`chip shrink-0 ${categoryId === '' ? 'active' : ''}`}
            >
              Barchasi
            </button>
            {categories.map((c) => {
              const Icon = categoryIcon(c.icon)
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryId((cur) => (cur === c.id ? '' : c.id))}
                  className={`chip shrink-0 ${categoryId === c.id ? 'active' : ''}`}
                >
                  <Icon size={14} />
                  {c.name}
                </button>
              )
            })}
          </div>

          {/* Status + sort */}
          <div className="mt-3 flex items-center gap-2">
            <SlidersHorizontal size={16} className="shrink-0 text-ink-400" />
            <Dropdown
              value={status}
              onChange={setStatus}
              options={[
                { value: '', label: 'Barcha holatlar' },
                ...ALL_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label })),
              ]}
              placeholder="Barcha holatlar"
              className="min-w-0 flex-1"
            />
            <Dropdown
              value={sort}
              onChange={setSort}
              options={[
                { value: 'newest', label: 'Eng yangi' },
                { value: 'votes', label: "Eng ko'p ovoz" },
              ]}
              className="min-w-0 flex-1"
            />
          </div>
        </div>

        {/* Ro'yxat */}
        <div className="flex-1 space-y-3 p-4">
          {loading ? (
            <SpinnerWrap label="Shikoyatlar yuklanmoqda..." />
          ) : items.length === 0 ? (
            <EmptyState
              icon="search"
              title={activeFilters ? 'Hech narsa topilmadi' : "Hozircha shikoyatlar yo'q"}
              text={
                activeFilters
                  ? "Filtrlarni o'zgartirib qaytadan urinib ko'ring."
                  : 'Birinchi shikoyatni siz yozishingiz mumkin!'
              }
              action={
                activeFilters ? (
                  <button onClick={resetFilters} className="btn btn-outline btn-sm">
                    Filtrlarni tozalash
                  </button>
                ) : (
                  <Link to="/complaints/new" className="btn btn-primary btn-sm">
                    Shikoyat yuborish
                  </Link>
                )
              }
            />
          ) : (
            <>
              <p className="px-1 text-xs font-semibold text-ink-500">
                {meta.total} ta shikoyat
              </p>
              {items.map((c, i) => (
                <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}>
                  <ComplaintCard complaint={c} />
                </div>
              ))}
            </>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Xarita */}
      <div className={`relative min-h-[60vh] flex-1 md:min-h-0 ${tab === 'map' ? 'block' : 'hidden md:block'}`}>
        {loadingMap ? (
          <div className="flex h-full items-center justify-center">
            <SpinnerWrap label="Xarita yuklanmoqda..." />
          </div>
        ) : (
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            className="h-full min-h-[60vh] w-full md:min-h-0"
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapMarkers markers={markers} />
          </MapContainer>
        )}
      </div>

      {/* Mobil tablar */}
      <div className="fixed bottom-5 left-1/2 z-[900] flex -translate-x-1/2 gap-1 rounded-full border border-line bg-surface p-1 shadow-card-lg md:hidden">
        <button
          onClick={() => setTab('list')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === 'list' ? 'bg-charcoal text-bone-50' : 'text-ink-500'
          }`}
        >
          <List size={15} />
          Ro'yxat
        </button>
        <button
          onClick={() => setTab('map')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === 'map' ? 'bg-charcoal text-bone-50' : 'text-ink-500'
          }`}
        >
          <MapIcon size={15} />
          Xarita
        </button>
      </div>
    </div>
  )
}
