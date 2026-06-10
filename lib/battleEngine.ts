import type { PokemonCard, PokemonType, RPS, StatusCondition, UniqueMove, Move } from '@/types'
import { getCombinedMultiplier, damageFromMultiplier } from '@/lib/data/typeChart'

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
  // Protect: scissors slot blocks damage this turn even when losing
  playerProtectCooldown: boolean  // protect unavailable next turn
  // Unique state
  uniqueCooldown: boolean         // unique unavailable next turn (Hydro Cannon)
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
  uniqueCooldown: false,
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
  messages: string[]
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
  let playerHeartsLost = 0
  let enemyHeartsLost = 0

  // ── Player status ──────────────────────────────────────────────────────────
  if (eff.playerStatus) {
    const { condition, turnsLeft } = eff.playerStatus
    if (condition === 'poison' || condition === 'burn') {
      playerHeartsLost = 0.5
      messages.push(condition === 'burn'
        ? `🔥 ${pf.pokemon.name} está queimado — −0.5 ♥`
        : `☠️ ${pf.pokemon.name} está envenenado — −0.5 ♥`)
    } else if (condition === 'sleep') {
      if (turnsLeft <= 0) {
        eff.playerStatus = null
        messages.push(`😴 ${pf.pokemon.name} acordou!`)
      } else {
        eff.playerStatus = { condition, turnsLeft: turnsLeft - 1 }
        playerForcedRps = 'rock'
        messages.push(`😴 ${pf.pokemon.name} está dormindo — perdeu o turno!`)
      }
    } else if (condition === 'freeze') {
      playerForcedRps = 'rock'
      messages.push(`🧊 ${pf.pokemon.name} está congelado — perdeu o turno!`)
    } else if (condition === 'paralysis') {
      if (Math.random() < 0.30) {
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
      if (turnsLeft <= 0) {
        eff.enemyStatus = null
        messages.push(`😴 ${ef.pokemon.name} acordou!`)
      } else {
        eff.enemyStatus = { condition, turnsLeft: turnsLeft - 1 }
        enemyForcedRps = 'rock'
      }
    } else if (condition === 'freeze') {
      enemyForcedRps = 'rock'
    } else if (condition === 'paralysis') {
      if (Math.random() < 0.30) enemyForcedRps = 'rock'
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

  return { effects: eff, playerForcedRps, enemyForcedRps, playerHeartsLost, enemyHeartsLost, messages }
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
): SlotSideEffect {
  const eff = { ...effects }
  let message: string | null = null
  let isProtect = false

  if (move.special === 'protect') {
    isProtect = true
    if (side === 'player') eff.playerProtectCooldown = true
    message = `🛡️ ${move.name}: ${side === 'player' ? 'Você está protegido' : 'Inimigo se protegeu'} este turno!`
    return { effects: eff, message, isProtect }
  }

  if (move.kind === 'status' && move.statusEffect) {
    const target = side === 'player' ? opponentPokemon : undefined
    if (side === 'player' && target) {
      if (isImmuneToStatus(move.statusEffect, target.type1, target.type2)) {
        message = `${move.name}: inimigo é imune a ${move.statusEffect}!`
      } else if (eff.enemyStatus) {
        message = `${move.name}: inimigo já tem um status!`
      } else {
        const turns = move.statusEffect === 'sleep'
          ? Math.floor(Math.random() * 3) + 1
          : -1
        eff.enemyStatus = { condition: move.statusEffect, turnsLeft: turns }
        const icons: Record<StatusCondition, string> = { poison: '☠️', paralysis: '⚡', sleep: '😴', freeze: '🧊', burn: '🔥' }
        message = `${icons[move.statusEffect]} ${move.name}: ${move.statusEffect} aplicado ao inimigo!`
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

  // Glitch: instant KO
  if (abilityName === 'Glitch') {
    messages.push('⚠️ GLITCH! KO instantâneo!')
    return { damage: defenderPokemon.hearts, multiplier: 4, messages }
  }

  let mult = getCombinedMultiplier(attackType, defenderPokemon.type1, defenderPokemon.type2)
  let dmg = damageFromMultiplier(1, mult)

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
  messages: string[]
}

const EMPTY_UNIQUE_RESULT: UniqueResult = {
  damage: 0, healPlayer: 0, recoil: 0, benchDamage: 0,
  enemyStatus: null, playerStatus: null,
  enemyForcedMove: null, forceTurns: 0,
  playerTiredTurns: 0, userFaints: false, cooldown: false,
  drainHearts: 0, messages: [],
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

  // Shared helper: apply status to enemy
  function tryApplyStatus(cond: StatusCondition) {
    if (isImmuneToStatus(cond, defType1, defType2) || effects.enemyStatus) return
    const turns = cond === 'sleep' ? Math.floor(Math.random() * 3) + 1 : -1
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
      } else {
        const amount = unique.healAmount ?? 3
        res.healPlayer = amount
        if (unique.selfStatus) {
          const turns = unique.selfStatus === 'sleep' ? 1 : -1
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

      // Status on hit
      if (unique.applyEnemyStatus && !effects.enemyStatus) tryApplyStatus(unique.applyEnemyStatus)

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
          res.messages.push(`🔱 ${name}: ${baseDmg} dano + ${picked}!`)
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
          res.messages.push(`🗿 ${name}: ${res.damage} dano!${buffed ? ' Poder ancestral ativado!' : ''}`)
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

        case 'shell-smash':
        case 'acid-armor':
        case 'barrier':
        case 'quiver-dance':
          // Unique buff moves: apply +1 attack or defense for this battle turn
          res.damage = 0
          res.messages.push(`✨ ${name} ativado!`)
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

        case 'perish-song':
        case 'destiny-bond':
        case 'imposter':
          res.damage = 0
          res.messages.push(`✨ ${name} ativado!`)
          break

        default: {
          // Generic super: baseDmg with optional crit, drain, recoil
          let dmg = baseDmg
          if (unique.critChance && Math.random() < unique.critChance) {
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
): { newEffects: BattleEffects; message: string | null } {
  const eff = { ...effects }
  let message: string | null = null

  if (pokemon.ability.name === 'Intimidate') {
    if (side === 'player') {
      eff.enemyAttackMod = clampMod(eff.enemyAttackMod - 1)
      message = `😤 Intimidate! ${pokemon.name} entrou e reduziu o próximo ataque inimigo!`
    } else {
      eff.playerAttackMod = clampMod(eff.playerAttackMod - 1)
      message = `😤 Intimidate! ${pokemon.name} entrou e reduziu seu próximo ataque!`
    }
  }

  // Clear tired/protect cooldown on switch
  if (side === 'player') eff.playerProtectCooldown = false

  return { newEffects: eff, message }
}
