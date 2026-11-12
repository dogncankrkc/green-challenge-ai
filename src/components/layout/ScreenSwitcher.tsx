import { useAppStore, type Screen } from '../../store/useAppStore'

export function ScreenSwitcher() {
  const { screen, go } = useAppStore()

  const items: [Screen, string][] = [
    ['landing', 'Landing'],
    ['login', 'Login'],
    ['profile', 'Profile'],
    ['onboarding', 'Verify'],
    ['selection', 'Goal'],
    ['solo', 'Rooms'],
    ['squad', 'Squad'],
    ['requests', 'Requests'],
    ['student-messages', 'Chats'],
    ['student-settings', 'Settings'],
    ['dashboard', 'Landlord'],
    ['ai-info', 'AI Info'],
  ]

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex flex-wrap justify-center max-w-[96vw] gap-0.5 p-1.5 rounded-3xl bg-forest-deep shadow-2xl">
      {items.map(([s, label]) => (
        <button
          key={s}
          type="button"
          onClick={() => go(s)}
          className={`px-3 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap ${
            screen === s ? 'bg-lime text-forest-deep' : 'text-cream/80 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

