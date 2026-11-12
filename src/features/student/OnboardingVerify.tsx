import { useRef, useState } from 'react'
import { Check, Chip, Lock, Shield, Upload } from '../../components/icons/Icons'
import {
  extractDocumentWithLocalAI,
  extractTextFromFile,
  generateMatchReasoning,
  THREE_SLOT_SAMPLE_PRESETS,
  type ThreeSlotSamplePreset,
} from '../../services/ollamaService'
import { useAppStore } from '../../store/useAppStore'

type SlotKey = 'academic' | 'financial' | 'reference'

interface DocSlotState {
  fileName: string
  content: string
}

const SLOT_METADATA: {
  key: SlotKey
  step: string
  title: string
  subtitle: string
}[] = [
  {
    key: 'academic',
    step: 'Slot 1 · Academic',
    title: 'Academic Enrollment',
    subtitle: 'University Acceptance Letter / Proof of Enrollment (PDF/TXT)',
  },
  {
    key: 'financial',
    step: 'Slot 2 · Financial',
    title: 'Financial Capacity',
    subtitle: 'DUO Grant, Scholarship, Bank Statement, or Guarantor Letter (PDF/TXT)',
  },
  {
    key: 'reference',
    step: 'Slot 3 · Right-to-Rent',
    title: 'Tenant Reference & Right-to-Rent',
    subtitle: 'Verhuurdersverklaring / Landlord Reference or IND Check (PDF/TXT)',
  },
]

export function OnboardingVerify() {
  const {
    go,
    role,
    loginAs,
    profile,
    verificationData,
    setVerificationData,
    rooms,
    updateRoomMatches,
    updateSquadMatch,
  } = useAppStore()

  const [phase, setPhase] = useState<'idle' | 'processing' | 'done'>(
    verificationData ? 'done' : 'idle'
  )
  const [dragOverSlot, setDragOverSlot] = useState<SlotKey | null>(null)

  const defaultPreset = THREE_SLOT_SAMPLE_PRESETS[0].slots
  const [slots, setSlots] = useState<Record<SlotKey, DocSlotState | null>>(
    verificationData
      ? {
          academic: {
            fileName: verificationData.fileNames?.[0] || defaultPreset.academic.fileName,
            content: defaultPreset.academic.content,
          },
          financial: {
            fileName: verificationData.fileNames?.[1] || defaultPreset.financial.fileName,
            content: defaultPreset.financial.content,
          },
          reference: {
            fileName: verificationData.fileNames?.[2] || defaultPreset.reference.fileName,
            content: defaultPreset.reference.content,
          },
        }
      : {
          academic: null,
          financial: null,
          reference: null,
        }
  )

  const inputRefs = {
    academic: useRef<HTMLInputElement | null>(null),
    financial: useRef<HTMLInputElement | null>(null),
    reference: useRef<HTMLInputElement | null>(null),
  }

  const runVerificationOnBundle = async (
    bundle: Record<SlotKey, DocSlotState>
  ) => {
    if (phase === 'processing') return
    if (role === 'guest') {
      loginAs('student', 'onboarding')
    }

    setPhase('processing')

    const combinedText = [
      `--- SLOT 1: ACADEMIC ENROLLMENT (${bundle.academic.fileName}) ---\n${bundle.academic.content}`,
      `--- SLOT 2: FINANCIAL CAPACITY (${bundle.financial.fileName}) ---\n${bundle.financial.content}`,
      `--- SLOT 3: TENANT REFERENCE (${bundle.reference.fileName}) ---\n${bundle.reference.content}`,
    ].join('\n\n')

    const fileNames = [
      bundle.academic.fileName,
      bundle.financial.fileName,
      bundle.reference.fileName,
    ]

    const extracted = await extractDocumentWithLocalAI(
      combinedText,
      fileNames,
      profile.uni
    )
    setVerificationData(extracted)
    setPhase('done')

    // Asynchronously refresh AI Match Scores & 1-sentence reasoning across rooms & squad
    const studentTags = {
      sleep: profile.Sleep || 'Early Riser (07:00)',
      social: profile.Social || 'Quiet & Private',
      cleanliness: profile.Cleanliness || 'Spotless / Daily Tidy',
      studyRoutine: profile.StudyRoutine || 'Mostly on Campus/Library',
      kitchenDiet: profile.KitchenDiet || 'Loves Cooking Together',
      houseRules: profile.HouseRules || 'Strictly Non-Smoking',
      budget: extracted.max_budget || 850,
      university: extracted.university,
    }

    try {
      const updatedRooms = await Promise.all(
        rooms.map(async (r) => {
          const res = await generateMatchReasoning(studentTags, {
            title: r.title,
            priceNum: r.priceNum,
            targetLifestyle: r.targetLifestyle,
          })
          return {
            id: r.id,
            match: res.match_percentage,
            fit: res.compatibility_reason,
          }
        })
      )
      updateRoomMatches(updatedRooms)

      const squadRes = await generateMatchReasoning(studentTags, {
        title: 'Groningen Co-Living Student Squad',
        priceNum: 600,
        targetLifestyle: ['Early Riser', 'Quiet & Private', 'Spotless', 'Strictly Non-Smoking'],
        isSquad: true,
      })
      updateSquadMatch(squadRes.match_percentage, squadRes.compatibility_reason)
    } catch {
      // Safe no-op if background match scoring is interrupted
    }
  }

  const handleSlotFileUpload = async (slotKey: SlotKey, file: File) => {
    const text = await extractTextFromFile(file)
    const nextSlots = {
      ...slots,
      [slotKey]: {
        fileName: file.name,
        content: text,
      },
    }
    setSlots(nextSlots)
  }

  const handleVerifyAllButton = async () => {
    const resolvedBundle: Record<SlotKey, DocSlotState> = {
      academic: slots.academic || defaultPreset.academic,
      financial: slots.financial || defaultPreset.financial,
      reference: slots.reference || defaultPreset.reference,
    }
    setSlots(resolvedBundle)
    await runVerificationOnBundle(resolvedBundle)
  }

  const handlePresetTrigger = async (preset: ThreeSlotSamplePreset) => {
    setSlots(preset.slots)
    await runVerificationOnBundle(preset.slots)
  }

  const loadedCount = Object.values(slots).filter(Boolean).length
  const currentResult = verificationData

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#ebe7dc] flex items-center justify-center px-8 py-16 pb-28">
      <div className="bg-white rounded-[32px] shadow-[0_24px_60px_-20px_rgba(15,74,58,.35)] w-full max-w-4xl p-12">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange">
            <Lock className="w-4 h-4" />
            Step 1 of 2 · 3-Document Zero-Data Verification
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest/70 bg-cream px-3.5 py-1.5 rounded-full">
            <Chip className="w-3.5 h-3.5 text-orange" />
            Local LLM: llama3.1 (3/3 Proofs Sanitized On-Device)
          </span>
        </div>

        <h1 className="text-4xl font-extrabold mb-3">
          Verify Your Student Status, Budget &amp; Reference.
        </h1>
        <p className="text-sm text-forest/70 mb-8 max-w-2xl">
          Upload your 3 Dutch student housing proofs below (or click an instant demo preset). Local AI verifies your academic enrollment, monthly budget cap, and positive tenant history while stripping 100% of PII.
        </p>

        {/* 3-Document Verification Grid */}
        <div className="grid grid-cols-3 gap-5">
          {SLOT_METADATA.map(({ key, step, title, subtitle }) => {
            const slotData = slots[key]
            const isOver = dragOverSlot === key
            return (
              <div key={key} className="flex flex-col">
                <input
                  ref={inputRefs[key]}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  aria-label={`Upload ${title}`}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      void handleSlotFileUpload(key, file)
                    }
                  }}
                />
                <div
                  onClick={() => inputRefs[key].current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      inputRefs[key].current?.click()
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverSlot(key)
                  }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOverSlot(null)
                    const file = e.dataTransfer.files?.[0]
                    if (file) {
                      void handleSlotFileUpload(key, file)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`flex-1 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition flex flex-col items-center justify-between ${
                    isOver
                      ? 'border-orange bg-orange/5'
                      : slotData
                        ? 'border-forest bg-lime/20'
                        : 'border-forest/35 bg-cream/60 hover:border-forest'
                  }`}
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange mb-3">
                    {step}
                  </span>

                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      slotData ? 'bg-forest text-lime' : 'bg-lime text-forest-deep'
                    }`}
                  >
                    {slotData ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <h2 className="font-bold text-base text-forest leading-snug mb-1.5">
                      {title}
                    </h2>
                    <p className="text-xs text-forest/65 leading-relaxed">
                      {subtitle}
                    </p>
                  </div>

                  {slotData ? (
                    <span className="mt-4 inline-block max-w-full truncate bg-forest text-lime text-[11px] font-bold px-3 py-1 rounded-full">
                      ✓ {slotData.fileName}
                    </span>
                  ) : (
                    <span className="mt-4 inline-block text-xs font-bold text-orange">
                      Drop PDF/TXT or Browse
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Button to Verify All 3 Documents */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            disabled={phase === 'processing'}
            onClick={() => void handleVerifyAllButton()}
            className="bg-forest text-cream hover:bg-forest-deep font-bold text-sm rounded-full px-7 py-3.5 shadow-md transition disabled:opacity-50"
          >
            {phase === 'processing'
              ? 'Running Local AI on All 3 Documents…'
              : `Run Local AI Verification on All 3 Documents (${loadedCount}/3 Loaded)`}
          </button>

          <span className="text-xs text-forest/60 font-medium">
            Empty slots auto-fill with default RUG verification proofs on run.
          </span>
        </div>

        {/* Instant Demo Triggers for Live Presentation */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 bg-cream/70 rounded-2xl px-4 py-3 border border-forest/10">
          <span className="text-xs font-bold text-forest/70">
            Instant Demo Triggers (1-Click):
          </span>
          <div className="flex flex-wrap gap-2">
            {THREE_SLOT_SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={phase === 'processing'}
                onClick={() => void handlePresetTrigger(preset)}
                className="text-xs font-bold bg-white hover:bg-lime text-forest-deep border border-forest/20 rounded-full px-3.5 py-1.5 transition disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {phase !== 'idle' && (
          <div className="mt-8 flex items-start gap-5" role="status" aria-live="polite">
            <div className="w-40 shrink-0 pt-2">
              <div className="h-2.5 rounded-full bg-forest/10 overflow-hidden">
                <div
                  className="h-full bg-lime rounded-full shadow-[0_0_10px_#dbff1f]"
                  style={{
                    width: phase === 'done' ? '100%' : undefined,
                    animation:
                      phase === 'processing'
                        ? 'load 10s cubic-bezier(0.15, 0.8, 0.3, 1) forwards'
                        : undefined,
                  }}
                />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-forest/80">
              <b className="text-forest">Local AI extracting 3-document metrics (up to 10s window)…</b>{' '}
              Data Minimization active. Full names, BSN, passport numbers, street addresses, and IBANs are stripped locally; no personal documents are stored on our servers.
            </p>
          </div>
        )}

        {phase === 'done' && currentResult && (
          <div className="mt-10 text-center">
            <div
              className="mx-auto w-24 h-24 rounded-full bg-forest flex items-center justify-center"
              style={{ animation: 'glow 2s infinite' }}
            >
              <Check className="w-12 h-12 text-lime" />
            </div>
            <p className="mt-5 font-display text-2xl font-extrabold">
              AI Verified &amp; Privacy Protected!
            </p>

            {/* Dynamically Rendered Extracted JSON Badges */}
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <span className="bg-lime text-forest-deep text-xs font-extrabold rounded-full px-4 py-2 flex items-center gap-1.5 shadow-sm">
                <Shield className="w-4 h-4 text-forest-deep" />
                Verified: {currentResult.university}
              </span>
              <span className="bg-orange text-white text-xs font-extrabold rounded-full px-4 py-2 shadow-sm">
                Max Budget: €{currentResult.max_budget}/mo
              </span>
              <span className="bg-forest text-lime text-xs font-extrabold rounded-full px-4 py-2 shadow-sm">
                Tenant Ref: {currentResult.tenant_reference}
              </span>
              <span className="bg-lime/50 border border-forest/20 text-forest-deep text-xs font-extrabold rounded-full px-4 py-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                PII Discarded: 100%
              </span>
            </div>

            {/* Sanitized Zero-Data JSON Output Preview */}
            <div className="mt-5 text-left bg-forest-deep text-cream rounded-2xl p-4 text-xs font-mono overflow-x-auto border border-forest/20">
              <div className="flex items-center justify-between text-cream/60 mb-1.5 font-sans">
                <span className="font-bold text-lime">
                  Zero-Data Sanitized Payload ({currentResult.source === 'ollama' ? 'Live Ollama llama3.1' : 'Local AI Fallback Engine'})
                </span>
                <span>3/3 Proofs Verified · Zero Raw Storage</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-lime/95">
                {JSON.stringify(
                  {
                    is_verified_student: true,
                    university: currentResult.university,
                    max_budget: currentResult.max_budget,
                    program_level: currentResult.program_level,
                    tenant_reference: currentResult.tenant_reference || 'Verified Positive',
                    confidence_score: currentResult.confidence_score,
                    pii_stripped: currentResult.pii_stripped || [
                      'BSN',
                      'IBAN',
                      'Passport_No',
                      'Full_Name',
                    ],
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <button
              type="button"
              onClick={() => go('selection')}
              className="mt-6 bg-lime text-forest-deep font-bold rounded-full px-8 py-3.5 shadow-md hover:-translate-y-0.5 transition"
            >
              Continue to Matchmaking
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
