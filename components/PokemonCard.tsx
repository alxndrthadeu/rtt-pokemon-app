'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { PokemonCard as PokemonCardType } from '@/types'
import {
  getTypeColor, getTypeTextColor, RARITY_CONFIG,
  RPS_ICON, getSpriteUrl, formatPokemonNumber,
} from '@/lib/typeColors'

// ─── Type chip ─────────────────────────────────────────────────────────────────
function TypeChip({ type }: { type: string }) {
  const bg = getTypeColor(type as any)
  const color = getTypeTextColor(type as any)
  return (
    <span
      className="inline-block font-game text-[6px] px-2 py-0.5 rounded-full border border-ink/20 tracking-wide"
      style={{ backgroundColor: bg, color }}
    >
      {type}
    </span>
  )
}

// ─── Rarity dots ───────────────────────────────────────────────────────────────
function RarityDots({ rarity }: { rarity: PokemonCardType['rarity'] }) {
  const cfg = RARITY_CONFIG[rarity]
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full border border-ink/20"
          style={{ backgroundColor: i < cfg.dots ? cfg.color : 'transparent' }}
        />
      ))}
    </div>
  )
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface PokemonCardProps {
  pokemon: PokemonCardType
  selectable?: boolean
  selected?: boolean
  onClick?: () => void
}

// ─── Card ──────────────────────────────────────────────────────────────────────
export function PokemonCard({ pokemon, selectable, selected, onClick }: PokemonCardProps) {
  const [showInfo, setShowInfo] = useState(false)
  const type1Color = getTypeColor(pokemon.type1)

  return (
    <div
      onClick={selectable ? onClick : undefined}
      className={[
        'relative flex flex-col border-2 border-ink rounded-2xl overflow-hidden bg-white transition-all duration-100',
        selectable ? 'cursor-pointer' : '',
        selected
          ? 'translate-x-[3px] translate-y-[3px]'
          : selectable
          ? 'shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
          : 'shadow-neo',
      ].join(' ')}
      style={selected ? { outline: `3px solid ${type1Color}`, outlineOffset: 2 } : undefined}
    >
      {/* Faixa de tipo */}
      <div className="h-2 w-full shrink-0" style={{ backgroundColor: type1Color }} />

      {/* ── Sprite ── */}
      <div className="relative bg-white flex items-center justify-center shrink-0" style={{ height: 148 }}>
        <span className="absolute top-2 left-2 font-game text-[7px] text-ink/25 z-10">
          {formatPokemonNumber(pokemon.id)}
        </span>
        {pokemon.isShiny && (
          <span className="absolute top-2 right-2 text-[10px] z-10">✨</span>
        )}
        <Image
          src={getSpriteUrl(pokemon.id)}
          alt={pokemon.name}
          width={120}
          height={120}
          className="object-contain w-28 h-28 relative z-10"
          priority={selectable}
        />
        {selected && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{ backgroundColor: `${type1Color}28` }}
          >
            <span className="text-4xl drop-shadow font-black text-white">✓</span>
          </div>
        )}
      </div>

      {/* ── Info section ── */}
      <div className="relative bg-parchment-light flex flex-col gap-2 p-3 border-t-2 border-ink/10 flex-1 overflow-hidden">

        {/* Nome + raridade */}
        <div className="flex items-start justify-between gap-1">
          <p className="font-black text-sm text-ink uppercase tracking-wide leading-tight">{pokemon.name}</p>
          <RarityDots rarity={pokemon.rarity} />
        </div>

        {/* Tipos */}
        <div className="flex gap-1 flex-wrap">
          <TypeChip type={pokemon.type1} />
          {pokemon.type2 && <TypeChip type={pokemon.type2} />}
        </div>

        {/* Habilidade — hover no desktop, tap no mobile */}
        <div
          className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2 py-1.5 border border-ink/10 cursor-help"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          onClick={(e) => {
            e.stopPropagation()
            if (window.matchMedia('(hover: none)').matches) setShowInfo(v => !v)
          }}
        >
          <span className="font-game text-[6px] text-ink-soft uppercase tracking-wide opacity-50 shrink-0">Hab.</span>
          <span className="font-bold text-[10px] text-ink flex-1 truncate">{pokemon.ability.name}</span>
          <span className="text-[9px] text-ink/30 shrink-0">ℹ</span>
        </div>

        {/* Moves */}
        <div className="flex flex-col gap-1">
          {(['rock', 'paper', 'scissors'] as const).map((rps) => {
            const move = pokemon.moves[rps]
            const moveTypeColor = getTypeColor(move.type)
            const moveTextColor = getTypeTextColor(move.type)
            return (
              <div key={rps} className="flex items-center gap-1.5">
                <span className="text-[11px] shrink-0 w-5 text-center leading-none">{RPS_ICON[rps]}</span>
                <span className="text-[10px] text-ink-soft flex-1 truncate">{move.name}</span>
                <span
                  className="font-game text-[6px] px-1.5 py-0.5 rounded-full border border-ink/20 shrink-0"
                  style={{ backgroundColor: moveTypeColor, color: moveTextColor }}
                >
                  {move.type}
                </span>
              </div>
            )
          })}
        </div>

        {/* Ataque único */}
        {pokemon.unique ? (
          <div
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 border-2 mt-auto"
            style={{
              borderColor: getTypeColor(pokemon.unique.type),
              backgroundColor: `${getTypeColor(pokemon.unique.type)}15`,
            }}
          >
            <span className="text-[11px] shrink-0">⚡</span>
            <p className="font-black text-[9px] text-ink truncate flex-1">{pokemon.unique.name}</p>
            <TypeChip type={pokemon.unique.type} />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 border border-dashed border-ink/15 mt-auto">
            <span className="text-[9px] text-ink/25 italic">sem ataque único</span>
          </div>
        )}

        {/* Corações */}
        <div className="flex items-center justify-between pt-1 border-t border-ink/10">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-base leading-none" style={{ opacity: i < pokemon.hearts ? 1 : 0.18 }}>
                ♥
              </span>
            ))}
          </div>
          {selectable && !selected && (
            <span className="font-game text-[7px] text-ink/30 uppercase tracking-wide">Clique</span>
          )}
          {selected && (
            <span className="font-game text-[7px] uppercase tracking-wide" style={{ color: type1Color }}>✓ No deck</span>
          )}
        </div>

        {/* ── Info panel — aparece ao hover no desktop, tap no mobile ── */}
        <div
          className={`absolute inset-x-0 bottom-0 z-30 rounded-b-2xl overflow-hidden transition-transform duration-200 ease-out ${showInfo ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ backgroundColor: '#2C1810' }}
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          onClick={(e) => {
            e.stopPropagation()
            if (window.matchMedia('(hover: none)').matches) setShowInfo(false)
          }}
        >
          {/* Header colorido */}
          <div
            className="px-3 py-2.5 flex items-center gap-2"
            style={{ backgroundColor: type1Color }}
          >
            <span className="font-game text-[7px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {pokemon.name}
            </span>
            {selectable && (
              <button
                className="ml-auto font-game text-[6px] uppercase tracking-wide px-2 py-0.5 rounded-full cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                onClick={(e) => { e.stopPropagation(); onClick?.() }}
              >
                {selected ? '✓ Selecionado' : '+ Escolher'}
              </button>
            )}
          </div>

          {/* Corpo */}
          <div className="px-3 py-3 flex flex-col gap-3" style={{ backgroundColor: '#2C1810' }}>

            {/* Habilidade */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className="font-game text-[6px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${type1Color}40`, color: type1Color }}
                >
                  Habilidade
                </span>
                <span className="font-bold text-[10px]" style={{ color: '#FBF5E6' }}>{pokemon.ability.name}</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,245,230,0.65)' }}>
                {pokemon.ability.description}
              </p>
            </div>

            {/* Ataque único */}
            {pokemon.unique && (
              <div className="pt-3" style={{ borderTop: '1px solid rgba(251,245,230,0.1)' }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="font-game text-[6px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,222,0,0.15)', color: '#F8D030' }}
                  >
                    Atq. Único
                  </span>
                  <span className="font-bold text-[10px]" style={{ color: '#FBF5E6' }}>{pokemon.unique.name}</span>
                  <TypeChip type={pokemon.unique.type} />
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,245,230,0.65)' }}>
                  {pokemon.unique.description}
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
