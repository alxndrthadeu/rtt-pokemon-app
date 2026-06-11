# Melhorias 02 — Sessão de Revisão de Game Design

## 1. NVE (Not Very Effective) agora causa metade do dano

**Arquivo:** `lib/data/typeChart.ts` — `damageFromMultiplier`

Resistência de tipo agora tem custo real: multiplicador `<= 0.5` retorna `base * 0.5` em vez de `base`.

| Multiplicador | Antes  | Depois    |
|---------------|--------|-----------|
| 0 (imune)     | 0 dano | 0 dano    |
| 0.5 (NVE)     | 1 dano | 0.5 dano  |
| 1 (neutro)    | 1 dano | 1 dano    |
| 2+ (SE)       | 2 dano | 2 dano    |

---

## 2. Sleep redesenhado — máx 2 turnos com 45% de chance de acordar cedo

**Arquivo:** `lib/battleEngine.ts` — `processTurnStart`

- Dormir agora dura no máximo 2 turnos (antes era auto-win sem limite)
- No 2º turno (`turnsLeft > 1`): 45% de chance de acordar antes do fim
- Sempre perde ao menos 1 turno (forced rock garantido)
- `Rest` continua determinístico (`turnsLeft: 1`) — 1 turno fixo
- `Spore` aplica 1 turno de sono; outras fontes de sono aplicam 2 turnos

**UI:** `STATUS_DESC` atualizado para refletir a nova mecânica.

---

## 3. Mecânicas pendentes implementadas

### Spore
Aplica sono por 1 turno (em vez dos 2 aplicados por moves genéricos de sleep).

### Aqua Ring
**Arquivo:** `lib/data/uniques.ts` + `lib/battleEngine.ts`

- Ativa `playerAquaRingActive = true` no `BattleEffects`
- A cada 2 turnos (`playerAquaRingHealIn`) cura 1 heart do jogador
- Cura processada em `processTurnStart` com `playerHeartsGained`

### Shell Smash
**Arquivo:** `lib/battleEngine.ts`

- Ativa `playerShellSmashTurns` no `BattleEffects`
- Enquanto ativo: dano de ataque aumentado (aplicado no `processTurnStart`)
- Representado via `UniqueResult.activateShellSmash`

### Destiny Bond
**Arquivo:** `lib/battleEngine.ts`

- Ativa `playerDestinyBond = true` no `BattleEffects`
- Se o jogador for nocauteado enquanto Destiny Bond estiver ativo: inimigo também é derrotado
- Trigger resolvido após cálculo de dano em `app/batalha/page.tsx`

### Fissure
**Arquivo:** `lib/data/uniques.ts` + `lib/battleEngine.ts`

- OHKO em tipos vulneráveis: Ground, Rock, Steel → `damage = defender.hearts`
- Contra outros tipos: causa apenas 1 de dano
- Sempre aplica `playerTiredTurns = 2` (cooldown de 2 turnos)

---

## 4. InnerFocus e NoGuard — bypass de imunidade de tipo

**Arquivo:** `lib/battleEngine.ts` — `calcSlotDamage`

Habilidades que antes eram apenas cosméticas agora têm utilidade real:

- Se o dano calculado for 0 (imunidade de tipo) e o Pokémon tiver `InnerFocus` ou `NoGuard`: causa **1 de dano mínimo**
- Mensagem visual: `🎯 InnerFocus! Ignora imunidade de tipo — 1 dano!`

---

## 5. IA Predictive corrigida — análise de padrão de 2 turnos

**Arquivo:** `app/batalha/page.tsx` — `generateAIMove`

Antes: a IA tentava prever com base apenas no move mais usado.

Depois: analisa o padrão de sequência — *"qual move o jogador costuma usar após X?"*

- Requer mínimo de 2 amostras de follow-through para ativar a predição
- Se amostras insuficientes: fallback para o move mais usado (comportamento anterior)
- Elimina o bug onde a IA "trava" em um único counter sem considerar variação

---

## 6. Visual tell — glow no sprite inimigo durante seleção

**Arquivo:** `app/batalha/page.tsx` + componente Arena

- A IA pré-computa o move assim que a fase `selecting` começa
- O tipo do move é derivado do RPS escolhido e exibido como um glow colorido no sprite inimigo
- Glow desaparece quando a fase de batalha começa
- Objetivo: dar ao jogador uma pista visual, sem entregar o move diretamente

---

## 7. Lorelei — time corrigido para tipo Gelo

**Arquivo:** `lib/data/gyms.ts`

Time anterior usava tipos Lutador (erro de dados). Corrigido para o time canônico de Gelo da Elite 4:

| # | Pokémon  | ID  |
|---|----------|-----|
| 1 | Seel     | 86  |
| 2 | Dewgong  | 87  |
| 3 | Cloyster | 91  |
| 4 | Jynx     | 124 |
| 5 | Lapras   | 131 |
| 6 | Slowbro  | 80  |

---

## 8. Bruno — time ajustado para Lutador + Pedra (sem overlap com Brock)

**Arquivo:** `lib/data/gyms.ts`

Bruno agora usa uma mescla de Lutador e Pedra/Fóssil, evitando repetir os Pokémon de Pedra pura do Brock:

| # | Pokémon    | ID  |
|---|------------|-----|
| 1 | Hitmonlee  | 106 |
| 2 | Hitmonchan | 107 |
| 3 | Machamp    | 68  |
| 4 | Poliwrath  | 62  |
| 5 | Kabutops   | 141 |
| 6 | Aerodactyl | 142 |

---

## 9. Limpeza de dados — duplicatas removidas em mechanics.ts

**Arquivo:** `lib/data/mechanics.ts`

Removidas as entradas duplicadas de:
- `Stick` (segunda ocorrência ao final do array `UNIQUE_MOVE_CATALOG`)
- `Perish Song` (segunda ocorrência ao final do array `UNIQUE_MOVE_CATALOG`)

---

## Pendente (aguardando feedback)

- **Normal mode:** cura parcial entre lutas (rejeitado por ora)
- **Troca de Pokémon no Elite 4:** swaps pós-batalha (rejeitado por ora)
- **Pool de abilities expandido:** mais abilities com efeito real nas mecânicas atuais
- **Descrições de InnerFocus/NoGuard:** atualizar `abilities.ts` com texto descritivo das novas utilidades

---

## Intenções de design confirmadas

- HP baixo = `<= 2` hearts (não `=== 1`)
- MissingNo. e Mew são **propositalmente broken** — não corrigir
- Sleep como auto-win foi substituído por sistema de 2 turnos com saída probabilística
