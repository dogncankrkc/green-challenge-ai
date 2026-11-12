import type { ReactNode } from 'react'
import { Lock } from '../icons/Icons'

export type NavItem = [
  (p: { className?: string }) => ReactNode,
  string,
  string,
  number?
]

interface SidebarProps {
  label: string
  nav: NavItem[]
  active: string
  onSelect: (key: string) => void
  note: string
  children: ReactNode
}

export function Sidebar({ label, nav, active, onSelect, note, children }: SidebarProps) {
  return (
    <div className="flex items-start min-h-[calc(100vh-5rem)]">
      <aside className="w-64 sticky top-20 h-[calc(100vh-5rem)] shrink-0 overflow-y-auto overscroll-contain bg-forest text-cream p-6 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-cream/50 mb-4">{label}</p>
          <nav className="space-y-1.5">
            {nav.map(([IconComponent, itemLabel, key, badgeCount]) => {
              const isActive = active === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  className={`w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-lime text-forest-deep'
                      : 'text-cream/75 hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="w-5 h-5 shrink-0" />
                  <span className="flex-1 truncate">{itemLabel}</span>
                  {typeof badgeCount === 'number' && badgeCount > 0 && (
                    <span
                      className={`text-xs font-extrabold rounded-full px-2 py-0.5 ${
                        isActive
                          ? 'bg-forest text-lime'
                          : 'bg-orange text-white'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="mt-6 rounded-2xl bg-forest-deep p-4 text-xs leading-relaxed text-cream/75">
          <Lock className="w-4 h-4 text-lime mb-2" />
          {note}
        </div>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
