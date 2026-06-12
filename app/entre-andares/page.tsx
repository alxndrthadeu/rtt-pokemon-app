'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore, SHOP_FLOORS } from '@/store/gameStore'
import { GYM_LEADERS } from '@/lib/data/gyms'
import { AbandonConfirmModal } from '@/components/AbandonConfirmModal'
import { getTypeColor, getTypeTextColor, getSpriteUrl, getPixelSpriteUrl } from '@/lib/typeColors'

const FLOOR_BADGE: Record<number, string> = {
  0: '🪨', 1: '💧', 2: '⚡', 3: '🌿', 4: '☠️', 5: '🔮', 6: '🔥', 7: '🌍',
  8: '❄️', 9: '👊', 10: '👻', 11: '🐉',
}

const TRAINER_PORTRAIT: Record<string, string> = {
  'Brock':     'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
  'Misty':     'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
  'Lt. Surge': 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png',
  'Erika':     'https://play.pokemonshowdown.com/sprites/trainers/erika.png',
  'Koga':      'https://play.pokemonshowdown.com/sprites/trainers/koga.png',
  'Sabrina':   'https://play.pokemonshowdown.com/sprites/trainers/sabrina.png',
  'Blaine':    'https://play.pokemonshowdown.com/sprites/trainers/blaine.png',
  'Giovanni':  'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
  'Lorelei':   'https://play.pokemonshowdown.com/sprites/trainers/lorelei-gen1.png',
  'Bruno':     'https://play.pokemonshowdown.com/sprites/trainers/bruno.png',
  'Agatha':    'https://play.pokemonshowdown.com/sprites/trainers/agatha-gen1.png',
  'Lance':     'https://play.pokemonshowdown.com/sprites/trainers/lance.png',
}

const AI_LABEL: Record<string, string> = {
  random: 'Fácil', weighted: 'Médio', adaptive: 'Difícil', predictive: 'Expert',
}

function TrainerMini({ name, size = 80 }: { name: string; size?: number }) {
  const [error, setError] = useState(false)
  const tc = getTypeColor(GYM_LEADERS.find(g => g.name === name)?.specialtyType ?? 'Normal')
  if (error) {
    return (
      <div className="flex items-center justify-center rounded-xl font-black text-white"
        style={{ width: size, height: size, backgroundColor: tc, fontSize: size * 0.35 }}>
        {name[0]}
      </div>
    )
  }
  return (
    <img src={TRAINER_PORTRAIT[name] ?? ''} alt={name} onError={() => setError(true)}
      style={{ imageRendering: 'pixelated', width: size, height: size, objectFit: 'contain' }} />
  )
}

export default function EntreAndaresPage() {
  const router = useRouter()
  const { currentFloor, playerDeck, badgesEarned, shopVisitedFloors } = useGameStore()
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  const shopAvailable = SHOP_FLOORS.includes(currentFloor as (typeof SHOP_FLOORS)[number])
    && !shopVisitedFloors.includes(currentFloor)

  const prevFloor = currentFloor - 1
  const prevGym = GYM_LEADERS[prevFloor]
  const nextGym = GYM_LEADERS[currentFloor]
  const isGameComplete = currentFloor >= 12

  if (!prevGym && !isGameComplete) {
    router.replace('/')
    return null
  }

  const prevGymColor = prevGym ? getTypeColor(prevGym.specialtyType) : '#78C850'
  const nextGymColor = nextGym ? getTypeColor(nextGym.specialtyType) : '#78C850'

  // Intercepta botão voltar do browser
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const onPop = () => {
      window.history.pushState(null, '', window.location.href)
      setShowQuitConfirm(true)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleContinue() {
    if (isGameComplete) {
      router.push('/conclusao')
    } else {
      router.push('/torre')
    }
  }

  function handleQuit() {
    router.push('/game-over')
  }

  return (
    <main className="min-h-screen bg-parchment dots">

      {/* Header — celebração */}
      <header className="border-b-4 border-ink px-5 py-5" style={{ backgroundColor: prevGymColor }}>
        <div className="max-w-[640px] mx-auto flex items-center gap-4">
          {prevGym && FLOOR_BADGE[prevFloor] && (
            <span className="text-4xl drop-shadow">{FLOOR_BADGE[prevFloor]}</span>
          )}
          <div>
            <p className="font-game text-[6px] text-white/60 uppercase tracking-widest mb-0.5">
              Andar {(prevFloor ?? 0) + 1}/12 concluído
            </p>
            <p className="font-black text-xl text-white uppercase tracking-tight leading-none">
              {isGameComplete ? 'Kanto conquistada!' : `${prevGym?.name} derrotado!`}
            </p>
            {prevGym?.badge && (
              <p className="text-sm text-white/70 mt-0.5">{prevGym.badge} conquistada</p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-5 py-6 flex flex-col gap-6 pb-32">

        {/* ── Insígnias ── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-ink opacity-10" />
            <span className="font-game text-[7px] text-ink-soft opacity-40 uppercase tracking-widest">
              Insígnias — {badgesEarned.length}/8
            </span>
            <div className="h-px flex-1 bg-ink opacity-10" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => {
              const gym = GYM_LEADERS[i]
              const earned = badgesEarned.includes(i)
              const tc = getTypeColor(gym.specialtyType)
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 px-2"
                  style={{
                    borderColor: earned ? tc : '#2C181020',
                    backgroundColor: earned ? `${tc}18` : '#E8E0CC50',
                    opacity: earned ? 1 : 0.4,
                  }}>
                  <span className="text-2xl">{FLOOR_BADGE[i]}</span>
                  <p className="font-game text-[5px] text-ink/70 text-center uppercase tracking-wide leading-tight">
                    {gym.name.split(' ')[0]}
                  </p>
                  {earned
                    ? <span className="font-game text-[8px]" style={{ color: '#78C850' }}>✓</span>
                    : <span className="text-[10px] opacity-30">🔒</span>
                  }
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Time atual ── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-ink opacity-10" />
            <span className="font-game text-[7px] text-ink-soft opacity-40 uppercase tracking-widest">
              Seu time — {playerDeck.length} pokémon
            </span>
            <div className="h-px flex-1 bg-ink opacity-10" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {playerDeck.map(p => {
              const tc = getTypeColor(p.type1)
              return (
                <div key={p.id} className="border-2 border-ink rounded-2xl overflow-hidden bg-white shadow-neo-sm">
                  <div className="h-1.5" style={{ backgroundColor: tc }} />
                  <div className="flex items-center gap-2 p-2">
                    <img src={getSpriteUrl(p.id)} alt={p.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[10px] text-ink uppercase truncate leading-tight">{p.name}</p>
                      <span className="font-game text-[6px] px-1.5 py-0.5 rounded-full border border-ink/15 mt-0.5 inline-block"
                        style={{ backgroundColor: tc, color: getTypeTextColor(p.type1) }}>
                        {p.type1}
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: p.hearts }).map((_, hi) => (
                          <span key={hi} className="text-[10px] leading-none">♥</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Próximo desafio ── */}
        {!isGameComplete && nextGym && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-ink opacity-10" />
              <span className="font-game text-[7px] text-ink-soft opacity-40 uppercase tracking-widest">
                Próximo desafio — Andar {currentFloor + 1}/12
              </span>
              <div className="h-px flex-1 bg-ink opacity-10" />
            </div>
            <div className="border-2 border-ink rounded-3xl overflow-hidden bg-white shadow-neo-lg">
              <div className="h-2" style={{ backgroundColor: nextGymColor }} />
              <div className="flex items-end gap-4 px-5 pt-4 pb-3" style={{ backgroundColor: `${nextGymColor}12` }}>
                <TrainerMini name={nextGym.name} size={88} />
                <div className="flex-1 pb-1">
                  <p className="font-black text-xl text-ink uppercase tracking-tight leading-none">{nextGym.name}</p>
                  <p className="text-sm text-ink-soft opacity-60 mt-0.5 leading-tight">{nextGym.title}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/15"
                      style={{ backgroundColor: nextGymColor, color: getTypeTextColor(nextGym.specialtyType) }}>
                      {nextGym.specialtyType}
                    </span>
                    <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/15 bg-parchment-light text-ink-soft">
                      {AI_LABEL[nextGym.aiLevel]}
                    </span>
                    {FLOOR_BADGE[currentFloor] && (
                      <span className="ml-auto text-xl">{FLOOR_BADGE[currentFloor]}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-ink/10">
                <p className="text-sm text-ink-soft opacity-60 leading-relaxed">{nextGym.description}</p>
                {/* Equipe do próximo gym */}
                <div className="flex items-center gap-2 mt-3">
                  <p className="font-game text-[6px] text-ink/30 uppercase tracking-widest shrink-0">Equipe:</p>
                  {nextGym.teamIds.slice(0, 3).map(id => (
                    <div key={id} className="w-10 h-10 rounded-lg border border-ink/15 bg-parchment-light flex items-center justify-center">
                      <img src={getPixelSpriteUrl(id)} alt="" style={{ width: 32, height: 32, imageRendering: 'pixelated' }} />
                    </div>
                  ))}
                  <span className="font-game text-[7px] text-ink/20 ml-1">+3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isGameComplete && (
          <div className="border-2 border-ink rounded-3xl p-8 text-center bg-white shadow-neo-lg">
            <p className="text-5xl mb-3">🏆</p>
            <p className="font-black text-2xl text-ink uppercase tracking-tight">Kanto conquistada!</p>
            <p className="text-sm text-ink-soft opacity-60 mt-2 leading-relaxed">
              Você derrotou todos os ginásios, o Elite Four e o Campeão. Incrível!
            </p>
          </div>
        )}

        {/* ── CTAs ── */}
        {/* ── Shop CTA (available only on shop floors before first visit) ── */}
        {shopAvailable && (
          <div className="rounded-3xl border-2 border-ink overflow-hidden"
            style={{ boxShadow: '5px 5px 0 #2C1810' }}>
            <div className="px-4 pt-3 pb-2 flex items-center gap-2"
              style={{ backgroundColor: '#2C7BB5' }}>
              <span className="text-2xl">🛒</span>
              <div>
                <p className="font-black text-sm text-white uppercase tracking-tight leading-tight">Loja Pokémon</p>
                <p className="font-game text-[6px] text-white/70 uppercase tracking-widest leading-none">
                  Disponível neste andar — acesso único!
                </p>
              </div>
              <span className="ml-auto font-game text-[6px] px-2 py-1 rounded-full bg-white/20 text-white border border-white/30">
                ★ NOVO
              </span>
            </div>
            <button
              onClick={() => router.push('/loja')}
              className="w-full py-3 font-black text-sm tracking-[0.15em] uppercase text-white transition-all cursor-pointer hover:brightness-110 active:brightness-90"
              style={{ backgroundColor: '#1E5F9A' }}
            >
              Entrar na Loja →
            </button>
          </div>
        )}

        {/* ── Mochila ── */}
        <button
          onClick={() => router.push('/mochila')}
          className="w-full py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/20 rounded-2xl text-ink/50 hover:text-ink/80 hover:border-ink/40 hover:bg-parchment-light transition-all cursor-pointer"
        >
          🎒 Mochila
        </button>

        <button
          onClick={handleContinue}
          className="w-full py-4 font-black text-base tracking-[0.15em] uppercase border-2 border-ink rounded-2xl text-parchment-light shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          style={{ backgroundColor: isGameComplete ? '#78C850' : '#CC2200' }}
        >
          {isGameComplete ? '🏆 Ver resultados' : `Avançar para ${nextGym?.name} →`}
        </button>

        <button
          onClick={() => setShowQuitConfirm(true)}
          className="w-full py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/15 rounded-2xl text-ink/35 hover:text-ink/60 hover:border-ink/25 transition-all cursor-pointer"
        >
          🏳️ Abandonar a run
        </button>

      </div>

      {/* ── Confirmação de abandono ── */}
      {showQuitConfirm && (
        <AbandonConfirmModal
          currentFloor={currentFloor}
          badgesEarned={badgesEarned}
          playerDeck={playerDeck}
          onConfirm={handleQuit}
          onCancel={() => setShowQuitConfirm(false)}
        />
      )}
    </main>
  )
}
