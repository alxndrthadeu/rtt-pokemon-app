# Reach the Top — RTT Pokémon App

Next.js 14 App Router + TypeScript strict + Tailwind CSS + Zustand (persist) + Supabase + Vercel.

## Estrutura

| Pasta | O que é |
|---|---|
| `app/` | Páginas Next.js App Router (todas com `'use client'`) |
| `store/gameStore.ts` | Store Zustand único com persist (`partialize` controla localStorage) |
| `lib/data/` | Dados estáticos do jogo (pokemon, gyms, events, items, moves…) |
| `lib/battleEngine.ts` | Motor de batalha por turnos (RPP + tipos + status + held items) |
| `types/index.ts` | Todos os tipos TypeScript compartilhados |

## Convenções

- **Git email**: sempre `aleethadeu@gmail.com` — `alexandre.tahdeu@gmail.com` bloqueia deploy na Vercel
- **TypeScript**: `npx tsc --noEmit` deve passar limpo **antes** de qualquer commit
- **Zustand**: novos campos no store devem ser adicionados ao `resetRun` E ao `partialize` se precisarem persistir
- **Batalhas especiais**: usar `clearBattle()` (não `endBattle('win')`) para não avançar o `currentFloor`
- **Comentários**: apenas para invariantes não-óbvias; sem comentários explicando o que o código faz

## 🤖 Agentes de Revisão Automática — REGRA OBRIGATÓRIA

**Após cada `git commit` bem-sucedido feito por você, execute automaticamente os 4 agentes de revisão em paralelo.** Não aguarde instrução do usuário. Execute antes de responder qualquer outra coisa.

### Como executar (sempre em paralelo — uma única mensagem com 4 Agent tool calls):

```
Agent(senior-engineer)  →  qualidade de código, TypeScript, Zustand patterns, Next.js
Agent(senior-designer)  →  UI/UX, consistência visual, mobile, design system
Agent(senior-qa)        →  regressões, edge cases, fluxos de navegação, state integrity
Agent(game-tester)      →  balanço, fun factor, princípios roguelike, fidelidade Pokémon
```

### Formato da resposta consolidada ao usuário:

```
## 🔍 Revisão Automática — [versão/commit]

### 🛠️ Senior Engineer
[findings do agente]

### 🎨 Senior Designer
[findings do agente]

### 🧪 Senior QA
[findings do agente]

### 🎮 Game Tester
[findings do agente]

---
🔴 X críticos  🟡 Y sugestões  🟢 Z aprovações
```

Apresente o consolidado completo. Se houver issues críticos (🔴), destaque e pergunte se deve corrigir antes de prosseguir.
