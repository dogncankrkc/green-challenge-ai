import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Chip,
  Cog,
  Grid,
  Home,
  HouseMark,
  Lock,
  Msg,
  Shield,
  Upload,
  Users,
} from '../../components/icons/Icons'
import { Sidebar, type NavItem } from '../../components/layout/Sidebar'
import {
  extractTextFromFile,
  LANDLORD_KADASTER_SAMPLE,
  verifyLandlordOwnershipWithLocalAI,
} from '../../services/ollamaService'
import { useAppStore, type LandlordTab } from '../../store/useAppStore'

export function LandlordDashboard() {
  const {
    landlordTab,
    setLandlordTab,
    landlordMatches,
    landlordListings,
    isLandlordVerified,
    landlordVerification,
    setLandlordVerification,
    toggleApproveMatch,
    chatThreads,
    activeChatId,
    setActiveChatId,
    sendMessage,
    isCreateListingModalOpen,
    setCreateListingModalOpen,
    addNewListing,
  } = useAppStore()

  const [notify, setNotify] = useState(true)
  const [chatDraft, setChatDraft] = useState('')

  // Landlord Ownership Verification State
  const [verifyPhase, setVerifyPhase] = useState<'idle' | 'processing' | 'done'>(
    isLandlordVerified ? 'done' : 'idle'
  )
  const [kadasterFile, setKadasterFile] = useState<string>(
    isLandlordVerified ? LANDLORD_KADASTER_SAMPLE.kadasterFileName : ''
  )
  const [permitFile, setPermitFile] = useState<string>(
    isLandlordVerified ? LANDLORD_KADASTER_SAMPLE.permitFileName : ''
  )
  const [customRawText, setCustomRawText] = useState<string>('')

  const kadasterInputRef = useRef<HTMLInputElement | null>(null)
  const permitInputRef = useRef<HTMLInputElement | null>(null)
  const ownershipSectionRef = useRef<HTMLDivElement | null>(null)

  // Create Listing Modal Form State
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('Groningen')
  const [rentNum, setRentNum] = useState('720')
  const [lifestyleFit, setLifestyleFit] = useState('Quiet & Tidy')
  const [listingType, setListingType] = useState<'Landlord Listing' | 'Student Sublet'>(
    'Landlord Listing'
  )

  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isCreateListingModalOpen && isLandlordVerified && !dialog.open) {
      dialog.showModal()
    } else if ((!isCreateListingModalOpen || !isLandlordVerified) && dialog.open) {
      dialog.close()
    }
  }, [isCreateListingModalOpen, isLandlordVerified])

  // Fallback for dialog[closedby="any"] light-dismiss in browsers without native closedBy support
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return

    const isOutside = (e: PointerEvent, el: HTMLDialogElement) => {
      const r = el.getBoundingClientRect()
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
    }

    let pressedOutside = false
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e, dialog)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e, dialog)) {
        dialog.close()
      }
    }

    dialog.addEventListener('pointerdown', onPointerDown)
    dialog.addEventListener('pointerup', onPointerUp)
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown)
      dialog.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  const scrollToOwnershipVerification = () => {
    if (landlordTab !== 'My Listings' && landlordTab !== 'Verify Ownership') {
      setLandlordTab('Verify Ownership')
      return
    }
    ownershipSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSimulateKadasterVerification = async () => {
    if (verifyPhase === 'processing') return
    if (!kadasterFile) setKadasterFile(LANDLORD_KADASTER_SAMPLE.kadasterFileName)
    if (!permitFile) setPermitFile(LANDLORD_KADASTER_SAMPLE.permitFileName)

    setVerifyPhase('processing')
    const rawPayload =
      customRawText.trim().length > 20
        ? customRawText
        : LANDLORD_KADASTER_SAMPLE.combinedContent

    const result = await verifyLandlordOwnershipWithLocalAI(rawPayload)
    setLandlordVerification(result)
    setVerifyPhase('done')
  }

  const handleLandlordDocUpload = async (
    slot: 'kadaster' | 'permit',
    file: File
  ) => {
    const text = await extractTextFromFile(file)
    if (slot === 'kadaster') {
      setKadasterFile(file.name)
    } else {
      setPermitFile(file.name)
    }
    setCustomRawText((prev) => `${prev}\n${text}`)
  }

  const handleCreateListingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLandlordVerified) return
    const cleanTitle = title.trim() || 'Korreweg 84 Studio'
    const cleanCity = city.trim() || 'Groningen'
    const parsedRent = parseInt(rentNum, 10) || 720

    addNewListing({
      title: cleanTitle,
      city: cleanCity,
      rentNum: parsedRent,
      lifestyleFit,
      listingType,
    })
    setTitle('')
    setRentNum('720')
  }

  const nav: NavItem[] = [
    [Grid, 'AI Matches', 'AI Matches', landlordMatches.length],
    [Home, 'My Listings', 'My Listings', landlordListings.length],
    [Shield, 'Verify Ownership', 'Verify Ownership'],
    [Users, 'Applicants', 'Applicants'],
    [Msg, 'Messages', 'Messages', chatThreads.length],
    [Cog, 'Settings', 'Settings'],
  ]

  const currentThread =
    chatThreads.find((t) => t.id === activeChatId) || chatThreads[0] || null

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentThread || !chatDraft.trim()) return
    sendMessage(currentThread.id, 'landlord', chatDraft)
    setChatDraft('')
  }

  const renderOwnershipVerificationSection = () => (
    <div
      ref={ownershipSectionRef}
      className="bg-white rounded-3xl p-8 max-w-3xl shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)] border-2 border-forest/10"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange">
          <Lock className="w-4 h-4" />
          Anti-Scam Dutch Compliance · Zero BSN Storage
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest/70 bg-cream px-3 py-1 rounded-full">
          <Chip className="w-3.5 h-3.5 text-orange" />
          Local AI: llama3.1
        </span>
      </div>

      <h2 className="text-2xl font-extrabold text-forest mb-2">
        Verify Property Ownership
      </h2>
      <p className="text-sm text-forest/70 mb-6 leading-relaxed">
        Prevent rental fraud under the Dutch <i>Wet goed verhuurderschap</i>. Upload your Kadaster extract and municipal rental permit—our Local AI verifies legal ownership while stripping private mortgage deeds and BSN numbers.
      </p>

      {/* Two Dutch Standard Proof Upload Slots */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <input
            ref={kadasterInputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            aria-label="Upload Kadaster Property Extract"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleLandlordDocUpload('kadaster', file)
            }}
          />
          <div
            onClick={() => kadasterInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                kadasterInputRef.current?.click()
              }
            }}
            role="button"
            tabIndex={0}
            className={`h-full cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition flex flex-col items-center justify-between ${
              kadasterFile
                ? 'border-forest bg-lime/20'
                : 'border-forest/35 bg-cream/60 hover:border-forest'
            }`}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange mb-2">
              Proof 1 · Legal Ownership
            </span>
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 ${
                kadasterFile ? 'bg-forest text-lime' : 'bg-lime text-forest-deep'
              }`}
            >
              {kadasterFile ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-forest">
                Kadaster Property Extract
              </h3>
              <p className="text-xs text-forest/65 mt-1">
                <i>Kadastraal Uittreksel / Eigendomsbewijs</i> — proves legal ownership of the address.
              </p>
            </div>
            {kadasterFile ? (
              <span className="mt-3 inline-block max-w-full truncate bg-forest text-lime text-[11px] font-bold px-3 py-1 rounded-full">
                ✓ {kadasterFile}
              </span>
            ) : (
              <span className="mt-3 text-xs font-bold text-orange">
                Click to upload PDF/TXT
              </span>
            )}
          </div>
        </div>

        <div>
          <input
            ref={permitInputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            aria-label="Upload Municipal Rental Permit"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleLandlordDocUpload('permit', file)
            }}
          />
          <div
            onClick={() => permitInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                permitInputRef.current?.click()
              }
            }}
            role="button"
            tabIndex={0}
            className={`h-full cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition flex flex-col items-center justify-between ${
              permitFile
                ? 'border-forest bg-lime/20'
                : 'border-forest/35 bg-cream/60 hover:border-forest'
            }`}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange mb-2">
              Proof 2 · Right to Rent
            </span>
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 ${
                permitFile ? 'bg-forest text-lime' : 'bg-lime text-forest-deep'
              }`}
            >
              {permitFile ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-forest">
                Municipal Rental Permit
              </h3>
              <p className="text-xs text-forest/65 mt-1">
                <i>Verhuurvergunning (Wet goed verhuurderschap)</i> — proves legal right to rent to students.
              </p>
            </div>
            {permitFile ? (
              <span className="mt-3 inline-block max-w-full truncate bg-forest text-lime text-[11px] font-bold px-3 py-1 rounded-full">
                ✓ {permitFile}
              </span>
            ) : (
              <span className="mt-3 text-xs font-bold text-orange">
                Click to upload PDF/TXT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* One-Click Demo Trigger Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          disabled={verifyPhase === 'processing'}
          onClick={() => void handleSimulateKadasterVerification()}
          className="bg-lime text-forest-deep font-extrabold text-sm rounded-full px-7 py-3.5 shadow-md hover:-translate-y-0.5 transition disabled:opacity-50"
        >
          {verifyPhase === 'processing'
            ? 'Local AI Verifying Kadaster & Permit…'
            : 'Simulate Kadaster & Permit PDF Verification'}
        </button>
        <span className="text-xs text-forest/60 font-medium">
          Strips mortgage amounts, owner BSN &amp; notary serials on-device.
        </span>
      </div>

      {verifyPhase !== 'idle' && (
        <div className="mt-6 flex items-start gap-5" role="status" aria-live="polite">
          <div className="w-40 shrink-0 pt-2">
            <div className="h-2.5 rounded-full bg-forest/10 overflow-hidden">
              <div
                className="h-full bg-lime rounded-full shadow-[0_0_10px_#dbff1f]"
                style={{
                  width: verifyPhase === 'done' ? '100%' : undefined,
                  animation:
                    verifyPhase === 'processing'
                      ? 'load 10s cubic-bezier(0.15, 0.8, 0.3, 1) forwards'
                      : undefined,
                }}
              />
            </div>
          </div>
          <p className="text-sm leading-relaxed text-forest/80">
            <b className="text-forest">
              Local AI verifying Kadaster &amp; Verhuurvergunning (up to 10s window)…
            </b>{' '}
            Private mortgage deed figures and owner BSN stripped locally.
          </p>
        </div>
      )}

      {verifyPhase === 'done' && landlordVerification && (
        <div className="mt-6 pt-6 border-t border-forest/10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-lime text-forest-deep text-xs font-extrabold rounded-full px-4 py-2 flex items-center gap-1.5 shadow-sm">
                <Shield className="w-4 h-4 text-forest-deep" />
                Kadaster Verified Owner
              </span>
              <span className="bg-forest text-lime text-xs font-extrabold rounded-full px-4 py-2">
                {landlordVerification.rental_permit}
              </span>
              <span className="bg-orange text-white text-xs font-extrabold rounded-full px-4 py-2">
                Mortgage &amp; BSN Stripped: 100%
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCreateListingModalOpen(true)}
              className="bg-orange text-white text-xs font-extrabold rounded-full px-5 py-2.5 shadow-md hover:brightness-110 transition"
            >
              + Create Sublet / Room Listing &rarr;
            </button>
          </div>

          <div className="bg-forest-deep text-cream rounded-2xl p-4 text-xs font-mono overflow-x-auto">
            <div className="flex items-center justify-between text-cream/60 mb-1.5 font-sans">
              <span className="font-bold text-lime">
                Zero-Data Property Verification (
                {landlordVerification.source === 'ollama'
                  ? 'Live Ollama llama3.1'
                  : 'Local AI Fallback Engine'}
                )
              </span>
              <span>Badge Awarded &amp; Listing Creation Unlocked</span>
            </div>
            <pre className="text-[11px] leading-relaxed text-lime/95">
              {JSON.stringify(
                {
                  is_verified_owner: true,
                  kadaster_status: landlordVerification.kadaster_status,
                  rental_permit: landlordVerification.rental_permit,
                  registered_municipality: landlordVerification.registered_municipality,
                  confidence_score: landlordVerification.confidence_score,
                  pii_stripped: landlordVerification.pii_stripped,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Sidebar
      label="Landlord"
      nav={nav}
      active={landlordTab}
      onSelect={(k) => setLandlordTab(k as LandlordTab)}
      note="Applicant identities stay hidden until you approve a match."
    >
      <main className="p-12 pb-28">
        {landlordTab === 'My Listings' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 max-w-3xl">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-extrabold">My Listings</h1>
                {isLandlordVerified && (
                  <span className="bg-lime text-forest-deep text-xs font-extrabold rounded-full px-3.5 py-1.5 flex items-center gap-1.5 shadow-sm">
                    <Shield className="w-4 h-4 text-forest-deep" />
                    Kadaster Verified Owner
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={!isLandlordVerified}
                onClick={() => setCreateListingModalOpen(true)}
                className={`font-bold rounded-full px-7 py-3 transition flex items-center gap-2 ${
                  isLandlordVerified
                    ? 'bg-orange text-white shadow-md hover:brightness-110'
                    : 'bg-forest/15 text-forest/45 cursor-not-allowed'
                }`}
              >
                <Lock className="w-4 h-4" />
                {isLandlordVerified
                  ? '+ Create Sublet / Room Listing'
                  : 'Create Sublet / Listing (Locked)'}
              </button>
            </div>

            {!isLandlordVerified && (
              <div className="mb-8 max-w-3xl rounded-2xl bg-orange/10 border-2 border-orange/40 p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange text-white flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-forest">
                      🔒 Verify Property Ownership (Kadaster &amp; Permit) Required Before Listing
                    </p>
                    <p className="text-xs text-forest/70 mt-0.5">
                      To protect Dutch students from rental scams, new listings are locked until your Kadaster deed &amp; municipal permit are verified via Local AI below.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={scrollToOwnershipVerification}
                  className="bg-orange text-white text-xs font-extrabold rounded-full px-5 py-2.5 shadow-sm hover:brightness-110 transition whitespace-nowrap"
                >
                  Verify Ownership Below &darr;
                </button>
              </div>
            )}

            <div className="space-y-4 max-w-3xl mb-10">
              {landlordListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-3xl p-6 shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)] flex items-center gap-5"
                >
                  <div className="w-16 h-16 rounded-2xl bg-forest flex items-center justify-center shrink-0">
                    <HouseMark className="w-9 h-9" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg truncate">{listing.title}</h3>
                      {listing.kadasterVerified && (
                        <span className="bg-lime text-forest-deep text-xs font-extrabold rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
                          <Shield className="w-3.5 h-3.5 text-forest-deep" />
                          Kadaster Verified Owner
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-forest/60 mt-0.5">
                      {listing.city} · {listing.rent} · {listing.matchesCount} AI matches · Fit: {listing.lifestyleFit}
                    </p>
                  </div>
                  <span className="bg-lime text-forest-deep text-xs font-bold rounded-full px-3 py-1.5">
                    {listing.status}
                  </span>
                </div>
              ))}
            </div>

            {renderOwnershipVerificationSection()}
          </>
        )}

        {landlordTab === 'Verify Ownership' && (
          <>
            <h1 className="text-4xl font-extrabold mb-8">Verify Property Ownership</h1>
            {renderOwnershipVerificationSection()}
          </>
        )}

        {landlordTab === 'Applicants' && (
          <>
            <h1 className="text-4xl font-extrabold mb-10">Applicants</h1>
            <div className="bg-white rounded-3xl p-10 max-w-3xl text-forest/70 shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)] mb-6">
              Applicants stay anonymous until you approve a match. Review them under{' '}
              <button
                type="button"
                onClick={() => setLandlordTab('AI Matches')}
                className="font-bold text-orange underline"
              >
                AI Matches
              </button>
              .
            </div>
            <div className="space-y-3 max-w-3xl">
              {landlordMatches.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-forest flex items-center justify-center text-lime font-bold text-sm">
                      {c.score}%
                    </div>
                    <div>
                      <p className="font-bold text-forest">
                        {c.approved ? c.revealedNames : c.anonymousTitle}
                      </p>
                      <p className="text-xs text-forest/60">
                        {c.programLevel} · {c.life}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold rounded-full px-3.5 py-1.5 ${
                      c.approved
                        ? 'bg-lime text-forest-deep'
                        : 'bg-cream text-forest/70'
                    }`}
                  >
                    {c.approved ? 'Identity Unlocked' : 'Anonymous (GDPR Protected)'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {landlordTab === 'Messages' && (
          <>
            <h1 className="text-4xl font-extrabold mb-10">Messages</h1>
            {!currentThread ? (
              <div className="bg-white rounded-3xl p-16 max-w-3xl text-center shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)]">
                <div className="mx-auto w-16 h-16 rounded-full bg-lime flex items-center justify-center mb-5">
                  <Msg className="w-7 h-7 text-forest-deep" />
                </div>
                <p className="text-xl font-bold mb-4">Approve matches to start chatting.</p>
                <button
                  type="button"
                  onClick={() => setLandlordTab('AI Matches')}
                  className="bg-forest text-cream text-xs font-bold rounded-full px-6 py-3 hover:bg-forest-deep transition"
                >
                  Go to AI Matches &rarr;
                </button>
              </div>
            ) : (
              <div className="max-w-4xl grid grid-cols-12 gap-6">
                <div className="col-span-4 space-y-3">
                  {chatThreads.map((t) => {
                    const active = t.id === currentThread.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveChatId(t.id)}
                        className={`w-full text-left rounded-2xl p-4 transition shadow-sm border-2 ${
                          active
                            ? 'bg-forest text-cream border-forest'
                            : 'bg-white text-forest border-transparent hover:border-lime'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-orange">
                            {t.listingTitle}
                          </span>
                          <span className="bg-lime text-forest-deep text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        </div>
                        <p className="font-bold text-sm truncate">{t.studentDisplayName}</p>
                        <p
                          className={`text-xs truncate mt-1 ${
                            active ? 'text-cream/70' : 'text-forest/60'
                          }`}
                        >
                          {t.messages[t.messages.length - 1]?.text}
                        </p>
                      </button>
                    )
                  })}
                </div>

                <div className="col-span-8 bg-white rounded-3xl p-7 shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)] flex flex-col min-h-[440px]">
                  <div className="pb-4 mb-4 border-b border-forest/10 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{currentThread.studentDisplayName}</h3>
                      <p className="text-xs text-forest/60 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-orange" />
                        {currentThread.unlockedAt} · Listing: {currentThread.listingTitle}
                      </p>
                    </div>
                    <span className="bg-lime text-forest-deep text-xs font-bold rounded-full px-3 py-1">
                      Contact Unlocked
                    </span>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto max-h-80 pr-1">
                    {currentThread.messages.map((m) => {
                      if (m.sender === 'system') {
                        return (
                          <div
                            key={m.id}
                            className="bg-lime/35 border border-lime rounded-2xl px-4 py-3 text-xs font-semibold text-forest-deep flex items-center gap-2.5"
                          >
                            <Lock className="w-4 h-4 shrink-0" />
                            <span>{m.text}</span>
                          </div>
                        )
                      }
                      const isMe = m.sender === 'landlord'
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[11px] font-bold text-forest/55 mb-1 px-1">
                            {m.senderName} · {m.timestamp}
                          </span>
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm max-w-md leading-relaxed ${
                              isMe
                                ? 'bg-forest text-cream rounded-br-sm'
                                : 'bg-cream text-forest rounded-bl-sm'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <form
                    onSubmit={handleSendChat}
                    className="mt-5 pt-4 border-t border-forest/10 flex gap-3"
                  >
                    <label htmlFor="landlord-chat-input" className="sr-only">
                      Message applicant
                    </label>
                    <input
                      id="landlord-chat-input"
                      name="message"
                      type="text"
                      value={chatDraft}
                      onChange={(e) => setChatDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.nativeEvent.isComposing) {
                          e.preventDefault()
                        }
                      }}
                      placeholder="Message verified student(s)…"
                      className="flex-1 rounded-full border-2 border-forest/20 bg-cream/50 px-5 py-3 text-sm outline-none focus:border-forest focus:bg-white transition"
                    />
                    <button
                      type="submit"
                      className="bg-orange text-white font-bold text-sm rounded-full px-6 py-3 shadow-md hover:brightness-110 transition"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {landlordTab === 'Settings' && (
          <>
            <h1 className="text-4xl font-extrabold mb-10">Settings</h1>
            <div className="bg-white rounded-3xl p-8 max-w-3xl flex items-center justify-between shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)]">
              <div>
                <p className="font-bold">Email Notifications</p>
                <p className="text-sm text-forest/60">Get notified about new AI matches.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notify}
                aria-label="Toggle email notifications"
                onClick={() => setNotify(!notify)}
                className={`w-14 h-8 rounded-full p-1 transition ${
                  notify ? 'bg-forest' : 'bg-forest/20'
                }`}
              >
                <span
                  className={`block w-6 h-6 rounded-full transition-transform ${
                    notify ? 'translate-x-6 bg-lime' : 'bg-white'
                  }`}
                />
              </button>
            </div>
          </>
        )}

        {landlordTab === 'AI Matches' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <p className="text-sm font-bold text-orange uppercase tracking-widest">
                AI Matchmaker
              </p>
              {isLandlordVerified ? (
                <span className="bg-lime text-forest-deep text-xs font-extrabold rounded-full px-3.5 py-1 flex items-center gap-1.5 shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-forest-deep" />
                  Zernikepark 27 B · Kadaster Verified Owner
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setLandlordTab('Verify Ownership')}
                  className="text-xs font-bold text-orange underline hover:text-forest transition"
                >
                  🔒 Verify Property Ownership (Kadaster &amp; Permit) &rarr;
                </button>
              )}
            </div>
            <h1 className="text-4xl font-extrabold mb-10 max-w-3xl">
              Your Top {landlordMatches.length} AI Matches for Zernikepark 27 B
            </h1>
            <div className="grid grid-cols-3 gap-7">
              {landlordMatches.map((c) => {
                const ok = c.approved
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-3xl p-7 shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)] flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 rounded-full bg-forest flex items-center justify-center">
                        <Users className="w-7 h-7 text-lime" />
                      </div>
                      {ok ? (
                        <span className="bg-lime text-forest-deep text-xs font-extrabold rounded-full px-3 py-1 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Double Opt-In
                        </span>
                      ) : (
                        <span className="bg-cream text-forest/70 text-xs font-bold rounded-full px-3 py-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          Identity Hidden
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold leading-snug mb-2">
                      {ok ? c.revealedNames : c.anonymousTitle}
                    </h3>
                    <p className="text-xs text-forest/60 font-semibold mb-4">
                      {c.programLevel}
                    </p>

                    {ok && (
                      <div className="mb-4 rounded-2xl bg-lime/35 border border-lime p-3.5 text-xs text-forest-deep">
                        <p className="font-extrabold">Verified Identity Unlocked:</p>
                        <p className="mt-0.5 font-semibold">{c.revealedNames}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="bg-lime text-forest-deep text-xs font-bold rounded-full px-3 py-1.5">
                        AI Match Score: {c.score}%
                      </span>
                      <span className="bg-orange text-white text-xs font-bold rounded-full px-3 py-1.5">
                        {c.budgetLabel}
                      </span>
                      <span className="bg-lime/50 text-forest-deep text-xs font-bold rounded-full px-3 py-1.5">
                        Lifestyle: {c.life}
                      </span>
                    </div>

                    <div className="mt-auto space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleApproveMatch(c.id)}
                        className={`w-full rounded-xl py-3.5 text-sm font-bold transition ${
                          ok
                            ? 'bg-lime text-forest-deep'
                            : 'bg-forest text-cream hover:bg-forest-deep'
                        }`}
                      >
                        {ok ? 'Contact Unlocked' : 'Approve Match to Unlock Contact'}
                      </button>
                      {ok && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChatId(c.id)
                            setLandlordTab('Messages')
                          }}
                          className="w-full rounded-xl py-2.5 text-xs font-extrabold bg-orange text-white hover:brightness-110 transition"
                        >
                          Open Unlocked Chat in Messages &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Native Modal Dialog for Creating a Sublet / Listing */}
        <dialog
          ref={dialogRef}
          id="create-listing-dialog"
          aria-labelledby="create-listing-title"
          {...({ closedby: 'any' } as Record<string, string>)}
          onClose={() => {
            if (dialogRef.current) {
              dialogRef.current.returnValue = ''
            }
            setCreateListingModalOpen(false)
          }}
          className="m-auto rounded-[32px] bg-white text-forest p-10 shadow-2xl w-full max-w-lg border-0"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange mb-1">
                Kadaster Verified Owner Listing
              </p>
              <h2 id="create-listing-title" className="text-2xl font-extrabold">
                Create Sublet or Room Listing
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCreateListingModalOpen(false)}
              aria-label="Close modal"
              className="w-9 h-9 rounded-full bg-cream text-forest font-bold hover:bg-lime transition"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateListingSubmit} className="space-y-5">
            <fieldset>
              <legend className="block font-bold text-sm mb-2">Listing Category</legend>
              <div className="grid grid-cols-2 gap-3">
                {(['Landlord Listing', 'Student Sublet'] as const).map((typeOpt) => (
                  <button
                    key={typeOpt}
                    type="button"
                    onClick={() => setListingType(typeOpt)}
                    aria-pressed={listingType === typeOpt}
                    className={`rounded-xl py-2.5 px-4 text-xs font-bold border-2 transition ${
                      listingType === typeOpt
                        ? 'bg-lime border-lime text-forest-deep'
                        : 'border-forest/20 text-forest/70 hover:border-forest'
                    }`}
                  >
                    {typeOpt}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="listing-title-input" className="block font-bold text-sm mb-1.5">
                Street Address or Room Title
              </label>
              <input
                id="listing-title-input"
                name="title"
                type="text"
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Korreweg 84 Studio"
                className="w-full rounded-xl border-2 border-forest/20 bg-cream/50 px-4 py-3 outline-none focus:border-forest focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="listing-city-input" className="block font-bold text-sm mb-1.5">
                  Student City
                </label>
                <input
                  id="listing-city-input"
                  name="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Groningen"
                  className="w-full rounded-xl border-2 border-forest/20 bg-cream/50 px-4 py-3 outline-none focus:border-forest focus:bg-white transition"
                />
              </div>
              <div>
                <label htmlFor="listing-rent-input" className="block font-bold text-sm mb-1.5">
                  Monthly Rent (€)
                </label>
                <input
                  id="listing-rent-input"
                  name="rent"
                  type="text"
                  inputMode="numeric"
                  required
                  value={rentNum}
                  onChange={(e) => setRentNum(e.target.value)}
                  placeholder="720"
                  className="w-full rounded-xl border-2 border-forest/20 bg-cream/50 px-4 py-3 outline-none focus:border-forest focus:bg-white transition"
                />
              </div>
            </div>

            <fieldset>
              <legend className="block font-bold text-sm mb-2">Ideal Household Lifestyle</legend>
              <div className="flex flex-wrap gap-2">
                {['Quiet & Tidy', 'Early Riser', 'Social & Tidy', 'Night Owl'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setLifestyleFit(tag)}
                    aria-pressed={lifestyleFit === tag}
                    className={`rounded-full px-4 py-2 text-xs font-bold border-2 transition ${
                      lifestyleFit === tag
                        ? 'bg-lime border-lime text-forest-deep'
                        : 'border-forest/20 hover:border-forest'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreateListingModalOpen(false)}
                className="rounded-full px-6 py-3 text-sm font-bold text-forest/70 hover:bg-cream transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange text-white font-bold text-sm rounded-full px-8 py-3 shadow-md hover:brightness-110 transition"
              >
                Publish Verified Listing
              </button>
            </div>
          </form>
        </dialog>
      </main>
    </Sidebar>
  )
}
