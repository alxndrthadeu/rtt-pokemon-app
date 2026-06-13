'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PokemonCard, BattleState, GameMode, Gender, RPS, HeldItem, InventoryItem, ConsumableId, HeldItemId, RunSummary, RunEndReason } from '@/types'
import { apiRequest, isApiConfigured } from '@/lib/api'
import { CONSUMABLES } from '@/lib/data/items'
import { HELD_ITEMS } from '@/lib/data/items'
import { EVOLUTION_MAP, ASH_PIKACHU_ID, LEGENDARY_IDS_SET, makePokemonCard } from '@/lib/data/pokemon'
import type { SpecialBattleConfig } from '@/lib/data/events'

function generateSessionId(): string {
  return crypto.randomUUID()
}

// Floors where shop is available (currentFloor value after winning that gym)
export const SHOP_FLOORS = [3, 6, 9] as const
export const HEAL_COST = 7

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

  // Batalha especial (lendário / Rocket)
  specialBattle: SpecialBattleConfig | null
  legendaryEventUsed: boolean
  pendingLegendaryCard: PokemonCard | null

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
  clearBattle: () => void
  syncDeckAfterBattle: (fighters: { id: number; hearts: number; isFainted: boolean }[]) => void
  applyPostGymSwap: (newCard: PokemonCard, discardId: number) => void
  incrementDeathCount: () => void

  // Actions — Batalha especial
  setSpecialBattle: (battle: SpecialBattleConfig | null) => void
  markLegendaryEventUsed: () => void
  setPendingLegendaryCard: (card: PokemonCard | null) => void
  recruitLegendary: (discardId: number) => void

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

  // Actions — Centro Pokémon
  healAtCenter: () => void   // cura todos por HEAL_COST moedas

  // Actions — Loja
  markShopVisited: (floor: number) => void

  // Starter tracking (set on draft round 1 pick)
  starterId: number | null
  setStarterId: (id: number) => void
  evolvePokemon: (pokemonId: number) => void

  // Actions — Histórico de runs
  runEndReason: RunEndReason | null
  runSaved: boolean
  runHistory: RunSummary[]
  setRunEndReason: (reason: RunEndReason) => void
  saveRunToHistory: () => void

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
      specialBattle: null,
      legendaryEventUsed: false,
      pendingLegendaryCard: null,
      pokedexSeen: [],
      apiError: null,
      coins: 0,
      inventory: [],
      heldItemBag: [],
      shopVisitedFloors: [],
      starterId: null,
      runEndReason: null,
      runSaved: false,
      runHistory: [],

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

      clearBattle: () => set({ battle: null }),

      setSpecialBattle: (battle) => set({ specialBattle: battle }),

      markLegendaryEventUsed: () => set({ legendaryEventUsed: true }),

      setPendingLegendaryCard: (card) => set({ pendingLegendaryCard: card }),

      recruitLegendary: (discardId) =>
        set((s) => {
          if (!s.pendingLegendaryCard) return {}
          return {
            playerDeck: s.playerDeck.map((p) =>
              p.id === discardId ? s.pendingLegendaryCard! : p
            ),
            pendingLegendaryCard: null,
          }
        }),

      syncDeckAfterBattle: (fighters) => {
        const byId = new Map(fighters.map(f => [f.id, f]))
        set((s) => ({
          playerDeck: s.playerDeck.map((p) => {
            const f = byId.get(p.id)
            if (!f) return p
            return { ...p, hearts: f.hearts, isFainted: f.isFainted }
          }),
        }))
      },

      endBattle: (result) => {
        const state = get()
        if (result === 'win') {
          const nextFloor = state.currentFloor + 1
          const isWon = nextFloor >= 12

          set((s) => ({
            currentFloor: nextFloor,
            badgesEarned: s.battle
              ? [...s.badgesEarned, s.battle.gymId]
              : s.badgesEarned,
            battle: null,
            coins: s.coins + (s.mode === 'hard' ? 4 : 3),
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
                if (p.id === ASH_PIKACHU_ID || LEGENDARY_IDS_SET.has(p.id)) return p
                const EEVEE_EVOS = [134, 135, 136]
                const evolvedId = p.id === 133
                  ? EEVEE_EVOS[Math.floor(Math.random() * EEVEE_EVOS.length)]
                  : EVOLUTION_MAP[p.id]
                if (!evolvedId) return p
                const evolved = makePokemonCard(evolvedId)
                if (!evolved) return p
                return { ...evolved, hearts: p.hearts, isFainted: p.isFainted, statusEffects: p.statusEffects, heldItem: p.heldItem, rarity: p.rarity, isShiny: p.isShiny }
              }
              default:
                return p
            }
          })

          return { inventory: newInventory, playerDeck: newDeck }
        }),

      // ── Centro Pokémon ──────────────────────────────────────────────────────

      healAtCenter: () =>
        set((s) => {
          if (s.coins < HEAL_COST) return s
          return {
            coins: s.coins - HEAL_COST,
            playerDeck: s.playerDeck.map((p) => ({
              ...p,
              hearts: 5,
              isFainted: false,
              statusEffects: [],
            })),
          }
        }),

      // ── Shop ────────────────────────────────────────────────────────────────

      markShopVisited: (floor) =>
        set((s) => ({
          shopVisitedFloors: s.shopVisitedFloors.includes(floor)
            ? s.shopVisitedFloors
            : [...s.shopVisitedFloors, floor],
        })),

      // ── Run history ─────────────────────────────────────────────────────────

      setStarterId: (id) => set({ starterId: id }),

      evolvePokemon: (pokemonId) =>
        set((s) => ({
          playerDeck: s.playerDeck.map((p) => {
            if (p.id !== pokemonId) return p
            if (p.id === ASH_PIKACHU_ID || LEGENDARY_IDS_SET.has(p.id)) return p
            const evolvedId = EVOLUTION_MAP[p.id]
            if (!evolvedId) return p
            const evolved = makePokemonCard(evolvedId)
            if (!evolved) return p
            return { ...evolved, hearts: p.hearts, isFainted: p.isFainted, statusEffects: p.statusEffects, heldItem: p.heldItem, rarity: p.rarity, isShiny: p.isShiny }
          }),
        })),

      setRunEndReason: (reason) => set({ runEndReason: reason }),

      saveRunToHistory: () => {
        const s = get()
        if (s.runSaved || !s.mode || !s.gender) return
        const summary: RunSummary = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          playerName: s.playerName,
          mode: s.mode,
          gender: s.gender,
          result: s.runEndReason ?? 'abandoned',
          floorsCompleted: s.currentFloor,
          badgesEarned: [...s.badgesEarned],
          deathCount: s.deathCount,
          coins: s.coins,
          teamSnapshot: s.playerDeck.map((p) => ({
            id: p.id,
            name: p.name,
            type1: p.type1,
            hearts: p.hearts,
            isFainted: p.isFainted,
          })),
        }
        set((state) => ({
          runHistory: [summary, ...state.runHistory].slice(0, 50),
          runSaved: true,
        }))
      },

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
          starterId: null,
          runEndReason: null,
          runSaved: false,
          specialBattle: null,
          legendaryEventUsed: false,
          pendingLegendaryCard: null,
          pokedexSeen: s.pokedexSeen,
          runHistory: s.runHistory,
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
        starterId: s.starterId,
        legendaryEventUsed: s.legendaryEventUsed,
        runHistory: s.runHistory,
        runSaved: s.runSaved,
      }),
    },
  ),
)
