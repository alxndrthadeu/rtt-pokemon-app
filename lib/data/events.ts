import { makePokemonCard } from './pokemon'
import type { PokemonCard, PokemonType, AILevel, ConsumableId } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type LegendaryKey = 'zapdos' | 'articuno' | 'moltres' | 'mewtwo'
export type RocketGruntId = 'grunt-a' | 'grunt-b' | 'grunt-c'

export interface SpecialBattleConfig {
  type: 'legendary' | 'rocket'
  opponentName: string
  specialtyType: PokemonType
  aiLevel: AILevel
  fighters: PokemonCard[]
  // legendary
  legendaryKey?: LegendaryKey
  legendaryTeamCard?: PokemonCard   // 5♥ version that joins the team
  // rocket
  gruntId?: RocketGruntId
  coinsOnWin: number
  itemOnWin?: ConsumableId
  lore: string
  locationName: string
}

// ─── Legendary events ─────────────────────────────────────────────────────────

interface LegendaryEventDef {
  key: LegendaryKey
  pokemonId: number
  name: string
  type: PokemonType
  triggerFloor: number
  chance: number
  lore: string
  locationName: string
}

const LEGENDARY_EVENT_DEFS: LegendaryEventDef[] = [
  {
    key: 'zapdos',
    pokemonId: 145,
    name: 'Zapdos',
    type: 'Electric',
    triggerFloor: 4,
    chance: 0.35,
    lore: 'Um clarão ilumina o céu de Vermilion. Zapdos, o Pokémon Elétrico Lendário, pousa diante de você com asas relampejantes. Uma chance única — e arriscada.',
    locationName: 'Power Plant',
  },
  {
    key: 'articuno',
    pokemonId: 144,
    name: 'Articuno',
    type: 'Ice',
    triggerFloor: 5,
    chance: 0.35,
    lore: 'Uma brisa congelante varre Saffron. Articuno, o Pokémon Gelar Lendário, surge entre névoas de gelo ancestral e fixa seus olhos em você.',
    locationName: 'Seafoam Islands',
  },
  {
    key: 'moltres',
    pokemonId: 146,
    name: 'Moltres',
    type: 'Fire',
    triggerFloor: 6,
    chance: 0.35,
    lore: 'As chamas de Cinnabar ganham vida própria. Moltres, o Pokémon Chama Lendário, emerge das profundezas vulcânicas com penas que queimam como brasa.',
    locationName: 'Mt. Ember',
  },
  {
    key: 'mewtwo',
    pokemonId: 150,
    name: 'Mewtwo',
    type: 'Psychic',
    triggerFloor: 7,
    chance: 0.35,
    lore: 'Uma presença mental avassaladora envolve Viridian. Mewtwo, o Pokémon Genético, emerge da escuridão com olhos que atravessam a alma. O poder que Giovanni procurava — está aqui.',
    locationName: 'Cerulean Cave',
  },
]

// ─── Rocket grunts ────────────────────────────────────────────────────────────

interface RocketGruntDef {
  id: RocketGruntId
  teamIds: number[]
  heartsPerPokemon: number
  lore: string
  itemOnWin: ConsumableId
}

const ROCKET_GRUNT_DEFS: RocketGruntDef[] = [
  {
    id: 'grunt-a',
    teamIds: [41, 19, 23],        // Zubat, Rattata, Ekans
    heartsPerPokemon: 3,
    lore: '"Alto lá! Ninguém passa por aqui sem pagar pedágio para a Equipe Rocket!"',
    itemOnWin: 'antidote',
  },
  {
    id: 'grunt-b',
    teamIds: [42, 20, 109],       // Golbat, Raticate, Koffing
    heartsPerPokemon: 3.5,
    lore: '"Heehee! A Equipe Rocket não perde tempo com gentilezas. Seu dinheiro ou sua batalha!"',
    itemOnWin: 'full-heal',
  },
  {
    id: 'grunt-c',
    teamIds: [42, 110, 24],       // Golbat, Weezing, Arbok
    heartsPerPokemon: 4,
    lore: '"Você ousou chegar tão longe? Vamos ver se sua coragem resiste ao poder da Equipe Rocket!"',
    itemOnWin: 'super-potion',
  },
]

// ─── Builders ─────────────────────────────────────────────────────────────────

export function buildLegendaryConfig(key: LegendaryKey): SpecialBattleConfig | null {
  const def = LEGENDARY_EVENT_DEFS.find(e => e.key === key)
  if (!def) return null
  const base = makePokemonCard(def.pokemonId)
  if (!base) return null
  return {
    type: 'legendary',
    opponentName: def.name,
    specialtyType: def.type,
    aiLevel: 'adaptive',
    fighters: [{ ...base, hearts: 10 }],
    legendaryKey: key,
    legendaryTeamCard: { ...base, hearts: 5 },
    coinsOnWin: 0,
    lore: def.lore,
    locationName: def.locationName,
  }
}

export function buildRocketConfig(gruntId: RocketGruntId): SpecialBattleConfig | null {
  const def = ROCKET_GRUNT_DEFS.find(g => g.id === gruntId)
  if (!def) return null
  const fighters = def.teamIds
    .map(id => {
      const c = makePokemonCard(id)
      return c ? { ...c, hearts: def.heartsPerPokemon } : null
    })
    .filter((c): c is PokemonCard => c !== null)
  if (fighters.length === 0) return null
  return {
    type: 'rocket',
    opponentName: 'Rocket Grunt',
    specialtyType: 'Poison',
    aiLevel: 'random',
    fighters,
    gruntId,
    coinsOnWin: 4,
    itemOnWin: def.itemOnWin,
    lore: def.lore,
    locationName: 'Equipe Rocket',
  }
}

// ─── Roll ─────────────────────────────────────────────────────────────────────

export function rollForEvent(
  prevFloor: number,
  legendaryEventUsed: boolean,
  guaranteedLegendaryFloor: number | null,
): SpecialBattleConfig | null {
  // Legendary — 100% garantido no andar pré-sorteado (1 por run)
  if (!legendaryEventUsed && guaranteedLegendaryFloor !== null && prevFloor === guaranteedLegendaryFloor) {
    const def = LEGENDARY_EVENT_DEFS.find(e => e.triggerFloor === prevFloor)
    if (def) return buildLegendaryConfig(def.key)
  }
  // Rocket check — floors 3-6, 25% chance (se lendário não disparou)
  if (prevFloor >= 3 && prevFloor <= 6 && Math.random() < 0.25) {
    const gruntId: RocketGruntId =
      prevFloor <= 4 ? 'grunt-a' : prevFloor <= 5 ? 'grunt-b' : 'grunt-c'
    return buildRocketConfig(gruntId)
  }
  return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLegendaryDef(key: LegendaryKey) {
  return LEGENDARY_EVENT_DEFS.find(e => e.key === key)
}
