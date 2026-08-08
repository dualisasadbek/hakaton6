import L from 'leaflet'

// Status rangi bo'yicha marker pin (SVG) yaratadi
export function pinIcon(color = '#2C3E50') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <path d="M18 2C9.7 2 3 8.5 3 16.7 3 27 18 44 18 44s15-17 15-27.3C33 8.5 26.3 2 18 2z"
        fill="${color}" stroke="rgba(32,29,25,0.35)" stroke-width="1.5"/>
      <circle cx="18" cy="16.5" r="6.5" fill="#FFFFFF"/>
      <circle cx="18" cy="16.5" r="3.2" fill="${color}"/>
    </svg>`
  return L.divIcon({
    className: 'fmc-pin',
    html: svg,
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -42],
  })
}
