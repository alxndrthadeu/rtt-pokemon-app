import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#F5EDD8',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Dot pattern background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(44,24,16,0.07) 2px, transparent 2px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top accent bar */}
        <div style={{ display: 'flex', height: 16, backgroundColor: '#CC2200', width: '100%', flexShrink: 0 }} />

        {/* Main area */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 80,
            padding: '0 96px',
            position: 'relative',
          }}
        >
          {/* Pokéball */}
          <svg width="220" height="220" viewBox="0 0 100 100" fill="none">
            <path d="M10 50 A40 40 0 0 1 90 50 Z" fill="#CC2200" />
            <path d="M10 50 A40 40 0 0 0 90 50 Z" fill="#FBF5E6" />
            <circle cx="50" cy="50" r="40" stroke="#2C1810" strokeWidth="4.5" fill="none" />
            <rect x="10" y="46" width="80" height="8" fill="#2C1810" />
            <circle cx="50" cy="50" r="12" fill="#2C1810" />
            <circle cx="50" cy="50" r="7" fill="#FBF5E6" stroke="#2C1810" strokeWidth="2" />
          </svg>

          {/* Text block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#CC2200',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              POKÉMON
            </span>
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: '#2C1810',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                letterSpacing: '-2px',
              }}
            >
              REACH
            </span>
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: '#2C1810',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                letterSpacing: '-2px',
              }}
            >
              THE TOP
            </span>
            <span
              style={{
                fontSize: 22,
                color: 'rgba(44,24,16,0.55)',
                marginTop: 20,
                letterSpacing: '0.04em',
              }}
            >
              Escale a Torre dos Ginásios de Kanto
            </span>

            {/* Type badges row */}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {['Fogo', 'Água', 'Planta', 'Elétrico', 'Psíquico'].map((t, i) => {
                const colors = ['#F08030', '#6890F0', '#78C850', '#F8D030', '#F85888']
                return (
                  <div
                    key={t}
                    style={{
                      display: 'flex',
                      padding: '4px 14px',
                      borderRadius: 999,
                      border: `2px solid #2C1810`,
                      backgroundColor: colors[i],
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#FBF5E6',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            height: 10,
            backgroundColor: '#2C1810',
            width: '100%',
            flexShrink: 0,
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
