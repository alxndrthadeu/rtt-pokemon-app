import type { PokemonCard, PokemonType, RPS } from '@/types'
import { getCombinedMultiplier, damageFromMultiplier } from '@/lib/data/typeChart'

// ─── State de efeitos ativos em batalha ───────────────────────────────────────

export interface BattleEffects {
  flashFireActive: boolean      // jogador absorveu Fire; próximos ataques Fire +1
  enemyAttackReduced: boolean   // Intimidate do jogador: próximo ataque inimigo -1
  playerAttackReduced: boolean  // Intimidate do inimigo: próximo ataque do jogador -1
  enemyForcedMove: RPS | null   // Hurricane/Glare: força o inimigo a usar este RPS
  enemyForcedTurnsLeft: number
  enemySleepTurnsLeft: number   // Lovely Kiss: inimigo usa ✊ automaticamente
  playerSleepTurnsLeft: number  // Rest: jogador dorme
  uniqueCooldown: boolean       // Hydro Cannon/Rock Wrecker: não pode usar único no próx. turno
  uniqueSkipThisTurn: boolean   // Hyper Beam/Rock Wrecker/Rest: ignora input, usa ✊
}

export const DEFAULT_EFFECTS: BattleEffects = {
  flashFireActive: false,
  enemyAttackReduced: false,
  playerAttackReduced: false,
  enemyForcedMove: null,
  enemyForcedTurnsLeft: 0,
  enemySleepTurnsLeft: 0,
  playerSleepTurnsLeft: 0,
  uniqueCooldown: false,
  uniqueSkipThisTurn: false,
}

export interface Fighter {
  pokemon: PokemonCard
  hearts: number
}

// ─── Resultado de um ataque único ─────────────────────────────────────────────

export interface UniqueResult {
  damage: number
  multiplier: number
  message: string
  cooldown?: boolean       // Não pode usar único no próximo turno
  skipNext?: boolean       // Pula a entrada do jogador no próximo turno (usa ✊)
  forceEnemyMove?: RPS    // Força inimigo a usar este RPS pelos próximos forceTurns
  forceTurns?: number
  enemySleep?: number      // Inimigo dorme N turnos
  healPlayer?: number      // Cura o jogador N corações (999 = cura total)
  playerSleep?: number     // Jogador dorme N turnos
  recoil?: number          // Dano de recuo ao jogador
}

// ─── Cálculo de ataque único ──────────────────────────────────────────────────

export function calcUniqueDamage(
  moveName: string,
  uniqueType: PokemonType,
  _attacker: Fighter,
  defender: Fighter,
  floor: number,
  enemyMove: RPS,
): UniqueResult {
  const defType1 = defender.pokemon.type1
  const defType2 = defender.pokemon.type2

  switch (moveName) {
    // ── Ataques fixos de 2 dano (ignoram resistências) ──────────────────────
    case 'Dragon Rage':
      return { damage: 2, multiplier: 2, message: '2 de dano fixo — Raiva Dracônica!' }
    case 'Inferno':
      return { damage: 2, multiplier: 2, message: '2 de dano — ignora resistências!' }
    case 'Thunder':
      return { damage: 2, multiplier: 2, message: '2 de dano — ignora resistências!' }
    case 'Lava Plume':
      return { damage: 2, multiplier: 2, message: '2 de dano de Fogo!' }

    // ── Hydro Cannon — 2 dano, cooldown ─────────────────────────────────────
    case 'Hydro Cannon':
      return { damage: 2, multiplier: 2, message: '2 de dano! Recarrega no próximo turno.', cooldown: true }

    // ── Hyper Beam / Rock Wrecker — 2 dano + skip ───────────────────────────
    case 'Hyper Beam':
      return { damage: 2, multiplier: 2, message: '2 de dano! Sem ação no próximo turno.', skipNext: true }
    case 'Rock Wrecker':
      return { damage: 2, multiplier: 2, message: '2 de dano! Sem ação no próximo turno.', skipNext: true }
    case 'Outrage':
      return { damage: 2, multiplier: 2, message: '2 de dano de Dragão em fúria!', skipNext: true }
    case 'Thrash':
      return { damage: 2, multiplier: 2, message: '2 de dano! Repetirá o mesmo Jokenpô.', skipNext: false, forceEnemyMove: undefined }

    // ── Flare Blitz — 2 dano + recuo ────────────────────────────────────────
    case 'Flare Blitz':
      return { damage: 2, multiplier: 2, message: '2 de dano! 1 de recuo ao atacante.', recoil: 1 }

    // ── Slash — 50% crítico ──────────────────────────────────────────────────
    case 'Slash': {
      const crit = Math.random() < 0.5
      return {
        damage: crit ? 2 : 1,
        multiplier: crit ? 2 : 1,
        message: crit ? '⚔️ Crítico! 2 de dano!' : '1 de dano (sem crítico).',
      }
    }

    // ── Super Fang — reduz à metade ──────────────────────────────────────────
    case 'Super Fang': {
      const half = Math.max(1, Math.ceil(defender.hearts / 2))
      return { damage: half, multiplier: 1, message: `Reduz à metade! −${half} ♥` }
    }

    // ── Soft-Boiled — cura em vez de atacar ──────────────────────────────────
    case 'Soft-Boiled':
      return { damage: 0, multiplier: 0, message: 'Recupera 2 ♥ em vez de atacar!', healPlayer: 2 }

    // ── Seismic Toss — dano = andar ──────────────────────────────────────────
    case 'Seismic Toss': {
      const tossDmg = Math.max(1, Math.min(floor + 1, 3))
      return { damage: tossDmg, multiplier: 1, message: `${tossDmg} de dano (Andar ${floor + 1})!` }
    }

    // ── Sky Attack — 2 dano (3 vs Grama/Bug) ─────────────────────────────────
    case 'Sky Attack': {
      const boosted = [defType1, defType2].some(t => t === 'Grass' || t === 'Bug')
      return { damage: boosted ? 3 : 2, multiplier: boosted ? 3 : 2, message: boosted ? '3 de dano! Super contra Grama/Bug!' : '2 de dano!' }
    }

    // ── Petal Dance — 3 pétalas = 3 dano ────────────────────────────────────
    case 'Petal Dance':
      return { damage: 3, multiplier: 2, message: '3 pétalas! 3 de dano de Grama!' }

    // ── Psystrike — 2 dano, ignora habilidades ───────────────────────────────
    case 'Psystrike':
      return { damage: 2, multiplier: 2, message: '2 de dano — ignora habilidades e status!' }

    // ── Sheer Cold — KO em tipos fracos ──────────────────────────────────────
    case 'Sheer Cold': {
      const vulnerable = ['Water', 'Grass', 'Flying', 'Dragon'].some(t => t === defType1 || t === defType2)
      return vulnerable
        ? { damage: defender.hearts, multiplier: 4, message: 'KO instantâneo!' }
        : { damage: 1, multiplier: 1, message: '1 de dano (sem efeito completo).' }
    }

    // ── Megahorn — 3 dano vs Psíquico/Escuro ─────────────────────────────────
    case 'Megahorn': {
      const boostedMega = [defType1, defType2].some(t => t === 'Psychic')
      return { damage: boostedMega ? 3 : 2, multiplier: boostedMega ? 3 : 2, message: boostedMega ? '3 de dano contra Psíquico!' : '2 de dano!' }
    }

    // ── Glitch Beam — KO imediato ─────────────────────────────────────────────
    case 'Glitch Beam':
      return { damage: defender.hearts, multiplier: 4, message: '???: KO instantâneo!' }

    // ── Hurricane — força inimigo a repetir Jokenpô ───────────────────────────
    case 'Hurricane':
      return { damage: 1, multiplier: 1, message: 'Confusão! Inimigo repete o mesmo Jokenpô!', forceEnemyMove: enemyMove, forceTurns: 1 }

    // ── Glare — força repetição por 2 turnos ──────────────────────────────────
    case 'Glare':
      return { damage: 0, multiplier: 0, message: 'Paralisia! Inimigo repete Jokenpô por 2 turnos.', forceEnemyMove: enemyMove, forceTurns: 2 }

    // ── Lovely Kiss — inimigo dorme ───────────────────────────────────────────
    case 'Lovely Kiss':
      return { damage: 1, multiplier: 1, message: 'Inimigo dorme por 2 turnos! ✊ automático.', enemySleep: 2 }

    // ── Rest — cura total, jogador dorme ─────────────────────────────────────
    case 'Rest':
      return { damage: 0, multiplier: 0, message: 'Recupera ♥♥♥ e dorme por 2 turnos.', healPlayer: 999, playerSleep: 2 }

    // ── Rock Slide — 30% força inimigo a usar ✊ ─────────────────────────────
    case 'Rock Slide': {
      const frightened = Math.random() < 0.3
      return frightened
        ? { damage: 1, multiplier: 1, message: 'Pedradas! Inimigo aterrorizado usa ✊ próximo turno.', forceEnemyMove: 'rock', forceTurns: 1 }
        : { damage: 1, multiplier: 1, message: '1 de dano de Pedra.' }
    }

    // ── Ancient Power — 20% de buff ──────────────────────────────────────────
    case 'Ancient Power': {
      const buffed = Math.random() < 0.2
      // Can't easily buff all attacks, so simplify: treat as 2 damage on buff trigger
      return { damage: buffed ? 2 : 1, multiplier: buffed ? 2 : 1, message: buffed ? 'Poder Ancestral! Boost ativado! 2 de dano.' : '1 de dano de Pedra.' }
    }

    // ── Aqua Ring — cura passiva (tratada no início do turno fora desta fn) ──
    case 'Aqua Ring':
      return { damage: 0, multiplier: 0, message: 'Aqua Ring ativado! Cura 1 ♥ a cada 2 turnos.', healPlayer: 0 }

    // ── Parental Bond — 2 dano (dois golpes) ──────────────────────────────────
    case 'Parental Bond':
      return { damage: 2, multiplier: 1, message: 'Dois golpes! 2 de dano total.' }

    // ── Volt Tackle — ignora imunidade Ground, super efetivo vs Ground/Rock ────
    case 'Volt Tackle': {
      const superEff = [defType1, defType2].some(t => t === 'Ground' || t === 'Rock')
      return {
        damage: superEff ? 2 : 1,
        multiplier: superEff ? 2 : 1,
        message: superEff
          ? '⚡ Super efetivo! 2 de dano — ignora imunidade elétrica!'
          : '1 de dano elétrico!',
      }
    }

    // ── Mach Punch / Aqua Jet / Pin Missile — agora unique sempre vence, dano normal ──
    case 'Mach Punch':
    case 'Aqua Jet':
    case 'Pin Missile': {
      const mult = getCombinedMultiplier(uniqueType, defType1, defType2)
      return { damage: damageFromMultiplier(1, mult), multiplier: mult, message: '1 de dano tipo-efetivo!' }
    }

    // ── Padrão: use type effectiveness ───────────────────────────────────────
    default: {
      const mult = getCombinedMultiplier(uniqueType, defType1, defType2)
      const dmg = damageFromMultiplier(1, mult)
      return { damage: dmg, multiplier: mult, message: `${dmg} de dano.` }
    }
  }
}

// ─── Aplica Intimidate ao entrar em campo ─────────────────────────────────────

export function applyEntryEffects(
  pokemon: PokemonCard,
  side: 'player' | 'enemy',
  effects: BattleEffects,
): { newEffects: BattleEffects; message: string | null } {
  const eff = { ...effects }
  let message: string | null = null

  if (pokemon.ability.name === 'Intimidate') {
    if (side === 'player') {
      eff.enemyAttackReduced = true
      message = `😤 Intimidate! ${pokemon.name} entrou e reduziu o próximo ataque inimigo!`
    } else {
      eff.playerAttackReduced = true
      message = `😤 Intimidate! ${pokemon.name} entrou e reduziu seu próximo ataque!`
    }
  }

  return { newEffects: eff, message }
}
