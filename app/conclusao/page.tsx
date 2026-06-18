'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { getTypeColor, getTypeTextColor, getSpriteUrl } from '@/lib/typeColors'

const RANK_CONFIG = [
  { maxDeaths: 0,  label: 'S',  title: 'Perfeito',       color: '#F8D030', desc: 'Zerou sem nenhuma morte. Lendário!' },
  { maxDeaths: 2,  label: 'A',  title: 'Excelente',      color: '#78C850', desc: 'Pouquíssimas derrotas. Parabéns!' },
  { maxDeaths: 5,  label: 'B',  title: 'Bom',            color: '#48A0FF', desc: 'Bom desempenho. Continue treinando!' },
  { maxDeaths: 9,  label: 'C',  title: 'Regular',        color: '#A8A878', desc: 'Deu trabalho, mas você conseguiu.' },
  { maxDeaths: Infinity, label: 'D', title: 'Sobrevivente', color: '#CC2200', desc: 'Cada derrota foi uma lição.' },
]

function getRank(deaths: number) {
  return RANK_CONFIG.find(r => deaths <= r.maxDeaths)!
}

export default function ConclusaoPage() {
  const router = useRouter()
  const { playerName, playerDeck, deathCount, mode, resetRun, finalizeRun } = useGameStore()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mode) { router.replace('/'); return }
    finalizeRun('won')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const rank = getRank(deathCount)

  async function handleShare() {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#FBF5E6'
    ctx.fillRect(0, 0, 640, 480)

    ctx.fillStyle = rank.color
    ctx.fillRect(0, 0, 640, 80)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Torre de Kanto — Concluída!', 320, 48)
    ctx.font = '18px sans-serif'
    ctx.fillText(`${playerName} · ${mode === 'normal' ? 'Normal' : 'Hard'}`, 320, 70)

    ctx.fillStyle = rank.color
    ctx.font = 'bold 96px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(rank.label, 320, 200)

    ctx.fillStyle = '#2C1810'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(rank.title, 320, 240)

    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#666'
    ctx.fillText(`${deathCount} ${deathCount === 1 ? 'morte' : 'mortes'}`, 320, 270)

    ctx.font = '14px sans-serif'
    ctx.fillText('Pokémon Reach the Top', 320, 460)

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return

    const file = new File([blob], 'resultado-rtt.png', { type: 'image/png' })

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Pokémon Reach the Top',
        text: `${playerName} concluiu a Torre de Kanto! Rank ${rank.label} · ${deathCount} morte(s)`,
      }).catch(() => {})
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resultado-rtt.png'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  function handleRestart() {
    resetRun()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-parchment dots flex flex-col items-center justify-start pb-16">

      {/* Header */}
      <header className="w-full border-b-4 border-ink px-5 py-5 text-center" style={{ backgroundColor: rank.color }}>
        <p className="font-game text-[8px] text-white/70 uppercase tracking-widest mb-1">Torre de Kanto</p>
        <p className="font-black text-2xl text-white uppercase tracking-tight">Concluída!</p>
      </header>

      <div className="w-full max-w-[480px] px-5 flex flex-col gap-6 pt-6" ref={cardRef}>

        {/* Rank card */}
        <div className="border-4 border-ink rounded-3xl overflow-hidden bg-white shadow-neo-lg text-center">
          <div className="py-8 px-6" style={{ backgroundColor: `${rank.color}18` }}>
            <div
              className="w-28 h-28 rounded-full border-4 border-ink flex items-center justify-center mx-auto mb-4 font-black text-6xl shadow-neo"
              style={{ backgroundColor: rank.color, color: 'white' }}
            >
              {rank.label}
            </div>
            <p className="font-black text-2xl text-ink uppercase tracking-tight">{rank.title}</p>
            <p className="text-sm text-ink-soft opacity-60 mt-1 leading-relaxed">{rank.desc}</p>
          </div>
          <div className="border-t-2 border-ink/10 px-6 py-4 flex items-center justify-between bg-parchment-light">
            <div className="text-left">
              <p className="font-game text-[8px] text-ink/40 uppercase tracking-widest">Treinador</p>
              <p className="font-black text-base text-ink">{playerName || 'Sem nome'}</p>
            </div>
            <div className="text-center">
              <p className="font-game text-[8px] text-ink/40 uppercase tracking-widest">Modo</p>
              <p className="font-black text-sm text-ink">{mode === 'normal' ? 'Normal' : 'Hard'}</p>
            </div>
            <div className="text-right">
              <p className="font-game text-[8px] text-ink/40 uppercase tracking-widest">Mortes</p>
              <p className="font-black text-2xl" style={{ color: deathCount === 0 ? rank.color : '#CC2200' }}>
                {deathCount}
              </p>
            </div>
          </div>
        </div>

        {/* Time final */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-ink opacity-10" />
            <span className="font-game text-[8px] text-ink-soft opacity-40 uppercase tracking-widest">Time Final</span>
            <div className="h-px flex-1 bg-ink opacity-10" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {playerDeck.map(p => {
              const tc = getTypeColor(p.type1)
              return (
                <div key={p.id} className="border-2 border-ink rounded-2xl overflow-hidden bg-white shadow-neo-sm">
                  <div className="h-1.5" style={{ backgroundColor: tc }} />
                  <div className="flex flex-col items-center gap-1.5 p-3">
                    <img src={getSpriteUrl(p.id)} alt={p.name} style={{ width: 56, height: 56, objectFit: 'contain' }} />
                    <p className="font-black text-[9px] text-ink uppercase text-center leading-tight">{p.name}</p>
                    <span
                      className="font-game text-[8px] px-2 py-0.5 rounded-full border border-ink/15"
                      style={{ backgroundColor: tc, color: getTypeTextColor(p.type1) }}
                    >
                      {p.type1}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-game text-[8px] text-ink/50 tracking-widest">HP</span>
                      <span className="font-game text-[8px] font-black"
                        style={{ color: p.hearts <= 1 ? '#E82020' : p.hearts <= 2 ? '#F0C000' : '#2C1810' }}>
                        {Math.ceil(p.hearts)}/5
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ranking reference */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-ink opacity-10" />
            <span className="font-game text-[8px] text-ink-soft opacity-40 uppercase tracking-widest">Ranking</span>
            <div className="h-px flex-1 bg-ink opacity-10" />
          </div>
          <div className="flex flex-col gap-1.5">
            {RANK_CONFIG.map(r => (
              <div
                key={r.label}
                className="flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 transition-all"
                style={{
                  borderColor: r.label === rank.label ? r.color : '#2C181015',
                  backgroundColor: r.label === rank.label ? `${r.color}18` : 'transparent',
                }}
              >
                <span
                  className="font-black text-lg w-8 text-center"
                  style={{ color: r.color }}
                >
                  {r.label}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-ink">{r.title}</p>
                  <p className="font-game text-[8px] text-ink/40 uppercase tracking-wide">
                    {r.maxDeaths === 0 ? '0 mortes' : r.maxDeaths === Infinity ? '10+ mortes' : `até ${r.maxDeaths} morte${r.maxDeaths > 1 ? 's' : ''}`}
                  </p>
                </div>
                {r.label === rank.label && (
                  <span className="font-game text-[8px] px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: r.color }}>
                    você
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleShare}
            className="w-full py-4 font-black text-base tracking-[0.15em] uppercase border-2 border-ink rounded-2xl text-parchment-light shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            style={{ backgroundColor: rank.color }}
          >
            📸 Compartilhar resultado
          </button>
          <button
            onClick={handleRestart}
            className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase border-2 border-ink rounded-2xl bg-parchment-light text-ink shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            🔄 Nova run
          </button>
        </div>

      </div>
    </main>
  )
}
