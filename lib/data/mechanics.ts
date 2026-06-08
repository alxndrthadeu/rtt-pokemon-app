/**
 * mechanics.ts
 *
 * Catálogo centralizado de todas as habilidades passivas e ataques únicos
 * do jogo. Serve como fonte de verdade para documentação e validação de
 * implementação.
 *
 * Status de implementação:
 *   ✅ implementado em app/batalha/page.tsx + lib/battleEngine.ts
 *   ⚠️  implementado parcialmente (lógica simplificada)
 *   ❌  ainda não implementado (mecânica ignorada no momento)
 */

import type { PokemonType, RPS } from '@/types'

// ─── Tipos base ───────────────────────────────────────────────────────────────

export type ImplStatus = 'done' | 'partial' | 'pending'

export type AbilityTrigger =
  | 'on_entry'          // ativa quando o Pokémon entra em campo
  | 'on_receive_type'   // ativa quando recebe ataque de um tipo específico
  | 'at_low_hp'         // ativa quando está com 1 coração
  | 'on_win'            // ativa ao vencer qualquer RPS
  | 'passive'           // sempre ativo

export interface AbilityDef {
  name: string
  trigger: AbilityTrigger
  immuneType?: PokemonType       // para imunidades (VoltAbsorb, etc.)
  boostType?: PokemonType        // tipo boosted (Overgrow → Grass)
  description: string            // texto exibido no card (PT-BR)
  mechanic: string               // descrição técnica do efeito em batalha
  status: ImplStatus
  pokemonExamples: string[]      // exemplos de Pokémon com esta habilidade
}

export type UniqueDamageFormula =
  | 'fixed'            // dano fixo independente de tipo
  | 'type_effective'   // dano normal * efetividade de tipo
  | 'half_hp'          // metade dos corações do inimigo
  | 'floor_based'      // baseado no andar atual (Seismic Toss)
  | 'zero_heal'        // não causa dano — cura o atacante
  | 'zero_status'      // não causa dano — aplica status
  | 'chance_ko'        // chance de KO instantâneo
  | 'instant_ko_cond'  // KO se inimigo for de certo tipo
  | 'crit_chance'      // 50%: 2 dano / 50%: 1 dano
  | 'self_ko'          // causa muito dano mas KO o próprio
  | 'win_on_tie'       // vence empates (1 dano normal)

export interface UniqueMoveDef {
  name: string
  type: PokemonType
  category: RPS
  formula: UniqueDamageFormula
  damage: number | string        // número ou fórmula descritiva
  sideEffects: string[]          // efeitos além do dano
  description: string            // texto exibido no card (PT-BR)
  mechanic: string               // descrição técnica para implementação
  status: ImplStatus
  pokemonOwners: string[]        // quem tem esse ataque
}

// ─── HABILIDADES PASSIVAS ─────────────────────────────────────────────────────

export const ABILITY_CATALOG: AbilityDef[] = [

  // ── Starters ──────────────────────────────────────────────────────────────

  {
    name: 'Overgrow',
    trigger: 'at_low_hp',
    boostType: 'Grass',
    description: 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.',
    mechanic: 'Se attacker.hearts === 1 e attackType === "Grass", enemyDmg += 1.',
    status: 'done',
    pokemonExamples: ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Paras', 'Parasect', 'Tangela', 'Exeggcute', 'Exeggutor'],
  },
  {
    name: 'Blaze',
    trigger: 'at_low_hp',
    boostType: 'Fire',
    description: 'Quando com 1 coração restante, ataques de Fogo causam +1 de dano.',
    mechanic: 'Se attacker.hearts === 1 e attackType === "Fire", enemyDmg += 1.',
    status: 'done',
    pokemonExamples: ['Charmander', 'Charmeleon', 'Charizard'],
  },
  {
    name: 'Torrent',
    trigger: 'at_low_hp',
    boostType: 'Water',
    description: 'Quando com 1 coração restante, ataques de Água causam +1 de dano.',
    mechanic: 'Se attacker.hearts === 1 e attackType === "Water", enemyDmg += 1.',
    status: 'done',
    pokemonExamples: ['Squirtle', 'Wartortle', 'Blastoise'],
  },

  // ── Absorção de tipo ────────────────────────────────────────────────────────

  {
    name: 'VoltAbsorb',
    trigger: 'on_receive_type',
    immuneType: 'Electric',
    description: 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.',
    mechanic: 'Se attackType === "Electric": imune (0 dano) + defender.hearts = min(hearts+1, max).',
    status: 'done',
    pokemonExamples: ['Pikachu', 'Raichu', 'Magnemite', 'Magneton', 'Voltorb', 'Electrode', 'Jolteon', 'Electabuzz', 'Zapdos'],
  },
  {
    name: 'WaterAbsorb',
    trigger: 'on_receive_type',
    immuneType: 'Water',
    description: 'Imune a ataques de Água; ao receber um, recupera 1 coração.',
    mechanic: 'Se attackType === "Water": imune (0 dano) + defender.hearts = min(hearts+1, max).',
    status: 'done',
    pokemonExamples: ['Poliwag', 'Poliwhirl', 'Poliwrath', 'Seel', 'Dewgong', 'Horsea', 'Seadra', 'Goldeen', 'Seaking', 'Vaporeon', 'Lapras'],
  },
  {
    name: 'FlashFire',
    trigger: 'on_receive_type',
    immuneType: 'Fire',
    description: 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.',
    mechanic: 'Se attackType === "Fire": imune (0 dano) + eff.flashFireActive = true. Quando flashFireActive e attackType === "Fire" na ofensiva: enemyDmg += 1.',
    status: 'done',
    pokemonExamples: ['Vulpix', 'Ninetales', 'Growlithe', 'Arcanine', 'Ponyta', 'Rapidash', 'Flareon', 'Magmar', 'Moltres'],
  },
  {
    name: 'Levitate',
    trigger: 'on_receive_type',
    immuneType: 'Ground',
    description: 'Imune a ataques do tipo Terra.',
    mechanic: 'Se attackType === "Ground": imune (0 dano). Sem recuperação.',
    status: 'done',
    pokemonExamples: ['Gastly', 'Haunter', 'Gengar', 'Koffing', 'Weezing'],
  },

  // ── Entrada em campo ────────────────────────────────────────────────────────

  {
    name: 'Intimidate',
    trigger: 'on_entry',
    description: 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.',
    mechanic: 'applyEntryEffects() → eff.enemyAttackReduced = true (se player) ou eff.playerAttackReduced = true (se enemy). Redução é aplicada no próximo turno em que o oponente vencer.',
    status: 'done',
    pokemonExamples: ['Beedrill', 'Pidgeot', 'Ekans', 'Arbok', 'Nidoran♀', 'Nidorina', 'Nidoran♂', 'Nidorino', 'Persian', 'Tauros', 'Gyarados'],
  },

  // ── Survivabilidade ─────────────────────────────────────────────────────────

  {
    name: 'Sturdy',
    trigger: 'passive',
    description: 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.',
    mechanic: 'Se defender.hearts > 1 e hearts - damage <= 0: damage = hearts - 1 (sobrevive com 1).',
    status: 'done',
    pokemonExamples: ['Metapod', 'Kakuna', 'Sandshrew', 'Sandslash', 'Nidoqueen', 'Nidoking', 'Geodude', 'Graveler', 'Golem', 'Grimer', 'Muk', 'Shellder', 'Cloyster', 'Onix', 'Cubone', 'Marowak', 'Rhyhorn', 'Rhydon', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops'],
  },

  // ── Neutras / Foco ──────────────────────────────────────────────────────────

  {
    name: 'InnerFocus',
    trigger: 'passive',
    description: 'Imune a efeitos que causem flinch ou interrupção de ataque.',
    mechanic: 'Atualmente: nenhum Pokémon inimigo implementa flinch diretamente. A habilidade é passiva e bloqueia efeitos futuros de interrupção forçada (não sleep, não forceMove).',
    status: 'pending',
    pokemonExamples: ['Butterfree', 'Pidgey', 'Pidgeotto', 'Rattata', 'Raticate', 'Spearow', 'Fearow', 'Meowth', 'Psyduck', 'Golduck', 'Mankey', 'Primeape', 'Abra', 'Machop', 'Machoke', 'Machamp', 'Doduo', 'Dodrio', 'Krabby', 'Kingler', 'Hitmonlee', 'Hitmonchan', 'Lickitung', 'Scyther', 'Snorlax', 'Aerodactyl', 'Eevee', 'Kangaskhan', 'Pinsir', 'Magikarp', 'Dratini', 'Dragonair', 'Dragonite', 'Mewtwo', 'Staryu', 'Starmie'],
  },
  {
    name: 'NoGuard',
    trigger: 'passive',
    description: 'Todos os ataques acertam, mas o inimigo também não pode errar.',
    mechanic: 'No sistema de RPS, todos os ataques já "acertam" quando vencidos. NoGuard não tem efeito mecânico atual no jogo (sem mecânica de acerto/erro). Pode ser expandido no futuro.',
    status: 'pending',
    pokemonExamples: ['Caterpie', 'Weedle', 'Paras', 'Parasect', 'Porygon'],
  },

  // ── Especiais (únicos) ──────────────────────────────────────────────────────

  {
    name: 'Synchronize',
    trigger: 'passive',
    description: 'Efeito varia: Kadabra/Alakazam/Drowzee/Hypno/Mr. Mime refletem status. Mew: todos os ataques são super efetivos.',
    mechanic: 'Para Mew: enemyDmg = 2, multiplier = 2 sempre. Para outros: quando inimigo aplicar status (sleep/force), o mesmo status reverte ao inimigo. Apenas versão Mew implementada.',
    status: 'partial',
    pokemonExamples: ['Kadabra', 'Alakazam', 'Drowzee', 'Hypno', 'Mr. Mime', 'Mew'],
  },
  {
    name: 'Imposter',
    trigger: 'on_entry',
    description: 'Ao entrar em campo, copia o tipo e os moves do inimigo ativo. Sempre recebe no máximo 1 de dano por turno.',
    mechanic: 'Ditto copia type1/type2 e moves do inimigo ativo. Damage cap: nunca sofre mais de 1 por turno. Não implementado — requer substituição dinâmica de moves.',
    status: 'pending',
    pokemonExamples: ['Ditto'],
  },
  {
    name: 'Glitch',
    trigger: 'on_win',
    description: 'Bug lendário: ao vencer qualquer Jokenpô, o inimigo é derrotado instantaneamente (KO).',
    mechanic: 'Se playerAbility === "Glitch" e outcome === "player_wins": enemyDmg = ef.hearts (KO).',
    status: 'done',
    pokemonExamples: ['MissingNo.'],
  },
]

// ─── ATAQUES ÚNICOS ───────────────────────────────────────────────────────────

export const UNIQUE_MOVE_CATALOG: UniqueMoveDef[] = [

  // ── Dano fixo (ignoram efetividade) ────────────────────────────────────────

  {
    name: 'Dragon Rage',
    type: 'Dragon',
    category: 'scissors',
    formula: 'fixed',
    damage: 2,
    sideEffects: [],
    description: 'Raiva dracônica que causa sempre exatamente 2 de dano ao vencer, independente de tipo ou habilidades.',
    mechanic: 'damage: 2, multiplier: 2. Ignora efetividade.',
    status: 'done',
    pokemonOwners: ['Charmander (move)', 'Seadra'],
  },
  {
    name: 'Inferno',
    type: 'Fire',
    category: 'rock',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Versão Ninetales: queimadura 1 dano/turno por 2 turnos (pendente)'],
    description: 'Lança uma chama devastadora. Se vencer no Jokenpô, causa 2 de dano base ignorando resistências.',
    mechanic: 'damage: 2, multiplier: 2. Ignora efetividade de tipo. Burn do Ninetales não implementado.',
    status: 'partial',
    pokemonOwners: ['Charizard', 'Ninetales'],
  },
  {
    name: 'Thunder',
    type: 'Electric',
    category: 'scissors',
    formula: 'fixed',
    damage: 2,
    sideEffects: [],
    description: 'Invoca um raio do céu. Sempre que vencer no Jokenpô, causa 2 de dano independente de resistências.',
    mechanic: 'damage: 2, multiplier: 2. Ignora efetividade.',
    status: 'done',
    pokemonOwners: ['Raichu', 'Zapdos'],
  },
  {
    name: 'Lava Plume',
    type: 'Fire',
    category: 'scissors',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Queimadura no banco inimigo (1 dano ao próximo Pokémon) — pendente'],
    description: 'Erupção de lava que queima o campo. Se vencer, inimigos no banco também sofrem queimadura.',
    mechanic: 'damage: 2. Bench burn não implementado — requer rastreamento de dano pre-entry.',
    status: 'partial',
    pokemonOwners: ['Magmar'],
  },
  {
    name: 'Psystrike',
    type: 'Psychic',
    category: 'rock',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Ignora habilidades e status do inimigo'],
    description: 'O ataque mental mais poderoso. Se vencer, ignora completamente a habilidade e os efeitos de status do inimigo. Causa 2 de dano base.',
    mechanic: 'damage: 2. Bypass de imunidades (não checa FlashFire, Levitate, etc.). Implementado como dano fixo.',
    status: 'done',
    pokemonOwners: ['Mewtwo'],
  },
  {
    name: 'Glitch Beam',
    type: 'Normal',
    category: 'rock',
    formula: 'instant_ko_cond',
    damage: 'ef.hearts (KO)',
    sideEffects: ['KO imediato sem condição de tipo'],
    description: '???: emite um raio de dados corrompidos. Ao vencer, causa KO instantâneo.',
    mechanic: 'damage = defender.hearts. Nenhum Sturdy aplica.',
    status: 'done',
    pokemonOwners: ['MissingNo.'],
  },

  // ── Dano com cooldown / skip ────────────────────────────────────────────────

  {
    name: 'Hydro Cannon',
    type: 'Water',
    category: 'rock',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Cooldown: não pode usar unique no turno seguinte'],
    description: 'Dispara canhões d\'água duplos. Se vencer, causa 2 de dano. Não pode ser usado dois turnos seguidos.',
    mechanic: 'damage: 2. eff.uniqueCooldown = true. No próximo turno uniqueActive = false.',
    status: 'done',
    pokemonOwners: ['Blastoise'],
  },
  {
    name: 'Hyper Beam',
    type: 'Normal',
    category: 'paper',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Skip: próximo turno usa ✊ automaticamente (recharge)'],
    description: 'O ataque mais poderoso. Se vencer, causa 2 de dano mas o usuário fica sem ação no turno seguinte.',
    mechanic: 'damage: 2. eff.uniqueSkipThisTurn = true → próximo input ignorado, playerRPS = "rock".',
    status: 'done',
    pokemonOwners: ['Tauros', 'Gyarados', 'Aerodactyl (move normal)'],
  },
  {
    name: 'Rock Wrecker',
    type: 'Rock',
    category: 'scissors',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Skip: próximo turno usa ✊ automaticamente (recharge)'],
    description: 'Lança uma rocha gigante. Se vencer, causa 2 de dano mas fica recarregando no turno seguinte.',
    mechanic: 'damage: 2. eff.uniqueSkipThisTurn = true.',
    status: 'done',
    pokemonOwners: ['Rhydon'],
  },
  {
    name: 'Outrage',
    type: 'Dragon',
    category: 'scissors',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Skip: força mesmo Jokenpô nos 2 turnos'],
    description: 'Fúria dracônica incontrolável. Causa 2 de dano por 2 turnos consecutivos (força o mesmo Jokenpô em ambos os turnos).',
    mechanic: 'damage: 2. eff.uniqueSkipThisTurn = true (simplificado — força recharge 1 turno).',
    status: 'partial',
    pokemonOwners: ['Dragonite'],
  },

  // ── Dano com recuo ──────────────────────────────────────────────────────────

  {
    name: 'Flare Blitz',
    type: 'Fire',
    category: 'paper',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Recuo: atacante perde 1 coração'],
    description: 'Carrega em chamas com recuo. Causa 2 de dano ao vencer, mas Flareon sofre 1 de dano de recuo.',
    mechanic: 'damage: 2, recoil: 1 → newPHearts = max(0, pf.hearts - 1).',
    status: 'done',
    pokemonOwners: ['Flareon'],
  },
  {
    name: 'High Jump Kick',
    type: 'Fighting',
    category: 'rock',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Se perder: atacante perde 1 coração (recoil on miss)'],
    description: 'Chute voador devastador. Se vencer, causa 2 de dano. Se perder, Hitmonlee sofre 1 de dano a si mesmo.',
    mechanic: 'damage: 2 on win. Se enemy_wins e move foi HJK: recoil = 1. Recoil on lose não implementado — requer rastreamento de move específico no branch enemy_wins.',
    status: 'partial',
    pokemonOwners: ['Hitmonlee'],
  },
  {
    name: 'Explosion',
    type: 'Normal',
    category: 'scissors',
    formula: 'self_ko',
    damage: 3,
    sideEffects: ['Atacante é derrotado (KO próprio)'],
    description: 'Explosão catastrófica. Causa 3 de dano ao inimigo se vencer, mas o usuário também perde toda a energia.',
    mechanic: 'damage: 3. newPHearts = 0 (Golem: recoil 2; Electrode: recoil = pf.hearts). KO próprio não implementado — atualmente trata como recoil fixo.',
    status: 'partial',
    pokemonOwners: ['Golem', 'Electrode'],
  },

  // ── Crítico ──────────────────────────────────────────────────────────────────

  {
    name: 'Slash',
    type: 'Normal',
    category: 'scissors',
    formula: 'crit_chance',
    damage: '1 ou 2 (50% crit)',
    sideEffects: [],
    description: 'Sempre tem chance elevada de crítico. Se vencer, tem 50% de chance de causar 2 de dano em vez de 1.',
    mechanic: 'Math.random() < 0.5 → damage: 2 / damage: 1.',
    status: 'done',
    pokemonOwners: ['Scyther', 'Charmeleon (move)', 'Sandslash (move)', 'Kabutops (move)'],
  },
  {
    name: 'Cross Chop',
    type: 'Fighting',
    category: 'rock',
    formula: 'crit_chance',
    damage: '1 ou 2 (50% crit)',
    sideEffects: [],
    description: 'Golpe cruzado com chance de crítico. Se vencer, tem 50% de chance de causar 2 de dano em vez de 1.',
    mechanic: 'Igual ao Slash: Math.random() < 0.5 → damage: 2.',
    status: 'done',
    pokemonOwners: ['Primeape'],
  },
  {
    name: 'Stick',
    type: 'Normal',
    category: 'rock',
    formula: 'crit_chance',
    damage: '1 ou 2 (33% crit)',
    sideEffects: [],
    description: 'Golpe com o galho sagrado. Tem 33% de chance de crítico a cada turno — se crítico, causa 2 de dano.',
    mechanic: 'Math.random() < 0.33 → damage: 2. Usar caso "Stick" no calcUniqueDamage.',
    status: 'pending',
    pokemonOwners: ["Farfetch'd"],
  },
  {
    name: 'Guillotine',
    type: 'Normal',
    category: 'rock',
    formula: 'chance_ko',
    damage: '2 ou KO (25% KO)',
    sideEffects: [],
    description: 'Golpe da guilhotina. 25% de chance de KO instantâneo ao vencer. Se não KO, causa 2 de dano normal.',
    mechanic: 'Math.random() < 0.25 → damage = ef.hearts. Else → damage: 2. Não implementado no switch.',
    status: 'pending',
    pokemonOwners: ['Kingler'],
  },

  // ── Baseado em HP / estado ──────────────────────────────────────────────────

  {
    name: 'Super Fang',
    type: 'Normal',
    category: 'paper',
    formula: 'half_hp',
    damage: 'ceil(ef.hearts / 2)',
    sideEffects: [],
    description: 'Morde tão forte que reduz os corações do inimigo à metade se vencer no Jokenpô.',
    mechanic: 'damage = Math.max(1, Math.ceil(defender.hearts / 2)).',
    status: 'done',
    pokemonOwners: ['Raticate'],
  },
  {
    name: 'Seismic Toss',
    type: 'Fighting',
    category: 'rock',
    formula: 'floor_based',
    damage: 'min(floor+1, 3) — mín. 1',
    sideEffects: [],
    description: 'Arremesso baseado no andar atual da torre. Causa dano igual ao número do andar (mín. 1, máx. 3).',
    mechanic: 'damage = Math.max(1, Math.min(floor + 1, 3)).',
    status: 'done',
    pokemonOwners: ['Pinsir'],
  },

  // ── Cura ────────────────────────────────────────────────────────────────────

  {
    name: 'Soft-Boiled',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_heal',
    damage: 0,
    sideEffects: ['Cura atacante em 2 corações'],
    description: 'Chansey usa scissors para se curar. Se vencer, recupera 2 corações em vez de causar dano.',
    mechanic: 'damage: 0. healPlayer: 2 → newPHearts = min(pf.hearts + 2, pf.pokemon.hearts).',
    status: 'done',
    pokemonOwners: ['Chansey'],
  },
  {
    name: 'Rest',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_heal',
    damage: 0,
    sideEffects: ['Cura total (3 corações)', 'Jogador dorme 2 turnos (✊ automático)'],
    description: 'Dorme profundamente recuperando toda a saúde (3 corações), mas fica dormindo por 2 turnos usando rock automaticamente.',
    mechanic: 'damage: 0. healPlayer: 999 → newPHearts = pf.pokemon.hearts. playerSleep: 2.',
    status: 'done',
    pokemonOwners: ['Snorlax'],
  },
  {
    name: 'Aqua Ring',
    type: 'Water',
    category: 'paper',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Cura passiva: +1 coração a cada 2 turnos'],
    description: 'Envolve-se em água curativa. A cada 2 turnos, recupera 1 coração automaticamente durante a batalha.',
    mechanic: 'Precisa de efeito periódico: turno % 2 === 0 → pf.hearts += 1. Não implementado — requer estado de turno-de-ativação.',
    status: 'pending',
    pokemonOwners: ['Vaporeon'],
  },
  {
    name: 'Leech Life',
    type: 'Bug',
    category: 'rock',
    formula: 'type_effective',
    damage: '1 + heal 1',
    sideEffects: ['Cura atacante em 1 coração ao vencer'],
    description: 'Suga a energia vital do inimigo. Se vencer, recupera 1 coração além de causar o dano normal.',
    mechanic: 'damage via type_effective. healPlayer: 1. Não implementado no switch (usa default).',
    status: 'pending',
    pokemonOwners: ['Golbat'],
  },

  // ── Status: sleep ─────────────────────────────────────────────────────────

  {
    name: 'Lovely Kiss',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_status',
    damage: 1,
    sideEffects: ['Inimigo dorme 2 turnos (✊ automático)'],
    description: 'Beijo amaldiçoado. Se vencer, o inimigo dorme por 2 turnos (usa rock automaticamente enquanto dorme).',
    mechanic: 'damage: 1. enemySleep: 2 → eff.enemySleepTurnsLeft = 2.',
    status: 'done',
    pokemonOwners: ['Jynx'],
  },
  {
    name: 'Spore',
    type: 'Grass',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Inimigo dorme 1 turno'],
    description: 'Nuvem de esporos adormecedores. Se vencer, o inimigo dorme por 1 turno e não escolhe ação (usa rock por padrão).',
    mechanic: 'damage: 0. enemySleep: 1. Usar no switch como enemySleep: 1.',
    status: 'pending',
    pokemonOwners: ['Parasect'],
  },
  {
    name: 'Dream Eater',
    type: 'Psychic',
    category: 'paper',
    formula: 'zero_heal',
    damage: 2,
    sideEffects: ['Só funciona se inimigo dormindo', 'Cura atacante em 2'],
    description: 'Devora os sonhos do inimigo dormindo. Só funciona se inimigo estiver dormindo; se sim, causa 2 de dano e recupera 2 corações.',
    mechanic: 'Verificar eff.enemySleepTurnsLeft > 0: damage: 2 + healPlayer: 2. Else: damage: 0.',
    status: 'pending',
    pokemonOwners: ['Hypno'],
  },

  // ── Status: forçar movimento ────────────────────────────────────────────────

  {
    name: 'Hurricane',
    type: 'Flying',
    category: 'scissors',
    formula: 'zero_status',
    damage: 1,
    sideEffects: ['Inimigo repete mesmo Jokenpô por 1 turno'],
    description: 'Tempestade de vento que confunde o inimigo. Se vencer, o inimigo usa o mesmo Jokenpô do turno anterior no próximo turno.',
    mechanic: 'damage: 1. forceEnemyMove: enemyMove (o RPS deste turno), forceTurns: 1.',
    status: 'done',
    pokemonOwners: ['Pidgeot'],
  },
  {
    name: 'Glare',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Inimigo repete mesmo Jokenpô por 2 turnos'],
    description: 'O padrão aterrorizante do escudo paralisa o inimigo. Se vencer, o inimigo repete o mesmo Jokenpô por 2 turnos.',
    mechanic: 'damage: 0. forceEnemyMove: enemyMove, forceTurns: 2.',
    status: 'done',
    pokemonOwners: ['Arbok'],
  },
  {
    name: 'Rock Slide',
    type: 'Rock',
    category: 'rock',
    formula: 'zero_status',
    damage: 1,
    sideEffects: ['30% chance: inimigo usa ✊ no próximo turno'],
    description: 'Queda de pedras que pode assustar. Se vencer, 30% de chance de o inimigo ficar aterrorizado e usar rock automaticamente no próximo turno.',
    mechanic: 'damage: 1. Math.random() < 0.3 → forceEnemyMove: "rock", forceTurns: 1.',
    status: 'done',
    pokemonOwners: ['Aerodactyl'],
  },
  {
    name: 'Thrash',
    type: 'Normal',
    category: 'rock',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Força mesmo Jokenpô por 2 turnos (inclui atacante)'],
    description: 'Ataca sem parar por 2 turnos consecutivos, forçando o mesmo Jokenpô em ambos. Causa 2 de dano se ambos vencerem.',
    mechanic: 'damage: 2. Implementado como skipNext (recharge 1 turno). Duplo turno forçado não implementado.',
    status: 'partial',
    pokemonOwners: ['Nidoking'],
  },

  // ── KO condicional ──────────────────────────────────────────────────────────

  {
    name: 'Sheer Cold',
    type: 'Ice',
    category: 'scissors',
    formula: 'instant_ko_cond',
    damage: 'ef.hearts se Water/Grass/Flying/Dragon, else 1',
    sideEffects: [],
    description: 'Frio absoluto. Se vencer e o inimigo for do tipo Água, Grama, Voador ou Dragão, causa KO instantâneo.',
    mechanic: 'defType1/2 ∈ [Water, Grass, Flying, Dragon] → damage = defender.hearts. Else → damage: 1.',
    status: 'done',
    pokemonOwners: ['Dewgong', 'Articuno'],
  },
  {
    name: 'Fissure',
    type: 'Ground',
    category: 'scissors',
    formula: 'instant_ko_cond',
    damage: 'ef.hearts se Ground/Rock/Steel, else 1',
    sideEffects: [],
    description: 'Abre uma fenda no solo. Se vencer e o inimigo for do tipo Terra, Rock ou Aço, causa derrota instantânea (KO).',
    mechanic: 'defType1/2 ∈ [Ground, Rock, Steel] → damage = defender.hearts. Não implementado no switch.',
    status: 'pending',
    pokemonOwners: ['Dugtrio'],
  },

  // ── Win-on-tie ──────────────────────────────────────────────────────────────

  {
    name: 'Mach Punch',
    type: 'Fighting',
    category: 'paper',
    formula: 'win_on_tie',
    damage: 1,
    sideEffects: ['Vence empates'],
    description: 'Soco mais rápido que a luz. Ao empatar no Jokenpô, Hitmonchan vence e causa 1 de dano.',
    mechanic: 'WIN_ON_TIE_MOVES.has("Mach Punch") → se tie, outcome = "player_wins". damage via type_effective.',
    status: 'done',
    pokemonOwners: ['Hitmonchan'],
  },
  {
    name: 'Aqua Jet',
    type: 'Water',
    category: 'scissors',
    formula: 'win_on_tie',
    damage: 1,
    sideEffects: ['Vence empates'],
    description: 'Jato de água ultra rápido. Ao empatar no Jokenpô, Kabutops vence o empate e causa 1 de dano.',
    mechanic: 'WIN_ON_TIE_MOVES.has("Aqua Jet") → se tie, outcome = "player_wins". damage via type_effective.',
    status: 'done',
    pokemonOwners: ['Kabutops'],
  },
  {
    name: 'Pin Missile',
    type: 'Bug',
    category: 'rock',
    formula: 'win_on_tie',
    damage: 1,
    sideEffects: ['Vence empates'],
    description: 'Dispara 2 a 5 agulhadas. Ao empatar no Jokenpô, ainda causa 1 de dano (pelo menos 1 agulha acerta).',
    mechanic: 'WIN_ON_TIE_MOVES.has("Pin Missile") → se tie, outcome = "player_wins". damage via type_effective.',
    status: 'done',
    pokemonOwners: ['Beedrill', 'Jolteon'],
  },
  {
    name: 'Swift',
    type: 'Normal',
    category: 'paper',
    formula: 'win_on_tie',
    damage: 1,
    sideEffects: ['Vence empates'],
    description: 'Ataque que nunca erra. Se houver empate no Jokenpô, ainda causa 1 de dano ao inimigo.',
    mechanic: 'Adicionar "Swift" ao WIN_ON_TIE_MOVES. Não incluído atualmente.',
    status: 'pending',
    pokemonOwners: ['Persian'],
  },
  {
    name: 'ExtremeSpeed',
    type: 'Normal',
    category: 'paper',
    formula: 'win_on_tie',
    damage: 1,
    sideEffects: ['Vence empates'],
    description: 'Velocidade extrema que age antes de qualquer coisa. Ao empatar no Jokenpô, Arcanine vence o empate e causa 1 de dano.',
    mechanic: 'Adicionar "ExtremeSpeed" ao WIN_ON_TIE_MOVES.',
    status: 'pending',
    pokemonOwners: ['Arcanine'],
  },

  // ── Boost / debuff ──────────────────────────────────────────────────────────

  {
    name: 'Sky Attack',
    type: 'Flying',
    category: 'scissors',
    formula: 'type_effective',
    damage: '2 (3 vs Grass/Bug)',
    sideEffects: [],
    description: 'Mergulho em chamas lendário. Causa 2 de dano ao vencer. Se o inimigo for do tipo Grama ou Bug, causa 3 de dano.',
    mechanic: 'defType ∈ [Grass, Bug] → damage: 3. Else → damage: 2.',
    status: 'done',
    pokemonOwners: ['Moltres', 'MissingNo. (move)'],
  },
  {
    name: 'Megahorn',
    type: 'Bug',
    category: 'rock',
    formula: 'type_effective',
    damage: '2 (3 vs Psychic)',
    sideEffects: [],
    description: 'Chifrada mega poderosa. Se vencer contra um Pokémon Psíquico ou Escuro, causa 3 de dano.',
    mechanic: 'defType ∈ [Psychic] → damage: 3. Else → damage: 2. (Dark não no PokemonType atual)',
    status: 'done',
    pokemonOwners: ['Seaking'],
  },
  {
    name: 'Petal Dance',
    type: 'Grass',
    category: 'rock',
    formula: 'fixed',
    damage: 3,
    sideEffects: [],
    description: 'Desencadeia 3 pétalas em sequência. Cada pétala causa 1 de dano extra se vencer no Jokenpô.',
    mechanic: 'damage: 3. Implementado como dano fixo.',
    status: 'done',
    pokemonOwners: ['Venusaur'],
  },
  {
    name: 'Ancient Power',
    type: 'Rock',
    category: 'rock',
    formula: 'type_effective',
    damage: '1 (20%: +1 todos ataques por 3 turnos)',
    sideEffects: ['20% chance: boost +1 todos ataques por 3 turnos'],
    description: 'Poder ancestral que pode aumentar todos os atributos. Se vencer, 20% de chance de causar +1 de dano em todos os ataques pelos próximos 3 turnos.',
    mechanic: 'Math.random() < 0.2 → damage: 2 / damage: 1. Global buff não implementado — simplificado para +1 dano neste turno.',
    status: 'partial',
    pokemonOwners: ['Omastar'],
  },
  {
    name: 'Flame Charge',
    type: 'Fire',
    category: 'scissors',
    formula: 'type_effective',
    damage: '+1 por vitória consecutiva (max +3)',
    sideEffects: ['Acumula velocidade: +1 dano por vitória seguida'],
    description: 'Carrega em chamas acumulando velocidade. A cada vitória consecutiva no Jokenpô, causa +1 de dano extra (acumula até +3).',
    mechanic: 'Requer streak counter: winStreak++. damage = 1 + min(winStreak, 3). Não implementado.',
    status: 'pending',
    pokemonOwners: ['Rapidash'],
  },
  {
    name: 'Shell Smash',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['+1 dano ofensivo por 3 turnos', '+1 dano sofrido por 3 turnos'],
    description: 'Quebra a própria concha liberando toda a potência. Por 3 turnos, todos os ataques causam +1 de dano, mas defesa cai (recebe +1 de dano).',
    mechanic: 'Requer buff/debuff de turno múltiplo. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Cloyster'],
  },

  // ── Especiais / Complexos ───────────────────────────────────────────────────

  {
    name: 'Perish Song',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Após 3 turnos: ambos os Pokémon ativos são derrotados'],
    description: 'Melodia amaldiçoada. Após 3 turnos do uso, tanto Lapras quanto o inimigo ativo são derrotados simultaneamente.',
    mechanic: 'Requer contador de turnos: em turno N+3 → ambos hearts = 0. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Lapras'],
  },
  {
    name: 'Destiny Bond',
    type: 'Ghost',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Se KO\'d no próximo turno: inimigo também é KO\'d'],
    description: 'Liga os destinos. Se Weezing for derrotado no próximo turno, o inimigo também é derrotado imediatamente.',
    mechanic: 'eff.destinyBond = true. Se pf.hearts <= 0 e destinyBond: ef.hearts = 0 também. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Weezing'],
  },
  {
    name: 'Transform',
    type: 'Normal',
    category: 'rock',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Copia tipo, moves e habilidade do inimigo'],
    description: 'Transforma-se no inimigo: copia tipo, moves e habilidade. Após a cópia, age como o Pokémon copiado por toda a batalha.',
    mechanic: 'pf.pokemon = { ...ef.pokemon }. Requer re-render do card. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Ditto', 'Mew'],
  },
  {
    name: 'Conversion',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Muda próprio tipo para tipo do último ataque vencedor'],
    description: 'Muda seu tipo para o tipo do último ataque vencedor. A imunidade e resistências mudam junto pelo resto da batalha.',
    mechanic: 'pf.pokemon.type1 = lastWinningAttackType. Requer rastreamento de tipo de ataque vencedor. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Porygon'],
  },
  {
    name: 'Wrap',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_status',
    damage: '1/turno por 3 turnos',
    sideEffects: ['Dano periódico 3 turnos', 'Bloqueia switch do inimigo'],
    description: 'Enrolado e preso. Se vencer, o inimigo perde 1 coração por turno por 3 turnos e não pode trocar de Pokémon.',
    mechanic: 'Requer eff.enemyWrappedTurns = 3, aplicar -1 heart/turno, bloquear troca. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Lickitung'],
  },
  {
    name: 'Bind',
    type: 'Normal',
    category: 'paper',
    formula: 'zero_status',
    damage: '1/turno por 3 turnos',
    sideEffects: ['Dano periódico 3 turnos', 'Bloqueia switch do inimigo'],
    description: 'Envolve o inimigo com cipós. Se vencer, o inimigo perde 1 coração por turno por 3 turnos e não pode trocar.',
    mechanic: 'Igual a Wrap. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Tangela'],
  },
  {
    name: 'Future Sight',
    type: 'Psychic',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Prevê RPS do próximo turno; se acertar = 2 dano'],
    description: 'Prevê o futuro: escolhe o Jokenpô do próximo turno agora. Se acertar a previsão, causa 2 de dano.',
    mechanic: 'Requer salvar previsão e verificar no turno seguinte. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Alakazam'],
  },
  {
    name: 'No Retreat',
    type: 'Fighting',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['+1 dano por 3 turnos', 'Bloqueia switch do jogador por 3 turnos'],
    description: 'Compromete-se totalmente ao ataque. Causa +1 de dano por 3 turnos, mas não pode usar Switch durante esse tempo.',
    mechanic: 'eff.noRetreatTurns = 3, playerDmgBoost = +1/turno, switchBlocked = true. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Machamp'],
  },

  // ── Ataques do banco / multi-alvo ──────────────────────────────────────────

  {
    name: 'Hyper Voice',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_status',
    damage: '1 (active) + 1 cada benchmon',
    sideEffects: ['Dano ao banco inimigo inteiro'],
    description: 'Grito ensurdecedor que atinge o banco inimigo. Se vencer, todos os inimigos no banco perdem 1 coração.',
    mechanic: 'damage: 1 (active). Para cada ef em enemyFighters com i !== enemyIdx e hearts > 0: hearts -= 1. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Wigglytuff'],
  },
  {
    name: 'Earthquake',
    type: 'Ground',
    category: 'paper',
    formula: 'type_effective',
    damage: '1 (active) + 1 bench',
    sideEffects: ['Dano adicional de 1 ao próximo Pokémon do banco'],
    description: 'Abala o solo com força extrema. Se vencer, causa dano a todos os inimigos no banco também (1 de dano extra).',
    mechanic: 'damage normal por type_effective ao ativo. +1 ao primeiro benchmon. Bench damage não implementado.',
    status: 'partial',
    pokemonOwners: ['Sandslash'],
  },

  // ── Misc / Complexos ─────────────────────────────────────────────────────────

  {
    name: 'Tri Attack',
    type: 'Normal',
    category: 'scissors',
    formula: 'type_effective',
    damage: 1,
    sideEffects: ['Sorteia queimadura, paralisia ou congelamento por 1 turno'],
    description: 'Ataca com 3 elementos ao mesmo tempo. Ao vencer, sorteia entre queimadura, paralisia ou congelamento (1 turno cada).',
    mechanic: 'damage: 1. Status sorteado: burn/paralysis/freeze por 1 turno. Não implementado — requer sistema de status variado.',
    status: 'pending',
    pokemonOwners: ['Magneton'],
  },
  {
    name: 'Thunder Punch',
    type: 'Electric',
    category: 'paper',
    formula: 'type_effective',
    damage: '1 (33% paralisia 1 turno)',
    sideEffects: ['33% chance paralisia 1 turno'],
    description: 'Soco elétrico poderoso. Se vencer, 33% de chance de paralisar o inimigo por 1 turno.',
    mechanic: 'Math.random() < 0.33 → eff.enemyForcedMove = "rock", forceTurns: 1 (simulando paralisia). Não implementado no switch.',
    status: 'pending',
    pokemonOwners: ['Electabuzz'],
  },
  {
    name: 'Power Gem',
    type: 'Rock',
    category: 'rock',
    formula: 'type_effective',
    damage: '1 + tipo extra aleatório',
    sideEffects: ['Tipo extra sorteado — pode ser super efetivo'],
    description: 'Dispara raios da joia central. Se vencer, escolhe um tipo extra aleatório para o ataque — podendo ser super efetivo no inimigo.',
    mechanic: 'Sortear PokemonType aleatório, combinar multiplicador. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Starmie'],
  },
  {
    name: 'Parental Bond',
    type: 'Normal',
    category: 'rock',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['2 golpes de 1 cada (calculados separadamente)'],
    description: 'Ataca duas vezes: mãe e filhote juntos. Vencer causa 2 de dano total (1 por golpe), mas cada golpe é calculado separadamente.',
    mechanic: 'damage: 2. Simplificado como dano fixo 2.',
    status: 'done',
    pokemonOwners: ['Kangaskhan'],
  },
  {
    name: 'Bone Rush',
    type: 'Ground',
    category: 'paper',
    formula: 'type_effective',
    damage: '2–5 (1 por acerto)',
    sideEffects: ['Número de acertos aleatório: 2–5'],
    description: 'Golpeia com o osso de 2 a 5 vezes. Cada acerto que ganhar no Jokenpô causa 1 de dano.',
    mechanic: 'hits = random(2, 5). Usar type_effective por acerto. Simplificado como damage: 2.',
    status: 'partial',
    pokemonOwners: ['Marowak'],
  },
  {
    name: 'Quiver Dance',
    type: 'Bug',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['+1 dano nos próximos 2 ataques vencedores'],
    description: 'Dança e potencializa os próximos 2 ataques, causando +1 de dano em cada vitória do Jokenpô.',
    mechanic: 'eff.quiverDanceTurns = 2, aplicar +1 quando ganhar. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Butterfree'],
  },
  {
    name: 'Acid Spray',
    type: 'Poison',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Inimigo toma +1 de dano em TODOS os ataques no próximo turno'],
    description: 'Spray corrosivo que enfraquece defesas. Se vencer, o inimigo toma +1 de dano em todos os ataques pelo próximo turno.',
    mechanic: 'eff.enemyDefenseReduced = true (por 1 turno). Não implementado.',
    status: 'pending',
    pokemonOwners: ['Tentacruel'],
  },
  {
    name: 'Acid Armor',
    type: 'Poison',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Imune a ataques físicos por 2 turnos'],
    description: 'Dissolve completamente sua forma. Por 2 turnos, todos os ataques físicos inimigos causam 0 de dano (imunidade).',
    mechanic: 'eff.acidArmorTurns = 2: playerDmg = 0 enquanto ativo. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Muk'],
  },
  {
    name: 'Shadow Ball',
    type: 'Ghost',
    category: 'rock',
    formula: 'type_effective',
    damage: 1,
    sideEffects: ['Ignora habilidades e imunidades do inimigo'],
    description: 'Esfera de trevas que atravessa qualquer barreira. Se vencer, ignora as habilidades passivas e imunidades do inimigo neste turno.',
    mechanic: 'damage via type_effective mas bypass immune check. Não implementado — usa default type_effective.',
    status: 'partial',
    pokemonOwners: ['Gengar'],
  },
  {
    name: 'Slack Off',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Se perder no RPS: 50% chance de não sofrer dano'],
    description: 'Tão lento que confunde a IA inimiga. Se perder no Jokenpô, a IA ignora o dano com 50% de chance (ele dormiu no golpe).',
    mechanic: 'Em enemy_wins: Math.random() < 0.5 → playerDmg = 0. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Slowbro'],
  },
  {
    name: 'Psybeam',
    type: 'Psychic',
    category: 'rock',
    formula: 'type_effective',
    damage: '1 + confusão',
    sideEffects: ['Inimigo confuso: RPS aleatório no próximo turno'],
    description: 'Raio psíquico confuso. Se vencer, o inimigo fica confuso e escolhe um Jokenpô aleatório no próximo turno.',
    mechanic: 'damage via type_effective. forceEnemyMove: ALL_RPS[random] por 1 turno (ou resetar AI). Não implementado.',
    status: 'pending',
    pokemonOwners: ['Venomoth'],
  },
  {
    name: 'Drill Run',
    type: 'Normal',
    category: 'rock',
    formula: 'type_effective',
    damage: '2 se tipo é fraco a Normal, else 1',
    sideEffects: [],
    description: 'Ataca em espiral perfurante. Se o tipo do inimigo for fraco a Normal, causa 2 de dano ao vencer.',
    mechanic: 'getCombinedMultiplier("Normal", defType1, defType2) >= 2 → damage: 2. Não implementado no switch.',
    status: 'pending',
    pokemonOwners: ['Fearow'],
  },
  {
    name: 'Zen Headbutt',
    type: 'Psychic',
    category: 'rock',
    formula: 'type_effective',
    damage: 1,
    sideEffects: ['Ignora habilidade passiva do inimigo neste turno'],
    description: 'Golpe psíquico poderoso. Se vencer, ignora qualquer habilidade passiva do inimigo neste turno.',
    mechanic: 'damage via type_effective. Immune check bypassado. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Golduck'],
  },
  {
    name: 'Earth Power',
    type: 'Ground',
    category: 'paper',
    formula: 'type_effective',
    damage: 1,
    sideEffects: ['Ignora imunidade Levitate de tipo Voador'],
    description: 'Poder sísmico que ignora o tipo voador do inimigo. Sempre causa dano normal a pokémons do tipo Voador.',
    mechanic: 'Se defType ∈ [Flying]: use Ground vs defType2 apenas (ignora Flying). Não implementado.',
    status: 'pending',
    pokemonOwners: ['Nidoqueen'],
  },
  {
    name: 'Egg Bomb',
    type: 'Normal',
    category: 'scissors',
    formula: 'type_effective',
    damage: '1 (50% atordoa: força mesmo RPS)',
    sideEffects: ['50% chance: inimigo repete RPS do turno anterior'],
    description: 'Lança bombas-ovo em sequência. Se vencer, 50% de chance de atordoar o inimigo (usa o mesmo Jokenpô do turno anterior).',
    mechanic: 'Math.random() < 0.5 → forceEnemyMove: enemyMove, forceTurns: 1. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Exeggutor'],
  },
  {
    name: 'Barrier',
    type: 'Psychic',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Por 2 turnos: ataques perdidos causam 0 dano'],
    description: 'Ergue uma barreira invisível. Por 2 turnos, ataques que perderem no Jokenpô causam 0 de dano em vez do normal.',
    mechanic: 'eff.barrierTurns = 2: em enemy_wins, playerDmg = 0. Não implementado.',
    status: 'pending',
    pokemonOwners: ['Mr. Mime'],
  },
  {
    name: 'Metronome',
    type: 'Normal',
    category: 'paper',
    formula: 'type_effective',
    damage: '1 (tipo sorteado aleatório)',
    sideEffects: ['Tipo sorteado no reveal — pode ser super efetivo'],
    description: 'Usa um ataque aleatório de qualquer tipo. O tipo é sorteado no momento do reveal, podendo ser super efetivo.',
    mechanic: 'attackType = ALL_TYPES[random]. getCombinedMultiplier(randomType, defType1, defType2). Não implementado.',
    status: 'pending',
    pokemonOwners: ['Clefable'],
  },
  {
    name: 'Petal Blizzard',
    type: 'Grass',
    category: 'rock',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Envenenamento: +1 dano por turno por 2 turnos'],
    description: 'Tempestade de pétalas venenosas. Se vencer, envenena o inimigo causando 1 de dano extra por turno por 2 turnos.',
    mechanic: 'damage: 2. eff.enemyPoisonTurns = 2: -1 heart/turno. Não implementado.',
    status: 'partial',
    pokemonOwners: ['Vileplume'],
  },
  {
    name: 'Leaf Storm',
    type: 'Grass',
    category: 'rock',
    formula: 'fixed',
    damage: 2,
    sideEffects: ['Próximo ataque de Grama do atacante causa apenas 1 dano base'],
    description: 'Furacão de folhas afiadas. Causa 2 de dano se vencer, mas reduz o próprio poder: próximo ataque de Grama causa 1 de dano base.',
    mechanic: 'damage: 2. eff.grassDebuffTurns = 1. Não implementado — requer debuff de tipo próprio.',
    status: 'partial',
    pokemonOwners: ['Victreebel'],
  },
  {
    name: 'Stick',
    type: 'Normal',
    category: 'rock',
    formula: 'crit_chance',
    damage: '1 ou 2 (33% crit)',
    sideEffects: [],
    description: 'Golpe com o galho sagrado. Tem 33% de chance de crítico a cada turno — se crítico, causa 2 de dano.',
    mechanic: 'Math.random() < 0.33 → damage: 2 / damage: 1. Adicionar case no switch.',
    status: 'pending',
    pokemonOwners: ["Farfetch'd"],
  },
  {
    name: 'Perish Song',
    type: 'Normal',
    category: 'scissors',
    formula: 'zero_status',
    damage: 0,
    sideEffects: ['Em 3 turnos: ambos hearts = 0'],
    description: 'Melodia amaldiçoada. Após 3 turnos do uso, tanto Lapras quanto o inimigo ativo são derrotados simultaneamente.',
    mechanic: 'eff.perishSongTurns = 3. Em cada turno: decrement. Se chegar a 0: playerFighters[playerIdx].hearts = 0 e ef.hearts = 0.',
    status: 'pending',
    pokemonOwners: ['Lapras'],
  },
]

// ─── Helpers de lookup ────────────────────────────────────────────────────────

export function getAbilityDef(name: string): AbilityDef | undefined {
  return ABILITY_CATALOG.find(a => a.name === name)
}

export function getUniqueMoveDef(name: string): UniqueMoveDef | undefined {
  return UNIQUE_MOVE_CATALOG.find(u => u.name === name)
}

export function getPendingMechanics(): { abilities: AbilityDef[]; moves: UniqueMoveDef[] } {
  return {
    abilities: ABILITY_CATALOG.filter(a => a.status !== 'done'),
    moves: UNIQUE_MOVE_CATALOG.filter(u => u.status !== 'done'),
  }
}

export function getDoneMechanics(): { abilities: AbilityDef[]; moves: UniqueMoveDef[] } {
  return {
    abilities: ABILITY_CATALOG.filter(a => a.status === 'done'),
    moves: UNIQUE_MOVE_CATALOG.filter(u => u.status === 'done'),
  }
}
