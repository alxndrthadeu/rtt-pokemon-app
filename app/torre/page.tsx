'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { AbandonConfirmModal } from '@/components/AbandonConfirmModal'
import { GYM_LEADERS, buildGymDeck } from '@/lib/data/gyms'
import { PokemonCard } from '@/components/PokemonCard'
import { getTypeColor, getTypeTextColor, getSpriteUrl, getPixelSpriteUrl } from '@/lib/typeColors'
import type { PokemonCard as PokemonCardType } from '@/types'

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

const BADGE_URLS: Record<number, string> = {
  0: '/badges/1.png', 1: '/badges/2.png', 2: '/badges/3.png', 3: '/badges/4.png',
  4: '/badges/5.png', 5: '/badges/6.png', 6: '/badges/7.png', 7: '/badges/8.png',
}
// Elite 4 don't have official badge sprites
const ELITE4_BADGE: Record<number, string> = {
  8: '❄️', 9: '👊', 10: '👻', 11: '🐉',
}

const AI_LABEL: Record<string, string> = {
  random: 'Fácil', weighted: 'Médio', adaptive: 'Difícil', predictive: 'Expert',
}

// ─── Trainer portrait (with text fallback) ────────────────────────────────────
function TrainerPortrait({ name, size = 160 }: { name: string; size?: number }) {
  const [error, setError] = useState(false)
  const typeColor = getTypeColor(GYM_LEADERS.find(g => g.name === name)?.specialtyType ?? 'Normal')

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-full border-4 border-white/30 font-black text-white"
        style={{ width: size, height: size, backgroundColor: typeColor, fontSize: size * 0.3 }}
      >
        {name[0]}
      </div>
    )
  }

  return (
    <img
      src={TRAINER_PORTRAIT[name] ?? ''}
      alt={name}
      width={size}
      height={size}
      onError={() => setError(true)}
      style={{ imageRendering: 'pixelated', width: size, height: size, objectFit: 'contain' }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TorrePage() {
  const router = useRouter()
  const { mode, gender, playerName, playerDeck, currentFloor, badgesEarned, coins, startBattle } = useGameStore()

  const [showSetup, setShowSetup] = useState(false)
  const [selected, setSelected] = useState<PokemonCardType[]>([])
  const [showAbandon, setShowAbandon] = useState(false)

  useEffect(() => {
    if (!mode || !gender) router.replace('/')
  }, [mode, gender, router])

  // Intercepta botão voltar do browser durante a run
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const onPop = () => {
      window.history.pushState(null, '', window.location.href)
      setShowAbandon(true)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const gym = GYM_LEADERS[currentFloor]
  if (!gym) return null

  const typeColor = getTypeColor(gym.specialtyType)
  const isElite4 = currentFloor >= 8

  // ── Team selection ──────────────────────────────────────────────────────────
  function toggleSelect(card: PokemonCardType) {
    setSelected(prev => {
      const already = prev.find(p => p.id === card.id)
      if (already) return prev.filter(p => p.id !== card.id)
      if (prev.length >= 3) return prev
      return [...prev, card]
    })
  }

  function handleStartBattle() {
    if (selected.length < 3) return
    const allSix = buildGymDeck(currentFloor)
    const enemyDeck = [...allSix].sort(() => Math.random() - 0.5).slice(0, 3)
    startBattle(currentFloor, enemyDeck, selected, [0, 1, 2])
    router.push('/batalha')
  }


  return (
    <main className="min-h-screen bg-parchment dots relative overflow-x-hidden"
      style={{ overscrollBehaviorX: 'none' }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-parchment/95 backdrop-blur-sm border-b-2 border-ink/10 px-4 py-3">
        <div className="max-w-[640px] mx-auto flex items-center gap-3">
          <button
            onClick={() => setShowAbandon(true)}
            className="border-2 border-ink rounded-full px-3 py-1 font-game text-[8px] text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all shrink-0"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-game text-[8px] text-ink/40 uppercase tracking-wide leading-none truncate">
              {playerName} · {mode === 'normal' ? 'Normal' : 'Hard'}
            </p>
            <p className="font-black text-sm text-ink uppercase leading-tight truncate">
              Torre de Kanto
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-full border-2 border-ink/15 bg-parchment-light shadow-neo-sm">
              <span className="font-black text-[11px] text-ink/50 leading-none">₽</span>
              <span className="font-black text-[12px] text-ink leading-none">{coins}</span>
            </div>
            <button
              onClick={() => router.push('/mochila')}
              className="border-2 border-ink rounded-full w-8 h-8 flex items-center justify-center font-game text-[11px] bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              title="Mochila"
            >
              🎒
            </button>
            <button
              onClick={() => router.push('/pokedex')}
              className="border-2 border-ink rounded-full w-8 h-8 flex items-center justify-center font-game text-[11px] bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              title="Pokédex"
            >
              📖
            </button>
          </div>
        </div>
        {/* Progress bar — full width, below the header row */}
        <div className="max-w-[640px] mx-auto mt-2 flex items-center gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full border border-ink/15 transition-all"
              style={{
                backgroundColor: i < currentFloor ? '#78C850' : i === currentFloor ? typeColor : 'transparent',
                opacity: i > currentFloor ? 0.25 : 1,
              }}
            />
          ))}
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-5 py-6 flex flex-col gap-6 pb-32">

        {/* ── Título ── */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-8 bg-ink opacity-15" />
            <span className="font-game text-[8px] text-ink-soft opacity-50 tracking-[0.5em] uppercase">
              {isElite4 ? 'Elite 4' : `Ginásio ${currentFloor + 1} de 8`}
            </span>
            <div className="h-px w-8 bg-ink opacity-15" />
          </div>
          <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
            {isElite4 ? 'Elite Four' : 'Próximo desafio'}
          </h1>
        </div>

        {/* ── Card do líder atual ── */}
        <div
          className="border-2 border-ink rounded-3xl overflow-hidden shadow-neo-lg"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {/* Faixa de tipo */}
          <div className="h-3" style={{ backgroundColor: typeColor }} />

          {/* Conteúdo */}
          <div className="flex flex-col items-center gap-4 p-6">

            {/* Portrait grande */}
            <div
              className="relative flex items-end justify-center rounded-2xl border-2 border-ink/10 overflow-hidden"
              style={{ width: '100%', height: 220, backgroundColor: `${typeColor}18` }}
            >
              {/* Círculo decorativo atrás */}
              <div
                className="absolute w-48 h-48 rounded-full opacity-10"
                style={{ backgroundColor: typeColor, bottom: -24 }}
              />
              <TrainerPortrait name={gym.name} size={200} />
            </div>

            {/* Info */}
            <div className="w-full flex flex-col gap-3">

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-2xl text-ink uppercase tracking-tight">{gym.name}</p>
                  <p className="text-sm text-ink-soft opacity-60">{gym.title}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {BADGE_URLS[currentFloor] ? (
                    <img src={BADGE_URLS[currentFloor]} alt={gym.badge}
                      style={{ width: 40, height: 40, imageRendering: 'pixelated' }} />
                  ) : ELITE4_BADGE[currentFloor] ? (
                    <span className="text-3xl">{ELITE4_BADGE[currentFloor]}</span>
                  ) : null}
                  {gym.badge && (
                    <span className="font-game text-[8px] text-ink-soft opacity-50">{gym.badge}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="font-game text-[8px] px-3 py-1 rounded-full border-2 border-ink/20"
                  style={{ backgroundColor: typeColor, color: getTypeTextColor(gym.specialtyType) }}
                >
                  {gym.specialtyType}
                </span>
                <span
                  className="font-game text-[8px] px-3 py-1 rounded-full border border-ink/20 bg-parchment-light"
                >
                  {AI_LABEL[gym.aiLevel]}
                </span>
              </div>

              <p className="text-sm text-ink-soft leading-relaxed opacity-70">{gym.description}</p>

              {/* Equipe do ginásio (mini sprites) */}
              <div>
                <p className="font-game text-[8px] text-ink-soft opacity-40 uppercase tracking-widest mb-2">Equipe</p>
                <div className="flex gap-2">
                  {buildGymDeck(currentFloor).slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="border-2 border-ink/20 rounded-xl bg-parchment-light overflow-hidden flex items-center justify-center"
                      style={{ width: 56, height: 56 }}
                    >
                      <img
                        src={getPixelSpriteUrl(p.id)}
                        alt={p.name}
                        style={{ width: 48, height: 48, imageRendering: 'pixelated' }}
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-center" style={{ width: 56, height: 56 }}>
                    <span className="font-game text-[9px] text-ink/20">+3</span>
                  </div>
                </div>
              </div>

              {/* Batalhar */}
              <button
                onClick={() => { setSelected([]); setShowSetup(true) }}
                className="w-full py-4 mt-1 font-black text-base tracking-[0.15em] uppercase border-2 border-ink rounded-2xl text-parchment-light shadow-neo-red hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
                style={{ backgroundColor: '#CC2200' }}
              >
                ⚔️ Batalhar contra {gym.name}
              </button>
            </div>
          </div>
        </div>

        {/* ── Progresso ── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-ink opacity-10" />
            <span className="font-game text-[8px] text-ink-soft opacity-40 uppercase tracking-widest">
              Progresso — {currentFloor}/12
            </span>
            <div className="h-px flex-1 bg-ink opacity-10" />
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {GYM_LEADERS.map((g, i) => {
              const tc = getTypeColor(g.specialtyType)
              const done   = i < currentFloor
              const active = i === currentFloor
              const locked = i > currentFloor
              return (
                <div key={i} className="flex flex-col items-center gap-1 rounded-xl border-2 py-2 px-1"
                  style={{
                    borderColor: active ? tc : done ? `${tc}70` : '#2C181015',
                    backgroundColor: active ? `${tc}22` : done ? `${tc}12` : 'transparent',
                    opacity: locked ? 0.35 : 1,
                  }}>
                  {BADGE_URLS[i] ? (
                    <img src={BADGE_URLS[i]} alt=""
                      style={{ width: 22, height: 22, imageRendering: 'pixelated',
                        filter: locked ? 'grayscale(1) opacity(0.4)' : done ? 'none' : 'grayscale(0.3)' }} />
                  ) : (
                    <span className={`text-base ${locked ? 'grayscale' : ''}`}>{ELITE4_BADGE[i]}</span>
                  )}
                  <p className="font-game text-[8px] text-ink/60 text-center leading-tight w-full truncate px-0.5">
                    {g.name.split(' ')[0]}
                  </p>
                  {done   && <span className="font-game text-[8px]" style={{ color: '#78C850' }}>✓</span>}
                  {active && <span className="font-game text-[8px] font-black uppercase" style={{ color: tc }}>NOW</span>}
                  {locked && <span className="text-[8px] opacity-25">🔒</span>}
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── Overlay: Seleção de equipe ── */}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'rgba(44,24,16,0.85)' }}>
          <div
            className="relative flex flex-col bg-parchment rounded-t-3xl border-t-4 border-x-4 border-ink mt-auto max-h-[90vh] overflow-y-auto"
            style={{ borderColor: typeColor }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-ink/20" />
            </div>

            <div className="px-5 pb-8 flex flex-col gap-5">
              {/* Título */}
              <div>
                <h2 className="font-black text-xl text-ink uppercase tracking-tight">Selecione sua equipe</h2>
                <p className="text-sm text-ink-soft opacity-60 mt-0.5">
                  Escolha 3 Pokémon na ordem em que vão batalhar
                </p>
              </div>

              {/* Slots de ordem */}
              <div className="flex gap-3 items-center">
                <p className="font-game text-[8px] text-ink-soft opacity-50 uppercase tracking-widest shrink-0">Ordem:</p>
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => {
                    const p = selected[i]
                    return (
                      <div
                        key={i}
                        className="border-2 border-dashed rounded-xl flex items-center justify-center relative"
                        style={{
                          width: 52, height: 52,
                          borderColor: p ? getTypeColor(p.type1) : '#2C181040',
                          backgroundColor: p ? `${getTypeColor(p.type1)}15` : 'transparent',
                        }}
                      >
                        {p ? (
                          <>
                            <img
                              src={getPixelSpriteUrl(p.id)}
                              alt={p.name}
                              style={{ width: 40, height: 40, imageRendering: 'pixelated' }}
                            />
                            <span
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full border-2 border-ink flex items-center justify-center font-black text-[9px] text-parchment-light"
                              style={{ backgroundColor: getTypeColor(p.type1) }}
                            >
                              {i + 1}
                            </span>
                          </>
                        ) : (
                          <span className="font-game text-[10px] text-ink/20">{i + 1}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Grid do deck */}
              <div className="grid grid-cols-3 gap-3" style={{ touchAction: 'pan-y' }}>
                {playerDeck.map(card => {
                  const selIdx = selected.findIndex(p => p.id === card.id)
                  const isSelected = selIdx !== -1
                  const isFainted = card.isFainted || card.hearts <= 0
                  const tc = getTypeColor(card.type1)
                  const isDisabled = isFainted || (!isSelected && selected.length >= 3)
                  return (
                    <button
                      key={card.id}
                      onClick={() => !isFainted && toggleSelect(card)}
                      disabled={isDisabled}
                      className="relative border-2 border-ink rounded-2xl overflow-hidden transition-all duration-100 text-left"
                      style={{
                        backgroundColor: isFainted ? '#f5f5f5' : isSelected ? `${tc}20` : '#FFFFFF',
                        borderColor: isFainted ? '#ccc' : isSelected ? tc : '#2C1810',
                        boxShadow: isFainted ? 'none' : isSelected ? `3px 3px 0 ${tc}` : '3px 3px 0 #2C1810',
                        transform: isSelected ? 'translate(2px,2px)' : undefined,
                        opacity: isFainted ? 0.45 : (!isSelected && selected.length >= 3 ? 0.4 : 1),
                      }}
                    >
                      {/* Order badge */}
                      {isSelected && (
                        <span
                          className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full border-2 border-ink flex items-center justify-center font-black text-[9px] text-white"
                          style={{ backgroundColor: tc }}
                        >
                          {selIdx + 1}
                        </span>
                      )}
                      {/* KO badge */}
                      {isFainted && (
                        <span className="absolute top-1.5 right-1.5 z-10 font-game text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full uppercase leading-none">
                          KO
                        </span>
                      )}
                      {/* Top bar */}
                      <div className="h-1.5" style={{ backgroundColor: isFainted ? '#ccc' : tc }} />
                      {/* Sprite */}
                      <div className="flex justify-center py-1 bg-white">
                        <img
                          src={getSpriteUrl(card.id)}
                          alt={card.name}
                          style={{
                            width: 64, height: 64, objectFit: 'contain',
                            filter: isFainted ? 'grayscale(1) brightness(0.7)' : undefined,
                          }}
                        />
                      </div>
                      {/* Name + HP bar */}
                      <div className="px-2 py-1.5 bg-parchment-light">
                        <p className="font-black text-[9px] text-ink uppercase truncate">{card.name}</p>
                        {isFainted ? (
                          <p className="font-game text-[8px] text-red-400 mt-0.5 uppercase">Desmaiado</p>
                        ) : (
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex-1 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(card.hearts / 5) * 100}%`,
                                  backgroundColor: card.hearts <= 1 ? '#E82020' : card.hearts <= 2 ? '#F0A000' : '#4CAF50',
                                }}
                              />
                            </div>
                            <span className="font-game text-[8px] text-ink/50 shrink-0">{card.hearts}/5</span>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Confirmar — sticky ao fundo do sheet */}
              <div className="sticky bottom-0 bg-parchment pt-3 pb-safe flex flex-col gap-3">
                <button
                  onClick={handleStartBattle}
                  disabled={selected.length < 3}
                  className={`w-full py-4 font-black text-base tracking-[0.15em] uppercase border-2 border-ink rounded-2xl transition-all ${
                    selected.length >= 3
                      ? 'text-parchment-light shadow-neo-red hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer'
                      : 'text-ink opacity-25 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: selected.length >= 3 ? '#CC2200' : '#E8E0CC' }}
                >
                  {selected.length >= 3 ? `Batalhar! ⚔️` : `Selecione ${3 - selected.length} Pokémon`}
                </button>

                <button
                  onClick={() => { setShowSetup(false); setShowAbandon(true) }}
                  className="w-full py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/30 rounded-2xl text-ink/55 hover:text-ink/90 hover:border-ink/50 hover:bg-white transition-all cursor-pointer"
                >
                  🏳️ Abandonar run
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ABANDON CONFIRM ── */}
      {showAbandon && (
        <AbandonConfirmModal
          currentFloor={currentFloor}
          badgesEarned={badgesEarned}
          playerDeck={playerDeck}
          onConfirm={() => router.push('/game-over')}
          onCancel={() => setShowAbandon(false)}
        />
      )}

    </main>
  )
}
