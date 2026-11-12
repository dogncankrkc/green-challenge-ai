import { Check, Sparkle } from '../../components/icons/Icons'
import { useAppStore } from '../../store/useAppStore'

export function SquadMatch() {
  const {
    go,
    squadApplied,
    applyAsSquad,
    squadMatchScore,
    squadReasoning,
    profile,
  } = useAppStore()

  const nodes = [
    { x: 150, y: 110, c: '#dbff1f', r: 52, label: `${profile.first || 'Emma'} (You)` },
    { x: 420, y: 70, c: '#ff5f15', r: 44, label: 'Liam · RUG' },
    { x: 560, y: 230, c: '#dbff1f', r: 50, label: 'Maya · RUG' },
    { x: 270, y: 280, c: '#0f4a3a', r: 56, label: 'Finn · Hanze' },
  ]
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [0, 2],
    [1, 3],
  ]

  return (
    <main className="mx-auto max-w-6xl px-8 py-16 pb-28 text-center">
      <p className="text-orange font-bold uppercase tracking-widest text-sm mb-3">Co-living</p>
      <h1 className="text-5xl font-extrabold mb-10">Your AI Roommate Squad</h1>

      <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-24px_rgba(15,74,58,.35)] p-6">
        <svg
          viewBox="0 0 700 360"
          className="w-full max-w-3xl mx-auto"
          aria-label="AI Roommate Squad compatibility graph"
        >
          {edges.map(([a, b], i) => (
            <line
              key={i}
              x1={nodes[a].x}
              y1={nodes[a].y}
              x2={nodes[b].x}
              y2={nodes[b].y}
              stroke="#0f4a3a"
              strokeOpacity=".55"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              style={{ animation: 'dash 1.2s linear infinite' }}
            />
          ))}
          {nodes.map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={n.r + 10} fill={n.c} opacity=".2" />
              <circle cx={n.x} cy={n.y} r={n.r} fill={n.c} />
              <circle
                cx={n.x}
                cy={n.y - n.r * 0.15}
                r={n.r * 0.28}
                fill={n.c === '#0f4a3a' ? '#dbff1f' : '#0f4a3a'}
              />
              <path
                d={`M${n.x - n.r * 0.5} ${n.y + n.r * 0.6} a${n.r * 0.5} ${n.r * 0.45} 0 0 1 ${n.r} 0z`}
                fill={n.c === '#0f4a3a' ? '#dbff1f' : '#0f4a3a'}
              />
              <text
                x={n.x}
                y={n.y + n.r + 22}
                textAnchor="middle"
                fill="#0f4a3a"
                fontSize="12"
                fontWeight="700"
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {squadApplied ? (
        <div
          className="mt-8 bg-forest text-cream rounded-3xl p-12 text-center"
          style={{ animation: 'glow 2s infinite' }}
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-lime flex items-center justify-center mb-5">
            <Check className="w-10 h-10 text-forest-deep" />
          </div>
          <h2 className="text-3xl font-extrabold mb-3">Group Formed &amp; Request Sent!</h2>
          <p className="text-lg text-cream/80 mb-8">
            The landlord is reviewing your AI-verified group profile.
          </p>
          <button
            type="button"
            onClick={() => go('solo')}
            className="bg-lime text-forest-deep font-bold rounded-full px-9 py-3.5 hover:-translate-y-0.5 transition"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 bg-forest text-cream rounded-3xl p-9 text-left flex gap-6 items-start shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-lime flex items-center justify-center shrink-0">
              <Sparkle className="w-6 h-6 text-forest-deep" />
            </div>
            <p className="text-xl leading-relaxed">
              You match <b className="text-lime">{squadMatchScore}%</b> with this group based on your{' '}
              {squadReasoning}. Together, you have a combined AI-Verified budget of{' '}
              <b className="text-lime">€2,400/month</b>.
            </p>
          </div>
          <button
            type="button"
            onClick={applyAsSquad}
            className="mt-10 bg-lime text-forest-deep font-extrabold text-xl rounded-full px-14 py-5 shadow-[0_12px_28px_-8px_rgba(150,180,0,.9)] hover:-translate-y-0.5 transition"
          >
            Apply for Housing as a Group
          </button>
        </>
      )}
    </main>
  )
}
