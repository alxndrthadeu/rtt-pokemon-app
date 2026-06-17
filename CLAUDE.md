# Reach the Top — RTT Pokémon App

Roguelike de batalha por turnos inspirado em Pokémon Gen 1. O jogador monta um time via draft, sobe 12 andares da Torre derrotando Líderes de Ginásio e enfrenta a Elite 4.

**Stack:** Next.js 14 App Router · TypeScript strict · Tailwind CSS · Zustand (persist) · Supabase · Vercel

---

## Estrutura de Arquivos

| Caminho | Responsabilidade |
|---|---|
| `app/` | Páginas Next.js App Router (`'use client'` em todas) |
| `app/batalha/page.tsx` | Tela de batalha — lógica de turno, animações, UI |
| `app/draft/page.tsx` | Draft de Pokémon (rounds 1–5) |
| `app/torre/page.tsx` | Hub principal — seleção de batalha por andar |
| `app/entre-andares/page.tsx` | Pausa entre andares — evolução, loja, heal |
| `app/evento/page.tsx` | Encontros especiais (Lendários, Rocket Grunt) |
| `app/recrutar-lendario/page.tsx` | Substituição de Pokémon após capturar lendário |
| `app/pos-batalha/page.tsx` | Encontro selvagem pós-vitória |
| `app/recompensa/page.tsx` | Drop de item + moedas pós-batalha |
| `app/pokedex/page.tsx` | Pokédex persistente (seen across runs) |
| `app/historico/page.tsx` | Histórico de runs anteriores |
| `app/conclusao/page.tsx` | Tela final de vitória com rank S–D |
| `app/como-jogar/page.tsx` | Tutorial interativo (RPS, tipos, status, IA) |
| `store/gameStore.ts` | Store Zustand único com persist via `partialize` |
| `lib/battleEngine.ts` | Motor de batalha — todos os cálculos e efeitos |
| `lib/data/pokemon.ts` | 153 templates de Pokémon Gen 1 + pools de zona |
| `lib/data/gyms.ts` | 12 andares: 8 Líderes + Elite 4 |
| `lib/data/moves.ts` | Catálogo de golpes por ID |
| `lib/data/abilities.ts` | Catálogo de habilidades por ID |
| `lib/data/uniques.ts` | Catálogo de golpes únicos por ID |
| `lib/data/items.ts` | Itens consumíveis e held items |
| `lib/data/events.ts` | Configuração de encontros especiais |
| `lib/typeColors.ts` | Cores por tipo + helpers de sprite URL |
| `types/index.ts` | Todos os tipos TypeScript compartilhados |
| `components/PokemonCard.tsx` | Card visual reutilizável do Pokémon |

---

## Arquitetura de Batalha (`BattleEffects`)

O motor de batalha usa uma estrutura indexada por `SideIndex = 0 | 1`:

```ts
interface BattleEffects {
  sides: [SideState, SideState]   // sides[0] = player, sides[1] = enemy
  slots: [SlotState, SlotState]   // slots[0] = player, slots[1] = enemy
}
```

**Regra central:** `defenderSide = (1 - attackerSide) as SideIndex` — toda lógica de move é simétrica, sem branches `if (side === 'player')`.

### `SideState` — efeitos de campo (por lado)
```ts
{ hazards: HazardState, protectCooldown: boolean }
// HazardState: { stealthRock, toxicSpikes, stickyWeb }
```

### `SlotState` — efeitos por Pokémon ativo
```ts
{
  status: StatusState | null,   // { condition, turnsLeft }
  tiredTurns, attackMod, defenseMod, sturdyUsed, flashFireActive,
  shellSmashTurns, aquaRingActive, aquaRingHealIn, destinyBond,
  forcedMove, forcedTurnsLeft, sitrusUsed, oranUsed, lumUsed,
  sashUsed, whiteHerbUsed, leftoversTick, uniqueCooldown
}
```

### Helpers imutáveis (em `page.tsx`)
```ts
patchSlot(eff, idx, partial)  // atualiza eff.slots[idx]
patchSide(eff, idx, partial)  // atualiza eff.sides[idx] (deep-clona hazards)
```

### Funções principais do engine (`lib/battleEngine.ts`)
| Função | O que faz |
|---|---|
| `processTurnStart(effects, pf, ef)` | Processa início do turno: status ticks, AquaRing, ShellSmash, forced moves |
| `applySlotMoveEffect(move, attackerSide, effects, ...)` | Aplica efeito de golpe (status/buff/hazard/spin) de forma simétrica |
| `calcSlotDamage(type, attacker, ...)` | Calcula dano com type chart, FlashFire, mods, held items |
| `calcUniqueResult(unique, pf, ef, effects)` | Resolve golpe único (super/heal/ohko/aoe) |
| `applyEntryEffects(pokemon, enteringSide, effects)` | Entrada em campo: Intimidate, orbs, hazards, item tick reset |
| `applyThaw(effects, defenderSide, attackType)` | Descongelamento por golpe de Fogo |
| `applySturdy(damage, hearts, sturdyUsed, hasSturdy)` | Ativa Sturdy se necessário |
| `applyFocusSash(damage, hearts, pokemon, sashUsed)` | Ativa Focus Sash se necessário |

### Escalabilidade futura — Double Battles
- `slots` expande de `[SlotState, SlotState]` para `[SlotState[], SlotState[]]`
- Moves ganham `target: 'self' | 'selectedOpponent' | 'allOpponents' | 'allAllies'`
- `SideIndex` permanece `0 | 1`; lógica de ataque não muda

---

## Sistemas Chave

### Sistema RPS
- Jogador escolhe ✊ Pedra / ✋ Papel / ✌️ Tesoura
- Vencedor causa dano baseado em efetividade de tipo (não no resultado do RPS em si)
- Golpe único (⚡) sempre vence o RPS mas tem restrições (1× por batalha, cooldown)
- IA evolui por andar: `random → weighted → adaptive → predictive`

### Mecânicas de Status
| Condição | Efeito | Imunidade |
|---|---|---|
| Veneno | −0.5♥/turno | Poison, Steel |
| Queimadura | −0.5♥/turno | Fire |
| Sono | Força ✊; perde turno até acordar (45% acordar/turno) | — |
| Congelamento | Força ✊; 20% descongelar/turno; descongelado por Fire | Ice |
| Paralisia | 40% de perder o turno | Electric |

### Hazards de Campo
| Hazard | Efeito na entrada | Quem remove |
|---|---|---|
| Stealth Rock | Dano por tipo (Rock) | Rapid Spin |
| Toxic Spikes | Envenena (absorvido por tipo Poison) | Rapid Spin |
| Sticky Web | Força ✊ no 1º turno | Rapid Spin |

### Held Items
Life Orb · Shell Bell · Sitrus Berry · Oran Berry · Focus Sash · Rocky Helmet · Lum Berry · White Herb · Leftovers · Expert Belt · Scope Lens · King's Rock · Quick Claw · Toxic Orb · Flame Orb · Charcoal/Mystic Water/Miracle Seed/Magnet/Twisted Spoon/Black Belt/Hard Stone/Silver Powder/Dragon Fang/Metal Coat (type boosts)

### Draft e Progressão
- 5 rounds de draft; cada round: pool de 3 Pokémon gerado por zona geográfica (Z1–Z5)
- Linha do inicial excluída dos pools selvagens
- Rare Candy evolui via `EVOLUTION_MAP`; Eevee escolhe aleatoriamente entre Vaporeon/Jolteon/Flareon
- Evoluções especiais do inicial no andar 2 (Misty) e 5 (Koga)

### Eventos Especiais
- **Lendários** (35% após ginásios 4–7): Zapdos / Articuno / Moltres / Mewtwo — batalha com 10♥; vitória permite recrutar em substituição a um Pokémon
- **Rocket Grunt** (25% nos andares 3–6): encarar (+4₽/item ou −3₽) ou ignorar (−2₽)

### UI Mobile
- Bottom sheet animado para descrição de moves (mobile < 640px); flip 3D mantido no desktop
- Scroll snap horizontal no draft
- Safe area insets em todos os footers de batalha

---

## Store (`gameStore.ts`) — Campos Principais

| Campo | Tipo | Persiste |
|---|---|---|
| `battle` | `BattleState \| null` | ✓ |
| `currentFloor` | `number` | ✓ |
| `playerDeck` | `PokemonCard[]` | ✓ |
| `coins` | `number` | ✓ |
| `mode` | `'normal' \| 'hard'` | ✓ |
| `specialBattle` | `SpecialBattleConfig \| null` | ✓ |
| `runHistory` | `RunSummary[]` | ✓ |
| `legendaryEventUsed` | `boolean` | ✓ |
| `starterId` | `number \| null` | ✓ |
| `seenPokemon` | `number[]` | ✓ |

**Regra:** novos campos devem ser adicionados ao `resetRun` **e** ao `partialize` se precisarem persistir.

---

## Convenções

- **Git email**: sempre `aleethadeu@gmail.com` — `alexandre.tahdeu@gmail.com` bloqueia deploy na Vercel
- **TypeScript**: `npx tsc --noEmit` deve passar limpo **antes** de qualquer commit
- **Batalhas especiais**: usar `clearBattle()` (não `endBattle('win')`) para não avançar o `currentFloor`
- **Comentários**: apenas para invariantes não-óbvias; sem comentários de "o que o código faz"
- **BattleEffects writes**: sempre usar `patchSlot` / `patchSide` — nunca `{ ...eff, flatField: value }`
- **Agentes de revisão**: rodar apenas quando o usuário pedir explicitamente
