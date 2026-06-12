'use client'

import { useGameStore } from '@/store/gameStore'

export function ApiErrorBanner() {
  const { apiError, clearApiError } = useGameStore()
  if (!apiError) return null

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3 border-b-4 border-ink bg-[#CC2200] text-white"
    >
      <p className="font-game text-[8px] leading-tight flex-1">
        ⚠ {apiError}
      </p>
      <button
        onClick={clearApiError}
        className="font-game text-[8px] shrink-0 opacity-70 hover:opacity-100 cursor-pointer"
        aria-label="Fechar aviso"
      >
        ✕
      </button>
    </div>
  )
}
