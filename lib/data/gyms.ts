import type { PokemonType, AILevel } from '@/types'
import { makePokemonCard } from './pokemon'
import type { PokemonCard } from '@/types'

export interface GymLeader {
  floor: number           // 0-11
  name: string
  title: string
  badge: string
  specialtyType: PokemonType
  aiLevel: AILevel
  teamIds: number[]       // IDs dos 6 pokémon do time
  postGymDraftPool: number[] // 3 IDs para o swap pós-ginásio
  description: string
}

export const GYM_LEADERS: GymLeader[] = [
  // ─── ANDAR 0 — BROCK ───
  {
    floor: 0,
    name: 'Brock',
    title: 'Líder do Ginásio de Pewter',
    badge: 'Boulder Badge',
    specialtyType: 'Rock',
    aiLevel: 'random',
    teamIds: [74, 95, 111, 75, 112, 76],
    postGymDraftPool: [27, 28, 74],
    description: 'Mestre de Pedra com defesa impenetrável. Studs resistentes que nunca caem num único golpe.',
  },
  // ─── ANDAR 1 — MISTY ───
  {
    floor: 1,
    name: 'Misty',
    title: 'Líder do Ginásio de Cerulean',
    badge: 'Cascade Badge',
    specialtyType: 'Water',
    aiLevel: 'random',
    teamIds: [120, 54, 60, 7, 116, 90],
    postGymDraftPool: [54, 60, 90],
    description: 'Especialista em Água que usa ondas para desgastar o adversário. Poucos conseguem resistir ao fluxo constante.',
  },
  // ─── ANDAR 2 — LT. SURGE ───
  {
    floor: 2,
    name: 'Lt. Surge',
    title: 'Líder do Ginásio de Vermilion',
    badge: 'Thunder Badge',
    specialtyType: 'Electric',
    aiLevel: 'weighted',
    teamIds: [25, 100, 81, 26, 82, 101],
    postGymDraftPool: [25, 81, 100],
    description: 'Veterano que usa ataques Elétricos fulminantes. Começa a adaptar suas escolhas ao padrão do jogador.',
  },
  // ─── ANDAR 3 — ERIKA ───
  {
    floor: 3,
    name: 'Erika',
    title: 'Líder do Ginásio de Celadon',
    badge: 'Rainbow Badge',
    specialtyType: 'Grass',
    aiLevel: 'weighted',
    teamIds: [43, 69, 46, 70, 102, 114],
    postGymDraftPool: [43, 69, 102],
    description: 'Mestre de Grama que usa pós e esporos para controlar o campo. Pesa as escolhas do inimigo.',
  },
  // ─── ANDAR 4 — KOGA ───
  {
    floor: 4,
    name: 'Koga',
    title: 'Líder do Ginásio de Fuchsia',
    badge: 'Soul Badge',
    specialtyType: 'Poison',
    aiLevel: 'adaptive',
    teamIds: [41, 88, 23, 42, 89, 24],
    postGymDraftPool: [41, 88, 109],
    description: 'Ninja que usa venenos e efeitos de status para corroer o adversário. Adapta-se ao estilo de jogo do jogador.',
  },
  // ─── ANDAR 5 — SABRINA ───
  {
    floor: 5,
    name: 'Sabrina',
    title: 'Líder do Ginásio de Saffron',
    badge: 'Marsh Badge',
    specialtyType: 'Psychic',
    aiLevel: 'adaptive',
    teamIds: [96, 122, 63, 97, 64, 65],
    postGymDraftPool: [63, 96, 122],
    description: 'Psíquica que lê a mente do adversário. Usa a adaptação para frustrar movimentos antes que aconteçam.',
  },
  // ─── ANDAR 6 — BLAINE ───
  {
    floor: 6,
    name: 'Blaine',
    title: 'Líder do Ginásio de Cinnabar',
    badge: 'Volcano Badge',
    specialtyType: 'Fire',
    aiLevel: 'predictive',
    teamIds: [77, 58, 78, 59, 126, 136],
    postGymDraftPool: [58, 77, 126],
    description: 'Cientista de Fogo com estratégia impecável. Prevê os movimentos do adversário e responde com precisão cirúrgica.',
  },
  // ─── ANDAR 7 — GIOVANNI ───
  {
    floor: 7,
    name: 'Giovanni',
    title: 'Líder do Ginásio de Viridian / Chefe do Team Rocket',
    badge: 'Earth Badge',
    specialtyType: 'Ground',
    aiLevel: 'predictive',
    teamIds: [111, 51, 31, 34, 105, 112],
    postGymDraftPool: [51, 105, 111],
    description: 'O líder secreto e mais poderoso. Usa Terra para esmagar qualquer resistência com precisão fria e calculada.',
  },
  // ─── ANDAR 8 — LORELEI (Elite 4) ───
  {
    floor: 8,
    name: 'Lorelei',
    title: 'Elite 4 — Mestre de Gelo',
    badge: '',
    specialtyType: 'Ice',
    aiLevel: 'predictive',
    teamIds: [86, 87, 91, 124, 131, 80],  // Seel, Dewgong, Cloyster, Jynx, Lapras, Slowbro
    postGymDraftPool: [],
    description: 'Primeira do Elite 4. Seu gelo implacável congela qualquer estratégia descuidada.',
  },
  // ─── ANDAR 9 — BRUNO (Elite 4) ───
  {
    floor: 9,
    name: 'Bruno',
    title: 'Elite 4 — Mestre de Luta',
    badge: '',
    specialtyType: 'Fighting',
    aiLevel: 'predictive',
    teamIds: [106, 107, 68, 62, 141, 142],  // Hitmonlee, Hitmonchan, Machamp, Poliwrath, Kabutops, Aerodactyl
    postGymDraftPool: [],
    description: 'Segundo do Elite 4. Corpo forjado em batalha — punhos de aço e fósseis implacáveis.',
  },
  // ─── ANDAR 10 — AGATHA (Elite 4) ───
  {
    floor: 10,
    name: 'Agatha',
    title: 'Elite 4 — Mestre de Fantasma',
    badge: '',
    specialtyType: 'Ghost',
    aiLevel: 'predictive',
    teamIds: [94, 93, 92, 42, 110, 89],
    postGymDraftPool: [],
    description: 'Terceira do Elite 4. Usa espíritos antigos para confundir e corroer a mente do adversário.',
  },
  // ─── ANDAR 11 — LANCE (Elite 4) ───
  {
    floor: 11,
    name: 'Lance',
    title: 'Campeão da Liga Pokémon de Kanto',
    badge: '',
    specialtyType: 'Dragon',
    aiLevel: 'predictive',
    teamIds: [147, 148, 149, 130, 116, 131],
    postGymDraftPool: [],
    description: 'O Campeão Dragão. Quem vencer Lance conquista o topo da Torre Reach the Top.',
  },
]

export function getGymByFloor(floor: number): GymLeader | undefined {
  return GYM_LEADERS.find((g) => g.floor === floor)
}

const _gymDeckCache = new Map<number, PokemonCard[]>()

export function buildGymDeck(floor: number): PokemonCard[] {
  const cached = _gymDeckCache.get(floor)
  if (cached) return cached
  const gym = getGymByFloor(floor)
  if (!gym) return []
  const deck = gym.teamIds
    .map((id) => makePokemonCard(id))
    .filter((p): p is PokemonCard => p !== undefined)
  _gymDeckCache.set(floor, deck)
  return deck
}

// Retorna 3 opções de swap pós-ginásio
// Para andares 6+ inclui chance de lendário e MissingNo
export function getPostGymSwapOptions(floor: number): number[] {
  const gym = getGymByFloor(floor)
  if (!gym || gym.postGymDraftPool.length === 0) return []
  return gym.postGymDraftPool
}

export const TOTAL_FLOORS = 12
export const GYM_FLOORS = 8       // andares 0-7
export const ELITE4_START = 8     // andares 8-11
export const LEGENDARY_UNLOCK_AFTER_FLOOR = 6 // lendários disponíveis após o andar 6
