import { Lock } from '../../components/icons/Icons'
import { useAppStore, type StudentProfile } from '../../store/useAppStore'

interface ProfileFieldsProps {
  profile: StudentProfile
  setProfile: (p: StudentProfile) => void
}

const LIFESTYLE_CATEGORIES: [keyof StudentProfile, string, string[]][] = [
  [
    'Sleep',
    'Sleep Schedule',
    ['Early Riser (07:00)', 'Balanced Schedule', 'Night Owl (01:00+)', 'Flexible'],
  ],
  [
    'Social',
    'Social Energy',
    ['Quiet & Private', 'Occasional Hangouts', 'Shared House Dinners', 'Very Social & Active'],
  ],
  [
    'Cleanliness',
    'Cleanliness Standard',
    ['Spotless / Daily Tidy', 'Clean Shared Spaces', 'Weekly Chore Roster', 'Relaxed'],
  ],
  [
    'StudyRoutine',
    'Study & Work Routine',
    ['Mostly on Campus/Library', 'Hybrid', 'Remote / Study from Home'],
  ],
  [
    'KitchenDiet',
    'Kitchen & Diet',
    ['Loves Cooking Together', 'Quick Meal Prepper', 'Vegetarian / Vegan Friendly', 'Omnivore'],
  ],
  [
    'HouseRules',
    'House Rules & Environment',
    ['Strictly Non-Smoking', 'Pet Friendly', 'No Overnight Guests', 'Music / Instrument Friendly'],
  ],
]

export function ProfileFields({ profile, setProfile }: ProfileFieldsProps) {
  const inputs: [keyof StudentProfile, string, string][] = [
    ['first', 'First Name', 'given-name'],
    ['last', 'Last Name', 'family-name'],
    ['uni', 'University', 'organization'],
  ]

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {inputs.map(([key, label, autoComplete]) => {
          const inputId = `profile-field-${String(key)}`
          return (
            <div key={String(key)} className={key === 'uni' ? 'sm:col-span-2' : ''}>
              <label htmlFor={inputId} className="block font-bold text-sm mb-2">
                {label}
              </label>
              <input
                id={inputId}
                name={String(key)}
                type="text"
                autoComplete={autoComplete}
                value={profile[key] ?? ''}
                onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                placeholder={label}
                className="w-full rounded-xl border-2 border-forest/20 bg-cream/50 px-4 py-3 outline-none focus:border-forest focus:bg-white transition"
              />
            </div>
          )
        })}
        <div className="sm:col-span-2 flex items-center gap-3 rounded-2xl bg-lime/40 border border-lime px-5 py-4 text-sm font-semibold">
          <Lock className="w-5 h-5 shrink-0" />
          <span>
            <b>Hidden until mutual match approval:</b> Your name is hidden from landlords until you both approve a match.
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-forest/10 space-y-6">
        {LIFESTYLE_CATEGORIES.map(([key, label, options]) => (
          <fieldset key={String(key)}>
            <legend className="font-bold text-sm text-forest mb-2.5">{label}</legend>
            <div className="flex gap-2.5 flex-wrap">
              {options.map((option) => {
                const isSelected = profile[key] === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setProfile({ ...profile, [key]: option })}
                    aria-pressed={isSelected}
                    className={`rounded-full px-5 py-2.5 text-xs font-bold border-2 transition ${
                      isSelected
                        ? 'bg-lime border-lime text-forest-deep shadow-sm'
                        : 'border-forest/25 text-forest/85 hover:border-forest'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  )
}

export function ProfileBuilder() {
  const { profile, setProfile, go, role, loginAs } = useAppStore()

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (role === 'guest') {
      loginAs('student', 'onboarding')
    } else {
      go('onboarding')
    }
  }

  return (
    <main className="w-full mx-auto max-w-3xl px-4 md:px-8 py-8 md:py-16 pb-28">
      <form
        onSubmit={handleSaveAndContinue}
        aria-labelledby="profile-builder-heading"
        className="bg-white rounded-[32px] shadow-[0_24px_60px_-20px_rgba(15,74,58,.35)] p-6 sm:p-12"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-orange mb-3">
          Your 6-Dimension Co-Living Matrix
        </p>
        <h1 id="profile-builder-heading" className="text-3xl sm:text-4xl font-extrabold mb-3">
          Tell us about your lifestyle
        </h1>
        <p className="text-sm text-forest/70 mb-8">
          Our Local AI uses these 6 compatibility dimensions to score rooms and build harmonious student squads.
        </p>
        <ProfileFields profile={profile} setProfile={setProfile} />
        <button
          type="submit"
          className="mt-10 w-full bg-orange text-white font-bold text-lg rounded-full py-4 shadow-md hover:brightness-110 transition"
        >
          Save &amp; Continue to Document Verification
        </button>
      </form>
    </main>
  )
}
