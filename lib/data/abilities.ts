import type { AbilityDefinition } from '@/types'

export const ABILITIES: Record<string, AbilityDefinition> = {
  'overgrow': {
    id: 'overgrow',
    name: 'Overgrow',
    description: 'Com ≤2 corações, ataques de Grama causam +1 de dano.',
    boostType: 'Grass',
    boostBonus: 1,
    lowHpThreshold: 2,
  },
  'blaze': {
    id: 'blaze',
    name: 'Blaze',
    description: 'Com ≤2 corações, ataques de Fogo causam +1 de dano.',
    boostType: 'Fire',
    boostBonus: 1,
    lowHpThreshold: 2,
  },
  'torrent': {
    id: 'torrent',
    name: 'Torrent',
    description: 'Com ≤2 corações, ataques de Água causam +1 de dano.',
    boostType: 'Water',
    boostBonus: 1,
    lowHpThreshold: 2,
  },
  'water-absorb': {
    id: 'water-absorb',
    name: 'WaterAbsorb',
    description: 'Imune a ataques de Água; ao receber um, recupera 1 coração.',
    absorbType: 'Water',
  },
  'volt-absorb': {
    id: 'volt-absorb',
    name: 'VoltAbsorb',
    description: 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.',
    absorbType: 'Electric',
  },
  'flash-fire': {
    id: 'flash-fire',
    name: 'FlashFire',
    description: 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.',
    immuneType: 'Fire',
    flashFireBoost: true,
  },
  'levitate': {
    id: 'levitate',
    name: 'Levitate',
    description: 'Imune a ataques do tipo Terra.',
    immuneType: 'Ground',
  },
  'sturdy': {
    id: 'sturdy',
    name: 'Sturdy',
    description: 'Com ≥2 corações, sobrevive com 1 coração a um golpe letal. Uma vez por batalha.',
    special: 'sturdy',
  },
  'intimidate': {
    id: 'intimidate',
    name: 'Intimidate',
    description: 'Ao entrar em campo, reduz o próximo ataque inimigo em 1.',
    special: 'intimidate',
  },
  'inner-focus': {
    id: 'inner-focus',
    name: 'InnerFocus',
    description: 'Imune a efeitos de flinch e interrupção de ataque.',
    special: 'inner-focus',
  },
  'no-guard': {
    id: 'no-guard',
    name: 'NoGuard',
    description: 'Todos os ataques acertam, mas o inimigo também não pode errar.',
    special: 'no-guard',
  },
  'synchronize': {
    id: 'synchronize',
    name: 'Synchronize',
    description: 'Quando sofre um status, o inimigo recebe o mesmo status por 1 turno.',
    special: 'synchronize',
  },
  // Mew's Synchronize: every winning attack is super effective
  'synchronize-mew': {
    id: 'synchronize-mew',
    name: 'Synchronize',
    description: 'Todo ataque vencedor de Mew é tratado como super efetivo (causa 2 de dano).',
    special: 'synchronize-mew',
  },
  'imposter': {
    id: 'imposter',
    name: 'Imposter',
    description: 'Ao entrar em campo, copia o tipo e os moves do inimigo ativo.',
    special: 'imposter',
  },
  'glitch': {
    id: 'glitch',
    name: 'Glitch',
    description: 'Bug lendário: ao vencer qualquer Jokenpô, o inimigo é derrotado instantaneamente.',
    special: 'glitch',
  },
  'lightning-rod': {
    id: 'lightning-rod',
    name: 'Lightning Rod',
    description: 'Ao perder no Jokenpô, 40% de chance de absorver o golpe e não sofrer dano.',
    special: 'lightning-rod',
  },
}

export function getAbility(id: string): AbilityDefinition {
  const ab = ABILITIES[id]
  if (!ab) throw new Error(`[RTT] ability not found in catalog: "${id}"`)
  return ab
}
