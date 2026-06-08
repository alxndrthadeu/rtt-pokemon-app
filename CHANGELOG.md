# Changelog

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
