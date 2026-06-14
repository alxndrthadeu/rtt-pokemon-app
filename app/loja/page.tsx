'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import {
  HELD_ITEMS, CONSUMABLES,
  getHeldItemsForTier, getConsumablesForTier, getRewardTier,
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

type ShopEntry =
  | { kind: 'held'; id: HeldItemId; def: HeldItemDef }
  | { kind: 'consumable'; id: ConsumableId; def: ConsumableDef; qty: number }

function buildShopStock(floor: number): ShopEntry[] {
  const tier = getRewardTier(floor)
  const heldPool = shuffle(getHeldItemsForTier(tier)).slice(0, 3)
  const consPool = shuffle(getConsumablesForTier(tier).filter(id => id !== 'rare-candy' && id !== 'ether' && id !== 'elixir')).slice(0, 2)

  const entries: ShopEntry[] = [
    ...heldPool.map(id => ({ kind: 'held' as const, id, def: HELD_ITEMS[id] })),
    ...consPool.map(id => ({
      kind: 'consumable' as const, id,
      def: CONSUMABLES[id],
      qty: id === 'potion' || id === 'super-potion' ? 3 : 1,
    })),
  ]
  return entries
}

function getConsumableShopPrice(def: ConsumableDef): number {
  // rough prices proportional to effect
  if (def.effect === 'revive') return def.healAmount && def.healAmount >= 5 ? 8 : 4
  if (def.effect === 'heal') {
    const h = def.healAmount ?? 1
    if (h >= 5) return 7
    if (h >= 3) return 5
    if (h >= 2) return 3
    return 2
  }
  if (def.effect === 'status-cure') return def.curesAll ? 4 : 2
  return 3
}

function ItemSprite({ id, size = 40 }: { id: HeldItemId | ConsumableId; size?: number }) {
  const [error, setError] = useState(false)
  if (error) return <span style={{ fontSize: size * 0.8 }}>🎁</span>
  return (
    <img
      src={getItemSpriteUrl(id)} alt={id} onError={() => setError(true)}
      style={{ width: size, height: size, imageRendering: 'pixelated', objectFit: 'contain' }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LojaPage() {
  const router = useRouter()
  const { coins, currentFloor, spendCoins, addConsumable, addHeldItemToBag, markShopVisited } = useGameStore()
  const [stock, setStock] = useState<ShopEntry[]>([])
  const [bought, setBought] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setStock(buildShopStock(Math.max(0, currentFloor - 1)))
    markShopVisited(currentFloor)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function showFeedback(msg: string) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 2000)
  }

  function handleBuy(entry: ShopEntry, key: string, price: number) {
    if (!spendCoins(price)) {
      showFeedback('Pokédollars insuficientes!'); return
    }
    if (entry.kind === 'held') {
      addHeldItemToBag(entry.id)
    } else {
      addConsumable(entry.id, entry.qty)
    }
    setBought(prev => new Set(prev).add(key))
    showFeedback('Comprado!')
  }

  if (stock.length === 0) {
    return (
      <main className="min-h-screen bg-parchment dots flex items-center justify-center">
        <p className="font-game text-[8px] text-ink-soft uppercase tracking-widest animate-pulse">
          Carregando loja...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-parchment dots">

      {/* Header */}
      <header className="border-b-4 border-ink px-5 py-4" style={{ backgroundColor: '#2C7BB5' }}>
        <div className="max-w-[640px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-game text-[8px] text-white/50 uppercase tracking-widest mb-0.5">Pokémon Mart</p>
              <p className="font-black text-xl text-white uppercase tracking-tight leading-none">Loja</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border-2 border-white/20 rounded-2xl px-3 py-1.5 bg-white/10">
                <span className="font-black text-lg text-white/60">₽</span>
                <span className="font-black text-lg text-white">{coins}</span>
              </div>
              <button
                onClick={() => router.push('/entre-andares')}
                className="border-2 border-white/20 rounded-full px-4 py-1.5 font-game text-[7px] text-white/70 hover:text-white hover:border-white/50 transition-all cursor-pointer"
              >
                Sair →
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Feedback toast */}
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-ink text-parchment-light font-game text-[8px] uppercase tracking-widest px-5 py-2 rounded-full border-2 border-parchment/20 shadow-neo whitespace-nowrap pointer-events-none">
          {feedback}
        </div>
      )}

      <div className="max-w-[640px] mx-auto px-5 py-6 flex flex-col gap-4 pb-32">

        <p className="font-game text-[7px] text-ink/40 uppercase tracking-widest">
          Itens disponíveis — Andar {currentFloor}
        </p>

        {/* Held items */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-ink opacity-10" />
            <span className="font-game text-[7px] text-ink/40 uppercase tracking-widest">Itens de batalha</span>
            <div className="h-px flex-1 bg-ink opacity-10" />
          </div>
          <div className="flex flex-col gap-3">
            {stock.filter(e => e.kind === 'held').map((entry, i) => {
              if (entry.kind !== 'held') return null
              const price = entry.def.shopPrice
              const key = `held-${entry.id}`
              const wasBought = bought.has(key)
              const canAfford = coins >= price
              return (
                <div key={key}
                  className="border-2 border-ink rounded-2xl overflow-hidden bg-white shadow-neo-sm flex items-center gap-3 p-3"
                  style={wasBought ? { opacity: 0.5 } : {}}>
                  <ItemSprite id={entry.id} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[11px] text-ink uppercase tracking-tight">{entry.def.name}</p>
                    <p className="text-[10px] text-ink/50 leading-tight">{entry.def.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-black text-base text-ink">{price}₽</span>
                    <button
                      disabled={wasBought || !canAfford}
                      onClick={() => !wasBought && handleBuy(entry, key, price)}
                      className="px-3 py-1.5 font-game text-[8px] uppercase tracking-widest border-2 border-ink rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: wasBought ? '#E8E0CC' : canAfford ? '#2C7BB5' : '#E8E0CC',
                        color: wasBought || !canAfford ? '#2C181060' : 'white',
                        boxShadow: wasBought || !canAfford ? 'none' : '2px 2px 0 #2C1810',
                      }}
                    >
                      {wasBought ? 'Comprado' : 'Comprar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Consumables */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-ink opacity-10" />
            <span className="font-game text-[7px] text-ink/40 uppercase tracking-widest">Suprimentos</span>
            <div className="h-px flex-1 bg-ink opacity-10" />
          </div>
          <div className="flex flex-col gap-3">
            {stock.filter(e => e.kind === 'consumable').map((entry, i) => {
              if (entry.kind !== 'consumable') return null
              const price = getConsumableShopPrice(entry.def)
              const key = `cons-${entry.id}-${i}`
              const wasBought = bought.has(key)
              const canAfford = coins >= price
              return (
                <div key={key}
                  className="border-2 border-ink rounded-2xl overflow-hidden bg-white shadow-neo-sm flex items-center gap-3 p-3"
                  style={wasBought ? { opacity: 0.5 } : {}}>
                  <ItemSprite id={entry.id} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-[11px] text-ink uppercase tracking-tight">{entry.def.name}</p>
                      {entry.qty > 1 && (
                        <span className="font-game text-[7px] text-ink/40">×{entry.qty}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-ink/50 leading-tight">{entry.def.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-black text-base text-ink">{price}₽</span>
                    <button
                      disabled={wasBought || !canAfford}
                      onClick={() => !wasBought && handleBuy(entry, key, price)}
                      className="px-3 py-1.5 font-game text-[8px] uppercase tracking-widest border-2 border-ink rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: wasBought ? '#E8E0CC' : canAfford ? '#2C7BB5' : '#E8E0CC',
                        color: wasBought || !canAfford ? '#2C181060' : 'white',
                        boxShadow: wasBought || !canAfford ? 'none' : '2px 2px 0 #2C1810',
                      }}
                    >
                      {wasBought ? 'Comprado' : 'Comprar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => router.push('/entre-andares')}
          className="w-full py-4 font-black text-base tracking-[0.15em] uppercase border-2 border-ink rounded-2xl text-parchment-light shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer mt-2"
          style={{ backgroundColor: '#2C7BB5' }}
        >
          Ir para o próximo andar →
        </button>

      </div>
    </main>
  )
}
