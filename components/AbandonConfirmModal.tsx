'use client'

import { getPixelSpriteUrl } from '@/lib/typeColors'
import { GYM_LEADERS } from '@/lib/data/gyms'
import type { PokemonCard } from '@/types'

const FLOOR_BADGE: Record<number, string> = {
  0: '🪨', 1: '💧', 2: '⚡', 3: '🌿', 4: '☠️', 5: '🔮', 6: '🔥', 7: '🌍',
  8: '❄️', 9: '👊', 10: '👻', 11: '🐉',
}

interface AbandonConfirmModalProps {
  currentFloor: number
  badgesEarned: number[]
  playerDeck: PokemonCard[]
  onConfirm: () => void
  onCancel: () => void
}

export function AbandonConfirmModal({
  currentFloor,
  badgesEarned,
  playerDeck,
  onConfirm,
  onCancel,
}: AbandonConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(44,24,16,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[640px] rounded-t-3xl border-t-4 border-x-4 border-ink p-5 pb-10 flex flex-col gap-5"
        style={{ backgroundColor: '#FBF5E6' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-ink/20 mx-auto" />

        {/* Warning */}
        <div className="text-center">
          <span className="text-4xl block mb-2">🏳️</span>
          <p className="font-black text-lg text-ink uppercase tracking-tight">Abandonar a run?</p>
          <p className="text-[11px] text-ink/50 leading-relaxed mt-1">
            Todo o progresso será perdido. Você verá o resumo antes de recomeçar.
          </p>
        </div>

        {/* Stats preview */}
        <div className="border-2 border-ink/10 rounded-2xl bg-white/60 px-4 py-3 flex flex-col gap-3">
          {/* Floor + badge count */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest mb-0.5">Andar</p>
              <p className="font-black text-xl text-ink">{currentFloor}<span className="text-sm text-ink/30">/12</span></p>
            </div>
            <div className="text-center">
              <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest mb-0.5">Insígnias</p>
              <p className="font-black text-xl text-ink">{badgesEarned.length}</p>
            </div>
            <div className="text-center">
              <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest mb-0.5">Pokémon</p>
              <p className="font-black text-xl text-ink">{playerDeck.length}</p>
            </div>
          </div>

          {/* Badges row */}
          {badgesEarned.length > 0 && (
            <div>
              <p className="font-game text-[6px] text-ink/35 uppercase tracking-widest mb-1.5">Insígnias conquistadas</p>
              <div className="flex gap-2 flex-wrap">
                {badgesEarned.map(gymId => {
                  const gym = GYM_LEADERS[gymId]
                  return (
                    <div key={gymId} className="flex flex-col items-center gap-0.5">
                      <span className="text-xl">{FLOOR_BADGE[gymId]}</span>
                      {gym?.badge && (
                        <span className="font-game text-[5px] text-ink/30 leading-none">{gym.badge.replace(' Badge', '')}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pokemon row */}
          {playerDeck.length > 0 && (
            <div>
              <p className="font-game text-[6px] text-ink/35 uppercase tracking-widest mb-1.5">Seus Pokémon</p>
              <div className="flex gap-1.5 flex-wrap">
                {playerDeck.map(p => (
                  <img
                    key={p.id}
                    src={getPixelSpriteUrl(p.id)}
                    alt={p.name}
                    style={{ width: 36, height: 36, imageRendering: 'pixelated', opacity: p.hearts <= 0 ? 0.3 : 1 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-4 font-black text-sm uppercase tracking-widest border-2 border-ink rounded-2xl text-white shadow-neo transition-all cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            style={{ backgroundColor: '#CC2200' }}
          >
            Ver resumo e abandonar
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/20 rounded-2xl text-ink/55 hover:text-ink/80 hover:border-ink/40 transition-all cursor-pointer"
          >
            Cancelar — continuar jogando
          </button>
        </div>
      </div>
    </div>
  )
}
