'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { getTypeColor, getTypeTextColor, getSpriteUrl } from '@/lib/typeColors'

export default function EventoPage() {
  const router = useRouter()
  const {
    specialBattle,
    playerDeck,
    currentFloor,
    startBattle,
    setSpecialBattle,
    spendCoins,
    coins,
  } = useGameStore()

  useEffect(() => {
    if (!specialBattle) { router.replace('/entre-andares'); return }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!specialBattle) return null

  const prevFloor = currentFloor - 1
  const nextRoute = prevFloor >= 8 ? '/entre-andares' : '/pos-batalha'
  const typeColor = getTypeColor(specialBattle.specialtyType)
  const typeText  = getTypeTextColor(specialBattle.specialtyType)

  const hasHealthyPokemon = playerDeck.some(p => !p.isFainted && p.hearts > 0)

  function startSpecialFight() {
    const nonFainted = playerDeck.filter(p => !p.isFainted && p.hearts > 0)
    if (nonFainted.length === 0) return
    const order = nonFainted.map((_, i) => i)
    startBattle(-1, specialBattle!.fighters, nonFainted, order)
    router.push('/batalha')
  }

  function handleIgnore() {
    // Pedágio de 2₽ — botão desabilitado quando saldo insuficiente, guard por segurança
    if (!spendCoins(2)) return
    setSpecialBattle(null)
    router.push(nextRoute)
  }

  // ─── Lendário ────────────────────────────────────────────────────────────────
  if (specialBattle.type === 'legendary') {
    const legendary = specialBattle.fighters[0]
    return (
      <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, #0A0A1A 0%, ${typeColor}22 50%, #0A0A1A 100%)` }}>

        {/* Aura de fundo */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${typeColor}30 0%, transparent 65%)` }} />

        {/* Estrelas de fundo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: 2 + (i % 3), height: 2 + (i % 3),
                backgroundColor: 'white',
                opacity: 0.15 + (i % 5) * 0.06,
                top: `${(i * 17 + 3) % 90}%`,
                left: `${(i * 23 + 7) % 90}%`,
                animationDuration: `${2 + (i % 3)}s`,
              }} />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-[420px] px-6 flex flex-col items-center gap-8 py-12">

          {/* Badge de localização */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border"
            style={{ borderColor: `${typeColor}50`, backgroundColor: `${typeColor}15` }}>
            <span className="font-game text-[7px] uppercase tracking-[0.4em]" style={{ color: typeColor }}>
              {specialBattle.locationName}
            </span>
          </div>

          {/* Sprite do lendário */}
          <div className="relative flex items-center justify-center">
            <div className="absolute rounded-full"
              style={{ width: 200, height: 200, background: `radial-gradient(circle, ${typeColor}40 0%, transparent 70%)` }} />
            <div className="absolute rounded-full animate-ping"
              style={{ width: 160, height: 160, backgroundColor: `${typeColor}15`, animationDuration: '2.5s' }} />
            <img
              src={getSpriteUrl(legendary.id)}
              alt={legendary.name}
              style={{ width: 160, height: 160, imageRendering: 'pixelated', objectFit: 'contain', position: 'relative', zIndex: 1 }}
            />
          </div>

          {/* Nome + tipo */}
          <div className="text-center">
            <p className="font-game text-[7px] uppercase tracking-[0.5em] mb-2" style={{ color: `${typeColor}80` }}>
              Pokémon Lendário Apareceu!
            </p>
            <h1 className="font-black text-5xl uppercase tracking-tight text-white leading-none mb-2">
              {legendary.name}
            </h1>
            <span className="font-game text-[8px] px-3 py-1.5 rounded-full"
              style={{ backgroundColor: typeColor, color: typeText }}>
              {specialBattle.specialtyType}
            </span>
          </div>

          {/* Lore */}
          <div className="text-center px-2">
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {specialBattle.lore}
            </p>
          </div>

          {/* HP do lendário */}
          <div className="w-full rounded-2xl border px-5 py-3 flex items-center justify-between"
            style={{ borderColor: `${typeColor}30`, backgroundColor: `${typeColor}10` }}>
            <span className="font-game text-[7px] uppercase tracking-widest" style={{ color: `${typeColor}80` }}>
              Poder do Lendário
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: typeColor, borderColor: `${typeColor}80`, opacity: 0.85 }} />
              ))}
              <span className="font-black text-sm text-white ml-1">10 ♥</span>
            </div>
          </div>

          {/* Aviso */}
          <p className="font-game text-[7px] text-white/40 uppercase tracking-widest text-center">
            ⚠️ Apenas 1 lendário por run — batalha arriscada
          </p>

          {/* CTA */}
          <button
            disabled={!hasHealthyPokemon}
            onClick={startSpecialFight}
            className="w-full py-5 font-black text-lg tracking-[0.2em] uppercase border-2 border-white/20 rounded-2xl text-white transition-all cursor-pointer hover:border-white/50 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: `linear-gradient(135deg, ${typeColor}CC 0%, ${typeColor}88 100%)`, boxShadow: `0 0 30px ${typeColor}60` }}
          >
            ⚡ Batalhar!
          </button>

          {!hasHealthyPokemon && (
            <p className="font-game text-[7px] text-red-400 uppercase tracking-widest text-center">
              ⚠️ Todos os seus Pokémon estão desmaiados
            </p>
          )}

          <p className="font-game text-[6px] text-white/25 uppercase tracking-widest text-center">
            Se perder, o lendário escapa e o evento não volta
          </p>
        </div>
      </main>
    )
  }

  // ─── Equipe Rocket ────────────────────────────────────────────────────────────
  const rocketRed = '#CC2200'
  const gruntPokemon = specialBattle.fighters

  return (
    <main className="min-h-screen bg-parchment dots">
      {/* Header */}
      <header className="border-b-4 border-ink px-5 py-4" style={{ backgroundColor: rocketRed }}>
        <div className="max-w-[640px] mx-auto">
          <p className="font-game text-[6px] text-white/50 uppercase tracking-widest mb-0.5">Encontro</p>
          <p className="font-black text-xl text-white uppercase tracking-tight leading-none">Equipe Rocket!</p>
        </div>
      </header>

      <div className="max-w-[480px] mx-auto px-5 py-8 flex flex-col gap-6">

        {/* Grunt visual */}
        <div className="border-4 border-ink rounded-3xl overflow-hidden"
          style={{ backgroundColor: '#1A1A2E', boxShadow: '6px 6px 0 #2C1810' }}>
          <div className="py-8 px-6 flex flex-col items-center gap-4">
            {/* Silhueta R */}
            <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center"
              style={{ backgroundColor: rocketRed }}>
              <span className="font-black text-5xl text-white" style={{ fontStyle: 'italic' }}>R</span>
            </div>
            <p className="font-black text-lg text-white uppercase tracking-tight text-center">
              Rocket Grunt Apareceu!
            </p>
            <p className="text-sm text-white/60 text-center leading-relaxed italic">
              {specialBattle.lore}
            </p>
          </div>

          {/* Time do grunt */}
          <div className="border-t border-white/10 px-5 py-4">
            <p className="font-game text-[7px] text-white/40 uppercase tracking-widest mb-3 text-center">
              Time do Grunt
            </p>
            <div className="flex justify-center gap-4">
              {gruntPokemon.map(p => (
                <div key={p.id} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-xl border-2 border-white/15 bg-white/5 flex items-center justify-center">
                    <img src={getSpriteUrl(p.id)} alt={p.name}
                      style={{ width: 48, height: 48, objectFit: 'contain', imageRendering: 'pixelated', filter: 'brightness(0.6)' }} />
                  </div>
                  <span className="font-game text-[6px] text-white/30 uppercase">{p.name.slice(0, 7)}</span>
                  <span className="font-game text-[6px] text-white/40">{p.hearts}♥</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recompensa vs penalidade */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-ink rounded-2xl p-4 bg-white shadow-neo-sm text-center">
            <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest mb-1">Se vencer</p>
            <p className="font-black text-xl text-ink">+4₽</p>
            <p className="font-game text-[6px] text-ink/50 mt-0.5">+ item</p>
          </div>
          <div className="border-2 border-ink rounded-2xl p-4 bg-white shadow-neo-sm text-center">
            <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest mb-1">Se perder</p>
            <p className="font-black text-xl" style={{ color: rocketRed }}>−3₽</p>
            <p className="font-game text-[6px] text-ink/50 mt-0.5">Rocket foge</p>
          </div>
        </div>

        {/* Saldo atual */}
        <p className="font-game text-[7px] text-ink/40 uppercase tracking-widest text-center">
          Seu saldo atual: ₽{coins}
        </p>

        {/* Botões */}
        <div className="flex flex-col gap-3">
          <button
            disabled={!hasHealthyPokemon}
            onClick={startSpecialFight}
            className="w-full py-4 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl text-white transition-all cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0"
            style={{ backgroundColor: rocketRed, boxShadow: '4px 4px 0 #2C1810' }}
          >
            ⚔️ Encarar o Grunt
          </button>
          <button
            disabled={coins < 2}
            onClick={handleIgnore}
            className="w-full py-3 font-game text-[8px] uppercase tracking-widest border-2 border-ink/20 rounded-2xl text-ink/50 hover:text-ink/70 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            🏃 Ignorar — pagar 2₽ de pedágio
          </button>
        </div>

        {!hasHealthyPokemon && (
          <p className="font-game text-[7px] text-center uppercase tracking-widest" style={{ color: rocketRed }}>
            ⚠️ Todos os seus Pokémon estão desmaiados
          </p>
        )}
        {hasHealthyPokemon && coins < 2 && (
          <p className="font-game text-[7px] text-center uppercase tracking-widest" style={{ color: rocketRed }}>
            ⚠️ Sem moedas para pagar pedágio — encare o Grunt ou perca a chance
          </p>
        )}
      </div>
    </main>
  )
}
