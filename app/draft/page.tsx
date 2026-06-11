'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { PokemonCard } from '@/components/PokemonCard'
import { makePokemonCard, DRAFT_POOL_COMMON, DRAFT_POOL_RARE, ASH_PIKACHU_ID } from '@/lib/data/pokemon'
import type { PokemonCard as PokemonCardType } from '@/types'

const DECK_SIZE = 6
const STARTER_IDS = [1, 4, 7]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generatePool(round: number, pickedIds: number[]): PokemonCardType[] {
  if (round === 1) {
    return STARTER_IDS.map((id) => makePokemonCard(id)!)
  }
  const pool = shuffle(
    [...DRAFT_POOL_COMMON, ...DRAFT_POOL_RARE].filter((id) => !pickedIds.includes(id)),
  ).slice(0, 3)
  return pool.map((id) => makePokemonCard(id)!)
}

export default function DraftPage() {
  const router = useRouter()
  const { mode, gender, playerName, rerollUsed, addToDeck, useReroll, createRun, playerDeck } =
    useGameStore()

  const [round, setRound] = useState(1)
  const [pool, setPool] = useState<PokemonCardType[]>([])
  const [deck, setDeck] = useState<PokemonCardType[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Redireciona se veio sem setup
  useEffect(() => {
    if (!mode || !gender) router.replace('/')
  }, [mode, gender, router])

  // Gera pool inicial
  useEffect(() => {
    const initial = generatePool(1, [])
    // Easter egg: personagem masculino chamado Ash → Ash's Pikachu como 4ª opção
    if (gender === 'boy' && playerName.trim().toLowerCase() === 'ash') {
      const ashPikachu = makePokemonCard(ASH_PIKACHU_ID)
      if (ashPikachu) initial.push(ashPikachu)
    }
    setPool(initial)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const pickedIds = deck.map((p) => p.id)

  function handleSelect(pokemon: PokemonCardType) {
    if (confirming) return
    setSelectedId((prev) => (prev === pokemon.id ? null : pokemon.id))
  }

  function handleConfirm() {
    if (selectedId === null) return
    const picked = pool.find((p) => p.id === selectedId)
    if (!picked) return

    setConfirming(true)
    const newDeck = [...deck, picked]
    setDeck(newDeck)
    setSelectedId(null)

    setTimeout(() => {
      if (newDeck.length < DECK_SIZE) {
        const nextRound = round + 1
        setRound(nextRound)
        setPool(generatePool(nextRound, newDeck.map((p) => p.id)))
      }
      setConfirming(false)
    }, 300)
  }

  function handleReroll() {
    if (rerollUsed || round === 1) return
    useReroll()
    setSelectedId(null)
    setPool(generatePool(round, pickedIds))
  }

  async function handleStartAdventure() {
    deck.forEach((p) => addToDeck(p))
    await createRun()
    router.push('/torre')
  }

  const isDraftComplete = deck.length === DECK_SIZE
  const isStarterRound = round === 1
  const selectedPokemon = pool.find((p) => p.id === selectedId) ?? null

  return (
    <main className="min-h-screen bg-parchment dots relative overflow-x-hidden">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-parchment/95 backdrop-blur-sm border-b-2 border-ink/10 px-5 py-3">
        <div className="max-w-[680px] mx-auto flex items-center justify-between gap-4">

          {/* Progresso do deck */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/personagem')}
              className="border-2 border-ink rounded-full px-3 py-1 font-game text-[6px] text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              ←
            </button>
            <div>
              <p className="font-game text-[7px] text-ink-soft opacity-50 uppercase tracking-wide">
                {playerName} · {mode === 'normal' ? 'Normal' : 'Hard'}
              </p>
              <p className="font-black text-sm text-ink uppercase">
                Deck{' '}
                <span style={{ color: deck.length === DECK_SIZE ? '#78C850' : '#CC2200' }}>
                  {deck.length}/{DECK_SIZE}
                </span>
              </p>
            </div>
          </div>

          {/* Mini cards do deck */}
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: DECK_SIZE }).map((_, i) => {
              const p = deck[i]
              return p ? (
                <div
                  key={i}
                  className="border-2 border-ink rounded-lg overflow-hidden bg-white"
                  style={{
                    width: 36,
                    height: 36,
                    boxShadow: '2px 2px 0 #2C1810',
                  }}
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                    alt={p.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  key={i}
                  className="border-2 border-dashed border-ink/20 rounded-lg bg-parchment-light/50 flex items-center justify-center"
                  style={{ width: 36, height: 36 }}
                >
                  <span className="font-game text-[8px] text-ink/20">{i + 1}</span>
                </div>
              )
            })}
          </div>

        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-[680px] mx-auto px-5 py-6 flex flex-col gap-6 pb-32">

        {!isDraftComplete ? (
          <>
            {/* Título da rodada */}
            <div className="text-center">
              {isStarterRound ? (
                <>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px w-8 bg-ink opacity-15" />
                    <span className="font-game text-[7px] text-ink-soft opacity-50 tracking-[0.5em] uppercase">
                      Rodada 1 · Sempre
                    </span>
                    <div className="h-px w-8 bg-ink opacity-15" />
                  </div>
                  <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
                    Escolha seu <span style={{ color: '#CC2200' }}>Inicial</span>
                  </h1>
                  <p className="text-sm text-ink-soft opacity-60 mt-1">
                    Bulbasaur, Charmander ou Squirtle — quem vai te acompanhar?
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px w-8 bg-ink opacity-15" />
                    <span className="font-game text-[7px] text-ink-soft opacity-50 tracking-[0.5em] uppercase">
                      Rodada {round} de {DECK_SIZE}
                    </span>
                    <div className="h-px w-8 bg-ink opacity-15" />
                  </div>
                  <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
                    Escolha <span style={{ color: '#3B4CCA' }}>1 Pokémon</span>
                  </h1>
                  <p className="text-sm text-ink-soft opacity-60 mt-1">
                    {DECK_SIZE - deck.length} vagas restantes no deck
                  </p>
                </>
              )}
            </div>

            {/* Cards — horizontal scroll snap no mobile, grid 3 colunas no desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
              {pool.map((pokemon) => (
                <div key={pokemon.id} className="shrink-0 w-[82vw] sm:w-auto" style={{ scrollSnapAlign: 'start' }}>
                  <PokemonCard
                    pokemon={pokemon}
                    selectable
                    selected={selectedId === pokemon.id}
                    onClick={() => handleSelect(pokemon)}
                  />
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-3">
              {/* Confirmar */}
              <button
                onClick={handleConfirm}
                disabled={selectedId === null || confirming}
                className={`w-full py-4 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl transition-all duration-100 ${
                  selectedId !== null
                    ? 'text-parchment-light shadow-neo-red hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer'
                    : 'text-ink opacity-25 cursor-not-allowed'
                }`}
                style={{ backgroundColor: selectedId !== null ? '#CC2200' : '#E8E0CC' }}
              >
                {selectedId !== null
                  ? `Adicionar ${selectedPokemon?.name ?? ''} ao deck →`
                  : 'Selecione um Pokémon'}
              </button>

              {/* Reroll — não disponível na rodada dos iniciais */}
              {!isStarterRound && (
                <button
                  onClick={handleReroll}
                  disabled={rerollUsed}
                  className={`w-full py-3 font-black text-sm tracking-[0.15em] uppercase border-2 border-ink rounded-2xl transition-all duration-100 ${
                    !rerollUsed
                      ? 'bg-parchment-light shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer text-ink'
                      : 'opacity-30 cursor-not-allowed bg-parchment-light text-ink'
                  }`}
                >
                  {rerollUsed ? '↺ Reroll já utilizado' : '↺ Reroll (1 disponível)'}
                </button>
              )}
            </div>
          </>
        ) : (
          /* ── Draft completo ── */
          <>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-px w-8 bg-ink opacity-15" />
                <span className="font-game text-[7px] text-ink-soft opacity-50 tracking-[0.5em] uppercase">
                  Draft completo
                </span>
                <div className="h-px w-8 bg-ink opacity-15" />
              </div>
              <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
                Seu <span style={{ color: '#78C850' }}>Time</span> está pronto!
              </h1>
              <p className="text-sm text-ink-soft opacity-60 mt-1">
                {playerName}, a torre de Kanto espera por você.
              </p>
            </div>

            {/* Deck final — grid 3x2 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {deck.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
              ))}
            </div>

            <button
              onClick={handleStartAdventure}
              className="w-full py-5 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl text-parchment-light shadow-neo-red hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
              style={{ backgroundColor: '#CC2200' }}
            >
              Escalar a Torre →
            </button>
          </>
        )}

      </div>
    </main>
  )
}
