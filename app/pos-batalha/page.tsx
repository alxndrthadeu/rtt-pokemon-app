'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { PokemonCard } from '@/components/PokemonCard'
import {
  makePokemonCard,
  DRAFT_POOL_COMMON, DRAFT_POOL_RARE, DRAFT_POOL_ULTRA, LEGENDARY_IDS, MISSINGNO_ID,
} from '@/lib/data/pokemon'
import { GYM_LEADERS } from '@/lib/data/gyms'
import { getTypeColor, getTypeTextColor, getSpriteUrl } from '@/lib/typeColors'
import type { PokemonCard as PokemonCardType } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Linha evolutiva dos iniciais: qualquer estágio → evolução garantida
const STARTER_STAGE2: Record<number, number> = { 1: 2, 4: 5, 7: 8 }       // base → 2ª forma
const STARTER_STAGE3: Record<number, number> = { 1: 3, 2: 3, 4: 6, 5: 6, 7: 9, 8: 9 } // qualquer estágio → final

function getGuaranteedEvo(deckIds: number[], stage: 2 | 3): number | null {
  const map = stage === 2 ? STARTER_STAGE2 : STARTER_STAGE3
  for (const id of Object.keys(map).map(Number)) {
    if (deckIds.includes(id)) return map[id]
  }
  return null
}

function injectGuaranteed(evoId: number, floor: number, exclude: Set<number>): PokemonCardType[] | null {
  if (exclude.has(evoId)) return null
  let candidates: number[]
  if (floor <= 2) candidates = [...DRAFT_POOL_COMMON, ...DRAFT_POOL_RARE]
  else if (floor <= 5) candidates = [...DRAFT_POOL_RARE, ...DRAFT_POOL_ULTRA]
  else candidates = [...DRAFT_POOL_ULTRA, ...LEGENDARY_IDS]

  const others = shuffle(candidates.filter(id => !exclude.has(id) && id !== evoId)).slice(0, 2)
  return shuffle([evoId, ...others]).map(id => makePokemonCard(id)!).filter(Boolean)
}

// Pool de draft pós-ginásio: raridade aumenta com o andar
function generatePostBattlePool(floor: number, deckIds: number[]): PokemonCardType[] {
  const exclude = new Set(deckIds)

  // Andar 0 (Brock): garante 2ª forma do inicial
  if (floor === 0) {
    const evoId = getGuaranteedEvo(deckIds, 2)
    if (evoId) {
      const result = injectGuaranteed(evoId, floor, exclude)
      if (result) return result
    }
  }

  // Andar 5 (Koga): garante forma final do inicial (qualquer estágio na linha)
  if (floor === 5) {
    const evoId = getGuaranteedEvo(deckIds, 3)
    if (evoId) {
      const result = injectGuaranteed(evoId, floor, exclude)
      if (result) return result
    }
  }

  let candidates: number[]

  if (floor <= 2) {
    candidates = [...DRAFT_POOL_COMMON, ...DRAFT_POOL_RARE]
  } else if (floor <= 5) {
    candidates = [...DRAFT_POOL_RARE, ...DRAFT_POOL_ULTRA]
  } else if (floor <= 8) {
    const withLegendary = Math.random() < 0.20
      ? [...DRAFT_POOL_ULTRA, ...LEGENDARY_IDS]
      : DRAFT_POOL_ULTRA
    candidates = withLegendary
  } else {
    const withMissing = Math.random() < 0.05
      ? [...DRAFT_POOL_ULTRA, ...LEGENDARY_IDS, MISSINGNO_ID]
      : [...DRAFT_POOL_ULTRA, ...LEGENDARY_IDS]
    candidates = withMissing
  }

  const pool = shuffle(candidates.filter(id => !exclude.has(id))).slice(0, 3)
  return pool.map(id => makePokemonCard(id)!).filter(Boolean)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Phase = 'pick_new' | 'pick_discard'

export default function PosBatalhaPage() {
  const router = useRouter()
  const { playerDeck, currentFloor, applyPostGymSwap, addPokedexEntry } = useGameStore()

  const [pool, setPool] = useState<PokemonCardType[]>([])
  const [picked, setPicked] = useState<PokemonCardType | null>(null)
  const [discardId, setDiscardId] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('pick_new')

  useEffect(() => {
    if (playerDeck.length === 0) { router.replace('/'); return }
    setPool(generatePostBattlePool(currentFloor - 1, playerDeck.map(p => p.id)))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // currentFloor já foi avançado pelo endBattle — a batalha que vencemos era floor-1
  const prevFloor   = currentFloor - 1
  const gym         = GYM_LEADERS[prevFloor]
  const gymColor    = gym ? getTypeColor(gym.specialtyType) : '#CC2200'
  const gymTextColor = gym ? getTypeTextColor(gym.specialtyType) : 'white'

  function handlePickNew(pokemon: PokemonCardType) {
    setPicked(pokemon)
  }

  function handleConfirmPick() {
    if (!picked) return
    setPhase('pick_discard')
    setDiscardId(null)
  }

  function handleConfirmSwap() {
    if (!picked || discardId === null) return
    addPokedexEntry([picked.id])
    applyPostGymSwap(picked, discardId)
    router.push('/entre-andares')
  }

  function handleSkip() {
    router.push('/entre-andares')
  }

  if (pool.length === 0) {
    return (
      <main className="min-h-screen bg-parchment dots flex items-center justify-center">
        <p className="font-game text-[8px] text-ink-soft uppercase tracking-widest">Gerando opções...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-parchment dots relative overflow-x-hidden">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b-4 border-ink px-5 py-3" style={{ backgroundColor: gymColor }}>
        <div className="max-w-[680px] mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="font-game text-[6px] uppercase tracking-widest" style={{ color: `${gymTextColor}80` }}>
              {gym ? `${gym.name} derrotado!` : 'Ginásio vencido!'}
            </p>
            <p className="font-black text-base uppercase tracking-wide" style={{ color: gymTextColor }}>
              {phase === 'pick_new' ? 'Escolha um novo Pokémon' : 'Qual vai sair do deck?'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Step indicator */}
            {(['pick_new', 'pick_discard'] as Phase[]).map((p, i) => (
              <div key={p} className="w-2 h-2 rounded-full border border-white/40" style={{ backgroundColor: phase === p ? 'white' : 'rgba(255,255,255,0.25)' }} />
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[680px] mx-auto px-5 py-6 flex flex-col gap-6 pb-32">

        {/* ── Fase 1: escolher novo Pokémon ── */}
        {phase === 'pick_new' && (
          <>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-px w-8 bg-ink opacity-15" />
                <span className="font-game text-[7px] text-ink-soft opacity-50 tracking-[0.5em] uppercase">Passo 1 de 2</span>
                <div className="h-px w-8 bg-ink opacity-15" />
              </div>
              <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
                Recrutar <span style={{ color: gymColor }}>Pokémon</span>
              </h1>
              <p className="text-sm text-ink-soft opacity-60 mt-1">
                Escolha 1 para adicionar ao seu deck — ou pule para continuar com o time atual.
              </p>
            </div>

            {/* Pool de 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {pool.map(pokemon => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  selectable
                  selected={picked?.id === pokemon.id}
                  onClick={() => handlePickNew(pokemon)}
                />
              ))}
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmPick}
                disabled={!picked}
                className="w-full py-4 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl transition-all duration-100 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                style={{ backgroundColor: picked ? gymColor : '#E8E0CC', color: picked ? gymTextColor : '#2C1810', boxShadow: picked ? '4px 4px 0 #2C1810' : 'none' }}
              >
                {picked ? `Recrutar ${picked.name} →` : 'Selecione um Pokémon'}
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/20 rounded-2xl text-ink/40 hover:text-ink/70 transition-all cursor-pointer"
              >
                Pular — manter deck atual
              </button>
            </div>

            {/* Deck atual (referência) */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-ink opacity-10" />
                <span className="font-game text-[7px] text-ink-soft opacity-40 uppercase tracking-widest">Seu deck atual</span>
                <div className="h-px flex-1 bg-ink opacity-10" />
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {playerDeck.map(p => (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <div className="border-2 border-ink rounded-xl overflow-hidden bg-white" style={{ width: 48, height: 48, boxShadow: '2px 2px 0 #2C1810' }}>
                      <img src={getSpriteUrl(p.id)} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="font-game text-[6px] text-ink-soft opacity-50 uppercase">{p.name.slice(0, 6)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Fase 2: escolher quem sai ── */}
        {phase === 'pick_discard' && picked && (
          <>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-px w-8 bg-ink opacity-15" />
                <span className="font-game text-[7px] text-ink-soft opacity-50 tracking-[0.5em] uppercase">Passo 2 de 2</span>
                <div className="h-px w-8 bg-ink opacity-15" />
              </div>
              <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
                Quem <span style={{ color: '#CC2200' }}>sai</span> do deck?
              </h1>
              <p className="text-sm text-ink-soft opacity-60 mt-1">
                <strong>{picked.name}</strong> entra — escolha quem fica de fora.
              </p>
            </div>

            {/* Preview do novo */}
            <div className="border-2 border-ink rounded-2xl p-3 flex items-center gap-3" style={{ backgroundColor: `${gymColor}15`, borderColor: gymColor }}>
              <img src={getSpriteUrl(picked.id)} alt={picked.name} style={{ width: 56, height: 56, objectFit: 'contain' }} />
              <div>
                <span className="font-game text-[6px] uppercase tracking-widest" style={{ color: gymColor }}>Entrando</span>
                <p className="font-black text-base text-ink uppercase tracking-tight">{picked.name}</p>
              </div>
            </div>

            {/* Deck para escolher quem sai */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {playerDeck.map(p => {
                const tc = getTypeColor(p.type1)
                const isDiscard = discardId === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setDiscardId(isDiscard ? null : p.id)}
                    className="flex flex-col border-2 border-ink rounded-2xl overflow-hidden bg-white text-left transition-all duration-100 cursor-pointer"
                    style={isDiscard
                      ? { borderColor: '#CC2200', boxShadow: '3px 3px 0 #CC2200', transform: 'translate(2px,2px)' }
                      : { boxShadow: '3px 3px 0 #2C1810' }
                    }
                  >
                    <div className="h-1.5 w-full" style={{ backgroundColor: tc }} />
                    <div className="flex items-center gap-2 p-2">
                      <img src={getSpriteUrl(p.id)} alt={p.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[10px] text-ink uppercase tracking-tight truncate">{p.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-game text-[6px] text-ink/50 tracking-widest">HP</span>
                          <span className="font-game text-[7px] font-black"
                            style={{ color: p.hearts <= 1 ? '#E82020' : p.hearts <= 2 ? '#F0C000' : '#2C1810' }}>
                            {p.hearts}/{p.hearts}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isDiscard && (
                      <div className="px-2 pb-2">
                        <span className="font-game text-[6px] uppercase tracking-widest" style={{ color: '#CC2200' }}>← Sai</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmSwap}
                disabled={discardId === null}
                className="w-full py-4 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl transition-all duration-100 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer text-parchment-light"
                style={{ backgroundColor: discardId !== null ? '#CC2200' : '#E8E0CC', boxShadow: discardId !== null ? '4px 4px 0 #2C1810' : 'none' }}
              >
                {discardId !== null
                  ? `Confirmar troca →`
                  : 'Selecione quem sai'}
              </button>
              <button
                onClick={() => setPhase('pick_new')}
                className="w-full py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/20 rounded-2xl text-ink/40 hover:text-ink/70 transition-all cursor-pointer"
              >
                ← Voltar e escolher outro
              </button>
            </div>
          </>
        )}

      </div>
    </main>
  )
}
