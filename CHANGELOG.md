# Changelog

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
