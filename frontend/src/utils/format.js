export const BASE_URL = 'https://fixmycity-backend-xr4n.onrender.com'

// Serverdan kelgan /uploads/... path'ni to'liq URL'ga aylantiradi
export const assetUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  if (path.startsWith('/')) return `${BASE_URL}${path}`
  return `${BASE_URL}/${path}`
}

export const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDateTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const timeAgo = (iso) => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'hozirgina'
  if (min < 60) return `${min} daqiqa oldin`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} soat oldin`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} kun oldin`
  return formatDate(iso)
}

// Server xatosidan message'ni ajratib oladi
export const getApiError = (err, fallback = 'Xatolik yuz berdi') =>
  err?.response?.data?.message || err?.message || fallback
