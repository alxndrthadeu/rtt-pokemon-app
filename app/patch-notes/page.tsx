'use client'

import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatchEntry {
  icon: string
  title: string
  tag: string
  tagColor: string
  body: string
  detail?: string
}

interface PatchVersion {
  version: string
  date: string
  label: string
  labelColor: string
  description: string
  entries: PatchEntry[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PATCHES: PatchVersion[] = [
  {
    version: '0.7',
    date: 'Jun 2026',
    label: 'Centro Pokémon',
    labelColor: '#CC2200',
    description: 'Redesign completo da tela entre andares como um Centro Pokémon real. Cura manual com Nurse Joy, sprites animados na batalha, e a frase clássica de encontro selvagem ao receber novos Pokémon.',
    entries: [
      {
        icon: '🏥',
        title: 'Entre-andares vira Centro Pokémon',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'A tela entre ginásios foi completamente redesenhada com a estética do Centro Pokémon: teto listrado vermelho, Nurse Joy animada e os 6 Pokémon do seu time exibidos com sprites animados da Gen 5.',
        detail: 'Pokémon desmaiados aparecem em cinza com indicador de KO. Clique em qualquer Pokémon para ver o card completo. No Elite 4 (andares 9+) não há Nurse Joy nem loja — igualzinho aos jogos core.',
      },
      {
        icon: '💊',
        title: 'Cura manual na Nurse Joy — 10 moedas',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'Antes o time curava automaticamente ao vencer cada ginásio. Agora a cura é uma decisão: pague 10 moedas e a Nurse Joy restaura HP e status de todos os Pokémon.',
        detail: 'Se o time já estiver em plena saúde o botão informa isso. Sem saldo suficiente o botão fica bloqueado. A Pokémart também está sempre acessível na mesma tela.',
      },
      {
        icon: '🎞️',
        title: 'Sprites animados Gen 5 na batalha',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'Os sprites estáticos de batalha foram substituídos pelos GIFs animados do Pokémon Black & White: inimigo usa o sprite frontal animado, jogador usa o sprite de costas animado — igualzinho ao jogo original.',
        detail: 'Fallback automático para sprite estático se o GIF não carregar. Quando o Pokémon troca, o novo sprite carrega do zero sem contaminar o estado de erro do anterior.',
      },
      {
        icon: '🌿',
        title: '"Um Pokémon selvagem apareceu!" no pós-batalha',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'Ao vencer um ginásio, antes de revelar os Pokémon disponíveis para draft, a tela exibe a clássica cena de encontro selvagem com silhuetas e a frase icônica — e mostra as moedas ganhas na luta.',
        detail: 'A progressão ficou: vitória → animação de encontro (moedas + suspense) → escolha do Pokémon → opcionalmente descartar um do time.',
      },
      {
        icon: '🏷️',
        title: 'Insígnias com ícones oficiais',
        tag: 'UI',
        tagColor: '#6890F0',
        body: 'A faixa de insígnias no header agora usa os sprites oficiais da PokéAPI. Clique na faixa para abrir um painel com todas as 8 insígnias de Kanto e o status de cada uma.',
      },
      {
        icon: '🐛',
        title: 'HP não persistia após a batalha',
        tag: 'CORREÇÃO',
        tagColor: '#888870',
        body: 'O dano recebido durante a batalha não era salvo no deck global — ao sair da tela de batalha o time voltava ao HP anterior. Agora o HP final de cada lutador é sincronizado ao pressionar "Continuar".',
      },
    ],
  },
  {
    version: '0.6',
    date: 'Jun 2026',
    label: 'Itens, Hazards & Combate',
    labelColor: '#2C7BB5',
    description: 'Sistema de economia completo chegou ao jogo: moedas, loja, consumíveis, hold items equipáveis. Hazards de campo mudam como você pensa nas trocas. E duas mecânicas de batalha foram corrigidas.',
    entries: [
      {
        icon: '🪙',
        title: 'Sistema de moedas e economia',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'Vencer ginásios agora rende Pokédollars: 3 moedas no modo normal, 6 no modo difícil. As moedas são usadas para curar o time, comprar itens na loja e ativar o Centro Pokémon.',
      },
      {
        icon: '🛒',
        title: 'Pokémart com hold items e consumíveis',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'A loja aparece em andares específicos (3, 6 e 9) e oferece itens em tier crescente. Há hold items equipáveis por Pokémon (Restos, Orbe Vida, Faixa Foco...) e consumíveis de uso imediato (Potion, Antídoto, Revive...).',
        detail: 'Cada andar tem acesso único à loja — se não comprar agora, espera o próximo ponto de venda. Os hold items permanecem equipados durante toda a run.',
      },
      {
        icon: '🎒',
        title: 'Mochila e equipamentos',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'Nova tela de mochila acessível a qualquer momento. Veja itens consumíveis com quantidade, hold items no bag e os itens já equipados em cada Pokémon do time. Troque equipamentos ou use consumíveis entre andares.',
      },
      {
        icon: '🪨',
        title: 'Hazards de campo: Stealth Rock, Toxic Spikes e Sticky Web',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'Três novos ataques de campo mudam radicalmente a dinâmica de troca. Hazards ficam ativos no campo inimigo e causam efeitos em todo Pokémon que entrar em campo.',
        detail: '🪨 Stealth Rock — causa 1 de dano na entrada. ☠️ Toxic Spikes — envenena quem entra. 🕸️ Sticky Web — força o primeiro movimento a ser Pedra. Os hazards acumulam por batalha e o inimigo também pode usá-los contra você.',
      },
      {
        icon: '😴',
        title: 'Sono vira turno nulo — não mais pedra forçada',
        tag: 'CORREÇÃO',
        tagColor: '#888870',
        body: 'Antes, dormir forçava o Pokémon a jogar Pedra — injusto e contraditório. Agora o turno é realmente nulo: seu Pokémon não ataca e o inimigo aplica o golpe livremente.',
        detail: 'Você ainda pode trocar durante o sono. A caixa de diálogo exibe "😴 turno nulo" e o card de resultado mostra o Pokémon dormindo.',
      },
      {
        icon: '🛡️',
        title: 'Protect agora alterna — sem mais spam',
        tag: 'BALANCE',
        tagColor: '#78C850',
        body: 'Protect colocava um cooldown, mas o código resetava imediatamente — tornando o bloqueio infinito. Agora funciona como nos jogos: um turno sim, um turno não.',
        detail: 'A regra vale para jogador e inimigo. Quem usou Protect neste turno verá o botão em cooldown no próximo. O card de resultado exibe "BLOQUEOU!" em azul quando o protect funciona.',
      },
    ],
  },
  {
    version: '0.5',
    date: 'Jun 2026',
    label: 'Qualidade & Infra',
    labelColor: '#705898',
    description: 'Bastidores. Sem novidade visível para o jogador casual — mas o jogo ficou mais seguro, rápido e confiável.',
    entries: [
      {
        icon: '🐛',
        title: 'Bug de sono corrigido',
        tag: 'CORREÇÃO',
        tagColor: '#888870',
        body: 'Pokémon adormecidos por golpe de status acordavam imediatamente no turno seguinte. Agora dormem de verdade: até 2 turnos, com 45% de chance de acordar cedo.',
      },
      {
        icon: '⚠️',
        title: 'Erros de servidor visíveis',
        tag: 'MELHORIA',
        tagColor: '#9B59B6',
        body: 'Falhas na comunicação com o servidor apareciam silenciosamente no console. Agora um banner vermelho no topo da tela avisa quando algo deu errado.',
      },
      {
        icon: '🔒',
        title: 'Segurança reforçada',
        tag: 'SEGURANÇA',
        tagColor: '#CC2200',
        body: 'Next.js atualizado para a versão mais recente, corrigindo múltiplas vulnerabilidades. Headers de segurança HTTP adicionados em todas as páginas.',
      },
      {
        icon: '⚡',
        title: 'Bundle menor e mais rápido',
        tag: 'PERFORMANCE',
        tagColor: '#78C850',
        body: 'Removidas duas bibliotecas que estavam instaladas mas nunca foram usadas. O app ficou ~93 KB mais leve no download inicial.',
      },
      {
        icon: '🖼️',
        title: 'Preview ao compartilhar link',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'Ao colar o link do jogo no WhatsApp, Telegram ou Twitter, agora aparece um preview com a identidade visual do Reach the Top.',
      },
    ],
  },
  {
    version: '0.4',
    date: 'Jun 2026',
    label: 'Redesign Visual',
    labelColor: '#CC2200',
    description: 'Atualização focada em identidade visual e experiência mobile. O jogo mantém a alma dos anos 90 mas agora parece que foi feito assim — não que foi gerado por IA.',
    entries: [
      {
        icon: '🎮',
        title: 'Grade de ataques 2×2',
        tag: 'UI',
        tagColor: '#6890F0',
        body: 'A lista de 4 botões foi substituída por uma grade 2×2 mais compacta e rápida de ler. Cada célula mostra o ícone de RPP, o nome do golpe, o tipo e o efeito inline.',
        detail: 'Chega de botão "i" escondido. Agora você vê o que o golpe faz diretamente na célula: ⚔️ Ataque, 🍃 Absorção, ☠️ Veneno, 🛡️ Protect, etc.',
      },
      {
        icon: '⚡',
        title: 'Habilidade sempre visível',
        tag: 'UI',
        tagColor: '#6890F0',
        body: 'A habilidade do seu Pokémon agora aparece acima dos ataques em uma faixa permanente — não mais escondida atrás de um botão de expandir.',
        detail: 'Isso muda a leitura da batalha: você sempre sabe o que o seu Pokémon tem de especial sem precisar abrir nada.',
      },
      {
        icon: '❤️',
        title: 'HP no formato X/X',
        tag: 'VISUAL',
        tagColor: '#78C850',
        body: 'Os ícones de coração (♥♥♥) foram substituídos pelo formato HP 5/5, igual aos jogos originais. A cor muda conforme o HP restante: verde → amarelo → vermelho.',
        detail: 'Presente em todos os lugares: arena de batalha, cards do draft, tela de troca, resultado final e pós-batalha.',
      },
      {
        icon: '⚽',
        title: 'Pokébolas no banco',
        tag: 'VISUAL',
        tagColor: '#78C850',
        body: 'Os pontinhos coloridos que indicavam os Pokémon do banco foram substituídos por Pokébolas em pixel art, iguais às dos jogos clássicos.',
        detail: 'Pokémon vivo = Pokébola normal. Pokémon derrotado = Pokébola cinza/desbotada. O Pokémon ativo tem a cor do tipo do líder de ginásio.',
      },
      {
        icon: '📱',
        title: 'Draft mobile com scroll horizontal',
        tag: 'MOBILE',
        tagColor: '#F08030',
        body: 'No celular, os cards do draft agora ficam em carrossel horizontal com scroll snap — cada card ocupa 82% da tela e encaixa no lugar ao deslizar.',
        detail: 'No desktop continua sendo grid de 3 colunas. A navegação no celular ficou muito mais natural e foi desenvolvida pensando no polegar.',
      },
      {
        icon: '▶',
        title: 'Cursor piscante JRPG',
        tag: 'VISUAL',
        tagColor: '#78C850',
        body: 'A caixa de diálogo da batalha ganhou o cursor ▶ piscante estilo RPG da era Game Boy, com animação step-end fiel ao pixel art.',
      },
      {
        icon: '🌟',
        title: 'Raridade em estrelas',
        tag: 'VISUAL',
        tagColor: '#78C850',
        body: 'Os pontos de raridade nos cards agora são exibidos como estrelas ★ na cor de cada raridade, em vez de bolinhas.',
      },
    ],
  },
  {
    version: '0.3',
    date: 'Jun 2025',
    label: 'Atualização de Batalha',
    labelColor: '#6890F0',
    description: 'Uma das maiores atualizações do jogo até agora. Focada em tornar as batalhas mais estratégicas, fiéis ao Pokemon original e cheias de novas possibilidades.',
    entries: [
      {
        icon: '🔄',
        title: 'Troca de Pokémon repaginada',
        tag: 'MUDANÇA',
        tagColor: '#F08030',
        body: 'Você agora pode trocar de Pokémon quantas vezes quiser durante a batalha — sem mais limite de uma troca por luta. Mas atenção: trocar tem um custo real.',
        detail: 'Quando você troca voluntariamente, o inimigo aproveita para atacar de graça o Pokémon que entra em campo — exatamente como nos jogos originais. Já quando seu Pokémon é nocauteado, a troca é livre e você escolhe quem entra a seguir.',
      },
      {
        icon: '🛡️',
        title: 'Resistências agora protegem de verdade',
        tag: 'BALANCE',
        tagColor: '#78C850',
        body: 'Antes, um ataque que seu Pokémon resistia causava o mesmo dano de um ataque neutro. Não fazia sentido. Agora, golpes pouco efetivos causam metade do dano.',
        detail: 'Se o seu Charizard levava a mesma porrada de um golpe de Água e de um golpe de Fogo — isso acabou. Escolher o Pokémon certo para a situação agora realmente importa.',
      },
      {
        icon: '😴',
        title: 'Sono balanceado',
        tag: 'BALANCE',
        tagColor: '#78C850',
        body: 'O sono não é mais uma sentença de morte garantida. Agora ele dura no máximo 2 turnos, e o Pokémon tem 45% de chance de acordar antes do tempo.',
        detail: 'Colocar o inimigo para dormir ainda é muito bom, mas não fecha a batalha sozinho. A estratégia continua valendo — só não vai mais travar o jogo.',
      },
      {
        icon: '⚡',
        title: '5 novos ataques únicos ativados',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'Cinco ataques que estavam planejados mas inativos finalmente funcionam no jogo:',
        detail: '🌿 Spore (Breloom) — sono rápido, 1 turno garantido. 💧 Aqua Ring (Vaporeon) — cura passiva a cada 2 turnos enquanto estiver em campo. 💥 Shell Smash (Cloyster) — aumenta o ataque por alguns turnos. 💀 Destiny Bond (Gengar) — se você for nocauteado, arrasta o inimigo junto. 🌋 Fissure (Dugtrio/Rhydon) — nocaute instantâneo em Pokémon de Terra, Pedra ou Aço.',
      },
      {
        icon: '🎯',
        title: 'Habilidades com efeito real',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'InnerFocus e NoGuard agora fazem algo útil: ignoram a imunidade de tipo. Um golpe que normalmente causaria zero dano passa a causar 1 ponto.',
        detail: 'Parece pouco, mas pode ser decisivo num empate ou quando o inimigo está com 1 coração. A mecânica simples esconde uma profundidade surpreendente.',
      },
      {
        icon: '🧠',
        title: 'IA mais inteligente',
        tag: 'MELHORIA',
        tagColor: '#9B59B6',
        body: 'A IA dos líderes de ginásio avançados aprendeu a analisar padrões. Ela agora observa o que você jogou nos últimos 2 turnos e tenta prever sua próxima jogada.',
        detail: 'Brock e Misty continuam jogando aleatoriamente. Mas Giovanni, Blaine e o Elite 4 vão perceber se você está sempre jogando Pedra depois de Tesoura.',
      },
      {
        icon: '🧊',
        title: 'Times da Elite 4 corrigidos',
        tag: 'CORREÇÃO',
        tagColor: '#888870',
        body: 'Lorelei e Bruno estavam com times errados — corrigido!',
        detail: 'Lorelei voltou ao seu time de Gelo: Seel, Dewgong, Cloyster, Jynx, Lapras e Slowbro. Bruno agora mistura Luta e Fósseis: Hitmonlee, Hitmonchan, Machamp, Poliwrath, Kabutops e Aerodactyl.',
      },
    ],
  },
  {
    version: '0.2',
    date: 'Mai 2025',
    label: 'Polimento & Bugs',
    labelColor: '#78C850',
    description: 'Atualização de estabilidade. Foco em corrigir comportamentos inesperados e afinar a experiência de batalha.',
    entries: [
      {
        icon: '🛡️',
        title: 'Protect do inimigo funciona corretamente',
        tag: 'CORREÇÃO',
        tagColor: '#888870',
        body: 'O inimigo usando Protect agora bloqueia de verdade o ataque do jogador, sem causar nem receber dano.',
        detail: undefined,
      },
      {
        icon: '😴',
        title: 'Sono e congelamento do inimigo',
        tag: 'CORREÇÃO',
        tagColor: '#888870',
        body: 'Quando o Pokémon inimigo dorme ou congela, o jogador agora vence aquele turno automaticamente — sem precisar de input.',
        detail: undefined,
      },
      {
        icon: '⚔️',
        title: 'Cross Chop e outros ataques ajustados',
        tag: 'BALANCE',
        tagColor: '#78C850',
        body: 'Ajuste de dano no Cross Chop e limpeza geral no catálogo de movesets dos Pokémon.',
        detail: undefined,
      },
      {
        icon: '🏷️',
        title: 'Tooltips de status na batalha',
        tag: 'MELHORIA',
        tagColor: '#9B59B6',
        body: 'Clique (ou passe o mouse) nas badges de veneno, paralisia e sono para ver exatamente o que cada status faz.',
        detail: undefined,
      },
    ],
  },
  {
    version: '0.1',
    date: 'Abr 2025',
    label: 'Lançamento',
    labelColor: '#F08030',
    description: 'O jogo existe! Obrigado por jogar desde o começo.',
    entries: [
      {
        icon: '🎮',
        title: 'Reach the Top entra em alpha',
        tag: 'NOVO',
        tagColor: '#CC2200',
        body: 'Sistema de batalha Jokenpô com tipos Pokémon, 12 andares, 8 líderes + Elite 4, dois modos de dificuldade e o draft de Pokémon após cada ginásio.',
        detail: undefined,
      },
    ],
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

function TagBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="font-game text-[6px] px-2 py-[3px] rounded-full leading-none uppercase tracking-widest shrink-0"
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {label}
    </span>
  )
}

function EntryCard({ entry }: { entry: PatchEntry }) {
  return (
    <div className="border-2 border-ink/10 rounded-2xl bg-white/70 px-5 py-4 flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none shrink-0 mt-0.5">{entry.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <p className="font-black text-sm text-ink leading-tight">{entry.title}</p>
            <TagBadge label={entry.tag} color={entry.tagColor} />
          </div>
          <p className="text-[12px] text-ink/70 leading-relaxed">{entry.body}</p>
          {entry.detail && (
            <p className="text-[11px] text-ink/50 leading-relaxed mt-2 border-t border-ink/8 pt-2">
              {entry.detail}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function VersionBlock({ patch }: { patch: PatchVersion }) {
  return (
    <section className="flex flex-col gap-4">
      {/* Version header */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center shrink-0">
          <div
            className="w-14 h-14 rounded-2xl border-2 border-ink flex items-center justify-center shadow-neo"
            style={{ backgroundColor: patch.labelColor }}
          >
            <span className="font-black text-lg text-white leading-none">{patch.version}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-black text-base text-ink uppercase tracking-tight">{patch.label}</p>
          </div>
          <p className="font-game text-[7px] text-ink/40 uppercase tracking-widest leading-none">{patch.date}</p>
          <p className="text-[11px] text-ink/55 leading-relaxed mt-1.5">{patch.description}</p>
        </div>
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-3 pl-2 border-l-2 border-ink/10 ml-7">
        {patch.entries.map((entry, i) => (
          <EntryCard key={i} entry={entry} />
        ))}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatchNotesPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-parchment relative overflow-x-hidden">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b-4 border-ink px-4 py-3 bg-parchment">
        <div className="max-w-[640px] mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="border-2 border-ink/25 rounded-full px-3 py-1.5 font-game text-[7px] text-ink/60 bg-white/60 hover:bg-white transition-all shrink-0 cursor-pointer"
          >
            ← Voltar
          </button>
          <div className="flex-1 text-center">
            <p className="font-game text-[6px] text-ink/40 uppercase tracking-widest leading-none mb-0.5">
              Reach the Top
            </p>
            <p className="font-black text-sm text-ink uppercase tracking-wide leading-tight">
              Patch Notes
            </p>
          </div>
          <div className="w-20 shrink-0" />
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 pt-6 pb-20 flex flex-col gap-10">

        {/* Intro */}
        <div className="text-center flex flex-col gap-2">
          <p className="text-3xl">📋</p>
          <p className="font-black text-xl text-ink uppercase tracking-tight">O que mudou no jogo</p>
          <p className="text-[12px] text-ink/55 leading-relaxed max-w-sm mx-auto">
            Aqui a gente documenta cada mudança de forma honesta. O bom, o ruim e o que ainda está sendo pensado.
          </p>
        </div>

        {/* Patch list */}
        {PATCHES.map((patch) => (
          <VersionBlock key={patch.version} patch={patch} />
        ))}

        {/* Footer */}
        <div className="border-2 border-ink/10 rounded-2xl bg-white/50 px-5 py-4 text-center flex flex-col gap-2">
          <p className="font-black text-sm text-ink">Tem feedback ou encontrou um bug?</p>
          <p className="text-[11px] text-ink/55 leading-relaxed">
            O jogo ainda está em desenvolvimento ativo. Cada bug reportado e cada opinião ajuda a moldar o que vem a seguir.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-2 self-center border-2 border-ink rounded-full px-5 py-2 font-game text-[7px] uppercase tracking-wide bg-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer text-ink"
          >
            Jogar agora →
          </button>
        </div>

      </div>
    </main>
  )
}
