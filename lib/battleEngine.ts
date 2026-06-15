import type { PokemonCard, PokemonType, RPS, StatusCondition, UniqueMove, Move, SideIndex, BattleEffects, SlotState, SideState, StatusState } from '@/types'
import { getCombinedMultiplier, damageFromMultiplier } from '@/lib/data/typeChart'
import { HELD_ITEMS } from '@/lib/data/items'

// ─── Re-exports for callers that import from battleEngine ────────────────────
export type { BattleEffects, SlotState, SideState, StatusState, SideIndex } from '@/types'

// ─── Battle effects defaults ──────────────────────────────────────────────────

const DEFAULT_SLOT: SlotState = {
  status: null,
  tiredTurns: 0,
  attackMod: 0,
  defenseMod: 0,
  sturdyUsed: false,
  flashFireActive: false,
  shellSmashTurns: 0,
  aquaRingActive: false,
  aquaRingHealIn: 2,
  destinyBond: false,
  forcedMove: null,
  forcedTurnsLeft: 0,
  sitrusUsed: false,
  oranUsed: false,
  lumUsed: false,
  sashUsed: false,
  whiteHerbUsed: false,
  leftoversTick: 0,
  uniqueCooldown: false,
}

const DEFAULT_SIDE: SideState = {
  hazards: { stealthRock: false, toxicSpikes: false, stickyWeb: false },
  protectCooldown: false,
}

export const DEFAULT_EFFECTS: BattleEffects = {
  sides: [{ ...DEFAULT_SIDE, hazards: { ...DEFAULT_SIDE.hazards } }, { ...DEFAULT_SIDE, hazards: { ...DEFAULT_SIDE.hazards } }],
  slots: [{ ...DEFAULT_SLOT }, { ...DEFAULT_SLOT }],
}

export interface Fighter {
  pokemon: PokemonCard
  hearts: number  // float: 0.5 increments for burn/poison damage
}

// ─── Type immunities for status ───────────────────────────────────────────────

const STATUS_IMMUNE: Partial<Record<StatusCondition, PokemonType[]>> = {
  poison:    ['Poison', 'Steel'],
  paralysis: ['Electric'],
  burn:      ['Fire'],
  freeze:    ['Fire', 'Ice'],
}

export function isImmuneToStatus(
  condition: StatusCondition,
  type1: PokemonType,
  type2: PokemonType | null,
): boolean {
  const immune = STATUS_IMMUNE[condition] ?? []
  return immune.includes(type1) || (type2 !== null && immune.includes(type2))
}

// ─── Deep-clone effects (prevents mutation of nested objects) ─────────────────

function cloneEffects(effects: BattleEffects): BattleEffects {
  return {
    sides: [
      { ...effects.sides[0], hazards: { ...effects.sides[0].hazards } },
      { ...effects.sides[1], hazards: { ...effects.sides[1].hazards } },
    ],
    slots: [{ ...effects.slots[0] }, { ...effects.slots[1] }],
  }
}

// ─── Start-of-turn processing ─────────────────────────────────────────────────

export interface TurnStartResult {
  effects: BattleEffects
  playerForcedRps: RPS | null   // non-null → player must use this RPS
  enemyForcedRps: RPS | null    // non-null → enemy must use this RPS
  playerHeartsLost: number      // poison/burn damage (always ≥ 0)
  enemyHeartsLost: number
  playerHeartsGained: number    // Aqua Ring passive heal
  messages: string[]
  enemyAutoLose: boolean        // enemy sleeping/frozen, player wins automatically
  playerSkipsTurn: boolean      // sleeping → true; can still switch but cannot act
}

export function processTurnStart(
  effects: BattleEffects,
  pf: Fighter,
  ef: Fighter,
): TurnStartResult {
  const eff = cloneEffects(effects)
  const messages: string[] = []
  let playerForcedRps: RPS | null = null
  let enemyForcedRps: RPS | null = null
  let enemyAutoLose = false
  let playerSkipsTurn = false
  let playerHeartsLost = 0
  let enemyHeartsLost = 0
  let playerHeartsGained = 0

  const p = eff.slots[0]   // player slot
  const e = eff.slots[1]   // enemy slot

  // ── Shell Smash: reaplica buff/debuff a cada turno ativo ───────────────────
  if (p.shellSmashTurns > 0) {
    p.shellSmashTurns--
    p.attackMod = clampMod(p.attackMod + 1)
    p.defenseMod = clampMod(p.defenseMod - 1)
    if (p.shellSmashTurns > 0) {
      messages.push(`🔱 Shell Smash! +1 ATK / −1 DEF (${p.shellSmashTurns} turno${p.shellSmashTurns !== 1 ? 's' : ''} restante${p.shellSmashTurns !== 1 ? 's' : ''})`)
    } else {
      messages.push(`🔱 Shell Smash expirou.`)
    }
  }

  // ── Aqua Ring: cura passiva a cada 2 turnos ────────────────────────────────
  if (p.aquaRingActive) {
    p.aquaRingHealIn--
    if (p.aquaRingHealIn <= 0) {
      playerHeartsGained = 1
      p.aquaRingHealIn = 2
      messages.push(`💧 Aqua Ring! +1 ♥`)
    }
  }

  // ── Player status ──────────────────────────────────────────────────────────
  if (p.status) {
    const { condition, turnsLeft } = p.status
    if (condition === 'poison' || condition === 'burn') {
      playerHeartsLost = 0.5
      messages.push(condition === 'burn'
        ? `🔥 ${pf.pokemon.name} está queimado — −0.5 ♥`
        : `☠️ ${pf.pokemon.name} está envenenado — −0.5 ♥`)
    } else if (condition === 'sleep') {
      if (turnsLeft > 0) {
        if (turnsLeft > 1 && Math.random() < 0.45) {
          p.status = null
          messages.push(`😴 ${pf.pokemon.name} acordou cedo! Pode agir no próximo turno.`)
        } else {
          const newTurns = turnsLeft - 1
          p.status = newTurns > 0 ? { condition, turnsLeft: newTurns } : null
          if (p.status === null) messages.push(`😴 ${pf.pokemon.name} acordou!`)
          else messages.push(`😴 ${pf.pokemon.name} está dormindo — turno nulo!`)
        }
        playerSkipsTurn = true
      } else {
        p.status = null
        messages.push(`😴 ${pf.pokemon.name} acordou!`)
      }
    } else if (condition === 'freeze') {
      if (Math.random() < 0.20) {
        p.status = null
        messages.push(`🧊 ${pf.pokemon.name} descongelou espontaneamente!`)
      } else {
        playerForcedRps = 'rock'
        messages.push(`🧊 ${pf.pokemon.name} está congelado — perdeu o turno!`)
      }
    } else if (condition === 'paralysis') {
      if (Math.random() < 0.40) {
        playerForcedRps = 'rock'
        messages.push(`⚡ ${pf.pokemon.name} ficou paralisado — ✊ automático`)
      }
    }
  }

  // ── Player tired (OHKO/recharge) ──────────────────────────────────────────
  if (p.tiredTurns > 0) {
    p.tiredTurns--
    playerForcedRps = 'rock'
    messages.push(p.tiredTurns > 0
      ? `💤 ${pf.pokemon.name} está exausto — perdeu o turno! (${p.tiredTurns} turno${p.tiredTurns !== 1 ? 's' : ''} restante${p.tiredTurns !== 1 ? 's' : ''})`
      : `💤 ${pf.pokemon.name} está exausto — perdeu o turno!`)
  }

  // ── Enemy status ───────────────────────────────────────────────────────────
  if (e.status) {
    const { condition, turnsLeft } = e.status
    if (condition === 'poison' || condition === 'burn') {
      enemyHeartsLost = 0.5
    } else if (condition === 'sleep') {
      if (turnsLeft > 0) {
        if (turnsLeft > 1 && Math.random() < 0.45) {
          e.status = null
          enemyAutoLose = true
          messages.push(`😴 ${ef.pokemon.name} acordou cedo!`)
        } else {
          const newTurns = turnsLeft - 1
          e.status = newTurns > 0 ? { condition, turnsLeft: newTurns } : null
          enemyAutoLose = true
        }
      } else {
        e.status = null
        messages.push(`😴 ${ef.pokemon.name} acordou!`)
      }
    } else if (condition === 'freeze') {
      if (Math.random() < 0.20) {
        e.status = null
        messages.push(`🧊 ${ef.pokemon.name} descongelou espontaneamente!`)
      } else {
        enemyAutoLose = true
      }
    } else if (condition === 'paralysis') {
      if (Math.random() < 0.40) enemyForcedRps = 'rock'
    }
  }

  // ── Enemy tired ────────────────────────────────────────────────────────────
  if (e.tiredTurns > 0) {
    e.tiredTurns--
    enemyForcedRps = 'rock'
  }

  // ── Enemy forced (Hurricane / Glare) ──────────────────────────────────────
  if (!enemyForcedRps && e.forcedMove && e.forcedTurnsLeft > 0) {
    enemyForcedRps = e.forcedMove
    e.forcedTurnsLeft--
    if (e.forcedTurnsLeft === 0) e.forcedMove = null
  }

  // ── Hold item passives ───────────────────────────────────────────────────────
  const item = pf.pokemon.heldItem
  if (item) {
    const def = HELD_ITEMS[item.id]

    // Leftovers: +0.5♥ every 3 turns
    if (item.id === 'leftovers') {
      p.leftoversTick++
      if (p.leftoversTick >= 3) {
        p.leftoversTick = 0
        playerHeartsGained = Math.max(playerHeartsGained, 0.5)
        messages.push(`🍃 ${item.name}! +0.5 ♥`)
      }
    }

    // Sitrus Berry: ≤2♥ → +1♥ (once)
    if (item.id === 'sitrus-berry' && !p.sitrusUsed && pf.hearts <= 2) {
      p.sitrusUsed = true
      playerHeartsGained = Math.max(playerHeartsGained, 1)
      messages.push(`🍓 ${item.name}! +1 ♥`)
    }

    // Oran Berry: ≤1♥ → +0.5♥ (once)
    if (item.id === 'oran-berry' && !p.oranUsed && pf.hearts <= 1) {
      p.oranUsed = true
      playerHeartsGained = Math.max(playerHeartsGained, 0.5)
      messages.push(`🫐 ${item.name}! +0.5 ♥`)
    }

    // Lum Berry: auto-cure first status (once)
    if (item.id === 'lum-berry' && !p.lumUsed && p.status) {
      p.lumUsed = true
      p.status = null
      playerForcedRps = null
      playerSkipsTurn = false
      messages.push(`🍋 ${item.name}! Status curado!`)
    }

    void def
  }

  return { effects: eff, playerForcedRps, enemyForcedRps, playerHeartsLost, playerHeartsGained, enemyHeartsLost, messages, enemyAutoLose, playerSkipsTurn }
}

// ─── Slot move side-effects (buff / status) ───────────────────────────────────

export interface SlotSideEffect {
  effects: BattleEffects
  message: string | null
  isProtect: boolean
}

export function applySlotMoveEffect(
  move: Move,
  attackerSide: SideIndex,
  effects: BattleEffects,
  defenderPokemon: PokemonCard,
  attackerPokemon?: PokemonCard,
): SlotSideEffect {
  const eff = cloneEffects(effects)
  const defenderSide = (1 - attackerSide) as SideIndex
  let message: string | null = null
  let isProtect = false

  // ── Rapid Spin: clears the spinner's own side hazards ────────────────────────
  if (move.special === 'rapid-spin') {
    const h = eff.sides[attackerSide].hazards
    const removed = [h.stealthRock && 'Stealth Rock', h.toxicSpikes && 'Toxic Spikes', h.stickyWeb && 'Sticky Web'].filter(Boolean) as string[]
    eff.sides[attackerSide].hazards = { stealthRock: false, toxicSpikes: false, stickyWeb: false }
    message = removed.length > 0
      ? `🌀 Rapid Spin! ${removed.join(' + ')} — campo limpo!`
      : `🌀 Rapid Spin! Nenhuma armadilha no campo.`
    return { effects: eff, message, isProtect }
  }

  // ── Hazard-setting moves: placed on opponent's side ──────────────────────────
  if (move.special === 'stealth-rock' || move.special === 'toxic-spikes' || move.special === 'sticky-web') {
    const h = eff.sides[defenderSide].hazards
    eff.sides[defenderSide].hazards = {
      stealthRock: move.special === 'stealth-rock' ? true : h.stealthRock,
      toxicSpikes: move.special === 'toxic-spikes' ? true : h.toxicSpikes,
      stickyWeb:   move.special === 'sticky-web'   ? true : h.stickyWeb,
    }
    const isPlayerAttacking = attackerSide === 0
    const labels: Record<string, [string, string]> = {
      'stealth-rock': ['🪨 Stealth Rock no campo inimigo!', '🪨 Stealth Rock no seu campo!'],
      'toxic-spikes': ['☠️ Toxic Spikes no campo inimigo!', '☠️ Toxic Spikes no seu campo!'],
      'sticky-web':   ['🕸️ Sticky Web no campo inimigo!',  '🕸️ Sticky Web no seu campo!'],
    }
    message = labels[move.special][isPlayerAttacking ? 0 : 1]
    return { effects: eff, message, isProtect }
  }

  // ── White Herb: cancel first defense debuff to the defender ──────────────────
  if (
    move.kind === 'buff' && move.buffEffect &&
    move.buffEffect.stat === 'defense' && move.buffEffect.delta < 0 &&
    move.buffEffect.target === 'opponent' &&
    defenderPokemon?.heldItem?.id === 'white-herb' && !eff.slots[defenderSide].whiteHerbUsed
  ) {
    eff.slots[defenderSide].whiteHerbUsed = true
    message = `🌿 Erva Branca! Debuff de defesa cancelado!`
    return { effects: eff, message, isProtect }
  }
  void attackerPokemon

  // ── Protect ──────────────────────────────────────────────────────────────────
  if (move.special === 'protect') {
    isProtect = true
    eff.sides[attackerSide].protectCooldown = true
    message = `🛡️ ${move.name}: ${attackerSide === 0 ? 'Você está protegido' : 'Inimigo se protegeu'} este turno!`
    return { effects: eff, message, isProtect }
  }

  // ── Status moves ──────────────────────────────────────────────────────────────
  if (move.kind === 'status' && move.statusEffect) {
    const icons: Record<StatusCondition, string> = { poison: '☠️', paralysis: '⚡', sleep: '😴', freeze: '🧊', burn: '🔥' }
    const defSlot = eff.slots[defenderSide]
    if (isImmuneToStatus(move.statusEffect, defenderPokemon.type1, defenderPokemon.type2)) {
      message = `${move.name}: ${attackerSide === 0 ? 'inimigo é imune' : 'seu Pokémon é imune'} a ${move.statusEffect}!`
    } else if (defSlot.status) {
      message = `${move.name}: ${attackerSide === 0 ? 'inimigo' : 'seu Pokémon'} já tem um status!`
    } else {
      const turns = move.statusEffect === 'sleep' ? 2 : -1
      defSlot.status = { condition: move.statusEffect, turnsLeft: turns }
      message = `${icons[move.statusEffect]} ${move.name}: ${move.statusEffect} aplicado ${attackerSide === 0 ? 'ao inimigo' : 'ao seu Pokémon'}!`
    }
    return { effects: eff, message, isProtect }
  }

  // ── Buff / debuff moves ───────────────────────────────────────────────────────
  if (move.kind === 'buff' && move.buffEffect) {
    const { stat, delta, target } = move.buffEffect
    const targetSide = target === 'self' ? attackerSide : defenderSide
    const icons: Record<string, string> = {
      'attack+1': '⬆️ Ataque', 'attack-1': '⬇️ Ataque', 'defense+1': '⬆️ Defesa', 'defense-1': '⬇️ Defesa',
    }
    const label = icons[`${stat}${delta > 0 ? '+1' : '-1'}`] ?? `${stat} ${delta > 0 ? '+1' : '-1'}`

    if (stat === 'attack') {
      eff.slots[targetSide].attackMod = clampMod(eff.slots[targetSide].attackMod + delta)
      if (target === 'self' && attackerSide === 0) message = `${label}! Seu próximo ataque +${delta}.`
      else if (target === 'opponent' && attackerSide === 0) message = `${move.name}: ${label} inimigo!`
      else if (target === 'opponent' && attackerSide === 1) message = `${move.name}: ${label} do jogador!`
    } else {
      eff.slots[targetSide].defenseMod = clampMod(eff.slots[targetSide].defenseMod + delta)
      if (target === 'self' && attackerSide === 0) message = `${move.name}: ${label}! Sua próxima defesa +${delta}.`
      else if (target === 'opponent' && attackerSide === 0) message = `${move.name}: ${label} inimigo!`
    }
    return { effects: eff, message, isProtect }
  }

  return { effects: eff, message: null, isProtect }
}

function clampMod(v: number): number { return Math.max(-1, Math.min(1, v)) }

// ─── Thaw on Fire hit ─────────────────────────────────────────────────────────

export function applyThaw(
  effects: BattleEffects,
  defenderSide: SideIndex,
  attackType: PokemonType,
): { effects: BattleEffects; thawed: boolean } {
  if (attackType !== 'Fire') return { effects, thawed: false }
  const eff = cloneEffects(effects)
  if (eff.slots[defenderSide].status?.condition === 'freeze') {
    eff.slots[defenderSide].status = null
    return { effects: eff, thawed: true }
  }
  return { effects: eff, thawed: false }
}

// ─── Sturdy check ─────────────────────────────────────────────────────────────

export function applySturdy(
  damage: number,
  currentHearts: number,
  sturdyUsed: boolean,
  hasAbility: boolean,
): { damage: number; sturdyTriggered: boolean } {
  // Sturdy activates if: has ≥2♥ AND would reach 0 AND not already used this battle
  if (!hasAbility || sturdyUsed) return { damage, sturdyTriggered: false }
  if (currentHearts >= 2 && currentHearts - damage <= 0) {
    return { damage: currentHearts - 1, sturdyTriggered: true }
  }
  return { damage, sturdyTriggered: false }
}

// ─── Slot damage calculation ──────────────────────────────────────────────────

export interface SlotDamageResult {
  damage: number
  multiplier: number
  messages: string[]
}

export function calcSlotDamage(
  attackType: PokemonType,
  attackerPokemon: PokemonCard,
  attackerHearts: number,
  defenderPokemon: PokemonCard,
  flashFireActive: boolean,
  attackMod: number,
  defenseMod: number,
): SlotDamageResult {
  const messages: string[] = []
  const abilityName = attackerPokemon.ability.name

  // Glitch: fixed 2 damage (nerfed from instant KO — too swingy for a non-legendary)
  if (abilityName === 'Glitch') {
    messages.push('⚠️ GLITCH! Dados corrompidos — 2 dano fixo!')
    return { damage: 2, multiplier: 2, messages }
  }

  let mult = getCombinedMultiplier(attackType, defenderPokemon.type1, defenderPokemon.type2)
  let dmg = damageFromMultiplier(1, mult)

  // InnerFocus / NoGuard: imunidade de tipo não zera o dano (mínimo 1)
  if (dmg === 0 && (abilityName === 'InnerFocus' || abilityName === 'NoGuard')) {
    dmg = 1
    messages.push(`🎯 ${abilityName}! Ignora imunidade de tipo — 1 dano!`)
  }

  // Low-HP ability boost (≤2♥)
  if (attackerHearts <= 2) {
    if (abilityName === 'Overgrow' && attackType === 'Grass') { dmg++; messages.push(`🌿 Overgrow! +1 dano de Grama!`) }
    else if (abilityName === 'Blaze' && attackType === 'Fire') { dmg++; messages.push(`🔥 Blaze! +1 dano de Fogo!`) }
    else if (abilityName === 'Torrent' && attackType === 'Water') { dmg++; messages.push(`💧 Torrent! +1 dano de Água!`) }
  }

  // Mew Synchronize: always 2 damage
  if (abilityName === 'Synchronize' && attackerPokemon.name === 'Mew') {
    mult = 2; dmg = 2; messages.push('✨ Synchronize! Sempre super efetivo!')
  }

  // FlashFire boost
  if (abilityName === 'FlashFire' && attackType === 'Fire' && flashFireActive) {
    dmg++; messages.push('🔥 FlashFire! Fogo potencializado +1!')
  }

  // Attack/defense mods (one-shot)
  dmg = Math.max(0, dmg + attackMod - defenseMod)

  // ── Hold item boosts (attacker) ──────────────────────────────────────────────
  if (dmg > 0 && attackerPokemon.heldItem) {
    const hid = attackerPokemon.heldItem.id
    const itemDef = HELD_ITEMS[hid]

    // Type boost items: +1♥ super efetivo, +0.5♥ normal
    if (itemDef?.onHit === 'type-boost' && itemDef.typeBoost === attackType) {
      const boost = mult >= 2 ? 1 : 0.5
      dmg += boost
      messages.push(`✨ ${attackerPokemon.heldItem.name}! +${boost} dano (${attackType}${mult >= 2 ? ' super efetivo' : ''})`)
    }

    // Expert Belt: +0.5♥ on super effective
    if (hid === 'expert-belt' && mult >= 2) {
      dmg += 0.5
      messages.push(`🥊 ${attackerPokemon.heldItem.name}! +0.5 dano super efetivo!`)
    }

    // Life Orb: +0.5 damage (recoil handled in batalha/page.tsx via lifeOrbRecoil flag)
    if (hid === 'life-orb') {
      dmg += 0.5
      messages.push(`🔮 ${attackerPokemon.heldItem.name}! +0.5 dano`)
    }
  }

  return { damage: dmg, multiplier: mult, messages }
}

// ─── Unique result ────────────────────────────────────────────────────────────

export interface UniqueResult {
  damage: number
  healPlayer: number
  recoil: number
  benchDamage: number
  enemyStatus: StatusState | null
  playerStatus: StatusState | null
  enemyForcedMove: RPS | null
  forceTurns: number
  playerTiredTurns: number    // 0 = no tire; 1 = recharge; 2 = OHKO
  userFaints: boolean
  cooldown: boolean
  drainHearts: number         // heal from drain (⌊damage/2⌋)
  activateShellSmash: boolean // ativa Shell Smash 3-turn buff/debuff
  activateAquaRing: boolean   // ativa Aqua Ring regen passiva
  activateDestinyBond: boolean // ativa Destiny Bond
  playerAttackBuff: number    // +N temporário a attackMod (0 = nenhum)
  playerDefenseBuff: number   // +N temporário a defenseMod (0 = nenhum)
  messages: string[]
}

const EMPTY_UNIQUE_RESULT: UniqueResult = {
  damage: 0, healPlayer: 0, recoil: 0, benchDamage: 0,
  enemyStatus: null, playerStatus: null,
  enemyForcedMove: null, forceTurns: 0,
  playerTiredTurns: 0, userFaints: false, cooldown: false,
  drainHearts: 0,
  activateShellSmash: false, activateAquaRing: false, activateDestinyBond: false,
  playerAttackBuff: 0, playerDefenseBuff: 0,
  messages: [],
}

export function calcUniqueResult(
  unique: UniqueMove,
  attacker: Fighter,
  defender: Fighter,
  effects: BattleEffects,
): UniqueResult {
  const res: UniqueResult = { ...EMPTY_UNIQUE_RESULT, messages: [] }
  const defType1 = defender.pokemon.type1
  const defType2 = defender.pokemon.type2
  const name = unique.name

  // Unique moves are always player-initiated (attackerSide=0, defenderSide=1)
  const enemySlot = effects.slots[1]

  function tryApplyStatus(cond: StatusCondition, turns = 2) {
    if (isImmuneToStatus(cond, defType1, defType2) || enemySlot.status) return
    res.enemyStatus = { condition: cond, turnsLeft: turns }
  }

  switch (unique.kind) {
    // ── Heal ───────────────────────────────────────────────────────────────────
    case 'heal': {
      if (unique.special === 'dream-eater') {
        if (enemySlot.status?.condition === 'sleep') {
          res.damage = 2; res.healPlayer = 2
          res.messages.push(`💤 ${name}: ${defender.pokemon.name} está dormindo! 2 dano + 2 ♥ recuperados!`)
        } else {
          res.messages.push(`💤 ${name}: falhou — inimigo não está dormindo.`)
        }
      } else if (unique.special === 'aqua-ring') {
        res.activateAquaRing = true
        res.messages.push(`💧 ${name}: anel de água ativado! +1 ♥ a cada 2 turnos.`)
      } else {
        const amount = unique.healAmount ?? 3
        res.healPlayer = amount
        if (unique.selfStatus) {
          const turns = 1
          res.playerStatus = { condition: unique.selfStatus, turnsLeft: turns }
          res.messages.push(`😴 ${name}: recupera ${amount} ♥ e dorme por 1 turno.`)
        } else {
          res.messages.push(`💚 ${name}: recupera ${amount} ♥!`)
        }
      }
      break
    }

    // ── OHKO ───────────────────────────────────────────────────────────────────
    case 'ohko': {
      if (unique.special === 'no-tire') {
        res.damage = defender.hearts
        res.messages.push(`⚠️ ${name}: KO instantâneo!`)
      } else if (unique.special === 'sheer-cold') {
        const vulnerable = ['Water', 'Grass', 'Flying', 'Dragon'].some(t => t === defType1 || t === defType2)
        if (vulnerable) {
          res.damage = defender.hearts; res.playerTiredTurns = 2
          res.messages.push(`❄️ ${name}: KO instantâneo! (${attacker.pokemon.name} fica exausto por 2 turnos)`)
        } else {
          res.damage = 1; res.playerTiredTurns = 2
          res.messages.push(`❄️ ${name}: sem efeito total — 1 dano. (${attacker.pokemon.name} fica exausto)`)
        }
      } else if (unique.special === 'fissure') {
        const vulnerable = ['Ground', 'Rock', 'Steel'].some(t => t === defType1 || t === defType2)
        if (vulnerable) {
          res.damage = defender.hearts; res.playerTiredTurns = 2
          res.messages.push(`🌍 ${name}: KO instantâneo! ${defender.pokemon.name} é de tipo fraco! (${attacker.pokemon.name} fica exausto)`)
        } else {
          res.damage = 1; res.playerTiredTurns = 2
          res.messages.push(`🌍 ${name}: sem efeito total — 1 dano. (${attacker.pokemon.name} fica exausto)`)
        }
      } else {
        res.damage = defender.hearts; res.playerTiredTurns = 2
        res.messages.push(`💥 ${name}: KO instantâneo! (${attacker.pokemon.name} fica exausto por 2 turnos)`)
      }
      break
    }

    // ── AoE ────────────────────────────────────────────────────────────────────
    case 'aoe': {
      const dmg = unique.damage ?? 1
      res.damage = dmg
      res.benchDamage = unique.benchDamage ?? 1
      if (unique.userFaints) res.userFaints = true
      if (unique.applyEnemyStatus) tryApplyStatus(unique.applyEnemyStatus)
      const suffix = res.userFaints ? ` ${attacker.pokemon.name} é derrotado!` : ''
      res.messages.push(`💥 ${name}: ${dmg} dano + ${res.benchDamage} a cada reserva!${suffix}`)
      break
    }

    // ── Super ──────────────────────────────────────────────────────────────────
    case 'super':
    default: {
      const baseDmg = unique.damage ?? 2

      if (unique.applyEnemyStatus && !enemySlot.status) {
        const sleepTurns = name === 'Spore' ? 1 : 2
        tryApplyStatus(unique.applyEnemyStatus, unique.applyEnemyStatus === 'sleep' ? sleepTurns : 2)
      }

      switch (unique.special) {
        case 'ignore-immunity':
        case 'ignore-abilities':
          res.damage = baseDmg
          res.messages.push(`⚡ ${name}: ${baseDmg} dano (ignora imunidades)!`)
          break

        case 'sky-attack': {
          const boosted = [defType1, defType2].some(t => t === 'Grass' || t === 'Bug')
          res.damage = boosted ? 3 : 2
          res.messages.push(`🦅 ${name}: ${res.damage} dano!${boosted ? ' Super contra Grama/Bug!' : ''}`)
          break
        }

        case 'megahorn': {
          const boosted = [defType1, defType2].some(t => t === 'Psychic')
          res.damage = boosted ? 3 : 2
          res.messages.push(`🦏 ${name}: ${res.damage} dano!${boosted ? ' Super contra Psíquico!' : ''}`)
          break
        }

        case 'tri-attack': {
          const options: StatusCondition[] = ['burn', 'freeze', 'paralysis']
          const picked = options[Math.floor(Math.random() * 3)]
          tryApplyStatus(picked)
          res.damage = baseDmg
          const statusApplied = res.enemyStatus?.condition === picked
          res.messages.push(`🔱 ${name}: ${baseDmg} dano${statusApplied ? ` + ${picked}!` : '!'}`)
          break
        }

        case 'volt-switch': {
          if (Math.random() < 0.33) tryApplyStatus('paralysis')
          res.damage = baseDmg
          res.messages.push(`⚡ ${name}: ${baseDmg} dano!${res.enemyStatus ? ' Paralisia!' : ''}`)
          break
        }

        case 'ancient-power': {
          const buffed = Math.random() < 0.2
          res.damage = buffed ? 2 : 1
          if (buffed) res.playerAttackBuff = 1
          res.messages.push(`🗿 ${name}: ${res.damage} dano!${buffed ? ' Poder ancestral! +1 ATK próximo turno!' : ''}`)
          break
        }

        case 'volt-tackle': {
          const superEff = [defType1, defType2].some(t => t === 'Ground' || t === 'Rock')
          res.damage = superEff ? 3 : 2
          res.messages.push(`⚡ ${name}: ${res.damage} dano!${superEff ? ' Super efetivo vs Terra/Pedra!' : ''}`)
          break
        }

        case 'rock-slide': {
          const fright = Math.random() < 0.3
          res.damage = 1
          if (fright) { res.enemyForcedMove = 'rock'; res.forceTurns = 1 }
          res.messages.push(`🪨 ${name}: 1 dano!${fright ? ' Inimigo aterrorizado!' : ''}`)
          break
        }

        case 'shell-smash': {
          res.damage = baseDmg
          res.activateShellSmash = true
          res.messages.push(`🔱 Shell Smash! ${baseDmg} dano + +1 ATK / −1 DEF por 3 turnos!`)
          break
        }

        case 'acid-armor':
        case 'barrier':
          res.damage = 0
          res.playerDefenseBuff = 1
          res.messages.push(`🛡️ ${name}: +1 DEF neste turno!`)
          break

        case 'quiver-dance':
          res.damage = 0
          res.playerAttackBuff = 1
          res.playerDefenseBuff = 1
          res.messages.push(`🦋 ${name}: +1 ATK e +1 DEF neste turno!`)
          break

        case 'metronome': {
          const types: PokemonType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Psychic', 'Ghost', 'Dragon', 'Dark', 'Fairy']
          const t = types[Math.floor(Math.random() * types.length)]
          const mult = getCombinedMultiplier(t, defType1, defType2)
          res.damage = damageFromMultiplier(1, mult)
          res.messages.push(`🎵 ${name}: tipo ${t} — ${res.damage} dano!`)
          break
        }

        case 'conversion':
          res.damage = 1
          res.messages.push(`💻 ${name}: tipo alterado — 1 dano.`)
          break

        case 'destiny-bond':
          res.damage = 0
          res.activateDestinyBond = true
          res.messages.push(`💀 ${name}: laço ativado! Se ${attacker.pokemon.name} cair, o inimigo também cai!`)
          break

        case 'perish-song':
        case 'imposter':
          res.damage = 0
          res.messages.push(`✨ ${name} ativado!`)
          break

        default: {
          let dmg = baseDmg
          const scopeBoost = attacker.pokemon.heldItem?.id === 'scope-lens' ? 0.25 : 0
          const effectiveCrit = (unique.critChance ?? 0) + scopeBoost
          if (effectiveCrit && Math.random() < effectiveCrit) {
            dmg = 2
            res.messages.push(`⚔️ ${name}: crítico! 2 dano!`)
          } else {
            if (unique.damage === undefined) {
              const mult = getCombinedMultiplier(unique.type, defType1, defType2)
              dmg = damageFromMultiplier(baseDmg, mult)
            }
            res.messages.push(`⚡ ${name}: ${dmg} dano!`)
          }
          res.damage = dmg
          if (unique.recoil) res.recoil = unique.recoil
          if (unique.drain && dmg > 0) res.drainHearts = Math.floor(dmg / 2)
          if (unique.cooldown) res.cooldown = true
          break
        }
      }

      // Hyper Beam / Rock Wrecker / Giga Impact → tired 1 turn
      if (['Hyper Beam', 'Rock Wrecker', 'Giga Impact', 'Outrage'].includes(name)) {
        res.playerTiredTurns = 1
      }
      if (unique.cooldown && !res.cooldown) res.cooldown = true
      if (unique.recoil && !res.recoil) res.recoil = unique.recoil
      if (unique.drain && res.damage > 0 && !res.drainHearts) res.drainHearts = Math.floor(res.damage / 2)

      break
    }
  }

  return res
}

// ─── Entry effects ────────────────────────────────────────────────────────────

export function applyEntryEffects(
  pokemon: PokemonCard,
  enteringSide: SideIndex,
  effects: BattleEffects,
): { newEffects: BattleEffects; message: string | null; hazardDamage: number; forcedFirstMove: RPS | null } {
  const eff = cloneEffects(effects)
  const opposingSide = (1 - enteringSide) as SideIndex
  const messages: string[] = []
  let hazardDamage = 0
  let forcedFirstMove: RPS | null = null

  // Intimidate: lower opponent's attack mod
  if (pokemon.ability.name === 'Intimidate') {
    eff.slots[opposingSide].attackMod = clampMod(eff.slots[opposingSide].attackMod - 1)
    messages.push(enteringSide === 0
      ? `😤 Intimidate! ${pokemon.name} entrou e reduziu o próximo ataque inimigo!`
      : `😤 Intimidate! ${pokemon.name} entrou e reduziu seu próximo ataque!`)
  }

  // Clear protect cooldown on switch
  eff.sides[enteringSide].protectCooldown = false

  // ── Hold item orbs: apply status on entry (player-side only for now) ──────────
  if (enteringSide === 0 && pokemon.heldItem) {
    const slot = eff.slots[0]
    if (pokemon.heldItem.id === 'toxic-orb' && !slot.status &&
        !isImmuneToStatus('poison', pokemon.type1, pokemon.type2)) {
      slot.status = { condition: 'poison', turnsLeft: -1 }
      messages.push(`☠️ ${pokemon.heldItem.name}! ${pokemon.name} foi envenenado!`)
    }
    if (pokemon.heldItem.id === 'flame-orb' && !slot.status &&
        !isImmuneToStatus('burn', pokemon.type1, pokemon.type2)) {
      slot.status = { condition: 'burn', turnsLeft: -1 }
      messages.push(`🔥 ${pokemon.heldItem.name}! ${pokemon.name} foi queimado!`)
    }
  }

  // ── Hazards trigger on entry ──────────────────────────────────────────────────
  const hazards = eff.sides[enteringSide].hazards
  const slot = eff.slots[enteringSide]

  // Sticky Web: forces Rock on first turn
  if (hazards.stickyWeb) {
    forcedFirstMove = 'rock'
    messages.push(`🕸️ Sticky Web! ${pokemon.name} está preso — ✊ forçado no 1º turno!`)
  }

  // Stealth Rock: damage on entry
  if (hazards.stealthRock) {
    const mult = getCombinedMultiplier('Rock', pokemon.type1, pokemon.type2)
    if (mult > 0) {
      const srDmg = mult >= 2 ? 1 : mult <= 0.5 ? 0.25 : 0.5
      hazardDamage += srDmg
      messages.push(`🪨 Stealth Rock! ${pokemon.name} sofreu ${srDmg} dano ao entrar!`)
    }
  }

  // Toxic Spikes: apply poison on entry (Poison types absorb and remove)
  if (hazards.toxicSpikes) {
    if (pokemon.type1 === 'Poison' || pokemon.type2 === 'Poison') {
      eff.sides[enteringSide].hazards = { ...eff.sides[enteringSide].hazards, toxicSpikes: false }
      messages.push(`☠️ ${pokemon.name} (Venenoso) absorveu as Toxic Spikes!`)
    } else if (!slot.status && !isImmuneToStatus('poison', pokemon.type1, pokemon.type2)) {
      slot.status = { condition: 'poison', turnsLeft: -1 }
      messages.push(`☠️ Toxic Spikes! ${pokemon.name} foi envenenado ao entrar!`)
    }
  }

  // Reset per-pokemon item ticks when new pokemon enters (sash NOT reset — one use per battle)
  if (enteringSide === 0) {
    const p = eff.slots[0]
    p.leftoversTick = 0
    p.sitrusUsed = false
    p.oranUsed = false
    p.lumUsed = false
    p.whiteHerbUsed = false
  }

  return {
    newEffects: eff,
    message: messages.join(' | ') || null,
    hazardDamage,
    forcedFirstMove,
  }
}

// ─── Focus Sash check ─────────────────────────────────────────────────────────
// Call after calculating final damage to player. Returns adjusted damage.
export function applyFocusSash(
  damage: number,
  currentHearts: number,
  pokemon: PokemonCard,
  sashUsed: boolean,
): { damage: number; sashTriggered: boolean } {
  if (
    pokemon.heldItem?.id !== 'focus-sash' ||
    sashUsed ||
    currentHearts < 5 ||           // must be at full HP
    currentHearts - damage > 0     // not a KO
  ) {
    return { damage, sashTriggered: false }
  }
  return { damage: currentHearts - 0.5, sashTriggered: true }
}

// ─── Rocky Helmet recoil ──────────────────────────────────────────────────────
// Returns recoil damage to the attacker (0 if defender has no Rocky Helmet).
export function getRockyHelmetRecoil(defenderPokemon: PokemonCard): number {
  return defenderPokemon.heldItem?.id === 'rocky-helmet' ? 0.5 : 0
}

// ─── Life Orb recoil ─────────────────────────────────────────────────────────
// Returns self-recoil for the attacker if they have Life Orb and dealt damage.
export function getLifeOrbRecoil(attackerPokemon: PokemonCard, damageDealt: number): number {
  return attackerPokemon.heldItem?.id === 'life-orb' && damageDealt > 0 ? 0.5 : 0
}

// ─── King's Rock flinch ───────────────────────────────────────────────────────
// Returns true if the attacker's King's Rock triggers a flinch (30%).
export function checkKingsRock(attackerPokemon: PokemonCard): boolean {
  return attackerPokemon.heldItem?.id === 'kings-rock' && Math.random() < 0.30
}

// ─── Quick Claw reveal ────────────────────────────────────────────────────────
// Returns true if the pokemon's Quick Claw triggers this turn (25%).
export function checkQuickClaw(pokemon: PokemonCard): boolean {
  return pokemon.heldItem?.id === 'quick-claw' && Math.random() < 0.25
}

// ─── Shell Bell heal ─────────────────────────────────────────────────────────
// Returns heal amount (0.5♥) if attacker has Shell Bell and dealt damage.
export function getShellBellHeal(attackerPokemon: PokemonCard, damageDealt: number): number {
  return attackerPokemon.heldItem?.id === 'shell-bell' && damageDealt > 0 ? 0.5 : 0
}
