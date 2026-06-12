'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PokemonCard, BattleState, GameMode, Gender, RPS } from '@/types'
import { apiRequest } from '@/lib/api'

function generateSessionId(): string {
  return crypto.randomUUID()
}

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

          set((s) => ({
            currentFloor: nextFloor,
            badgesEarned: s.battle
              ? [...s.badgesEarned, s.battle.gymId]
              : s.badgesEarned,
            battle: null,
            playerDeck:
              s.mode === 'normal'
                ? s.playerDeck.map((p) => ({ ...p, hearts: 5, isFainted: false }))
                : s.playerDeck,
          }))

          if (state.runId) {
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
          if (state.runId) {
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

      createRun: async () => {
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
        if (!s.runId) return
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
      }),
    },
  ),
)
