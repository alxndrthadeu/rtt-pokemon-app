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

  // Deck
  playerDeck: PokemonCard[]
  rerollUsed: boolean

  // Batalha
  battle: BattleState | null

  // Actions — Setup
  setMode: (mode: GameMode) => void
  setGender: (gender: Gender) => void
  setPlayerName: (name: string) => void

  // Actions — Draft
  addToDeck: (card: PokemonCard) => void
  useReroll: () => void

  // Actions — Batalha
  startBattle: (gymId: number, enemyDeck: PokemonCard[], playerSelected: PokemonCard[], playerOrder: number[]) => void
  submitAction: (action: RPS) => void
  useSwitch: () => void
  endBattle: (result: 'win' | 'lose') => void
  applyPostGymSwap: (newCard: PokemonCard, discardId: number) => void

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
      playerDeck: [],
      rerollUsed: false,
      battle: null,

      setMode: (mode) => set({ mode }),
      setGender: (gender) => set({ gender }),
      setPlayerName: (playerName) => set({ playerName }),

      addToDeck: (card) =>
        set((s) => ({ playerDeck: [...s.playerDeck, card] })),

      useReroll: () => set({ rerollUsed: true }),

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
                ? s.playerDeck.map((p) => ({ ...p, hearts: 3, isFainted: false }))
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
            }).catch(console.error)
          }
        } else {
          set({ battle: null })
          if (state.runId) {
            apiRequest(`/runs/${state.runId}?session_id=${state.sessionId}`, {
              method: 'PATCH',
              body: JSON.stringify({ status: 'lost' }),
            }).catch(console.error)
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
          console.error('Falha ao criar run no servidor', e)
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
        }).catch(console.error)
      },

      resetRun: () =>
        set({
          runId: null,
          mode: null,
          gender: null,
          playerName: '',
          currentFloor: 0,
          badgesEarned: [],
          playerDeck: [],
          rerollUsed: false,
          battle: null,
        }),
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
        playerDeck: s.playerDeck,
        rerollUsed: s.rerollUsed,
      }),
    },
  ),
)
