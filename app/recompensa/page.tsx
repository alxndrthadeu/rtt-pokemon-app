'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { GYM_LEADERS } from '@/lib/data/gyms'
import { getTypeColor, getTypeTextColor } from '@/lib/typeColors'
import {
  HELD_ITEMS, CONSUMABLES, getRewardTier, getHeldItemsForTier, getConsumablesForTier,
  type HeldItemDef, type ConsumableDef,
} from '@/lib/data/items'
import { getItemSpriteUrl } from '@/lib/itemSprite'
import type { HeldItemId, ConsumableId } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Reward option types
type RewardOption =
  | { kind: 'consumables'; items: { id: ConsumableId; qty: number }[] }
  | { kind: 'held-item';   itemId: HeldItemId }
  | { kind: 'coins';       amount: number }
  | { kind: 'rare-candy' }

function buildRewardOptions(floor: number): RewardOption[] {
  const tier = getRewardTier(floor)
  const heldPool  = shuffle(getHeldItemsForTier(tier))
  const consPool  = shuffle(getConsumablesForTier(tier).filter(id => id !== 'rare-candy' && id !== 'elixir'))

  // Option A — consumable package
  const getConsumableOption = (): RewardOption => {
    const picks = consPool.slice(0, tier <= 2 ? 2 : 3)
    return {
      kind: 'consumables',
      items: picks.map(id => ({ id, qty: id === 'potion' || id === 'super-potion' ? 2 : 1 })),
    }
  }

  // Option B — held item
  const getHeldOption = (): RewardOption => ({
    kind: 'held-item',
    itemId: heldPool[0] ?? 'leftovers',
  })

  // Option C — coins or special
  const getSpecialOption = (): RewardOption => {
    if (tier === 4) return { kind: 'rare-candy' }
    if (tier === 3) return Math.random() < 0.5 ? { kind: 'rare-candy' } : { kind: 'coins', amount: 8 }
    return { kind: 'coins', amount: tier === 2 ? 5 : 3 }
  }

  return [getConsumableOption(), getHeldOption(), getSpecialOption()]
}

// ─── Item sprite with fallback ────────────────────────────────────────────────
function ItemSprite({ id, size = 40 }: { id: HeldItemId | ConsumableId; size?: number }) {
  const [error, setError] = useState(false)
  if (error) return <span style={{ fontSize: size * 0.8 }}>🎁</span>
  return (
    <img
      src={getItemSpriteUrl(id)} alt={id}
      onError={() => setError(true)}
      style={{ width: size, height: size, imageRendering: 'pixelated', objectFit: 'contain' }}
    />
  )
}

// ─── Reward card ──────────────────────────────────────────────────────────────
function RewardCard({
  option, selected, gymColor, onSelect,
}: {
  option: RewardOption
  selected: boolean
  gymColor: string
  onSelect: () => void
}) {
  let title = ''
  let subtitle = ''
  let preview: React.ReactNode = null

  if (option.kind === 'consumables') {
    const defs = option.items.map(({ id, qty }) => ({ def: CONSUMABLES[id], qty }))
    title = 'Suprimentos'
    subtitle = defs.map(({ def, qty }) => qty > 1 ? `${def.name} ×${qty}` : def.name).join(' + ')
    preview = (
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {option.items.map(({ id, qty }) => (
          <div key={id} className="flex flex-col items-center gap-1">
            <ItemSprite id={id} size={36} />
            {qty > 1 && (
              <span className="font-game text-[7px] text-ink/60">×{qty}</span>
            )}
          </div>
        ))}
      </div>
    )
  } else if (option.kind === 'held-item') {
    const def = HELD_ITEMS[option.itemId]
    title = 'Item de Batalha'
    subtitle = def.name
    preview = (
      <div className="flex flex-col items-center gap-2">
        <ItemSprite id={option.itemId} size={44} />
        <p className="text-[10px] text-center text-ink/60 leading-tight max-w-[160px]">
          {def.description}
        </p>
      </div>
    )
  } else if (option.kind === 'coins') {
    title = 'Pokédollars'
    subtitle = `+${option.amount}₽`
    preview = (
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl">💰</span>
        <span className="font-black text-2xl text-ink">{option.amount}₽</span>
      </div>
    )
  } else {
    title = 'Rara Bala'
    subtitle = 'Sobe raridade de um Pokémon'
    preview = (
      <div className="flex flex-col items-center gap-2">
        <ItemSprite id="rare-candy" size={44} />
        <p className="text-[10px] text-center text-ink/60 leading-tight max-w-[160px]">
          Aumenta a raridade de um Pokémon em 1 tier.
        </p>
      </div>
    )
  }

  return (
    <button
      onClick={onSelect}
      className="flex flex-col gap-3 border-2 rounded-2xl p-4 text-left w-full transition-all duration-100 cursor-pointer bg-white"
      style={selected
        ? { borderColor: gymColor, boxShadow: `4px 4px 0 ${gymColor}`, transform: 'translate(-2px,-2px)' }
        : { borderColor: '#2C181030', boxShadow: '3px 3px 0 #2C181018' }
      }
    >
      <div className="flex items-center justify-between">
        <span
          className="font-game text-[7px] px-2 py-1 rounded-full border uppercase tracking-widest"
          style={selected
            ? { borderColor: gymColor, color: gymColor, backgroundColor: `${gymColor}18` }
            : { borderColor: '#2C181030', color: '#2C181060', backgroundColor: '#F5EDD820' }
          }
        >
          {title}
        </span>
        {selected && (
          <span className="font-game text-[8px]" style={{ color: gymColor }}>✓ Selecionado</span>
        )}
      </div>
      <div className="flex items-center justify-center min-h-[80px]">
        {preview}
      </div>
      <p className="font-black text-[11px] text-ink text-center uppercase tracking-tight">
        {subtitle}
      </p>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RecompensaPage() {
  const router = useRouter()
  const { currentFloor, mode, coins, addConsumable, addHeldItemToBag, addCoins } = useGameStore()
  const [options, setOptions] = useState<RewardOption[]>([])
  const [selected, setSelected] = useState<number | null>(null)

  const prevFloor = currentFloor - 1
  const gym = GYM_LEADERS[prevFloor]
  const gymColor = gym ? getTypeColor(gym.specialtyType) : '#CC2200'
  const gymTextColor = gym ? getTypeTextColor(gym.specialtyType) : 'white'
  const coinsEarned = mode === 'hard' ? 4 : 3

  useEffect(() => {
    if (currentFloor === 0) { router.replace('/'); return }
    setOptions(buildRewardOptions(prevFloor))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClaim() {
    if (selected === null) return
    const option = options[selected]

    if (option.kind === 'consumables') {
      option.items.forEach(({ id, qty }) => addConsumable(id, qty))
    } else if (option.kind === 'held-item') {
      addHeldItemToBag(option.itemId)
    } else if (option.kind === 'coins') {
      addCoins(option.amount)
    } else if (option.kind === 'rare-candy') {
      addConsumable('rare-candy', 1)
    }

    router.push('/pos-batalha')
  }

  if (options.length === 0) {
    return (
      <main className="min-h-screen bg-parchment dots flex items-center justify-center">
        <p className="font-game text-[8px] text-ink-soft uppercase tracking-widest animate-pulse">
          Gerando recompensas…
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-parchment dots">

      {/* Header */}
      <header className="border-b-4 border-ink px-5 py-4" style={{ backgroundColor: gymColor }}>
        <div className="max-w-[640px] mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-game text-[6px] uppercase tracking-widest mb-0.5" style={{ color: `${gymTextColor}80` }}>
                {gym ? `${gym.name} derrotado!` : 'Vitória!'}
              </p>
              <p className="font-black text-xl uppercase tracking-tight leading-none" style={{ color: gymTextColor }}>
                Escolha sua recompensa
              </p>
              <p className="text-sm mt-0.5" style={{ color: `${gymTextColor}90` }}>
                Escolha 1 de 3 opções
              </p>
            </div>
            {/* Coins earned badge */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border-2"
                style={{ borderColor: `${gymTextColor}35`, backgroundColor: 'rgba(0,0,0,0.18)' }}>
                <span className="font-black text-sm leading-none" style={{ color: `${gymTextColor}80` }}>₽</span>
                <span className="font-black text-sm leading-none" style={{ color: gymTextColor }}>+{coinsEarned}</span>
              </div>
              <p className="font-game text-[6px] uppercase tracking-wide text-right leading-none" style={{ color: `${gymTextColor}60` }}>
                por vencer · saldo: ₽{coins}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-5 py-6 flex flex-col gap-4 pb-32">

        {options.map((opt, i) => (
          <RewardCard
            key={i}
            option={opt}
            selected={selected === i}
            gymColor={gymColor}
            onSelect={() => setSelected(i)}
          />
        ))}

        <button
          onClick={handleClaim}
          disabled={selected === null}
          className="w-full py-4 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl text-parchment-light transition-all duration-100 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer mt-2"
          style={{
            backgroundColor: selected !== null ? gymColor : '#E8E0CC',
            color: selected !== null ? gymTextColor : '#2C1810',
            boxShadow: selected !== null ? '4px 4px 0 #2C1810' : 'none',
          }}
        >
          {selected !== null ? 'Pegar recompensa →' : 'Selecione uma opção'}
        </button>

      </div>
    </main>
  )
}
