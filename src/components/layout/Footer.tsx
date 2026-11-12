import { Logo } from '../icons/Icons'

export function Footer() {
  return (
    <footer className="bg-forest text-cream/80">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-10 flex flex-col sm:flex-row gap-4 justify-between items-center text-center sm:text-left">
        <Logo dark />
        <span className="text-sm">Zero-Data Architecture. No personal documents stored.</span>
      </div>
    </footer>
  )
}
