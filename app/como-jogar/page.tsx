'use client'

import { useRouter } from 'next/navigation'

const TYPE_COLORS: Record<string, string> = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Grass: '#78C850',
  Electric: '#F8D030', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8',
}

const TYPE_TEXT: Record<string, string> = {
  Normal: '#2C1810', Fire: '#FBF5E6', Water: '#FBF5E6', Grass: '#FBF5E6',
  Electric: '#2C1810', Ice: '#2C1810', Fighting: '#FBF5E6', Poison: '#FBF5E6',
  Ground: '#2C1810', Flying: '#FBF5E6', Psychic: '#FBF5E6', Bug: '#2C1810',
  Rock: '#2C1810', Ghost: '#FBF5E6', Dragon: '#FBF5E6',
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className="inline-block font-game text-[8px] px-2 py-0.5 rounded-full border border-ink/20 leading-snug"
      style={{ backgroundColor: TYPE_COLORS[type], color: TYPE_TEXT[type] }}
    >
      {type}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-[2px] flex-1 bg-ink opacity-15 rounded" />
        <span className="font-game text-[8px] text-ink-soft opacity-50 tracking-widest uppercase">{title}</span>
        <div className="h-[2px] flex-1 bg-ink opacity-15 rounded" />
      </div>
      {children}
    </section>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-parchment-light border-2 border-ink rounded-2xl shadow-neo p-4 ${className}`}>
      {children}
    </div>
  )
}

// Vantagens de tipo: quem bate em quem
const TYPE_ADVANTAGES: { atk: string; def: string[] }[] = [
  { atk: 'Fire',     def: ['Grass', 'Bug', 'Ice'] },
  { atk: 'Water',    def: ['Fire', 'Ground', 'Rock'] },
  { atk: 'Grass',    def: ['Water', 'Ground', 'Rock'] },
  { atk: 'Electric', def: ['Water', 'Flying'] },
  { atk: 'Ice',      def: ['Grass', 'Dragon', 'Flying', 'Ground'] },
  { atk: 'Fighting', def: ['Normal', 'Rock', 'Ice'] },
  { atk: 'Poison',   def: ['Grass'] },
  { atk: 'Ground',   def: ['Fire', 'Electric', 'Rock', 'Poison'] },
  { atk: 'Flying',   def: ['Grass', 'Fighting', 'Bug'] },
  { atk: 'Psychic',  def: ['Fighting', 'Poison'] },
  { atk: 'Bug',      def: ['Grass', 'Psychic'] },
  { atk: 'Rock',     def: ['Fire', 'Ice', 'Flying', 'Bug'] },
  { atk: 'Ghost',    def: ['Ghost', 'Psychic'] },
  { atk: 'Dragon',   def: ['Dragon'] },
]

const STATUS_EFFECTS = [
  {
    icon: '☠️', name: 'Envenenado', color: '#A040A0',
    desc: 'Perde HP a cada turno que perde. Persiste até o fim da batalha.',
  },
  {
    icon: '🔥', name: 'Queimado', color: '#F08030',
    desc: 'Perde HP todo turno. Dano de ataques físicos reduzido a 50%.',
  },
  {
    icon: '⚡', name: 'Paralisado', color: '#F8D030',
    desc: '25% de chance de travar e não atacar no turno.',
  },
  {
    icon: '💤', name: 'Dormindo', color: '#6890F0',
    desc: 'Não pode atacar por 1–3 turnos. Acorda automaticamente.',
  },
  {
    icon: '❄️', name: 'Congelado', color: '#98D8D8',
    desc: 'Não pode agir até o inimigo atacar e "descongelar".',
  },
  {
    icon: '😵', name: 'Confuso', color: '#F85888',
    desc: '50% de chance de machucar a si mesmo no lugar de atacar.',
  },
]

const HAZARDS = [
  { name: 'Stealth Rock', icon: '🪨', desc: 'Causa dano ao entrar em campo, escalado pelo tipo. Removido por Rapid Spin.' },
  { name: 'Toxic Spikes', icon: '☠️', desc: 'Envenena ao entrar em campo. Removido por Rapid Spin.' },
  { name: 'Sticky Web', icon: '🕸️', desc: 'Reduz velocidade do seu Pokémon ao entrar em campo. Removido por Rapid Spin.' },
]

export default function ComoJogarPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-parchment dots">
      <header className="sticky top-0 z-30 px-4 py-3 border-b-2 border-ink"
        style={{ backgroundColor: '#FBF5E6', boxShadow: '0 2px 0 #2C1810' }}>
        <div className="max-w-[640px] mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="border-2 border-ink rounded-full px-3 py-1 font-game text-[8px] text-ink-soft bg-parchment-light shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            ← Voltar
          </button>
          <div className="flex-1">
            <p className="font-game text-[8px] text-ink-soft opacity-50 uppercase tracking-widest leading-none">Guia</p>
            <p className="font-black text-base text-ink uppercase tracking-tight leading-tight">Como Jogar</p>
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-5 flex flex-col gap-6"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>

        {/* ── RPS ── */}
        <Section title="Mecânica Base">
          <Card>
            <p className="font-black text-sm text-ink uppercase tracking-tight mb-3">Jokenpô + Tipos</p>
            <p className="text-[12px] text-ink-soft leading-relaxed opacity-80 mb-4">
              Cada Pokémon tem 3 moves: <strong className="text-ink">Pedra</strong>, <strong className="text-ink">Papel</strong> e <strong className="text-ink">Tesoura</strong>.
              Você e o inimigo escolhem simultaneamente — o move vencedor ataca, o perdedor defende.
            </p>

            {/* Triângulo RPS */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {[
                { icon: '✊', label: 'Pedra', wins: 'Tesoura', color: '#B8A038' },
                { icon: '✋', label: 'Papel', wins: 'Pedra', color: '#78C850' },
                { icon: '✌️', label: 'Tesoura', wins: 'Papel', color: '#C03028' },
              ].map((rps) => (
                <div key={rps.label} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-ink text-2xl shadow-neo-sm"
                    style={{ backgroundColor: rps.color + '33' }}>
                    {rps.icon}
                  </div>
                  <p className="font-game text-[8px] text-ink uppercase tracking-wide">{rps.label}</p>
                  <p className="font-game text-[8px] text-ink/40 leading-none">bate {rps.wins}</p>
                </div>
              ))}
            </div>

            <div className="bg-ink/5 rounded-xl p-3 border border-ink/10">
              <p className="font-game text-[8px] text-ink/60 uppercase tracking-widest mb-1">Empate</p>
              <p className="text-[11px] text-ink-soft opacity-80 leading-snug">
                Ambos atacam simultaneamente. Dano calculado de forma independente para cada lado.
              </p>
            </div>
          </Card>

          <Card>
            <p className="font-black text-sm text-ink uppercase tracking-tight mb-2">Multiplicadores de Tipo</p>
            <p className="text-[12px] text-ink-soft opacity-80 leading-relaxed mb-3">
              O tipo do move e o tipo do Pokémon alvo determinam o multiplicador de dano.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              {[
                { mult: '2×', label: 'Vantagem', color: '#78C850', text: '#FBF5E6' },
                { mult: '1×', label: 'Neutro', color: '#A8A878', text: '#2C1810' },
                { mult: '0.5×', label: 'Resistência', color: '#C03028', text: '#FBF5E6' },
              ].map((m) => (
                <div key={m.mult} className="rounded-xl border-2 border-ink p-2 shadow-neo-sm"
                  style={{ backgroundColor: m.color }}>
                  <p className="font-game text-[13px] leading-none" style={{ color: m.text }}>{m.mult}</p>
                  <p className="font-game text-[7px] mt-1 leading-none" style={{ color: m.text + 'CC' }}>{m.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-ink-soft opacity-70 leading-snug">
              STAB (mesmo tipo que o Pokémon): +50% de dano adicional empilhado com vantagem de tipo.
            </p>
          </Card>
        </Section>

        {/* ── Tabela de tipos ── */}
        <Section title="Tabela de Tipos">
          <Card>
            <p className="font-black text-sm text-ink uppercase tracking-tight mb-3">Vantagens (2× dano)</p>
            <div className="flex flex-col gap-2">
              {TYPE_ADVANTAGES.map(({ atk, def }) => (
                <div key={atk} className="flex items-center gap-2 flex-wrap">
                  <TypeBadge type={atk} />
                  <span className="font-game text-[8px] text-ink/40">→</span>
                  {def.map((d) => <TypeBadge key={d} type={d} />)}
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ── Batalha ── */}
        <Section title="Fluxo de Batalha">
          <Card>
            <p className="font-black text-sm text-ink uppercase tracking-tight mb-3">Como funciona um turno</p>
            <div className="flex flex-col gap-3">
              {[
                { n: '1', title: 'Escolha seu move', desc: 'Toque em Pedra, Papel ou Tesoura. Ou use seu Ataque Único (1× por batalha).' },
                { n: '2', title: 'Jokenpô resolve', desc: 'O vencedor ataca. Em empate, ambos atacam. Tipos e habilidades modificam o resultado.' },
                { n: '3', title: 'Efeitos de turno', desc: 'Status (veneno, queimadura...) e Aqua Ring aplicam HP. Shell Smash muda o dano.' },
                { n: '4', title: 'Troca', desc: 'Você pode trocar a qualquer momento — mas o inimigo ataca de graça quando você troca voluntariamente.' },
              ].map((step) => (
                <div key={step.n} className="flex gap-3 items-start">
                  <div className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg border-2 border-ink font-game text-[10px] text-parchment-light shadow-neo-sm"
                    style={{ backgroundColor: '#CC2200' }}>
                    {step.n}
                  </div>
                  <div>
                    <p className="font-black text-[12px] text-ink uppercase tracking-wide leading-tight">{step.title}</p>
                    <p className="text-[11px] text-ink-soft opacity-80 leading-snug mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="font-black text-sm text-ink uppercase tracking-tight mb-2">Troca de Pokémon</p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-start">
                <span className="shrink-0 font-game text-[8px] text-green-700 bg-green-100 border border-green-300 rounded-full px-2 py-0.5 leading-none">FREE</span>
                <p className="text-[11px] text-ink-soft opacity-80 leading-snug">
                  Após um faint — o Pokémon adversário não ataca quando você entra.
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="shrink-0 font-game text-[8px] text-red-700 bg-red-100 border border-red-300 rounded-full px-2 py-0.5 leading-none">CUSTO</span>
                <p className="text-[11px] text-ink-soft opacity-80 leading-snug">
                  Troca voluntária — o inimigo ataca de graça antes do seu Pokémon entrar.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        {/* ── Status ── */}
        <Section title="Status Effects">
          <div className="grid grid-cols-1 gap-2">
            {STATUS_EFFECTS.map((s) => (
              <Card key={s.name} className="flex gap-3 items-start py-3">
                <span className="text-xl shrink-0">{s.icon}</span>
                <div>
                  <p className="font-black text-[12px] uppercase tracking-wide leading-tight"
                    style={{ color: s.color }}>{s.name}</p>
                  <p className="text-[11px] text-ink-soft opacity-80 leading-snug mt-0.5">{s.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* ── Hazards ── */}
        <Section title="Armadilhas de Campo">
          <Card>
            <p className="text-[12px] text-ink-soft opacity-80 leading-relaxed mb-3">
              Ginásios podem colocar armadilhas no <strong className="text-ink">seu</strong> lado do campo.
              Ativam toda vez que um Pokémon seu entra em batalha.
            </p>
            <div className="flex flex-col gap-3">
              {HAZARDS.map((h) => (
                <div key={h.name} className="flex gap-3 items-start">
                  <span className="text-xl shrink-0">{h.icon}</span>
                  <div>
                    <p className="font-black text-[12px] text-ink uppercase tracking-wide leading-tight">{h.name}</p>
                    <p className="text-[11px] text-ink-soft opacity-80 leading-snug mt-0.5">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ── IA ── */}
        <Section title="Inteligência do Inimigo">
          <Card>
            <div className="flex flex-col gap-3">
              {[
                { andar: '1–4', label: 'Aleatório', color: '#78C850', desc: 'Move escolhido sem padrão. Bom para aprender.' },
                { andar: '5–8', label: 'Reativo', color: '#F08030', desc: 'Tende a usar o move que venceria seu último move.' },
                { andar: '9–12', label: 'Preditivo', color: '#C03028', desc: 'Tenta prever seu próximo move baseado no histórico recente da batalha.' },
              ].map((ia) => (
                <div key={ia.andar} className="flex gap-3 items-start">
                  <div className="shrink-0 text-center">
                    <p className="font-game text-[8px] text-ink/40 leading-none mb-0.5">Andar</p>
                    <p className="font-game text-[10px] text-ink leading-none">{ia.andar}</p>
                  </div>
                  <div className="w-px self-stretch bg-ink/15 mx-1" />
                  <div>
                    <span className="font-game text-[8px] px-2 py-0.5 rounded-full border border-ink/20 leading-snug"
                      style={{ backgroundColor: ia.color + '33', color: ia.color }}>
                      {ia.label}
                    </span>
                    <p className="text-[11px] text-ink-soft opacity-80 leading-snug mt-1">{ia.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ── Dica final ── */}
        <div className="border-2 border-ink rounded-2xl p-4 text-center"
          style={{ backgroundColor: '#3B4CCA', boxShadow: '4px 4px 0 #2C1810' }}>
          <p className="font-black text-base text-white uppercase tracking-tight mb-1">Dica de Ouro</p>
          <p className="text-[12px] text-white/80 leading-relaxed">
            Preste atenção no padrão do inimigo. Nos últimos andares, a IA aprende com você.
            Misture seus moves para não ser previsível.
          </p>
        </div>

      </div>
    </main>
  )
}
