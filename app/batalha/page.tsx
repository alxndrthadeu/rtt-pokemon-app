'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { AbandonConfirmModal } from '@/components/AbandonConfirmModal'
import { GYM_LEADERS } from '@/lib/data/gyms'
import { getTypeColor, getTypeTextColor, getPixelSpriteUrl, getSpriteUrl, RPS_ICON } from '@/lib/typeColors'
import {
  BattleEffects, DEFAULT_EFFECTS, Fighter,
  processTurnStart, calcUniqueResult, calcSlotDamage, applySlotMoveEffect,
  applySturdy, applyThaw, applyEntryEffects,
  getLifeOrbRecoil, getShellBellHeal, checkKingsRock,
  applyFocusSash, getRockyHelmetRecoil, checkQuickClaw,
  StatusState,
} from '@/lib/battleEngine'
import type { PokemonCard, Move, UniqueMove, RPS, AILevel, StatusCondition, HazardState, SlotState, SideState } from '@/types'

// ─── BattleEffects patch helpers ─────────────────────────────────────────────

function patchSlot(e: BattleEffects, idx: 0 | 1, p: Partial<SlotState>): BattleEffects {
  const s: [SlotState, SlotState] = [{ ...e.slots[0] }, { ...e.slots[1] }]
  s[idx] = { ...s[idx], ...p }
  return { ...e, slots: s }
}
function patchSide(e: BattleEffects, idx: 0 | 1, p: Partial<SideState>): BattleEffects {
  const s: [SideState, SideState] = [{ ...e.sides[0] }, { ...e.sides[1] }]
  s[idx] = { ...s[idx], hazards: { ...s[idx].hazards }, ...p }
  return { ...e, sides: s }
}

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

function getAnimatedFrontUrl(id: number): string {
  const realId = id === 9025 ? 25 : id
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${realId}.gif`
}

function getAnimatedBackUrl(id: number): string {
  const realId = id === 9025 ? 25 : id
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${realId}.gif`
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
  lostTurn: boolean          // player congelou/exausto — forçado a jogar pedra, perdeu
  playerSkippedTurn: boolean // player dormindo — turno nulo, tomou o ataque
  enemyLostTurn: boolean     // inimigo dormiu/congelou — player vence automaticamente
  switchedIn?: string        // nome do pokemon que entrou via troca voluntária
  playerProtected: boolean   // player usou Protect com sucesso neste turno
  enemyProtected: boolean    // inimigo usou Protect com sucesso neste turno
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

// ─── Pokéball pixel art — party indicator ────────────────────────────────────
function PartyBall({ alive, active, color }: { alive: boolean; active?: boolean; color?: string }) {
  if (!alive) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: 'pixelated', flexShrink: 0 }}>
        <circle cx="8" cy="8" r="7" fill="#888870" stroke="#5C5C50" strokeWidth="1.5"/>
        <rect x="1.5" y="7" width="13" height="2" fill="#5C5C50"/>
        <circle cx="8" cy="8" r="2.5" fill="#5C5C50" stroke="#444438" strokeWidth="1"/>
        <circle cx="8" cy="8" r="1.2" fill="#888870"/>
      </svg>
    )
  }
  const topColor = active && color ? color : '#CC2200'
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated', flexShrink: 0 }}>
      <path d="M8 1 A7 7 0 0 1 15 8 L1 8 A7 7 0 0 1 8 1 Z" fill={topColor}/>
      <path d="M8 15 A7 7 0 0 1 1 8 L15 8 A7 7 0 0 1 8 15 Z" fill="#FBF5E6"/>
      <circle cx="8" cy="8" r="7" fill="none" stroke="#2C1810" strokeWidth="1.5"/>
      <rect x="1.5" y="7" width="13" height="2" fill="#2C1810"/>
      <circle cx="8" cy="8" r="2.5" fill="#2C1810"/>
      <circle cx="8" cy="8" r="1.5" fill={active ? '#FFF' : '#FBF5E6'}/>
    </svg>
  )
}

// ─── HP bar com label ─────────────────────────────────────────────────────────
function HPBar({ current, max, flashColor }: { current: number; max: number; flashColor?: string | null }) {
  const pct = Math.min(1, Math.max(0, current / max))
  const color = pct > 0.5 ? '#38C838' : pct > 0.2 ? '#F0C000' : '#E82020'
  const displayed = Math.ceil(current)
  const [animKey, setAnimKey] = useState(0)
  const prevFlash = useRef<string | null | undefined>(null)
  useEffect(() => {
    if (flashColor && flashColor !== prevFlash.current) {
      setAnimKey(k => k + 1)
    }
    prevFlash.current = flashColor
  }, [flashColor])
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="flex items-center justify-between">
        <span className="font-game text-[9px] tracking-widest" style={{ color: '#2C1810' }}>HP</span>
        <span className="font-game text-[9px]" style={{ color: pct <= 0.2 ? '#E82020' : 'rgba(44,24,16,0.55)' }}>
          {displayed}/{max}
        </span>
      </div>
      <div
        key={animKey}
        className={`h-[10px] rounded-full overflow-hidden border border-black/10 ${flashColor ? 'hp-bar-flash' : ''}`}
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          ['--flash-color' as string]: flashColor ?? undefined,
        }}
      >
        <div className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Move effect label ────────────────────────────────────────────────────────
function getMoveEffectLabel(move: Move): string {
  if (move.special === 'protect')    return '🛡️ Protect'
  if (move.special === 'rapid-spin') return '🌀 Hazard Clear'
  if (move.kind === 'offensive' && move.drain) return '🍃 Absorção'
  if (move.kind === 'offensive')    return '⚔️ Ataque'
  if (move.kind === 'status') {
    const map: Record<string, string> = {
      poison: '☠️ Veneno', paralysis: '⚡ Paralisia',
      sleep: '💤 Sono', freeze: '🧊 Gelo', burn: '🔥 Queimadura',
    }
    return map[move.statusEffect ?? ''] ?? '✨ Efeito'
  }
  if (move.kind === 'buff' && move.buffEffect) {
    const stat = move.buffEffect.stat === 'attack' ? 'ATK' : 'DEF'
    const dir  = move.buffEffect.delta > 0 ? '⬆️' : '⬇️'
    const who  = move.buffEffect.target === 'self' ? '' : ' Inim.'
    return `${dir} ${stat}${who}`
  }
  return '⚔️ Ataque'
}

// ─── Ability strip — sempre visível, com flip para descrição completa ─────────
function AbilityStrip({ pokemon, typeColor }: { pokemon: PokemonCard; typeColor: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className="relative rounded-xl border border-ink/10 bg-white/70 overflow-hidden cursor-pointer transition-all duration-200"
      onClick={() => setExpanded(v => !v)}
    >
      {/* Linha principal */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span
          className="font-game text-[8px] px-2 py-[3px] rounded-full border leading-none shrink-0 tracking-widest"
          style={{ borderColor: typeColor, color: typeColor, backgroundColor: `${typeColor}18` }}
        >HAB.</span>
        <span className="font-bold text-[11px] text-ink shrink-0 leading-none">{pokemon.ability.name}</span>
        <span className="text-[11px] text-ink-soft opacity-55 leading-tight truncate min-w-0 flex-1">
          — {pokemon.ability.description}
        </span>
        <span className="font-game text-[8px] text-ink/30 shrink-0 ml-1">{expanded ? '▲' : '▼'}</span>
      </div>
      {/* Descrição expandida */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-ink/10 pt-2">
          <p className="text-[11px] leading-relaxed text-ink/70">{pokemon.ability.description}</p>
        </div>
      )}
    </div>
  )
}

// ─── Move description helper (usada no verso do card flip) ───────────────────
function getMoveDescription(move: Move): string {
  if (move.special === 'protect') return 'Bloqueia o próximo ataque inimigo por 1 turno. Entra em cooldown após o uso.'
  if (move.special === 'rapid-spin') return 'Remove todas as armadilhas do seu campo (Stealth Rock, Toxic Spikes, Sticky Web). Só ativa quando vence o turno.'
  if (move.kind === 'offensive' && move.drain) return `Golpe ${move.type}. Causa dano e restaura metade como HP.`
  if (move.kind === 'offensive') return `Golpe ${move.type}. Causa dano com base na efetividade de tipos.`
  if (move.kind === 'status' && move.statusEffect) {
    const label: Record<string, string> = {
      poison: 'veneno (−0.5 HP/turno)', paralysis: 'paralisia (40% de perder o turno)',
      sleep: 'sono (perde turnos até acordar)', freeze: 'congelamento (perde turnos até descongelar)',
      burn: 'queimadura (−0.5 HP/turno)',
    }
    return `Aplica ${label[move.statusEffect] ?? move.statusEffect} no alvo.`
  }
  if (move.kind === 'buff' && move.buffEffect) {
    const stat = move.buffEffect.stat === 'attack' ? 'ataque' : 'defesa'
    const dir  = move.buffEffect.delta > 0 ? 'Aumenta' : 'Reduz'
    const who  = move.buffEffect.target === 'self' ? 'próprio' : 'do oponente'
    return `${dir} o ${stat} ${who} no próximo turno.`
  }
  return `Golpe ${move.type}.`
}

function getCategoryLabel(move: Move): string {
  if (move.special === 'protect')    return '🛡️ Proteção'
  if (move.special === 'rapid-spin') return '🌀 Suporte'
  if (move.kind === 'offensive' && move.drain) return '🍃 Ofensivo · Absorção'
  if (move.kind === 'offensive') return '⚔️ Ofensivo'
  if (move.kind === 'status') return '☠️ Status'
  if (move.kind === 'buff') return move.buffEffect?.delta && move.buffEffect.delta > 0 ? '⬆️ Buff' : '⬇️ Debuff'
  return '⚔️ Ofensivo'
}

// ─── Bottom sheet para descrição de move (mobile) ────────────────────────────

type SheetInfo =
  | { kind: 'move';   move: Move;       typeColor: string }
  | { kind: 'unique'; unique: UniqueMove; typeColor: string }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

function MoveBottomSheet({ info, onClose }: { info: SheetInfo | null; onClose: () => void }) {
  const [rendered, setRendered] = useState<SheetInfo | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (info) {
      setRendered(info)
      // double-rAF garante que o elemento já está no DOM antes de animar
      requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
    } else {
      setOpen(false)
      const t = setTimeout(() => setRendered(null), 320)
      return () => clearTimeout(t)
    }
  }, [info])

  if (!rendered) return null

  const tc = rendered.typeColor
  const name = rendered.kind === 'move' ? rendered.move.name : rendered.unique.name
  const type = rendered.kind === 'move' ? rendered.move.type : rendered.unique.type
  const category = rendered.kind === 'move' ? getCategoryLabel(rendered.move) : '⚡ 1× por batalha'
  const description = rendered.kind === 'move'
    ? getMoveDescription(rendered.move)
    : rendered.unique.description

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Sheet */}
      <div
        className={`relative rounded-t-3xl px-5 pt-4 pb-10 flex flex-col gap-3 transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ backgroundColor: '#2C1810' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-1" style={{ backgroundColor: 'rgba(251,245,230,0.2)' }} />

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span
            className="font-game text-[9px] px-2.5 py-1 rounded-full leading-none"
            style={{ backgroundColor: `${tc}25`, color: tc }}
          >{type}</span>
          <span className="font-game text-[9px] leading-none" style={{ color: 'rgba(251,245,230,0.4)' }}>{category}</span>
        </div>

        {/* Nome */}
        <p className="font-black text-2xl uppercase tracking-tight leading-tight" style={{ color: '#FBF5E6' }}>
          {name}
        </p>

        {/* Descrição */}
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(251,245,230,0.72)' }}>
          {description}
        </p>

        {/* Fechar */}
        <button
          onClick={onClose}
          className="mt-2 w-full py-3 rounded-2xl font-game text-[10px] uppercase tracking-widest transition-colors"
          style={{ border: '1px solid rgba(251,245,230,0.15)', color: 'rgba(251,245,230,0.35)' }}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

// ─── Move grid 2×2 com flip 3D ───────────────────────────────────────────────
function MoveGrid({
  pokemon, effects, uniqueUsed, playerIsForced, forcedButtonLabel,
  onAttack, onOpenSheet,
}: {
  pokemon: PokemonCard
  effects: BattleEffects
  uniqueUsed: boolean
  playerIsForced: boolean
  forcedButtonLabel?: string
  onAttack: (move: PlayerMove) => void
  onOpenSheet: (info: SheetInfo) => void
}) {
  const [flipped, setFlipped] = useState<RPS | 'unique' | null>(null)
  const isMobile = useIsMobile()
  const rpsKeys: RPS[] = ['rock', 'paper', 'scissors']

  const borders = [
    'border-b-2 border-r-2 border-ink/15',
    'border-b-2 border-ink/15',
    'border-r-2 border-ink/15',
    'border-l-2 border-ink/15',
  ]

  const gridContent = (
    <div
      className="grid grid-cols-2 border-2 border-ink rounded-2xl overflow-hidden"
      style={{ boxShadow: playerIsForced ? 'none' : '4px 4px 0 #2C1810' }}
    >
      {rpsKeys.map((rps, idx) => {
        const move        = pokemon.moves[rps]
        const tc          = getTypeColor(move.type)
        const isProtect   = move.special === 'protect'
        const onCooldown  = isProtect && effects.sides[0].protectCooldown
        const effect      = getMoveEffectLabel(move)
        const isFlipped   = flipped === rps

        return (
          <div key={rps} className={`move-cell-flip ${borders[idx]}`} style={{ minHeight: 96 }}>
            <div className={`move-cell-inner ${isFlipped ? 'is-flipped' : ''}`} style={{ minHeight: 96 }}>

              {/* ── FRENTE ── */}
              <div
                className="move-cell-face flex flex-col"
                style={{ backgroundColor: '#FBF5E6' }}
              >
                <button
                  onClick={() => !onCooldown && onAttack(rps)}
                  disabled={onCooldown}
                  className={`flex-1 relative flex flex-col gap-1 p-3 text-left w-full ${
                    onCooldown ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:brightness-95'
                  }`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: tc }} />
                  <div className="pl-2.5 flex flex-col gap-1">
                    <span className="text-[24px] leading-none">{RPS_ICON[rps]}</span>
                    <p className="font-black text-[11px] text-ink uppercase tracking-tight leading-tight truncate min-w-0">{move.name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-game text-[8px] px-1.5 py-[3px] rounded-full leading-none"
                        style={{ backgroundColor: tc, color: getTypeTextColor(move.type) }}>{move.type}</span>
                      <span className="font-game text-[8px] text-ink/45 leading-none">{effect}</span>
                      {onCooldown && <span className="font-game text-[8px] px-1 py-[2px] rounded border border-ink/25 text-ink/35 leading-none ml-auto">CD</span>}
                    </div>
                  </div>
                </button>
                {/* Botão info — não dispara ataque */}
                <button
                  onClick={(e) => { e.stopPropagation(); isMobile ? onOpenSheet({ kind: 'move', move, typeColor: tc }) : setFlipped(rps) }}
                  className="absolute top-1 right-1 w-[44px] h-[44px] rounded-full border border-ink/20 bg-white/80 flex items-center justify-center cursor-pointer hover:border-ink/50 z-10"
                  style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', fontWeight: 900, lineHeight: 1 }}
                >?</button>
              </div>

              {/* ── VERSO ── */}
              <div
                className="move-cell-back move-cell-face flex flex-col gap-1.5 p-3"
                style={{ backgroundColor: '#2C1810' }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-game text-[8px] px-1.5 py-[2px] rounded-full leading-none"
                    style={{ backgroundColor: `${tc}30`, color: tc }}>{move.type}</span>
                  <span className="font-game text-[8px] text-white/45 leading-none">{getCategoryLabel(move)}</span>
                </div>
                <p className="font-black text-[10px] leading-tight" style={{ color: '#FBF5E6' }}>{move.name}</p>
                <p className="text-[10px] leading-snug flex-1 overflow-y-auto" style={{ color: 'rgba(251,245,230,0.75)' }}>
                  {getMoveDescription(move)}
                </p>
                <button
                  onClick={() => setFlipped(null)}
                  className="font-game text-[8px] text-white/30 cursor-pointer text-right hover:text-white/60 transition-colors"
                >↩ voltar</button>
              </div>

            </div>
          </div>
        )
      })}

      {/* Slot único */}
      {(() => {
        const unique  = pokemon.unique
        const disabled = uniqueUsed || effects.slots[0].uniqueCooldown
        const isFlipped = flipped === 'unique'

        if (!unique) {
          return (
            <div className={`move-cell-flip ${borders[3]}`} style={{ minHeight: 76 }}>
              <div className="flex flex-col gap-1 p-3 opacity-20 select-none h-full" style={{ backgroundColor: '#F5EDD8' }}>
                <div className="pl-2.5 flex flex-col gap-1">
                  <span className="text-[24px] leading-none">⚡</span>
                  <p className="font-game text-[8px] text-ink/50 uppercase">Sem único</p>
                </div>
              </div>
            </div>
          )
        }

        const tc = getTypeColor(unique.type)
        return (
          <div className={`move-cell-flip ${borders[3]}`}
            style={{ minHeight: 76, boxShadow: !disabled ? '0 0 8px 3px #F8D03066' : undefined, outline: !disabled ? '1px solid #F8D03055' : undefined }}>
            <div className={`move-cell-inner ${isFlipped ? 'is-flipped' : ''}`} style={{ minHeight: 76 }}>

              {/* ── FRENTE único ── */}
              <div
                className="move-cell-face flex flex-col"
                style={{ backgroundColor: disabled ? '#F5EDD8' : `${tc}0C` }}
              >
                <button
                  onClick={() => !disabled && onAttack('unique')}
                  disabled={disabled}
                  className={`flex-1 relative flex flex-col gap-1 p-3 text-left w-full ${
                    disabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer active:brightness-95'
                  }`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{ background: disabled ? 'transparent' : `linear-gradient(180deg, #F8D030 0%, ${tc} 100%)` }} />
                  <div className="pl-2.5 flex flex-col gap-1">
                    <span className="text-[24px] leading-none">⚡</span>
                    <p className="font-black text-[11px] text-ink uppercase tracking-tight leading-tight truncate">{unique.name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {!disabled && (
                        <span className="font-game text-[8px] px-1.5 py-[3px] rounded-full leading-none"
                          style={{ backgroundColor: tc, color: getTypeTextColor(unique.type) }}>{unique.type}</span>
                      )}
                      <span className="font-game text-[8px] text-ink/45 leading-none">
                        {uniqueUsed ? '✓ Usado' : effects.slots[0].uniqueCooldown ? '⟳ Recarg.' : '⚡ 1× bat.'}
                      </span>
                    </div>
                  </div>
                </button>
                {!disabled && (
                  <button
                    onClick={(e) => { e.stopPropagation(); isMobile ? onOpenSheet({ kind: 'unique', unique, typeColor: tc }) : setFlipped('unique') }}
                    className="absolute top-1 right-1 w-[44px] h-[44px] rounded-full border flex items-center justify-center cursor-pointer hover:border-opacity-70 z-10"
                    style={{ borderColor: tc, backgroundColor: `${tc}18`, fontSize: 11, color: tc, fontWeight: 900, lineHeight: 1 }}
                  >?</button>
                )}
              </div>

              {/* ── VERSO único ── */}
              <div
                className="move-cell-back move-cell-face flex flex-col gap-1.5 p-3"
                style={{ backgroundColor: '#2C1810' }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-game text-[8px] px-1.5 py-[2px] rounded-full leading-none"
                    style={{ backgroundColor: `${tc}30`, color: tc }}>{unique.type}</span>
                  <span className="font-game text-[8px] text-white/45 leading-none">⚡ 1× por batalha</span>
                </div>
                <p className="font-black text-[10px] leading-tight" style={{ color: '#FBF5E6' }}>{unique.name}</p>
                <p className="text-[9px] leading-relaxed flex-1" style={{ color: 'rgba(251,245,230,0.6)' }}>
                  {unique.description}
                </p>
                <button
                  onClick={() => setFlipped(null)}
                  className="font-game text-[8px] text-white/30 cursor-pointer text-right hover:text-white/60 transition-colors"
                >↩ voltar</button>
              </div>

            </div>
          </div>
        )
      })()}
    </div>
  )

  if (playerIsForced) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onAttack('rock')}
          className="w-full py-4 font-black text-sm uppercase border-2 border-ink rounded-2xl cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          style={{ backgroundColor: '#F5EDD8', color: '#2C1810', boxShadow: '3px 3px 0 #2C1810' }}
        >
          {forcedButtonLabel ?? '▶ Confirmar turno perdido'}
        </button>
        <div className="opacity-20 pointer-events-none select-none">{gridContent}</div>
      </div>
    )
  }

  return gridContent
}

const STATUS_DESC: Record<StatusCondition, string> = {
  poison:    '−0.5♥ no início de cada turno. Pokémon Venenoso/Aço são imunes.',
  paralysis: '40% de chance de perder o turno. Pokémon Elétrico é imune.',
  sleep:     'Perde o turno por até 2 turnos. 45% de chance de acordar cedo no 2º turno.',
  freeze:    'Perde o turno até descongelar. Ataques de Fogo descongelam.',
  burn:      '−0.5♥ no início de cada turno. Pokémon Fogo é imune.',
}
const STATUS_NAME: Record<StatusCondition, string> = {
  poison: 'Envenenado', paralysis: 'Paralisado', sleep: 'Dormindo', freeze: 'Congelado', burn: 'Queimado',
}

function StatusPill({ status }: { status: StatusState | null }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    function closeOnOutside() { setOpen(false) }
    document.addEventListener('click', closeOnOutside)
    return () => document.removeEventListener('click', closeOnOutside)
  }, [open])
  if (!status) return null
  const bg = STATUS_BG[status.condition]
  const fg = STATUS_FG[status.condition]
  return (
    <div className="relative shrink-0">
      <button
        className="font-game text-[8px] px-1.5 py-[2px] rounded font-bold leading-none cursor-pointer flex items-center gap-0.5"
        style={{ backgroundColor: bg, color: fg }}
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
      >
        {STATUS_LABEL[status.condition]}
        <span className="text-[8px] opacity-70">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div
          className="absolute bottom-full left-0 mb-1.5 z-50 rounded-xl px-3 py-2 border-2 border-ink/10 w-48 shadow-neo-sm"
          style={{ backgroundColor: '#2C1810' }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-game text-[8px] uppercase tracking-widest mb-1" style={{ color: bg }}>
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
    if (effects.slots[0].flashFireActive)   badges.push({ label: '🔥 +1',  bg: '#E06020', fg: 'white' })
    if (effects.slots[0].attackMod > 0)  badges.push({ label: `ATK↑${effects.slots[0].attackMod}`, bg: '#38C838', fg: 'white' })
    if (effects.slots[0].attackMod < 0)  badges.push({ label: `ATK↓${Math.abs(effects.slots[0].attackMod)}`, bg: '#CC2200', fg: 'white' })
    if (effects.slots[0].defenseMod > 0) badges.push({ label: `DEF↑${effects.slots[0].defenseMod}`, bg: '#6890F0', fg: 'white' })
    if (effects.slots[0].defenseMod < 0) badges.push({ label: `DEF↓${Math.abs(effects.slots[0].defenseMod)}`, bg: '#CC2200', fg: 'white' })
    if (effects.sides[0].protectCooldown) badges.push({ label: '🛡️ CD', bg: '#8050B8', fg: 'white' })
    if (effects.slots[0].uniqueCooldown)        badges.push({ label: '⚡ CD', bg: '#A8A878', fg: '#2C1810' })
  } else {
    if (effects.slots[1].attackMod < 0)     badges.push({ label: 'ATK↓', bg: '#38C838', fg: 'white' })
    if (effects.slots[1].attackMod > 0)     badges.push({ label: 'ATK↑', bg: '#CC2200', fg: 'white' })
    if (effects.slots[1].defenseMod < 0)    badges.push({ label: 'DEF↓', bg: '#38C838', fg: 'white' })
    if (effects.slots[1].forcedMove)        badges.push({ label: 'TRAV', bg: '#4868D0', fg: 'white' })
    if (effects.sides[1].protectCooldown)   badges.push({ label: '🛡️ CD', bg: '#8050B8', fg: 'white' })
  }
  if (badges.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {badges.map((b, i) => (
        <span key={i} className="font-game text-[8px] px-1.5 py-[2px] rounded-full leading-none"
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
  lastResult: TurnResult | null
  enemyTellType?: string | null
  precomputedEnemyRPS?: RPS | null
}

function HazardChips({ hazards }: { hazards: HazardState }) {
  const chips = [
    hazards.stealthRock && { label: '🪨', title: 'Stealth Rock' },
    hazards.toxicSpikes && { label: '☠️', title: 'Toxic Spikes' },
    hazards.stickyWeb   && { label: '🕸️', title: 'Sticky Web' },
  ].filter(Boolean) as { label: string; title: string }[]
  if (chips.length === 0) return null
  return (
    <div className="flex gap-1">
      {chips.map(c => (
        <span key={c.title} title={c.title}
          className="text-[11px] leading-none px-1 py-0.5 rounded bg-black/40 backdrop-blur-sm border border-white/20">
          {c.label}
        </span>
      ))}
    </div>
  )
}

function BattleArena({ pf, ef, effects, typeColor, playerFighters, enemyFighters, playerIdx, enemyIdx, phase, lastResult, enemyTellType }: ArenaProps) {
  const pKO = pf.hearts <= 0
  const eKO = ef.hearts <= 0

  // Flash de status: detecta queda de HP causada por veneno/queimadura
  const [playerFlash, setPlayerFlash] = useState<string | null>(null)
  const [enemyFlash, setEnemyFlash]   = useState<string | null>(null)
  // Stores the Pokémon ID that failed to load animated GIF — falls back to static sprite
  const [enemyAnimErrId, setEnemyAnimErrId] = useState<number | null>(null)
  const [playerAnimErrId, setPlayerAnimErrId] = useState<number | null>(null)

  // Animações de ataque: lunge do atacante + shake+flash do defensor
  const [attackAnim, setAttackAnim] = useState<'player' | 'enemy' | null>(null)
  const [hitAnim,    setHitAnim]    = useState<'player' | 'enemy' | null>(null)

  const prevPH = useRef(pf.hearts)
  const prevEH = useRef(ef.hearts)
  useEffect(() => {
    if (pf.hearts < prevPH.current && effects.slots[0].status) {
      setPlayerFlash(STATUS_BG[effects.slots[0].status.condition])
    }
    prevPH.current = pf.hearts
    // effects é lido na mesma fase de render que pf.hearts — não precisa ser dep
  }, [pf.hearts]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ef.hearts < prevEH.current && effects.slots[1].status) {
      setEnemyFlash(STATUS_BG[effects.slots[1].status.condition])
    }
    prevEH.current = ef.hearts
    // effects é lido na mesma fase de render que ef.hearts — não precisa ser dep
  }, [ef.hearts]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!lastResult) return
    const { outcome, enemyDmg, playerDmg, enemyProtected, playerProtected } = lastResult
    if (outcome === 'player_wins' && enemyDmg > 0 && !enemyProtected) {
      setAttackAnim('player'); setHitAnim('enemy')
      const t1 = setTimeout(() => setAttackAnim(null), 270)
      const t2 = setTimeout(() => setHitAnim(null),    480)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    if (outcome === 'enemy_wins' && playerDmg > 0 && !playerProtected) {
      setAttackAnim('enemy'); setHitAnim('player')
      const t1 = setTimeout(() => setAttackAnim(null), 270)
      const t2 = setTimeout(() => setHitAnim(null),    480)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [lastResult])

  // Cor da aura = tipo do golpe usado pelo atacante
  const playerAuraColor = lastResult
    ? lastResult.playerMove === 'unique'
      ? getTypeColor(pf.pokemon.unique?.type ?? 'Normal')
      : getTypeColor(pf.pokemon.moves[lastResult.playerMove].type)
    : null
  const enemyAuraColor = lastResult
    ? getTypeColor(ef.pokemon.moves[lastResult.enemyMove].type)
    : null

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-ink select-none"
      style={{
        height: 'clamp(180px, 40svh, 256px)',
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
              <StatusPill status={effects.slots[1].status} />
            </div>
            <div style={{ width: 124 }}>
              <HPBar current={ef.hearts} max={5} flashColor={enemyFlash} />
            </div>
            <EffectBadges effects={effects} side="enemy" />
          </div>
          <div className="flex gap-1.5 px-2.5 pb-2 items-center">
            {enemyFighters.map((f, i) => (
              <PartyBall
                key={i}
                alive={f.hearts > 0}
                active={i === enemyIdx}
                color={typeColor}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Enemy sprite — top-right ── */}
      <div
        className={`absolute z-[5] transition-opacity duration-300 ${attackAnim === 'enemy' ? 'sprite-lunge-left' : ''} ${hitAnim === 'enemy' ? 'sprite-shake' : ''}`}
        style={{ right: 18, top: 22, opacity: eKO ? 0.22 : 1 }}
      >
        {/* Hit flash — aparece quando o inimigo leva dano */}
        {hitAnim === 'enemy' && !eKO && (
          <div className="absolute inset-0 z-20 pointer-events-none rounded-lg"
            style={{ backgroundColor: 'rgba(204,34,0,0.45)' }} />
        )}
        {/* Visual tell: aura do tipo do próximo move do inimigo durante seleção */}
        {phase === 'selecting' && !eKO && enemyTellType && (
          <div className="absolute inset-0 pointer-events-none rounded-xl z-10 transition-all duration-500"
            style={{ boxShadow: `0 0 18px 6px ${enemyTellType}99`, borderRadius: 8 }} />
        )}
        <img
          key={ef.pokemon.id}
          src={enemyAnimErrId === ef.pokemon.id ? getPixelSpriteUrl(ef.pokemon.id) : getAnimatedFrontUrl(ef.pokemon.id)}
          alt={ef.pokemon.name}
          style={{
            width: 92, height: 92,
            imageRendering: 'pixelated',
            objectFit: 'contain',
            filter: eKO
              ? 'grayscale(1)'
              : attackAnim === 'enemy' && enemyAuraColor
              ? `drop-shadow(0 0 7px ${enemyAuraColor}) drop-shadow(0 0 14px ${enemyAuraColor}90)`
              : undefined,
          }}
          onError={() => setEnemyAnimErrId(ef.pokemon.id)}
        />
        {eKO && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-black text-sm text-white px-3 py-1.5 rounded-xl uppercase tracking-wider"
              style={{ backgroundColor: '#CC2200', boxShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>✕ KO</span>
          </div>
        )}
      </div>

      {/* ── Player sprite — bottom-left (back) ── */}
      <div
        className={`absolute z-[5] transition-opacity duration-300 ${attackAnim === 'player' ? 'sprite-lunge-right' : ''} ${hitAnim === 'player' ? 'sprite-shake' : ''}`}
        style={{ left: 6, bottom: 24, opacity: pKO ? 0.22 : 1 }}
      >
        {/* Hit flash — aparece quando o player leva dano */}
        {hitAnim === 'player' && !pKO && (
          <div className="absolute inset-0 z-20 pointer-events-none rounded-lg"
            style={{ backgroundColor: 'rgba(204,34,0,0.45)' }} />
        )}
        <img
          key={pf.pokemon.id}
          src={playerAnimErrId === pf.pokemon.id ? getBackSpriteUrl(pf.pokemon.id) : getAnimatedBackUrl(pf.pokemon.id)}
          alt={pf.pokemon.name}
          style={{
            width: 120, height: 120,
            imageRendering: 'pixelated',
            objectFit: 'contain',
            filter: pKO
              ? 'grayscale(1)'
              : attackAnim === 'player' && playerAuraColor
              ? `drop-shadow(0 0 7px ${playerAuraColor}) drop-shadow(0 0 14px ${playerAuraColor}90)`
              : undefined,
          }}
          onError={() => setPlayerAnimErrId(pf.pokemon.id)}
        />
        {pKO && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-black text-sm text-white px-3 py-1.5 rounded-xl uppercase tracking-wider"
              style={{ backgroundColor: '#CC2200', boxShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>✕ KO</span>
          </div>
        )}
      </div>

      {/* ── Hazard chips — enemy side (player set hazards on enemy) ── */}
      <div className="absolute z-20 flex gap-1" style={{ right: 14, top: 120 }}>
        <HazardChips hazards={effects.sides[1].hazards} />
      </div>

      {/* ── Hazard chips — player side (enemy set hazards on player) ── */}
      <div className="absolute z-20 flex gap-1" style={{ left: 10, bottom: 38 }}>
        <HazardChips hazards={effects.sides[0].hazards} />
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
              <StatusPill status={effects.slots[0].status} />
            </div>
            <div style={{ width: 124 }}>
              <HPBar current={pf.hearts} max={5} flashColor={playerFlash} />
            </div>
            <EffectBadges effects={effects} side="player" />
          </div>
          <div className="flex gap-1.5 px-2.5 pb-2 items-center">
            {playerFighters.map((f, i) => (
              <PartyBall
                key={i}
                alive={f.hearts > 0}
                active={i === playerIdx}
                color={getTypeColor(f.pokemon.type1)}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Switch reset helper — shared by handleSwitchTurn and confirmSwitch ──────
function applyPlayerSwitchReset(eff: BattleEffects): BattleEffects {
  return patchSlot(eff, 0, {
    status: null,
    tiredTurns: 0,
    attackMod: 0,
    defenseMod: 0,
    sturdyUsed: false,
    flashFireActive: false,
    destinyBond: false,
    aquaRingActive: false,
    aquaRingHealIn: 2,
    shellSmashTurns: 0,
    uniqueCooldown: false,
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BatalhaPage() {
  const router = useRouter()
  const {
    battle, currentFloor, mode, playerDeck, badgesEarned, coins,
    endBattle, clearBattle, syncDeckAfterBattle, incrementDeathCount, setRunEndReason,
    specialBattle, setSpecialBattle, markLegendaryEventUsed, setPendingLegendaryCard,
    addCoins, spendCoins, addConsumable,
  } = useGameStore()
  const [showAbandon, setShowAbandon] = useState(false)
  const [victorySubmitted, setVictorySubmitted] = useState(false)

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
  // Sticky Web: forces Rock on the pokemon's first turn after switching in
  const [stickyWebForcedMove, setStickyWebForcedMove] = useState<RPS | null>(null)
  // Quick Claw: reveals enemy move name when triggered (25% per turn)
  const [quickClawRevealed, setQuickClawRevealed] = useState(false)
  // Bottom sheet (mobile): descrição do move/unique selecionado
  const [sheetInfo, setSheetInfo] = useState<SheetInfo | null>(null)
  // Visual tell: move do inimigo pré-computado (tipo exibido como "aura" durante seleção)
  const [precomputedEnemyRPS, setPrecomputedEnemyRPS] = useState<RPS | null>(null)

  useEffect(() => {
    if (!battle) { router.replace('/torre'); return }
    const pf = battle.playerSelected.map(p => ({ pokemon: p, hearts: p.hearts }))
    const ef = battle.enemyDeck.map(p => ({ pokemon: p, hearts: p.hearts }))
    const { newEffects, message, hazardDamage, forcedFirstMove } = applyEntryEffects(battle.playerSelected[0], 0, DEFAULT_EFFECTS)
    if (hazardDamage > 0) pf[0] = { ...pf[0], hearts: Math.max(0, pf[0].hearts - hazardDamage) }
    setPlayerFighters(pf)
    setEnemyFighters(ef)
    setUniqueUsed(battle.playerSelected.map(() => false))
    setEffects(newEffects)
    if (message) setEntryMsg(message)
    if (forcedFirstMove) setStickyWebForcedMove(forcedFirstMove)
    // battle é lido uma vez no mount para inicializar estado local; deps causariam re-init mid-battle
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Intercepta botão voltar do browser durante a batalha
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const onPop = () => {
      window.history.pushState(null, '', window.location.href)
      setShowAbandon(true)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // listener registrado uma vez; battle não muda durante a batalha
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pré-computa o RPS do inimigo ao entrar em fase de seleção (visual tell + Quick Claw)
  useEffect(() => {
    if (phase !== 'selecting' || !battle) return
    const effectiveAI = specialBattle?.aiLevel ?? GYM_LEADERS[currentFloor]?.aiLevel
    if (!effectiveAI) return
    const forced = effects.slots[1].tiredTurns > 0 ? 'rock' as RPS
      : (effects.slots[1].forcedMove && effects.slots[1].forcedTurnsLeft > 0 ? effects.slots[1].forcedMove : null)
    const rps = forced ?? generateAIMove(effectiveAI, moveHistory, null)
    setPrecomputedEnemyRPS(rps)
    const currentPf = playerFighters[playerIdx]
    if (currentPf) setQuickClawRevealed(checkQuickClaw(currentPf.pokemon))
    else setQuickClawRevealed(false)
    // battle/specialBattle/currentFloor são imutáveis durante o combate; só phase e idx sinalizam recompute
  }, [phase, enemyIdx, playerIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const gymLeader = GYM_LEADERS[currentFloor]
  const gym = specialBattle
    ? { name: specialBattle.opponentName, specialtyType: specialBattle.specialtyType, aiLevel: specialBattle.aiLevel, badge: null, floor: -1, title: '', teamIds: [], postGymDraftPool: [], description: '' }
    : gymLeader
  if (!battle || !gym || playerFighters.length === 0 || enemyFighters.length === 0) return null

  const typeColor = getTypeColor(gym.specialtyType)
  const pf = playerFighters[playerIdx]
  const ef = enemyFighters[enemyIdx]
  const enemyTellColor = (phase === 'selecting' && precomputedEnemyRPS && ef)
    ? getTypeColor(ef.pokemon.moves[precomputedEnemyRPS].type) : null

  function handleSpecialDefeat() {
    const sb = specialBattle!
    if (sb.type === 'legendary') {
      markLegendaryEventUsed()
    } else {
      // Confisco parcial: perde até 5₽; se saldo insuficiente perde tudo
      if (!spendCoins(5) && coins > 0) spendCoins(coins)
    }
    syncDeckAfterBattle(
      playerFighters.map(f => ({
        id: f.pokemon.id,
        hearts: Math.max(0.5, f.hearts),
        isFainted: false,
      }))
    )
    setSpecialBattle(null)
    clearBattle()
    const prevFloor = currentFloor - 1
    router.push(prevFloor >= 8 ? '/entre-andares' : '/pos-batalha')
  }

  function handleAbandon() {
    if (specialBattle) { handleSpecialDefeat(); return }
    setRunEndReason('lost')
    endBattle('lose')
    router.push('/game-over')
  }

  const ps = effects.slots[0].status
  const playerIsSleeping = ps?.condition === 'sleep'
  const playerIsForcedByStatus = ps?.condition === 'freeze'
  const playerIsForced = playerIsForcedByStatus || effects.slots[0].tiredTurns > 0 || playerIsSleeping || !!stickyWebForcedMove

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

    // Sticky Web: forces Rock on first turn, but doesn't auto-lose (normal RPS)
    const stickyActive = !!stickyWebForcedMove
    if (stickyActive) setStickyWebForcedMove(null)

    if (stickyActive) {
      playerRPS = 'rock'
      activations.push(`🕸️ Sticky Web! ${pf.pokemon.name} forçado a usar ✊!`)
    } else if (turnStart.playerForcedRps) {
      playerRPS = turnStart.playerForcedRps
      playerForcedThisTurn = true
    } else if (isUnique) {
      playerRPS = pf.pokemon.unique!.category
      setUniqueUsed(prev => prev.map((u, i) => i === playerIdx ? true : u))
    } else {
      playerRPS = move as RPS
    }

    const chosenMove = (!playerForcedThisTurn && !isUnique && !turnStart.playerSkipsTurn) ? pf.pokemon.moves[playerRPS] : null
    const isProtect = chosenMove?.special === 'protect' && !eff.sides[0].protectCooldown
    if (!isProtect) eff = patchSide(eff, 0, { protectCooldown: false })

    const aiMove = turnStart.enemyForcedRps ?? precomputedEnemyRPS ?? generateAIMove(gym.aiLevel, moveHistory, null)
    const enemyIsProtect = ef.pokemon.moves[aiMove].special === 'protect' && !eff.sides[1].protectCooldown
    if (!enemyIsProtect) eff = patchSide(eff, 1, { protectCooldown: false })
    if (enemyIsProtect) eff = patchSide(eff, 1, { protectCooldown: true })

    let outcome: 'player_wins' | 'enemy_wins' | 'tie'
    if (isUnique && !playerForcedThisTurn && !turnStart.playerSkipsTurn) {
      outcome = 'player_wins'
    } else {
      outcome = resolveRPS(playerRPS, aiMove)
    }

    // Enemy sleep/freeze → player wins automatically (null turn, symmetric to player sleep)
    if (turnStart.enemyAutoLose) outcome = 'player_wins'

    // Player sleeping → turno nulo, inimigo ataca livremente
    if (turnStart.playerSkipsTurn) outcome = 'enemy_wins'

    // Player freeze/tired → enemy wins automatically
    if (playerForcedThisTurn) {
      const forcedByFreeze = eff.slots[0].status?.condition === 'freeze'
      const forcedByTired = effects.slots[0].tiredTurns > 0
      if (forcedByFreeze || forcedByTired) outcome = 'enemy_wins'
    }

    let playerDmg = 0
    let enemyDmg = 0
    let multiplier = 1

    if (isProtect) {
      eff = patchSide(eff, 0, { protectCooldown: true })
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

        if (uRes.enemyStatus && !eff.slots[1].status) eff = patchSlot(eff, 1, { status: uRes.enemyStatus })
        if (uRes.playerStatus) eff = patchSlot(eff, 0, { status: uRes.playerStatus })
        if (uRes.playerTiredTurns > 0) eff = patchSlot(eff, 0, { tiredTurns: Math.max(eff.slots[0].tiredTurns, uRes.playerTiredTurns) })
        if (uRes.cooldown) eff = patchSlot(eff, 0, { uniqueCooldown: true })
        if (uRes.enemyForcedMove) eff = patchSlot(eff, 1, { forcedMove: uRes.enemyForcedMove, forcedTurnsLeft: uRes.forceTurns })
        if (uRes.recoil > 0) { newPHearts = Math.max(0, newPHearts - uRes.recoil); activations.push(`💢 Recuo! −${uRes.recoil} ♥`) }
        if (uRes.healPlayer > 0) { newPHearts = Math.min(pf.pokemon.hearts, newPHearts + uRes.healPlayer); activations.push(`💚 Curou ${uRes.healPlayer} ♥!`) }
        if (uRes.drainHearts > 0) { newPHearts = Math.min(pf.pokemon.hearts, newPHearts + uRes.drainHearts); activations.push(`🍃 Absorção +${uRes.drainHearts} ♥!`) }
        if (uRes.userFaints) newPHearts = 0
        if (uRes.activateShellSmash) eff = patchSlot(eff, 0, { shellSmashTurns: 3 })
        if (uRes.activateAquaRing) eff = patchSlot(eff, 0, { aquaRingActive: true, aquaRingHealIn: 2 })
        if (uRes.activateDestinyBond) eff = patchSlot(eff, 0, { destinyBond: true })
        if (uRes.playerAttackBuff > 0) eff = patchSlot(eff, 0, { attackMod: Math.min(1, eff.slots[0].attackMod + uRes.playerAttackBuff) })
        if (uRes.playerDefenseBuff > 0) eff = patchSlot(eff, 0, { defenseMod: Math.min(1, eff.slots[0].defenseMod + uRes.playerDefenseBuff) })

        if (uRes.benchDamage > 0) {
          setEnemyFighters(prev => prev.map((f, i) =>
            i === enemyIdx ? f : { ...f, hearts: Math.max(0, f.hearts - uRes.benchDamage) }
          ))
          activations.push(`💥 Dano de área na reserva inimiga!`)
        }

        if (enemyDmg > 0) {
          const { damage: finalDmg, sturdyTriggered } = applySturdy(
            enemyDmg, newEHearts, eff.slots[1].sturdyUsed, ef.pokemon.ability.name === 'Sturdy',
          )
          if (sturdyTriggered) {
            eff = patchSlot(eff, 1, { sturdyUsed: true })
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
          immune = true; multiplier = 0; eff = patchSlot(eff, 1, { flashFireActive: true })
          activations.push(`🔥 FlashFire! ${ef.pokemon.name} é imune ao Fogo!`)
        } else if (eAbility === 'Levitate' && attackType === 'Ground') {
          immune = true; multiplier = 0
          activations.push(`🌬️ Levitate! ${ef.pokemon.name} flutua sobre o ataque!`)
        }

        if (!immune) {
          if (chosenMove.kind === 'offensive') {
            const slotRes = calcSlotDamage(
              attackType, pf.pokemon, newPHearts, ef.pokemon, eff.slots[0].flashFireActive,
              eff.slots[0].attackMod, eff.slots[1].defenseMod,
            )
            enemyDmg = slotRes.damage
            multiplier = slotRes.multiplier
            activations.push(...slotRes.messages)
            eff = patchSlot(patchSlot(eff, 0, { attackMod: 0 }), 1, { defenseMod: 0 })

            if (chosenMove.drain && enemyDmg > 0) {
              const heal = Math.floor(enemyDmg / 2)
              newPHearts = Math.min(pf.pokemon.hearts, newPHearts + heal)
              activations.push(`🍃 Absorção +${heal} ♥!`)
            }

            if (attackType === 'Fire') {
              const { effects: newEff, thawed } = applyThaw(eff, 1, attackType)
              eff = newEff
              if (thawed) activations.push(`🔥 ${ef.pokemon.name} descongelou!`)
            }

            if (chosenMove.special === 'rapid-spin') {
              const spinResult = applySlotMoveEffect(chosenMove, 0, eff, ef.pokemon)
              eff = spinResult.effects
              if (spinResult.message) activations.push(spinResult.message)
            }
          } else {
            const sideEff = applySlotMoveEffect(chosenMove, 0, eff, ef.pokemon)
            eff = sideEff.effects
            if (sideEff.message) activations.push(sideEff.message)
          }

          if (enemyDmg > 0) {
            const { damage: finalDmg, sturdyTriggered } = applySturdy(
              enemyDmg, newEHearts, eff.slots[1].sturdyUsed, ef.pokemon.ability.name === 'Sturdy',
            )
            if (sturdyTriggered) {
              eff = patchSlot(eff, 1, { sturdyUsed: true })
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
      const enemyChosenMove = ef.pokemon.moves[aiMove]

      if (enemyChosenMove.kind !== 'offensive') {
        // Non-offensive enemy move (hazard, status, buff, protect)
        const sideEff = applySlotMoveEffect(enemyChosenMove, 1, eff, pf.pokemon, ef.pokemon)
        eff = sideEff.effects
        if (sideEff.message) activations.push(sideEff.message)
      } else {
        const attackType = enemyChosenMove.type
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
          immune = true; multiplier = 0; eff = patchSlot(eff, 0, { flashFireActive: true })
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
            attackType, ef.pokemon, newEHearts, pf.pokemon, eff.slots[1].flashFireActive,
            eff.slots[1].attackMod, eff.slots[0].defenseMod,
          )
          playerDmg = slotRes.damage
          multiplier = slotRes.multiplier
          activations.push(...slotRes.messages)
          eff = patchSlot(patchSlot(eff, 1, { attackMod: 0 }), 0, { defenseMod: 0 })

          if (attackType === 'Fire') {
            const { effects: newEff, thawed } = applyThaw(eff, 0, attackType)
            eff = newEff
            if (thawed) activations.push(`🔥 ${pf.pokemon.name} descongelou!`)
          }

          const { damage: finalDmg, sturdyTriggered } = applySturdy(
            playerDmg, newPHearts, eff.slots[0].sturdyUsed, pAbility === 'Sturdy',
          )
          if (sturdyTriggered) {
            eff = patchSlot(eff, 0, { sturdyUsed: true })
            activations.push(`🛡️ Sturdy! ${pf.pokemon.name} sobreviveu com 1 ♥!`)
          }
          playerDmg = finalDmg
          // Focus Sash: survive a KO hit at full HP (once per battle)
          const { damage: sashFinalDmg, sashTriggered } = applyFocusSash(playerDmg, newPHearts, pf.pokemon, eff.slots[0].sashUsed)
          if (sashTriggered) {
            eff = patchSlot(eff, 0, { sashUsed: true })
            activations.push(`🎽 Faixa Foco! ${pf.pokemon.name} sobreviveu com 0.5 ♥!`)
          }
          playerDmg = sashFinalDmg
          newPHearts = Math.max(0, newPHearts - playerDmg)
          // Rocky Helmet: attacker takes 0.5♥ recoil when dealing contact damage
          const rockyHelmetRecoil = getRockyHelmetRecoil(pf.pokemon)
          if (rockyHelmetRecoil > 0 && playerDmg > 0) {
            newEHearts = Math.max(0, newEHearts - rockyHelmetRecoil)
            activations.push(`⛑️ Capacete Rochoso! ${ef.pokemon.name} tomou ${rockyHelmetRecoil} ♥ de ricochete!`)
          }
        } else if (!immune && isProtect) {
          activations.push(`🛡️ Protect absorveu o ataque!`)
        }
      }
    }

    // ── Hold item effects triggered when player deals damage ─────────────────
    if (outcome === 'player_wins' && !enemyIsProtect && enemyDmg > 0) {
      const lifeOrbRecoil = getLifeOrbRecoil(pf.pokemon, enemyDmg)
      if (lifeOrbRecoil > 0) {
        newPHearts = Math.max(0, newPHearts - lifeOrbRecoil)
        activations.push(`🔮 Life Orb! Recuo −${lifeOrbRecoil} ♥`)
      }
      const shellBellHeal = getShellBellHeal(pf.pokemon, enemyDmg)
      if (shellBellHeal > 0) {
        newPHearts = Math.min(pf.pokemon.hearts, newPHearts + shellBellHeal)
        activations.push(`🔔 Shell Bell! +${shellBellHeal} ♥`)
      }
      if (checkKingsRock(pf.pokemon)) {
        eff = patchSlot(eff, 1, { forcedMove: 'rock', forcedTurnsLeft: 1 })
        activations.push(`🪨 King's Rock! Inimigo atordoado — forçado ✊ no próximo turno!`)
      }
    }

    // Destiny Bond: se o jogador cair, o inimigo também cai
    if (newPHearts <= 0 && eff.slots[0].destinyBond) {
      newEHearts = 0
      eff = patchSlot(eff, 0, { destinyBond: false })
      activations.push(`💀 Destiny Bond! ${ef.pokemon.name} também é derrotado!`)
    }

    const playerSkippedTurn = turnStart.playerSkipsTurn
    const wasFrozenPreTurn = effects.slots[0].status?.condition === 'freeze'
    const lostTurn = playerForcedThisTurn && outcome === 'enemy_wins' && (
      wasFrozenPreTurn ||
      effects.slots[0].tiredTurns > 0
    )
    const enemyLostTurn = turnStart.enemyAutoLose && outcome === 'player_wins'

    setPlayerFighters(prev => prev.map((f, i) => i === playerIdx ? { ...f, hearts: newPHearts } : f))
    setEnemyFighters(prev => prev.map((f, i) => i === enemyIdx ? { ...f, hearts: newEHearts } : f))
    setEffects(eff)
    if (!lostTurn && !playerSkippedTurn) setMoveHistory(h => [...h, playerRPS])
    setLastResult({ playerMove: move, enemyMove: aiMove, outcome, playerDmg, enemyDmg, multiplier, activations, lostTurn, playerSkippedTurn, enemyLostTurn, playerProtected: isProtect, enemyProtected: enemyIsProtect })
    setPhase('result')
  }

  function handleNext() {
    const currentPF = playerFighters[playerIdx]
    const currentEF = enemyFighters[enemyIdx]

    if (currentEF.hearts <= 0) {
      const next = enemyIdx + 1
      if (next >= enemyFighters.length) { setPhase('victory'); return }
      setEnemyIdx(next)
      const { newEffects, message, hazardDamage } = applyEntryEffects(enemyFighters[next].pokemon, 1, effects)
      setEffects(patchSlot(newEffects, 1, { status: null, tiredTurns: 0, sturdyUsed: false }))
      if (message) setEntryMsg(message)
      if (hazardDamage > 0) setEnemyFighters(fs => fs.map((f, i) => i === next ? { ...f, hearts: Math.max(0, f.hearts - hazardDamage) } : f))
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

    const { newEffects: entryEffects, message: entryMessage, hazardDamage: entryHazardDmg, forcedFirstMove: switchStickyForced } = applyEntryEffects(incoming.pokemon, 0, effects)
    let eff: BattleEffects = applyPlayerSwitchReset(entryEffects)
    if (entryMessage) activations.push(entryMessage)
    if (switchStickyForced) setStickyWebForcedMove(switchStickyForced)

    // Inimigo ataca de graça com o move pré-computado
    const aiMove = precomputedEnemyRPS ?? generateAIMove(gym.aiLevel, moveHistory, null)
    const attackType = ef.pokemon.moves[aiMove].type
    const pAbility = incoming.pokemon.ability.name

    let newPHearts = Math.max(0, incoming.hearts - entryHazardDmg)
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
      immune = true; multiplier = 0; eff = patchSlot(eff, 0, { flashFireActive: true })
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
        attackType, ef.pokemon, ef.hearts, incoming.pokemon, eff.slots[1].flashFireActive,
        eff.slots[1].attackMod, eff.slots[0].defenseMod,
      )
      playerDmg = slotRes.damage
      multiplier = slotRes.multiplier
      activations.push(...slotRes.messages)
      eff = patchSlot(patchSlot(eff, 1, { attackMod: 0 }), 0, { defenseMod: 0 })

      if (attackType === 'Fire') {
        const { effects: newEff, thawed } = applyThaw(eff, 0, attackType)
        eff = newEff
        if (thawed) activations.push(`🔥 ${incoming.pokemon.name} descongelou!`)
      }

      const { damage: finalDmg, sturdyTriggered } = applySturdy(
        playerDmg, newPHearts, eff.slots[0].sturdyUsed, pAbility === 'Sturdy',
      )
      if (sturdyTriggered) {
        eff = patchSlot(eff, 0, { sturdyUsed: true })
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
      playerSkippedTurn: false,
      enemyLostTurn: false,
      switchedIn: incoming.pokemon.name,
      playerProtected: false,
      enemyProtected: false,
    })
    setPhase('result')
  }

  // Troca após faint: grátis, sem golpe do inimigo
  function confirmSwitch(targetIdx: number) {
    setShowSwitchPicker(false)
    setSwitchRequired(false)
    setPlayerIdx(targetIdx)
    const { newEffects, message, hazardDamage, forcedFirstMove: faintStickyForced } = applyEntryEffects(playerFighters[targetIdx].pokemon, 0, effects)
    setEffects(applyPlayerSwitchReset(newEffects))
    if (message) setEntryMsg(message)
    const newHearts = hazardDamage > 0 ? Math.max(0, playerFighters[targetIdx].hearts - hazardDamage) : playerFighters[targetIdx].hearts
    if (hazardDamage > 0) setPlayerFighters(fs => fs.map((f, i) => i === targetIdx ? { ...f, hearts: newHearts } : f))
    if (faintStickyForced) setStickyWebForcedMove(faintStickyForced)

    // Pokemon fainted immediately from entry hazard — re-evaluate fight
    if (newHearts <= 0) {
      const remainingAlive = playerFighters.filter((f, i) => i !== playerIdx && i !== targetIdx && f.hearts > 0).length
      if (remainingAlive === 0) { setPhase('defeat'); return }
      setSwitchRequired(true)
      setShowSwitchPicker(true)
      return
    }

    setLastResult(null)
    setTurn(t => t + 1)
    setPhase('selecting')
  }

  // ── Derived display values ──────────────────────────────────────────────────

  const forcedLabel = (() => {
    if (stickyWebForcedMove)           return `🕸️ ${pf.pokemon.name} está preso na Sticky Web — ✊ forçado!`
    if (ps?.condition === 'sleep')     return `😴 ${pf.pokemon.name} está dormindo — turno nulo`
    if (ps?.condition === 'freeze')    return `🧊 ${pf.pokemon.name} está congelado — turno perdido!`
    if (effects.slots[0].tiredTurns > 0)  return `💤 ${pf.pokemon.name} está exausto — turno perdido!`
    return null
  })()

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-parchment relative overflow-x-hidden"
      style={{ overscrollBehaviorX: 'none' }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-20 border-b-4 border-ink px-4 py-3"
        style={{ backgroundColor: typeColor }}>
        <div className="max-w-[640px] mx-auto flex items-center justify-between gap-3">
          <button onClick={() => setShowAbandon(true)}
            className="border-2 border-white/30 rounded-full px-3 py-1.5 font-game text-[8px] text-white bg-white/15 hover:bg-white/25 transition-all shrink-0 cursor-pointer">
            ← Fugir
          </button>
          <div className="flex-1 text-center min-w-0">
            <p className="font-game text-[8px] text-white/60 uppercase tracking-widest leading-none mb-0.5">
              Andar {currentFloor + 1}/12
            </p>
            <p className="font-black text-sm text-white uppercase tracking-wide leading-tight truncate">
              {gym.name} — {gym.specialtyType}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-game text-[8px] text-white/60 uppercase tracking-widest leading-none mb-0.5">Turno</p>
            <p className="font-black text-xl text-white leading-none">{turn}</p>
          </div>
        </div>
      </header>

      {gym.aiLevel === 'predictive' && (
        <div className="sticky top-[61px] z-10 px-4 py-1.5 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#1A1040', boxShadow: '0 2px 0 #0D0820' }}>
          <span className="animate-pulse text-[10px]">🤖</span>
          <p className="font-game text-[8px] text-purple-200 uppercase tracking-widest leading-none">
            IA Expert — analisa seus padrões
          </p>
        </div>
      )}

      <div className="max-w-[640px] mx-auto px-4 pt-4 flex flex-col gap-3"
        style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}>

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
          lastResult={lastResult}
          enemyTellType={enemyTellColor}
          precomputedEnemyRPS={precomputedEnemyRPS}
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
              disabled={victorySubmitted}
              onClick={() => {
                if (victorySubmitted) return
                setVictorySubmitted(true)
                syncDeckAfterBattle(playerFighters.map(f => ({ id: f.pokemon.id, hearts: f.hearts, isFainted: f.hearts <= 0 })))
                if (specialBattle) {
                  if (specialBattle.type === 'legendary') {
                    if (specialBattle.legendaryTeamCard) setPendingLegendaryCard(specialBattle.legendaryTeamCard)
                    markLegendaryEventUsed()
                  } else {
                    addCoins(specialBattle.coinsOnWin)
                    if (specialBattle.itemOnWin) addConsumable(specialBattle.itemOnWin, 1)
                  }
                  setSpecialBattle(null)
                  clearBattle()
                  if (specialBattle.type === 'legendary') {
                    router.push('/recrutar-lendario')
                  } else {
                    const prevFloor = currentFloor - 1
                    router.push(prevFloor >= 8 ? '/entre-andares' : '/pos-batalha')
                  }
                } else {
                  endBattle('win')
                  router.push(currentFloor >= 11 ? '/entre-andares' : '/recompensa')
                }
              }}
              className="w-full py-4 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl bg-white text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-neo">
              {specialBattle?.type === 'legendary' ? '⚡ Recrutar Lendário →'
                : specialBattle?.type === 'rocket' ? 'Coletar recompensa →'
                : currentFloor >= 11 ? '🏆 Ver resultado final →'
                : 'Ver recompensa →'}
            </button>
          </div>
        )}

        {/* ── DEFEAT ── */}
        {phase === 'defeat' && (() => {
          // Batalha especial: não é game-over
          if (specialBattle) {
            const isLegendary = specialBattle.type === 'legendary'
            const sbColor = isLegendary ? getTypeColor(specialBattle.specialtyType) : '#CC2200'
            return (
              <div className="rounded-3xl border-2 border-ink overflow-hidden text-center p-8"
                style={{ backgroundColor: sbColor, boxShadow: '6px 6px 0 #2C1810' }}>
                <p className="text-6xl mb-3">{isLegendary ? '🌠' : '💸'}</p>
                <p className="font-black text-2xl text-white uppercase tracking-tight">
                  {isLegendary ? `${specialBattle.opponentName} escapou...` : 'Roubado!'}
                </p>
                <p className="text-base text-white/70 mt-2 mb-6">
                  {isLegendary
                    ? 'O lendário voou para longe. Você não terá outra chance nessa run.'
                    : 'A Equipe Rocket roubou 3₽ e fugiu na escuridão.'}
                </p>
                <button
                  onClick={handleSpecialDefeat}
                  className="w-full py-4 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl bg-white text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                  Continuar →
                </button>
              </div>
            )
          }

          const selectedIds = new Set(battle.playerSelected.map(p => p.id))
          const hardSurvivors = playerDeck.filter(p => !selectedIds.has(p.id) && p.hearts > 0 && !p.isFainted)
          function handleNormalRetry()      { incrementDeathCount(); endBattle('lose'); router.push('/torre') }
          function handleHardSecondChance() { incrementDeathCount(); endBattle('lose'); router.push('/torre') }
          function handleGiveUp()           { setRunEndReason('lost'); endBattle('lose'); router.push('/game-over') }

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
                        <p className="font-game text-[8px] text-white/80 uppercase">{p.name}</p>
                        <div className="flex items-center gap-1">
                          <span className="font-game text-[8px] text-white/50 tracking-widest">HP</span>
                          <span className="font-game text-[8px] font-black text-white/90">{Math.ceil(p.hearts)}/5</span>
                        </div>
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
                  ) : (
                    <p className="font-black text-base text-ink leading-tight">
                      <span className="blink-cursor">▶</span>
                      O que <span style={{ color: typeColor }}>{pf.pokemon.name}</span> vai fazer?
                    </p>
                  )}
                  {effects.slots[0].status?.condition === 'paralysis' && !playerIsForced && (
                    <p className="font-game text-[8px] uppercase tracking-widest leading-none"
                      style={{ color: STATUS_BG['paralysis'] }}>
                      ⚡ {pf.pokemon.name} está paralisado — 40% de travar
                    </p>
                  )}
                  {quickClawRevealed && precomputedEnemyRPS && (
                    <p className="font-game text-[8px] uppercase tracking-widest leading-none"
                      style={{ color: '#D4A000' }}>
                      🐾 Garra Rápida! {ef.pokemon.name} vai usar {RPS_ICON[precomputedEnemyRPS]} {ef.pokemon.moves[precomputedEnemyRPS].name}
                    </p>
                  )}
                  {gym.aiLevel === 'predictive' && moveHistory.length >= 2 && (
                    <p className="font-game text-[8px] uppercase tracking-widest leading-none"
                      style={{ color: '#7038F8' }}>
                      🧠 IA analisou {moveHistory.length} turnos — varie seus moves!
                    </p>
                  )}
                </div>
              )}

              {phase === 'result' && lastResult && (() => {
                const enemyWinsLabel = lastResult.switchedIn
                  ? `🔄 Troca! ${ef.pokemon.name} atacou!`
                  : lastResult.playerSkippedTurn
                  ? '💤 Turno Nulo — inimigo atacou!'
                  : lastResult.lostTurn
                  ? '🧊 Turno perdido!'
                  : lastResult.playerProtected
                  ? '🛡️ Você bloqueou o ataque!'
                  : '💥 Inimigo venceu este turno'
                const cfg = {
                  player_wins: { color: '#2AAA2A', label: lastResult.enemyLostTurn ? '😴 Inimigo perdeu o turno!' : lastResult.enemyProtected ? '🛡️ Inimigo bloqueou seu ataque!' : '🏆 Você venceu este turno!' },
                  enemy_wins:  { color: '#CC2200', label: enemyWinsLabel },
                  tie:         { color: '#888870', label: '🤝 Empate — ninguém atacou' },
                }[lastResult.outcome]
                const wasUnique = lastResult.playerMove === 'unique'
                const playerRpsKey = wasUnique ? null : lastResult.playerMove as RPS
                const skipBeatLabel = lastResult.lostTurn || lastResult.playerSkippedTurn || lastResult.enemyLostTurn || lastResult.switchedIn || lastResult.playerProtected || lastResult.enemyProtected
                return (
                  <div className="flex flex-col gap-1">
                    <p className="font-black text-base text-ink leading-tight">{cfg.label}</p>
                    {!wasUnique && !skipBeatLabel && lastResult.outcome !== 'tie' && (
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

            {/* ── SELECTING: ability + move grid + aux ── */}
            {phase === 'selecting' && (
              <div className="flex flex-col gap-2">
                <AbilityStrip pokemon={pf.pokemon} typeColor={typeColor} />
                <MoveGrid
                  pokemon={pf.pokemon}
                  effects={effects}
                  uniqueUsed={uniqueUsed[playerIdx] ?? false}
                  playerIsForced={playerIsForced}
                  forcedButtonLabel={
                    playerIsSleeping ? '😴 Confirmar turno nulo' :
                    !!stickyWebForcedMove ? '🕸️ Confirmar ✊ (Sticky Web)' :
                    undefined
                  }
                  onAttack={handleAttack}
                  onOpenSheet={setSheetInfo}
                />

                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleSwitch}
                      disabled={playerIsForcedByStatus || effects.slots[0].tiredTurns > 0 || playerFighters.filter(f => f.hearts > 0).length <= 1}
                      className="flex-1 py-3 font-black text-sm uppercase border-2 rounded-2xl transition-all duration-75 cursor-pointer disabled:cursor-not-allowed"
                      style={(playerIsForcedByStatus || effects.slots[0].tiredTurns > 0 || playerFighters.filter(f => f.hearts > 0).length <= 1)
                        ? { borderColor: 'rgba(44,24,16,0.15)', backgroundColor: '#F5EDD8', color: 'rgba(44,24,16,0.3)' }
                        : { borderColor: '#2C1810', backgroundColor: '#FBF5E6', color: '#2C1810', boxShadow: '3px 3px 0 #2C1810' }}>
                      🔄 Trocar Pokémon
                    </button>
                    <button
                      onClick={() => setShowAbandon(true)}
                      className="px-5 py-3 font-game text-[8px] uppercase border-2 border-ink/40 rounded-2xl text-ink/70 hover:text-ink hover:border-ink/70 hover:bg-white/60 transition-all cursor-pointer">
                      🏳️ Fugir
                    </button>
                  </div>
                  {playerFighters.filter(f => f.hearts > 0).length > 1 && !playerIsForcedByStatus && !effects.slots[0].tiredTurns && (
                    <p className="font-game text-[8px] text-ink/40 text-center uppercase tracking-widest leading-none">
                      ⚠️ Trocar gasta o turno — inimigo ataca de graça
                    </p>
                  )}
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
                        <p className="font-black text-[11px] text-ink text-center leading-tight truncate w-full">{lastResult.switchedIn}</p>
                        <span className="font-game text-[8px] px-2 py-[3px] rounded-full leading-none bg-ink/10 text-ink/50">TROCA</span>
                        <p className="font-game text-[8px] text-ink/35 uppercase tracking-widest leading-none">Você</p>
                      </div>
                    ) : lastResult.playerSkippedTurn ? (
                      <div className="rounded-2xl border-2 border-ink px-3 py-3 flex flex-col items-center gap-1.5 bg-white"
                        style={{ boxShadow: '3px 3px 0 rgba(44,24,16,0.12)', opacity: 0.7 }}>
                        <span className="text-3xl leading-none">😴</span>
                        <p className="font-black text-[11px] text-ink text-center leading-tight truncate w-full">{pf.pokemon.name}</p>
                        <span className="font-game text-[8px] px-2 py-[3px] rounded-full leading-none text-white"
                          style={{ backgroundColor: '#8060A8' }}>DORMINDO</span>
                        <p className="font-game text-[8px] text-ink/35 uppercase tracking-widest leading-none">Você</p>
                      </div>
                    ) : lastResult.playerProtected ? (
                      <div className="rounded-2xl border-2 px-3 py-3 flex flex-col items-center gap-1.5 bg-white"
                        style={{ borderColor: '#2C7BB5', boxShadow: '3px 3px 0 #2C7BB5' }}>
                        <span className="text-3xl leading-none">🛡️</span>
                        <p className="font-black text-[11px] text-ink text-center leading-tight truncate w-full">{playerMoveName}</p>
                        <span className="font-game text-[8px] px-2 py-[3px] rounded-full leading-none text-white"
                          style={{ backgroundColor: '#2C7BB5' }}>BLOQUEOU!</span>
                        <p className="font-game text-[8px] text-ink/35 uppercase tracking-widest leading-none">Você</p>
                      </div>
                    ) : (
                    <div className="rounded-2xl border-2 border-ink px-3 py-3 flex flex-col items-center gap-1.5 bg-white"
                      style={{ boxShadow: lastResult.outcome === 'player_wins' ? '3px 3px 0 #38C838' : '3px 3px 0 rgba(44,24,16,0.12)' }}>
                      <span className="text-3xl leading-none">{playerIcon}</span>
                      <p className="font-black text-[11px] text-ink text-center leading-tight truncate w-full">{playerMoveName}</p>
                      {playerMoveType && (
                        <span className="font-game text-[8px] px-2 py-[3px] rounded-full leading-none"
                          style={{ backgroundColor: getTypeColor(playerMoveType), color: getTypeTextColor(playerMoveType) }}>
                          {playerMoveType}
                        </span>
                      )}
                      <p className="font-game text-[8px] text-ink/35 uppercase tracking-widest leading-none">Você</p>
                      {lastResult.enemyDmg > 0 && (
                        <p className="font-black text-sm leading-none" style={{ color: '#2AAA2A' }}>
                          −{lastResult.enemyDmg} ♥
                        </p>
                      )}
                    </div>
                    )}

                    {/* Enemy move */}
                    <div className="rounded-2xl border-2 px-3 py-3 flex flex-col items-center gap-1.5 bg-white"
                      style={{
                        borderColor: lastResult.enemyProtected ? '#2C7BB5' : '#2C1810',
                        boxShadow: lastResult.enemyProtected ? '3px 3px 0 #2C7BB5' : lastResult.outcome === 'enemy_wins' ? '3px 3px 0 #CC2200' : '3px 3px 0 rgba(44,24,16,0.12)'
                      }}>
                      <span className="text-3xl leading-none">{RPS_ICON[lastResult.enemyMove]}</span>
                      <p className="font-black text-[11px] text-ink text-center leading-tight truncate w-full">{enemyMoveName}</p>
                      {lastResult.enemyProtected ? (
                        <span className="font-game text-[8px] px-2 py-[3px] rounded-full leading-none text-white"
                          style={{ backgroundColor: '#2C7BB5' }}>BLOQUEOU!</span>
                      ) : enemyMoveType ? (
                        <span className="font-game text-[8px] px-2 py-[3px] rounded-full leading-none"
                          style={{ backgroundColor: getTypeColor(enemyMoveType), color: getTypeTextColor(enemyMoveType) }}>
                          {enemyMoveType}
                        </span>
                      ) : null}
                      <p className="font-game text-[8px] text-ink/35 uppercase tracking-widest leading-none">{gym.name}</p>
                      {lastResult.playerDmg > 0 && (
                        <p className="font-black text-sm leading-none" style={{ color: '#CC2200' }}>
                          −{lastResult.playerDmg} ♥
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Effectiveness + activations */}
                  {(effLabel || lastResult.activations.length > 0) && (
                    <div className="rounded-2xl border border-ink/12 bg-white px-4 py-3 flex flex-col gap-1.5 max-h-[40vh] overflow-y-auto">
                      {effLabel && (
                        <p className="font-black text-sm text-center"
                          style={{ color: lastResult.multiplier >= 2 ? '#D4A000' : '#888870' }}>
                          {effLabel}
                        </p>
                      )}
                      {lastResult.activations.map((msg, i) => (
                        <p key={i} className="font-game text-[9px] text-ink/75 text-center leading-relaxed">{msg}</p>
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
          <div className="w-full max-w-[640px] rounded-t-3xl border-t-4 border-x-4 border-ink overflow-hidden"
            style={{ backgroundColor: '#FBF5E6' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-ink/20 mx-auto mt-5" />
            <div className="max-h-[80svh] overflow-y-auto px-5 pt-4"
              style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}>
            <p className="font-black text-lg text-ink uppercase tracking-tight text-center mb-1">
              {switchRequired ? 'Próximo Pokémon!' : 'Trocar Pokémon'}
            </p>
            <p className="font-game text-[8px] text-ink-soft opacity-50 uppercase tracking-widest text-center mb-5">
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
                      <div className="flex justify-center items-center gap-1 mt-1">
                        <span className="font-game text-[8px] text-ink/50 tracking-widest">HP</span>
                        <span className="font-game text-[8px] font-black"
                          style={{ color: fighter.hearts <= 0 ? '#E82020' : fighter.hearts <= 1 ? '#F0C000' : '#2C1810' }}>
                          {Math.ceil(fighter.hearts)}/{fighter.pokemon.hearts}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="font-game text-[8px] uppercase tracking-widest mt-1 block" style={{ color: tc }}>
                          Em campo
                        </span>
                      )}
                      {isKO && (
                        <span className="font-game text-[8px] uppercase tracking-widest mt-1 block text-ink/40">
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
        </div>
      )}

      {/* ── ABANDON CONFIRM ── */}
      {showAbandon && (
        <AbandonConfirmModal
          currentFloor={currentFloor}
          badgesEarned={badgesEarned}
          playerDeck={playerDeck}
          onConfirm={handleAbandon}
          onCancel={() => setShowAbandon(false)}
        />
      )}

      {/* Bottom sheet — descrição de move (mobile only, sm+ usa flip do card) */}
      <MoveBottomSheet info={sheetInfo} onClose={() => setSheetInfo(null)} />

    </main>
  )
}
