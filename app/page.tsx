'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import type { GameMode } from '@/types'

// ─── Pokéball Sugimori-style ───────────────────────────────────────────────────
function Pokeball({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top half - vermelho quente Sugimori */}
      <path d="M10 50 A40 40 0 0 1 90 50 Z" fill="#CC2200" />
      {/* Bottom half - creme parchment */}
      <path d="M10 50 A40 40 0 0 0 90 50 Z" fill="#FBF5E6" />
      {/* Outline ink quente */}
      <circle cx="50" cy="50" r="40" stroke="#2C1810" strokeWidth="4.5" fill="none" />
      {/* Faixa central */}
      <rect x="10" y="46" width="80" height="8" fill="#2C1810" />
      {/* Botão central */}
      <circle cx="50" cy="50" r="11" fill="#2C1810" />
      <circle cx="50" cy="50" r="6.5" fill="#FBF5E6" />
      <circle cx="50" cy="50" r="3" fill="#D4C8B0" />
      {/* Reflexo aquarela */}
      <circle cx="36" cy="31" r="5" fill="rgba(255,255,255,0.22)" />
      <circle cx="40" cy="26" r="2.5" fill="rgba(255,255,255,0.15)" />
    </svg>
  )
}

// ─── Badge de tipo Gen 1 ───────────────────────────────────────────────────────
function TypeBadge({
  label, bg, textColor = '#FBF5E6'
}: { label: string; bg: string; textColor?: string }) {
  return (
    <span
      className="type-badge"
      style={{ backgroundColor: bg, color: textColor }}
    >
      {label}
    </span>
  )
}

// ─── Card com borda ink quente ─────────────────────────────────────────────────
function NeoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-parchment-light border-2 border-ink rounded-2xl shadow-neo ${className}`}>
      {children}
    </div>
  )
}

// ─── Steps — cores dos tipos Gen 1 ────────────────────────────────────────────
const STEPS = [
  {
    num: '01', bg: '#F08030',
    title: 'Draft de Pokémon',
    body: 'Escolha um dos 3 iniciais de Kanto. A cada ginásio vencido, 3 novos Pokémon surgem — o pool muda por região, dos comuns de Viridian aos lendários do Plateau.',
  },
  {
    num: '02', bg: '#6890F0',
    title: 'Combate em Jokenpô',
    body: 'Pedra, Papel ou Tesoura. Tipo e habilidade modificam o dano. Troque de Pokémon quando quiser — mas o inimigo ataca de graça. Cuidado com status: veneno, paralisia e sono mudam o jogo.',
  },
  {
    num: '03', bg: '#78C850',
    title: '12 Andares para Escalar',
    body: '8 líderes + Elite 4. A IA evolui de aleatória até preditiva. Entre andares: cure seu time no Centro Pokémon e compre itens no Pokémart.',
  },
  {
    num: '04', bg: '#A890F0',
    title: 'Itens & Hazards',
    body: 'Equipamentos passivos (Leftovers, Life Orb, Focus Sash) e consumíveis (Potion, Revive, Rare Candy). Ginásios jogam armadilhas de entrada — Spikes e Toxic Spikes — que persistem pela batalha.',
  },
  {
    num: '05', bg: '#F85888',
    title: 'Habilidades & Ataques Únicos',
    body: 'Cada Pokémon tem habilidade passiva. Formas finais possuem ataque único — de cura a OHKO. Toque no card para ver a descrição completa.',
  },
]

// ─── Modos ────────────────────────────────────────────────────────────────────
const MODES: { id: GameMode; title: string; desc: string; typeColor: string; typeLabel: string }[] = [
  {
    id: 'normal',
    title: 'Normal',
    desc: 'Centro Pokémon restaura o time entre cada ginásio. IA começa fácil e fica preditiva no andar 9.',
    typeColor: '#78C850',
    typeLabel: 'Grass',
  },
  {
    id: 'hard',
    title: 'Hard',
    desc: 'HP perdido nunca volta. A IA entra em modo preditivo no andar 5. Para veteranos.',
    typeColor: '#C03028',
    typeLabel: 'Fighting',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const setMode = useGameStore((s) => s.setMode)
  const resetRun = useGameStore((s) => s.resetRun)
  const [selected, setSelected] = useState<GameMode | null>(null)

  function handleStart() {
    if (!selected) return
    resetRun()
    setMode(selected)
    router.push('/personagem')
  }

  return (
    <main className="min-h-screen bg-parchment dots relative overflow-x-hidden">

      {/* Pokéballs decorativas de fundo — fantasmas aquarela */}
      <Pokeball size={340} className="absolute -top-20 -right-28 opacity-[0.06] pointer-events-none" />
      <Pokeball size={220} className="absolute top-1/2 -left-20 opacity-[0.05] pointer-events-none" />
      <Pokeball size={160} className="absolute bottom-32 right-10 opacity-[0.05] pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-[620px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center border-2 border-ink rounded-full shadow-neo-sm bg-parchment-light">
            <Pokeball size={26} />
          </div>
          <span className="font-game text-[8px] text-ink-soft tracking-widest uppercase">
            Reach the Top
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/como-jogar')}
            className="border-2 border-ink rounded-full px-2 sm:px-4 py-1.5 font-game text-[8px] tracking-wide uppercase text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <span className="sm:hidden">❓</span>
            <span className="hidden sm:inline">❓ Como Jogar</span>
          </button>
          <button
            onClick={() => router.push('/pokedex')}
            className="border-2 border-ink rounded-full px-2 sm:px-4 py-1.5 font-game text-[8px] tracking-wide uppercase text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <span className="sm:hidden">📖</span>
            <span className="hidden sm:inline">📖 Pokédex</span>
          </button>
          <button
            onClick={() => router.push('/historico')}
            className="border-2 border-ink rounded-full px-2 sm:px-4 py-1.5 font-game text-[8px] tracking-wide uppercase text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <span className="sm:hidden">📜</span>
            <span className="hidden sm:inline">Histórico</span>
          </button>
          <button
            onClick={() => router.push('/patch-notes')}
            className="border-2 border-ink rounded-full px-2 sm:px-4 py-1.5 font-game text-[8px] tracking-wide uppercase text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <span className="sm:hidden">📋</span>
            <span className="hidden sm:inline">📋 Novidades</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="relative z-10 flex flex-col items-center px-5 pb-20 gap-7 max-w-[620px] mx-auto">

        {/* ─ Hero card ─ */}
        <NeoCard className="w-full p-8 flex flex-col items-center gap-6 text-center paper">

          {/* Pokéball em card interno estilo visor Game Boy */}
          <div className="relative">
            <div
              className="w-44 h-44 flex items-center justify-center border-2 border-ink rounded-2xl shadow-neo bg-parchment-dark"
            >
              {/* Detalhe de canto estilo hardware anos 90 */}
              <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-ink opacity-20" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ink opacity-20" />
              <Pokeball size={118} className="pokeball-float" />
            </div>
            {/* Badge #000 estilo Pokédex */}
            <span className="absolute -top-3 -right-4 bg-ink text-parchment font-game text-[8px] px-3 py-1 rounded-full border-2 border-ink shadow-neo-sm">
              #001–151
            </span>
          </div>

          {/* Título */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-ink opacity-20" />
              <span className="font-game text-[8px] text-ink-soft tracking-[0.5em] uppercase opacity-60">Kanto · Gen I</span>
              <div className="h-px w-10 bg-ink opacity-20" />
            </div>
            <h1 className="text-[3rem] font-black tracking-tight leading-none uppercase text-ink">
              Pokémon
            </h1>
            <h2 className="text-[1.75rem] font-black tracking-tight leading-tight uppercase mt-1">
              <span style={{ color: '#CC2200' }}>Reach</span>
              <span className="text-ink"> the </span>
              <span style={{ color: '#3B4CCA' }}>Top</span>
            </h2>
            <p className="text-sm text-ink-soft mt-3 max-w-[300px] mx-auto leading-relaxed opacity-80">
              Monte seu time de 6, escale 12 andares de ginásios e derrote Lance para se tornar Campeão de Kanto.
            </p>
          </div>

          {/* Type badges — iniciais de Kanto */}
          <div className="flex flex-wrap justify-center gap-2">
            <TypeBadge label="Grass" bg="#78C850" />
            <TypeBadge label="Fire" bg="#F08030" />
            <TypeBadge label="Water" bg="#6890F0" />
            <TypeBadge label="+ 15 tipos" bg="#A8A878" />
          </div>

          {/* Regras rápidas */}
          <div className="grid grid-cols-4 gap-2 w-full border-t-2 border-ink border-opacity-10 pt-5">
            {[
              { n: '6', l: 'Pokémon\nno deck' },
              { n: '3', l: 'por\nbatalha' },
              { n: '1', l: 'switch\nlivre' },
              { n: '1', l: 'reroll\nno draft' },
            ].map((r) => (
              <div
                key={r.n}
                className="border-2 border-ink rounded-xl p-2.5 text-center shadow-neo-sm bg-parchment-dark"
              >
                <p className="font-game text-[18px] leading-none" style={{ color: '#CC2200' }}>{r.n}</p>
                <p className="text-[9px] text-ink-soft mt-1 leading-tight whitespace-pre-line uppercase tracking-wide opacity-70">
                  {r.l}
                </p>
              </div>
            ))}
          </div>
        </NeoCard>

        {/* ─ Como funciona ─ */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-[2px] flex-1 bg-ink opacity-15 rounded" />
            <span className="font-game text-[8px] text-ink-soft opacity-50 tracking-widest uppercase">Como funciona</span>
            <div className="h-[2px] flex-1 bg-ink opacity-15 rounded" />
          </div>

          {STEPS.map((step) => (
            <NeoCard key={step.num} className="p-4 flex gap-4 items-start">
              {/* Badge com cor de tipo Gen 1 + efeito sticker */}
              <div
                className="shrink-0 w-11 h-11 flex items-center justify-center border-2 border-ink rounded-xl font-game text-[9px] text-parchment-light"
                style={{
                  backgroundColor: step.bg,
                  boxShadow: '0 0 0 2px #F5EDD8, 3px 3px 0 #2C1810',
                }}
              >
                {step.num}
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-wide text-ink leading-tight mb-1">
                  {step.title}
                </p>
                <p className="text-[12px] text-ink-soft leading-relaxed opacity-80">
                  {step.body}
                </p>
              </div>
            </NeoCard>
          ))}

          {/* Card misterioso dos lendários */}
          <div
            className="border-2 border-ink rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, #F5EDD8 0%, #E8DCC8 100%)',
              boxShadow: '4px 4px 0px #2C1810',
            }}
          >
            <div className="flex justify-center gap-2 mb-2">
              <TypeBadge label="Dragon" bg="#7038F8" />
              <TypeBadge label="Psychic" bg="#F85888" />
              <TypeBadge label="???" bg="#705898" />
            </div>
            <p className="text-[11px] text-ink-soft leading-relaxed opacity-80">
              Após cada ginásio, troque 1 Pokémon entre 3 opções.
              Nos últimos andares, <strong className="text-ink opacity-100">Articuno, Zapdos, Moltres, Dragonite e Mewtwo</strong> entram no pool —
              e existe uma chance <strong style={{ color: '#7038F8' }}>muito pequena</strong> de aparecer algo que não deveria existir...
            </p>
          </div>
        </div>

        {/* ─ Dificuldade ─ */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-[2px] flex-1 bg-ink opacity-15 rounded" />
            <span className="font-game text-[8px] text-ink-soft opacity-50 tracking-widest uppercase">Dificuldade</span>
            <div className="h-[2px] flex-1 bg-ink opacity-15 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MODES.map((m) => {
              const isSelected = selected === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`relative p-5 text-left border-2 border-ink rounded-2xl transition-all duration-100 ${
                    isSelected
                      ? 'translate-x-[2px] translate-y-[2px]'
                      : 'shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                  }`}
                  style={{
                    backgroundColor: isSelected ? m.typeColor : '#FBF5E6',
                    boxShadow: isSelected ? 'none' : undefined,
                  }}
                >
                  <TypeBadge
                    label={m.typeLabel}
                    bg={m.typeColor}
                    textColor={isSelected ? '#2C1810' : '#FBF5E6'}
                  />
                  <p className={`font-black text-base uppercase tracking-wide leading-tight mt-3 mb-1 ${isSelected ? 'text-parchment-light' : 'text-ink'}`}>
                    {m.title}
                  </p>
                  <p className={`text-[11px] leading-snug ${isSelected ? 'text-parchment-light opacity-80' : 'text-ink-soft opacity-70'}`}>
                    {m.desc}
                  </p>
                  {isSelected && (
                    <span className="absolute top-3.5 right-4 font-black text-parchment-light text-sm">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ─ CTA ─ */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={handleStart}
            disabled={!selected}
            className={`w-full py-5 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl transition-all duration-100 ${
              selected
                ? 'shadow-neo-red hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer text-parchment-light'
                : 'text-ink opacity-30 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: selected ? '#CC2200' : '#E8E0CC',
              borderColor: selected ? '#2C1810' : '#2C1810',
            }}
          >
            {selected ? 'Escolher Personagem →' : 'Selecione a dificuldade'}
          </button>
          {selected && (
            <p className="font-game text-[8px] text-ink-soft opacity-40 tracking-widest uppercase text-center">
              Modo {selected === 'normal' ? 'Normal' : 'Hard'} selecionado
            </p>
          )}
        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center pb-8 px-5 border-t-2 border-ink border-opacity-10 pt-5">
        <p className="text-[9px] text-ink-soft opacity-30 tracking-wide">
          Fan project não-comercial · Pokémon © Nintendo / Game Freak / TPCi · Arte original: Ken Sugimori
        </p>
      </footer>

    </main>
  )
}
