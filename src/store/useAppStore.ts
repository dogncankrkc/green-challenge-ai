import { create } from 'zustand'
import type { ExtractedStudentData, LandlordOwnershipData } from '../services/ollamaService'

export type Role = 'guest' | 'student' | 'landlord'

export type Screen =
  | 'landing'
  | 'onboarding'
  | 'login'
  | 'profile'
  | 'ai-info'
  | 'selection'
  | 'solo'
  | 'requests'
  | 'student-messages'
  | 'student-settings'
  | 'dashboard'
  | 'squad'

export type LandlordTab =
  | 'AI Matches'
  | 'My Listings'
  | 'Verify Ownership'
  | 'Applicants'
  | 'Messages'
  | 'Settings'

export interface StudentProfile {
  first: string
  last: string
  uni: string
  Sleep: string
  Social: string
  Cleanliness: string
  StudyRoutine: string
  KitchenDiet: string
  HouseRules: string
  [key: string]: string
}

export interface RoomListing {
  id: number
  title: string
  city: string
  address: string
  price: string
  priceNum: number
  match: number
  fit: string
  g: string
  targetLifestyle: string[]
  listingType: 'Landlord Listing' | 'Student Sublet'
  kadasterVerified?: boolean
}

export interface StudentRequest {
  id: number
  roomId?: number
  matchCardId?: number
  title: string
  dateLabel: string
  status: 'Pending' | 'Under review' | 'Approved · Chat Unlocked'
}

export interface ApplicantMatchCard {
  id: number
  anonymousTitle: string
  revealedNames: string
  score: number
  life: string
  budgetLabel: string
  listingTitle: string
  isGroup: boolean
  programLevel: string
  approved: boolean
}

export interface LandlordListing {
  id: number
  title: string
  city: string
  rent: string
  matchesCount: number
  status: 'Active' | 'Sublet Open'
  lifestyleFit: string
  kadasterVerified: boolean
}

export interface ChatMessage {
  id: string
  sender: 'landlord' | 'student' | 'system'
  senderName: string
  text: string
  timestamp: string
}

export interface ChatThread {
  id: number
  matchCardId: number
  listingTitle: string
  studentDisplayName: string
  landlordDisplayName: string
  unlockedAt: string
  messages: ChatMessage[]
}

interface AppState {
  screen: Screen
  role: Role
  landlordTab: LandlordTab
  profile: StudentProfile
  verificationData: ExtractedStudentData | null
  landlordVerification: LandlordOwnershipData | null
  rooms: RoomListing[]
  sentRoomIds: number[]
  squadApplied: boolean
  squadReasoning: string
  squadMatchScore: number
  studentRequests: StudentRequest[]
  landlordMatches: ApplicantMatchCard[]
  landlordListings: LandlordListing[]
  chatThreads: ChatThread[]
  activeChatId: number | null
  isCreateListingModalOpen: boolean

  // Navigation & Auth Actions
  go: (screen: Screen) => void
  loginAs: (role: Role, targetScreen: Screen) => void
  logout: () => void
  setLandlordTab: (tab: LandlordTab) => void
  setCreateListingModalOpen: (open: boolean) => void

  // Profile & Verification Actions
  setProfile: (profile: StudentProfile) => void
  setVerificationData: (data: ExtractedStudentData) => void
  setLandlordVerification: (data: LandlordOwnershipData) => void
  updateRoomMatches: (updates: { id: number; match: number; fit: string }[]) => void
  updateSquadMatch: (score: number, reason: string) => void

  // Interactive Flows
  toggleRoomRequest: (roomId: number) => void
  applyAsSquad: () => void
  toggleApproveMatch: (matchCardId: number) => void
  addNewListing: (payload: {
    title: string
    city: string
    rentNum: number
    lifestyleFit: string
    listingType: 'Landlord Listing' | 'Student Sublet'
  }) => void
  sendMessage: (threadId: number, sender: 'landlord' | 'student', text: string) => void
  setActiveChatId: (id: number | null) => void
}

const INITIAL_PROFILE: StudentProfile = {
  first: 'Emma',
  last: 'van den Berg',
  uni: 'University of Groningen',
  Sleep: 'Early Riser (07:00)',
  Social: 'Quiet & Private',
  Cleanliness: 'Spotless / Daily Tidy',
  StudyRoutine: 'Mostly on Campus/Library',
  KitchenDiet: 'Loves Cooking Together',
  HouseRules: 'Strictly Non-Smoking',
}

const INITIAL_ROOMS: RoomListing[] = [
  {
    id: 1,
    title: 'Private Studio in Groningen',
    city: 'Groningen',
    address: 'Zernikepark 27 B',
    price: '€750/month',
    priceNum: 750,
    match: 98,
    fit: 'Fits your quiet lifestyle & non-smoking rule',
    g: 'from-forest to-[#2b7a5f]',
    targetLifestyle: ['Early Riser', 'Quiet & Private', 'Spotless', 'Strictly Non-Smoking'],
    listingType: 'Landlord Listing',
    kadasterVerified: false,
  },
  {
    id: 2,
    title: 'Bright Room in Utrecht Centrum',
    city: 'Utrecht',
    address: 'Oudegracht 114',
    price: '€680/month',
    priceNum: 680,
    match: 94,
    fit: 'Close to campus · shared house dinners',
    g: 'from-[#2b7a5f] to-forest-deep',
    targetLifestyle: ['Early Riser', 'Clean Shared Spaces', 'Mostly on Campus/Library'],
    listingType: 'Landlord Listing',
    kadasterVerified: true,
  },
  {
    id: 3,
    title: 'Canal-side Room in Amsterdam',
    city: 'Amsterdam',
    address: 'Prinsengracht 402',
    price: '€820/month',
    priceNum: 820,
    match: 91,
    fit: 'Within your verified budget',
    g: 'from-forest-deep to-forest',
    targetLifestyle: ['Quiet & Private', 'Spotless', 'Strictly Non-Smoking'],
    listingType: 'Student Sublet',
    kadasterVerified: true,
  },
]

const INITIAL_REQUESTS: StudentRequest[] = [
  {
    id: 1,
    roomId: 1,
    matchCardId: 104,
    title: 'Private Studio in Groningen',
    dateLabel: 'Sent 2 days ago',
    status: 'Pending',
  },
  {
    id: 2,
    roomId: 2,
    matchCardId: 88,
    title: 'Bright Room in Utrecht Centrum',
    dateLabel: 'Sent 5 days ago',
    status: 'Under review',
  },
]

const INITIAL_LANDLORD_MATCHES: ApplicantMatchCard[] = [
  {
    id: 104,
    anonymousTitle: 'Verified Student Group #104',
    revealedNames: 'Emma van den Berg, Lucas Meyer, Noah Bakker & Milan Visser',
    score: 94,
    life: 'Quiet & Tidy · Non-Smoking',
    budgetLabel: 'Budget: AI Verified',
    listingTitle: 'Zernikepark 27 B',
    isGroup: true,
    programLevel: 'MSc & BSc · University of Groningen',
    approved: false,
  },
  {
    id: 88,
    anonymousTitle: 'Verified Exchange Student #88',
    revealedNames: 'Sofia Lindqvist (Uppsala → RUG Exchange)',
    score: 91,
    life: 'Early Riser · Campus Study',
    budgetLabel: 'Budget: AI Verified',
    listingTitle: 'Zernikepark 27 B',
    isGroup: false,
    programLevel: 'BSc Exchange · University of Groningen',
    approved: false,
  },
  {
    id: 117,
    anonymousTitle: 'Verified Student Group #117',
    revealedNames: 'Daan de Vries, Lotte Jansen & Sem Hendriks',
    score: 87,
    life: 'Social & Tidy · Shared Dinners',
    budgetLabel: 'Budget: AI Verified',
    listingTitle: 'Zernikepark 27 B',
    isGroup: true,
    programLevel: 'BSc Economics · University of Groningen',
    approved: false,
  },
]

const INITIAL_LANDLORD_LISTINGS: LandlordListing[] = [
  {
    id: 1,
    title: 'Zernikepark 27 B',
    city: 'Groningen',
    rent: '€750/month',
    matchesCount: 5,
    status: 'Active',
    lifestyleFit: 'Quiet & Tidy · Strictly Non-Smoking',
    kadasterVerified: false,
  },
]

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'landing',
  role: 'guest',
  landlordTab: 'AI Matches',
  profile: INITIAL_PROFILE,
  verificationData: null,
  landlordVerification: null,
  rooms: INITIAL_ROOMS,
  sentRoomIds: [],
  squadApplied: false,
  squadReasoning: 'spotless cleanliness habits, campus study hours, and shared cooking preferences',
  squadMatchScore: 96,
  studentRequests: INITIAL_REQUESTS,
  landlordMatches: INITIAL_LANDLORD_MATCHES,
  landlordListings: INITIAL_LANDLORD_LISTINGS,
  chatThreads: [],
  activeChatId: null,
  isCreateListingModalOpen: false,

  go: (screen) => {
    set({ screen })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },

  loginAs: (role, targetScreen) => {
    set({ role, screen: targetScreen })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },

  logout: () => {
    set({ role: 'guest', screen: 'landing' })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },

  setLandlordTab: (landlordTab) => set({ landlordTab }),

  setCreateListingModalOpen: (isCreateListingModalOpen) => set({ isCreateListingModalOpen }),

  setProfile: (profile) => {
    const fullName = `${profile.first || 'Emma'} ${profile.last || 'van den Berg'}`.trim()
    set((state) => ({
      profile,
      landlordMatches: state.landlordMatches.map((card) =>
        card.id === 104
          ? {
              ...card,
              revealedNames: `${fullName}, Lucas Meyer, Noah Bakker & Milan Visser`,
            }
          : card
      ),
    }))
  },

  setVerificationData: (verificationData) => {
    set((state) => ({
      verificationData,
      profile: {
        ...state.profile,
        uni: verificationData.university || state.profile.uni,
      },
    }))
  },

  setLandlordVerification: (landlordVerification) => {
    set((state) => ({
      landlordVerification,
      landlordListings: state.landlordListings.map((listing) => ({
        ...listing,
        kadasterVerified: true,
      })),
      rooms: state.rooms.map((room) =>
        room.id === 1 ? { ...room, kadasterVerified: true } : room
      ),
    }))
  },

  updateRoomMatches: (updates) =>
    set((state) => ({
      rooms: state.rooms.map((r) => {
        const found = updates.find((u) => u.id === r.id)
        return found ? { ...r, match: found.match, fit: found.fit } : r
      }),
    })),

  updateSquadMatch: (squadMatchScore, squadReasoning) =>
    set({ squadMatchScore, squadReasoning }),

  toggleRoomRequest: (roomId) => {
    const state = get()
    const room = state.rooms.find((r) => r.id === roomId)
    if (!room) return

    const alreadySent = state.sentRoomIds.includes(roomId)
    if (alreadySent) {
      set({
        sentRoomIds: state.sentRoomIds.filter((id) => id !== roomId),
      })
      return
    }

    const fullName = `${state.profile.first || 'Emma'} ${state.profile.last || 'van den Berg'}`.trim()
    const studentUni = state.verificationData?.university || state.profile.uni || 'University of Groningen'
    const budget = state.verificationData?.max_budget || 850
    const sleepLabel = (state.profile.Sleep || 'Early Riser').split('(')[0].trim()
    const cleanLabel = (state.profile.Cleanliness || 'Spotless').split('/')[0].trim()
    const lifeSummary = `${sleepLabel} · ${cleanLabel}`

    const newMatchCardId = 200 + roomId
    const hasMatchCard = state.landlordMatches.some((c) => c.id === newMatchCardId)

    const existingReq = state.studentRequests.find((req) => req.title === room.title)
    const updatedRequests: StudentRequest[] = existingReq
      ? state.studentRequests.map((req) =>
          req.title === room.title ? { ...req, dateLabel: 'Sent just now', matchCardId: newMatchCardId } : req
        )
      : [
          {
            id: Date.now(),
            roomId: room.id,
            matchCardId: newMatchCardId,
            title: `${room.title} (${room.price})`,
            dateLabel: 'Sent just now',
            status: 'Pending',
          },
          ...state.studentRequests,
        ]

    const newMatchCard: ApplicantMatchCard = {
      id: newMatchCardId,
      anonymousTitle: `Verified Student #${newMatchCardId}`,
      revealedNames: `${fullName} (${studentUni})`,
      score: room.match,
      life: lifeSummary,
      budgetLabel: `Budget: AI Verified (€${budget}/mo)`,
      listingTitle: room.address || room.title,
      isGroup: false,
      programLevel: `${state.verificationData?.program_level || 'MSc'} · ${studentUni}`,
      approved: false,
    }

    set({
      sentRoomIds: [...state.sentRoomIds, roomId],
      studentRequests: updatedRequests,
      landlordMatches: hasMatchCard
        ? state.landlordMatches
        : [newMatchCard, ...state.landlordMatches],
    })
  },

  applyAsSquad: () => {
    const state = get()
    if (state.squadApplied) return

    const fullName = `${state.profile.first || 'Emma'} ${state.profile.last || 'van den Berg'}`.trim()
    const studentUni = state.verificationData?.university || state.profile.uni || 'University of Groningen'
    const socialShort = (state.profile.Social || 'Quiet & Private').split('&')[0].trim()
    const cleanShort = (state.profile.Cleanliness || 'Spotless').split('/')[0].trim()
    const lifeSummary = `${socialShort} & ${cleanShort}`

    const squadCardId = 128
    const alreadyExists = state.landlordMatches.some((c) => c.id === squadCardId)

    const newSquadCard: ApplicantMatchCard = {
      id: squadCardId,
      anonymousTitle: 'Verified Student Group #128 (New Squad)',
      revealedNames: `${fullName}, Liam Koster, Maya Patel & Finn Mulder`,
      score: state.squadMatchScore || 96,
      life: lifeSummary,
      budgetLabel: 'Budget: AI Verified (€2,400/mo)',
      listingTitle: 'Zernikepark 27 B',
      isGroup: true,
      programLevel: `Co-Living Squad · ${studentUni}`,
      approved: false,
    }

    const newRequest: StudentRequest = {
      id: Date.now(),
      matchCardId: squadCardId,
      title: 'Zernikepark 27 B — AI Roommate Squad Application',
      dateLabel: 'Sent just now · Group of 4 (€2,400/mo combined)',
      status: 'Pending',
    }

    set({
      squadApplied: true,
      landlordMatches: alreadyExists
        ? state.landlordMatches
        : [newSquadCard, ...state.landlordMatches],
      studentRequests: [newRequest, ...state.studentRequests],
      landlordListings: state.landlordListings.map((l, idx) =>
        idx === 0 ? { ...l, matchesCount: l.matchesCount + 1 } : l
      ),
    })
  },

  toggleApproveMatch: (matchCardId) => {
    const state = get()
    const targetCard = state.landlordMatches.find((c) => c.id === matchCardId)
    if (!targetCard) return

    const willApprove = !targetCard.approved
    const updatedMatches = state.landlordMatches.map((c) =>
      c.id === matchCardId ? { ...c, approved: willApprove } : c
    )

    let updatedThreads = [...state.chatThreads]
    let nextActiveChatId = state.activeChatId

    if (willApprove) {
      const existingThread = updatedThreads.find((t) => t.matchCardId === matchCardId)
      if (!existingThread) {
        const newThread: ChatThread = {
          id: matchCardId,
          matchCardId,
          listingTitle: targetCard.listingTitle,
          studentDisplayName: targetCard.revealedNames,
          landlordDisplayName: 'Hendrik Bakker (Verified Landlord · Zernikepark 27 B)',
          unlockedAt: 'Unlocked via Double Opt-In',
          messages: [
            {
              id: `sys-${matchCardId}`,
              sender: 'system',
              senderName: 'safeHouse Zero-Data Guard',
              text: `Mutual match approved! Contact details unlocked for ${targetCard.revealedNames}. No raw financial documents or BSN numbers were shared.`,
              timestamp: 'Just now',
            },
            {
              id: `msg-1-${matchCardId}`,
              sender: 'landlord',
              senderName: 'Hendrik Bakker (Landlord)',
              text: `Hi ${targetCard.revealedNames.split(',')[0]}! Your ${targetCard.score}% AI compatibility and verified budget look great for ${targetCard.listingTitle}. Would you like to schedule a viewing this Thursday at 17:00?`,
              timestamp: 'Just now',
            },
          ],
        }
        updatedThreads = [newThread, ...updatedThreads]
        nextActiveChatId = newThread.id
      }
    } else {
      updatedThreads = updatedThreads.filter((t) => t.matchCardId !== matchCardId)
      if (nextActiveChatId === matchCardId) {
        nextActiveChatId = updatedThreads[0]?.id ?? null
      }
    }

    const updatedRequests: StudentRequest[] = state.studentRequests.map((req) => {
      if (req.matchCardId === matchCardId || (matchCardId === 104 && req.id === 1)) {
        return {
          ...req,
          status: willApprove ? 'Approved · Chat Unlocked' : 'Pending',
        }
      }
      return req
    })

    set({
      landlordMatches: updatedMatches,
      chatThreads: updatedThreads,
      activeChatId: nextActiveChatId,
      studentRequests: updatedRequests,
    })
  },

  addNewListing: ({ title, city, rentNum, lifestyleFit, listingType }) => {
    const state = get()
    const newId = state.rooms.length + 10
    const isOwnerVerified = Boolean(state.landlordVerification)
    const newLandlordListing: LandlordListing = {
      id: newId,
      title,
      city,
      rent: `€${rentNum}/month`,
      matchesCount: 3,
      status: listingType === 'Student Sublet' ? 'Sublet Open' : 'Active',
      lifestyleFit,
      kadasterVerified: isOwnerVerified,
    }

    const newRoom: RoomListing = {
      id: newId,
      title: `${listingType === 'Student Sublet' ? 'Sublet: ' : ''}${title} in ${city}`,
      city,
      address: title,
      price: `€${rentNum}/month`,
      priceNum: rentNum,
      match: 95,
      fit: `Fits your ${lifestyleFit.toLowerCase()} preference`,
      g: 'from-forest to-[#2b7a5f]',
      targetLifestyle: lifestyleFit.split('&').map((s) => s.trim()),
      listingType,
      kadasterVerified: isOwnerVerified,
    }

    set({
      landlordListings: [newLandlordListing, ...state.landlordListings],
      rooms: [newRoom, ...state.rooms],
      isCreateListingModalOpen: false,
    })
  },

  sendMessage: (threadId, sender, text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const state = get()
    const fullName = `${state.profile.first || 'Emma'} ${state.profile.last || 'van den Berg'}`.trim()

    set({
      chatThreads: state.chatThreads.map((thread) => {
        if (thread.id !== threadId) return thread
        return {
          ...thread,
          messages: [
            ...thread.messages,
            {
              id: `msg-${Date.now()}`,
              sender,
              senderName: sender === 'student' ? fullName : 'Hendrik Bakker (Landlord)',
              text: trimmed,
              timestamp: 'Just now',
            },
          ],
        }
      }),
    })
  },

  setActiveChatId: (activeChatId) => set({ activeChatId }),
}))
