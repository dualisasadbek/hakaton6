import { SearchX, FileQuestion, Users, ShieldX, MessageSquareOff } from 'lucide-react'

const ICONS = {
  search: SearchX,
  complaints: FileQuestion,
  users: Users,
  noAccess: ShieldX,
  chat: MessageSquareOff,
}

export default function EmptyState({ icon = 'search', title = 'Hozircha ma\'lumot yo\'q', text = '', action }) {
  const Icon = ICONS[icon] || FileQuestion
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bone-100 text-bronze-600">
        <Icon size={30} />
      </div>
      <h3 className="mb-1 text-lg font-bold text-ink-900">{title}</h3>
      {text && <p className="max-w-sm text-sm text-ink-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
