import type { HeldItemId, ConsumableId } from '@/types'

const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items'

// PokeAPI uses different slugs for some items
const SLUG_MAP: Partial<Record<HeldItemId | ConsumableId, string>> = {
  'kings-rock':    'kings-rock',
  'full-restore':  'full-restore',
  'burn-heal':     'burn-heal',
  'full-heal':     'full-heal',
  'max-revive':    'max-revive',
  'rare-candy':    'rare-candy',
  'super-potion':  'super-potion',
  'hyper-potion':  'hyper-potion',
  'dragon-fang':   'dragon-fang',
}

export function getItemSpriteUrl(id: HeldItemId | ConsumableId): string {
  const slug = SLUG_MAP[id] ?? id
  return `${BASE}/${slug}.png`
}
