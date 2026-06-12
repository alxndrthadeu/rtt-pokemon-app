'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore, SHOP_FLOORS, HEAL_COST } from '@/store/gameStore'
import { GYM_LEADERS } from '@/lib/data/gyms'
import { AbandonConfirmModal } from '@/components/AbandonConfirmModal'
import { PokemonCard as PokemonCardDisplay } from '@/components/PokemonCard'
import { getTypeColor, getTypeTextColor, getSpriteUrl, getPixelSpriteUrl } from '@/lib/typeColors'
import type { PokemonCard as PokemonCardType } from '@/types'

// ─── Assets ───────────────────────────────────────────────────────────────────

const NURSE_JOY_URL = 'https://play.pokemonshowdown.com/sprites/trainers/nursejoy.png'

// Gen 5 BW animated sprites by Pokémon ID
function getAnimatedSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`
}

// Official Kanto badge sprites (PokéAPI items)
const BADGE_URLS: Record<number, string> = {
  0: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/boulder-badge.png',
  1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/cascade-badge.png',
  2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-badge.png',
  3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rainbow-badge.png',
  4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soul-badge.png',
  5: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/marsh-badge.png',
  6: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/volcano-badge.png',
  7: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/earth-badge.png',
}

const ELITE_FOUR_START = 9 // currentFloor >= 9 → entre Elite 4, sem Centro

const AI_LABEL: Record<string, string> = {
  random: 'Fácil', weighted: 'Médio', adaptive: 'Difícil', predictive: 'Expert',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BadgeIcon({ gymIdx, earned }: { gymIdx: number; earned: boolean }) {
  const [err, setErr] = useState(false)
  const gym = GYM_LEADERS[gymIdx]
  const tc = getTypeColor(gym.specialtyType)

  if (err || !BADGE_URLS[gymIdx]) {
    return (
      <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
        style={{
          borderColor: earned ? tc : '#ccc',
          backgroundColor: earned ? `${tc}22` : '#f0f0f0',
          filter: earned ? 'none' : 'grayscale(1) opacity(0.35)',
        }}>
        <span className="font-black text-[10px]" style={{ color: earned ? tc : '#888' }}>
          {gym.name[0]}
        </span>
      </div>
    )
  }

  return (
    <div className="relative w-10 h-10 flex items-center justify-center"
      style={{ filter: earned ? 'none' : 'grayscale(1) opacity(0.25)' }}>
      <img
        src={BADGE_URLS[gymIdx]}
        alt={gym.badge}
        className="w-10 h-10 object-contain"
        style={{ imageRendering: 'pixelated' }}
        onError={() => setErr(true)}
      />
      {earned && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border border-white flex items-center justify-center">
          <span style={{ fontSize: 7, color: 'white', fontWeight: 900 }}>✓</span>
        </div>
      )}
    </div>
  )
}

function PokemonSlot({
  pokemon, onClick,
}: { pokemon: PokemonCardType; onClick: () => void }) {
  const [animErr, setAnimErr] = useState(false)
  const fainted = pokemon.isFainted || pokemon.hearts <= 0
  const tc = getTypeColor(pokemon.type1)

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border-2 transition-all cursor-pointer active:scale-95"
      style={{
        borderColor: fainted ? '#ccc' : `${tc}55`,
        backgroundColor: fainted ? '#f5f5f5' : `${tc}0A`,
      }}
    >
      {/* Sprite */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        {fainted ? (
          // Desmaiado — sprite estático com filtro de tristeza
          <div className="relative">
            <img
              src={getSpriteUrl(pokemon.id)}
              alt={pokemon.name}
              className="w-12 h-12 object-contain"
              style={{ filter: 'grayscale(1) brightness(0.55) opacity(0.6)', transform: 'rotate(-25deg)' }}
            />
            <span className="absolute -top-1 -right-1 text-[14px]">💀</span>
          </div>
        ) : animErr ? (
          // Fallback para sprite estático
          <img src={getSpriteUrl(pokemon.id)} alt={pokemon.name} className="w-12 h-12 object-contain" />
        ) : (
          // Sprite animado Gen 5
          <img
            src={getAnimatedSpriteUrl(pokemon.id)}
            alt={pokemon.name}
            className="w-14 h-14 object-contain"
            style={{ imageRendering: 'pixelated' }}
            onError={() => setAnimErr(true)}
          />
        )}
      </div>

      {/* Nome */}
      <p className="font-game text-[6px] uppercase tracking-wide text-center leading-tight w-full px-0.5 truncate"
        style={{ color: fainted ? '#aaa' : '#2C1810' }}>
        {pokemon.name}
      </p>

      {/* HP */}
      <div className="flex items-center gap-0.5">
        {fainted ? (
          <span className="font-game text-[6px] text-red-400">Desmaiado</span>
        ) : (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full border border-ink/10"
                style={{
                  backgroundColor: i < pokemon.hearts
                    ? (pokemon.hearts <= 1 ? '#E82020' : pokemon.hearts <= 2 ? '#F0A000' : '#4CAF50')
                    : 'transparent',
                }} />
            ))}
          </>
        )}
      </div>
    </button>
  )
}

// ─── Bottom Sheets ────────────────────────────────────────────────────────────

function BottomSheet({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(44,24,16,0.6)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-t-3xl border-t-4 border-x-4 border-ink bg-parchment-light overflow-y-auto"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-ink/20 mx-auto mt-4 mb-1" />
        <div className="px-5 pb-2 pt-1 border-b border-ink/10">
          <p className="font-black text-base text-ink uppercase tracking-tight">{title}</p>
        </div>
        <div className="px-5 py-4 pb-10">{children}</div>
      </div>
    </div>
  )
}

function BadgesSheetContent({ badgesEarned }: { badgesEarned: number[] }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="font-game text-[7px] text-ink/40 uppercase tracking-widest">
        {badgesEarned.length}/8 insígnias conquistadas
      </p>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => {
          const gym = GYM_LEADERS[i]
          const earned = badgesEarned.includes(i)
          const tc = getTypeColor(gym.specialtyType)
          return (
            <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border-2 py-4 px-2"
              style={{
                borderColor: earned ? tc : '#2C181020',
                backgroundColor: earned ? `${tc}12` : '#E8E0CC40',
                opacity: earned ? 1 : 0.4,
              }}>
              <BadgeIcon gymIdx={i} earned={earned} />
              <div className="text-center">
                <p className="font-black text-[9px] text-ink uppercase leading-tight">{gym.badge}</p>
                <p className="font-game text-[6px] text-ink/40 uppercase tracking-wide mt-0.5">{gym.name}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NextGymSheetContent({ nextGym, nextGymIdx }: { nextGym: typeof GYM_LEADERS[0]; nextGymIdx: number }) {
  const tc = getTypeColor(nextGym.specialtyType)
  const [trainerErr, setTrainerErr] = useState(false)
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
  return (
    <div className="flex flex-col gap-5">
      {/* Trainer header */}
      <div className="rounded-2xl overflow-hidden border-2 border-ink"
        style={{ backgroundColor: `${tc}15` }}>
        <div className="h-2" style={{ backgroundColor: tc }} />
        <div className="flex items-end gap-4 px-5 pt-4 pb-3">
          {trainerErr ? (
            <div className="w-20 h-20 rounded-xl flex items-center justify-center font-black text-white text-2xl"
              style={{ backgroundColor: tc }}>
              {nextGym.name[0]}
            </div>
          ) : (
            <img src={TRAINER_PORTRAIT[nextGym.name] ?? ''} alt={nextGym.name}
              style={{ imageRendering: 'pixelated', width: 80, height: 80, objectFit: 'contain' }}
              onError={() => setTrainerErr(true)} />
          )}
          <div className="flex-1 pb-1">
            <p className="font-black text-xl text-ink uppercase tracking-tight">{nextGym.name}</p>
            <p className="text-sm text-ink/55 leading-tight">{nextGym.title}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/15"
                style={{ backgroundColor: tc, color: getTypeTextColor(nextGym.specialtyType) }}>
                {nextGym.specialtyType}
              </span>
              <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/15 bg-parchment-light text-ink/50">
                {AI_LABEL[nextGym.aiLevel]}
              </span>
              <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/15 bg-parchment-light text-ink/50">
                Andar {nextGymIdx + 1}/12
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-ink/60 leading-relaxed">{nextGym.description}</p>

      {/* Badge */}
      <div className="flex items-center gap-3 border border-ink/10 rounded-2xl px-4 py-3 bg-white/50">
        <BadgeIcon gymIdx={nextGymIdx} earned={false} />
        <div>
          <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest">Recompensa</p>
          <p className="font-black text-sm text-ink">{nextGym.badge}</p>
        </div>
      </div>

      {/* Team preview */}
      <div>
        <p className="font-game text-[6px] text-ink/30 uppercase tracking-widest mb-2">Time do adversário</p>
        <div className="flex gap-2 flex-wrap">
          {nextGym.teamIds.slice(0, 6).map(id => (
            <div key={id} className="w-12 h-12 rounded-xl border border-ink/15 bg-parchment-light flex items-center justify-center">
              <img src={getPixelSpriteUrl(id)} alt="" style={{ width: 36, height: 36, imageRendering: 'pixelated' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeaderBadge({ gymIdx, earned, typeColor }: { gymIdx: number; earned: boolean; typeColor: string }) {
  const [err, setErr] = useState(false)
  const gym = GYM_LEADERS[gymIdx]
  if (err || !BADGE_URLS[gymIdx]) {
    return (
      <div className="w-6 h-6 rounded-full border flex items-center justify-center"
        style={{
          borderColor: earned ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
          backgroundColor: earned ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
          filter: earned ? 'none' : 'opacity(0.3)',
        }}>
        <span style={{ fontSize: 8, color: 'white', fontWeight: 900 }}>{gym.name[0]}</span>
      </div>
    )
  }
  return (
    <div className="w-6 h-6 flex items-center justify-center"
      style={{ filter: earned ? 'none' : 'grayscale(1) opacity(0.3)' }}>
      <img src={BADGE_URLS[gymIdx]} alt={gym.badge}
        className="w-6 h-6 object-contain"
        style={{ imageRendering: 'pixelated' }}
        onError={() => setErr(true)} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EntreAndaresPage() {
  const router = useRouter()
  const {
    currentFloor, playerDeck, coins, badgesEarned,
    shopVisitedFloors, healAtCenter, setRunEndReason,
  } = useGameStore()

  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [showBadgesSheet, setShowBadgesSheet] = useState(false)
  const [showNextGymSheet, setShowNextGymSheet] = useState(false)
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonCardType | null>(null)
  const [healAnimation, setHealAnimation] = useState(false)
  const [nurseErr, setNurseErr] = useState(false)

  const prevFloor = currentFloor - 1
  const prevGym   = GYM_LEADERS[prevFloor]
  const nextGym   = GYM_LEADERS[currentFloor]
  const isGameComplete = currentFloor >= 12
  const isEliteFour    = currentFloor >= ELITE_FOUR_START

  const prevGymColor = prevGym ? getTypeColor(prevGym.specialtyType) : '#CC2200'
  const nextGymColor = nextGym ? getTypeColor(nextGym.specialtyType) : '#CC2200'

  const shopAvailable = SHOP_FLOORS.includes(currentFloor as (typeof SHOP_FLOORS)[number])
    && !shopVisitedFloors.includes(currentFloor)
  const shopVisited   = shopVisitedFloors.includes(currentFloor)

  const allHealthy = playerDeck.every(p => !p.isFainted && p.hearts >= 5)
  const canHeal    = !isEliteFour && coins >= HEAL_COST && !allHealthy

  if (!prevGym && !isGameComplete) { router.replace('/'); return null }

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

  function handleHeal() {
    if (!canHeal) return
    healAtCenter()
    setHealAnimation(true)
    setTimeout(() => setHealAnimation(false), 2000)
  }

  function handleContinue() {
    router.push(isGameComplete ? '/conclusao' : '/torre')
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: '#F0F4F8' }}>

      {/* ── HEADER ── */}
      <header className="border-b-4 border-ink px-5 py-4" style={{ backgroundColor: prevGymColor }}>
        <div className="max-w-[640px] mx-auto">
          {/* Top row: gym beaten + coins */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {prevGym && (
                <BadgeIcon gymIdx={prevFloor} earned={true} />
              )}
              <div>
                <p className="font-game text-[6px] text-white/60 uppercase tracking-widest leading-none mb-0.5">
                  Andar {(prevFloor ?? 0) + 1}/12 concluído
                </p>
                <p className="font-black text-lg text-white uppercase tracking-tight leading-none">
                  {isGameComplete ? 'Kanto conquistada!' : `${prevGym?.name} derrotado!`}
                </p>
                {prevGym?.badge && (
                  <p className="font-game text-[7px] text-white/70 mt-0.5">{prevGym.badge} conquistada!</p>
                )}
              </div>
            </div>
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border-2 border-white/25 bg-white/15">
              <span className="text-lg leading-none">🪙</span>
              <span className="font-black text-base text-white leading-none">{coins}</span>
            </div>
          </div>

          {/* Badge strip */}
          <button
            onClick={() => setShowBadgesSheet(true)}
            className="mt-3 flex items-center gap-2 w-full cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => {
                const earned = badgesEarned.includes(i)
                const gym = GYM_LEADERS[i]
                const tc = getTypeColor(gym.specialtyType)
                return (
                  <HeaderBadge key={i} gymIdx={i} earned={earned} typeColor={tc} />
                )
              })}
            </div>
            <span className="font-game text-[6px] text-white/50 uppercase tracking-widest ml-auto shrink-0">
              {badgesEarned.length}/8 ↗
            </span>
          </button>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-5 flex flex-col gap-4 pb-32">

        {/* ── CENTRO POKÉMON BUILDING ── */}
        <div className="rounded-2xl border-2 border-ink overflow-hidden"
          style={{ backgroundColor: 'white', boxShadow: '4px 4px 0 #2C1810' }}>

          {/* Red roof stripes */}
          <div className="h-3 flex">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1"
                style={{ backgroundColor: i % 2 === 0 ? '#CC2200' : '#FF3322' }} />
            ))}
          </div>

          {/* Centro header + Nurse Joy (non-Elite) */}
          {!isEliteFour ? (
            <div className="flex items-center gap-3 px-4 pt-3 pb-2 border-b border-ink/8"
              style={{ backgroundColor: '#FFF8F8' }}>
              {nurseErr ? (
                <div className="w-14 h-14 rounded-full bg-pink-100 border-2 border-pink-200 flex items-center justify-center text-2xl shrink-0">
                  👩‍⚕️
                </div>
              ) : (
                <img
                  src={NURSE_JOY_URL}
                  alt="Nurse Joy"
                  className="w-14 h-14 object-contain shrink-0"
                  style={{ imageRendering: 'pixelated' }}
                  onError={() => setNurseErr(true)}
                />
              )}
              <div>
                <p className="font-black text-sm text-ink uppercase tracking-tight">Centro Pokémon</p>
                <p className="text-[11px] leading-relaxed"
                  style={{ color: healAnimation ? '#2AAA2A' : '#CC6688' }}>
                  {healAnimation
                    ? '✨ Seus Pokémon foram curados!'
                    : allHealthy
                    ? 'Seu time está em ótima forma!'
                    : 'Posso curar seus Pokémon por você!'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 pt-3 pb-2 border-b border-ink/8"
              style={{ backgroundColor: '#1A1A2E' }}>
              <span className="text-3xl">⚔️</span>
              <div>
                <p className="font-black text-sm text-white uppercase tracking-tight">Elite 4</p>
                <p className="text-[11px] text-white/50 leading-tight">Sem descanso. Prepare-se.</p>
              </div>
            </div>
          )}

          {/* Pokémon team display */}
          <div className="px-4 py-4">
            <p className="font-game text-[6px] text-ink/30 uppercase tracking-widest mb-3">
              Seu time — {playerDeck.length} Pokémon
            </p>
            <div className="grid grid-cols-3 gap-2">
              {playerDeck.map(p => (
                <PokemonSlot
                  key={p.id}
                  pokemon={p}
                  onClick={() => setSelectedPokemon(p)}
                />
              ))}
              {/* Empty slots if team < 6 */}
              {Array.from({ length: Math.max(0, 6 - playerDeck.length) }).map((_, i) => (
                <div key={`empty-${i}`}
                  className="rounded-2xl border-2 border-dashed border-ink/10 flex items-center justify-center"
                  style={{ minHeight: 90, backgroundColor: '#F8F8F8' }}>
                  <span className="text-ink/15 text-xl">+</span>
                </div>
              ))}
            </div>
          </div>

          {/* Heal action (non-Elite) */}
          {!isEliteFour && (
            <div className="border-t border-ink/8 px-4 pb-4 pt-3"
              style={{ backgroundColor: '#FFF8F8' }}>
              <button
                onClick={handleHeal}
                disabled={!canHeal}
                className="w-full py-3 rounded-2xl border-2 font-black text-sm uppercase tracking-[0.1em] transition-all cursor-pointer disabled:cursor-not-allowed"
                style={canHeal ? {
                  borderColor: '#CC2200',
                  backgroundColor: '#CC2200',
                  color: 'white',
                  boxShadow: '3px 3px 0 #2C1810',
                } : {
                  borderColor: allHealthy ? '#78C850' : '#ccc',
                  backgroundColor: allHealthy ? '#78C85018' : '#f5f5f5',
                  color: allHealthy ? '#78C850' : '#aaa',
                }}
              >
                {allHealthy
                  ? '✅ Time em plena saúde'
                  : canHeal
                  ? `💊 Curar todos — ${HEAL_COST} 🪙`
                  : `💊 Curar todos — ${HEAL_COST} 🪙 (sem moedas)`}
              </button>
              {!allHealthy && (
                <p className="text-center font-game text-[6px] text-ink/30 uppercase tracking-widest mt-1.5">
                  Saldo atual: {coins} 🪙
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── POKÉMART ── */}
        {!isEliteFour && (
          <div className="rounded-2xl border-2 border-ink overflow-hidden"
            style={{ backgroundColor: 'white', boxShadow: '4px 4px 0 #2C1810' }}>
            <div className="h-2 flex">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-1"
                  style={{ backgroundColor: i % 2 === 0 ? '#2C7BB5' : '#3A8FD0' }} />
              ))}
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-ink uppercase tracking-tight leading-tight">Pokémart</p>
                <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest leading-none mt-0.5">
                  Itens, hold items e consumíveis
                </p>
              </div>
              {shopAvailable && (
                <span className="font-game text-[6px] px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: '#2C7BB5' }}>
                  NOVO
                </span>
              )}
            </div>
            <div className="border-t border-ink/8 px-4 pb-3 pt-2">
              <button
                onClick={() => router.push('/loja')}
                className="w-full py-2.5 rounded-xl border-2 font-black text-sm uppercase tracking-[0.1em] transition-all cursor-pointer"
                style={{
                  borderColor: '#2C7BB5',
                  backgroundColor: '#2C7BB5',
                  color: 'white',
                  boxShadow: '3px 3px 0 #2C1810',
                }}
              >
                Entrar na Loja →
              </button>
            </div>
          </div>
        )}

        {/* ── MOCHILA ── */}
        <div className="rounded-2xl border-2 border-ink overflow-hidden"
          style={{ backgroundColor: 'white', boxShadow: '4px 4px 0 #2C1810' }}>
          <div className="h-2 flex">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-1"
                style={{ backgroundColor: i % 2 === 0 ? '#78C850' : '#5CA832' }} />
            ))}
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🎒</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-ink uppercase tracking-tight leading-tight">Mochila</p>
              <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest leading-none mt-0.5">
                Use consumíveis e gerencie equipamentos
              </p>
            </div>
          </div>
          <div className="border-t border-ink/8 px-4 pb-3 pt-2">
            <button
              onClick={() => router.push('/mochila')}
              className="w-full py-2.5 rounded-xl border-2 font-black text-sm uppercase tracking-[0.1em] transition-all cursor-pointer"
              style={{
                borderColor: '#78C850',
                backgroundColor: '#78C850',
                color: 'white',
                boxShadow: '3px 3px 0 #2C1810',
              }}
            >
              Abrir Mochila →
            </button>
          </div>
        </div>

        {/* ── PRÓXIMO GYM (compact → tap para bottom sheet) ── */}
        {!isGameComplete && nextGym && (
          <button
            onClick={() => setShowNextGymSheet(true)}
            className="w-full rounded-2xl border-2 border-ink overflow-hidden text-left cursor-pointer transition-all hover:scale-[1.01]"
            style={{ backgroundColor: 'white', boxShadow: '3px 3px 0 #2C1810' }}
          >
            <div className="h-1.5" style={{ backgroundColor: nextGymColor }} />
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-ink/10"
                style={{ backgroundColor: `${nextGymColor}18` }}>
                <BadgeIcon gymIdx={currentFloor} earned={false} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest leading-none">
                  Próximo desafio · Andar {currentFloor + 1}/12
                </p>
                <p className="font-black text-sm text-ink uppercase leading-tight truncate mt-0.5">
                  {nextGym.name}
                </p>
                <div className="flex gap-1.5 mt-1">
                  <span className="font-game text-[6px] px-1.5 py-[2px] rounded-full leading-none"
                    style={{ backgroundColor: nextGymColor, color: getTypeTextColor(nextGym.specialtyType) }}>
                    {nextGym.specialtyType}
                  </span>
                  <span className="font-game text-[6px] px-1.5 py-[2px] rounded-full bg-ink/8 text-ink/40 leading-none">
                    {AI_LABEL[nextGym.aiLevel]}
                  </span>
                </div>
              </div>
              <span className="text-ink/25 text-lg shrink-0">↗</span>
            </div>
          </button>
        )}

        {/* Game complete card */}
        {isGameComplete && (
          <div className="border-2 border-ink rounded-2xl p-6 text-center bg-white"
            style={{ boxShadow: '4px 4px 0 #2C1810' }}>
            <p className="text-4xl mb-2">🏆</p>
            <p className="font-black text-lg text-ink uppercase tracking-tight">Kanto conquistada!</p>
            <p className="text-sm text-ink/55 leading-relaxed mt-1">
              Você derrotou todos os ginásios, o Elite Four e o Campeão.
            </p>
          </div>
        )}

        {/* ── CTAs ── */}
        <button
          onClick={handleContinue}
          className="w-full py-4 font-black text-base tracking-[0.15em] uppercase border-2 border-ink rounded-2xl text-white shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          style={{ backgroundColor: isGameComplete ? '#78C850' : isEliteFour ? '#1A1A2E' : '#CC2200' }}
        >
          {isGameComplete
            ? '🏆 Ver resultados finais →'
            : isEliteFour
            ? `⚔️ Enfrentar ${nextGym?.name} →`
            : `Avançar para ${nextGym?.name} →`}
        </button>

        <button
          onClick={() => setShowQuitConfirm(true)}
          className="w-full py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/12 rounded-2xl text-ink/30 hover:text-ink/55 hover:border-ink/20 transition-all cursor-pointer"
        >
          🏳️ Abandonar a run
        </button>

      </div>

      {/* ── BOTTOM SHEETS ── */}

      {/* Pokémon detail */}
      <BottomSheet
        open={selectedPokemon !== null}
        onClose={() => setSelectedPokemon(null)}
        title={selectedPokemon?.name ?? ''}
      >
        {selectedPokemon && (
          <div className="flex flex-col gap-4">
            <div className="max-w-[280px] mx-auto">
              <PokemonCardDisplay pokemon={selectedPokemon} />
            </div>
            <button
              onClick={() => setSelectedPokemon(null)}
              className="w-full py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/15 rounded-2xl text-ink/40 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Badges */}
      <BottomSheet
        open={showBadgesSheet}
        onClose={() => setShowBadgesSheet(false)}
        title="Insígnias de Kanto"
      >
        <BadgesSheetContent badgesEarned={badgesEarned} />
      </BottomSheet>

      {/* Next gym */}
      <BottomSheet
        open={showNextGymSheet}
        onClose={() => setShowNextGymSheet(false)}
        title={nextGym ? `${nextGym.name} — Andar ${currentFloor + 1}` : 'Próximo Desafio'}
      >
        {nextGym && (
          <NextGymSheetContent nextGym={nextGym} nextGymIdx={currentFloor} />
        )}
      </BottomSheet>

      {/* Abandon */}
      {showQuitConfirm && (
        <AbandonConfirmModal
          currentFloor={currentFloor}
          badgesEarned={badgesEarned}
          playerDeck={playerDeck}
          onConfirm={() => { setRunEndReason('abandoned'); router.push('/game-over') }}
          onCancel={() => setShowQuitConfirm(false)}
        />
      )}

    </main>
  )
}
