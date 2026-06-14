'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { getTypeColor, getTypeTextColor, getSpriteUrl } from '@/lib/typeColors'

export default function RecrutarLendarioPage() {
  const router = useRouter()
  const { pendingLegendaryCard, playerDeck, currentFloor, recruitLegendary, addPokedexEntry } = useGameStore()
  const [discardId, setDiscardId] = useState<number | null>(null)

  const prevFloor = currentFloor - 1
  const nextRoute = prevFloor >= 8 ? '/entre-andares' : '/pos-batalha'

  useEffect(() => {
    if (!pendingLegendaryCard) { router.replace('/entre-andares'); return }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!pendingLegendaryCard) return null

  const lColor = getTypeColor(pendingLegendaryCard.type1)
  const lText  = getTypeTextColor(pendingLegendaryCard.type1)

  function handleConfirm() {
    if (discardId === null) return
    addPokedexEntry([pendingLegendaryCard!.id])
    recruitLegendary(discardId)
    router.push(nextRoute)
  }

  return (
    <main className="min-h-screen bg-parchment dots">

      {/* Header */}
      <header className="border-b-4 border-ink px-5 py-4" style={{ backgroundColor: lColor }}>
        <div className="max-w-[640px] mx-auto">
          <p className="font-game text-[6px] uppercase tracking-widest mb-0.5" style={{ color: `${lText}80` }}>
            Lendário Capturado!
          </p>
          <p className="font-black text-xl uppercase tracking-tight leading-none" style={{ color: lText }}>
            Recrutar {pendingLegendaryCard.name}
          </p>
        </div>
      </header>

      <div className="max-w-[480px] mx-auto px-5 py-6 flex flex-col gap-6" style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))' }}>

        {/* Card do lendário */}
        <div className="border-4 border-ink rounded-3xl overflow-hidden shadow-neo-lg"
          style={{ background: `linear-gradient(135deg, ${lColor}22 0%, white 50%)` }}>
          <div className="h-2" style={{ backgroundColor: lColor }} />
          <div className="flex items-center gap-4 p-5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full animate-pulse"
                style={{ backgroundColor: `${lColor}30`, animationDuration: '2s' }} />
              <img
                src={getSpriteUrl(pendingLegendaryCard.id)}
                alt={pendingLegendaryCard.name}
                style={{ width: 96, height: 96, objectFit: 'contain', imageRendering: 'pixelated', position: 'relative' }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black text-xl text-ink uppercase tracking-tight">{pendingLegendaryCard.name}</p>
                <span className="font-game text-[6px] px-2 py-1 rounded-full"
                  style={{ backgroundColor: lColor, color: lText }}>
                  {pendingLegendaryCard.type1}
                </span>
                {pendingLegendaryCard.type2 && (
                  <span className="font-game text-[6px] px-2 py-1 rounded-full"
                    style={{ backgroundColor: getTypeColor(pendingLegendaryCard.type2), color: getTypeTextColor(pendingLegendaryCard.type2) }}>
                    {pendingLegendaryCard.type2}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border-2"
                    style={{ backgroundColor: lColor, borderColor: `${lColor}80` }} />
                ))}
                <span className="font-game text-[7px] text-ink/50 ml-1">5♥</span>
              </div>
              <p className="text-[10px] text-ink/50 leading-tight">{pendingLegendaryCard.ability.name} — {pendingLegendaryCard.ability.description}</p>
            </div>
          </div>
          <div className="border-t border-ink/10 px-5 py-3 grid grid-cols-3 gap-2">
            {(['rock', 'paper', 'scissors'] as const).map(slot => {
              const m = pendingLegendaryCard.moves[slot]
              const mc = getTypeColor(m.type)
              return (
                <div key={slot} className="text-center">
                  <span className="font-game text-[6px] px-1.5 py-0.5 rounded-full text-white block mb-0.5"
                    style={{ backgroundColor: mc }}>{m.type}</span>
                  <p className="font-black text-[9px] text-ink leading-tight">{m.name}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Instrução */}
        <div className="text-center">
          <h2 className="font-black text-xl text-ink uppercase tracking-tight">
            Quem <span style={{ color: '#CC2200' }}>sai</span> do time?
          </h2>
          <p className="text-sm text-ink/50 mt-1">
            {pendingLegendaryCard.name} entra — escolha quem fica de fora.
          </p>
        </div>

        {/* Time atual */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {playerDeck.map(p => {
            const tc = getTypeColor(p.type1)
            const isSelected = discardId === p.id
            return (
              <button
                key={p.id}
                onClick={() => setDiscardId(isSelected ? null : p.id)}
                className="flex flex-col border-2 border-ink rounded-2xl overflow-hidden bg-white text-left transition-all duration-100 cursor-pointer"
                style={isSelected
                  ? { borderColor: '#CC2200', boxShadow: '3px 3px 0 #CC2200', transform: 'translate(2px,2px)' }
                  : { boxShadow: '3px 3px 0 #2C1810' }
                }
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: tc }} />
                <div className="flex items-center gap-2 p-2">
                  <img src={getSpriteUrl(p.id)} alt={p.name}
                    style={{ width: 48, height: 48, objectFit: 'contain' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[10px] text-ink uppercase tracking-tight truncate">{p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-game text-[6px] text-ink/50">HP</span>
                      <span className="font-game text-[7px] font-black"
                        style={{ color: p.hearts <= 1 ? '#E82020' : p.hearts <= 2 ? '#F0C000' : '#2C1810' }}>
                        {p.hearts}/5
                      </span>
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="px-2 pb-2">
                    <span className="font-game text-[6px] uppercase tracking-widest" style={{ color: '#CC2200' }}>← Sai</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Confirmar */}
        <button
          onClick={handleConfirm}
          disabled={discardId === null}
          className="w-full py-4 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
          style={{
            backgroundColor: discardId !== null ? lColor : '#E8E0CC',
            color: discardId !== null ? lText : '#2C1810',
            boxShadow: discardId !== null ? '4px 4px 0 #2C1810' : 'none',
          }}
        >
          {discardId !== null
            ? `⚡ Confirmar — ${pendingLegendaryCard.name} entra no time →`
            : 'Selecione quem sai'}
        </button>

      </div>
    </main>
  )
}
