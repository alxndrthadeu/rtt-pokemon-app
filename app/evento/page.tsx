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
      <main className="min-h-screen bg-parchment dots relative overflow-hidden">
        {/* Atmospheric typeColor tint over the page */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 28%, ${typeColor}22 0%, transparent 58%)` }} />

        {/* Header */}
        <header className="relative border-b-4 border-ink px-5 py-4" style={{ backgroundColor: typeColor }}>
          {/* Shine overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%)' }} />
          <div className="relative max-w-[640px] mx-auto">
            <p className="font-game text-[8px] uppercase tracking-[0.45em] mb-0.5" style={{ color: `${typeText}70` }}>
              ⭐ {specialBattle.locationName} ⭐
            </p>
            <p className="font-black text-xl uppercase tracking-tight leading-none" style={{ color: typeText }}>
              Pokémon Lendário Apareceu!
            </p>
          </div>
        </header>

        <div className="relative z-10 max-w-[480px] mx-auto px-5 py-8 flex flex-col gap-6">

          {/* Card principal do lendário — sombra typeColor para drama */}
          <div className="border-4 border-ink rounded-3xl overflow-hidden bg-parchment-light"
            style={{ boxShadow: `6px 6px 0 ${typeColor}` }}>
            <div className="h-2" style={{ backgroundColor: typeColor }} />
            <div className="flex flex-col items-center gap-4 p-6" style={{ backgroundColor: `${typeColor}15` }}>
              <div className="relative flex items-center justify-center py-2">
                {/* Anel pulsante externo */}
                <div className="absolute rounded-full animate-ping"
                  style={{ width: 176, height: 176, backgroundColor: `${typeColor}18`, animationDuration: '2.5s' }} />
                {/* Aura estática */}
                <div className="absolute rounded-full"
                  style={{ width: 200, height: 200, background: `radial-gradient(circle, ${typeColor}38 0%, transparent 70%)` }} />
                <img
                  src={getSpriteUrl(legendary.id)}
                  alt={legendary.name}
                  style={{ width: 160, height: 160, imageRendering: 'pixelated', objectFit: 'contain', position: 'relative', zIndex: 1 }}
                />
              </div>
              <div className="text-center">
                <h1 className="font-black text-4xl uppercase tracking-tight text-ink leading-none mb-2">
                  {legendary.name}
                </h1>
                <span className="font-game text-[8px] px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: typeColor, color: typeText }}>
                  {specialBattle.specialtyType}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t-2 border-ink/10">
              <p className="text-sm text-ink-soft leading-relaxed mb-4">{specialBattle.lore}</p>
              <div className="flex items-center justify-between">
                <span className="font-game text-[8px] uppercase tracking-widest text-ink/50">Poder</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full border-2 border-ink/20"
                      style={{ backgroundColor: typeColor }} />
                  ))}
                  <span className="font-black text-sm text-ink ml-1.5">10 ♥</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aviso especial */}
          <div className="border-2 rounded-2xl px-4 py-3 text-center"
            style={{ borderColor: `${typeColor}50`, backgroundColor: `${typeColor}08` }}>
            <p className="font-game text-[8px] uppercase tracking-widest" style={{ color: typeColor }}>
              ⚠️ Apenas 1 lendário por run — batalha arriscada
            </p>
          </div>

          {/* CTA */}
          <button
            disabled={!hasHealthyPokemon}
            onClick={startSpecialFight}
            className="w-full py-5 font-black text-lg tracking-[0.2em] uppercase border-2 border-ink rounded-2xl transition-all cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0"
            style={{
              backgroundColor: typeColor,
              color: typeText,
              boxShadow: !hasHealthyPokemon ? 'none' : `4px 4px 0 ${typeColor}88, 6px 6px 0 #2C1810`,
            }}
          >
            ⚡ Batalhar!
          </button>

          {!hasHealthyPokemon && (
            <p className="font-game text-[8px] text-center uppercase tracking-widest" style={{ color: '#CC2200' }}>
              ⚠️ Todos os seus Pokémon estão desmaiados
            </p>
          )}

          <p className="font-game text-[8px] text-ink/30 uppercase tracking-widest text-center">
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
          <p className="font-game text-[8px] text-white/50 uppercase tracking-widest mb-0.5">Encontro</p>
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
            <p className="font-game text-[8px] text-white/40 uppercase tracking-widest mb-3 text-center">
              Time do Grunt
            </p>
            <div className="flex justify-center gap-4">
              {gruntPokemon.map(p => (
                <div key={p.id} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-xl border-2 border-white/15 bg-white/5 flex items-center justify-center">
                    <img src={getSpriteUrl(p.id)} alt={p.name}
                      style={{ width: 48, height: 48, objectFit: 'contain', imageRendering: 'pixelated', filter: 'brightness(0.6)' }} />
                  </div>
                  <span className="font-game text-[8px] text-white/30 uppercase">{p.name.slice(0, 7)}</span>
                  <span className="font-game text-[8px] text-white/40">{p.hearts}♥</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recompensa vs penalidade */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-ink rounded-2xl p-4 bg-white shadow-neo-sm text-center">
            <p className="font-game text-[8px] text-ink/40 uppercase tracking-widest mb-1">Se vencer</p>
            <p className="font-black text-xl text-ink">+4₽</p>
            <p className="font-game text-[8px] text-ink/50 mt-0.5">+ item</p>
          </div>
          <div className="border-2 border-ink rounded-2xl p-4 bg-white shadow-neo-sm text-center">
            <p className="font-game text-[8px] text-ink/40 uppercase tracking-widest mb-1">Se perder</p>
            <p className="font-black text-xl" style={{ color: rocketRed }}>−5₽</p>
            <p className="font-game text-[8px] text-ink/50 mt-0.5">Rocket foge</p>
          </div>
        </div>

        {/* Saldo atual */}
        <p className="font-game text-[8px] text-ink/40 uppercase tracking-widest text-center">
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
          <p className="font-game text-[8px] text-center uppercase tracking-widest" style={{ color: rocketRed }}>
            ⚠️ Todos os seus Pokémon estão desmaiados
          </p>
        )}
        {hasHealthyPokemon && coins < 2 && (
          <p className="font-game text-[8px] text-center uppercase tracking-widest" style={{ color: rocketRed }}>
            ⚠️ Sem moedas para pagar pedágio — encare o Grunt ou perca a chance
          </p>
        )}
      </div>
    </main>
  )
}
