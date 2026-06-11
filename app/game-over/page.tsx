'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { GYM_LEADERS } from '@/lib/data/gyms'
import { getTypeColor, getTypeTextColor, getSpriteUrl } from '@/lib/typeColors'

const FLOOR_BADGE: Record<number, string> = {
  0: '🪨', 1: '💧', 2: '⚡', 3: '🌿', 4: '☠️', 5: '🔮', 6: '🔥', 7: '🌍',
  8: '❄️', 9: '👊', 10: '👻', 11: '🐉',
}

function HeartsRow({ current, max }: { current: number; max: number }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="text-xs leading-none" style={{ opacity: i < current ? 1 : 0.15 }}>♥</span>
      ))}
    </div>
  )
}

export default function GameOverPage() {
  const router = useRouter()
  const { playerName, playerDeck, badgesEarned, currentFloor, deathCount, mode, resetRun } = useGameStore()

  // Se não há run ativa, redireciona para home
  useEffect(() => {
    if (!mode) router.replace('/')
  }, [mode, router])

  if (!mode) return null

  const totalBadges = badgesEarned.length
  const floorLabel = currentFloor >= 12 ? '12/12 — Torre completa!' : `${currentFloor}/12`

  function handleNewRun() {
    resetRun()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-parchment relative overflow-x-hidden">

      {/* Header */}
      <header className="border-b-4 border-ink px-4 py-5 text-center" style={{ backgroundColor: '#CC2200' }}>
        <p className="font-game text-[7px] text-white/60 uppercase tracking-widest mb-1">Reach the Top</p>
        <p className="font-black text-2xl text-white uppercase tracking-tight">Run Encerrada</p>
      </header>

      <div className="max-w-[540px] mx-auto px-4 pt-6 pb-24 flex flex-col gap-6">

        {/* Resumo rápido */}
        <div className="border-2 border-ink rounded-3xl bg-white overflow-hidden shadow-neo">
          {/* Top bar */}
          <div className="h-2" style={{ backgroundColor: '#CC2200' }} />
          <div className="px-5 py-5 flex flex-col gap-4">

            {/* Treinador + stats */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest mb-0.5">Treinador</p>
                <p className="font-black text-lg text-ink leading-tight">{playerName || 'Sem nome'}</p>
                <p className="font-game text-[7px] text-ink/40 uppercase tracking-wide mt-0.5">
                  Modo {mode === 'normal' ? 'Normal' : 'Hard'}
                </p>
              </div>
              <div className="flex gap-5 text-center">
                <div>
                  <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest mb-1">Andar</p>
                  <p className="font-black text-2xl text-ink leading-none">{currentFloor}</p>
                  <p className="font-game text-[6px] text-ink/30">/12</p>
                </div>
                <div>
                  <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest mb-1">Insígnias</p>
                  <p className="font-black text-2xl text-ink leading-none">{totalBadges}</p>
                  <p className="font-game text-[6px] text-ink/30">/8</p>
                </div>
                <div>
                  <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest mb-1">Mortes</p>
                  <p className="font-black text-2xl leading-none" style={{ color: deathCount === 0 ? '#78C850' : '#CC2200' }}>
                    {deathCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de progresso da torre */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest">Progresso na torre</p>
                <p className="font-game text-[6px] text-ink/40">{floorLabel}</p>
              </div>
              <div className="h-3 bg-ink/8 rounded-full overflow-hidden border border-ink/10">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (currentFloor / 12) * 100)}%`,
                    backgroundColor: currentFloor >= 12 ? '#78C850' : '#CC2200',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Insígnias */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-ink opacity-10" />
            <span className="font-game text-[7px] text-ink/40 uppercase tracking-widest">
              Insígnias Conquistadas ({totalBadges})
            </span>
            <div className="h-px flex-1 bg-ink opacity-10" />
          </div>

          {totalBadges === 0 ? (
            <div className="border-2 border-dashed border-ink/15 rounded-2xl py-6 text-center">
              <p className="font-game text-[8px] text-ink/30 uppercase tracking-widest">Nenhuma insígnia conquistada</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }, (_, i) => {
                const earned = badgesEarned.includes(i)
                const gym = GYM_LEADERS[i]
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 px-2 transition-all"
                    style={{
                      borderColor: earned ? getTypeColor(gym.specialtyType) : 'rgba(44,24,16,0.1)',
                      backgroundColor: earned ? `${getTypeColor(gym.specialtyType)}15` : 'transparent',
                      opacity: earned ? 1 : 0.3,
                    }}
                  >
                    <span className="text-2xl">{FLOOR_BADGE[i]}</span>
                    <p className="font-game text-[5px] text-ink/60 text-center leading-tight">{gym.name}</p>
                    {earned && gym.badge && (
                      <span
                        className="font-game text-[5px] px-1.5 py-[2px] rounded-full leading-none"
                        style={{ backgroundColor: getTypeColor(gym.specialtyType), color: getTypeTextColor(gym.specialtyType) }}
                      >
                        {gym.badge.replace(' Badge', '')}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pokémon capturados */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-ink opacity-10" />
            <span className="font-game text-[7px] text-ink/40 uppercase tracking-widest">
              Pokémon do Time ({playerDeck.length})
            </span>
            <div className="h-px flex-1 bg-ink opacity-10" />
          </div>

          {playerDeck.length === 0 ? (
            <div className="border-2 border-dashed border-ink/15 rounded-2xl py-6 text-center">
              <p className="font-game text-[8px] text-ink/30 uppercase tracking-widest">Nenhum Pokémon</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {playerDeck.map(p => {
                const tc = getTypeColor(p.type1)
                const isKO = p.hearts <= 0 || p.isFainted
                return (
                  <div
                    key={p.id}
                    className="border-2 border-ink rounded-2xl overflow-hidden bg-white shadow-neo-sm"
                    style={{ opacity: isKO ? 0.45 : 1 }}
                  >
                    <div className="h-1.5" style={{ backgroundColor: tc }} />
                    <div className="flex flex-col items-center gap-1.5 p-3">
                      <div className="relative">
                        <img
                          src={getSpriteUrl(p.id)}
                          alt={p.name}
                          style={{ width: 64, height: 64, objectFit: 'contain', filter: isKO ? 'grayscale(1)' : undefined }}
                        />
                        {isKO && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-game text-[6px] bg-black/60 text-white px-1 py-0.5 rounded uppercase">KO</span>
                          </div>
                        )}
                      </div>
                      <p className="font-black text-[9px] text-ink uppercase text-center leading-tight">{p.name}</p>
                      <span
                        className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/15 leading-none"
                        style={{ backgroundColor: tc, color: getTypeTextColor(p.type1) }}
                      >
                        {p.type1}
                      </span>
                      <HeartsRow current={p.hearts} max={5} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleNewRun}
            className="w-full py-4 font-black text-base tracking-[0.15em] uppercase border-2 border-ink rounded-2xl text-ink bg-parchment-light shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            🔄 Nova run
          </button>
          <button
            onClick={() => { resetRun(); router.push('/') }}
            className="w-full py-3 font-game text-[7px] uppercase tracking-widest border border-ink/15 rounded-2xl text-ink/40 hover:text-ink/60 transition-all cursor-pointer"
          >
            Voltar à tela inicial
          </button>
        </div>

      </div>
    </main>
  )
}
