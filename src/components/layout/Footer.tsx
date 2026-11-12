import { Logo } from '../icons/Icons'

export function Footer() {
  return (
    <footer className="bg-forest text-cream/80">
      <div className="mx-auto max-w-7xl px-8 py-10 flex justify-between items-center">
        <Logo dark />
        <span className="text-sm">Zero-Data Architecture. No personal documents stored.</span>
      </div>
    </footer>
  )
}

