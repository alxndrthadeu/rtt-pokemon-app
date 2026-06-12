# Changelog

## [0.5.0] - 2026-06-11

### Segurança

- **Next.js 14.2.3 → 14.2.35** — corrige authorization bypass crítico (CVSS 9.1), cache poisoning e mais 10+ CVEs
- **Security headers** em todas as rotas: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
- **Validação de `NEXT_PUBLIC_API_URL`** — falha explícita em produção se a env var não estiver configurada
- **Sanitização de `playerName`** — trim + limite de 20 caracteres antes de salvar

### Corrigido

- **Bug de sono** — status `sleep` aplicado via golpe acordava o Pokémon imediatamente no turno seguinte; corrigido para durar 2 turnos com 45% de acordar cedo (comportamento esperado)
- **Erros de API visíveis** — falhas nas chamadas ao servidor agora aparecem em banner no topo da tela em vez de serem silenciadas com `console.error`

### Performance

- Removidas dependências mortas: `axios` e `framer-motion` (~13 KB + ~80 KB gzipped a menos no bundle)
- `buildGymDeck` memoizado — custo de `makePokemonCard` pago uma vez por andar, não a cada batalha
- `loading.tsx` adicionado para `/batalha`, `/draft` e `/torre` — evita tela branca na hidratação mobile
- `lib/data/mechanics.ts` deletado — 1.100 linhas de dead code nunca importadas em runtime

### Infraestrutura (Vercel)

- **Vercel Analytics + Speed Insights** — Web Vitals reais por rota no painel da Vercel
- **OG Image dinâmica** (`/api/og`, Edge Runtime) — preview visual ao compartilhar o link em WhatsApp/Slack/Twitter
- **`vercel.json`** com `Cache-Control: immutable` para assets estáticos — imagens cacheadas por 1 ano no CDN
- `tsconfig.json` corrigido para excluir `agent-skills/` do type-check

---

## [0.4.0] - 2026-06-11

### Adicionado

- **Grade de ataques 2×2** (`MoveGrid`) na batalha substitui a lista linear de 4 botões
  - Cada célula exibe ícone RPP, nome do golpe, tipo e efeito inline via `getMoveEffectLabel`
  - Ícones de mão (✊✋✌️) mantidos — referência direta ao RPP
  - Slot de ataque único integrado na 4ª célula com borda dourada gradiente
- **Faixa de habilidade permanente** (`AbilityStrip`) acima da grade de ataques
  - Habilidade sempre visível durante a batalha — sem toggle/expandir
  - Remove o estado `showAbilityInfo` e o botão de expandir
- **Pokébolas pixel art no banco** (`PartyBall` SVG 13×13px, `imageRendering: pixelated`)
  - Pokémon vivo = Pokébola colorida; Pokémon ativo = destaque com cor do tipo
  - Pokémon derrotado = Pokébola cinza/desbotada
  - Substitui os pontinhos coloridos (`<span>` com `borderRadius`) em `BattleArena`
- **Cursor piscante JRPG** (`.blink-cursor` `▶`) na caixa de diálogo da batalha
  - Animação `step-end` 0.9s — fiel ao pixel art do Game Boy
  - Desabilitado com `prefers-reduced-motion`
- **Raridade em estrelas** (`RarityStars`) nos cards do draft
  - `★` coloridas na cor de cada tier substituem as bolinhas
- **Draft mobile com scroll horizontal snap**
  - Carrossel com `scrollSnapType: x mandatory` em mobile (cards com 82vw)
  - Desktop mantém grid 3 colunas
- **Animação de flutuação na Pokébola** da Home (`.pokeball-float`)
  - 3.2s ease-in-out com rotação leve; desabilitada com `prefers-reduced-motion`
- **Gradiente de tipo no sprite do card** — radial sutil na cor do tipo principal
  - Remove o "branco genérico" sem alterar a leitura do sprite

### Modificado

- **HP X/X** substitui ♥ em todos os contextos:
  - Cards do draft (`PokemonCard.tsx`)
  - Arena de batalha (`HPBar` agora inclui label "HP" + valor numérico com 6px de altura)
  - Tela de troca de Pokémon (`batalha/page.tsx` switch picker)
  - Tela de derrota no modo difícil
  - Pós-batalha (`pos-batalha/page.tsx`)
  - Tela de conclusão (`conclusao/page.tsx`)
- **`HPBar`** atualizado: altura 6px (era 5px), label "HP" à esquerda, valor "X/X" à direita
- **Botão da batalha** removidos `MoveListRow`, `UniqueListRow` e `getMoveDescription` (dead code)

### Removido

- Componente `HeartsDisplay` — todas as referências substituídas por HP X/X
- Estado `showAbilityInfo` e botão de toggle de habilidade na batalha
- `MoveListRow` e `UniqueListRow` (substituídos por `MoveGrid`)
- `getMoveDescription` helper (substituído por `getMoveEffectLabel` inline)

---

## [0.3.0] - 2026-06-10

### Adicionado

- **Catálogo normalizado de dados** (`lib/data/moves.ts`, `abilities.ts`, `uniques.ts`)
  - Todos os golpes, habilidades e ataques únicos agora são definidos como registros com ID string
  - `pokemon.ts` migrado: os 153 templates usam referências por ID em vez de objetos inline
  - Engine data-driven: comportamentos resolvidos por `kind`/`category`/`special`, sem switch por nome
- **Sistema de HP expandido — 5 corações + meio coração**
  - Todos os Pokémon começam com 5 ♥ (era 3)
  - Veneno e queimadura causam 0,5 ♥ de dano por turno (float hearts)
  - `HeartsDisplay` renderiza meio coração a 50% de opacidade
  - Sturdy agora protege com ≥ 2 ♥ (era > 1 ♥)
- **Tipos de golpe** (`MoveKind: 'offensive' | 'status' | 'buff'`)
  - Golpes ofensivos causam dano; status aplicam condição; buff alteram stats/protegem
  - Drain: golpes com `drain: true` curam o usuário por metade do dano causado
  - Badge de tipo exibido em cada botão RPS (BUFF / STATUS / 🛡️ PROTECT / COOLDOWN)
- **5 condições de status** (`poison | paralysis | sleep | freeze | burn`)
  - Veneno: 0,5 ♥/turno indefinido
  - Paralisia: 30% de chance de perder o turno (não ataca, mas não é forçado a Pedra)
  - Sono: força ✊ Pedra enquanto dura; cura ao usar Rest
  - Congelamento: força ✊ Pedra; descongelado automaticamente por golpes de Fogo
  - Queimadura: 0,5 ♥/turno indefinido
  - Imunidades por tipo: Poison→veneno, Electric→paralisia, Fire→queimadura+congela, Ice→congelamento
- **Sistema de buff/debuff** (`attackMod` / `defenseMod`, ±1 por turno)
  - Mods consumidos na primeira ação relevante e resetados a 0
  - `applyEntryEffects`: Intimidate reduz `enemyAttackMod` ao entrar em campo
- **Categorias de ataque único** (`UniqueCategory: 'super' | 'heal' | 'ohko' | 'aoe'`)
  - `super`: causa 2 de dano (padrão); suporta casos especiais (Hyper Beam, Shell Smash, Volt Switch, etc.)
  - `heal`: cura HP (Dream Eater, Rest, Slack Off, Soft-Boiled, etc.)
  - `ohko`: KO instantâneo; restrições de tipo para Sheer Cold
  - `aoe`: dano ao alvo ativo e à reserva inimiga
- **Estado exausto** (Tired)
  - Após Hyper Beam/Giga Impact/Rock Wrecker: força ✊ Pedra por 1 turno
  - Após ataques OHKO genéricos: força ✊ Pedra por 2 turnos
  - Reutiliza infraestrutura de sono; banner visual na tela de seleção
- **Protect como golpe de buff**
  - `special: 'protect'` — bloqueia dano mesmo perdendo o Jokenpô
  - Cooldown no turno seguinte (não pode usar Protect consecutivo)
  - Badge de cooldown visível no botão enquanto em recarga
- **Feedback visual expandido** (TODO 7)
  - Ícones de status nos cards do lutador ativo (🔥 ☠️ 😴 🧊 ⚡)
  - Toasts de ativação no painel de resultado (imunidades, Sturdy, absorção, congelamento, etc.)
  - Mensagens de turno: dano de status, Protect, recoil, drain, bench AoE
  - Banner de estado forçado (sono / gelo / exaustão) na fase de seleção

### Modificado

- **`lib/battleEngine.ts`** — reescrito completamente
  - `BattleEffects` expandido: `playerStatus`, `enemyStatus` (StatusState), `playerTiredTurns`, `enemyTiredTurns`, `playerAttackMod`, `enemyAttackMod`, `playerDefenseMod`, `enemyDefenseMod`, `playerProtectCooldown`
  - Novas funções: `processTurnStart`, `applySlotMoveEffect`, `applyThaw`, `applySturdy`, `calcSlotDamage`, `calcUniqueResult`
  - Removido: `calcUniqueDamage` (substituído por handler data-driven por `kind`)
  - Blaze/Overgrow/Torrent ativam com ≤ 2 ♥ (era === 1 ♥)
- **`types/index.ts`** — novos tipos: `MoveKind`, `StatusCondition`, `UniqueCategory`, `BuffEffect`, `MoveDefinition`, `AbilityDefinition`, `UniqueDefinition`; `Move` e `UniqueMove` expandidos
- **`lib/data/catalog.ts`** — removidos helpers `mv()`, `ab()`, `uniq()` (substituídos pelos catálogos em `moves.ts`, `abilities.ts`, `uniques.ts`)
- **`lib/data/pokemon.ts`** — `makePokemonCard` inicia com `hearts: 5`; movesets revisados conforme spec (Protect para Squirtle/Wartortle/Metapod/Kakuna/Onix, Thunder Wave para Pikachu/Raichu, etc.)
- **`app/batalha/page.tsx`** — reescrito para usar a nova engine; `HeartsDisplay` com float; cards com badge de status; botões RPS com indicador de kind; fluxo de `handleAttack` data-driven

## [0.2.0] - 2026-06-08

### Adicionado

- **Tela de derrota com retry**
  - Modo Normal: opção de continuar (volta à seleção com os 6 Pokémon) ou desistir da run; incrementa contador de mortes a cada retry
  - Modo Hard: segunda chance com os Pokémon sobreviventes do banco (que não foram para a batalha); se não houver sobreviventes, game over direto
- **Tela de conclusão** (`/conclusao`) — exibida ao derrotar Lance (andar 12)
  - Rank S–D calculado pelo número de mortes acumuladas na run (S = 0 mortes, A = 1–2, B = 3–5, C = 6–9, D = 10+)
  - Exibe time final com HP restante de cada Pokémon
  - Tabela de ranking com destaque no rank obtido
  - Botão de compartilhamento: gera imagem via Canvas API e usa Web Share API (com fallback de download `.png`)
  - Botão de nova run
- **Pokédex persistente** (`/pokedex`)
  - Registra todos os Pokémon já escolhidos pelo jogador, independente da run
  - Grid com os 153 Pokémon do jogo; entradas não vistas exibem silhueta com sprite encoberto
  - Filtros: Todos / Vistos / Ocultos
  - Clique em um Pokémon visto abre o card completo (mesmo componente do draft)
  - Pokédex acessível pelo header do menu inicial e da tela da Torre
- **Contador de mortes** (`deathCount`) no estado global — persistido no localStorage, resetado a cada nova run
- **Rastreamento de Pokémon na Pokédex** ao adicionar no deck (draft) e ao confirmar troca no pós-batalha

## [0.1.0] - 2026-06-07

### Adicionado

- **Setup inicial** — Next.js 14 (App Router) com Tailwind CSS e TypeScript
- **Fluxo de jogo completo** com as seguintes telas:
  - `/` — tela inicial com opção de nova run ou continuar partida existente
  - `/personagem` — seleção de gênero do personagem (masculino / feminino)
  - `/draft` — draft de Pokémon: escolha entre 3 opções aleatórias para montar o deck inicial
  - `/torre` — tela principal da Torre; exibe o andar atual, deck do jogador e permite iniciar batalhas
  - `/batalha` — tela de batalha por turnos contra Pokémon selvagens e líderes de ginásio
  - `/pos-batalha` — resultado da batalha com opções de continuar, tentar novamente ou encerrar
- **Battle Engine** (`lib/battleEngine.ts`) — motor de batalha por turnos com cálculo de dano baseado em tipos, movimentos, stats base e chance de fuga
- **Dados estáticos** (`lib/data/`):
  - `pokemon.ts` — roster completo de Pokémon com stats, tipos e moveset
  - `gyms.ts` — 8 ginásios com seus líderes, Pokémon e badges
  - `typeChart.ts` — tabela completa de efetividade de tipos (fraquezas / resistências / imunidades)
  - `mechanics.ts` — constantes e regras de mecânicas do jogo (floors por ginásio, drops, etc.)
- **Estado global** (`store/gameStore.ts`) — gerenciamento de estado com Zustand; persiste run ativa, deck, andar atual e session ID
- **Cliente de API** (`lib/api.ts`) — funções tipadas para comunicação com o `rtt-pokemon-api`
- **Componente PokemonCard** — card visual de Pokémon com exibição de tipos, HP e movimentos
- **Utilitários de cor** (`lib/typeColors.ts`) — mapeamento de tipos para cores Tailwind
