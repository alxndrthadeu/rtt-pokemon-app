'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { POKEMON_TEMPLATES } from '@/lib/data/pokemon'
import { PokemonCard } from '@/components/PokemonCard'
import { getTypeColor, getTypeTextColor, getSpriteUrl, formatPokemonNumber } from '@/lib/typeColors'
import type { PokemonCard as PokemonCardType } from '@/types'

function makeDummyCard(template: typeof POKEMON_TEMPLATES[0]): PokemonCardType {
  return { ...template, isShiny: false, hearts: 3, isFainted: false, statusEffects: [], heldItem: null }
}

const SPECIAL_IDS = new Set([0, 9025])

export default function PokedexPage() {
  const router = useRouter()
  const { pokedexSeen } = useGameStore()
  const [selected, setSelected] = useState<PokemonCardType | null>(null)
  const [filter, setFilter] = useState<'all' | 'seen' | 'unseen'>('all')

  const seen = new Set(pokedexSeen)
  const seenCount = POKEMON_TEMPLATES.filter(t => seen.has(t.id)).length
  const total = POKEMON_TEMPLATES.length

  const filtered = POKEMON_TEMPLATES.filter(t => {
    if (filter === 'seen')   return seen.has(t.id)
    if (filter === 'unseen') return !seen.has(t.id)
    return true
  })

  const specials = filtered.filter(t => SPECIAL_IDS.has(t.id))
  const regular  = filtered.filter(t => !SPECIAL_IDS.has(t.id))
  const ordered  = [...regular.sort((a, b) => a.id - b.id), ...specials]

  return (
    <main className="min-h-screen bg-parchment dots">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-parchment/95 backdrop-blur-sm border-b-2 border-ink/10 px-5 py-3">
        <div className="max-w-[640px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="border-2 border-ink rounded-full px-3 py-1 font-game text-[6px] text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              ←
            </button>
            <div>
              <p className="font-game text-[7px] text-ink-soft opacity-50 uppercase tracking-wide">
                {seenCount}/{total} capturados
              </p>
              <p className="font-black text-sm text-ink uppercase">Pokédex</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1 max-w-[120px] h-2 rounded-full bg-ink/10 overflow-hidden border border-ink/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(seenCount / total) * 100}%`, backgroundColor: '#78C850' }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-5 py-5 flex flex-col gap-5 pb-24">

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'seen', 'unseen'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-2.5 font-game text-[7px] uppercase tracking-widest border-2 rounded-2xl transition-all cursor-pointer"
              style={filter === f
                ? { borderColor: '#2C1810', backgroundColor: '#2C1810', color: '#FBF5E6', boxShadow: '3px 3px 0 rgba(44,24,16,0.2)' }
                : { borderColor: '#2C181025', backgroundColor: 'transparent', color: '#2C181060' }
              }
            >
              {f === 'all' ? `Todos (${total})` : f === 'seen' ? `Vistos (${seenCount})` : `Ocultos (${total - seenCount})`}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {ordered.map(template => {
            const isSeen = seen.has(template.id)
            const tc = getTypeColor(template.type1)

            return (
              <button
                key={template.id}
                onClick={() => isSeen ? setSelected(makeDummyCard(template)) : null}
                className="flex flex-col items-center gap-1.5 border-2 rounded-2xl py-3 px-1 transition-all"
                style={{
                  borderColor: isSeen ? tc : '#2C181015',
                  backgroundColor: isSeen ? `${tc}12` : '#E8E0CC30',
                  cursor: isSeen ? 'pointer' : 'default',
                  boxShadow: isSeen ? `2px 2px 0 ${tc}40` : 'none',
                }}
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  {isSeen ? (
                    <img
                      src={getSpriteUrl(template.id)}
                      alt={template.name}
                      style={{ width: 48, height: 48, objectFit: 'contain' }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#2C181015' }}
                    >
                      <span style={{ fontSize: 24, filter: 'grayscale(1) brightness(0.3)', opacity: 0.3 }}>?</span>
                      {/* Silhouette using CSS filter */}
                      <img
                        src={getSpriteUrl(template.id)}
                        alt=""
                        aria-hidden
                        style={{
                          position: 'absolute',
                          width: 40,
                          height: 40,
                          objectFit: 'contain',
                          filter: 'brightness(0) opacity(0.15)',
                        }}
                      />
                    </div>
                  )}
                </div>
                {isSeen ? (
                  <>
                    <p className="font-game text-[5px] text-ink/60 uppercase tracking-wide text-center leading-tight w-full px-1 truncate">
                      {template.name}
                    </p>
                    <span
                      className="font-game text-[5px] px-1.5 py-0.5 rounded-full border border-ink/10"
                      style={{ backgroundColor: tc, color: getTypeTextColor(template.type1) }}
                    >
                      {template.type1}
                    </span>
                  </>
                ) : (
                  <p className="font-game text-[5px] text-ink/20 uppercase tracking-wide">
                    {SPECIAL_IDS.has(template.id) ? '???' : formatPokemonNumber(template.id)}
                  </p>
                )}
              </button>
            )
          })}
        </div>

      </div>

      {/* Detail overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(44,24,16,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-t-3xl border-t-4 border-x-4 border-ink p-5 pb-10"
            style={{ backgroundColor: '#FBF5E6' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-ink/20 mx-auto mb-5" />
            <div className="max-w-[280px] mx-auto">
              <PokemonCard pokemon={selected} />
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-full mt-4 py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/20 rounded-2xl text-ink/40 hover:text-ink/70 transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </main>
  )
}
