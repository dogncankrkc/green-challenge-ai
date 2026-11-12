import { useState, type ReactNode } from 'react'
import {
  Cog,
  Home,
  HouseMark,
  Lock,
  Msg,
  Shield,
  Sparkle,
  Users,
} from '../../components/icons/Icons'
import { Sidebar, type NavItem } from '../../components/layout/Sidebar'
import { useAppStore, type Screen } from '../../store/useAppStore'
import { ProfileFields } from './ProfileBuilder'
import { SoloSearch } from './SoloSearch'
import { SquadMatch } from './SquadMatch'

function SectionContainer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="w-full px-4 py-8 md:p-12 pb-28">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 md:mb-10">{title}</h1>
      {children}
    </main>
  )
}

function StudentRequestsView() {
  const { studentRequests, go } = useAppStore()

  return (
    <SectionContainer title="My Requests">
      <div className="space-y-4 max-w-3xl">
        {studentRequests.map((req) => {
          const isApproved = req.status.includes('Approved')
          return (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-6 shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)] flex items-center gap-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center shrink-0">
                <HouseMark className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{req.title}</h3>
                <p className="text-sm text-forest/60">{req.dateLabel}</p>
              </div>
              {isApproved ? (
                <button
                  type="button"
                  onClick={() => go('student-messages')}
                  className="bg-orange text-white text-xs font-extrabold rounded-full px-4 py-2 shadow-sm hover:brightness-110 transition"
                >
                  {req.status} &rarr;
                </button>
              ) : (
                <span className="bg-lime text-forest-deep text-xs font-bold rounded-full px-3 py-1.5">
                  {req.status}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </SectionContainer>
  )
}

function StudentMessagesView() {
  const { chatThreads, activeChatId, setActiveChatId, sendMessage, go } = useAppStore()
  const [draft, setDraft] = useState('')

  const currentThread =
    chatThreads.find((t) => t.id === activeChatId) || chatThreads[0] || null

  if (!currentThread) {
    return (
      <SectionContainer title="Messages">
        <div className="bg-white rounded-3xl p-16 max-w-3xl text-center shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)]">
          <div className="mx-auto w-16 h-16 rounded-full bg-lime flex items-center justify-center mb-5">
            <Msg className="w-7 h-7 text-forest-deep" />
          </div>
          <p className="text-xl font-bold mb-2">
            Chats unlock when a landlord approves your request.
          </p>
          <p className="text-sm text-forest/65 max-w-md mx-auto mb-6">
            Double Opt-In Privacy protects your identity until a landlord approves your anonymous AI match card.
          </p>
          <button
            type="button"
            onClick={() => go('dashboard')}
            className="bg-forest text-cream text-xs font-bold rounded-full px-6 py-3 hover:bg-forest-deep transition"
          >
            Switch to Landlord View to Approve a Match &rarr;
          </button>
        </div>
      </SectionContainer>
    )
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    sendMessage(currentThread.id, 'student', draft)
    setDraft('')
  }

  return (
    <SectionContainer title="Messages">
      <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Thread list */}
        <div className="lg:col-span-4 space-y-3">
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
                    Unlocked
                  </span>
                </div>
                <p className="font-bold text-sm truncate">{t.landlordDisplayName}</p>
                <p className={`text-xs truncate mt-1 ${active ? 'text-cream/70' : 'text-forest/60'}`}>
                  {t.messages[t.messages.length - 1]?.text}
                </p>
              </button>
            )
          })}
        </div>

        {/* Active conversation */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-7 shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)] flex flex-col min-h-[440px]">
          <div className="pb-4 mb-4 border-b border-forest/10 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{currentThread.landlordDisplayName}</h3>
              <p className="text-xs text-forest/60 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange" />
                Listing: {currentThread.listingTitle} · Double Opt-In Verified
              </p>
            </div>
            <span className="bg-lime text-forest-deep text-xs font-bold rounded-full px-3 py-1">
              Identity Revealed
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
              const isMe = m.sender === 'student'
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

          <form onSubmit={handleSend} className="mt-5 pt-4 border-t border-forest/10 flex gap-3">
            <label htmlFor="student-chat-input" className="sr-only">
              Write a message to the landlord
            </label>
            <input
              id="student-chat-input"
              name="message"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.nativeEvent.isComposing) {
                  e.preventDefault()
                }
              }}
              placeholder="Write a reply to schedule your viewing…"
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
    </SectionContainer>
  )
}

function StudentSettingsView() {
  const { profile, setProfile } = useAppStore()
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
  }

  return (
    <SectionContainer title="Profile & Settings">
      <form
        onSubmit={handleSave}
        aria-label="Student Profile and Lifestyle Settings"
        className="bg-white rounded-3xl p-10 max-w-2xl shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)]"
      >
        <ProfileFields
          profile={profile}
          setProfile={(p) => {
            setProfile(p)
            setSaved(false)
          }}
        />
        <button
          type="submit"
          className="mt-8 bg-forest text-cream font-bold rounded-full px-8 py-3.5 hover:bg-forest-deep transition"
        >
          {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </form>
    </SectionContainer>
  )
}

export function StudentDashboard() {
  const { screen, go, studentRequests, chatThreads } = useAppStore()

  const nav: NavItem[] = [
    [Home, 'Find Rooms', 'solo'],
    [Users, 'My Roommate Squad', 'squad'],
    [Sparkle, 'My Requests', 'requests', studentRequests.length],
    [Msg, 'Messages', 'student-messages', chatThreads.length],
    [Cog, 'Profile & Settings', 'student-settings'],
  ]

  return (
    <Sidebar
      label="Student"
      nav={nav}
      active={screen}
      onSelect={(k) => go(k as Screen)}
      note="Your name stays hidden from landlords until you both approve a match."
    >
      {screen === 'solo' && <SoloSearch />}
      {screen === 'squad' && <SquadMatch />}
      {screen === 'requests' && <StudentRequestsView />}
      {screen === 'student-messages' && <StudentMessagesView />}
      {screen === 'student-settings' && <StudentSettingsView />}
    </Sidebar>
  )
}

