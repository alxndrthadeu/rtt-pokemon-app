import type { HeldItemId, ConsumableId, HeldItem, PokemonType } from '@/types'

// ─── Hold item catalog ────────────────────────────────────────────────────────

export interface HeldItemDef extends HeldItem {
  shopTier: 1 | 2 | 3 | 4   // min floor-tier where this can appear
  shopPrice: number
  // engine effect tags (checked inline in battleEngine)
  passive?: 'leftovers' | 'shell-bell' | 'sitrus-berry' | 'oran-berry'
  onHit?: 'rocky-helmet' | 'life-orb' | 'kings-rock' | 'expert-belt' | 'type-boost'
  onEntry?: 'toxic-orb' | 'flame-orb'
  onStatus?: 'lum-berry'
  onDebuff?: 'white-herb'
  onUnique?: 'scope-lens'
  onReveal?: 'quick-claw'
  typeBoost?: PokemonType   // for type-boost items
}

export const HELD_ITEMS: Record<HeldItemId, HeldItemDef> = {
  // ── Sustain ─────────────────────────────────────────────────────────────────
  'leftovers': {
    id: 'leftovers', name: 'Restos', shopTier: 1, shopPrice: 5,
    description: 'Recupera 0.5♥ a cada 3 turnos em campo.',
    passive: 'leftovers',
  },
  'shell-bell': {
    id: 'shell-bell', name: 'Sino Concha', shopTier: 2, shopPrice: 5,
    description: 'Recupera 0.5♥ sempre que causar dano ao inimigo.',
    passive: 'shell-bell',
  },
  'sitrus-berry': {
    id: 'sitrus-berry', name: 'Sitrus Berry', shopTier: 1, shopPrice: 3,
    description: 'Quando ≤2♥, restaura +1♥ automaticamente. Uso único.',
    passive: 'sitrus-berry',
  },
  'oran-berry': {
    id: 'oran-berry', name: 'Oran Berry', shopTier: 1, shopPrice: 2,
    description: 'Quando ≤1♥, restaura +0.5♥ automaticamente. Uso único.',
    passive: 'oran-berry',
  },

  // ── Defesa / Reação ──────────────────────────────────────────────────────────
  'focus-sash': {
    id: 'focus-sash', name: 'Faixa Foco', shopTier: 3, shopPrice: 7,
    description: 'Se estiver com 5♥ cheios, sobrevive a um golpe fatal com 0.5♥. Uso único.',
    passive: undefined,
  },
  'rocky-helmet': {
    id: 'rocky-helmet', name: 'Capacete Rochoso', shopTier: 2, shopPrice: 5,
    description: 'Ao receber dano ofensivo, o atacante toma 0.5♥ de ricochete.',
    onHit: 'rocky-helmet',
  },
  'lum-berry': {
    id: 'lum-berry', name: 'Lum Berry', shopTier: 1, shopPrice: 4,
    description: 'Cura automaticamente o primeiro status recebido (veneno, queimadura, sono, etc.). Uso único.',
    onStatus: 'lum-berry',
  },
  'white-herb': {
    id: 'white-herb', name: 'Erva Branca', shopTier: 2, shopPrice: 4,
    description: 'Cancela o primeiro debuff de defesa recebido na batalha. Uso único.',
    onDebuff: 'white-herb',
  },

  // ── Ataque / Risco ───────────────────────────────────────────────────────────
  'life-orb': {
    id: 'life-orb', name: 'Orbe Vida', shopTier: 3, shopPrice: 6,
    description: 'Ao ganhar o RPP, causa +0.5♥ de dano extra — mas sofre 0.5♥ de recuo.',
    onHit: 'life-orb',
  },
  'expert-belt': {
    id: 'expert-belt', name: 'Cinto Especialista', shopTier: 2, shopPrice: 6,
    description: 'Golpes super efetivos causam +0.5♥ de dano extra.',
    onHit: 'expert-belt',
  },
  'scope-lens': {
    id: 'scope-lens', name: 'Lente Mira', shopTier: 2, shopPrice: 6,
    description: 'Golpe único tem +25% de chance de acerto crítico.',
    onUnique: 'scope-lens',
  },
  'kings-rock': {
    id: 'kings-rock', name: 'Pedra do Rei', shopTier: 2, shopPrice: 5,
    description: '30% de chance: ao vencer o RPP, inimigo é forçado a usar ✊ no próximo turno.',
    onHit: 'kings-rock',
  },
  'quick-claw': {
    id: 'quick-claw', name: 'Garra Rápida', shopTier: 2, shopPrice: 5,
    description: '25% de chance por turno: revela o movimento do inimigo antes de você escolher.',
    onReveal: 'quick-claw',
  },

  // ── Niche / Orbs ─────────────────────────────────────────────────────────────
  'toxic-orb': {
    id: 'toxic-orb', name: 'Orbe Tóxico', shopTier: 4, shopPrice: 3,
    description: 'Este Pokémon começa cada batalha envenenado. Use com habilidades que se beneficiam de status.',
    onEntry: 'toxic-orb',
  },
  'flame-orb': {
    id: 'flame-orb', name: 'Orbe Chama', shopTier: 4, shopPrice: 3,
    description: 'Este Pokémon começa cada batalha queimado. Use com habilidades que se beneficiam de status.',
    onEntry: 'flame-orb',
  },

  // ── Boosts de Tipo ───────────────────────────────────────────────────────────
  'charcoal': {
    id: 'charcoal', name: 'Carvão', shopTier: 1, shopPrice: 4,
    description: 'Golpes do tipo Fogo causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Fire',
  },
  'mystic-water': {
    id: 'mystic-water', name: 'Água Mística', shopTier: 1, shopPrice: 4,
    description: 'Golpes do tipo Água causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Water',
  },
  'miracle-seed': {
    id: 'miracle-seed', name: 'Semente Milagrosa', shopTier: 1, shopPrice: 4,
    description: 'Golpes do tipo Grama causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Grass',
  },
  'magnet': {
    id: 'magnet', name: 'Ímã', shopTier: 1, shopPrice: 4,
    description: 'Golpes do tipo Elétrico causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Electric',
  },
  'twisted-spoon': {
    id: 'twisted-spoon', name: 'Colher Torcida', shopTier: 1, shopPrice: 4,
    description: 'Golpes do tipo Psíquico causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Psychic',
  },
  'black-belt': {
    id: 'black-belt', name: 'Faixa Preta', shopTier: 1, shopPrice: 4,
    description: 'Golpes do tipo Lutador causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Fighting',
  },
  'hard-stone': {
    id: 'hard-stone', name: 'Pedra Dura', shopTier: 1, shopPrice: 4,
    description: 'Golpes do tipo Pedra causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Rock',
  },
  'silver-powder': {
    id: 'silver-powder', name: 'Pó Prateado', shopTier: 1, shopPrice: 4,
    description: 'Golpes do tipo Bug causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Bug',
  },
  'dragon-fang': {
    id: 'dragon-fang', name: 'Presa do Dragão', shopTier: 2, shopPrice: 5,
    description: 'Golpes do tipo Dragão causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Dragon',
  },
  'metal-coat': {
    id: 'metal-coat', name: 'Manto Metálico', shopTier: 1, shopPrice: 4,
    description: 'Golpes do tipo Aço causam +0.5♥ de dano (+1♥ se super efetivo).',
    onHit: 'type-boost', typeBoost: 'Steel',
  },
}

// ─── Consumable catalog ───────────────────────────────────────────────────────

export interface ConsumableDef {
  id: ConsumableId
  name: string
  description: string
  shopTier: 1 | 2 | 3 | 4
  shopPrice: number
  effect: 'heal' | 'status-cure' | 'revive' | 'unique-reset' | 'rare-candy'
  healAmount?: number     // hearts to restore (heal items)
  curesAll?: boolean      // full-heal / full-restore
  fullRestore?: boolean   // also resets HP to max
}

export const CONSUMABLES: Record<ConsumableId, ConsumableDef> = {
  'potion': {
    id: 'potion', name: 'Poção', shopTier: 1, shopPrice: 2,
    description: 'Restaura 1♥ de um Pokémon.',
    effect: 'heal', healAmount: 1,
  },
  'super-potion': {
    id: 'super-potion', name: 'Super Poção', shopTier: 1, shopPrice: 3,
    description: 'Restaura 2♥ de um Pokémon.',
    effect: 'heal', healAmount: 2,
  },
  'hyper-potion': {
    id: 'hyper-potion', name: 'Hiperpoção', shopTier: 2, shopPrice: 5,
    description: 'Restaura 3♥ de um Pokémon.',
    effect: 'heal', healAmount: 3,
  },
  'full-restore': {
    id: 'full-restore', name: 'Full Restore', shopTier: 3, shopPrice: 7,
    description: 'Restaura todos os ♥ e remove qualquer status de um Pokémon.',
    effect: 'heal', healAmount: 5, fullRestore: true, curesAll: true,
  },
  'antidote': {
    id: 'antidote', name: 'Antídoto', shopTier: 1, shopPrice: 2,
    description: 'Cura veneno de um Pokémon.',
    effect: 'status-cure',
  },
  'burn-heal': {
    id: 'burn-heal', name: 'Burn Heal', shopTier: 1, shopPrice: 2,
    description: 'Cura queimadura de um Pokémon.',
    effect: 'status-cure',
  },
  'full-heal': {
    id: 'full-heal', name: 'Full Heal', shopTier: 2, shopPrice: 4,
    description: 'Remove qualquer status de um Pokémon.',
    effect: 'status-cure', curesAll: true,
  },
  'revive': {
    id: 'revive', name: 'Revive', shopTier: 2, shopPrice: 6,
    description: 'Ressuscita um Pokémon desmaiado com 2♥.',
    effect: 'revive', healAmount: 2,
  },
  'max-revive': {
    id: 'max-revive', name: 'Max Revive', shopTier: 3, shopPrice: 9,
    description: 'Ressuscita um Pokémon desmaiado com todos os ♥.',
    effect: 'revive', healAmount: 5,
  },
  'ether': {
    id: 'ether', name: 'Éter', shopTier: 2, shopPrice: 4,
    description: 'Reseta o cooldown do golpe único de um Pokémon.',
    effect: 'unique-reset',
  },
  'elixir': {
    id: 'elixir', name: 'Elixir', shopTier: 3, shopPrice: 7,
    description: 'Reseta o cooldown único de todos os Pokémon do party.',
    effect: 'unique-reset',
  },
  'rare-candy': {
    id: 'rare-candy', name: 'Rara Bala', shopTier: 3, shopPrice: 12,
    description: 'Aumenta a raridade de um Pokémon em 1 tier (comum→rara→ultra-rara→épico).',
    effect: 'rare-candy',
  },
}

// ─── Reward pool by tier ──────────────────────────────────────────────────────

// Floor → tier: 0-2 = 1, 3-5 = 2, 6-7 = 3, 8-11 = 4
export function getRewardTier(floor: number): 1 | 2 | 3 | 4 {
  if (floor <= 2) return 1
  if (floor <= 5) return 2
  if (floor <= 7) return 3
  return 4
}

export function getHeldItemsForTier(tier: 1 | 2 | 3 | 4): HeldItemId[] {
  return (Object.keys(HELD_ITEMS) as HeldItemId[]).filter(
    id => HELD_ITEMS[id].shopTier <= tier
  )
}

export function getConsumablesForTier(tier: 1 | 2 | 3 | 4): ConsumableId[] {
  return (Object.keys(CONSUMABLES) as ConsumableId[]).filter(
    id => CONSUMABLES[id].shopTier <= tier
  )
}

// ─── Rarity upgrade ───────────────────────────────────────────────────────────

export const RARITY_UPGRADE: Record<string, string> = {
  'comum': 'rara',
  'rara': 'ultra-rara',
  'ultra-rara': 'epico',
  'epico': 'lendaria',
}
