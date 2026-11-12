import { Home, Sparkle, Users } from '../../components/icons/Icons'
import { useAppStore, type Screen } from '../../store/useAppStore'

export function GoalSelection() {
  const { go, setLandlordTab, setCreateListingModalOpen } = useAppStore()

  const opts: [typeof Home, string, string, () => void][] = [
    [
      Home,
      'Find a Single Room',
      'Browse private rooms and studios matched to your lifestyle and budget.',
      () => go('solo'),
    ],
    [
      Users,
      'Join a Roommate Squad',
      'Let AI build a compatible group and apply for housing together.',
      () => go('squad'),
    ],
    [
      Sparkle,
      'Sublet My Room (Exchange)',
      'Hand over your room while abroad and approve verified incoming students.',
      () => {
        setLandlordTab('My Listings')
        setCreateListingModalOpen(true)
        go('dashboard' as Screen)
      },
    ],
  ]

  return (
    <main className="mx-auto max-w-6xl px-8 py-20 pb-28 text-center">
      <p className="text-orange font-bold uppercase tracking-widest text-sm mb-3">
        Step 2 of 2 · Matchmaking
      </p>
      <h1 className="text-5xl font-extrabold mb-14 max-w-3xl mx-auto leading-tight">
        What is your housing goal for this semester?
      </h1>
      <div className="grid grid-cols-3 gap-8">
        {opts.map(([IconComponent, title, desc, handleSelect]) => (
          <button
            key={title}
            type="button"
            onClick={handleSelect}
            className="group text-left bg-white rounded-3xl p-9 shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)] border-2 border-transparent hover:border-lime hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(15,74,58,.4)] transition"
          >
            <div className="w-14 h-14 rounded-2xl bg-forest group-hover:bg-lime flex items-center justify-center mb-6 transition">
              <IconComponent className="w-7 h-7 text-lime group-hover:text-forest-deep transition" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-forest/70 leading-relaxed mb-6">{desc}</p>
            <span className="text-orange font-bold text-sm">Choose &rarr;</span>
          </button>
        ))}
      </div>
    </main>
  )
}

