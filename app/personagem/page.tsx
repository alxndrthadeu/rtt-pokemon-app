'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useGameStore } from '@/store/gameStore'
import type { Gender } from '@/types'

const CHARACTERS: {
  id: Gender
  image: string
  defaultName: string
  typeColor: string
  typeLabel: string
  sprite: string
}[] = [
  {
    id: 'boy',
    image: '/male_protagonist.png',
    defaultName: 'Red',
    typeColor: '#C03028',
    typeLabel: 'BOY',
    sprite: '🧢',
  },
  {
    id: 'girl',
    image: '/female_protagonist.png',
    defaultName: 'Leaf',
    typeColor: '#F85888',
    typeLabel: 'GIRL',
    sprite: '⭐',
  },
]

export default function PersonagemPage() {
  const router = useRouter()
  const { mode, gender, playerName, setGender, setPlayerName } = useGameStore()

  const [selectedGender, setSelectedGender] = useState<Gender | null>(gender)
  const [name, setName] = useState(playerName || '')
  const [nameError, setNameError] = useState(false)

  // Redireciona se veio sem escolher dificuldade
  useEffect(() => {
    if (!mode) router.replace('/')
  }, [mode, router])

  function handleGenderSelect(g: Gender) {
    setSelectedGender(g)
    // Preenche nome padrão só se ainda estiver vazio
    if (!name) {
      const char = CHARACTERS.find((c) => c.id === g)
      if (char) setName(char.defaultName)
    }
    setNameError(false)
  }

  function handleContinue() {
    if (!selectedGender) return
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(true)
      return
    }
    setGender(selectedGender)
    setPlayerName(trimmed)
    router.push('/draft')
  }

  const canContinue = selectedGender && name.trim().length > 0

  return (
    <main className="min-h-screen bg-parchment dots relative overflow-x-hidden">

      {/* ── Header ── */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-[620px] mx-auto w-full">
        <button
          onClick={() => router.push('/')}
          className="border-2 border-ink rounded-full px-4 py-1.5 font-game text-[8px] tracking-wide uppercase text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          ← Voltar
        </button>
        <span className="font-game text-[8px] text-ink-soft opacity-50 tracking-widest uppercase">
          Reach the Top
        </span>
      </header>

      {/* ── Conteúdo ── */}
      <div className="relative z-10 flex flex-col items-center px-5 pb-20 gap-7 max-w-[620px] mx-auto">

        {/* Título */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-8 bg-ink opacity-15" />
            <span className="font-game text-[8px] text-ink-soft opacity-50 tracking-[0.5em] uppercase">
              Passo 1 de 2
            </span>
            <div className="h-px w-8 bg-ink opacity-15" />
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-ink leading-tight">
            Escolha seu
          </h1>
          <h2 className="text-3xl font-black tracking-tight uppercase leading-tight">
            <span style={{ color: '#CC2200' }}>Personagem</span>
          </h2>
          <p className="text-sm text-ink-soft opacity-70 mt-2 leading-relaxed">
            Quem vai escalar a torre dos ginásios de Kanto?
          </p>
        </div>

        {/* Cards de personagem */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {CHARACTERS.map((char) => {
            const isSelected = selectedGender === char.id
            return (
              <button
                key={char.id}
                onClick={() => handleGenderSelect(char.id)}
                className={`relative flex flex-col items-center border-2 border-ink rounded-2xl transition-all duration-100 overflow-hidden ${
                  isSelected
                    ? 'translate-x-[2px] translate-y-[2px]'
                    : 'shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                }`}
                style={{ backgroundColor: isSelected ? char.typeColor : '#FFFFFF' }}
              >
                {/* Check mark */}
                {isSelected && (
                  <span className="absolute top-3 right-3 z-10 font-black text-white text-base leading-none">
                    ✓
                  </span>
                )}

                {/* Imagem em quadrado branco */}
                <div
                  className="w-full aspect-square flex items-center justify-center border-b-2 border-ink relative"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  {/* Detalhe de canto estilo hardware anos 90 */}
                  <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-ink opacity-10" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ink opacity-10" />

                  <Image
                    src={char.image}
                    alt={char.defaultName}
                    width={180}
                    height={180}
                    className="object-contain w-4/5 h-4/5"
                    priority
                  />
                </div>

                {/* Info */}
                <div className="w-full p-4 flex flex-col items-center gap-2">
                  <span
                    className="type-badge"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : char.typeColor,
                      color: '#FBF5E6',
                      boxShadow: isSelected
                        ? `0 0 0 2px ${char.typeColor}, 0 0 0 4px #2C1810`
                        : `0 0 0 2px #F5EDD8, 0 0 0 4px #2C1810`,
                    }}
                  >
                    {char.typeLabel}
                  </span>
                  <p
                    className="font-black text-xl uppercase tracking-wide"
                    style={{ color: isSelected ? '#FFFFFF' : '#2C1810' }}
                  >
                    {char.defaultName}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Campo de nome — aparece após escolher personagem */}
        {selectedGender && (
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-[2px] flex-1 bg-ink opacity-15 rounded" />
              <span className="font-game text-[8px] text-ink-soft opacity-50 tracking-widest uppercase">
                Seu nome
              </span>
              <div className="h-[2px] flex-1 bg-ink opacity-15 rounded" />
            </div>

            <div
              className={`border-2 rounded-2xl shadow-neo bg-parchment-light overflow-hidden transition-all ${
                nameError ? 'border-[#C03028]' : 'border-ink'
              }`}
            >
              <div className="flex items-center gap-3 px-5 py-4">
                {/* Ícone estilo Pokédex */}
                <span className="font-game text-[10px] text-ink-soft opacity-40">▶</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value.slice(0, 12))
                    setNameError(false)
                  }}
                  placeholder={CHARACTERS.find((c) => c.id === selectedGender)?.defaultName}
                  maxLength={12}
                  className="flex-1 bg-transparent font-black text-xl uppercase tracking-widest text-ink placeholder:text-ink placeholder:opacity-20 outline-none"
                  autoFocus
                />
                <span className="font-game text-[8px] text-ink-soft opacity-30">
                  {name.length}/12
                </span>
              </div>
            </div>

            {nameError && (
              <p className="font-game text-[8px] text-[#C03028] tracking-wide text-center">
                Digite um nome para continuar!
              </p>
            )}

            <p className="text-[10px] text-ink-soft opacity-40 text-center tracking-wide">
              Máximo de 12 caracteres · ficará visível no histórico
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-5 font-black text-base tracking-[0.2em] uppercase border-2 border-ink rounded-2xl transition-all duration-100 ${
              canContinue
                ? 'shadow-neo-red hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer text-parchment-light'
                : 'text-ink opacity-25 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: canContinue ? '#CC2200' : '#E8E0CC',
            }}
          >
            {canContinue ? 'Começar o Draft →' : 'Escolha seu personagem'}
          </button>

          {canContinue && (
            <p className="font-game text-[8px] text-ink-soft opacity-40 tracking-widest uppercase text-center">
              {name.trim()} ·{' '}
              {selectedGender === 'boy' ? 'Red' : 'Leaf'} ·{' '}
              Modo {mode === 'normal' ? 'Normal' : 'Hard'}
            </p>
          )}
        </div>

      </div>
    </main>
  )
}
