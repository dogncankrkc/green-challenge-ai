import { Check, Chip, Lock, Shield, Sparkle } from '../../components/icons/Icons'
import { useAppStore } from '../../store/useAppStore'

export function HowAiProtectsView() {
  const { go } = useAppStore()

  const items: [typeof Chip, string, string][] = [
    [
      Chip,
      'Local Processing (Ollama llama3.1)',
      'Your documents never leave your device. Our on-device LLM extracts admission, financial, and tenant reference metrics directly in your browser.',
    ],
    [
      Sparkle,
      'Data Minimization',
      'Only verified boolean and numeric metrics (budget cap, student status, university, right-to-rent) are extracted. Names, BSN, passports, and IBANs are discarded.',
    ],
    [
      Shield,
      'Double Opt-In Privacy (GDPR)',
      'Landlords only see your anonymous AI Match Score and lifestyle fit until both sides mutually approve the connection.',
    ],
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-20 pb-28 text-center">
      <p className="text-orange font-bold uppercase tracking-widest text-sm mb-3">
        Zero-Data Architecture
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">How AI Protects You</h1>
      <p className="text-base md:text-lg text-forest/70 max-w-2xl mx-auto mb-10 md:mb-14">
        Matchmaking without surveillance: your data stays yours at every step.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
        {items.map(([IconComponent, title, desc]) => (
          <div
            key={title}
            className="bg-white rounded-3xl p-9 shadow-[0_12px_40px_-16px_rgba(15,74,58,.25)] hover:-translate-y-1 transition"
          >
            <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center mb-6">
              <IconComponent className="w-7 h-7 text-lime" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-forest/70 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* 3-Step Sanitizer Banner */}
      <div className="mt-10 md:mt-12 bg-forest text-cream rounded-3xl p-6 md:p-8 text-left grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-5 h-5 text-forest-deep" />
          </div>
          <div>
            <h4 className="font-bold text-lime text-sm uppercase tracking-wider">1. Raw Document Input</h4>
            <p className="text-xs text-cream/80 mt-1 leading-relaxed">
              Academic enrollment, DUO financial proofs, and Kadaster deeds are read into volatile client memory only.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center shrink-0 mt-0.5">
            <Chip className="w-5 h-5 text-forest-deep" />
          </div>
          <div>
            <h4 className="font-bold text-lime text-sm uppercase tracking-wider">2. Local LLM Sanitizer</h4>
            <p className="text-xs text-cream/80 mt-1 leading-relaxed">
              <code className="text-lime">localhost:11434</code> strips BSN, passport numbers, home addresses &amp; IBANs, outputting sanitized JSON.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-5 h-5 text-forest-deep" />
          </div>
          <div>
            <h4 className="font-bold text-lime text-sm uppercase tracking-wider">3. Zero-Knowledge Badge</h4>
            <p className="text-xs text-cream/80 mt-1 leading-relaxed">
              Landlords and students verify budget caps, enrollment, and property ownership with zero PII exposure.
            </p>
          </div>
        </div>
      </div>

      {/* Production Architecture & Scalability Roadmap Callout Card */}
      <div className="mt-10 bg-white rounded-3xl p-10 text-left shadow-[0_16px_48px_-16px_rgba(15,74,58,.28)] border-2 border-forest/15">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-7 border-b border-forest/10">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-lime text-forest-deep text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full mb-2">
              <Sparkle className="w-3.5 h-3.5" />
              Enterprise Zero-Data Architecture
            </span>
            <h2 className="text-2xl font-extrabold text-forest">
              Production Architecture &amp; Scalability Roadmap
            </h2>
          </div>
          <div className="bg-cream rounded-2xl px-4 py-3 border border-forest/10 max-w-md">
            <p className="text-xs font-bold text-orange uppercase tracking-wider">
              Current Hackathon Demo Environment
            </p>
            <p className="text-xs text-forest/80 mt-0.5 leading-relaxed">
              Runs a local LLM (<code className="font-bold text-forest">Ollama llama3.1</code>) on-device to demonstrate real-time zero-data document parsing and PII stripping.
            </p>
          </div>
        </div>

        <p className="text-sm font-semibold text-forest/80 mb-6">
          <b className="text-forest">Pre-Launch Production Evaluation:</b> Before public launch across Dutch student cities, safeHouse will evaluate and transition to two enterprise zero-data architectures so end-users need zero local setup:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-cream/70 border border-forest/15 p-6 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0 font-display font-extrabold text-sm">
              01
            </div>
            <div>
              <h3 className="text-lg font-bold text-forest mb-1.5">
                In-Browser Client Execution (WebGPU &amp; WebLLM)
              </h3>
              <p className="text-sm text-forest/75 leading-relaxed">
                Running quantized small language models directly inside the user&apos;s browser cache via WebGPU acceleration—achieving 100% client-side verification with zero server roundtrips.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-cream/70 border border-forest/15 p-6 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0 font-display font-extrabold text-sm">
              02
            </div>
            <div>
              <h3 className="text-lg font-bold text-forest mb-1.5">
                Confidential Computing &amp; TEEs (Trusted Execution Environments)
              </h3>
              <p className="text-sm text-forest/75 leading-relaxed">
                Utilizing hardware-isolated secure enclaves (e.g., AWS Nitro Enclaves / Confidential Cloud) for mobile devices where hardware memory is cryptographically attested and wiped immediately after JSON metric extraction.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => go('login')}
        className="mt-14 bg-lime text-forest-deep font-bold text-lg rounded-full px-9 py-4 shadow-md hover:-translate-y-0.5 transition"
      >
        Try the demo
      </button>
    </main>
  )
}
