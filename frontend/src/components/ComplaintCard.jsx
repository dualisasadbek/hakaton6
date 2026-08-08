import { Link } from 'react-router-dom'
import { ThumbsUp, MapPin, User, CalendarDays, ImageOff } from 'lucide-react'
import { assetUrl, timeAgo } from '../utils/format.js'
import { categoryIcon } from '../utils/constants.js'
import StatusBadge from './StatusBadge.jsx'

export default function ComplaintCard({ complaint }) {
  const img = complaint.images?.[0]?.url
  const Icon = categoryIcon(complaint.category?.icon)

  return (
    <Link
      to={`/complaints/${complaint.id}`}
      className="group flex gap-4 rounded-2xl border border-line bg-surface p-3.5 shadow-card transition hover:-translate-y-0.5 hover:border-bronze-600 hover:shadow-card-lg"
    >
      {/* Thumbnail */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-bone-100 sm:h-28 sm:w-32">
        {img ? (
          <img
            src={assetUrl(img)}
            alt={complaint.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-400">
            <ImageOff size={26} />
          </div>
        )}
      </div>

      {/* Ma'lumot */}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          {complaint.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-bone-100 px-2.5 py-0.5 text-xs font-semibold text-ink-500">
              <Icon size={12} className="text-bronze-600" />
              {complaint.category.name}
            </span>
          )}
          <StatusBadge status={complaint.status} />
        </div>

        <h3 className="ellipsis font-semibold text-ink-900 transition group-hover:text-bronze-700">
          {complaint.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp size={13} className="text-bronze-600" />
            <b className="text-ink-700">{complaint._count?.votes ?? 0}</b> ovoz
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={13} />
            {timeAgo(complaint.createdAt)}
          </span>
          {complaint.user && (
            <span className="inline-flex items-center gap-1">
              <User size={13} />
              {complaint.user.firstName} {complaint.user.lastName}
            </span>
          )}
          {complaint.address && (
            <span className="ellipsis inline-flex max-w-[160px] items-center gap-1">
              <MapPin size={13} />
              {complaint.address}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
