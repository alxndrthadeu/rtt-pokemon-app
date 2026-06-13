'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { HELD_ITEMS, CONSUMABLES } from '@/lib/data/items'
import { getItemSpriteUrl } from '@/lib/itemSprite'
import { getTypeColor, getSpriteUrl } from '@/lib/typeColors'
import type { HeldItemId, ConsumableId, PokemonCard } from '@/types'

type Tab = 'uso' | 'batalha'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ItemSprite({ id, size = 32 }: { id: HeldItemId | ConsumableId; size?: number }) {
  const [error, setError] = useState(false)
  if (error) return <span style={{ fontSize: size * 0.7 }}>🎁</span>
  return (
    <img
      src={getItemSpriteUrl(id)} alt={id} onError={() => setError(true)}
      style={{ width: size, height: size, imageRendering: 'pixelated', objectFit: 'contain' }}
    />
  )
}

// Mini Pokémon selector for equip/use
function PokemonSelector({
  playerDeck, title, disabledFn, onSelect, onCancel,
}: {
  playerDeck: PokemonCard[]
  title: string
  disabledFn: (p: PokemonCard) => boolean
  onSelect: (id: number) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ backgroundColor: 'rgba(44,24,16,0.70)' }}>
      <div className="bg-parchment border-t-4 border-x-4 border-ink rounded-t-3xl px-5 pt-4 pb-8 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="font-black text-base text-ink uppercase tracking-tight">{title}</p>
          <button onClick={onCancel}
            className="border-2 border-ink/20 rounded-full px-3 py-1 font-game text-[6px] text-ink/50 cursor-pointer">
            Cancelar
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {playerDeck.map(p => {
            const tc = getTypeColor(p.type1)
            const off = disabledFn(p)
            return (
              <button
                key={p.id}
                disabled={off}
                onClick={() => !off && onSelect(p.id)}
                className="flex flex-col items-center border-2 rounded-xl overflow-hidden transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  borderColor: off ? '#2C181020' : tc,
                  backgroundColor: off ? '#E8E0CC30' : `${tc}15`,
                }}
              >
                <div className="h-1 w-full" style={{ backgroundColor: tc }} />
                <img src={getSpriteUrl(p.id)} alt={p.name}
                  className={off ? 'grayscale' : ''}
                  style={{ width: 52, height: 52, objectFit: 'contain' }} />
                <div className="px-1 pb-2 text-center">
                  <p className="font-black text-[8px] text-ink uppercase truncate w-full">{p.name}</p>
                  {p.isFainted
                    ? <p className="font-game text-[7px] text-red-600">KO</p>
                    : (
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="text-[9px]" style={{ opacity: i < p.hearts ? 1 : 0.2 }}>♥</span>
                        ))}
                      </div>
                    )
                  }
                  {p.heldItem && (
                    <p className="font-game text-[5px] text-ink/40 truncate w-full mt-0.5">{p.heldItem.name}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MochilaPage() {
  const router = useRouter()
  const { inventory, heldItemBag, playerDeck, coins, useConsumable, equipHeldItem, unequipHeldItem } = useGameStore()
  const [tab, setTab] = useState<Tab>('uso')
  const [feedback, setFeedback] = useState<string | null>(null)

  // Consumable usage flow
  const [usingItem, setUsingItem] = useState<ConsumableId | null>(null)

  // Hold item equip flow
  const [equippingItem, setEquippingItem] = useState<HeldItemId | null>(null)

  function showFeedback(msg: string) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 2000)
  }

  function handleUseConsumable(itemId: ConsumableId, pokemonId: number) {
    const pokemon = playerDeck.find(p => p.id === pokemonId)
    if (!pokemon) return
    useConsumable(itemId, pokemonId)
    showFeedback(`${CONSUMABLES[itemId].name} usado em ${pokemon.name}!`)
    setUsingItem(null)
  }

  function handleEquip(itemId: HeldItemId, pokemonId: number) {
    const pokemon = playerDeck.find(p => p.id === pokemonId)
    equipHeldItem(pokemonId, itemId)
    showFeedback(`${HELD_ITEMS[itemId].name} equipado em ${pokemon?.name ?? ''}!`)
    setEquippingItem(null)
  }

  function handleUnequip(pokemonId: number) {
    const pokemon = playerDeck.find(p => p.id === pokemonId)
    if (pokemon?.heldItem) {
      unequipHeldItem(pokemonId)
      showFeedback(`${pokemon.heldItem.name} devolvido à mochila`)
    }
  }

  function getConsumableDisabled(itemId: ConsumableId, p: PokemonCard): boolean {
    const def = CONSUMABLES[itemId]
    if (def.effect === 'revive') return !p.isFainted
    if (def.effect === 'heal') return p.isFainted || p.hearts >= 5
    if (def.effect === 'status-cure') return p.isFainted
    if (def.effect === 'rare-candy') return p.rarity === 'lendaria'
    return false
  }

  return (
    <main className="min-h-screen bg-parchment dots">

      {/* Header */}
      <header className="border-b-4 border-ink px-5 py-4 bg-ink">
        <div className="max-w-[640px] mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="font-game text-[6px] text-white/40 uppercase tracking-widest mb-0.5">Inventário</p>
            <p className="font-black text-xl text-white uppercase tracking-tight leading-none">Mochila</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-full border-2 border-white/20 bg-white/10">
              <span className="font-black text-sm leading-none text-white/60">₽</span>
              <span className="font-black text-sm leading-none text-white">{coins}</span>
            </div>
            <button
              onClick={() => router.back()}
              className="border-2 border-white/20 rounded-full px-4 py-1.5 font-game text-[7px] text-white/70 hover:text-white hover:border-white/50 transition-all cursor-pointer"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b-2 border-ink/10 bg-parchment-light sticky top-0 z-10">
        <div className="max-w-[640px] mx-auto flex">
          {(['uso', 'batalha'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 font-game text-[8px] uppercase tracking-widest border-b-2 transition-all cursor-pointer"
              style={{
                borderColor: tab === t ? '#CC2200' : 'transparent',
                color: tab === t ? '#CC2200' : '#2C181055',
              }}
            >
              {t === 'uso' ? '🧪 Uso' : '⚔️ Batalha'}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-ink text-parchment-light font-game text-[8px] uppercase tracking-widest px-5 py-2 rounded-full border-2 border-parchment/20 shadow-neo whitespace-nowrap pointer-events-none">
          {feedback}
        </div>
      )}

      <div className="max-w-[640px] mx-auto px-5 py-6 flex flex-col gap-4 pb-32">

        {/* ── Tab: Uso ───────────────────────────────────────────────────────── */}
        {tab === 'uso' && (
          <>
            <p className="font-game text-[7px] text-ink/40 uppercase tracking-widest">
              Itens de cura podem ser usados fora de batalha
            </p>
            {inventory.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">🎒</p>
                <p className="font-black text-base text-ink uppercase tracking-tight">Mochila vazia</p>
                <p className="text-sm text-ink/50 mt-1 leading-relaxed">
                  Colete itens de cura após derrotar ginásios ou compre na loja.
                </p>
              </div>
            ) : (
              inventory.map(({ itemId, quantity }) => {
                const def = CONSUMABLES[itemId]
                if (!def) return null
                return (
                  <div key={itemId}
                    className="border-2 border-ink rounded-2xl overflow-hidden bg-white shadow-neo-sm flex items-center gap-3 p-3">
                    <ItemSprite id={itemId} size={38} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-[11px] text-ink uppercase tracking-tight">{def.name}</p>
                        <span className="font-black text-sm text-ink/50">×{quantity}</span>
                      </div>
                      <p className="text-[10px] text-ink/50 leading-tight">{def.description}</p>
                    </div>
                    <button
                      onClick={() => setUsingItem(usingItem === itemId ? null : itemId)}
                      className="shrink-0 px-3 py-2 font-game text-[7px] uppercase tracking-widest border-2 border-ink rounded-xl text-ink hover:bg-ink hover:text-parchment-light transition-all cursor-pointer"
                      style={{ boxShadow: '2px 2px 0 #2C1810' }}
                    >
                      Usar
                    </button>
                  </div>
                )
              })
            )}
          </>
        )}

        {/* ── Tab: Batalha ───────────────────────────────────────────────────── */}
        {tab === 'batalha' && (
          <>
            {/* Team with equipped items */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-ink opacity-10" />
                <span className="font-game text-[7px] text-ink/40 uppercase tracking-widest">
                  Seu time ({playerDeck.length})
                </span>
                <div className="h-px flex-1 bg-ink opacity-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {playerDeck.map(p => {
                  const tc = getTypeColor(p.type1)
                  const equipped = p.heldItem
                  return (
                    <div key={p.id}
                      className="border-2 border-ink rounded-2xl overflow-hidden bg-white shadow-neo-sm">
                      <div className="h-1.5 w-full" style={{ backgroundColor: tc }} />
                      <div className="p-2 flex items-center gap-2">
                        <img src={getSpriteUrl(p.id)} alt={p.name}
                          className={p.isFainted ? 'grayscale opacity-40' : ''}
                          style={{ width: 44, height: 44, objectFit: 'contain' }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[10px] text-ink uppercase truncate">{p.name}</p>
                          {equipped ? (
                            <div className="flex items-center gap-1 mt-0.5">
                              <ItemSprite id={equipped.id} size={14} />
                              <span className="text-[8px] text-ink/60 truncate">{equipped.name}</span>
                            </div>
                          ) : (
                            <p className="text-[8px] text-ink/25 mt-0.5 italic">Sem item equipado</p>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-ink/10 flex">
                        {equipped ? (
                          <button
                            onClick={() => handleUnequip(p.id)}
                            className="flex-1 py-1.5 font-game text-[6px] uppercase tracking-widest text-red-600/60 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            Retirar item
                          </button>
                        ) : (
                          <button
                            disabled={heldItemBag.length === 0}
                            onClick={() => {
                              if (heldItemBag.length === 0) return
                              // Pre-select this Pokémon: set equipping to first item, will show overlay
                              setEquippingItem('__CHOOSE_FOR__' + p.id as HeldItemId)
                            }}
                            className="flex-1 py-1.5 font-game text-[6px] uppercase tracking-widest text-ink/40 hover:text-ink/70 hover:bg-parchment-light transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                          >
                            + Equipar item
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Held items bag */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-ink opacity-10" />
                <span className="font-game text-[7px] text-ink/40 uppercase tracking-widest">
                  Itens na mochila ({heldItemBag.length})
                </span>
                <div className="h-px flex-1 bg-ink opacity-10" />
              </div>
              {heldItemBag.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-ink/15 rounded-2xl">
                  <p className="font-game text-[7px] text-ink/25 uppercase tracking-widest">Nenhum item de batalha</p>
                  <p className="text-xs text-ink/30 mt-1">Ganhe após derrotar ginásios ou compre na loja</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {heldItemBag.map((item, idx) => {
                    const def = HELD_ITEMS[item.id]
                    return (
                      <div key={`${item.id}-${idx}`}
                        className="border-2 border-ink rounded-xl bg-white p-3 flex items-center gap-3 shadow-neo-sm">
                        <ItemSprite id={item.id} size={34} />
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[10px] text-ink uppercase">{item.name}</p>
                          <p className="text-[9px] text-ink/50 leading-tight">{def?.description ?? ''}</p>
                        </div>
                        <button
                          onClick={() => setEquippingItem(item.id)}
                          className="shrink-0 px-3 py-1.5 font-game text-[6px] uppercase tracking-widest border-2 border-ink rounded-full text-ink bg-parchment-light hover:bg-ink hover:text-parchment-light transition-all cursor-pointer"
                          style={{ boxShadow: '2px 2px 0 #2C1810' }}
                        >
                          Equipar
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Overlay: use consumable — choose Pokémon ── */}
      {usingItem && (
        <PokemonSelector
          playerDeck={playerDeck}
          title={`Usar ${CONSUMABLES[usingItem]?.name ?? ''} em...`}
          disabledFn={p => getConsumableDisabled(usingItem, p)}
          onSelect={id => handleUseConsumable(usingItem, id)}
          onCancel={() => setUsingItem(null)}
        />
      )}

      {/* ── Overlay: equip held item — choose item then Pokémon ── */}
      {equippingItem && !equippingItem.startsWith('__CHOOSE_FOR__') && (
        <PokemonSelector
          playerDeck={playerDeck}
          title={`Equipar ${HELD_ITEMS[equippingItem]?.name ?? ''} em...`}
          disabledFn={() => false}
          onSelect={id => handleEquip(equippingItem, id)}
          onCancel={() => setEquippingItem(null)}
        />
      )}

      {/* ── Overlay: from team card — choose which item ── */}
      {equippingItem && equippingItem.startsWith('__CHOOSE_FOR__') && (() => {
        const targetId = parseInt(equippingItem.replace('__CHOOSE_FOR__', ''), 10)
        const targetPokemon = playerDeck.find(p => p.id === targetId)
        return (
          <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ backgroundColor: 'rgba(44,24,16,0.70)' }}>
            <div className="bg-parchment border-t-4 border-x-4 border-ink rounded-t-3xl px-5 pt-4 pb-8 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <p className="font-black text-base text-ink uppercase tracking-tight">
                  Equipar em {targetPokemon?.name ?? '?'}
                </p>
                <button onClick={() => setEquippingItem(null)}
                  className="border-2 border-ink/20 rounded-full px-3 py-1 font-game text-[6px] text-ink/50 cursor-pointer">
                  Cancelar
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {heldItemBag.map((item, idx) => {
                  const def = HELD_ITEMS[item.id]
                  return (
                    <button
                      key={`${item.id}-${idx}`}
                      onClick={() => handleEquip(item.id, targetId)}
                      className="flex items-center gap-3 border-2 border-ink rounded-xl bg-white p-3 text-left cursor-pointer hover:bg-parchment-light transition-colors"
                      style={{ boxShadow: '2px 2px 0 #2C1810' }}
                    >
                      <ItemSprite id={item.id} size={34} />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[10px] text-ink uppercase">{item.name}</p>
                        <p className="text-[9px] text-ink/50 leading-tight">{def?.description ?? ''}</p>
                      </div>
                      <span className="font-game text-[8px] text-ink/40">→</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}
    </main>
  )
}
