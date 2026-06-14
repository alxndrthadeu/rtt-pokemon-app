'use client'

import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { getTypeColor, getTypeTextColor, getPixelSpriteUrl } from '@/lib/typeColors'
import { GYM_LEADERS } from '@/lib/data/gyms'
import type { RunSummary } from '@/types'

const RESULT_META: Record<string, { label: string; color: string; icon: string }> = {
  abandoned: { label: 'Abandonada', color: '#F0A000', icon: '🏳️' },
  lost:      { label: 'Derrota',    color: '#CC2200', icon: '💀' },
  won:       { label: 'Vitória',    color: '#78C850', icon: '🏆' },
}

const BADGE_URLS: Record<number, string> = {
  0: '/badges/1.png',
  1: '/badges/2.png',
  2: '/badges/3.png',
  3: '/badges/4.png',
  4: '/badges/5.png',
  5: '/badges/6.png',
  6: '/badges/7.png',
  7: '/badges/8.png',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function RunCard({ run }: { run: RunSummary }) {
  const meta = RESULT_META[run.result]
  const trainerImg = run.gender === 'boy' ? '/male_protagonist.png' : '/female_protagonist.png'

  return (
    <div
      className="border-2 border-ink rounded-2xl overflow-hidden bg-white"
      style={{ boxShadow: '4px 4px 0 #2C1810' }}
    >
      {/* Color band — result */}
      <div className="h-2" style={{ backgroundColor: meta.color }} />

      <div className="p-4 flex flex-col gap-3">

        {/* Top row: trainer sprite + name + result */}
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl border-2 border-ink flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: `${meta.color}18` }}
          >
            <img
              src={trainerImg}
              alt={run.gender}
              className="w-12 h-12 object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-black text-base text-ink uppercase tracking-tight leading-none truncate">
                {run.playerName}
              </p>
              <span
                className="font-game text-[8px] px-2 py-0.5 rounded-full leading-none shrink-0 text-white"
                style={{ backgroundColor: meta.color }}
              >
                {meta.icon} {meta.label}
              </span>
            </div>
            <p className="font-game text-[8px] text-ink/40 uppercase tracking-widest leading-none">
              {run.mode === 'hard' ? 'Modo Hard' : 'Modo Normal'} · {formatDate(run.date)}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-ink/10 bg-parchment/60 px-3 py-2 text-center">
            <p className="font-black text-lg text-ink leading-none">{run.floorsCompleted}</p>
            <p className="font-game text-[8px] text-ink/35 uppercase tracking-widest mt-0.5">andares</p>
          </div>
          <div className="rounded-xl border border-ink/10 bg-parchment/60 px-3 py-2 text-center">
            <p className="font-black text-lg text-ink leading-none">{run.badgesEarned.length}</p>
            <p className="font-game text-[8px] text-ink/35 uppercase tracking-widest mt-0.5">insígnias</p>
          </div>
          <div className="rounded-xl border border-ink/10 bg-parchment/60 px-3 py-2 text-center">
            <p
              className="font-black text-lg leading-none"
              style={{ color: run.deathCount === 0 ? '#78C850' : '#CC2200' }}
            >
              {run.deathCount}
            </p>
            <p className="font-game text-[8px] text-ink/35 uppercase tracking-widest mt-0.5">mortes</p>
          </div>
        </div>

        {/* Badges earned */}
        {run.badgesEarned.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {run.badgesEarned.map(gymId => (
              <div
                key={gymId}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-ink/10"
                style={{ backgroundColor: `${getTypeColor(GYM_LEADERS[gymId]?.specialtyType ?? 'Normal')}20` }}
              >
                <img
                  src={BADGE_URLS[gymId]}
                  alt=""
                  style={{ width: 22, height: 22, imageRendering: 'pixelated' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Team sprites */}
        {run.teamSnapshot.length > 0 && (
          <div className="border-t border-ink/8 pt-3">
            <p className="font-game text-[8px] text-ink/30 uppercase tracking-widest mb-2">Time</p>
            <div className="flex gap-1.5 flex-wrap">
              {run.teamSnapshot.map((p, i) => {
                const tc = getTypeColor(p.type1)
                const dead = p.isFainted || p.hearts <= 0
                return (
                  <div
                    key={`${p.id}-${i}`}
                    className="relative w-10 h-10 rounded-xl border border-ink/10 flex items-center justify-center"
                    style={{
                      backgroundColor: dead ? '#f0f0f0' : `${tc}15`,
                      borderColor: dead ? '#ccc' : `${tc}40`,
                    }}
                    title={p.name}
                  >
                    <img
                      src={getPixelSpriteUrl(p.id)}
                      alt={p.name}
                      style={{
                        width: 32,
                        height: 32,
                        imageRendering: 'pixelated',
                        filter: dead ? 'grayscale(1) opacity(0.4)' : undefined,
                      }}
                    />
                    {/* HP dots */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-[2px]">
                      {Array.from({ length: 5 }).map((_, hi) => (
                        <div
                          key={hi}
                          className="w-1 h-1 rounded-full border border-white/50"
                          style={{
                            backgroundColor: dead ? '#ccc'
                              : hi < p.hearts
                              ? (p.hearts <= 1 ? '#E82020' : p.hearts <= 2 ? '#F0A000' : '#4CAF50')
                              : 'transparent',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HistoricoPage() {
  const router = useRouter()
  const { runHistory } = useGameStore()

  return (
    <main className="min-h-screen bg-parchment dots relative overflow-x-hidden">

      <header className="relative z-10 px-5 py-5 flex items-center justify-between max-w-[620px] mx-auto w-full">
        <button
          onClick={() => router.push('/')}
          className="border-2 border-ink rounded-full px-4 py-1.5 font-game text-[7px] tracking-wide uppercase text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          ← Voltar
        </button>
        <span className="font-game text-[7px] text-ink-soft opacity-50 tracking-widest uppercase">
          Reach the Top
        </span>
      </header>

      <div className="relative z-10 max-w-[620px] mx-auto px-5 pb-20">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
            Histórico de <span style={{ color: '#CC2200' }}>Runs</span>
          </h1>
          <p className="font-game text-[7px] text-ink/40 uppercase tracking-widest mt-1">
            {runHistory.length} {runHistory.length === 1 ? 'run registrada' : 'runs registradas'}
          </p>
        </div>

        {runHistory.length === 0 ? (
          <div
            className="border-2 border-dashed border-ink/15 rounded-2xl py-16 text-center"
            style={{ backgroundColor: '#F8F4EC' }}
          >
            <p className="text-4xl mb-3">📋</p>
            <p className="font-black text-sm text-ink uppercase tracking-tight">Nenhuma run ainda</p>
            <p className="font-game text-[7px] text-ink/35 uppercase tracking-widest mt-2">
              Conclua ou abandone uma run para ver aqui
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-5 px-6 py-3 font-black text-sm uppercase tracking-widest border-2 border-ink rounded-2xl text-white shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
              style={{ backgroundColor: '#CC2200' }}
            >
              Jogar agora →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {runHistory.map((run) => (
              <RunCard key={run.id} run={run} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
