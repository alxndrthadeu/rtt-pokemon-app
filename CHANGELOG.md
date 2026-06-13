# Changelog

## [0.9.4] - 2026-06-12

### Corrigido

- **Loja sempre acessível** (`app/loja/page.tsx`) — removida guarda `SHOP_FLOORS.includes()` que redirecionava para entre-andares em andares fora de 3/6/9; `shopAvailable` em entre-andares agora é `!isEliteFour && !shopVisited`
- **Focus Sash multi-uso** (`lib/battleEngine.ts`) — `applyEntryEffects()` resetava `playerSashUsed = false` a cada troca; linha removida; sash reseta apenas no início de nova batalha via `DEFAULT_EFFECTS`
- **Lum Berry não cancelava turno perdido por sono** (`lib/battleEngine.ts`) — adicionado `playerSkipsTurn = false` no bloco de cura da Lum Berry
- **Destiny Bond e Aqua Ring herdados na troca** (`app/batalha/page.tsx`) — `handleSwitchTurn` não limpava `playerDestinyBond` nem `playerAquaRingActive`; ambos adicionados ao reset de efeitos na entrada
- **Ancient Power buff desconectado** (`lib/battleEngine.ts`) — `buffed` era calculado mas nunca atribuído; adicionado `res.playerAttackBuff = 1`
- **Acid Armor / Barrier sem efeito mecânico** (`lib/battleEngine.ts`) — casos exibiam mensagem mas não alteravam nada; adicionado `res.playerDefenseBuff = 1`
- **Quiver Dance sem efeito mecânico** (`lib/battleEngine.ts`) — separado de Acid Armor; aplica `playerAttackBuff = 1` e `playerDefenseBuff = 1`
- **Tri Attack mensagem de status falsa** (`lib/battleEngine.ts`) — mensagem sempre mostrava o status sorteado mesmo quando bloqueado por imunidade; adicionado check `statusApplied`
- **Machamp golpe único era OHKO** (`lib/data/pokemon.ts`) — `uniqueId: 'focus-punch'` mapeava para `kind: 'ohko'`; corrigido para `'focus-punch-hitmonchan'` (`kind: 'super'`, 2 dano)
- **Líderes sempre usavam os mesmos 3 Pokémon** (`app/torre/page.tsx`) — `.slice(0, 3)` substituído por shuffle aleatório dos 6 a cada batalha

### Adicionado

- **Fluxo pós-vitória reordenado** — `batalha → recompensa (item + moedas) → pos-batalha (encontro selvagem) → entre-andares`; tela de recompensa exibe "+N ganhos · saldo: ₽XX"
- **₽ (Pokédollar) visível em toda a run** — símbolo ₽ substitui 🪙; saldo exibido no header de Torre, Mochila, Pos-Batalha, Loja e Entre-Andares
- **Draft: pular rodada** (`app/draft/page.tsx`) — botão "Pular rodada" consome o reroll e avança sem capturar; deck final com 5 Pokémon

### Balanceamento

- **Life Orb** (`lib/battleEngine.ts`) — dano extra +1 → +0.5♥
- **Itens de tipo** (`lib/battleEngine.ts`) — boost fixo substituído por +0.5♥ normal / +1♥ se super efetivo
- **Paralisia** (`lib/battleEngine.ts`) — chance de travar turno 30% → 40%
- **Congelamento** (`lib/battleEngine.ts`) — adicionado 20% de chance de descongelar espontaneamente por turno (player e inimigo)
- **Hard Mode moedas** (`store/gameStore.ts`) — 6 → 4 por vitória
- **Lt. Surge** (`lib/data/gyms.ts`) — Voltorb (#100) → Electabuzz (#125)
- **Sabrina** (`lib/data/gyms.ts`) — Abra (#63) → Jynx (#124)
- **Bruno** (`lib/data/gyms.ts`) — Omastar/Kabutops → Primeape (#57) / Machoke (#67)
- **Lance** (`lib/data/gyms.ts`) — Horsea (#116) → Seadra (#117)
- **Descrições de itens** (`lib/data/items.ts`) — Life Orb e itens de tipo atualizados para refletir novos valores

### UI

- **Shake sprite ao receber dano** (`app/globals.css`) — animação `sprite-shake` com guard `prefers-reduced-motion`
- **HPBar**: 6px → 10px; texto de HP: 6px → 9px (`app/batalha/page.tsx`)
- **Botões de move e slot único maiores**: 18px → 32px
- **KO banner** vermelho com `font-black`
- **Aviso de troca** — "⚠️ Trocar gasta o turno — inimigo ataca de graça"
- **Ícone RPS do inimigo** — exibido no sprite durante fase de seleção (opacity 55%)
- **Brilho dourado no slot único** disponível (`boxShadow: '0 0 8px 3px #F8D03066'`)
- **Safe area insets** no footer de batalha
- **Cor de fundo entre-andares**: `#F0F4F8` → `#F5EDD8`

---

## [0.9.3] - 2026-06-12

### Corrigido

- **Focus Sash nunca aplicada** (`app/batalha/page.tsx`) — `applyFocusSash()` existia na engine mas nunca era chamada; adicionada no bloco `enemy_wins` após o check de Sturdy; cria flag `playerSashUsed` via `BattleEffects`
- **Rocky Helmet nunca aplicado** (`app/batalha/page.tsx`) — `getRockyHelmetRecoil()` existia na engine mas nunca era chamada; recoil de 0.5♥ ao inimigo quando player tem o item e recebe dano ofensivo
- **Quick Claw nunca chamada** (`app/batalha/page.tsx`) — `checkQuickClaw()` existia na engine mas nunca era chamada; adicionada no `useEffect` de pré-cômputo do RPS inimigo; 25% de chance de revelar o nome do move inimigo no dialog de seleção
- **0♥ após hazard em `confirmSwitch`** (`app/batalha/page.tsx`) — quando o Pokémon enviado após faint chegava a 0♥ por Stealth Rock, o jogo continuava com ele em campo; agora detecta o faint, verifica se há Pokémon restantes e redireciona para picker de troca ou tela de derrota

---

## [0.9.2] - 2026-06-12

### Corrigido

- **Life Orb recoil nunca aplicado** (`app/batalha/page.tsx`) — `getLifeOrbRecoil()` existia no engine mas nunca era chamada; agora descontada após ataques vitoriosos
- **Shell Bell heal nunca aplicado** (`app/batalha/page.tsx`) — `getShellBellHeal()` existia no engine mas nunca era chamada; agora aplicada após causar dano
- **King's Rock flinch nunca aplicado** (`app/batalha/page.tsx`) — `checkKingsRock()` existia no engine mas nunca era chamada; 30% de forçar ✊ no próximo turno inimigo
- **Sticky Web `forcedFirstMove` descartado** (`app/batalha/page.tsx`) — `applyEntryEffects()` retornava `forcedFirstMove` mas todos os 4 call sites descartavam o valor; adicionado estado `stickyWebForcedMove` e lógica em `handleAttack`, `handleSwitchTurn` e `confirmSwitch`
- **`handleGiveUp` ia para `/` sem razão** (`app/batalha/page.tsx`) — agora chama `setRunEndReason('lost')` e redireciona para `/game-over`
- **Hard Mode HP display** (`app/batalha/page.tsx`) — `p.hearts/p.hearts` corrigido para `Math.ceil(p.hearts)/5` na tela de segunda chance
- **`runSaved` não persistido** (`store/gameStore.ts`) — adicionado ao `partialize`; previne saves duplicados após reload

### Adicionado

- **Chip damage em empates consecutivos** (`app/batalha/page.tsx`) — a partir do 2º empate seguido, ambos tomam 0.5♥; estado `consecutiveTies` resetado em turnos não-tie
- **Visual tell do inimigo reativado** (`app/batalha/page.tsx`) — `enemyTellColor = null` substituído por cálculo real via `precomputedEnemyRPS`

### Modificado

- **`HEAL_COST`: 10 → 7** (`store/gameStore.ts`) — cura total acessível após 3ª vitória (economicamente viável)

---

## [0.9.1] - 2026-06-12

### Corrigido

- **Hazard damage on entry** (`app/batalha/page.tsx`) — `applyEntryEffects` retorna `hazardDamage` mas nunca era aplicado ao HP. Corrigido nos 4 call sites: mount inicial, `handleNext` (inimigo entra), `handleSwitchTurn` (troca voluntária) e `confirmSwitch` (troca após faint)
- **Torre — insígnias emoji substituídas por sprites reais** (`app/torre/page.tsx`) — `FLOOR_BADGE` emoji removido; `BADGE_URLS` com `/badges/1.png`–`/badges/8.png` adicionado; Elite 4 mantém emoji via `ELITE4_BADGE`; grid de progresso e card do líder usam imagem real
- **Swipe back acidental no mobile** — `overscrollBehaviorX: 'none'` adicionado ao `<main>` das páginas `batalha` e `torre`; `touchAction: 'pan-y'` adicionado ao grid de seleção de Pokémon na Torre para impedir que swipe horizontal acione navegação do browser

---

## [0.9.0] - 2026-06-12

### Adicionado

- **`EVOLUTION_MAP: Record<number, number>`** em `lib/data/pokemon.ts` — mapa completo Gen 1 (todas as linhas de evolução exceto ramificações)
- **`LEGENDARY_IDS_SET`** em `lib/data/pokemon.ts` — Set para checagem O(1) de lendários
- **`getStarterLine(starterId): number[]`** — retorna linha completa [stage1, stage2, stage3] de qualquer ID na linha do inicial
- **`starterId: number | null`** no store — persistido via `partialize`; definido em `setStarterId(id)` no round 1 do draft
- **`evolvePokemon(pokemonId)`** no store — evolui Pokémon pelo `EVOLUTION_MAP`, preserva `hearts`/`statusEffects`/`heldItem`/`rarity`/`isShiny`
- **`StarterEvolutionOverlay`** em `entre-andares/page.tsx` — evento especial fullscreen: flash branco → crossfade de sprites → "X está evoluindo!"; dura ~2.8s e dispara `evolvePokemon` ao fechar
- **Chips de hazards visuais** em `app/batalha/page.tsx` — componente `HazardChips` mostra 🪨/☠️/🕸️ posicionados absolutamente nos campos do inimigo e do jogador; lê de `effects.enemyHazards` e `effects.playerHazards`

### Modificado

- **Rare Candy** (`store/gameStore.ts`) — agora evolui Pokémon via `EVOLUTION_MAP` + `makePokemonCard` em vez de subir raridade. Eevee (133) evolui aleatoriamente para 134/135/136. Imune: `ASH_PIKACHU_ID` e `LEGENDARY_IDS_SET`
- **`app/draft/page.tsx`** — `generatePool` aceita `starterId` e usa `getStarterLine(starterId)` no exclude em vez de `STARTER_LINE_IDS` completo; `handleConfirm` chama `setStarterId` no round 1
- **`app/pos-batalha/page.tsx`** — `generatePostBattlePool` usa `getStarterLine(starterId)` em vez de `STARTER_LINE_IDS`
- **Zone pools** (`lib/data/pokemon.ts`) — iniciais dos oponentes adicionados de volta: Bulbasaur/Ivysaur em Z1 ultra; Charmander/Charmeleon/Squirtle/Wartortle em Z2 ultra; Venusaur/Charizard/Blastoise em Z3 ultra
- **`app/entre-andares/page.tsx`** — detecta `currentFloor === 2` (Misty) e `currentFloor === 5` (Koga) e dispara overlay de evolução se o inicial (stage 1 ou 2) ainda estiver no deck

### Corrigido

- **Pokémon desmaiados selecionáveis** na torre (`app/torre/page.tsx`) — guard `isFainted || hearts <= 0`; grayscale + badge "Desmaiado"; barra HP em vez de ♥ (sessão anterior)
- **Hazards do inimigo não funcionavam** (`app/batalha/page.tsx`) — bloco `enemy_wins` agora chama `applySlotMoveEffect` para moves não-ofensivos antes de `calcSlotDamage` (sessão anterior)

---

## [0.8.0] - 2026-06-12

### Adicionado

- **Zone pools geográficos** (`lib/data/pokemon.ts`)
  - 5 zonas (`Z1`–`Z5`) mapeadas para regiões de Kanto por `currentFloor`: Viridian/Pewter (0–1), Vermilion/Lavender (2–3), Celadon/Fuchsia (4–5), Saffron/Cinnabar (6–7), Victory Road/Plateau (8–11)
  - Cada zona tem três tiers: `common`, `rare`, `ultra` — ponderados por weighted bag (`deepInZone` duplica rare/ultra nos andares mais altos da zona)
  - Fallback garante 3 cards mesmo se o pool filtrado for pequeno
  - Easter egg: 5% de chance de substituir um slot por Missingno (ID 0) em Z5 — apenas em Victory Road
  - Exports: `generateZonePool(prevFloor, excludeIds)`, `generateInitialDraftPool(excludeIds)`, `STARTER_LINE_IDS`
- **`STARTER_LINE_IDS = new Set([1..9])`** — IDs 1–9 (Bulbasaur → Blastoise) excluídos de todos os pools selvagens via `excludeIds`; garante que o inicial escolhido seja único na run
- **`RunSummary` e `RunEndReason`** em `types/index.ts`
  - `RunSummary`: `id`, `date`, `playerName`, `mode`, `gender`, `result`, `floorsCompleted`, `badgesEarned`, `deathCount`, `coins`, `teamSnapshot[]`
- **`runHistory: RunSummary[]`** no store — persiste os últimos 50 resumos via `partialize`
- **`runEndReason: RunEndReason | null`** e **`runSaved: boolean`** no store
  - `setRunEndReason(reason)` — chamado em `entre-andares` (→ `'abandoned'`) e em `batalha/handleAbandon` (→ `'lost'`)
  - `saveRunToHistory()` — idempotente via `runSaved`; snapshot da run salvo ao montar `/game-over`
- **`/historico/page.tsx`** — página de histórico com trainer card por run
  - Exibe: sprite do personagem, nome, modo, data, resultado colorido, stats (andares/insígnias/mortes), badges com sprite oficial e team sprites com HP dots
  - Estado vazio com CTA para jogar
- **`/game-over/page.tsx`** melhorado
  - Salva run no histórico em `useEffect` ao montar (sem duplo-save em refresh)
  - Header muda cor e ícone por resultado (`abandoned`/`lost`/`won`)
  - Botão "Ver histórico de runs" nos CTAs

### Modificado

- **`app/draft/page.tsx`** — `generatePool` usa `generateInitialDraftPool` com `STARTER_LINE_IDS` no exclude
- **`app/pos-batalha/page.tsx`** — `generatePostBattlePool` usa `generateZonePool` com `STARTER_LINE_IDS` no exclude; removidas funções locais `shuffle`, `getGuaranteedEvo`, `injectGuaranteed`, `STARTER_STAGE2/3`, `DRAFT_POOL_COMMON/RARE`
- **`app/personagem/page.tsx`** — `typeLabel`: `'Trainer'` → `'BOY'`, `'Rival'` → `'GIRL'`
- **`app/page.tsx`** — STEPS atualizados: novo card "Itens & Hazards", textos revisados para refletir Centro Pokémon, Pokémart, pool lendário e Missingno; card misterioso lista os lendários corretos
- **`store/gameStore.ts`** — `resetRun` preserva `runHistory`, reseta `runEndReason` e `runSaved`; `partialize` inclui `runHistory`
- **`app/entre-andares/page.tsx`** — `AbandonConfirmModal.onConfirm` chama `setRunEndReason('abandoned')` antes de navegar para `/game-over`
- **`app/batalha/page.tsx`** — `handleAbandon` chama `setRunEndReason('lost')` antes de `endBattle('lose')`

### Corrigido

- **TypeScript: `Set<number>` spread** — `...STARTER_LINE_IDS` e `...new Set(...)` substituídos por `Array.from()` em `draft/page.tsx`, `pos-batalha/page.tsx` e `lib/data/pokemon.ts` (erro TS2802 com `target < ES2015`)

---

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
