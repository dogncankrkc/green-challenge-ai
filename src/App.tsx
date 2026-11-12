import { Chip, HouseMark, Pin, Shield } from './components/icons/Icons'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { ScreenSwitcher } from './components/layout/ScreenSwitcher'
import { LoginView } from './features/auth/LoginView'
import { LandlordDashboard } from './features/landlord/LandlordDashboard'
import { HowAiProtectsView } from './features/privacy/HowAiProtectsView'
import { GoalSelection } from './features/student/GoalSelection'
import { OnboardingVerify } from './features/student/OnboardingVerify'
import { ProfileBuilder } from './features/student/ProfileBuilder'
import { StudentDashboard } from './features/student/StudentDashboard'
import { useAppStore } from './store/useAppStore'

function LandingView() {
  const { go, loginAs } = useAppStore()

  return (
    <>
      <section className="relative overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 700"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <g fill="none" stroke="#0f4a3a" strokeOpacity=".09" strokeWidth="1.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <path
                key={i}
                d={`M-50 ${380 + i * 24} C 250 ${200 + i * 18}, 500 ${700 - i * 10}, 800 ${
                  420 + i * 8
                } S 1300 ${140 + i * 20}, 1500 ${300 + i * 14}`}
              />
            ))}
          </g>
        </svg>
        <div className="absolute -right-32 -top-24 w-[560px] h-[560px] rounded-full bg-lime/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-8 py-28 grid grid-cols-12 gap-10 items-center">
          <div className="col-span-7">
            <p className="text-orange font-extrabold uppercase tracking-[0.22em] text-sm mb-6">
              Real rooms. Real people.
            </p>
            <h1 className="text-[64px] leading-[1.04] font-extrabold max-w-2xl">
              Student housing in the Netherlands,{' '}
              <span className="bg-lime px-2 -mx-2 rounded-lg [box-decoration-break:clone]">
                made safe, simple and social.
              </span>
            </h1>
            <p className="mt-7 text-lg text-forest/75 max-w-xl leading-relaxed">
              Local AI matches you with verified rooms and roommates, without your documents ever leaving your device.
            </p>
            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={() => loginAs('student', 'profile')}
                className="bg-lime text-forest-deep font-bold text-lg rounded-full px-9 py-4 shadow-[0_10px_24px_-8px_rgba(150,180,0,.8)] hover:-translate-y-0.5 transition"
              >
                I'm looking for a room
              </button>
              <button
                type="button"
                onClick={() => loginAs('landlord', 'dashboard')}
                className="border-2 border-forest text-forest font-bold text-lg rounded-full px-9 py-4 hover:bg-forest hover:text-cream transition"
              >
                I'm a Landlord
              </button>
            </div>
          </div>
          <div className="col-span-5 relative h-[440px]">
            <div className="absolute inset-0 m-auto w-[300px] h-[420px] bg-forest rounded-[36px] shadow-2xl rotate-3 p-5">
              <div className="bg-cream rounded-2xl h-full p-4 flex flex-col gap-3">
                <div className="text-xs font-semibold bg-white rounded-full px-3 py-2 shadow-sm text-forest/60">
                  Rooms in the Netherlands
                </div>
                <div className="flex-1 rounded-xl bg-gradient-to-br from-forest to-[#2b7a5f] relative overflow-hidden">
                  <HouseMark className="absolute -right-6 -bottom-6 w-40 h-40 opacity-90" />
                  <span className="absolute left-3 bottom-3 bg-lime text-forest-deep text-xs font-bold rounded-full px-3 py-1">
                    Student room
                  </span>
                </div>
                <div className="font-display font-bold">Room in Utrecht</div>
                <div className="text-xs text-forest/60">1 room · Student house · Utrecht</div>
              </div>
            </div>
            <div
              onClick={() => go('ai-info')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') go('ai-info')
              }}
              className="cursor-pointer absolute -left-2 top-10 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 -rotate-3 hover:scale-105 transition"
            >
              <Shield className="w-6 h-6 text-orange" />
              <span className="text-sm font-bold">Verified listing</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-32 pt-8">
        <div className="grid grid-cols-3 gap-8">
          {[
            [
              Shield,
              'GDPR Compliant',
              'Built to European privacy law from the first line of code. You stay in control of every byte.',
            ],
            [
              Chip,
              'Privacy-Preserving AI',
              'Local AI reads your documents on your device and shares only verified metrics.',
            ],
            [
              Pin,
              'Across the Netherlands',
              'From Groningen to Maastricht, find verified rooms and real students in every student city.',
            ],
          ].map(([Icon, t, d], i) => {
            const C = Icon as typeof Shield
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-9 shadow-[0_12px_40px_-16px_rgba(15,74,58,.25)] hover:-translate-y-1 transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center mb-6">
                  <C className="w-7 h-7 text-lime" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t as string}</h3>
                <p className="text-forest/70 leading-relaxed">{d as string}</p>
              </div>
            )
          })}
        </div>
      </section>
      <Footer />
    </>
  )
}

export default function App() {
  const { screen } = useAppStore()

  const isStudentDashboardScreen =
    screen === 'solo' ||
    screen === 'squad' ||
    screen === 'requests' ||
    screen === 'student-messages' ||
    screen === 'student-settings'

  return (
    <div className="min-h-screen">
      <Navbar />
      {screen === 'landing' && <LandingView />}
      {screen === 'login' && <LoginView />}
      {screen === 'profile' && <ProfileBuilder />}
      {screen === 'ai-info' && <HowAiProtectsView />}
      {screen === 'onboarding' && <OnboardingVerify />}
      {screen === 'selection' && <GoalSelection />}
      {isStudentDashboardScreen && <StudentDashboard />}
      {screen === 'dashboard' && <LandlordDashboard />}
      <ScreenSwitcher />
    </div>
  )
}

