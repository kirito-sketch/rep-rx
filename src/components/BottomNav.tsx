import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  label: string
  path: string
  icon: (active: boolean) => JSX.Element
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M3 9.5L11 3L19 9.5V19C19 19.6 18.6 20 18 20H14V15H8V20H4C3.4 20 3 19.6 3 19V9.5Z"
        stroke={active ? '#EA580C' : '#A59D95'}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? '#FFF4EC' : 'none'}
      />
    </svg>
  )
}

function WeekIcon({ active }: { active: boolean }) {
  const color = active ? '#EA580C' : '#A59D95'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="3" y="5" width="16" height="14" rx="2.5"
        stroke={color}
        strokeWidth="1.75"
        fill={active ? '#FFF4EC' : 'none'}
      />
      <path d="M3 9.5H19" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M7.5 3V6.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M14.5 3V6.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="7.5" cy="14" r="1" fill={color} />
      <circle cx="11" cy="14" r="1" fill={color} />
      <circle cx="14.5" cy="14" r="1" fill={color} />
    </svg>
  )
}

function HistoryIcon({ active }: { active: boolean }) {
  const color = active ? '#EA580C' : '#A59D95'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle
        cx="11" cy="11" r="8"
        stroke={color}
        strokeWidth="1.75"
        fill={active ? '#FFF4EC' : 'none'}
      />
      <path d="M11 7V11.5L14 13.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: (active) => <HomeIcon active={active} />,
  },
  {
    label: 'Week',
    path: '/week',
    icon: (active) => <WeekIcon active={active} />,
  },
  {
    label: 'Activity',
    path: '/history',
    icon: (active) => <HistoryIcon active={active} />,
  },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const active =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity active:opacity-60"
            >
              {item.icon(active)}
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  active ? 'text-accent' : 'text-text-muted'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
