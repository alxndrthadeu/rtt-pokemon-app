'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { GYM_LEADERS } from '@/lib/data/gyms'
import { getTypeColor, getTypeTextColor, getPixelSpriteUrl, getSpriteUrl, RPS_ICON } from '@/lib/typeColors'
import {
  BattleEffects, DEFAULT_EFFECTS, Fighter,
  processTurnStart, calcUniqueResult, calcSlotDamage, applySlotMoveEffect,
  applySturdy, applyThaw, applyEntryEffects,
  StatusState,
} from '@/lib/battleEngine'
import type { PokemonCard, Move, RPS, AILevel, StatusCondition } from '@/types'

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
  if (level === 'predictive' && history.length >= 2) {
    const last = history[history.length - 1]
    // Analisa o que o jogador tende a jogar DEPOIS de [last]
    const followCounts: Record<RPS, number> = { rock: 0, paper: 0, scissors: 0 }
    let followTotal = 0
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i] === last) { followCounts[history[i + 1]]++; followTotal++ }
    }
    if (followTotal >= 2 && Math.random() < t) {
      const predicted = Object.entries(followCounts).sort((a, b) => b[1] - a[1])[0][0] as RPS
      return BEATS[predicted]
    }
    // Fallback: bate o move mais frequente geral
    return Math.random() < t ? BEATS[mostUsed] : ALL_RPS[Math.floor(Math.random() * 3)]
  }
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

const STATUS_LABEL: Record<StatusCondition, string> = {
  poison: 'VEN', paralysis: 'PAR', sleep: 'SON', freeze: 'GEL', burn: 'QUE',
}
const STATUS_BG: Record<StatusCondition, string> = {
  poison: '#9040B0', paralysis: '#D4B000', sleep: '#4868D0', freeze: '#50B8B8', burn: '#E06020',
}
const STATUS_FG: Record<StatusCondition, string> = {
  poison: 'white', paralysis: '#2C1810', sleep: 'white', freeze: '#2C1810', burn: 'white',
}

function getBackSpriteUrl(id: number): string {
  if (id === 0) return getPixelSpriteUrl(0)
  const realId = id === 9025 ? 25 : id
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${realId}.png`
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
  lostTurn: boolean       // player dormiu/congelou/exausto — não atuou
  enemyLostTurn: boolean  // inimigo dormiu/congelou — player vence automaticamente
  switchedIn?: string     // nome do pokemon que entrou via troca voluntária (inimigo ataca de graça)
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function HeartsDisplay({ total, current, size = 'md' }: { total: number; current: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => {
        const full = i < Math.floor(current)
        const half = !full && i === Math.floor(current) && (current % 1) >= 0.5
        return (
          <span key={i} className={`${sizes[size]} leading-none transition-all`}
            style={{ opacity: full ? 1 : half ? 0.5 : 0.18 }}>♥</span>
        )
      })}
    </div>
  )
}

function HPBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(1, Math.max(0, current / max))
  const color = pct > 0.5 ? '#38C838' : pct > 0.2 ? '#F0C000' : '#E82020'
  return (
    <div className="h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}>
      <div className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct * 100}%`, backgroundColor: color }} />
    </div>
  )
}

const STATUS_DESC: Record<StatusCondition, string> = {
  poison:    '−0.5♥ no início de cada turno. Pokémon Venenoso/Aço são imunes.',
  paralysis: '30% de chance de perder o turno. Pokémon Elétrico é imune.',
  sleep:     'Perde o turno por até 2 turnos. 45% de chance de acordar cedo no 2º turno.',
  freeze:    'Perde o turno até descongelar. Ataques de Fogo descongelam.',
  burn:      '−0.5♥ no início de cada turno. Pokémon Fogo é imune.',
}
const STATUS_NAME: Record<StatusCondition, string> = {
  poison: 'Envenenado', paralysis: 'Paralisado', sleep: 'Dormindo', freeze: 'Congelado', burn: 'Queimado',
}

function StatusPill({ status }: { status: StatusState | null }) {
  const [open, setOpen] = useState(false)
  if (!status) return null
  const bg = STATUS_BG[status.condition]
  const fg = STATUS_FG[status.condition]
  return (
    <div className="relative shrink-0">
      <button
        className="font-game text-[8px] px-1.5 py-[2px] rounded font-bold leading-none cursor-pointer"
        style={{ backgroundColor: bg, color: fg }}
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {STATUS_LABEL[status.condition]}
      </button>
      {open && (
        <div
          className="absolute bottom-full left-0 mb-1.5 z-50 rounded-xl px-3 py-2 border-2 border-ink/10 w-48 shadow-neo-sm"
          style={{ backgroundColor: '#2C1810' }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-game text-[7px] uppercase tracking-widest mb-1" style={{ color: bg }}>
            {STATUS_NAME[status.condition]}
          </p>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,245,230,0.75)' }}>
            {STATUS_DESC[status.condition]}
          </p>
        </div>
      )}
    </div>
  )
}

function EffectBadges({ effects, side }: { effects: BattleEffects; side: 'player' | 'enemy' }) {
  type Badge = { label: string; bg: string; fg?: string }
  const badges: Badge[] = []
  if (side === 'player') {
    if (effects.flashFireActive)   badges.push({ label: '🔥 +1',  bg: '#E06020', fg: 'white' })
    if (effects.playerAttackMod > 0)  badges.push({ label: `ATK↑${effects.playerAttackMod}`, bg: '#38C838', fg: 'white' })
    if (effects.playerAttackMod < 0)  badges.push({ label: `ATK↓${Math.abs(effects.playerAttackMod)}`, bg: '#CC2200', fg: 'white' })
    if (effects.playerDefenseMod > 0) badges.push({ label: `DEF↑${effects.playerDefenseMod}`, bg: '#6890F0', fg: 'white' })
    if (effects.playerDefenseMod < 0) badges.push({ label: `DEF↓${Math.abs(effects.playerDefenseMod)}`, bg: '#CC2200', fg: 'white' })
    if (effects.playerProtectCooldown) badges.push({ label: '🛡️ CD', bg: '#8050B8', fg: 'white' })
    if (effects.uniqueCooldown)        badges.push({ label: '⚡ CD', bg: '#A8A878', fg: '#2C1810' })
  } else {
    if (effects.enemyAttackMod < 0)     badges.push({ label: 'ATK↓', bg: '#38C838', fg: 'white' })
    if (effects.enemyAttackMod > 0)     badges.push({ label: 'ATK↑', bg: '#CC2200', fg: 'white' })
    if (effects.enemyDefenseMod < 0)    badges.push({ label: 'DEF↓', bg: '#38C838', fg: 'white' })
    if (effects.enemyForcedMove)        badges.push({ label: 'TRAV', bg: '#4868D0', fg: 'white' })
    if (effects.enemyProtectCooldown)   badges.push({ label: '🛡️ CD', bg: '#8050B8', fg: 'white' })
  }
  if (badges.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {badges.map((b, i) => (
        <span key={i} className="font-game text-[7px] px-1.5 py-[2px] rounded-full leading-none"
          style={{ backgroundColor: b.bg, color: b.fg ?? 'white' }}>
          {b.label}
        </span>
      ))}
    </div>
  )
}

// ─── Battle Arena ─────────────────────────────────────────────────────────────

interface ArenaProps {
  pf: Fighter; ef: Fighter
  effects: BattleEffects
  typeColor: string
  playerFighters: Fighter[]; enemyFighters: Fighter[]
  playerIdx: number; enemyIdx: number
  phase: LocalPhase
  enemyTellType?: string | null   // cor do tipo do próximo move do inimigo (visual tell)
}

function BattleArena({ pf, ef, effects, typeColor, playerFighters, enemyFighters, playerIdx, enemyIdx, phase, enemyTellType }: ArenaProps) {
  const pKO = pf.hearts <= 0
  const eKO = ef.hearts <= 0

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-ink select-none"
      style={{
        height: 256,
        background: `linear-gradient(180deg,
          ${typeColor}55 0%,
          ${typeColor}18 36%,
          #ACD858 54%,
          #7DB038 66%,
          #9C7040 80%,
          #7A5030 100%)`,
      }}>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(44,24,16,0.28) 100%)' }} />

      {/* Enemy platform */}
      <div className="absolute pointer-events-none"
        style={{ right: 16, top: 118, width: 80, height: 12, backgroundColor: 'rgba(44,24,16,0.20)', borderRadius: '50%' }} />

      {/* Player platform */}
      <div className="absolute pointer-events-none"
        style={{ left: 8, bottom: 20, width: 110, height: 16, backgroundColor: 'rgba(44,24,16,0.22)', borderRadius: '50%' }} />

      {/* ── Enemy info box — top-left ── */}
      <div className="absolute top-3 left-3 z-10" style={{ maxWidth: 160 }}>
        <div className="rounded-2xl overflow-hidden border border-white/30"
          style={{ backgroundColor: 'rgba(251,245,230,0.93)', boxShadow: '2px 2px 0 rgba(44,24,16,0.18)' }}>
          <div className="px-2.5 pt-2 pb-1.5">
            <div className="flex items-center gap-1.5 mb-[5px]">
              <p className="font-black text-[11px] text-ink uppercase tracking-tight leading-none truncate flex-1 min-w-0">
                {ef.pokemon.name}
              </p>
              <StatusPill status={effects.enemyStatus} />
            </div>
            <div style={{ width: 124 }}>
              <HPBar current={ef.hearts} max={ef.pokemon.hearts} />
            </div>
            <div className="mt-[5px]">
              <HeartsDisplay total={ef.pokemon.hearts} current={ef.hearts} size="sm" />
            </div>
            <EffectBadges effects={effects} side="enemy" />
          </div>
          <div className="flex gap-1 px-2.5 pb-2">
            {enemyFighters.map((f, i) => (
              <span key={i} className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: i === enemyIdx ? typeColor : f.hearts > 0 ? '#A8A878' : 'transparent',
                  border: f.hearts <= 0 ? '1.5px solid rgba(44,24,16,0.25)' : '1.5px solid rgba(44,24,16,0.35)',
                }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Enemy sprite — top-right ── */}
      <div className="absolute z-[5] transition-opacity duration-300"
        style={{ right: 18, top: 22, opacity: eKO ? 0.22 : 1 }}>
        {/* Visual tell: aura do tipo do próximo move do inimigo durante seleção */}
        {phase === 'selecting' && !eKO && enemyTellType && (
          <div className="absolute inset-0 pointer-events-none rounded-xl z-10 transition-all duration-500"
            style={{ boxShadow: `0 0 18px 6px ${enemyTellType}99`, borderRadius: 8 }} />
        )}
        <img
          src={getPixelSpriteUrl(ef.pokemon.id)}
          alt={ef.pokemon.name}
          style={{
            width: 92, height: 92,
            imageRendering: 'pixelated',
            objectFit: 'contain',
            filter: eKO ? 'grayscale(1)' : undefined,
          }}
        />
        {eKO && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-game text-[7px] bg-black/50 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">KO</span>
          </div>
        )}
      </div>

      {/* ── Player sprite — bottom-left (back) ── */}
      <div className="absolute z-[5] transition-opacity duration-300"
        style={{ left: 6, bottom: 24, opacity: pKO ? 0.22 : 1 }}>
        <img
          src={getBackSpriteUrl(pf.pokemon.id)}
          alt={pf.pokemon.name}
          style={{
            width: 120, height: 120,
            imageRendering: 'pixelated',
            objectFit: 'contain',
            filter: pKO ? 'grayscale(1)' : undefined,
          }}
        />
        {pKO && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-game text-[7px] bg-black/50 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">KO</span>
          </div>
        )}
      </div>

      {/* ── Player info box — bottom-right ── */}
      <div className="absolute bottom-3 right-3 z-10" style={{ maxWidth: 160 }}>
        <div className="rounded-2xl overflow-hidden border border-white/30"
          style={{ backgroundColor: 'rgba(251,245,230,0.93)', boxShadow: '2px 2px 0 rgba(44,24,16,0.18)' }}>
          <div className="px-2.5 pt-2 pb-1.5">
            <div className="flex items-center gap-1.5 mb-[5px]">
              <p className="font-black text-[11px] text-ink uppercase tracking-tight leading-none truncate flex-1 min-w-0">
                {pf.pokemon.name}
              </p>
              <StatusPill status={effects.playerStatus} />
            </div>
            <div style={{ width: 124 }}>
              <HPBar current={pf.hearts} max={pf.pokemon.hearts} />
            </div>
            <div className="mt-[5px]">
              <HeartsDisplay total={pf.pokemon.hearts} current={pf.hearts} size="sm" />
            </div>
            <EffectBadges effects={effects} side="player" />
          </div>
          <div className="flex gap-1 px-2.5 pb-2">
            {playerFighters.map((f, i) => (
              <span key={i} className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: i === playerIdx ? getTypeColor(f.pokemon.type1) : f.hearts > 0 ? '#A8A878' : 'transparent',
                  border: f.hearts <= 0 ? '1.5px solid rgba(44,24,16,0.25)' : '1.5px solid rgba(44,24,16,0.35)',
                }} />
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Move description helper ──────────────────────────────────────────────────

function getMoveDescription(move: Move): string {
  if (move.special === 'protect') return 'Bloqueia o próximo ataque inimigo por 1 turno. Entra em cooldown após o uso.'
  if (move.kind === 'offensive' && move.drain) return `Golpe ${move.type}. Restaura metade do dano causado como ♥.`
  if (move.kind === 'offensive') return `Golpe ${move.type}. Causa dano com base na efetividade de tipos.`
  if (move.kind === 'status' && move.statusEffect) {
    const label: Record<string, string> = {
      poison: 'veneno (−0.5♥/turno)',
      paralysis: 'paralisia (30% de perder o turno)',
      sleep: 'sono (perde turnos até acordar)',
      freeze: 'congelamento (perde turnos até descongelar)',
      burn: 'queimadura (−0.5♥/turno)',
    }
    return `Aplica ${label[move.statusEffect] ?? move.statusEffect} no alvo.`
  }
  if (move.kind === 'buff' && move.buffEffect) {
    const stat = move.buffEffect.stat === 'attack' ? 'ataque' : 'defesa'
    const dir = move.buffEffect.delta > 0 ? 'aumenta' : 'reduz'
    const who = move.buffEffect.target === 'self' ? 'próprio' : 'do oponente'
    return `${dir.charAt(0).toUpperCase() + dir.slice(1)} o ${stat} ${who} no próximo turno.`
  }
  return `Golpe ${move.type}.`
}

// ─── Move List Buttons ────────────────────────────────────────────────────────

function MoveListRow({
  rps, pokemon, disabled, protectOnCooldown, onClick,
}: {
  rps: RPS; pokemon: PokemonCard; disabled: boolean; protectOnCooldown: boolean; onClick: () => void
}) {
  const [showInfo, setShowInfo] = useState(false)
  const move = pokemon.moves[rps]
  const tc = getTypeColor(move.type)
  const isProtect = move.special === 'protect'
  const onCooldown = isProtect && protectOnCooldown
  const desc = getMoveDescription(move)

  return (
    <div className="relative flex items-stretch gap-2">
      {/* Info button */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowInfo(v => !v) }}
        className="w-8 shrink-0 rounded-xl border-2 border-ink/15 bg-white/80 flex items-center justify-center cursor-pointer hover:border-ink/40 transition-colors"
      >
        <span className="font-black text-[11px] text-ink/40">i</span>
      </button>

      {/* Attack button */}
      <button
        onClick={onClick}
        disabled={disabled || onCooldown}
        className="flex-1 flex items-center gap-2.5 border-2 border-ink rounded-xl px-3 py-2.5 bg-white text-left transition-all duration-75 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none overflow-hidden"
        style={{
          boxShadow: disabled || onCooldown ? 'none' : '3px 3px 0 #2C1810',
          borderLeftColor: tc,
          borderLeftWidth: 4,
        }}
      >
        <span className="text-xl leading-none shrink-0">{RPS_ICON[rps]}</span>
        <p className="font-black text-[11px] text-ink truncate leading-tight flex-1">{move.name}</p>
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-game text-[6px] px-1.5 py-[3px] rounded-full leading-none"
            style={{ backgroundColor: tc, color: getTypeTextColor(move.type) }}>
            {move.type}
          </span>
          {onCooldown && <span className="font-game text-[6px] px-1 py-[2px] rounded border border-ink/30 text-ink/50 leading-none">CD</span>}
          {move.kind === 'buff' && !isProtect && <span className="font-game text-[6px] px-1 py-[2px] rounded leading-none" style={{ border: `1px solid ${tc}`, color: tc }}>BUFF</span>}
          {move.kind === 'status' && <span className="font-game text-[6px] px-1 py-[2px] rounded leading-none" style={{ border: `1px solid ${tc}`, color: tc }}>STATUS</span>}
        </div>
      </button>

      {/* Info tooltip */}
      {showInfo && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1.5 z-50 rounded-xl px-3 py-2 border-2 border-ink/10"
          style={{ backgroundColor: '#2C1810' }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-game text-[7px] uppercase tracking-widest mb-1" style={{ color: tc }}>{move.name}</p>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,245,230,0.75)' }}>{desc}</p>
          <button className="mt-1.5 font-game text-[7px] text-white/30 cursor-pointer" onClick={() => setShowInfo(false)}>fechar ×</button>
        </div>
      )}
    </div>
  )
}

function UniqueListRow({
  pokemon, used, forced, cooldown, onClick,
}: {
  pokemon: PokemonCard; used: boolean; forced: boolean; cooldown: boolean; onClick: () => void
}) {
  const [showInfo, setShowInfo] = useState(false)
  const unique = pokemon.unique

  if (!unique) {
    return (
      <div className="flex items-center gap-2 border-2 border-dashed border-ink/12 rounded-xl px-3 py-2.5 opacity-25 select-none">
        <div className="w-8 shrink-0 flex items-center justify-center">
          <span className="font-black text-[11px] text-ink/40">i</span>
        </div>
        <span className="text-xl leading-none shrink-0">⚡</span>
        <p className="font-game text-[8px] text-ink/40 uppercase tracking-wide">Sem ataque único</p>
      </div>
    )
  }

  const disabled = used || forced || cooldown
  const tc = getTypeColor(unique.type)
  const statusLabel = used ? '1× por batalha — usado' : cooldown ? 'Recarregando...' : null

  return (
    <div className="relative flex items-stretch gap-2">
      {/* Info button */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowInfo(v => !v) }}
        className="w-8 shrink-0 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-colors"
        style={{ borderColor: disabled ? 'rgba(44,24,16,0.15)' : tc, backgroundColor: disabled ? '#F5EDD8' : `${tc}20` }}
      >
        <span className="font-black text-[11px]" style={{ color: disabled ? 'rgba(44,24,16,0.3)' : tc }}>i</span>
      </button>

      {/* Z-move style button */}
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-75 disabled:cursor-not-allowed cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none overflow-hidden"
        style={disabled
          ? { border: '2px dashed rgba(44,24,16,0.18)', backgroundColor: '#F5EDD8', boxShadow: 'none', opacity: 0.45 }
          : { border: `2px solid ${tc}`, backgroundColor: 'white', boxShadow: `3px 3px 0 ${tc}` }
        }
      >
        {/* Unique badge */}
        <div className="shrink-0 w-9 h-7 rounded-lg flex items-center justify-center"
          style={{ background: disabled ? 'rgba(44,24,16,0.08)' : `linear-gradient(135deg, ${tc}, ${tc}99)` }}>
          <span className="text-lg leading-none">⚡</span>
        </div>
        <p className="font-black text-[11px] text-ink truncate leading-tight flex-1">{unique.name}</p>
        <div className="flex items-center gap-1 shrink-0">
          {!disabled ? (
            <>
              <span className="font-game text-[6px] px-1.5 py-[3px] rounded-full leading-none"
                style={{ backgroundColor: tc, color: getTypeTextColor(unique.type) }}>
                {unique.type}
              </span>
              <span className="font-game text-[6px] px-1 py-[2px] rounded leading-none"
                style={{ border: `1px solid ${tc}`, color: tc }}>ÚNICO</span>
            </>
          ) : statusLabel ? (
            <span className="font-game text-[7px] text-ink/40">{statusLabel}</span>
          ) : null}
        </div>
      </button>

      {/* Info tooltip */}
      {showInfo && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1.5 z-50 rounded-xl px-3 py-2 border-2 border-ink/10"
          style={{ backgroundColor: '#2C1810' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-game text-[7px] uppercase tracking-widest" style={{ color: tc }}>{unique.name}</span>
            <span className="font-game text-[6px] px-1.5 py-[2px] rounded-full leading-none"
              style={{ backgroundColor: `${tc}30`, color: tc }}>ÚNICO</span>
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,245,230,0.75)' }}>{unique.description}</p>
          <button className="mt-1.5 font-game text-[7px] text-white/30 cursor-pointer" onClick={() => setShowInfo(false)}>fechar ×</button>
        </div>
      )}
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
  const [showSwitchPicker, setShowSwitchPicker] = useState(false)
  const [switchRequired, setSwitchRequired] = useState(false) // true após faint — picker não pode ser dispensado
  const [uniqueUsed, setUniqueUsed] = useState<boolean[]>([])
  const [phase, setPhase] = useState<LocalPhase>('selecting')
  const [turn, setTurn] = useState(1)
  const [moveHistory, setMoveHistory] = useState<RPS[]>([])
  const [effects, setEffects] = useState<BattleEffects>(DEFAULT_EFFECTS)
  const [lastResult, setLastResult] = useState<TurnResult | null>(null)
  const [entryMsg, setEntryMsg] = useState<string | null>(null)
  const [showAbilityInfo, setShowAbilityInfo] = useState(false)
  // Visual tell: move do inimigo pré-computado (tipo exibido como "aura" durante seleção)
  const [precomputedEnemyRPS, setPrecomputedEnemyRPS] = useState<RPS | null>(null)

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

  // Pré-computa o RPS do inimigo ao entrar em fase de seleção (visual tell)
  useEffect(() => {
    if (phase !== 'selecting' || !battle) return
    const gym = GYM_LEADERS[currentFloor]
    if (!gym) return
    const forced = effects.enemyTiredTurns > 0 ? 'rock' as RPS
      : (effects.enemyForcedMove && effects.enemyForcedTurnsLeft > 0 ? effects.enemyForcedMove : null)
    const rps = forced ?? generateAIMove(gym.aiLevel, moveHistory, null)
    setPrecomputedEnemyRPS(rps)
  }, [phase, enemyIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const gym = GYM_LEADERS[currentFloor]
  if (!battle || !gym || playerFighters.length === 0 || enemyFighters.length === 0) return null

  const typeColor = getTypeColor(gym.specialtyType)
  const pf = playerFighters[playerIdx]
  const ef = enemyFighters[enemyIdx]
  // Visual tell desabilitado por ora — código mantido para reativar quando necessário
  // const enemyTellColor = (phase === 'selecting' && precomputedEnemyRPS && ef)
  //   ? getTypeColor(ef.pokemon.moves[precomputedEnemyRPS].type) : null
  const enemyTellColor = null

  const ps = effects.playerStatus
  const playerIsSleeping = ps?.condition === 'sleep'
  const playerIsForcedByStatus = ps?.condition === 'freeze'  // sleep tem botões habilitados
  const playerIsForced = playerIsForcedByStatus || effects.playerTiredTurns > 0

  // ── Core battle logic ────────────────────────────────────────────────────────

  function handleAttack(move: PlayerMove) {
    if (phase !== 'selecting') return

    const activations: string[] = []
    if (entryMsg) { activations.push(entryMsg); setEntryMsg(null) }

    const turnStart = processTurnStart(effects, pf, ef)
    let eff = turnStart.effects
    activations.push(...turnStart.messages)

    let newPHearts = Math.max(0, pf.hearts - turnStart.playerHeartsLost)
    // Aqua Ring / cura passiva do processTurnStart
    if (turnStart.playerHeartsGained > 0) {
      newPHearts = Math.min(pf.pokemon.hearts, newPHearts + turnStart.playerHeartsGained)
    }
    let newEHearts = Math.max(0, ef.hearts - turnStart.enemyHeartsLost)

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

    const chosenMove = (!playerForcedThisTurn && !isUnique) ? pf.pokemon.moves[playerRPS] : null
    const isProtect = chosenMove?.special === 'protect' && !eff.playerProtectCooldown
    eff = { ...eff, playerProtectCooldown: false }

    const aiMove = turnStart.enemyForcedRps ?? precomputedEnemyRPS ?? generateAIMove(gym.aiLevel, moveHistory, null)
    const enemyIsProtect = ef.pokemon.moves[aiMove].special === 'protect' && !eff.enemyProtectCooldown
    eff = { ...eff, enemyProtectCooldown: false }
    if (enemyIsProtect) eff = { ...eff, enemyProtectCooldown: true }

    let outcome: 'player_wins' | 'enemy_wins' | 'tie'
    if (isUnique && !playerForcedThisTurn) {
      outcome = 'player_wins'
    } else {
      outcome = resolveRPS(playerRPS, aiMove)
    }

    // Enemy sleep/freeze → player wins automatically (null turn, symmetric to player sleep)
    if (turnStart.enemyAutoLose) outcome = 'player_wins'

    // Player sleep/freeze/tired → enemy wins automatically
    if (playerForcedThisTurn) {
      const forcedBySleepOrFreeze = eff.playerStatus?.condition === 'sleep' || eff.playerStatus?.condition === 'freeze'
      const forcedByTired = effects.playerTiredTurns > 0
      if (forcedBySleepOrFreeze || forcedByTired) outcome = 'enemy_wins'
    }

    let playerDmg = 0
    let enemyDmg = 0
    let multiplier = 1

    if (isProtect) {
      eff = { ...eff, playerProtectCooldown: true }
      activations.push(`🛡️ Protect! Dano bloqueado este turno!`)
    }
    if (enemyIsProtect) {
      activations.push(`🛡️ ${ef.pokemon.name} usou Protect! Ataque bloqueado!`)
    }

    // ── Player wins ──────────────────────────────────────────────────────────
    if (outcome === 'player_wins' && !enemyIsProtect) {
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
        // Novos flags
        if (uRes.activateShellSmash) eff = { ...eff, playerShellSmashTurns: 3 }
        if (uRes.activateAquaRing) eff = { ...eff, playerAquaRingActive: true, playerAquaRingHealIn: 2 }
        if (uRes.activateDestinyBond) eff = { ...eff, playerDestinyBond: true }

        if (uRes.benchDamage > 0) {
          setEnemyFighters(prev => prev.map((f, i) =>
            i === enemyIdx ? f : { ...f, hearts: Math.max(0, f.hearts - uRes.benchDamage) }
          ))
          activations.push(`💥 Dano de área na reserva inimiga!`)
        }

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
        newEHearts = Math.max(0, newEHearts - enemyDmg)

      } else if (chosenMove && !playerForcedThisTurn) {
        const attackType = chosenMove.type
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

            if (chosenMove.drain && enemyDmg > 0) {
              const heal = Math.floor(enemyDmg / 2)
              newPHearts = Math.min(pf.pokemon.hearts, newPHearts + heal)
              activations.push(`🍃 Absorção +${heal} ♥!`)
            }

            if (attackType === 'Fire') {
              const { effects: newEff, thawed } = applyThaw(eff, 'enemy', attackType)
              eff = newEff
              if (thawed) activations.push(`🔥 ${ef.pokemon.name} descongelou!`)
            }
          } else {
            const sideEff = applySlotMoveEffect(chosenMove, 'player', eff, ef.pokemon)
            eff = sideEff.effects
            if (sideEff.message) activations.push(sideEff.message)
          }

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

        if (attackType === 'Fire') {
          const { effects: newEff, thawed } = applyThaw(eff, 'player', attackType)
          eff = newEff
          if (thawed) activations.push(`🔥 ${pf.pokemon.name} descongelou!`)
        }

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
    }

    // Destiny Bond: se o jogador cair, o inimigo também cai
    if (newPHearts <= 0 && eff.playerDestinyBond) {
      newEHearts = 0
      eff = { ...eff, playerDestinyBond: false }
      activations.push(`💀 Destiny Bond! ${ef.pokemon.name} também é derrotado!`)
    }

    const lostTurn = playerForcedThisTurn && outcome === 'enemy_wins' && (
      eff.playerStatus?.condition === 'sleep' ||
      eff.playerStatus?.condition === 'freeze' ||
      effects.playerTiredTurns > 0
    )
    const enemyLostTurn = turnStart.enemyAutoLose && outcome === 'player_wins'

    setPlayerFighters(prev => prev.map((f, i) => i === playerIdx ? { ...f, hearts: newPHearts } : f))
    setEnemyFighters(prev => prev.map((f, i) => i === enemyIdx ? { ...f, hearts: newEHearts } : f))
    setEffects(eff)
    if (!lostTurn) setMoveHistory(h => [...h, playerRPS])
    setLastResult({ playerMove: move, enemyMove: aiMove, outcome, playerDmg, enemyDmg, multiplier, activations, lostTurn, enemyLostTurn })
    setPhase('result')
  }

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
      const hasAlive = playerFighters.some((f, i) => i !== playerIdx && f.hearts > 0)
      if (!hasAlive) { setPhase('defeat'); return }
      // Jogador escolhe qual pokemon envia — picker obrigatório, não pode ser dispensado
      setSwitchRequired(true)
      setShowSwitchPicker(true)
      return
    }

    setLastResult(null)
    setTurn(t => t + 1)
    setPhase('selecting')
  }

  function handleSwitch() {
    if (playerFighters.filter(f => f.hearts > 0).length <= 1) return
    setSwitchRequired(false)
    setShowSwitchPicker(true)
  }

  // Troca voluntária: inimigo ataca o pokemon que entrou (turno gasto)
  function handleSwitchTurn(targetIdx: number) {
    setShowSwitchPicker(false)
    setSwitchRequired(false)

    const incoming = playerFighters[targetIdx]
    const activations: string[] = [`🔄 ${incoming.pokemon.name} entrou em campo!`]

    const { newEffects: entryEffects, message: entryMessage } = applyEntryEffects(incoming.pokemon, 'player', effects)
    let eff: BattleEffects = { ...entryEffects, playerStatus: null, playerTiredTurns: 0, playerSturdyUsed: false }
    if (entryMessage) activations.push(entryMessage)

    // Inimigo ataca de graça com o move pré-computado
    const aiMove = precomputedEnemyRPS ?? generateAIMove(gym.aiLevel, moveHistory, null)
    const attackType = ef.pokemon.moves[aiMove].type
    const pAbility = incoming.pokemon.ability.name

    let newPHearts = incoming.hearts
    let playerDmg = 0
    let multiplier = 1
    let immune = false

    if (pAbility === 'VoltAbsorb' && attackType === 'Electric') {
      immune = true; multiplier = 0
      newPHearts = Math.min(incoming.pokemon.hearts, newPHearts + 1)
      activations.push(`🔋 VoltAbsorb! ${incoming.pokemon.name} absorveu e recuperou 1 ♥!`)
    } else if (pAbility === 'WaterAbsorb' && attackType === 'Water') {
      immune = true; multiplier = 0
      newPHearts = Math.min(incoming.pokemon.hearts, newPHearts + 1)
      activations.push(`💧 WaterAbsorb! ${incoming.pokemon.name} absorveu e recuperou 1 ♥!`)
    } else if (pAbility === 'FlashFire' && attackType === 'Fire') {
      immune = true; multiplier = 0; eff = { ...eff, flashFireActive: true }
      activations.push(`🔥 FlashFire! ${incoming.pokemon.name} é imune! Fogo potencializado!`)
    } else if (pAbility === 'Levitate' && attackType === 'Ground') {
      immune = true; multiplier = 0
      activations.push(`🌬️ Levitate! ${incoming.pokemon.name} flutua sobre o ataque!`)
    } else if (pAbility === 'Lightning Rod' && Math.random() < 0.40) {
      immune = true; multiplier = 0
      activations.push(`⚡ Lightning Rod! ${incoming.pokemon.name} absorveu o golpe!`)
    }

    if (!immune) {
      const slotRes = calcSlotDamage(
        attackType, ef.pokemon, ef.hearts, incoming.pokemon, false,
        eff.enemyAttackMod, eff.playerDefenseMod,
      )
      playerDmg = slotRes.damage
      multiplier = slotRes.multiplier
      activations.push(...slotRes.messages)
      eff = { ...eff, enemyAttackMod: 0, playerDefenseMod: 0 }

      if (attackType === 'Fire') {
        const { effects: newEff, thawed } = applyThaw(eff, 'player', attackType)
        eff = newEff
        if (thawed) activations.push(`🔥 ${incoming.pokemon.name} descongelou!`)
      }

      const { damage: finalDmg, sturdyTriggered } = applySturdy(
        playerDmg, newPHearts, eff.playerSturdyUsed, pAbility === 'Sturdy',
      )
      if (sturdyTriggered) {
        eff = { ...eff, playerSturdyUsed: true }
        activations.push(`🛡️ Sturdy! ${incoming.pokemon.name} sobreviveu com 1 ♥!`)
      }
      playerDmg = finalDmg
      newPHearts = Math.max(0, newPHearts - playerDmg)
    }

    setPlayerIdx(targetIdx)
    setPlayerFighters(prev => prev.map((f, i) => i === targetIdx ? { ...f, hearts: newPHearts } : f))
    setEffects(eff)
    setLastResult({
      playerMove: 'rock',
      enemyMove: aiMove,
      outcome: 'enemy_wins',
      playerDmg,
      enemyDmg: 0,
      multiplier,
      activations,
      lostTurn: false,
      enemyLostTurn: false,
      switchedIn: incoming.pokemon.name,
    })
    setPhase('result')
  }

  // Troca após faint: grátis, sem golpe do inimigo
  function confirmSwitch(targetIdx: number) {
    setShowSwitchPicker(false)
    setSwitchRequired(false)
    setPlayerIdx(targetIdx)
    const { newEffects, message } = applyEntryEffects(playerFighters[targetIdx].pokemon, 'player', effects)
    setEffects({ ...newEffects, playerStatus: null, playerTiredTurns: 0, playerSturdyUsed: false })
    if (message) setEntryMsg(message)
    setLastResult(null)
    setTurn(t => t + 1)
    setPhase('selecting')
  }

  // ── Derived display values ──────────────────────────────────────────────────

  const forcedLabel = (() => {
    if (ps?.condition === 'freeze')    return `🧊 ${pf.pokemon.name} está congelado — turno perdido!`
    if (effects.playerTiredTurns > 0)  return `💤 ${pf.pokemon.name} está exausto — turno perdido!`
    return null
  })()

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-parchment relative overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-20 border-b-4 border-ink px-4 py-3"
        style={{ backgroundColor: typeColor }}>
        <div className="max-w-[640px] mx-auto flex items-center justify-between gap-3">
          <button onClick={() => router.push('/torre')}
            className="border-2 border-white/30 rounded-full px-3 py-1.5 font-game text-[7px] text-white bg-white/15 hover:bg-white/25 transition-all shrink-0 cursor-pointer">
            ← Fugir
          </button>
          <div className="flex-1 text-center min-w-0">
            <p className="font-game text-[6px] text-white/60 uppercase tracking-widest leading-none mb-0.5">
              Andar {currentFloor + 1}/12
            </p>
            <p className="font-black text-sm text-white uppercase tracking-wide leading-tight truncate">
              {gym.name} — {gym.specialtyType}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-game text-[6px] text-white/60 uppercase tracking-widest leading-none mb-0.5">Turno</p>
            <p className="font-black text-xl text-white leading-none">{turn}</p>
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 pt-4 pb-28 flex flex-col gap-3">

        {/* ── ARENA ── */}
        <BattleArena
          pf={pf} ef={ef}
          effects={effects}
          typeColor={typeColor}
          playerFighters={playerFighters}
          enemyFighters={enemyFighters}
          playerIdx={playerIdx}
          enemyIdx={enemyIdx}
          phase={phase}
          enemyTellType={enemyTellColor}
        />

        {/* ── VICTORY ── */}
        {phase === 'victory' && (
          <div className="rounded-3xl border-2 border-ink overflow-hidden text-center p-8"
            style={{ backgroundColor: '#3CC840', boxShadow: '6px 6px 0 #2C1810' }}>
            <p className="text-6xl mb-3">🏆</p>
            <p className="font-black text-2xl text-white uppercase tracking-tight">Você venceu!</p>
            <p className="text-base text-white/80 mt-2 mb-6">
              {gym.badge ? `${gym.badge} conquistada!` : `${gym.name} foi derrotado!`}
            </p>
            <button
              onClick={() => { endBattle('win'); router.push(currentFloor >= 11 ? '/entre-andares' : '/pos-batalha') }}
              className="w-full py-4 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl bg-white text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
              {currentFloor >= 11 ? '🏆 Ver resultado final →' : 'Pegar novo Pokémon →'}
            </button>
          </div>
        )}

        {/* ── DEFEAT ── */}
        {phase === 'defeat' && (() => {
          const selectedIds = new Set(battle.playerSelected.map(p => p.id))
          const hardSurvivors = playerDeck.filter(p => !selectedIds.has(p.id) && p.hearts > 0 && !p.isFainted)
          function handleNormalRetry()      { incrementDeathCount(); endBattle('lose'); router.push('/torre') }
          function handleHardSecondChance() { incrementDeathCount(); endBattle('lose'); router.push('/torre') }
          function handleGiveUp()           { endBattle('lose'); router.push('/') }

          if (mode === 'hard' && hardSurvivors.length > 0) {
            return (
              <div className="rounded-3xl border-2 border-ink overflow-hidden"
                style={{ backgroundColor: '#CC2200', boxShadow: '6px 6px 0 #2C1810' }}>
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
                        <img src={getSpriteUrl(p.id)} alt={p.name} style={{ width: 56, height: 56, objectFit: 'contain' }} />
                        <p className="font-game text-[6px] text-white/80 uppercase">{p.name}</p>
                        <HeartsDisplay total={p.hearts} current={p.hearts} size="sm" />
                      </div>
                    ))}
                  </div>
                  <button onClick={handleHardSecondChance}
                    className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase border-2 border-ink rounded-2xl bg-white text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                    ⚔️ Segunda chance com sobreviventes
                  </button>
                  <button onClick={handleGiveUp} className="font-game text-[8px] text-white/50 uppercase tracking-widest py-2 text-center cursor-pointer">
                    🏳️ Desistir da run
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div className="rounded-3xl border-2 border-ink overflow-hidden text-center p-8"
              style={{ backgroundColor: '#CC2200', boxShadow: '6px 6px 0 #2C1810' }}>
              <p className="text-6xl mb-3">💀</p>
              <p className="font-black text-2xl text-white uppercase tracking-tight">Você perdeu</p>
              <p className="text-base text-white/80 mt-2 mb-6">{gym.name} foi mais forte desta vez.</p>
              {mode === 'normal' ? (
                <div className="flex flex-col gap-3">
                  <button onClick={handleNormalRetry}
                    className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase border-2 border-ink rounded-2xl bg-white text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                    🔄 Continuar (volta à seleção)
                  </button>
                  <button onClick={handleGiveUp} className="font-game text-[8px] text-white/60 uppercase tracking-widest py-2 cursor-pointer">
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

        {/* ── DIALOG + BOTTOM PANEL ── */}
        {phase !== 'victory' && phase !== 'defeat' && (
          <>
            {/* Dialog box */}
            <div className="border-2 border-ink rounded-2xl bg-parchment-light px-4 py-3 shadow-neo-sm">
              {phase === 'selecting' && (
                <div className="flex flex-col gap-2">
                  {forcedLabel ? (
                    <p className="font-game text-[9px] text-ink-soft uppercase tracking-widest leading-relaxed">{forcedLabel}</p>
                  ) : playerIsSleeping ? (
                    <div>
                      <p className="font-black text-base text-ink leading-tight">
                        😴 <span style={{ color: STATUS_BG['sleep'] }}>{pf.pokemon.name}</span> está dormindo
                      </p>
                      <p className="font-game text-[8px] uppercase tracking-widest leading-none mt-1" style={{ color: STATUS_BG['sleep'] }}>
                        35% de acordar — escolha o ataque!
                      </p>
                    </div>
                  ) : (
                    <p className="font-black text-base text-ink leading-tight">
                      O que <span style={{ color: typeColor }}>{pf.pokemon.name}</span> vai fazer?
                    </p>
                  )}
                  {effects.playerStatus?.condition === 'paralysis' && !playerIsForced && (
                    <p className="font-game text-[8px] uppercase tracking-widest leading-none"
                      style={{ color: STATUS_BG['paralysis'] }}>
                      ⚡ {pf.pokemon.name} está paralisado — 30% de travar
                    </p>
                  )}

                  {/* Ability info (expandable) */}
                  <button
                    className="flex items-center gap-1.5 mt-0.5 text-left w-fit cursor-pointer"
                    onClick={() => setShowAbilityInfo(v => !v)}>
                    <span className="font-game text-[7px] text-ink/35 uppercase tracking-wide">Hab.</span>
                    <span className="font-bold text-[10px] text-ink/70">{pf.pokemon.ability.name}</span>
                    <span className="font-game text-[8px] text-ink/30">{showAbilityInfo ? '▲' : '▼'}</span>
                  </button>
                  {showAbilityInfo && (
                    <p className="text-[11px] text-ink/60 leading-relaxed border-t border-ink/10 pt-2">
                      {pf.pokemon.ability.description}
                    </p>
                  )}
                </div>
              )}

              {phase === 'result' && lastResult && (() => {
                const cfg = {
                  player_wins: { color: '#2AAA2A', label: lastResult.enemyLostTurn ? '😴 Inimigo perdeu o turno!' : '🏆 Você venceu este turno!' },
                  enemy_wins:  { color: '#CC2200', label: lastResult.switchedIn ? `🔄 Troca! ${ef.pokemon.name} atacou!` : lastResult.lostTurn ? '😴 Turno perdido' : '💥 Inimigo venceu este turno' },
                  tie:         { color: '#888870', label: '🤝 Empate — ninguém atacou' },
                }[lastResult.outcome]
                const wasUnique = lastResult.playerMove === 'unique'
                const playerRpsKey = wasUnique ? null : lastResult.playerMove as RPS
                return (
                  <div className="flex flex-col gap-1">
                    <p className="font-black text-base text-ink leading-tight">{cfg.label}</p>
                    {!wasUnique && !lastResult.lostTurn && !lastResult.enemyLostTurn && !lastResult.switchedIn && lastResult.outcome !== 'tie' && (
                      <p className="font-game text-[9px] leading-none" style={{ color: cfg.color }}>
                        {getBeatLabel(
                          lastResult.outcome === 'player_wins' ? playerRpsKey! : lastResult.enemyMove,
                          lastResult.outcome === 'player_wins' ? lastResult.enemyMove : playerRpsKey!,
                        )}
                      </p>
                    )}
                    {wasUnique && lastResult.outcome === 'player_wins' && (
                      <p className="font-game text-[9px] leading-none" style={{ color: cfg.color }}>
                        ⚡ Ataque único sempre vence o Jokenpô
                      </p>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* ── SELECTING: move list + aux ── */}
            {phase === 'selecting' && (
              <div className="flex flex-col gap-2">
                {/* When forced (sleep/freeze/tired): confirm button instead of grayed list */}
                {playerIsForced ? (
                  <>
                    <button
                      onClick={() => handleAttack('rock')}
                      className="w-full py-4 font-black text-sm uppercase border-2 border-ink rounded-2xl cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      style={{ backgroundColor: '#F5EDD8', color: '#2C1810', boxShadow: '3px 3px 0 #2C1810' }}
                    >
                      Confirmar turno perdido ▶
                    </button>
                    <div className="flex flex-col gap-2 opacity-25 pointer-events-none select-none">
                      <MoveListRow rps="rock" pokemon={pf.pokemon} disabled protectOnCooldown={false} onClick={() => {}} />
                      <MoveListRow rps="paper" pokemon={pf.pokemon} disabled protectOnCooldown={false} onClick={() => {}} />
                      <MoveListRow rps="scissors" pokemon={pf.pokemon} disabled protectOnCooldown={false} onClick={() => {}} />
                      <UniqueListRow pokemon={pf.pokemon} used forced cooldown={false} onClick={() => {}} />
                    </div>
                  </>
                ) : (
                  /* Normal move list */
                  <div className="flex flex-col gap-2">
                    <MoveListRow
                      rps="rock"
                      pokemon={pf.pokemon}
                      disabled={false}
                      protectOnCooldown={effects.playerProtectCooldown}
                      onClick={() => handleAttack('rock')}
                    />
                    <MoveListRow
                      rps="paper"
                      pokemon={pf.pokemon}
                      disabled={false}
                      protectOnCooldown={effects.playerProtectCooldown}
                      onClick={() => handleAttack('paper')}
                    />
                    <MoveListRow
                      rps="scissors"
                      pokemon={pf.pokemon}
                      disabled={false}
                      protectOnCooldown={effects.playerProtectCooldown}
                      onClick={() => handleAttack('scissors')}
                    />
                    <UniqueListRow
                      pokemon={pf.pokemon}
                      used={uniqueUsed[playerIdx] ?? false}
                      forced={false}
                      cooldown={effects.uniqueCooldown}
                      onClick={() => handleAttack('unique')}
                    />
                  </div>
                )}

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleSwitch}
                    disabled={playerFighters.filter(f => f.hearts > 0).length <= 1}
                    className="flex-1 py-3 font-black text-sm uppercase border-2 rounded-2xl transition-all duration-75 cursor-pointer disabled:cursor-not-allowed"
                    style={playerFighters.filter(f => f.hearts > 0).length <= 1
                      ? { borderColor: 'rgba(44,24,16,0.15)', backgroundColor: '#F5EDD8', color: 'rgba(44,24,16,0.3)' }
                      : { borderColor: '#2C1810', backgroundColor: '#FBF5E6', color: '#2C1810', boxShadow: '3px 3px 0 #2C1810' }}>
                    🔄 Trocar Pokémon
                  </button>
                  <button
                    onClick={() => { endBattle('lose'); router.push('/torre') }}
                    className="px-5 py-3 font-game text-[8px] uppercase border-2 border-ink/25 rounded-2xl text-ink/45 hover:text-ink/70 hover:border-ink/50 hover:bg-white/60 transition-all cursor-pointer">
                    🏳️ Fugir
                  </button>
                </div>
              </div>
            )}

            {/* ── RESULT: clash panel + next ── */}
            {phase === 'result' && lastResult && (() => {
              const cfg = {
                player_wins: { shadowColor: '#38C838' },
                enemy_wins:  { shadowColor: '#CC2200' },
                tie:         { shadowColor: '#A8A878' },
              }[lastResult.outcome]
              const wasUnique = lastResult.playerMove === 'unique'
              const playerRpsKey = wasUnique ? null : lastResult.playerMove as RPS
              const playerIcon = wasUnique ? '⚡' : RPS_ICON[playerRpsKey!]
              const playerMoveName = wasUnique
                ? (pf.pokemon.unique?.name ?? 'Único')
                : pf.pokemon.moves[playerRpsKey!]?.name
              const playerMoveType = wasUnique
                ? pf.pokemon.unique?.type
                : pf.pokemon.moves[playerRpsKey!]?.type
              const enemyMoveName = ef.pokemon.moves[lastResult.enemyMove]?.name
              const enemyMoveType = ef.pokemon.moves[lastResult.enemyMove]?.type
              const effLabel = effectivenessLabel(lastResult.multiplier)

              return (
                <div className="flex flex-col gap-2">
                  {/* Clash cards */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Player move — ou card de troca */}
                    {lastResult.switchedIn ? (
                      <div className="rounded-2xl border-2 border-ink px-3 py-3 flex flex-col items-center gap-1.5 bg-white"
                        style={{ boxShadow: '3px 3px 0 rgba(44,24,16,0.12)' }}>
                        <span className="text-3xl leading-none">🔄</span>
                        <p className="font-black text-[11px] text-ink text-center leading-tight">{lastResult.switchedIn}</p>
                        <span className="font-game text-[7px] px-2 py-[3px] rounded-full leading-none bg-ink/10 text-ink/50">TROCA</span>
                        <p className="font-game text-[6px] text-ink/35 uppercase tracking-widest leading-none">Você</p>
                      </div>
                    ) : (
                    <div className="rounded-2xl border-2 border-ink px-3 py-3 flex flex-col items-center gap-1.5 bg-white"
                      style={{ boxShadow: lastResult.outcome === 'player_wins' ? '3px 3px 0 #38C838' : '3px 3px 0 rgba(44,24,16,0.12)' }}>
                      <span className="text-3xl leading-none">{playerIcon}</span>
                      <p className="font-black text-[11px] text-ink text-center leading-tight">{playerMoveName}</p>
                      {playerMoveType && (
                        <span className="font-game text-[7px] px-2 py-[3px] rounded-full leading-none"
                          style={{ backgroundColor: getTypeColor(playerMoveType), color: getTypeTextColor(playerMoveType) }}>
                          {playerMoveType}
                        </span>
                      )}
                      <p className="font-game text-[6px] text-ink/35 uppercase tracking-widest leading-none">Você</p>
                      {lastResult.enemyDmg > 0 && (
                        <p className="font-black text-sm leading-none" style={{ color: '#2AAA2A' }}>
                          −{lastResult.enemyDmg} ♥
                        </p>
                      )}
                    </div>
                    )}

                    {/* Enemy move */}
                    <div className="rounded-2xl border-2 border-ink px-3 py-3 flex flex-col items-center gap-1.5 bg-white"
                      style={{ boxShadow: lastResult.outcome === 'enemy_wins' ? '3px 3px 0 #CC2200' : '3px 3px 0 rgba(44,24,16,0.12)' }}>
                      <span className="text-3xl leading-none">{RPS_ICON[lastResult.enemyMove]}</span>
                      <p className="font-black text-[11px] text-ink text-center leading-tight">{enemyMoveName}</p>
                      {enemyMoveType && (
                        <span className="font-game text-[7px] px-2 py-[3px] rounded-full leading-none"
                          style={{ backgroundColor: getTypeColor(enemyMoveType), color: getTypeTextColor(enemyMoveType) }}>
                          {enemyMoveType}
                        </span>
                      )}
                      <p className="font-game text-[6px] text-ink/35 uppercase tracking-widest leading-none">{gym.name}</p>
                      {lastResult.playerDmg > 0 && (
                        <p className="font-black text-sm leading-none" style={{ color: '#CC2200' }}>
                          −{lastResult.playerDmg} ♥
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Effectiveness + activations */}
                  {(effLabel || lastResult.activations.length > 0) && (
                    <div className="rounded-2xl border border-ink/12 bg-white px-4 py-3 flex flex-col gap-1.5">
                      {effLabel && (
                        <p className="font-black text-sm text-center"
                          style={{ color: lastResult.multiplier >= 2 ? '#D4A000' : '#888870' }}>
                          {effLabel}
                        </p>
                      )}
                      {lastResult.activations.map((msg, i) => (
                        <p key={i} className="font-game text-[8px] text-ink/60 text-center leading-relaxed">{msg}</p>
                      ))}
                    </div>
                  )}

                  {/* Next button */}
                  <button
                    onClick={handleNext}
                    className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase border-2 border-ink rounded-2xl bg-parchment-light text-ink transition-all duration-75 cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    style={{ boxShadow: `4px 4px 0 ${cfg.shadowColor}` }}>
                    {ef.hearts <= 0 && enemyIdx + 1 < enemyFighters.length
                      ? `${gym.name} envia próximo Pokémon →`
                      : pf.hearts <= 0 && playerFighters.some((f, i) => i !== playerIdx && f.hearts > 0)
                      ? 'Escolher próximo Pokémon →'
                      : 'Próximo Turno →'}
                  </button>
                </div>
              )
            })()}
          </>
        )}

      </div>

      {/* ── SWITCH PICKER OVERLAY ── */}
      {showSwitchPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(44,24,16,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => { if (!switchRequired) setShowSwitchPicker(false) }}>
          <div className="w-full max-w-[640px] rounded-t-3xl border-t-4 border-x-4 border-ink p-5 pb-10"
            style={{ backgroundColor: '#FBF5E6' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-ink/20 mx-auto mb-5" />
            <p className="font-black text-lg text-ink uppercase tracking-tight text-center mb-1">
              {switchRequired ? 'Próximo Pokémon!' : 'Trocar Pokémon'}
            </p>
            <p className="font-game text-[7px] text-ink-soft opacity-50 uppercase tracking-widest text-center mb-5">
              {switchRequired
                ? 'Seu Pokémon caiu — escolha o próximo'
                : 'Escolha quem entra · Inimigo atacará de graça'}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {playerFighters.map((fighter, idx) => {
                const tc = getTypeColor(fighter.pokemon.type1)
                const isCurrent  = idx === playerIdx
                const isKO       = fighter.hearts <= 0
                const selectable = !isCurrent && !isKO
                return (
                  <button key={idx}
                    onClick={() => selectable && (switchRequired ? confirmSwitch(idx) : handleSwitchTurn(idx))}
                    disabled={!selectable}
                    className="flex flex-col items-center gap-2 border-2 rounded-2xl p-3 transition-all duration-75"
                    style={{
                      borderColor: isCurrent ? tc : isKO ? 'rgba(44,24,16,0.2)' : '#2C1810',
                      backgroundColor: isCurrent ? `${tc}20` : isKO ? '#E8E0CC' : 'white',
                      opacity: isKO ? 0.4 : 1,
                      boxShadow: selectable ? '3px 3px 0 #2C1810' : 'none',
                      cursor: selectable ? 'pointer' : 'default',
                    }}>
                    <img src={getSpriteUrl(fighter.pokemon.id)} alt={fighter.pokemon.name}
                      style={{ width: 64, height: 64, objectFit: 'contain' }} />
                    <div className="text-center">
                      <p className="font-black text-[10px] text-ink uppercase tracking-tight leading-tight">
                        {fighter.pokemon.name}
                      </p>
                      <div className="flex justify-center mt-1">
                        <HeartsDisplay total={fighter.pokemon.hearts} current={fighter.hearts} size="sm" />
                      </div>
                      {isCurrent && (
                        <span className="font-game text-[6px] uppercase tracking-widest mt-1 block" style={{ color: tc }}>
                          Em campo
                        </span>
                      )}
                      {isKO && (
                        <span className="font-game text-[6px] uppercase tracking-widest mt-1 block text-ink/40">
                          Nocauteado
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
