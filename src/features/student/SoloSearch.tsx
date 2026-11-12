import { useState } from 'react'
import { Check, Chip, HouseMark, Shield, Sparkle } from '../../components/icons/Icons'
import { generateMatchReasoning } from '../../services/ollamaService'
import { useAppStore } from '../../store/useAppStore'

export function SoloSearch() {
  const {
    rooms,
    sentRoomIds,
    toggleRoomRequest,
    profile,
    verificationData,
    updateRoomMatches,
    go,
  } = useAppStore()

  const [isRecalculating, setIsRecalculating] = useState(false)

  const handleRecalculateMatches = async () => {
    if (isRecalculating) return
    setIsRecalculating(true)
    const studentTags = {
      sleep: profile.Sleep || 'Early Riser (07:00)',
      social: profile.Social || 'Quiet & Private',
      cleanliness: profile.Cleanliness || 'Spotless / Daily Tidy',
      studyRoutine: profile.StudyRoutine || 'Mostly on Campus/Library',
      kitchenDiet: profile.KitchenDiet || 'Loves Cooking Together',
      houseRules: profile.HouseRules || 'Strictly Non-Smoking',
      budget: verificationData?.max_budget || 850,
      university: verificationData?.university || profile.uni,
    }
    try {
      const updated = await Promise.all(
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
      updateRoomMatches(updated)
    } finally {
      setIsRecalculating(false)
    }
  }

  return (
    <main className="w-full mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-16 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-bold text-orange uppercase tracking-widest mb-2">
            Solo search
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold">Your Top AI-Matched Single Rooms</h1>
        </div>

        <div className="flex items-center gap-3">
          {sentRoomIds.length > 0 && (
            <button
              type="button"
              onClick={() => go('requests')}
              className="bg-lime text-forest-deep text-xs font-extrabold rounded-full px-4 py-2.5 shadow-sm hover:brightness-105 transition"
            >
              View My Requests ({sentRoomIds.length}) &rarr;
            </button>
          )}
          <button
            type="button"
            disabled={isRecalculating}
            onClick={() => void handleRecalculateMatches()}
            className="bg-white border-2 border-forest/20 hover:border-forest text-forest text-xs font-bold rounded-full px-4 py-2.5 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Chip className="w-4 h-4 text-orange" />
            {isRecalculating ? 'Local AI Scoring…' : 'Refresh AI Match Scores (llama3.1)'}
          </button>
        </div>
      </div>

      {/* Active 6-Category Lifestyle & Verification Filter Pills */}
      <div className="mb-8 flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="text-forest/60 mr-1">Matched for:</span>
        {[
          profile.Sleep,
          profile.Social,
          profile.Cleanliness,
          profile.StudyRoutine,
          profile.KitchenDiet,
          profile.HouseRules,
        ]
          .filter(Boolean)
          .map((tag) => (
            <span key={tag} className="bg-forest text-lime rounded-full px-3 py-1">
              {tag}
            </span>
          ))}
        <span className="bg-orange text-white rounded-full px-3 py-1">
          Verified Cap: €{verificationData?.max_budget || 850}/mo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {rooms.map((r) => {
          const isSent = sentRoomIds.includes(r.id)
          return (
            <div
              key={r.id}
              className="bg-white rounded-3xl overflow-hidden shadow-[0_12px_40px_-16px_rgba(15,74,58,.3)] flex flex-col"
            >
              <div className={`h-44 bg-gradient-to-br ${r.g} relative overflow-hidden`}>
                <HouseMark className="absolute -right-6 -bottom-8 w-44 h-44 opacity-90" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                  <span className="bg-cream text-forest text-xs font-bold rounded-full px-3 py-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-orange" />
                    Verified listing
                  </span>
                  {r.kadasterVerified && (
                    <span className="bg-lime text-forest-deep text-xs font-extrabold rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                      Kadaster Verified Owner
                    </span>
                  )}
                </div>
                {r.listingType === 'Student Sublet' && (
                  <span className="absolute right-4 bottom-3 bg-lime text-forest-deep text-xs font-extrabold rounded-full px-3 py-1">
                    Exchange Sublet
                  </span>
                )}
              </div>
              <div className="p-7 flex flex-col flex-1">
                <h3 className="text-xl font-bold leading-snug">{r.title}</h3>
                <p className="text-2xl font-extrabold text-orange mt-2 mb-5">{r.price}</p>
                <span className="self-start bg-lime text-forest-deep text-xs font-bold rounded-full px-3 py-1.5 mb-8 flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    AI Match: {r.match}% - {r.fit}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleRoomRequest(r.id)}
                  className={`mt-auto rounded-xl py-3.5 text-sm font-bold transition ${
                    isSent
                      ? 'bg-lime text-forest-deep'
                      : 'bg-forest text-cream hover:bg-forest-deep'
                  }`}
                >
                  {isSent ? 'Request Sent' : 'Request to Connect'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
