import { Route, Lightbulb, Recycle, Droplet, PlugZap, TreePine, BusFront, MoreHorizontal, MapPin } from 'lucide-react'

// Status → UZB label + marker/aksent rangi (muted / ma'muriyat palitra)
export const STATUS_META = {
  PENDING: { label: 'Kutilmoqda', color: '#475569' },
  VERIFIED: { label: 'Tasdiqlangan', color: '#3E7C6B' },
  IN_PROGRESS: { label: 'Jarayonda', color: '#2C3E50' },
  RESOLVED: { label: 'Hal qilingan', color: '#4A6B5A' },
  REJECTED: { label: 'Rad etilgan', color: '#6B7280' },
  BLOCKED: { label: 'Bloklangan', color: '#334155' },
}

export const ALL_STATUSES = Object.keys(STATUS_META)

// Status o'tish qoidalari (backend STATUS_FLOW bilan bir xil)
export const STATUS_FLOW = {
  PENDING: ['VERIFIED', 'REJECTED', 'BLOCKED'],
  VERIFIED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED: [],
  REJECTED: [],
  BLOCKED: [],
}

export const ROLES = {
  USER: 'Foydalanuvchi',
  ADMIN: 'Administrator',
  SUPER_ADMIN: 'Super Admin',
}

// Seed kategoriya ikonkalari → lucide
const ICON_MAP = {
  road: Route,
  lamp: Lightbulb,
  trash: Recycle,
  water: Droplet,
  bolt: PlugZap,
  tree: TreePine,
  bus: BusFront,
  dots: MoreHorizontal,
}

export const categoryIcon = (icon) => ICON_MAP[icon] || MapPin

export const RISK_META = {
  low: { label: 'Past', color: '#4A6B5A' },
  medium: { label: 'O‘rta', color: '#475569' },
  high: { label: 'Yuqori', color: '#8B3A47' },
}

export const DEFAULT_CENTER = [41.3111, 69.2797] // Toshkent
export const DEFAULT_ZOOM = 12

export const MAX_IMAGES = 6
