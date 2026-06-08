import type { PokemonType } from '@/types'

// Gen 1 original type colors — mesma paleta do jogo original
export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal:   '#A8A878',
  Fire:     '#F08030',
  Water:    '#6890F0',
  Grass:    '#78C850',
  Electric: '#F8D030',
  Ice:      '#98D8D8',
  Fighting: '#C03028',
  Poison:   '#A040A0',
  Ground:   '#E0C068',
  Flying:   '#A890F0',
  Psychic:  '#F85888',
  Bug:      '#A8B820',
  Rock:     '#B8A038',
  Ghost:    '#705898',
  Dragon:   '#7038F8',
  Steel:    '#B8B8D0',
  Fairy:    '#EE99AC',
}

export function getTypeColor(type: PokemonType): string {
  return TYPE_COLORS[type] ?? '#A8A878'
}

// Determina se texto deve ser claro ou escuro sobre a cor do tipo
export function getTypeTextColor(type: PokemonType): string {
  const dark = ['Electric', 'Normal', 'Ground', 'Ice', 'Steel', 'Fairy', 'Bug', 'Rock']
  return dark.includes(type) ? '#2C1810' : '#FBF5E6'
}

export const RARITY_CONFIG = {
  comum:      { label: 'Comum',      dots: 1, color: '#A8A878' },
  rara:       { label: 'Rara',       dots: 2, color: '#6890F0' },
  'ultra-rara': { label: 'Ultra Rara', dots: 3, color: '#F08030' },
  lendaria:   { label: 'Lendária',   dots: 4, color: '#F8D030' },
  epico:      { label: 'Épico',      dots: 5, color: '#F85888' },
} as const

export const RPS_ICON: Record<string, string> = {
  rock:     '✊',
  paper:    '✋',
  scissors: '✌️',
}

export function getSpriteUrl(id: number): string {
  if (id === 0) return '/missingno.png'
  if (id === 9025) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

export function formatPokemonNumber(id: number): string {
  if (id === 0) return '#???'
  if (id === 9025) return '#ASH'
  return `#${String(id).padStart(3, '0')}`
}
