'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PokemonCard, BattleState, GameMode, Gender, RPS, HeldItem, InventoryItem, ConsumableId, HeldItemId, Rarity } from '@/types'
import { apiRequest, isApiConfigured } from '@/lib/api'
import { CONSUMABLES, RARITY_UPGRADE } from '@/lib/data/items'
import { HELD_ITEMS } from '@/lib/data/items'

function generateSessionId(): string {
  return crypto.randomUUID()
}

// Floors where shop is available (currentFloor value after winning that gym)
export const SHOP_FLOORS = [3, 6, 9] as const

interface GameStore {
  // Sessão anônima (UUID persistido no localStorage)
  sessionId: string

  // Configuração da run
  runId: string | null
  mode: GameMode | null
  gender: Gender | null
  playerName: string

  // Progressão
  currentFloor: number
  badgesEarned: number[]
  deathCount: number

  // Deck
  playerDeck: PokemonCard[]
  rerollUsed: boolean

  // Batalha
  battle: BattleState | null

  // Pokédex persistente (cross-run)
  pokedexSeen: number[]

  // Erro de API — visível para o usuário
  apiError: string | null

  // ── Sistema de itens ──────────────────────────────────────────────────────────
  coins: number
  inventory: InventoryItem[]          // consumíveis (pilha com quantidade)
  heldItemBag: HeldItem[]             // hold items no inventário (não equipados)
  shopVisitedFloors: number[]         // andares onde a loja já foi visitada

  // Actions — Setup
  setMode: (mode: GameMode) => void
  setGender: (gender: Gender) => void
  setPlayerName: (name: string) => void
  clearApiError: () => void

  // Actions — Draft
  addToDeck: (card: PokemonCard) => void
  useReroll: () => void

  // Actions — Batalha
  startBattle: (gymId: number, enemyDeck: PokemonCard[], playerSelected: PokemonCard[], playerOrder: number[]) => void
  submitAction: (action: RPS) => void
  useSwitch: () => void
  endBattle: (result: 'win' | 'lose') => void
  applyPostGymSwap: (newCard: PokemonCard, discardId: number) => void
  incrementDeathCount: () => void

  // Actions — Pokédex
  addPokedexEntry: (ids: number[]) => void

  // Actions — Itens (economia)
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean   // retorna false se saldo insuficiente
  addConsumable: (itemId: ConsumableId, quantity?: number) => void
  removeConsumable: (itemId: ConsumableId, quantity?: number) => void
  addHeldItemToBag: (itemId: HeldItemId) => void
  removeHeldItemFromBag: (itemId: HeldItemId) => void

  // Actions — Equipar hold items
  equipHeldItem: (pokemonId: number, itemId: HeldItemId) => void
  unequipHeldItem: (pokemonId: number) => void

  // Actions — Usar consumíveis (entre andares / mochila)
  useConsumable: (itemId: ConsumableId, pokemonId: number) => void

  // Actions — Loja
  markShopVisited: (floor: number) => void

  // Actions — Persistência
  createRun: () => Promise<void>
  syncRun: () => void
  resetRun: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      sessionId: generateSessionId(),
      runId: null,
      mode: null,
      gender: null,
      playerName: '',
      currentFloor: 0,
      badgesEarned: [],
      deathCount: 0,
      playerDeck: [],
      rerollUsed: false,
      battle: null,
      pokedexSeen: [],
      apiError: null,
      coins: 0,
      inventory: [],
      heldItemBag: [],
      shopVisitedFloors: [],

      setMode: (mode) => set({ mode }),
      setGender: (gender) => set({ gender }),
      setPlayerName: (name) => set({ playerName: name.trim().slice(0, 20) }),
      clearApiError: () => set({ apiError: null }),

      addToDeck: (card) =>
        set((s) => ({
          playerDeck: [...s.playerDeck, card],
          pokedexSeen: s.pokedexSeen.includes(card.id)
            ? s.pokedexSeen
            : [...s.pokedexSeen, card.id],
        })),

      useReroll: () => set({ rerollUsed: true }),

      incrementDeathCount: () => set((s) => ({ deathCount: s.deathCount + 1 })),

      addPokedexEntry: (ids) =>
        set((s) => ({
          pokedexSeen: Array.from(new Set([...s.pokedexSeen, ...ids])),
        })),

      startBattle: (gymId, enemyDeck, playerSelected, playerOrder) => {
        const ordered = playerOrder.map((i) => playerSelected[i])
        set({
          battle: {
            gymId,
            playerSelected,
            playerOrder,
            enemyDeck,
            playerActive: ordered[0],
            enemyActive: enemyDeck[0],
            playerBench: ordered.slice(1),
            enemyBench: enemyDeck.slice(1),
            playerSwitchUsed: false,
            turn: 1,
            phase: 'select_action',
            pendingAction: null,
            pendingEnemyAction: null,
            lastTurnResult: null,
            statusEffects: [],
          },
        })
      },

      submitAction: (action) =>
        set((s) => ({
          battle: s.battle ? { ...s.battle, pendingAction: action } : null,
        })),

      useSwitch: () =>
        set((s) => ({
          battle: s.battle
            ? { ...s.battle, playerSwitchUsed: true, phase: 'switch_risk' }
            : null,
        })),

      endBattle: (result) => {
        const state = get()
        if (result === 'win') {
          const nextFloor = state.currentFloor + 1
          const isWon = nextFloor >= 12

          // Normal mode: fainted revives with 2♥, alive gets +2♥ (cap 5)
          // Hard mode: no healing
          set((s) => ({
            currentFloor: nextFloor,
            badgesEarned: s.battle
              ? [...s.badgesEarned, s.battle.gymId]
              : s.badgesEarned,
            battle: null,
            coins: s.coins + (s.mode === 'hard' ? 6 : 3),
            playerDeck:
              s.mode === 'normal'
                ? s.playerDeck.map((p) => ({
                    ...p,
                    isFainted: false,
                    hearts: p.isFainted ? 2 : Math.min(p.hearts + 2, 5),
                  }))
                : s.playerDeck,
          }))

          if (isApiConfigured() && state.runId) {
            apiRequest(`/runs/${state.runId}?session_id=${state.sessionId}`, {
              method: 'PATCH',
              body: JSON.stringify({
                current_floor: nextFloor,
                player_deck: get().playerDeck,
                badges_earned: get().badgesEarned,
                status: isWon ? 'won' : 'active',
              }),
            }).catch((e: unknown) => {
              const msg = e instanceof Error ? e.message : 'Erro ao salvar progresso'
              set({ apiError: msg })
            })
          }
        } else {
          set({ battle: null })
          if (isApiConfigured() && state.runId) {
            apiRequest(`/runs/${state.runId}?session_id=${state.sessionId}`, {
              method: 'PATCH',
              body: JSON.stringify({ status: 'lost' }),
            }).catch((e: unknown) => {
              const msg = e instanceof Error ? e.message : 'Erro ao salvar resultado'
              set({ apiError: msg })
            })
          }
        }
      },

      applyPostGymSwap: (newCard, discardId) =>
        set((s) => ({
          playerDeck: s.playerDeck.map((p) => (p.id === discardId ? newCard : p)),
        })),

      // ── Item economy ────────────────────────────────────────────────────────

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

      spendCoins: (amount) => {
        const s = get()
        if (s.coins < amount) return false
        set({ coins: s.coins - amount })
        return true
      },

      addConsumable: (itemId, quantity = 1) =>
        set((s) => {
          const existing = s.inventory.find((i) => i.itemId === itemId)
          if (existing) {
            return {
              inventory: s.inventory.map((i) =>
                i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            }
          }
          return { inventory: [...s.inventory, { itemId, quantity }] }
        }),

      removeConsumable: (itemId, quantity = 1) =>
        set((s) => {
          const existing = s.inventory.find((i) => i.itemId === itemId)
          if (!existing) return {}
          const newQty = existing.quantity - quantity
          if (newQty <= 0) {
            return { inventory: s.inventory.filter((i) => i.itemId !== itemId) }
          }
          return {
            inventory: s.inventory.map((i) =>
              i.itemId === itemId ? { ...i, quantity: newQty } : i
            ),
          }
        }),

      addHeldItemToBag: (itemId) =>
        set((s) => {
          const def = HELD_ITEMS[itemId]
          if (!def) return {}
          return { heldItemBag: [...s.heldItemBag, { id: def.id, name: def.name, description: def.description }] }
        }),

      removeHeldItemFromBag: (itemId) =>
        set((s) => {
          const idx = s.heldItemBag.findIndex((i) => i.id === itemId)
          if (idx === -1) return {}
          return {
            heldItemBag: [...s.heldItemBag.slice(0, idx), ...s.heldItemBag.slice(idx + 1)],
          }
        }),

      // ── Equip / Unequip ─────────────────────────────────────────────────────

      equipHeldItem: (pokemonId, itemId) =>
        set((s) => {
          const def = HELD_ITEMS[itemId]
          if (!def) return {}
          const item: HeldItem = { id: def.id, name: def.name, description: def.description }
          // Remove from bag
          const bagIdx = s.heldItemBag.findIndex((i) => i.id === itemId)
          if (bagIdx === -1) return {}
          const newBag = [...s.heldItemBag.slice(0, bagIdx), ...s.heldItemBag.slice(bagIdx + 1)]
          // If pokemon already has an item, return it to bag
          const target = s.playerDeck.find((p) => p.id === pokemonId)
          const returnedItem = target?.heldItem ? [target.heldItem] : []
          return {
            heldItemBag: [...newBag, ...returnedItem],
            playerDeck: s.playerDeck.map((p) =>
              p.id === pokemonId ? { ...p, heldItem: item } : p
            ),
          }
        }),

      unequipHeldItem: (pokemonId) =>
        set((s) => {
          const target = s.playerDeck.find((p) => p.id === pokemonId)
          if (!target?.heldItem) return {}
          return {
            heldItemBag: [...s.heldItemBag, target.heldItem],
            playerDeck: s.playerDeck.map((p) =>
              p.id === pokemonId ? { ...p, heldItem: null } : p
            ),
          }
        }),

      // ── Use consumables ─────────────────────────────────────────────────────

      useConsumable: (itemId, pokemonId) =>
        set((s) => {
          const item = s.inventory.find((i) => i.itemId === itemId)
          if (!item || item.quantity <= 0) return {}
          const def = CONSUMABLES[itemId]
          if (!def) return {}

          const newInventory = item.quantity <= 1
            ? s.inventory.filter((i) => i.itemId !== itemId)
            : s.inventory.map((i) => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i)

          const newDeck = s.playerDeck.map((p) => {
            if (p.id !== pokemonId) return p
            switch (def.effect) {
              case 'heal':
                if (p.isFainted) return p  // use revive for fainted
                return { ...p, hearts: Math.min(5, p.hearts + (def.healAmount ?? 1)) }
              case 'status-cure':
                return { ...p, statusEffects: def.curesAll ? [] : p.statusEffects.filter((se) => {
                  if (itemId === 'antidote')  return se.type !== 'poison'
                  if (itemId === 'burn-heal') return se.type !== 'burn'
                  return false
                })}
              case 'revive':
                if (!p.isFainted) return p
                return { ...p, isFainted: false, hearts: def.healAmount ?? 2 }
              case 'rare-candy': {
                const nextRarity = RARITY_UPGRADE[p.rarity] as Rarity | undefined
                return nextRarity ? { ...p, rarity: nextRarity } : p
              }
              default:
                return p
            }
          })

          return { inventory: newInventory, playerDeck: newDeck }
        }),

      // ── Shop ────────────────────────────────────────────────────────────────

      markShopVisited: (floor) =>
        set((s) => ({
          shopVisitedFloors: s.shopVisitedFloors.includes(floor)
            ? s.shopVisitedFloors
            : [...s.shopVisitedFloors, floor],
        })),

      // ── API persistence ─────────────────────────────────────────────────────

      createRun: async () => {
        if (!isApiConfigured()) return
        const s = get()
        try {
          const run = await apiRequest<{ id: string }>('/runs', {
            method: 'POST',
            body: JSON.stringify({
              session_id: s.sessionId,
              mode: s.mode,
              gender: s.gender,
              player_deck: s.playerDeck,
            }),
          })
          set({ runId: run.id })
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Erro ao iniciar run'
          set({ apiError: msg })
        }
      },

      syncRun: () => {
        const s = get()
        if (!isApiConfigured() || !s.runId) return
        apiRequest(`/runs/${s.runId}?session_id=${s.sessionId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            current_floor: s.currentFloor,
            player_deck: s.playerDeck,
            badges_earned: s.badgesEarned,
          }),
        }).catch((e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Erro ao sincronizar run'
          set({ apiError: msg })
        })
      },

      resetRun: () =>
        set((s) => ({
          runId: null,
          mode: null,
          gender: null,
          playerName: '',
          currentFloor: 0,
          badgesEarned: [],
          deathCount: 0,
          playerDeck: [],
          rerollUsed: false,
          battle: null,
          coins: 0,
          inventory: [],
          heldItemBag: [],
          shopVisitedFloors: [],
          pokedexSeen: s.pokedexSeen, // preserved across runs
        })),
    }),
    {
      name: 'ptt-game-state',
      partialize: (s) => ({
        sessionId: s.sessionId,
        runId: s.runId,
        mode: s.mode,
        gender: s.gender,
        currentFloor: s.currentFloor,
        badgesEarned: s.badgesEarned,
        deathCount: s.deathCount,
        playerDeck: s.playerDeck,
        rerollUsed: s.rerollUsed,
        pokedexSeen: s.pokedexSeen,
        coins: s.coins,
        inventory: s.inventory,
        heldItemBag: s.heldItemBag,
        shopVisitedFloors: s.shopVisitedFloors,
      }),
    },
  ),
)
