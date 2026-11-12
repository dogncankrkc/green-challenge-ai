import type { ReactNode } from 'react'

export function HouseMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M24 2 3 15v29a2 2 0 0 0 2 2h38a2 2 0 0 0 2-2V15z" fill="#dbff1f" />
      <path d="M14 15h6v7h8v-7h6v22h-6v-8h-8v8h-6z" fill="#ff5f15" />
    </svg>
  )
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <HouseMark />
      <span className={`font-display text-[26px] font-extrabold tracking-tight ${dark ? 'text-cream' : 'text-forest'}`}>
        safe<span className="text-orange">H</span>ouse
      </span>
    </span>
  )
}

const I = ({ children, className = 'w-6 h-6' }: { children: ReactNode; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
)

export const Shield = (p: { className?: string }) => (
  <I {...p}>
    <path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </I>
)

export const Chip = (p: { className?: string }) => (
  <I {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
  </I>
)

export const Pin = (p: { className?: string }) => (
  <I {...p}>
    <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.800 12 21 12 21z" />
    <circle cx="12" cy="9.500" r="2.500" />
  </I>
)

export const Upload = (p: { className?: string }) => (
  <I {...p}>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </I>
)

export const Lock = (p: { className?: string }) => (
  <I {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </I>
)

export const Check = (p: { className?: string }) => (
  <I {...p}>
    <path d="m5 12.500 4.500 4.500L19 7.500" />
  </I>
)

export const Grid = (p: { className?: string }) => (
  <I {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </I>
)

export const Home = (p: { className?: string }) => (
  <I {...p}>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </I>
)

export const Users = (p: { className?: string }) => (
  <I {...p}>
    <circle cx="9" cy="8" r="3.500" />
    <path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.500a3.500 3.500 0 0 1 0 7M18 14.500a6.500 6.500 0 0 1 3.500 5.500" />
  </I>
)

export const Msg = (p: { className?: string }) => (
  <I {...p}>
    <path d="M4 5h16v11H9l-5 4z" />
  </I>
)

export const Cog = (p: { className?: string }) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.900 4.900 7 7M17 17l2.100 2.100M4.900 19.100 7 17M17 7l2.100-2.100" />
  </I>
)

export const Sparkle = (p: { className?: string }) => (
  <I {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.500 2.500M15.500 15.500 18 18M18 6l-2.500 2.500M8.500 15.500 6 18" />
  </I>
)

