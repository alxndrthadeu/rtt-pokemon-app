'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { GYM_LEADERS } from '@/lib/data/gyms'
import { getTypeColor, getTypeTextColor, getSpriteUrl, RPS_ICON } from '@/lib/typeColors'
import {
  BattleEffects, DEFAULT_EFFECTS, Fighter,
  processTurnStart, calcUniqueResult, calcSlotDamage, applySlotMoveEffect,
  applySturdy, applyThaw, applyEntryEffects,
  StatusState,
} from '@/lib/battleEngine'
import type { PokemonCard, RPS, AILevel, StatusCondition } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveRPS(player: RPS, enemy: RPS): 'player_wins' | 'enemy_wins' | 'tie' {
  if (player === enemy) return 'tie'
  if (
    (player === 'rock' && enemy === 'scissors') ||
    (player === 'paper' && enemy === 'rock') ||
    (player === 'scissors' && enemy === 'paper')
  ) return 'player_wins'
  return 'enemy_wins'
}

const BEATS: Record<RPS, RPS> = { rock: 'paper', paper: 'scissors', scissors: 'rock' }
const ALL_RPS: RPS[] = ['rock', 'paper', 'scissors']

function generateAIMove(level: AILevel, history: RPS[], forcedMove: RPS | null): RPS {
  if (forcedMove) return forcedMove
  if (level === 'random' || history.length === 0) return ALL_RPS[Math.floor(Math.random() * 3)]
  const counts = { rock: 0, paper: 0, scissors: 0 }
  history.forEach(m => { counts[m]++ })
  const mostUsed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as RPS
  const thresholds: Record<AILevel, number> = { random: 0, weighted: 0.55, adaptive: 0.75, predictive: 0.85 }
  const t = thresholds[level]
  if (level === 'predictive' && history.length > 0) {
    const last = history[history.length - 1]
    return Math.random() < t ? BEATS[last] : ALL_RPS[Math.floor(Math.random() * 3)]
  }
  return Math.random() < t ? BEATS[mostUsed] : ALL_RPS[Math.floor(Math.random() * 3)]
}

const RPS_BEATS_LABEL: Record<string, string> = {
  'rock-scissors': 'Pedra esmaga Tesoura',
  'paper-rock': 'Papel envolve Pedra',
  'scissors-paper': 'Tesoura corta Papel',
}
function getBeatLabel(winner: RPS, loser: RPS) {
  return RPS_BEATS_LABEL[`${winner}-${loser}`] ?? `${winner} bate ${loser}`
}

function effectivenessLabel(mult: number): string | null {
  if (mult >= 2)   return '⚡ Super Efetivo!'
  if (mult === 0)  return '🚫 Sem efeito!'
  if (mult <= 0.5) return '↓ Pouco efetivo'
  return null
}

const STATUS_ICON: Record<StatusCondition, string> = {
  poison: '☠️', paralysis: '⚡', sleep: '😴', freeze: '🧊', burn: '🔥',
}
const STATUS_COLOR: Record<StatusCondition, string> = {
  poison: '#8B00B0', paralysis: '#F0D040', sleep: '#6890F0', freeze: '#98D8D8', burn: '#F08030',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type LocalPhase = 'selecting' | 'result' | 'victory' | 'defeat'
type PlayerMove = RPS | 'unique'

interface TurnResult {
  playerMove: PlayerMove
  enemyMove: RPS
  outcome: 'player_wins' | 'enemy_wins' | 'tie'
  playerDmg: number
  enemyDmg: number
  multiplier: number
  activations: string[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeartsDisplay({ total, current, size = 'md' }: { total: number; current: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const full = i < Math.floor(current)
        const half = !full && i === Math.floor(current) && (current % 1) >= 0.5
        return (
          <span key={i} className={`${sizes[size]} leading-none transition-all`}
            style={{ opacity: full ? 1 : half ? 0.5 : 0.15 }}>♥</span>
        )
      })}
    </div>
  )
}

function StatusBadge({ status }: { status: StatusState | null }) {
  if (!status) return null
  const color = STATUS_COLOR[status.condition]
  return (
    <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-white/30 uppercase tracking-wide"
      style={{ backgroundColor: color, color: 'white' }}>
      {STATUS_ICON[status.condition]} {status.condition}
    </span>
  )
}

function EnemyCard({ fighter, status }: { fighter: Fighter; status: StatusState | null }) {
  const tc = getTypeColor(fighter.pokemon.type1)
  return (
    <div className="flex items-center gap-3 border-2 border-ink rounded-2xl overflow-hidden bg-white shadow-neo"
      style={{ opacity: fighter.hearts <= 0 ? 0.4 : 1 }}>
      <div className="w-2 self-stretch shrink-0" style={{ backgroundColor: tc }} />
      <img src={getSpriteUrl(fighter.pokemon.id)} alt={fighter.pokemon.name}
        style={{ width: 72, height: 72, objectFit: 'contain' }} />
      <div className="flex-1 py-3 pr-3">
        <p className="font-black text-sm text-ink uppercase tracking-wide">{fighter.pokemon.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/20"
            style={{ backgroundColor: tc, color: getTypeTextColor(fighter.pokemon.type1) }}>
            {fighter.pokemon.type1}
          </span>
          {fighter.pokemon.type2 && (
            <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/20"
              style={{ backgroundColor: getTypeColor(fighter.pokemon.type2), color: getTypeTextColor(fighter.pokemon.type2) }}>
              {fighter.pokemon.type2}
            </span>
          )}
          <StatusBadge status={status} />
        </div>
        <div className="mt-2"><HeartsDisplay total={fighter.pokemon.hearts} current={fighter.hearts} size="sm" /></div>
      </div>
      {fighter.hearts <= 0 && <span className="font-game text-[7px] text-ink/40 pr-3 uppercase">Nocauteado</span>}
    </div>
  )
}

function PlayerCard({ fighter, status }: { fighter: Fighter; status: StatusState | null }) {
  const [showAbility, setShowAbility] = useState(false)
  const tc = getTypeColor(fighter.pokemon.type1)
  const ability = fighter.pokemon.ability
  return (
    <div className="border-4 border-ink rounded-3xl overflow-hidden bg-white relative"
      style={{ boxShadow: `0 0 0 3px ${tc}, 6px 6px 0 #2C1810` }}>
      <div className="absolute top-3 left-3 z-10 font-game text-[6px] uppercase tracking-widest px-2 py-1 rounded-full border border-ink/20"
        style={{ backgroundColor: tc, color: getTypeTextColor(fighter.pokemon.type1) }}>Seu Pokémon</div>
      <div className="h-3" style={{ backgroundColor: tc }} />
      <div className="flex items-center justify-center bg-white relative" style={{ height: 180 }}>
        <div className="absolute w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: tc }} />
        <img src={getSpriteUrl(fighter.pokemon.id)} alt={fighter.pokemon.name}
          style={{ width: 160, height: 160, objectFit: 'contain', position: 'relative', zIndex: 1 }} />
      </div>
      <div className="relative px-4 py-3 bg-parchment-light border-t-2 border-ink/10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-black text-xl text-ink uppercase tracking-tight">{fighter.pokemon.name}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/20"
                style={{ backgroundColor: tc, color: getTypeTextColor(fighter.pokemon.type1) }}>
                {fighter.pokemon.type1}
              </span>
              {fighter.pokemon.type2 && (
                <span className="font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/20"
                  style={{ backgroundColor: getTypeColor(fighter.pokemon.type2), color: getTypeTextColor(fighter.pokemon.type2) }}>
                  {fighter.pokemon.type2}
                </span>
              )}
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="text-right">
            <p className="font-game text-[7px] text-ink-soft opacity-50 uppercase tracking-wide mb-1">Energia</p>
            <HeartsDisplay total={fighter.pokemon.hearts} current={fighter.hearts} size="lg" />
          </div>
        </div>

        {/* Ability */}
        <div className="flex items-center gap-1.5 bg-white/70 rounded-xl px-3 py-2 border border-ink/10 cursor-help"
          onMouseEnter={() => setShowAbility(true)} onMouseLeave={() => setShowAbility(false)}
          onClick={() => { if (window.matchMedia('(hover: none)').matches) setShowAbility(v => !v) }}>
          <span className="font-game text-[6px] text-ink-soft uppercase tracking-wide opacity-50 shrink-0">Hab.</span>
          <span className="font-bold text-[10px] text-ink flex-1">{ability.name}</span>
          <span className="text-[9px] text-ink/30 shrink-0">ℹ</span>
        </div>

        <div className={`absolute inset-x-0 bottom-0 z-20 rounded-b-3xl overflow-hidden transition-transform duration-200 ease-out ${showAbility ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ backgroundColor: '#2C1810' }}
          onMouseEnter={() => setShowAbility(true)} onMouseLeave={() => setShowAbility(false)}
          onClick={() => { if (window.matchMedia('(hover: none)').matches) setShowAbility(false) }}>
          <div className="px-3 py-2" style={{ backgroundColor: tc }}>
            <span className="font-game text-[6px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Habilidade · {ability.name}
            </span>
          </div>
          <div className="px-4 py-3">
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(251,245,230,0.75)' }}>{ability.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RpsButton({ rps, pokemon, disabled, protectOnCooldown, onClick }: {
  rps: RPS; pokemon: PokemonCard; disabled: boolean; protectOnCooldown: boolean; onClick: () => void
}) {
  const move = pokemon.moves[rps]
  const tc = getTypeColor(move.type)
  const isProtectMove = move.special === 'protect'
  const isOnCooldown = isProtectMove && protectOnCooldown
  const kindLabel = move.kind === 'buff' ? (isProtectMove ? (isOnCooldown ? '🛡️ COOLDOWN' : '🛡️ PROTECT') : 'BUFF') : move.kind === 'status' ? 'STATUS' : null

  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center gap-3 border-2 border-ink rounded-2xl px-4 py-3 bg-white transition-all duration-100 text-left disabled:opacity-30 disabled:cursor-not-allowed shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer">
      <span className="text-2xl shrink-0 w-8 text-center">{RPS_ICON[rps]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm text-ink truncate">{move.name}</p>
        <p className="font-game text-[7px] text-ink-soft opacity-50 uppercase tracking-wide mt-0.5">{rps}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {kindLabel && (
          <span className="font-game text-[5px] px-1.5 py-0.5 rounded border"
            style={{ borderColor: isOnCooldown ? '#999' : tc, color: isOnCooldown ? '#999' : tc }}>
            {kindLabel}
          </span>
        )}
        <span className="font-game text-[7px] px-3 py-1.5 rounded-full border border-ink/20"
          style={{ backgroundColor: tc, color: getTypeTextColor(move.type) }}>
          {move.type}
        </span>
      </div>
    </button>
  )
}

function UniqueButton({ pokemon, used, forced, cooldown, onClick }: {
  pokemon: PokemonCard; used: boolean; forced: boolean; cooldown: boolean; onClick: () => void
}) {
  const [showDesc, setShowDesc] = useState(false)
  const unique = pokemon.unique!
  const tc = getTypeColor(unique.type)
  const disabled = used || forced || cooldown

  let statusLabel = ''
  if (used)     statusLabel = 'Já usado'
  else if (forced)   statusLabel = '😴 Sem controle'
  else if (cooldown) statusLabel = '⏳ Recarregando'

  const kindLabel: Record<string, string> = { super: 'SUPER · 2 dano', heal: 'CURA', ohko: 'KO INSTANT', aoe: 'ÁREA' }

  return (
    <div className="relative">
      <button onClick={onClick} disabled={disabled}
        onMouseEnter={() => !disabled && setShowDesc(true)} onMouseLeave={() => setShowDesc(false)}
        className="w-full flex items-center gap-3 border-2 rounded-2xl px-4 py-3 bg-white transition-all duration-100 text-left disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px]"
        style={disabled
          ? { borderColor: '#2C181030', backgroundColor: '#F5EDD8', boxShadow: 'none' }
          : { borderColor: tc, boxShadow: `3px 3px 0 ${tc}` }}>
        <span className="text-2xl shrink-0 w-8 text-center">⚡</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-sm text-ink truncate">{unique.name}</p>
            {!disabled && (
              <span className="font-game text-[6px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: tc, color: tc }}>
                {kindLabel[unique.kind] ?? 'ÚNICO'} · 1× uso
              </span>
            )}
            {disabled && statusLabel && (
              <span className="font-game text-[7px] text-ink/60">{statusLabel}</span>
            )}
          </div>
          <p className="font-game text-[7px] text-ink-soft opacity-50 uppercase tracking-wide mt-0.5">
            {disabled ? '—' : 'Sempre vence o Jokenpô · Passe o mouse para ver'}
          </p>
        </div>
        <span className="font-game text-[7px] px-3 py-1.5 rounded-full border shrink-0"
          style={disabled
            ? { borderColor: '#2C181030', backgroundColor: '#E8E0CC', color: '#2C181060' }
            : { borderColor: tc, backgroundColor: tc, color: getTypeTextColor(unique.type) }}>
          {unique.type}
        </span>
      </button>

      {!disabled && (
        <button className="md:hidden w-full text-center py-1.5 font-game text-[7px] uppercase tracking-widest text-ink/40 hover:text-ink/70 transition-all"
          onClick={(e) => { e.stopPropagation(); setShowDesc(v => !v) }}>
          {showDesc ? '▲ Ocultar efeito' : '▼ Ver efeito'}
        </button>
      )}

      <div className={`overflow-hidden transition-all duration-200 ease-out rounded-2xl border-2 mt-1 ${showDesc ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 border-transparent'}`}
        style={{ borderColor: showDesc ? tc : 'transparent', backgroundColor: '#2C1810' }}
        onMouseEnter={() => setShowDesc(true)} onMouseLeave={() => setShowDesc(false)}>
        <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: tc }}>
          <span className="font-game text-[6px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.95)' }}>
            ⚡ {unique.name}
          </span>
          <span className="font-game text-[6px] px-1.5 py-0.5 rounded-full ml-auto"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            {unique.type}
          </span>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(251,245,230,0.8)' }}>{unique.description}</p>
          <p className="font-game text-[7px] mt-2 uppercase tracking-widest" style={{ color: `${tc}cc` }}>
            Sempre vence o Jokenpô · Uso único por batalha
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BatalhaPage() {
  const router = useRouter()
  const { battle, currentFloor, mode, playerDeck, endBattle, incrementDeathCount } = useGameStore()

  const [playerFighters, setPlayerFighters] = useState<Fighter[]>([])
  const [enemyFighters, setEnemyFighters] = useState<Fighter[]>([])
  const [playerIdx, setPlayerIdx] = useState(0)
  const [enemyIdx, setEnemyIdx] = useState(0)
  const [switchUsed, setSwitchUsed] = useState(false)
  const [showSwitchPicker, setShowSwitchPicker] = useState(false)
  const [uniqueUsed, setUniqueUsed] = useState<boolean[]>([])
  const [phase, setPhase] = useState<LocalPhase>('selecting')
  const [turn, setTurn] = useState(1)
  const [moveHistory, setMoveHistory] = useState<RPS[]>([])
  const [effects, setEffects] = useState<BattleEffects>(DEFAULT_EFFECTS)
  const [lastResult, setLastResult] = useState<TurnResult | null>(null)
  const [entryMsg, setEntryMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!battle) { router.replace('/torre'); return }
    const pf = battle.playerSelected.map(p => ({ pokemon: p, hearts: p.hearts }))
    const ef = battle.enemyDeck.map(p => ({ pokemon: p, hearts: p.hearts }))
    setPlayerFighters(pf)
    setEnemyFighters(ef)
    setUniqueUsed(battle.playerSelected.map(() => false))
    const { newEffects, message } = applyEntryEffects(battle.playerSelected[0], 'player', DEFAULT_EFFECTS)
    setEffects(newEffects)
    if (message) setEntryMsg(message)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const gym = GYM_LEADERS[currentFloor]
  if (!battle || !gym || playerFighters.length === 0 || enemyFighters.length === 0) return null

  const typeColor = getTypeColor(gym.specialtyType)
  const pf = playerFighters[playerIdx]
  const ef = enemyFighters[enemyIdx]

  // Derived: is the player's action forced this turn?
  const ps = effects.playerStatus
  const playerIsForcedByStatus = ps?.condition === 'sleep' || ps?.condition === 'freeze'
  const playerIsForced = playerIsForcedByStatus || effects.playerTiredTurns > 0
  const uniqueAvail = !!pf.pokemon.unique && !uniqueUsed[playerIdx] && !playerIsForced && !effects.uniqueCooldown

  // ── Core battle logic ────────────────────────────────────────────────────────

  function handleAttack(move: PlayerMove) {
    if (phase !== 'selecting') return

    const activations: string[] = []
    if (entryMsg) { activations.push(entryMsg); setEntryMsg(null) }

    // 1. Turn-start processing (status damage, forced moves, counters)
    const turnStart = processTurnStart(effects, pf, ef)
    let eff = turnStart.effects
    activations.push(...turnStart.messages)

    let newPHearts = Math.max(0, pf.hearts - turnStart.playerHeartsLost)
    let newEHearts = Math.max(0, ef.hearts - turnStart.enemyHeartsLost)

    // 2. Determine actual player RPS
    const isUnique = move === 'unique'
    let playerRPS: RPS
    let playerForcedThisTurn = false

    if (turnStart.playerForcedRps) {
      playerRPS = turnStart.playerForcedRps
      playerForcedThisTurn = true
    } else if (isUnique) {
      playerRPS = pf.pokemon.unique!.category
      setUniqueUsed(prev => prev.map((u, i) => i === playerIdx ? true : u))
    } else {
      playerRPS = move as RPS
    }

    // 3. Determine if this is protect
    const chosenMove = (!playerForcedThisTurn && !isUnique) ? pf.pokemon.moves[playerRPS] : null
    const isProtect = chosenMove?.special === 'protect' && !eff.playerProtectCooldown
    // Reset cooldown from last turn, then set for next turn if needed
    eff = { ...eff, playerProtectCooldown: false }

    // 4. Generate AI move
    const aiMove = generateAIMove(gym.aiLevel, moveHistory, turnStart.enemyForcedRps)

    // 5. Resolve RPS outcome
    let outcome: 'player_wins' | 'enemy_wins' | 'tie'
    if (isUnique && !playerForcedThisTurn) {
      outcome = 'player_wins'
    } else {
      outcome = resolveRPS(playerRPS, aiMove)
    }

    let playerDmg = 0
    let enemyDmg = 0
    let multiplier = 1

    // 6. Protect activates regardless of outcome
    if (isProtect) {
      eff = { ...eff, playerProtectCooldown: true }
      activations.push(`🛡️ Protect! Dano bloqueado este turno!`)
    }

    // ── Player wins ──────────────────────────────────────────────────────────
    if (outcome === 'player_wins') {
      if (isUnique && !playerForcedThisTurn && pf.pokemon.unique) {
        const unique = pf.pokemon.unique
        const uRes = calcUniqueResult(
          unique,
          { pokemon: pf.pokemon, hearts: newPHearts },
          { pokemon: ef.pokemon, hearts: newEHearts },
          eff,
        )
        enemyDmg = uRes.damage
        multiplier = uRes.damage
        activations.push(...uRes.messages)

        if (uRes.enemyStatus && !eff.enemyStatus) eff = { ...eff, enemyStatus: uRes.enemyStatus }
        if (uRes.playerStatus) eff = { ...eff, playerStatus: uRes.playerStatus }
        if (uRes.playerTiredTurns > 0) eff = { ...eff, playerTiredTurns: Math.max(eff.playerTiredTurns, uRes.playerTiredTurns) }
        if (uRes.cooldown) eff = { ...eff, uniqueCooldown: true }
        if (uRes.enemyForcedMove) eff = { ...eff, enemyForcedMove: uRes.enemyForcedMove, enemyForcedTurnsLeft: uRes.forceTurns }
        if (uRes.recoil > 0) { newPHearts = Math.max(0, newPHearts - uRes.recoil); activations.push(`💢 Recuo! −${uRes.recoil} ♥`) }
        if (uRes.healPlayer > 0) { newPHearts = Math.min(pf.pokemon.hearts, newPHearts + uRes.healPlayer); activations.push(`💚 Curou ${uRes.healPlayer} ♥!`) }
        if (uRes.drainHearts > 0) { newPHearts = Math.min(pf.pokemon.hearts, newPHearts + uRes.drainHearts); activations.push(`🍃 Absorção +${uRes.drainHearts} ♥!`) }
        if (uRes.userFaints) newPHearts = 0

        if (uRes.benchDamage > 0) {
          setEnemyFighters(prev => prev.map((f, i) =>
            i === enemyIdx ? f : { ...f, hearts: Math.max(0, f.hearts - uRes.benchDamage) }
          ))
          activations.push(`💥 Dano de área na reserva inimiga!`)
        }

      } else if (chosenMove && !playerForcedThisTurn) {
        const attackType = chosenMove.type

        // Check enemy immunities
        const eAbility = ef.pokemon.ability.name
        let immune = false
        if (eAbility === 'VoltAbsorb' && attackType === 'Electric') {
          immune = true; multiplier = 0
          newEHearts = Math.min(ef.pokemon.hearts, newEHearts + 1)
          activations.push(`🔋 VoltAbsorb! ${ef.pokemon.name} absorveu e recuperou 1 ♥!`)
        } else if (eAbility === 'WaterAbsorb' && attackType === 'Water') {
          immune = true; multiplier = 0
          newEHearts = Math.min(ef.pokemon.hearts, newEHearts + 1)
          activations.push(`💧 WaterAbsorb! ${ef.pokemon.name} absorveu e recuperou 1 ♥!`)
        } else if (eAbility === 'FlashFire' && attackType === 'Fire') {
          immune = true; multiplier = 0
          activations.push(`🔥 FlashFire! ${ef.pokemon.name} é imune ao Fogo!`)
        } else if (eAbility === 'Levitate' && attackType === 'Ground') {
          immune = true; multiplier = 0
          activations.push(`🌬️ Levitate! ${ef.pokemon.name} flutua sobre o ataque!`)
        }

        if (!immune) {
          if (chosenMove.kind === 'offensive') {
            const slotRes = calcSlotDamage(
              attackType, pf.pokemon, newPHearts, ef.pokemon, eff.flashFireActive,
              eff.playerAttackMod, eff.enemyDefenseMod,
            )
            enemyDmg = slotRes.damage
            multiplier = slotRes.multiplier
            activations.push(...slotRes.messages)
            eff = { ...eff, playerAttackMod: 0, enemyDefenseMod: 0 }

            // Drain
            if (chosenMove.drain && enemyDmg > 0) {
              const heal = Math.floor(enemyDmg / 2)
              newPHearts = Math.min(pf.pokemon.hearts, newPHearts + heal)
              activations.push(`🍃 Absorção +${heal} ♥!`)
            }

            // Thaw frozen enemy on Fire hit
            if (attackType === 'Fire') {
              const { effects: newEff, thawed } = applyThaw(eff, 'enemy', attackType)
              eff = newEff
              if (thawed) activations.push(`🔥 ${ef.pokemon.name} descongelou!`)
            }
          } else {
            // Buff or status move — apply side effect, no damage
            const sideEff = applySlotMoveEffect(chosenMove, 'player', eff, ef.pokemon)
            eff = sideEff.effects
            if (sideEff.message) activations.push(sideEff.message)
          }

          // Enemy Sturdy check
          if (enemyDmg > 0) {
            const { damage: finalDmg, sturdyTriggered } = applySturdy(
              enemyDmg, newEHearts, eff.enemySturdyUsed, ef.pokemon.ability.name === 'Sturdy',
            )
            if (sturdyTriggered) {
              eff = { ...eff, enemySturdyUsed: true }
              activations.push(`🛡️ Sturdy! ${ef.pokemon.name} sobreviveu com 1 ♥!`)
            }
            enemyDmg = finalDmg
          }
        }
        newEHearts = Math.max(0, newEHearts - enemyDmg)
      }
    }

    // ── Enemy wins ──────────────────────────────────────────────────────────
    if (outcome === 'enemy_wins') {
      const attackType = ef.pokemon.moves[aiMove].type
      const pAbility = pf.pokemon.ability.name
      let immune = false

      if (pAbility === 'VoltAbsorb' && attackType === 'Electric') {
        immune = true; multiplier = 0
        newPHearts = Math.min(pf.pokemon.hearts, newPHearts + 1)
        activations.push(`🔋 VoltAbsorb! ${pf.pokemon.name} absorveu e recuperou 1 ♥!`)
      } else if (pAbility === 'WaterAbsorb' && attackType === 'Water') {
        immune = true; multiplier = 0
        newPHearts = Math.min(pf.pokemon.hearts, newPHearts + 1)
        activations.push(`💧 WaterAbsorb! ${pf.pokemon.name} absorveu e recuperou 1 ♥!`)
      } else if (pAbility === 'FlashFire' && attackType === 'Fire') {
        immune = true; multiplier = 0; eff = { ...eff, flashFireActive: true }
        activations.push(`🔥 FlashFire! ${pf.pokemon.name} é imune! Fogo potencializado!`)
      } else if (pAbility === 'Levitate' && attackType === 'Ground') {
        immune = true; multiplier = 0
        activations.push(`🌬️ Levitate! ${pf.pokemon.name} flutua sobre o ataque!`)
      } else if (pAbility === 'Lightning Rod' && Math.random() < 0.40) {
        immune = true; multiplier = 0
        activations.push(`⚡ Lightning Rod! ${pf.pokemon.name} absorveu o golpe!`)
      }

      if (!immune && !isProtect) {
        const slotRes = calcSlotDamage(
          attackType, ef.pokemon, newEHearts, pf.pokemon, false,
          eff.enemyAttackMod, eff.playerDefenseMod,
        )
        playerDmg = slotRes.damage
        multiplier = slotRes.multiplier
        activations.push(...slotRes.messages)
        eff = { ...eff, enemyAttackMod: 0, playerDefenseMod: 0 }

        // Thaw frozen player on Fire hit
        if (attackType === 'Fire') {
          const { effects: newEff, thawed } = applyThaw(eff, 'player', attackType)
          eff = newEff
          if (thawed) activations.push(`🔥 ${pf.pokemon.name} descongelou!`)
        }

        // Player Sturdy
        const { damage: finalDmg, sturdyTriggered } = applySturdy(
          playerDmg, newPHearts, eff.playerSturdyUsed, pAbility === 'Sturdy',
        )
        if (sturdyTriggered) {
          eff = { ...eff, playerSturdyUsed: true }
          activations.push(`🛡️ Sturdy! ${pf.pokemon.name} sobreviveu com 1 ♥!`)
        }
        playerDmg = finalDmg
        newPHearts = Math.max(0, newPHearts - playerDmg)
      } else if (!immune && isProtect) {
        activations.push(`🛡️ Protect absorveu o ataque!`)
      }

      // Enemy AI buff/status moves: apply as offensive (no special AI strategy)
    }

    // 7. Update state
    setPlayerFighters(prev => prev.map((f, i) => i === playerIdx ? { ...f, hearts: newPHearts } : f))
    setEnemyFighters(prev => prev.map((f, i) => i === enemyIdx ? { ...f, hearts: newEHearts } : f))
    setEffects(eff)
    setMoveHistory(h => [...h, playerRPS])
    setLastResult({ playerMove: move, enemyMove: aiMove, outcome, playerDmg, enemyDmg, multiplier, activations })
    setPhase('result')
  }

  // ── Next turn ─────────────────────────────────────────────────────────────

  function handleNext() {
    const currentPF = playerFighters[playerIdx]
    const currentEF = enemyFighters[enemyIdx]

    if (currentEF.hearts <= 0) {
      const next = enemyIdx + 1
      if (next >= enemyFighters.length) { setPhase('victory'); return }
      setEnemyIdx(next)
      const { newEffects, message } = applyEntryEffects(enemyFighters[next].pokemon, 'enemy', effects)
      setEffects({ ...newEffects, enemyStatus: null, enemyTiredTurns: 0, enemySturdyUsed: false })
      if (message) setEntryMsg(message)
    }

    if (currentPF.hearts <= 0) {
      const next = playerFighters.findIndex((f, i) => i > playerIdx && f.hearts > 0)
      if (next === -1) { setPhase('defeat'); return }
      setPlayerIdx(next)
      const { newEffects, message } = applyEntryEffects(playerFighters[next].pokemon, 'player', effects)
      setEffects({ ...newEffects, playerStatus: null, playerTiredTurns: 0, playerSturdyUsed: false })
      if (message) setEntryMsg(message)
    }

    setLastResult(null)
    setTurn(t => t + 1)
    setPhase('selecting')
  }

  // ── Switch ────────────────────────────────────────────────────────────────

  function handleSwitch() {
    if (switchUsed) return
    if (playerFighters.filter(f => f.hearts > 0).length <= 1) return
    setShowSwitchPicker(true)
  }

  function confirmSwitch(targetIdx: number) {
    setShowSwitchPicker(false)
    setSwitchUsed(true)
    setPlayerIdx(targetIdx)
    const { newEffects, message } = applyEntryEffects(playerFighters[targetIdx].pokemon, 'player', effects)
    setEffects({ ...newEffects, playerStatus: null, playerTiredTurns: 0, playerSturdyUsed: false })
    if (message) setEntryMsg(message)
  }

  // ── Display helpers ───────────────────────────────────────────────────────

  const outcomeConfig = {
    player_wins: { bg: '#78C850', label: '🏆 Você venceu este turno!', text: 'white' },
    enemy_wins:  { bg: '#CC2200', label: '💥 Inimigo venceu este turno', text: 'white' },
    tie:         { bg: '#A8A878', label: '🤝 Empate — ninguém atacou', text: '#2C1810' },
  }

  return (
    <main className="min-h-screen bg-parchment dots relative overflow-x-hidden">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b-4 border-ink px-5 py-3" style={{ backgroundColor: typeColor }}>
        <div className="max-w-[640px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/torre')}
              className="border-2 border-white/30 rounded-full px-3 py-1 font-game text-[6px] text-white bg-white/10 hover:bg-white/20 transition-all">
              ← Fugir
            </button>
            <div>
              <p className="font-game text-[6px] text-white/60 uppercase tracking-widest">Andar {currentFloor + 1}/12</p>
              <p className="font-black text-base text-white uppercase tracking-wide">{gym.name} — {gym.specialtyType}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-game text-[6px] text-white/60 uppercase tracking-widest">Turno</p>
            <p className="font-black text-2xl text-white">{turn}</p>
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-5 py-4 flex flex-col gap-4 pb-32">

        {/* Inimigo */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="font-game text-[7px] text-ink-soft opacity-50 uppercase tracking-widest">Inimigo</p>
            <div className="flex gap-1">
              {enemyFighters.map((f, i) => (
                <span key={i} className="w-2 h-2 rounded-full border border-ink/30"
                  style={{ backgroundColor: i === enemyIdx ? typeColor : f.hearts > 0 ? '#A8A878' : 'transparent' }} />
              ))}
            </div>
          </div>
          <EnemyCard fighter={ef} status={effects.enemyStatus} />
        </div>

        {/* VS */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="font-game text-[8px] text-ink-soft opacity-40 uppercase tracking-widest">vs</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        {/* Seu Pokémon */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="font-game text-[7px] text-ink-soft opacity-50 uppercase tracking-widest">Você</p>
            <div className="flex gap-1">
              {playerFighters.map((f, i) => (
                <span key={i} className="w-2 h-2 rounded-full border border-ink/30"
                  style={{ backgroundColor: i === playerIdx ? getTypeColor(f.pokemon.type1) : f.hearts > 0 ? '#A8A878' : 'transparent' }} />
              ))}
            </div>
          </div>
          <PlayerCard fighter={pf} status={effects.playerStatus} />
        </div>

        {/* ── Seleção de ataque ── */}
        {phase === 'selecting' && (
          <div className="flex flex-col gap-2 mt-1">
            {/* Aviso de estado forçado */}
            {playerIsForced && (
              <div className="border-2 border-ink/20 rounded-2xl px-4 py-3 text-center" style={{ backgroundColor: '#E8E0CC' }}>
                <p className="font-game text-[8px] text-ink-soft uppercase tracking-widest">
                  {effects.playerStatus?.condition === 'sleep' && `😴 ${pf.pokemon.name} está dormindo — ✊ automático`}
                  {effects.playerStatus?.condition === 'freeze' && `🧊 ${pf.pokemon.name} está congelado — ✊ automático`}
                  {effects.playerTiredTurns > 0 && `💤 ${pf.pokemon.name} está exausto — ✊ automático`}
                </p>
              </div>
            )}

            {/* Aviso de paralisia (pode ou não travar) */}
            {effects.playerStatus?.condition === 'paralysis' && !playerIsForced && (
              <div className="border-2 border-yellow-400/40 rounded-2xl px-4 py-2 text-center" style={{ backgroundColor: '#FFFBE6' }}>
                <p className="font-game text-[7px] text-ink-soft uppercase tracking-widest">
                  ⚡ {pf.pokemon.name} está paralisado — 30% de travar
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-1">
              <div className="h-px flex-1 bg-ink/10" />
              <span className="font-game text-[7px] text-ink-soft opacity-40 uppercase tracking-widest">Jokenpô</span>
              <div className="h-px flex-1 bg-ink/10" />
            </div>

            {(['rock', 'paper', 'scissors'] as RPS[]).map(rps => (
              <RpsButton key={rps} rps={rps} pokemon={pf.pokemon}
                disabled={playerIsForced}
                protectOnCooldown={effects.playerProtectCooldown}
                onClick={() => handleAttack(rps)} />
            ))}

            {pf.pokemon.unique && (
              <>
                <div className="flex items-center gap-3 mt-1">
                  <div className="h-px flex-1 bg-ink/10" />
                  <span className="font-game text-[7px] text-ink-soft opacity-40 uppercase tracking-widest">Ataque Único</span>
                  <div className="h-px flex-1 bg-ink/10" />
                </div>
                <UniqueButton
                  pokemon={pf.pokemon}
                  used={uniqueUsed[playerIdx] ?? false}
                  forced={playerIsForced}
                  cooldown={effects.uniqueCooldown}
                  onClick={() => handleAttack('unique')} />
              </>
            )}
          </div>
        )}

        {/* ── Resultado ── */}
        {phase === 'result' && lastResult && (() => {
          const cfg = outcomeConfig[lastResult.outcome]
          const wasUnique = lastResult.playerMove === 'unique'
          const playerRpsKey = wasUnique ? null : lastResult.playerMove as RPS
          const playerMoveName = wasUnique ? (pf.pokemon.unique?.name ?? 'Único') : pf.pokemon.moves[playerRpsKey!]?.name
          const playerMoveType = wasUnique ? pf.pokemon.unique?.type : pf.pokemon.moves[playerRpsKey!]?.type
          const playerIcon = wasUnique ? '⚡' : RPS_ICON[playerRpsKey!]
          const enemyMoveName = ef.pokemon.moves[lastResult.enemyMove]?.name
          const enemyMoveType = ef.pokemon.moves[lastResult.enemyMove]?.type
          const eff = effectivenessLabel(lastResult.multiplier)
          return (
            <div className="flex flex-col gap-3 mt-1">
              <div className="border-2 border-ink rounded-2xl overflow-hidden shadow-neo" style={{ backgroundColor: cfg.bg }}>
                <div className="px-4 pt-4 pb-3 text-center">
                  <p className="font-black text-base uppercase tracking-wide" style={{ color: cfg.text }}>{cfg.label}</p>
                </div>
                <div className="px-3 pb-3 flex items-stretch gap-2">
                  <div className="flex-1 rounded-xl flex flex-col items-center gap-1 px-2 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                    <span className="text-2xl leading-none">{playerIcon}</span>
                    <p className="font-black text-[11px] text-white text-center leading-tight mt-0.5">{playerMoveName}</p>
                    {playerMoveType && (
                      <span className="font-game text-[6px] px-2 py-0.5 rounded-full mt-0.5"
                        style={{ backgroundColor: getTypeColor(playerMoveType), color: getTypeTextColor(playerMoveType) }}>
                        {playerMoveType}
                      </span>
                    )}
                    <p className="font-game text-[5px] uppercase tracking-widest mt-1" style={{ color: `${cfg.text}80` }}>Você</p>
                  </div>
                  <div className="flex items-center justify-center w-8 shrink-0">
                    <span className="font-black text-lg leading-none" style={{ color: `${cfg.text}60` }}>vs</span>
                  </div>
                  <div className="flex-1 rounded-xl flex flex-col items-center gap-1 px-2 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                    <span className="text-2xl leading-none">{RPS_ICON[lastResult.enemyMove]}</span>
                    <p className="font-black text-[11px] text-white text-center leading-tight mt-0.5">{enemyMoveName}</p>
                    {enemyMoveType && (
                      <span className="font-game text-[6px] px-2 py-0.5 rounded-full mt-0.5"
                        style={{ backgroundColor: getTypeColor(enemyMoveType), color: getTypeTextColor(enemyMoveType) }}>
                        {enemyMoveType}
                      </span>
                    )}
                    <p className="font-game text-[5px] uppercase tracking-widest mt-1" style={{ color: `${cfg.text}80` }}>{gym.name}</p>
                  </div>
                </div>

                {wasUnique && lastResult.outcome === 'player_wins' && (
                  <div className="px-4 py-2 border-t border-white/20 text-center">
                    <p className="font-game text-[8px]" style={{ color: `${cfg.text}cc` }}>⚡ Ataque único sempre vence o Jokenpô</p>
                  </div>
                )}
                {!wasUnique && lastResult.outcome !== 'tie' && (
                  <div className="px-4 py-2 border-t border-white/20 text-center">
                    <p className="font-game text-[8px]" style={{ color: `${cfg.text}cc` }}>
                      {getBeatLabel(
                        lastResult.outcome === 'player_wins' ? lastResult.playerMove as RPS : lastResult.enemyMove,
                        lastResult.outcome === 'player_wins' ? lastResult.enemyMove : lastResult.playerMove as RPS,
                      )}
                    </p>
                  </div>
                )}

                {(eff || lastResult.playerDmg > 0 || lastResult.enemyDmg > 0) && (
                  <div className="px-4 py-3 border-t border-white/20 flex flex-col gap-2">
                    {eff && (
                      <p className="font-black text-sm text-center" style={{
                        color: lastResult.multiplier >= 2 ? '#F8D030' : 'rgba(255,255,255,0.75)',
                        textShadow: lastResult.multiplier >= 2 ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                      }}>{eff}</p>
                    )}
                    <div className="flex justify-center gap-6">
                      {lastResult.enemyDmg > 0 && (
                        <p className="font-game text-[8px] text-white">{ef.pokemon.name} −{lastResult.enemyDmg} ♥{ef.hearts <= 0 ? ' · KO!' : ''}</p>
                      )}
                      {lastResult.playerDmg > 0 && (
                        <p className="font-game text-[8px] text-white">{pf.pokemon.name} −{lastResult.playerDmg} ♥{pf.hearts <= 0 ? ' · KO!' : ''}</p>
                      )}
                    </div>
                  </div>
                )}

                {lastResult.activations.length > 0 && (
                  <div className="px-4 py-3 border-t border-white/20 flex flex-col gap-1">
                    {lastResult.activations.map((msg, i) => (
                      <p key={i} className="font-game text-[8px] text-center" style={{ color: `${cfg.text}e0` }}>{msg}</p>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleNext}
                className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase border-2 border-ink rounded-2xl bg-parchment-light text-ink hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
                style={{ boxShadow: `4px 4px 0 ${cfg.bg}` }}>
                {ef.hearts <= 0 && enemyIdx + 1 < enemyFighters.length
                  ? `Próximo Pokémon de ${gym.name} →`
                  : pf.hearts <= 0 && playerIdx + 1 < playerFighters.length
                  ? 'Próximo seu Pokémon →'
                  : 'Próximo Turno →'}
              </button>
            </div>
          )
        })()}

        {/* ── Vitória ── */}
        {phase === 'victory' && (
          <div className="border-2 border-ink rounded-3xl overflow-hidden shadow-neo-lg text-center p-8" style={{ backgroundColor: '#78C850' }}>
            <p className="text-6xl mb-3">🏆</p>
            <p className="font-black text-2xl text-white uppercase tracking-tight">Você venceu!</p>
            <p className="text-base text-white/80 mt-2 mb-6">{gym.badge ? `${gym.badge} conquistada!` : `${gym.name} foi derrotado!`}</p>
            <button
              onClick={() => { endBattle('win'); router.push(currentFloor >= 11 ? '/entre-andares' : '/pos-batalha') }}
              className="w-full py-4 font-black text-base tracking-[0.15em] uppercase border-2 border-ink rounded-2xl bg-white text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
              {currentFloor >= 11 ? '🏆 Ver resultado final →' : 'Pegar novo Pokémon →'}
            </button>
          </div>
        )}

        {/* ── Derrota ── */}
        {phase === 'defeat' && (() => {
          const selectedIds = new Set(battle.playerSelected.map(p => p.id))
          const hardSurvivors = playerDeck.filter(p => !selectedIds.has(p.id) && p.hearts > 0 && !p.isFainted)

          function handleNormalRetry() { incrementDeathCount(); endBattle('lose'); router.push('/torre') }
          function handleHardSecondChance() { incrementDeathCount(); endBattle('lose'); router.push('/torre') }
          function handleGiveUp() { endBattle('lose'); router.push('/') }

          if (mode === 'hard' && hardSurvivors.length > 0) {
            return (
              <div className="border-2 border-ink rounded-3xl overflow-hidden shadow-neo-lg" style={{ backgroundColor: '#CC2200' }}>
                <div className="p-8 text-center border-b border-white/20">
                  <p className="text-6xl mb-3">💀</p>
                  <p className="font-black text-2xl text-white uppercase tracking-tight">Seus 3 caíram!</p>
                  <p className="text-base text-white/80 mt-2">{gym.name} foi mais forte desta vez.</p>
                </div>
                <div className="p-5 flex flex-col gap-3" style={{ backgroundColor: '#AA1800' }}>
                  <p className="font-game text-[8px] text-white/70 uppercase tracking-widest text-center">
                    Segunda chance — {hardSurvivors.length} Pokémon sobreviventes
                  </p>
                  <div className="flex justify-center gap-3 mb-1">
                    {hardSurvivors.map(p => (
                      <div key={p.id} className="flex flex-col items-center gap-1">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                          alt={p.name} style={{ width: 56, height: 56, objectFit: 'contain' }} />
                        <p className="font-game text-[6px] text-white/80 uppercase">{p.name}</p>
                        <HeartsDisplay total={p.hearts} current={p.hearts} size="sm" />
                      </div>
                    ))}
                  </div>
                  <button onClick={handleHardSecondChance}
                    className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase border-2 border-ink rounded-2xl bg-white text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                    ⚔️ Segunda chance com sobreviventes
                  </button>
                  <button onClick={handleGiveUp} className="font-game text-[8px] text-white/50 uppercase tracking-widest py-2 text-center">
                    🏳️ Desistir da run
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div className="border-2 border-ink rounded-3xl overflow-hidden shadow-neo-lg text-center p-8" style={{ backgroundColor: '#CC2200' }}>
              <p className="text-6xl mb-3">💀</p>
              <p className="font-black text-2xl text-white uppercase tracking-tight">Você perdeu</p>
              <p className="text-base text-white/80 mt-2 mb-6">{gym.name} foi mais forte desta vez.</p>
              {mode === 'normal' ? (
                <div className="flex flex-col gap-3">
                  <button onClick={handleNormalRetry}
                    className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase border-2 border-ink rounded-2xl bg-white text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                    🔄 Continuar (volta à seleção)
                  </button>
                  <button onClick={handleGiveUp} className="font-game text-[8px] text-white/60 uppercase tracking-widest py-2">
                    🏳️ Desistir da run
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="font-game text-[8px] text-white/60 uppercase tracking-widest mb-2">Modo difícil — sem sobreviventes</p>
                  <button onClick={handleGiveUp}
                    className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase border-2 border-ink rounded-2xl bg-white text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                    🏳️ Fim de jogo
                  </button>
                </div>
              )}
            </div>
          )
        })()}

        {/* ── Ações auxiliares ── */}
        {phase === 'selecting' && (
          <div className="flex gap-2 mt-1">
            <button onClick={handleSwitch}
              disabled={switchUsed || playerFighters.filter(f => f.hearts > 0).length <= 1}
              className="flex-1 py-3 font-black text-sm uppercase border-2 rounded-2xl transition-all cursor-pointer disabled:cursor-not-allowed"
              style={switchUsed || playerFighters.filter(f => f.hearts > 0).length <= 1
                ? { borderColor: '#2C181025', backgroundColor: '#F5EDD8', color: '#2C181045' }
                : { borderColor: '#2C1810', backgroundColor: '#FBF5E6', color: '#2C1810', boxShadow: '3px 3px 0 #2C1810' }}>
              {switchUsed ? '🔄 Troca usada' : '🔄 Trocar Pokémon'}
            </button>
            <button onClick={() => { endBattle('lose'); router.push('/torre') }}
              className="px-4 py-3 font-game text-[8px] uppercase border-2 border-ink/40 rounded-2xl text-ink/60 hover:text-ink hover:border-ink/70 hover:bg-white transition-all cursor-pointer">
              🏳️ Fugir
            </button>
          </div>
        )}
      </div>

      {/* ── Switch Picker Overlay ── */}
      {showSwitchPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(44,24,16,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowSwitchPicker(false)}>
          <div className="w-full max-w-[640px] rounded-t-3xl border-t-4 border-x-4 border-ink p-5 pb-10"
            style={{ backgroundColor: '#FBF5E6' }} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-ink/20 mx-auto mb-5" />
            <p className="font-black text-lg text-ink uppercase tracking-tight text-center mb-1">Trocar Pokémon</p>
            <p className="font-game text-[7px] text-ink-soft opacity-50 uppercase tracking-widest text-center mb-5">
              Escolha quem entra em campo · Uso único por batalha
            </p>
            <div className="grid grid-cols-3 gap-3">
              {playerFighters.map((fighter, idx) => {
                const tc = getTypeColor(fighter.pokemon.type1)
                const isCurrent  = idx === playerIdx
                const isKO       = fighter.hearts <= 0
                const selectable = !isCurrent && !isKO
                return (
                  <button key={idx} onClick={() => selectable && confirmSwitch(idx)} disabled={!selectable}
                    className="flex flex-col items-center gap-2 border-2 rounded-2xl p-3 transition-all duration-100"
                    style={{
                      borderColor: isCurrent ? tc : isKO ? '#2C181040' : '#2C1810',
                      backgroundColor: isCurrent ? `${tc}20` : isKO ? '#E8E0CC' : 'white',
                      opacity: isKO ? 0.4 : 1,
                      boxShadow: selectable ? '3px 3px 0 #2C1810' : 'none',
                      cursor: selectable ? 'pointer' : 'default',
                    }}>
                    <img src={getSpriteUrl(fighter.pokemon.id)} alt={fighter.pokemon.name}
                      style={{ width: 64, height: 64, objectFit: 'contain' }} />
                    <div className="text-center">
                      <p className="font-black text-[10px] text-ink uppercase tracking-tight leading-tight">{fighter.pokemon.name}</p>
                      <div className="flex justify-center mt-1">
                        <HeartsDisplay total={fighter.pokemon.hearts} current={fighter.hearts} size="sm" />
                      </div>
                      {isCurrent && <span className="font-game text-[6px] uppercase tracking-widest mt-1 block" style={{ color: tc }}>Em campo</span>}
                      {isKO && <span className="font-game text-[6px] uppercase tracking-widest mt-1 block text-ink/40">Nocauteado</span>}
                    </div>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setShowSwitchPicker(false)}
              className="w-full mt-4 py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/20 rounded-2xl text-ink/40 hover:text-ink/70 transition-all cursor-pointer">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
