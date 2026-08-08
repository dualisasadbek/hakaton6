import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { Navigation, ExternalLink } from 'lucide-react'
import { pinIcon } from './MapMarker.jsx'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/constants.js'

// Xaritada click → koordinata (faqat interactive rejimda)
function ClickCatcher({ onPick }) {
  useMapEvents({
    click: (e) => {
      if (onPick) onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Koordinata o'zgarganda xaritaga uchib boradi
function FlyTo({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.7 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])
  return null
}

export default function MapPicker({
  coords = null,
  onChange = null,
  height = 'h-72',
  interactive = false,
  center = DEFAULT_CENTER,
  className = '',
}) {
  const lat = coords?.lat
  const lng = coords?.lng

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-line shadow-card ${height} ${className}`}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {interactive && <ClickCatcher onPick={onChange} />}
        {lat != null && lng != null && (
          <>
            <FlyTo lat={lat} lng={lng} />
            <Marker position={[lat, lng]} icon={pinIcon('#2C3E50')} />
          </>
        )}
      </MapContainer>

      {interactive && (
        <div className="absolute bottom-3 left-1/2 z-[500] -translate-x-1/2">
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) =>
                    onChange &&
                    onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  () => alert("Joylashuvni aniqlab bo'lmadi. Ruxsatni tekshiring.")
                )
              }
            }}
            className="flex items-center gap-2 rounded-full bg-charcoal px-4 py-2.5 text-sm font-semibold text-bone-50 shadow-card-lg transition hover:bg-charcoal-2"
          >
            <Navigation size={15} className="text-bronze-600" />
            Mening joyim
          </button>
        </div>
      )}

      {lat != null && lng != null && (
        <div className="absolute left-3 top-3 z-[500] flex flex-col gap-1 rounded-xl border border-line bg-surface px-3 py-2 shadow-card">
          <span className="font-mono text-[11px] text-ink-500">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-bronze-700 hover:text-bronze-600"
          >
            <ExternalLink size={12} />
            Google Maps'da ochish
          </a>
        </div>
      )}
    </div>
  )
}
