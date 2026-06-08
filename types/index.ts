export type PokemonType =
  | 'Normal' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Ice'
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic'
  | 'Bug' | 'Rock' | 'Ghost' | 'Dragon' | 'Steel' | 'Fairy' | 'Dark'

export type Rarity = 'comum' | 'rara' | 'ultra-rara' | 'lendaria' | 'epico'

export type AbilityName =
  | 'Overgrow' | 'Blaze' | 'Torrent' | 'WaterAbsorb' | 'VoltAbsorb'
  | 'FlashFire' | 'Levitate' | 'Sturdy' | 'Intimidate' | 'InnerFocus' | 'NoGuard'
  | 'Synchronize' | 'Imposter' | 'Glitch' | 'Lightning Rod'

export type RPS = 'rock' | 'paper' | 'scissors'

export type GameMode = 'normal' | 'hard'
export type Gender = 'boy' | 'girl'
export type RunStatus = 'active' | 'won' | 'lost'
export type BattlePhase = 'select_action' | 'reveal' | 'switch_risk' | 'battle_end'
export type AILevel = 'random' | 'weighted' | 'adaptive' | 'predictive'

export interface Ability {
  name: AbilityName
  description: string
}

export interface Move {
  name: string
  type: PokemonType
  category: RPS
}

export interface UniqueMove {
  name: string
  type: PokemonType
  category: RPS
  description: string
}

export interface StatusEffect {
  type: string
  target: 'player' | 'enemy'
  duration: number
}

export interface PokemonCard {
  id: number
  name: string
  type1: PokemonType
  type2: PokemonType | null
  ability: Ability
  rarity: Rarity
  isShiny: boolean
  moves: {
    rock: Move
    paper: Move
    scissors: Move
  }
  unique: UniqueMove | null
  hearts: number
  isFainted: boolean
  statusEffects: StatusEffect[]
}

export interface TurnResult {
  playerAction: RPS
  enemyAction: RPS
  outcome: 'player_wins' | 'enemy_wins' | 'tie'
  playerDamage: number
  enemyDamage: number
  uniqueActivated?: string
  passiveActivated?: string
}

export interface BattleState {
  gymId: number
  playerSelected: PokemonCard[]
  playerOrder: number[]
  enemyDeck: PokemonCard[]
  playerActive: PokemonCard
  enemyActive: PokemonCard
  playerBench: PokemonCard[]
  enemyBench: PokemonCard[]
  playerSwitchUsed: boolean
  turn: number
  phase: BattlePhase
  pendingAction: RPS | null
  pendingEnemyAction: RPS | null
  lastTurnResult: TurnResult | null
  statusEffects: StatusEffect[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

export interface User {
  id: string
  email: string
}
