// ─── Item system ──────────────────────────────────────────────────────────────

export type HeldItemId =
  | 'leftovers' | 'shell-bell' | 'sitrus-berry' | 'oran-berry'
  | 'focus-sash' | 'rocky-helmet' | 'lum-berry' | 'white-herb'
  | 'life-orb' | 'expert-belt' | 'scope-lens' | 'kings-rock' | 'quick-claw'
  | 'toxic-orb' | 'flame-orb'
  | 'charcoal' | 'mystic-water' | 'miracle-seed' | 'magnet'
  | 'twisted-spoon' | 'black-belt' | 'hard-stone' | 'silver-powder'
  | 'dragon-fang' | 'metal-coat'

export type ConsumableId =
  | 'potion' | 'super-potion' | 'hyper-potion' | 'full-restore'
  | 'antidote' | 'burn-heal' | 'full-heal'
  | 'revive' | 'max-revive'
  | 'ether' | 'elixir' | 'rare-candy'

export interface HeldItem {
  id: HeldItemId
  name: string
  description: string
}

export interface InventoryItem {
  itemId: ConsumableId
  quantity: number
}

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

// ─── Move system ──────────────────────────────────────────────────────────────

export type MoveKind = 'offensive' | 'status' | 'buff'

export type StatusCondition = 'poison' | 'paralysis' | 'sleep' | 'freeze' | 'burn'

export type SideIndex = 0 | 1

export interface HazardState {
  stealthRock: boolean
  toxicSpikes: boolean
  stickyWeb: boolean
}

export interface StatusState {
  condition: StatusCondition
  turnsLeft: number  // -1 = indefinite (poison/burn); ≥0 = turns remaining
}

export interface SideState {
  hazards: HazardState
  protectCooldown: boolean
}

export interface SlotState {
  status: StatusState | null
  tiredTurns: number
  attackMod: number
  defenseMod: number
  sturdyUsed: boolean
  flashFireActive: boolean
  shellSmashTurns: number
  aquaRingActive: boolean
  aquaRingHealIn: number
  destinyBond: boolean
  forcedMove: RPS | null
  forcedTurnsLeft: number
  sitrusUsed: boolean
  oranUsed: boolean
  lumUsed: boolean
  sashUsed: boolean
  whiteHerbUsed: boolean
  leftoversTick: number
  uniqueCooldown: boolean
}

export interface BattleEffects {
  sides: [SideState, SideState]
  slots: [SlotState, SlotState]
}

export type UniqueCategory = 'super' | 'heal' | 'ohko' | 'aoe'

export interface BuffEffect {
  stat: 'attack' | 'defense'
  delta: -1 | 1
  target: 'self' | 'opponent'
}

// ─── Catalog definition interfaces (never stored in save state) ───────────────

export interface MoveDefinition {
  name: string
  type: PokemonType
  kind: MoveKind
  drain?: boolean              // offensive: heals user for half damage dealt
  statusEffect?: StatusCondition   // status: applies this condition to opponent (100%)
  secondaryEffect?: { condition: StatusCondition; chance: number } // offensive: chance to apply on hit
  buffEffect?: BuffEffect      // buff: applies this modifier
  special?: string             // documented exceptions (e.g. 'protect')
}

export interface AbilityDefinition {
  id: string
  name: AbilityName
  description: string
  // trigger semantics handled by engine via 'special' field or explicit flags
  absorbType?: PokemonType     // WaterAbsorb, VoltAbsorb: immune + heal on hit
  immuneType?: PokemonType     // FlashFire, Levitate: immune only
  flashFireBoost?: boolean     // FlashFire: boosts own Fire when hit by Fire
  boostType?: PokemonType      // Overgrow/Blaze/Torrent: boost when ≤2♥
  boostBonus?: number
  lowHpThreshold?: number      // hearts at/below which boost activates
  special?: string             // 'intimidate' | 'sturdy' | 'no-guard' | 'synchronize' | 'imposter' | 'glitch' | 'lightning-rod'
}

export interface UniqueDefinition {
  name: string
  type: PokemonType
  rpsSlot: RPS
  description: string
  kind: UniqueCategory
  // heal
  healAmount?: number          // hearts restored (up to 5)
  selfStatus?: StatusCondition // status applied to SELF after heal (e.g. Rest → sleep)
  // aoe
  benchDamage?: number         // damage to each bench member (default 1)
  // super / special overrides
  damage?: number              // fixed damage (default 2 for super)
  recoil?: number              // recoil damage to user
  drain?: boolean              // heals user for half damage dealt
  userFaints?: boolean         // user faints after use (Explosion)
  cooldown?: boolean           // next unique unavailable next turn
  // status applied to opponent
  applyEnemyStatus?: StatusCondition
  // crit chance (0–1) → if crit: 2 damage, else 1
  critChance?: number
  // special string for engine exceptions
  special?: string
}

// ─── Runtime types (resolved from catalog at card-creation time) ──────────────

export interface Ability {
  name: AbilityName
  description: string
}

export interface Move {
  name: string
  type: PokemonType
  category: RPS          // which slot (rock / paper / scissors)
  kind: MoveKind
  drain?: boolean
  statusEffect?: StatusCondition
  secondaryEffect?: { condition: StatusCondition; chance: number }
  buffEffect?: BuffEffect
  special?: string
}

export interface UniqueMove {
  name: string
  type: PokemonType
  category: RPS          // which slot the button occupies
  description: string
  kind: UniqueCategory
  healAmount?: number
  selfStatus?: StatusCondition
  benchDamage?: number
  damage?: number
  recoil?: number
  drain?: boolean
  userFaints?: boolean
  cooldown?: boolean
  applyEnemyStatus?: StatusCondition
  critChance?: number
  special?: string
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
  heldItem: HeldItem | null
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

export type RunEndReason = 'abandoned' | 'lost' | 'won'

export interface RunSummary {
  id: string
  date: string
  playerName: string
  mode: GameMode
  gender: Gender
  result: RunEndReason
  floorsCompleted: number
  badgesEarned: number[]
  deathCount: number
  coins: number
  teamSnapshot: {
    id: number
    name: string
    type1: PokemonType
    hearts: number
    isFainted: boolean
  }[]
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
