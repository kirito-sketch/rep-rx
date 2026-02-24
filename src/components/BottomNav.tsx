import type { ReactElement } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  label: string
  path: string
  icon: (active: boolean) => ReactElement
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#EA580C' : '#A59D95'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 10.5L12 3L21 10.5V21C21 21.6 20.6 22 20 22H15.5V16.5H8.5V22H4C3.4 22 3 21.6 3 21V10.5Z"
        stroke={c}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? '#FFF4EC' : 'none'}
      />
    </svg>
  )
}

function ProgramIcon({ active }: { active: boolean }) {
  const c = active ? '#EA580C' : '#A59D95'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={c} strokeWidth="1.75" fill={active ? '#FFF4EC' : 'none'} />
      <path d="M3 10H21" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8 3V7" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M16 3V7" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M7 15H17" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 18.5H13" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LogIcon({ active }: { active: boolean }) {
  const c = active ? '#EA580C' : '#A59D95'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.75" fill={active ? '#FFF4EC' : 'none'} />
      <path d="M12 7.5V12.5L15.5 14.5" stroke={c} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? '#EA580C' : '#A59D95'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.75" fill={active ? '#FFF4EC' : 'none'} />
      <path d="M4 20C4 17 7.6 14.5 12 14.5C16.4 14.5 20 17 20 20" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Today', path: '/', icon: (a) => <HomeIcon active={a} /> },
  { label: 'Program', path: '/week', icon: (a) => <ProgramIcon active={a} /> },
  { label: 'Log', path: '/history', icon: (a) => <LogIcon active={a} /> },
  { label: 'Profile', path: '/profile', icon: (a) => <ProfileIcon active={a} /> },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white/90 border-t border-border"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
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
              className="flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-opacity active:opacity-50"
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-accent" />
              )}
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
