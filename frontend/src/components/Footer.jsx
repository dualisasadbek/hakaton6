import { Link } from 'react-router-dom'
import { MapPin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bone-100">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-charcoal text-bronze-600">
                <MapPin size={20} />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-ink-900">
                FixMy<span className="text-bronze-700">City</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              Shahar muammolarini birgalikda kuzatamiz, ovoz beramiz va hal qilamiz.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-700">Sahifalar</h4>
            <ul className="space-y-2 text-sm text-ink-500">
              <li><Link className="transition hover:text-bronze-700" to="/map">Xarita va ro'yxat</Link></li>
              <li><Link className="transition hover:text-bronze-700" to="/complaints/new">Shikoyat yuborish</Link></li>
              <li><Link className="transition hover:text-bronze-700" to="/register">Ro'yxatdan o'tish</Link></li>
              <li><Link className="transition hover:text-bronze-700" to="/login">Kirish</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-700">Hackathon</h4>
            <p className="text-sm text-ink-500">
              FixMyCity — shahar muammolarini kuzatish platformasi.
              <br />
              React + Node.js + AI texnologiyalari asosida qurilgan.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-ink-400 sm:flex-row">
          <span>© {new Date().getFullYear()} FixMyCity</span>
          <span className="flex items-center gap-1.5">
            Muhabbat bilan yasalgan <Heart size={14} className="text-bronze-600" /> shaharingiz uchun
          </span>
        </div>
      </div>
    </footer>
  )
}
