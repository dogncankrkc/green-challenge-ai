import { HouseMark, Lock } from '../../components/icons/Icons'
import { useAppStore } from '../../store/useAppStore'

export function LoginView() {
  const { loginAs } = useAppStore()

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#ebe7dc] flex items-center justify-center px-4 md:px-8 py-10 md:py-16 pb-28">
      <div className="bg-white rounded-[32px] shadow-[0_24px_60px_-20px_rgba(15,74,58,.35)] w-full max-w-lg p-7 sm:p-12 text-center">
        <HouseMark className="w-14 h-14 mx-auto mb-5" />
        <h1 className="text-3xl font-extrabold mb-2">Welcome to safeHouse Demo</h1>
        <p className="text-forest/70 mb-9">Choose a demo account to explore the platform.</p>
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => loginAs('student', 'profile')}
            className="w-full bg-lime text-forest-deep font-bold text-lg rounded-full py-4 shadow-md hover:-translate-y-0.5 transition"
          >
            Login as Demo Student
          </button>
          <button
            type="button"
            onClick={() => loginAs('landlord', 'dashboard')}
            className="w-full bg-forest text-cream font-bold text-lg rounded-full py-4 hover:bg-forest-deep transition"
          >
            Login as Demo Landlord
          </button>
        </div>
        <p className="mt-7 text-xs text-forest/50 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          Demo credentials only. No real data is used.
        </p>
      </div>
    </main>
  )
}

