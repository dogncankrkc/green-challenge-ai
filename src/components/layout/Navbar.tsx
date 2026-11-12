import { Logo } from '../icons/Icons'
import { useAppStore, type Screen } from '../../store/useAppStore'

export function Navbar() {
  const { screen, role, go, logout } = useAppStore()

  const links: [string, Screen][] = [
    ['For Students', 'onboarding'],
    ['For Landlords', 'dashboard'],
    ['How AI Protects You', 'ai-info'],
  ]

  return (
    <header className="sticky top-0 z-30 bg-cream/55 backdrop-blur-xl border-b border-forest/10">
      <div className="mx-auto max-w-7xl h-16 md:h-20 px-4 md:px-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go('landing')}
          aria-label="safeHouse home"
          className="shrink-0 scale-90 sm:scale-100 origin-left"
        >
          <Logo />
        </button>
        <nav className="flex items-center gap-4 md:gap-10 text-sm md:text-[15px] font-semibold">
          <div className="hidden md:flex items-center gap-10">
            {links.map(([label, target]) => (
              <button
                key={label}
                type="button"
                onClick={() => go(target)}
                className={`hover:text-orange transition-colors ${screen === target ? 'text-orange' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          {role === 'guest' ? (
            <button
              type="button"
              onClick={() => go('login')}
              className="bg-orange text-white rounded-full px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-[15px] font-bold shadow-[0_6px_16px_-4px_rgba(255,95,21,.6)] hover:brightness-110 transition whitespace-nowrap"
            >
              Login / Sign Up
            </button>
          ) : (
            <div className="flex items-center gap-2.5 md:gap-4">
              <div className="flex items-center gap-2.5 bg-forest/5 border border-forest/15 rounded-full pl-2 pr-2 sm:pr-4 py-1.5">
                <span className="w-8 h-8 rounded-full bg-forest text-lime flex items-center justify-center text-sm font-bold shrink-0">
                  {role === 'student' ? 'S' : 'L'}
                </span>
                <span className="hidden sm:block text-sm leading-tight text-left">
                  <span className="block font-bold">
                    Demo {role === 'student' ? 'Student' : 'Landlord'} · Verified
                  </span>
                  <span className="block text-xs text-forest/60">Zero-Data Session</span>
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="bg-orange text-white rounded-full px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-[15px] font-bold shadow-[0_6px_16px_-4px_rgba(255,95,21,.6)] hover:brightness-110 transition whitespace-nowrap"
              >
                Log Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
