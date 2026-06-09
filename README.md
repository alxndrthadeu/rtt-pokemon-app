# Pokémon Reach the Top

Fan project não-comercial. Roguelike de deck-building com batalhas em Jokenpô ambientado na região de Kanto (Gen I).

> Pokémon © Nintendo / Game Freak / TPCi · Arte original: Ken Sugimori

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Estado | Zustand (com `persist` para localStorage) |
| Deploy | Vercel |
| API (opcional) | REST externa — todas as chamadas são opcionais e falham silenciosamente |

---

## Fluxo de telas

```
/ (Home)
  └─ /personagem         (gênero + nome)
       └─ /draft          (draft de 6 Pokémon)
            └─ /torre      (hub — seleciona 3 para batalhar)
                 ├─ /batalha          (batalha por turnos)
                 │    ├─ derrota → retry (normal) / segunda chance (hard) / desistir
                 │    └─ vitória → /pos-batalha  (ou /entre-andares se for o andar 12)
                 ├─ /pos-batalha      (troca 1 Pokémon do deck)
                 └─ /entre-andares    (progresso, insígnias, próximo desafio)
                      └─ /conclusao   (tela final ao bater os 12 andares)

/pokedex   (acessível do Home e da Torre — independente da run)
```

---

## Mecânicas detalhadas

### 1. Draft

O jogador monta um deck de **6 Pokémon** ao longo de 6 rodadas de escolha.

| Rodada | Pool disponível |
|---|---|
| 1 | Sempre: Bulbasaur, Charmander, Squirtle (+ Ash's Pikachu se nome = "Ash" e gênero masculino) |
| 2–3 (andares 0–2) | Comum + Rara |
| 4–5 (andares 3–5) | Rara + Ultra-rara |
| 5–6 (andares 6–8) | Ultra-rara + 20% chance de Lendária |
| 6 (andares 9+) | Ultra-rara + Lendária + 5% MissingNo. |

**Garantias evolutivas:**
- **Andar 0 (Brock):** a pool do pós-batalha sempre contém a 2ª forma do inicial escolhido
- **Andar 5 (Koga):** a pool sempre contém a forma final do inicial na linha evolutiva

**Reroll:** 1 disponível por run, não disponível na rodada dos iniciais.

**Raridades:**
- `comum` — 1 ponto de raridade
- `rara` — 2 pontos
- `ultra-rara` — 3 pontos
- `lendaria` — 4 pontos (Articuno, Zapdos, Moltres, Mewtwo, Ash's Pikachu)
- `epico` — 5 pontos (Mew, MissingNo.)

---

### 2. Torre — Estrutura dos 12 andares

| Andar | Líder | Tipo | Nível de IA |
|---|---|---|---|
| 1 | Brock | Rock | random |
| 2 | Misty | Water | random |
| 3 | Lt. Surge | Electric | weighted |
| 4 | Erika | Grass | weighted |
| 5 | Koga | Poison | adaptive |
| 6 | Sabrina | Psychic | adaptive |
| 7 | Blaine | Fire | predictive |
| 8 | Giovanni | Ground | predictive |
| 9 | Lorelei (Elite 4) | Ice | predictive |
| 10 | Bruno (Elite 4) | Fighting | predictive |
| 11 | Agatha (Elite 4) | Ghost | predictive |
| 12 | Lance (Elite 4) | Dragon | predictive |

Cada líder tem um deck completo de 6 Pokémon; apenas os 3 primeiros entram em batalha.

---

### 3. Seleção de equipe (Torre → Batalha)

Antes de cada batalha, o jogador escolhe **3 dos 6 Pokémon** do deck e define a **ordem de entrada**. Os 3 escolhidos são os únicos disponíveis naquela batalha (exceto no Hard mode após derrota — ver seção 7).

---

### 4. Sistema de batalha — Jokenpô

Cada turno é simultâneo: jogador e IA escolhem um movimento ao mesmo tempo.

**Movimentos disponíveis por turno:**
- ✊ Pedra (`rock`)
- 📄 Papel (`paper`)
- ✂️ Tesoura (`scissors`)
- ⚡ Ataque Único (uso único por batalha — sempre vence o Jokenpô)

**Resolução:**
```
rock > scissors > paper > rock
Ataque Único sempre vence (exceto em caso de sono/recarregamento)
```

**Dano base:** 1 ponto de coração por turno vencido.

**Multiplicador de tipo** (aplicado sobre o dano base):
- Super efetivo (2×) → +1 dano
- Pouco efetivo (0.5×) → -1 dano (mínimo 1)
- Imune (0×) → 0 dano

O tipo do ataque é determinado pelo movimento do Pokémon vencedor (ex.: Pikachu com Pedra pode ter o move `Thunderbolt` tipo Electric).

**Corações (HP):**  
Cada Pokémon tem 1–3 corações. Ao chegar a 0 está nocauteado. Os 3 corações base são definidos na template de cada Pokémon.

---

### 5. Switch

- **1 troca livre por batalha**, usável a qualquer momento durante a fase de seleção
- A entrada de um novo Pokémon ativa efeitos de entrada (ex.: Intimidate)
- Não é possível trocar para um Pokémon nocauteado
- Não consome o turno — é instantâneo

---

### 6. Habilidades passivas

| Habilidade | Efeito |
|---|---|
| **Overgrow** | Quando com 1♥: ataques Grass do jogador +1 dano |
| **Blaze** | Quando com 1♥: ataques Fire do jogador +1 dano |
| **Torrent** | Quando com 1♥: ataques Water do jogador +1 dano |
| **FlashFire** | Imune a Fire; absorver um ataque Fire ativa +1 em futuros ataques Fire do próprio |
| **WaterAbsorb** | Imune a Water; absorver recupera 1♥ |
| **VoltAbsorb** | Imune a Electric; absorver recupera 1♥ |
| **Levitate** | Imune a Ground |
| **Lightning Rod** | 40% chance de absorver ataques Electric |
| **Intimidate** | Ao entrar em campo: próximo ataque do oponente −1 dano |
| **Sturdy** | Sobrevive a golpe fatal com 1♥ (se estava com >1♥) |
| **InnerFocus** | Sem efeitos especiais de batalha atualmente |
| **NoGuard** | Sem efeitos especiais de batalha atualmente |
| **Synchronize** (Mew) | Todo ataque é tratado como super efetivo (2× fixo, 2 de dano) |
| **Imposter** (Ditto) | Copia stats do oponente ativo |
| **Glitch** (MissingNo.) | Todo ataque causa KO instantâneo (dano = total de corações do defensor) |

---

### 7. Ataques Únicos

Ataques especiais com uso único por batalha. Sempre vencem o Jokenpô (o oponente não pode bloquear com o movimento regular). Disponíveis apenas em Pokémon de formas finais/lendários.

| Ataque | Efeito |
|---|---|
| **Inferno** (Charizard) | 2 de dano fixo, ignora resistências |
| **Hydro Cannon** (Blastoise) | 2 de dano + recarrega 1 turno |
| **Solar Beam** / **Petal Dance** (Venusaur) | 2 de dano em sequência |
| **Hyper Beam** (Normal) | 2 de dano + pula input no próximo turno |
| **Rock Wrecker** (Rock) | 2 de dano + pula input no próximo turno |
| **Outrage** (Dragon) | 2 de dano + pula input no próximo turno |
| **Thunder** (Electric) | 2 de dano fixo, ignora resistências |
| **Dragon Rage** | 2 de dano fixo, ignora resistências |
| **Super Fang** | Dano = metade dos corações restantes do defensor |
| **Soft-Boiled** | Cura 2♥ do próprio Pokémon (não ataca) |
| **Sheer Cold** | KO instantâneo se defensor é Water, Grass, Flying ou Dragon |
| **Hurricane** | Força o oponente a repetir o último movimento por 1 turno |
| **Glare** | Força o oponente a repetir o último movimento por 2 turnos |
| **Lovely Kiss** | Inimigo dorme por 2 turnos (usa ✊ automático) |
| **Rest** | Cura todos os corações + dorme 2 turnos |
| **Glitch Beam** (MissingNo.) | KO instantâneo incondicional |

**Sono e recarregamento:**
- Pokémon dormindo usa ✊ automaticamente por N turnos
- Pokémon recarregando usa ✊ automaticamente por 1 turno
- O sleep/skip afeta o Jokenpô normalmente — não garante vitória

---

### 8. IA do oponente — níveis de dificuldade

| Nível | Comportamento |
|---|---|
| `random` | Escolhe aleatoriamente entre ✊📄✂️ |
| `weighted` | 55% de chance de usar o movimento que bate o mais usado pelo jogador |
| `adaptive` | 75% de chance de bater o mais usado |
| `predictive` | 85% de chance de bater o último movimento do jogador |

---

### 9. Modos de jogo

**Normal:**
- Todos os Pokémon do deck são totalmente curados (corações resetados para o máximo) após cada vitória
- Ao perder uma batalha: aparece a tela de derrota com opção de **Continuar** (volta à seleção, incrementa contador de mortes) ou **Desistir** (encerra a run)

**Hard:**
- Nenhuma cura entre andares — o dano é permanente ao longo de toda a run
- Ao perder com os 3 Pokémon selecionados: o jogador recebe **segunda chance** com os outros 3 Pokémon sobreviventes do deck (aqueles que não foram para a batalha e ainda têm corações)
- Se não houver sobreviventes: game over direto
- Retry (segunda chance) também incrementa o contador de mortes

---

### 10. Pós-batalha — Troca de Pokémon

Após cada vitória (exceto no andar 12), o jogador passa pela tela `/pos-batalha`:

1. **Passo 1 — Recrutar:** escolhe 1 de 3 Pokémon novos da pool (baseada no andar atual) ou pula
2. **Passo 2 — Descartar:** se escolheu recrutar, seleciona qual Pokémon do deck sai

O Pokémon recrutado é adicionado automaticamente à Pokédex.

---

### 11. Contador de mortes (`deathCount`)

- Incrementado a cada retry (Normal) ou segunda chance (Hard)
- Persiste durante toda a run
- Resetado ao iniciar uma nova run
- Usado para calcular o rank na tela de conclusão

---

### 12. Tela de conclusão (`/conclusao`)

Exibida ao derrotar Lance (andar 12). Mostra:

- **Rank** baseado no total de mortes da run:

| Rank | Mortes | Título |
|---|---|---|
| S | 0 | Perfeito |
| A | 1–2 | Excelente |
| B | 3–5 | Bom |
| C | 6–9 | Regular |
| D | 10+ | Sobrevivente |

- Time final com HP restante de cada Pokémon
- Tabela de ranking completa com destaque no rank obtido
- **Compartilhar:** gera imagem via Canvas API + Web Share API (fallback: download `.png`)
- Botão de nova run (reseta tudo exceto Pokédex)

---

### 13. Pokédex (`/pokedex`)

Registro persistente e cross-run de todos os Pokémon já escolhidos pelo jogador.

- **153 entradas:** Pokémon #001–151 + Ash's Pikachu (#ASH) + MissingNo. (#???)
- Pokémon não vistos: sprite encoberto com silhueta escura e número/nome ocultos
- Pokémon vistos: sprite, nome, tipo; toque/clique abre o card completo
- **Filtros:** Todos / Vistos / Ocultos
- **Quando é atualizada:**
  - Durante o draft, ao adicionar cada Pokémon ao deck
  - Na tela de pós-batalha, ao confirmar uma troca
- **Persistência:** salva no localStorage junto com o estado do jogo; nunca é apagada pelo `resetRun()`
- Acessível pelo header do Home e da Torre

---

### 14. Estado global (`store/gameStore.ts`)

Gerenciado por Zustand com `persist` (localStorage, chave `ptt-game-state`).

**Estado persistido entre sessões:**

| Campo | Tipo | Descrição |
|---|---|---|
| `sessionId` | `string` | UUID anônimo para tracking |
| `runId` | `string \| null` | ID da run no servidor (opcional) |
| `mode` | `'normal' \| 'hard' \| null` | Modo de jogo |
| `gender` | `'boy' \| 'girl' \| null` | Gênero do personagem |
| `playerName` | `string` | Nome do treinador |
| `currentFloor` | `number` | Andar atual (0–12) |
| `badgesEarned` | `number[]` | IDs dos ginásios vencidos |
| `deathCount` | `number` | Mortes acumuladas na run |
| `playerDeck` | `PokemonCard[]` | Deck de 6 Pokémon |
| `rerollUsed` | `boolean` | Se o reroll do draft foi usado |
| `pokedexSeen` | `number[]` | IDs vistos (cross-run, nunca resetado) |

**Estado volátil (não persistido):**

| Campo | Tipo | Descrição |
|---|---|---|
| `battle` | `BattleState \| null` | Estado completo da batalha ativa |

---

### 15. Pokémon especiais

**Ash's Pikachu (ID: 9025)**
- Easter egg: aparece na rodada 1 do draft se o personagem se chama "Ash" (masculino)
- Rarity: lendaria
- Habilidade: Lightning Rod

**MissingNo. (ID: 0)**
- Chance de aparecer apenas nos andares 9+ (5%)
- Rarity: epico
- Habilidade: Glitch (KO instantâneo em todo ataque vencido)
- Ataque Único: Glitch Beam (KO incondicional)
- Sprite: usa imagem local `/missingno.png`

---

## Estrutura de arquivos

```
rtt-pokemon-app/
├── app/
│   ├── page.tsx              # Home — seleção de dificuldade
│   ├── personagem/page.tsx   # Gênero + nome
│   ├── draft/page.tsx        # Draft de 6 Pokémon
│   ├── torre/page.tsx        # Hub — seleção de equipe para batalha
│   ├── batalha/page.tsx      # Batalha por turnos (RPS + únicos)
│   ├── pos-batalha/page.tsx  # Troca pós-vitória
│   ├── entre-andares/page.tsx# Progresso entre andares
│   ├── conclusao/page.tsx    # Tela final (rank + compartilhar)
│   └── pokedex/page.tsx      # Pokédex cross-run
├── components/
│   └── PokemonCard.tsx       # Card reutilizável (draft, pokédex, pos-batalha)
├── store/
│   └── gameStore.ts          # Estado global (Zustand + persist)
├── lib/
│   ├── api.ts                # Cliente HTTP opcional (falha silenciosamente)
│   ├── battleEngine.ts       # Motor de batalha — dano, únicos, efeitos
│   ├── typeColors.ts         # Cores por tipo, sprite URLs, formatação
│   └── data/
│       ├── pokemon.ts        # 153 templates de Pokémon
│       ├── gyms.ts           # 12 líderes com decks e configuração de IA
│       ├── typeChart.ts      # Tabela de efetividade (18 tipos)
│       ├── catalog.ts        # Definições de moves e habilidades
│       └── mechanics.ts      # Constantes do jogo
└── types/
    └── index.ts              # Interfaces TypeScript
```

---

## Responsividade

- **Desktop (≥ 640px):** layout em 3 colunas para cards, hover para painéis de habilidade e ataque único
- **Mobile (< 640px):**
  - Draft e pós-batalha: cards em coluna única (pool de 3) ou 2 colunas (deck de descarte)
  - Habilidade: tap na barra abre o painel; tap no painel fecha
  - Ataque Único: botão "▼ Ver efeito / ▲ Ocultar" visível apenas no mobile

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL da API externa (opcional) |
