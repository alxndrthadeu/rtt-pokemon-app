import type { PokemonCard, PokemonType, RPS, StatusCondition, UniqueMove, Move } from '@/types'
import { getCombinedMultiplier, damageFromMultiplier } from '@/lib/data/typeChart'
import { HELD_ITEMS } from '@/lib/data/items'

// ─── Status state ─────────────────────────────────────────────────────────────

export interface StatusState {
  condition: StatusCondition
  turnsLeft: number   // -1 = indefinite (poison/burn); ≥0 = turns remaining
}

// ─── Battle effects ───────────────────────────────────────────────────────────

export interface BattleEffects {
  flashFireActive: boolean
  playerSturdyUsed: boolean
  enemySturdyUsed: boolean
  // Forced move state
  enemyForcedMove: RPS | null
  enemyForcedTurnsLeft: number
  // Status conditions
  playerStatus: StatusState | null
  enemyStatus: StatusState | null
  // "Tired" — forced rock for N turns (OHKO, Hyper Beam recharge, etc.)
  playerTiredTurns: number
  enemyTiredTurns: number
  // One-shot attack/defense modifiers (consumed when first applied, then reset to 0)
  playerAttackMod: number   // ±1 applied to next player attack
  enemyAttackMod: number    // ±1 applied to next enemy attack
  playerDefenseMod: number  // ±1 applied when player receives next hit
  enemyDefenseMod: number   // ±1 applied when enemy receives next hit
  // Protect: blocks incoming damage for one turn
  playerProtectCooldown: boolean  // protect unavailable next turn
  enemyProtectCooldown: boolean
  // Unique state
  uniqueCooldown: boolean         // unique unavailable next turn (Hydro Cannon)
  // Shell Smash: +1 atk / -1 def por N turnos
  playerShellSmashTurns: number
  // Aqua Ring: cura passiva +1♥ a cada 2 turnos
  playerAquaRingActive: boolean
  playerAquaRingHealIn: number    // countdown: quando chega a 0 cura e reseta para 2
  // Destiny Bond: se player for KO no próximo turno, inimigo também cai
  playerDestinyBond: boolean

  // ── Hazards de campo ─────────────────────────────────────────────────────────
  playerHazards: { stealthRock: boolean; toxicSpikes: boolean; stickyWeb: boolean }
  enemyHazards:  { stealthRock: boolean; toxicSpikes: boolean; stickyWeb: boolean }

  // ── Hold item tracking (one-use items per battle) ────────────────────────────
  playerSitrusUsed: boolean    // Sitrus Berry
  playerOranUsed: boolean      // Oran Berry
  playerLumUsed: boolean       // Lum Berry
  playerSashUsed: boolean      // Focus Sash
  playerWhiteHerbUsed: boolean // White Herb
  playerLeftoversTick: number  // counts up to 3; resets and heals
}

export const DEFAULT_EFFECTS: BattleEffects = {
  flashFireActive: false,
  playerSturdyUsed: false,
  enemySturdyUsed: false,
  enemyForcedMove: null,
  enemyForcedTurnsLeft: 0,
  playerStatus: null,
  enemyStatus: null,
  playerTiredTurns: 0,
  enemyTiredTurns: 0,
  playerAttackMod: 0,
  enemyAttackMod: 0,
  playerDefenseMod: 0,
  enemyDefenseMod: 0,
  playerProtectCooldown: false,
  enemyProtectCooldown: false,
  uniqueCooldown: false,
  playerShellSmashTurns: 0,
  playerAquaRingActive: false,
  playerAquaRingHealIn: 2,
  playerDestinyBond: false,
  playerHazards: { stealthRock: false, toxicSpikes: false, stickyWeb: false },
  enemyHazards:  { stealthRock: false, toxicSpikes: false, stickyWeb: false },
  playerSitrusUsed: false,
  playerOranUsed: false,
  playerLumUsed: false,
  playerSashUsed: false,
  playerWhiteHerbUsed: false,
  playerLeftoversTick: 0,
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
  const eff = { ...effects }
  const messages: string[] = []
  let playerForcedRps: RPS | null = null
  let enemyForcedRps: RPS | null = null
  let enemyAutoLose = false
  let playerSkipsTurn = false
  let playerHeartsLost = 0
  let enemyHeartsLost = 0
  let playerHeartsGained = 0

  // ── Shell Smash: reaplica buff/debuff a cada turno ativo ───────────────────
  if (eff.playerShellSmashTurns > 0) {
    eff.playerShellSmashTurns--
    eff.playerAttackMod = clampMod(eff.playerAttackMod + 1)
    eff.playerDefenseMod = clampMod(eff.playerDefenseMod - 1)
    if (eff.playerShellSmashTurns > 0) {
      messages.push(`🔱 Shell Smash! +1 ATK / −1 DEF (${eff.playerShellSmashTurns} turno${eff.playerShellSmashTurns !== 1 ? 's' : ''} restante${eff.playerShellSmashTurns !== 1 ? 's' : ''})`)
    } else {
      messages.push(`🔱 Shell Smash expirou.`)
    }
  }

  // ── Aqua Ring: cura passiva a cada 2 turnos ────────────────────────────────
  if (eff.playerAquaRingActive) {
    eff.playerAquaRingHealIn--
    if (eff.playerAquaRingHealIn <= 0) {
      playerHeartsGained = 1
      eff.playerAquaRingHealIn = 2
      messages.push(`💧 Aqua Ring! +1 ♥`)
    }
  }

  // ── Player status ──────────────────────────────────────────────────────────
  if (eff.playerStatus) {
    const { condition, turnsLeft } = eff.playerStatus
    if (condition === 'poison' || condition === 'burn') {
      playerHeartsLost = 0.5
      messages.push(condition === 'burn'
        ? `🔥 ${pf.pokemon.name} está queimado — −0.5 ♥`
        : `☠️ ${pf.pokemon.name} está envenenado — −0.5 ♥`)
    } else if (condition === 'sleep') {
      if (turnsLeft > 0) {
        // 45% de acordar cedo (só verificado quando há mais de 1 turno restante)
        if (turnsLeft > 1 && Math.random() < 0.45) {
          eff.playerStatus = null
          messages.push(`😴 ${pf.pokemon.name} acordou cedo! Pode agir no próximo turno.`)
        } else {
          const newTurns = turnsLeft - 1
          eff.playerStatus = newTurns > 0 ? { condition, turnsLeft: newTurns } : null
          if (eff.playerStatus === null) messages.push(`😴 ${pf.pokemon.name} acordou!`)
          else messages.push(`😴 ${pf.pokemon.name} está dormindo — turno nulo!`)
        }
        playerSkipsTurn = true   // sempre perde este turno, mesmo se acordar agora
      } else {
        // turnsLeft === 0 (legado -1 ou expirado): acorda
        eff.playerStatus = null
        messages.push(`😴 ${pf.pokemon.name} acordou!`)
      }
    } else if (condition === 'freeze') {
      if (Math.random() < 0.20) {
        eff.playerStatus = null
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
  if (eff.playerTiredTurns > 0) {
    eff.playerTiredTurns--
    playerForcedRps = 'rock'
    messages.push(eff.playerTiredTurns > 0
      ? `💤 ${pf.pokemon.name} está exausto — perdeu o turno! (${eff.playerTiredTurns} turno${eff.playerTiredTurns !== 1 ? 's' : ''} restante${eff.playerTiredTurns !== 1 ? 's' : ''})`
      : `💤 ${pf.pokemon.name} está exausto — perdeu o turno!`)
  }

  // ── Enemy status ───────────────────────────────────────────────────────────
  if (eff.enemyStatus) {
    const { condition, turnsLeft } = eff.enemyStatus
    if (condition === 'poison' || condition === 'burn') {
      enemyHeartsLost = 0.5
    } else if (condition === 'sleep') {
      if (turnsLeft > 0) {
        if (turnsLeft > 1 && Math.random() < 0.45) {
          eff.enemyStatus = null
          enemyAutoLose = true  // ainda perde este turno mas acorda
          messages.push(`😴 ${ef.pokemon.name} acordou cedo!`)
        } else {
          const newTurns = turnsLeft - 1
          eff.enemyStatus = newTurns > 0 ? { condition, turnsLeft: newTurns } : null
          enemyAutoLose = true
        }
      } else {
        eff.enemyStatus = null
        messages.push(`😴 ${ef.pokemon.name} acordou!`)
      }
    } else if (condition === 'freeze') {
      if (Math.random() < 0.20) {
        eff.enemyStatus = null
        messages.push(`🧊 ${ef.pokemon.name} descongelou espontaneamente!`)
      } else {
        enemyAutoLose = true
      }
    } else if (condition === 'paralysis') {
      if (Math.random() < 0.40) enemyForcedRps = 'rock'
    }
  }

  // ── Enemy tired ────────────────────────────────────────────────────────────
  if (eff.enemyTiredTurns > 0) {
    eff.enemyTiredTurns--
    enemyForcedRps = 'rock'
  }

  // ── Enemy forced (Hurricane / Glare) ──────────────────────────────────────
  if (!enemyForcedRps && eff.enemyForcedMove && eff.enemyForcedTurnsLeft > 0) {
    enemyForcedRps = eff.enemyForcedMove
    eff.enemyForcedTurnsLeft--
    if (eff.enemyForcedTurnsLeft === 0) eff.enemyForcedMove = null
  }

  // ── Hold item passives ───────────────────────────────────────────────────────
  const item = pf.pokemon.heldItem
  if (item) {
    const def = HELD_ITEMS[item.id]

    // Leftovers: +0.5♥ every 3 turns
    if (item.id === 'leftovers') {
      eff.playerLeftoversTick++
      if (eff.playerLeftoversTick >= 3) {
        eff.playerLeftoversTick = 0
        playerHeartsGained = Math.max(playerHeartsGained, 0.5)
        messages.push(`🍃 ${item.name}! +0.5 ♥`)
      }
    }

    // Sitrus Berry: ≤2♥ → +1♥ (once)
    if (item.id === 'sitrus-berry' && !eff.playerSitrusUsed && pf.hearts <= 2) {
      eff.playerSitrusUsed = true
      playerHeartsGained = Math.max(playerHeartsGained, 1)
      messages.push(`🍓 ${item.name}! +1 ♥`)
    }

    // Oran Berry: ≤1♥ → +0.5♥ (once)
    if (item.id === 'oran-berry' && !eff.playerOranUsed && pf.hearts <= 1) {
      eff.playerOranUsed = true
      playerHeartsGained = Math.max(playerHeartsGained, 0.5)
      messages.push(`🫐 ${item.name}! +0.5 ♥`)
    }

    // Lum Berry: auto-cure first status (once) — checked here if already afflicted at turn start
    if (item.id === 'lum-berry' && !eff.playerLumUsed && eff.playerStatus) {
      eff.playerLumUsed = true
      eff.playerStatus = null
      playerForcedRps = null   // remove any forced move from status
      playerSkipsTurn = false  // berry cures before the turn is lost
      messages.push(`🍋 ${item.name}! Status curado!`)
    }

    void def  // suppress unused warning — def used implicitly via item.id checks
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
  side: 'player' | 'enemy',
  effects: BattleEffects,
  opponentPokemon: PokemonCard,
  selfPokemon?: PokemonCard,
): SlotSideEffect {
  const eff = { ...effects }
  let message: string | null = null
  let isProtect = false

  // ── Rapid Spin: clears player-side hazards when player wins ─────────────────
  if (move.special === 'rapid-spin') {
    if (side === 'player') {
      eff.playerHazards = { stealthRock: false, toxicSpikes: false, stickyWeb: false }
      message = `🌀 Rapid Spin! Armadilhas removidas do seu campo!`
    }
    return { effects: eff, message, isProtect }
  }

  // ── Hazard-setting moves ─────────────────────────────────────────────────────
  if (move.special === 'stealth-rock' || move.special === 'toxic-spikes' || move.special === 'sticky-web') {
    if (side === 'player') {
      // Player sets hazard on enemy side
      eff.enemyHazards = {
        ...eff.enemyHazards,
        stealthRock: move.special === 'stealth-rock' ? true : eff.enemyHazards.stealthRock,
        toxicSpikes: move.special === 'toxic-spikes' ? true : eff.enemyHazards.toxicSpikes,
        stickyWeb:   move.special === 'sticky-web'   ? true : eff.enemyHazards.stickyWeb,
      }
      const labels: Record<string, string> = {
        'stealth-rock': '🪨 Stealth Rock no campo inimigo!',
        'toxic-spikes': '☠️ Toxic Spikes no campo inimigo!',
        'sticky-web':   '🕸️ Sticky Web no campo inimigo!',
      }
      message = labels[move.special]
    } else {
      // Enemy sets hazard on player side
      eff.playerHazards = {
        ...eff.playerHazards,
        stealthRock: move.special === 'stealth-rock' ? true : eff.playerHazards.stealthRock,
        toxicSpikes: move.special === 'toxic-spikes' ? true : eff.playerHazards.toxicSpikes,
        stickyWeb:   move.special === 'sticky-web'   ? true : eff.playerHazards.stickyWeb,
      }
      const labels: Record<string, string> = {
        'stealth-rock': '🪨 Stealth Rock no seu campo!',
        'toxic-spikes': '☠️ Toxic Spikes no seu campo!',
        'sticky-web':   '🕸️ Sticky Web no seu campo!',
      }
      message = labels[move.special]
    }
    return { effects: eff, message, isProtect }
  }

  // ── White Herb: cancel first defense debuff ──────────────────────────────────
  if (
    move.kind === 'buff' && move.buffEffect &&
    move.buffEffect.stat === 'defense' && move.buffEffect.delta < 0
  ) {
    const affectedPokemon = move.buffEffect.target === 'opponent' ? (side === 'player' ? undefined : selfPokemon) : undefined
    // If player's pokemon has White Herb and hasn't used it, cancel the debuff
    if (
      side === 'enemy' && move.buffEffect.target === 'opponent' &&
      selfPokemon?.heldItem?.id === 'white-herb' && !eff.playerWhiteHerbUsed
    ) {
      eff.playerWhiteHerbUsed = true
      message = `🌿 Erva Branca! Debuff de defesa cancelado!`
      return { effects: eff, message, isProtect }
    }
    void affectedPokemon
  }

  if (move.special === 'protect') {
    isProtect = true
    if (side === 'player') eff.playerProtectCooldown = true
    message = `🛡️ ${move.name}: ${side === 'player' ? 'Você está protegido' : 'Inimigo se protegeu'} este turno!`
    return { effects: eff, message, isProtect }
  }

  if (move.kind === 'status' && move.statusEffect) {
    const icons: Record<StatusCondition, string> = { poison: '☠️', paralysis: '⚡', sleep: '😴', freeze: '🧊', burn: '🔥' }
    if (side === 'player' && opponentPokemon) {
      if (isImmuneToStatus(move.statusEffect, opponentPokemon.type1, opponentPokemon.type2)) {
        message = `${move.name}: inimigo é imune a ${move.statusEffect}!`
      } else if (eff.enemyStatus) {
        message = `${move.name}: inimigo já tem um status!`
      } else {
        const turns = move.statusEffect === 'sleep' ? 2 : -1
        eff.enemyStatus = { condition: move.statusEffect, turnsLeft: turns }
        message = `${icons[move.statusEffect]} ${move.name}: ${move.statusEffect} aplicado ao inimigo!`
      }
    } else if (side === 'enemy' && opponentPokemon) {
      if (isImmuneToStatus(move.statusEffect, opponentPokemon.type1, opponentPokemon.type2)) {
        message = `${move.name}: seu Pokémon é imune a ${move.statusEffect}!`
      } else if (eff.playerStatus) {
        message = `${move.name}: seu Pokémon já tem um status!`
      } else {
        const turns = move.statusEffect === 'sleep' ? 2 : -1
        eff.playerStatus = { condition: move.statusEffect, turnsLeft: turns }
        message = `${icons[move.statusEffect]} ${move.name}: ${move.statusEffect} aplicado ao seu Pokémon!`
      }
    }
    return { effects: eff, message, isProtect }
  }

  if (move.kind === 'buff' && move.buffEffect) {
    const { stat, delta, target } = move.buffEffect
    const affectsSelf = target === 'self'
    const icons: Record<string, string> = {
      'attack+1': '⬆️ Ataque', 'attack-1': '⬇️ Ataque', 'defense+1': '⬆️ Defesa', 'defense-1': '⬇️ Defesa',
    }
    const label = icons[`${stat}${delta > 0 ? '+1' : '-1'}`] ?? `${stat} ${delta > 0 ? '+1' : '-1'}`

    if (stat === 'attack') {
      if (side === 'player') {
        if (affectsSelf) { eff.playerAttackMod = clampMod(eff.playerAttackMod + delta); message = `${label}! Seu próximo ataque +${delta}.` }
        else             { eff.enemyAttackMod  = clampMod(eff.enemyAttackMod  + delta); message = `${move.name}: ${label} inimigo!` }
      } else {
        if (affectsSelf) { eff.enemyAttackMod  = clampMod(eff.enemyAttackMod  + delta) }
        else             { eff.playerAttackMod = clampMod(eff.playerAttackMod + delta); message = `${move.name}: ${label} do jogador!` }
      }
    } else {
      if (side === 'player') {
        if (affectsSelf) { eff.playerDefenseMod = clampMod(eff.playerDefenseMod + delta); message = `${move.name}: ${label}! Sua próxima defesa +${delta}.` }
        else             { eff.enemyDefenseMod  = clampMod(eff.enemyDefenseMod  + delta); message = `${move.name}: ${label} inimigo!` }
      } else {
        if (affectsSelf) { eff.enemyDefenseMod  = clampMod(eff.enemyDefenseMod  + delta) }
        else             { eff.playerDefenseMod = clampMod(eff.playerDefenseMod + delta) }
      }
    }
    return { effects: eff, message, isProtect }
  }

  return { effects: eff, message: null, isProtect }
}

function clampMod(v: number): number { return Math.max(-1, Math.min(1, v)) }

// ─── Thaw on Fire hit ─────────────────────────────────────────────────────────

export function applyThaw(
  effects: BattleEffects,
  side: 'player' | 'enemy',
  attackType: PokemonType,
): { effects: BattleEffects; thawed: boolean } {
  if (attackType !== 'Fire') return { effects, thawed: false }
  const eff = { ...effects }
  if (side === 'player' && eff.playerStatus?.condition === 'freeze') {
    eff.playerStatus = null; return { effects: eff, thawed: true }
  }
  if (side === 'enemy' && eff.enemyStatus?.condition === 'freeze') {
    eff.enemyStatus = null; return { effects: eff, thawed: true }
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
  playerAttackBuff: number    // +N temporário a playerAttackMod (0 = nenhum)
  playerDefenseBuff: number   // +N temporário a playerDefenseMod (0 = nenhum)
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

  // Shared helper: apply status to enemy (turns: 2 = padrão probabilístico; 1 = 1 turno garantido)
  function tryApplyStatus(cond: StatusCondition, turns = 2) {
    if (isImmuneToStatus(cond, defType1, defType2) || effects.enemyStatus) return
    res.enemyStatus = { condition: cond, turnsLeft: turns }
  }

  switch (unique.kind) {
    // ── Heal ───────────────────────────────────────────────────────────────────
    case 'heal': {
      if (unique.special === 'dream-eater') {
        if (effects.enemyStatus?.condition === 'sleep') {
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
          const turns = 1  // Rest / moves com selfStatus: exatamente 1 turno garantido
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
        // Glitch Beam: KO without tiredness
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

      // Status on hit (Spore: 1 turno garantido; demais: 2 turnos probabilísticos)
      if (unique.applyEnemyStatus && !effects.enemyStatus) {
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
          // Generic super: baseDmg with optional crit, drain, recoil
          let dmg = baseDmg
          const scopeBoost = attacker.pokemon.heldItem?.id === 'scope-lens' ? 0.25 : 0
          const effectiveCrit = (unique.critChance ?? 0) + scopeBoost
          if (effectiveCrit && Math.random() < effectiveCrit) {
            dmg = 2
            res.messages.push(`⚔️ ${name}: crítico! 2 dano!`)
          } else {
            // type-effective if no fixed damage
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
      // Apply cooldown and recoil/drain for non-default cases
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
  side: 'player' | 'enemy',
  effects: BattleEffects,
): { newEffects: BattleEffects; message: string | null; hazardDamage: number; forcedFirstMove: RPS | null } {
  const eff = { ...effects }
  const messages: string[] = []
  let hazardDamage = 0
  let forcedFirstMove: RPS | null = null

  if (pokemon.ability.name === 'Intimidate') {
    if (side === 'player') {
      eff.enemyAttackMod = clampMod(eff.enemyAttackMod - 1)
      messages.push(`😤 Intimidate! ${pokemon.name} entrou e reduziu o próximo ataque inimigo!`)
    } else {
      eff.playerAttackMod = clampMod(eff.playerAttackMod - 1)
      messages.push(`😤 Intimidate! ${pokemon.name} entrou e reduziu seu próximo ataque!`)
    }
  }

  // Clear tired/protect cooldown on switch
  if (side === 'player') eff.playerProtectCooldown = false

  // ── Hold item orbs (apply status on entry) ───────────────────────────────────
  if (side === 'player' && pokemon.heldItem) {
    if (pokemon.heldItem.id === 'toxic-orb' && !eff.playerStatus &&
        !isImmuneToStatus('poison', pokemon.type1, pokemon.type2)) {
      eff.playerStatus = { condition: 'poison', turnsLeft: -1 }
      messages.push(`☠️ ${pokemon.heldItem.name}! ${pokemon.name} foi envenenado!`)
    }
    if (pokemon.heldItem.id === 'flame-orb' && !eff.playerStatus &&
        !isImmuneToStatus('burn', pokemon.type1, pokemon.type2)) {
      eff.playerStatus = { condition: 'burn', turnsLeft: -1 }
      messages.push(`🔥 ${pokemon.heldItem.name}! ${pokemon.name} foi queimado!`)
    }
  }

  // ── Hazards trigger on entry ─────────────────────────────────────────────────
  const hazards = side === 'player' ? eff.playerHazards : eff.enemyHazards

  // Sticky Web: forces Rock on first turn
  if (hazards.stickyWeb) {
    forcedFirstMove = 'rock'
    messages.push(`🕸️ Sticky Web! ${pokemon.name} está preso — ✊ forçado no 1º turno!`)
  }

  // Stealth Rock: damage on entry (type multiplier based on Rock effectiveness)
  if (hazards.stealthRock) {
    const mult = getCombinedMultiplier('Rock', pokemon.type1, pokemon.type2)
    if (mult === 0) {
      // immune to Rock — no damage
    } else {
      const srDmg = mult >= 2 ? 1 : mult <= 0.5 ? 0.25 : 0.5
      hazardDamage += srDmg
      messages.push(`🪨 Stealth Rock! ${pokemon.name} sofreu ${srDmg} dano ao entrar!`)
    }
  }

  // Toxic Spikes: apply poison on entry (Poison types absorb and remove)
  if (hazards.toxicSpikes) {
    if (pokemon.type1 === 'Poison' || pokemon.type2 === 'Poison') {
      // Poison type absorbs — remove the hazard
      if (side === 'player') {
        eff.playerHazards = { ...eff.playerHazards, toxicSpikes: false }
      } else {
        eff.enemyHazards = { ...eff.enemyHazards, toxicSpikes: false }
      }
      messages.push(`☠️ ${pokemon.name} (Venenoso) absorveu as Toxic Spikes!`)
    } else if (side === 'player' && !eff.playerStatus &&
               !isImmuneToStatus('poison', pokemon.type1, pokemon.type2)) {
      eff.playerStatus = { condition: 'poison', turnsLeft: -1 }
      messages.push(`☠️ Toxic Spikes! ${pokemon.name} foi envenenado ao entrar!`)
    } else if (side === 'enemy' && !eff.enemyStatus &&
               !isImmuneToStatus('poison', pokemon.type1, pokemon.type2)) {
      eff.enemyStatus = { condition: 'poison', turnsLeft: -1 }
      messages.push(`☠️ Toxic Spikes! ${pokemon.name} foi envenenado ao entrar!`)
    }
  }

  // Reset item ticks when new pokemon enters (sash NOT reset — it's one use per battle)
  if (side === 'player') {
    eff.playerLeftoversTick = 0
    eff.playerSitrusUsed = false
    eff.playerOranUsed = false
    eff.playerLumUsed = false
    eff.playerWhiteHerbUsed = false
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

// ─── Rapid Spin hazard clear ─────────────────────────────────────────────────
// Call when player uses Rapid Spin. Clears player-side hazards.
export function applyRapidSpin(effects: BattleEffects): BattleEffects {
  return { ...effects, playerHazards: { stealthRock: false, toxicSpikes: false, stickyWeb: false } }
}
