import type { UniqueDefinition } from '@/types'

// ─── Unique move catalog ──────────────────────────────────────────────────────
// category: super = 2 fixed damage; heal = restore hearts; ohko = instant KO;
// aoe = 1 damage to active + all bench
// Special behaviors documented via `special` field.

export const UNIQUES: Record<string, UniqueDefinition> = {
  // ── Super attacks (2 fixed damage, ignores type/modifiers) ──────────────────
  'inferno': {
    name: 'Inferno', type: 'Fire', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Lança uma chama devastadora. Causa 2 de dano base ignorando resistências.',
  },
  'ninetales-inferno': {
    name: 'Inferno', type: 'Fire', rpsSlot: 'scissors', kind: 'super', damage: 2,
    applyEnemyStatus: 'burn',
    description: 'Chamas amaldiçoadas. Causa 2 de dano e queima o inimigo.',
  },
  'hydro-cannon': {
    name: 'Hydro Cannon', type: 'Water', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Canhões d\'água duplos. Causa 2 de dano.',
  },
  'petal-dance': {
    name: 'Petal Dance', type: 'Grass', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: '3 pétalas em sequência. Causa 2 de dano.',
  },
  'thunder': {
    name: 'Thunder', type: 'Electric', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Raio do céu. Causa 2 de dano ignorando resistências e imunidades.',
    special: 'ignore-immunity',
  },
  'zapdos-thunder': {
    name: 'Thunder', type: 'Electric', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Raio lendário. Causa 2 de dano ignorando resistências e imunidades.',
    special: 'ignore-immunity',
  },
  'hyper-beam': {
    name: 'Hyper Beam', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Destruição total. Causa 2 de dano.',
  },
  'rock-wrecker': {
    name: 'Rock Wrecker', type: 'Rock', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Rocha gigante. Causa 2 de dano.',
  },
  'outrage': {
    name: 'Outrage', type: 'Dragon', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Fúria dracônica. Causa 2 de dano.',
  },
  'flare-blitz': {
    name: 'Flare Blitz', type: 'Fire', rpsSlot: 'paper', kind: 'super', damage: 2,
    recoil: 1,
    description: 'Carrega em chamas. Causa 2 de dano, mas sofre 1 de recuo.',
  },
  'giga-impact': {
    name: 'Giga Impact', type: 'Normal', rpsSlot: 'paper', kind: 'super', damage: 2,
    description: 'Ataque máximo. Causa 2 de dano.',
  },
  'sky-attack': {
    name: 'Sky Attack', type: 'Flying', rpsSlot: 'scissors', kind: 'super', damage: 2,
    special: 'sky-attack',
    description: 'Mergulho em chamas. Causa 2 de dano (3 vs Grama/Bug).',
  },
  'psystrike': {
    name: 'Psystrike', type: 'Psychic', rpsSlot: 'rock', kind: 'super', damage: 2,
    special: 'ignore-abilities',
    description: 'O ataque mental mais poderoso. Causa 2 de dano, ignora habilidades.',
  },
  'shadow-ball-gengar': {
    name: 'Shadow Ball', type: 'Ghost', rpsSlot: 'rock', kind: 'super', damage: 2,
    special: 'ignore-abilities',
    description: 'Esfera de trevas. Causa 2 de dano, ignora habilidades e imunidades.',
  },
  'dragon-pulse': {
    name: 'Dragon Pulse', type: 'Dragon', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Pulso dracônico. Causa 2 de dano ignorando tipo.',
    special: 'ignore-immunity',
  },
  'pin-missile': {
    name: 'Pin Missile', type: 'Bug', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Agulhadas certeiras. Causa 2 de dano.',
  },
  'jolteon-pin-missile': {
    name: 'Pin Missile', type: 'Bug', rpsSlot: 'paper', kind: 'super', damage: 2,
    description: 'Agulhas de pelos. Causa 2 de dano.',
  },
  'extremespeed': {
    name: 'ExtremeSpeed', type: 'Normal', rpsSlot: 'paper', kind: 'super', damage: 2,
    description: 'Velocidade extrema. Causa 2 de dano.',
  },
  'aqua-jet': {
    name: 'Aqua Jet', type: 'Water', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Jato de água ultra rápido. Causa 2 de dano.',
  },
  'megahorn': {
    name: 'Megahorn', type: 'Bug', rpsSlot: 'rock', kind: 'super', damage: 2,
    special: 'megahorn',
    description: 'Chifrada mega poderosa. Causa 2 de dano (3 vs Psíquico).',
  },
  'mach-punch-unique': {
    name: 'Mach Punch', type: 'Fighting', rpsSlot: 'paper', kind: 'super', damage: 2,
    description: 'Soco com força total. Causa 2 de dano.',
  },
  'leaf-storm-unique': {
    name: 'Leaf Storm', type: 'Grass', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Furacão de folhas afiadas. Causa 2 de dano.',
  },
  'acid-spray-unique': {
    name: 'Acid Spray', type: 'Poison', rpsSlot: 'scissors', kind: 'super', damage: 1,
    applyEnemyStatus: 'poison',
    description: 'Spray corrosivo. Causa 1 de dano e envenena o inimigo.',
  },
  'ancient-power-unique': {
    name: 'Ancient Power', type: 'Rock', rpsSlot: 'rock', kind: 'super', damage: 2,
    special: 'ancient-power',
    description: 'Poder ancestral. Causa 2 de dano e com 20% de chance, ganha +1 ataque no próximo turno.',
  },
  'tri-attack': {
    name: 'Tri Attack', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 2,
    special: 'tri-attack',
    description: 'Ataca com 3 elementos. Causa 2 de dano e sorteia burn/paralisia/freeze.',
  },
  'volt-switch-unique': {
    name: 'Volt Switch', type: 'Electric', rpsSlot: 'paper', kind: 'super', damage: 2,
    special: 'volt-switch',
    description: 'Soco elétrico. Causa 2 de dano e com 33% de chance, paralisa o inimigo.',
  },
  'parental-bond': {
    name: 'Parental Bond', type: 'Normal', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Mãe e filhote atacam juntos. Causa 2 de dano total.',
  },
  'power-gem-unique': {
    name: 'Power Gem', type: 'Rock', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Raios da joia central. Causa 2 de dano.',
  },
  'cross-chop-unique': {
    name: 'Cross Chop', type: 'Fighting', rpsSlot: 'rock', kind: 'super', damage: 2,
    critChance: 0.5,
    description: 'Golpe cruzado com crítico. Causa 2 de dano (50% de chance de crítico).',
  },
  'focus-punch-hitmonchan': {
    name: 'Focus Punch', type: 'Fighting', rpsSlot: 'paper', kind: 'super', damage: 2,
    description: 'Soco com força total. Causa 2 de dano.',
  },
  'zen-headbutt-unique': {
    name: 'Zen Headbutt', type: 'Psychic', rpsSlot: 'rock', kind: 'super', damage: 2,
    special: 'ignore-abilities',
    description: 'Golpe psíquico. Causa 2 de dano, ignora habilidades passivas.',
  },
  'shell-smash-unique': {
    name: 'Shell Smash', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 2,
    special: 'shell-smash',
    description: 'Quebra a própria concha. Causa 2 de dano e ganha +1 ataque por 3 turnos (recebe +1 dano).',
  },
  'acid-armor-unique': {
    name: 'Acid Armor', type: 'Poison', rpsSlot: 'scissors', kind: 'super', damage: 0,
    special: 'acid-armor',
    description: 'Dissolve completamente sua forma. Por 2 turnos, defesa máxima (+1 def).',
  },
  'barrier-unique': {
    name: 'Barrier', type: 'Psychic', rpsSlot: 'scissors', kind: 'super', damage: 0,
    special: 'barrier',
    description: 'Barreira invisível. Por 2 turnos, ataques que perderem causam 0 de dano.',
  },
  'stick-unique': {
    name: 'Stick', type: 'Normal', rpsSlot: 'rock', kind: 'super', damage: 1,
    critChance: 0.33,
    description: 'Golpe com o galho sagrado. 33% de crítico (causa 2 de dano).',
  },
  'cut-unique': {
    name: 'Cut', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 1,
    critChance: 0.5,
    description: 'Golpe de lâmina. 50% de chance de crítico (causa 2 de dano).',
  },
  'swift-unique': {
    name: 'Swift', type: 'Normal', rpsSlot: 'paper', kind: 'super', damage: 2,
    description: 'Ataque que nunca erra. Causa 2 de dano.',
  },
  'drill-run-unique': {
    name: 'Drill Run', type: 'Normal', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Ataque perfurante. Causa 2 de dano.',
  },
  'hyper-fang-unique': {
    name: 'Hyper Fang', type: 'Normal', rpsSlot: 'paper', kind: 'super', damage: 2,
    description: 'Mordida poderosa. Causa 2 de dano.',
  },
  'future-sight-unique': {
    name: 'Future Sight', type: 'Psychic', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Prevê o futuro e ataca. Causa 2 de dano.',
  },
  'egg-bomb-unique': {
    name: 'Egg Bomb', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Bombas-ovo em sequência. Causa 2 de dano.',
  },
  'bone-rush-unique': {
    name: 'Bone Rush', type: 'Ground', rpsSlot: 'paper', kind: 'super', damage: 2,
    description: 'Golpes com o osso. Causa 2 de dano.',
  },
  'high-jump-kick-unique': {
    name: 'High Jump Kick', type: 'Fighting', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Chute voador. Causa 2 de dano.',
  },
  'metronome': {
    name: 'Metronome', type: 'Normal', rpsSlot: 'paper', kind: 'super', damage: 2,
    special: 'metronome',
    description: 'Usa um ataque aleatório de qualquer tipo. O tipo é sorteado na hora.',
  },
  'conversion': {
    name: 'Conversion', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 1,
    special: 'conversion',
    description: 'Muda seu tipo para o tipo do último ataque vencedor.',
  },
  'perish-song': {
    name: 'Perish Song', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 0,
    special: 'perish-song',
    description: 'Melodia amaldiçoada. Após 3 turnos, ambos os Pokémon ativos são derrotados.',
  },
  'destiny-bond': {
    name: 'Destiny Bond', type: 'Ghost', rpsSlot: 'scissors', kind: 'super', damage: 0,
    special: 'destiny-bond',
    description: 'Liga os destinos. Se este Pokémon for derrotado no próximo turno, o inimigo também cai.',
  },
  'volt-tackle': {
    name: 'Volt Tackle', type: 'Electric', rpsSlot: 'rock', kind: 'super', damage: 2,
    special: 'volt-tackle',
    description: 'Carrega com energia elétrica. Super efetivo contra Terra e Pedra (causa 3). Outros: 2 de dano.',
  },
  'quiver-dance-unique': {
    name: 'Quiver Dance', type: 'Bug', rpsSlot: 'scissors', kind: 'super', damage: 0,
    special: 'quiver-dance',
    description: 'Dança potencializadora. Ganha +1 de dano nos próximos 2 ataques.',
  },
  'flame-charge-unique': {
    name: 'Flame Charge', type: 'Fire', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Carrega em chamas. Causa 2 de dano.',
  },
  'rock-slide-unique': {
    name: 'Rock Slide', type: 'Rock', rpsSlot: 'rock', kind: 'super', damage: 2,
    special: 'rock-slide',
    description: 'Queda de pedras. Causa 2 de dano e com 30% de chance, o inimigo usa ✊ no próximo turno.',
  },
  'wrap-unique': {
    name: 'Wrap', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 1,
    applyEnemyStatus: 'poison',
    description: 'Enrolado em cipós. Causa 1 de dano e envenena o inimigo.',
  },
  'bind-unique': {
    name: 'Bind', type: 'Normal', rpsSlot: 'paper', kind: 'super', damage: 1,
    applyEnemyStatus: 'poison',
    description: 'Preso por cipós. Causa 1 de dano e envenena o inimigo.',
  },
  'petal-blizzard-unique': {
    name: 'Petal Blizzard', type: 'Grass', rpsSlot: 'rock', kind: 'super', damage: 2,
    applyEnemyStatus: 'poison',
    description: 'Tempestade de pétalas venenosas. Causa 2 de dano e envenena o inimigo.',
  },
  'dream-eater': {
    name: 'Dream Eater', type: 'Psychic', rpsSlot: 'paper', kind: 'heal', healAmount: 2,
    special: 'dream-eater',
    description: 'Devora os sonhos. Só funciona se o inimigo estiver dormindo: causa 2 de dano e recupera 2 ♥.',
  },
  'slack-off': {
    name: 'Slack Off', type: 'Normal', rpsSlot: 'scissors', kind: 'heal', healAmount: 3,
    description: 'Descansa fundo. Recupera 3 ♥.',
  },
  'glare-unique': {
    name: 'Glare', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 0,
    applyEnemyStatus: 'paralysis',
    description: 'Padrão aterrorizante do escudo. Paralisa o inimigo permanentemente.',
  },
  'lovely-kiss-unique': {
    name: 'Lovely Kiss', type: 'Normal', rpsSlot: 'scissors', kind: 'super', damage: 1,
    applyEnemyStatus: 'sleep',
    description: 'Beijo amaldiçoado. Causa 1 de dano e adormece o inimigo por 1 turno.',
  },
  'spore-unique': {
    name: 'Spore', type: 'Grass', rpsSlot: 'scissors', kind: 'super', damage: 0,
    applyEnemyStatus: 'sleep',
    description: 'Nuvem de esporos. Adormece o inimigo por 1 turno.',
  },
  'hurricane-unique': {
    name: 'Hurricane', type: 'Flying', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Tempestade de vento. Causa 2 de dano.',
  },
  'psybeam-unique': {
    name: 'Psybeam', type: 'Psychic', rpsSlot: 'rock', kind: 'super', damage: 2,
    description: 'Raio psíquico. Causa 2 de dano.',
  },
  'dynamic-punch-unique': {
    name: 'Dynamic Punch', type: 'Fighting', rpsSlot: 'paper', kind: 'super', damage: 2,
    description: 'Soco poderoso. Causa 2 de dano.',
  },
  'lava-plume': {
    name: 'Lava Plume', type: 'Fire', rpsSlot: 'scissors', kind: 'aoe', benchDamage: 1,
    applyEnemyStatus: 'burn',
    description: 'Erupção de lava. Causa 1 de dano ao ativo e ao banco; queima o inimigo ativo.',
  },
  // ── Heal ─────────────────────────────────────────────────────────────────────
  'soft-boiled': {
    name: 'Soft-Boiled', type: 'Normal', rpsSlot: 'scissors', kind: 'heal', healAmount: 3,
    description: 'Recupera 3 ♥ em vez de atacar.',
  },
  'rest': {
    name: 'Rest', type: 'Normal', rpsSlot: 'scissors', kind: 'heal', healAmount: 3,
    selfStatus: 'sleep',
    description: 'Recupera 3 ♥ e dorme por 1 turno.',
  },
  'aqua-ring-unique': {
    name: 'Aqua Ring', type: 'Water', rpsSlot: 'paper', kind: 'heal', healAmount: 3,
    description: 'Envolve-se em água curativa. Recupera 3 ♥.',
  },
  'leech-life-unique': {
    name: 'Leech Life', type: 'Bug', rpsSlot: 'rock', kind: 'super', damage: 2,
    drain: true,
    description: 'Suga a energia vital. Causa 2 de dano e recupera 1 ♥.',
  },
  // ── OHKO ─────────────────────────────────────────────────────────────────────
  'fissure': {
    name: 'Fissure', type: 'Ground', rpsSlot: 'scissors', kind: 'ohko',
    description: 'Abre uma fenda. KO instantâneo — mas fica cansado por 2 turnos.',
  },
  'guillotine': {
    name: 'Guillotine', type: 'Normal', rpsSlot: 'rock', kind: 'ohko',
    description: 'Golpe da guilhotina. KO instantâneo — mas fica cansado por 2 turnos.',
  },
  'sheer-cold': {
    name: 'Sheer Cold', type: 'Ice', rpsSlot: 'scissors', kind: 'ohko',
    special: 'sheer-cold',
    description: 'Frio absoluto. KO instantâneo vs Água/Grama/Voador/Dragão; 1 de dano para outros. Fica cansado.',
  },
  'articuno-sheer-cold': {
    name: 'Sheer Cold', type: 'Ice', rpsSlot: 'scissors', kind: 'ohko',
    special: 'sheer-cold',
    description: 'Frio lendário. KO instantâneo vs Água/Grama/Voador/Dragão. Fica cansado.',
  },
  'focus-punch': {
    name: 'Focus Punch', type: 'Fighting', rpsSlot: 'scissors', kind: 'ohko',
    description: 'Soco com força total. KO instantâneo — mas fica cansado por 2 turnos.',
  },
  'horn-drill': {
    name: 'Horn Drill', type: 'Normal', rpsSlot: 'rock', kind: 'ohko',
    description: 'Broca de chifre. KO instantâneo — mas fica cansado por 2 turnos.',
  },
  'glitch-beam': {
    name: 'Glitch Beam', type: 'Normal', rpsSlot: 'rock', kind: 'ohko',
    special: 'no-tire',
    description: '???: Emite dados corrompidos. KO instantâneo incondicional, sem cansaço.',
  },
  // ── AoE ──────────────────────────────────────────────────────────────────────
  'earthquake-unique': {
    name: 'Earthquake', type: 'Ground', rpsSlot: 'rock', kind: 'aoe', benchDamage: 1,
    description: 'Abalo sísmico. Causa 1 de dano ao ativo e 1 a todos do banco inimigo.',
  },
  'hyper-voice-unique': {
    name: 'Hyper Voice', type: 'Normal', rpsSlot: 'scissors', kind: 'aoe', benchDamage: 1,
    description: 'Grito ensurdecedor. Causa 1 de dano ao ativo e 1 a todos do banco inimigo.',
  },
  'rollout-unique': {
    name: 'Rollout', type: 'Rock', rpsSlot: 'paper', kind: 'aoe', benchDamage: 1,
    description: 'Rolo compressor. Causa 1 de dano ao ativo e 1 a todos do banco inimigo.',
  },
  'explosion-unique': {
    name: 'Explosion', type: 'Normal', rpsSlot: 'scissors', kind: 'aoe', benchDamage: 1,
    damage: 3, userFaints: true,
    description: 'Explosão catastrófica. Causa 3 de dano ao ativo e 1 a todos no banco. Usuário é derrotado.',
  },
  'electrode-explosion': {
    name: 'Explosion', type: 'Normal', rpsSlot: 'scissors', kind: 'aoe', benchDamage: 1,
    damage: 3, userFaints: true,
    description: 'Autodetona com energia máxima. Causa 3 de dano ao ativo. Electrode é derrotado.',
  },
  // ── Special / Transform ──────────────────────────────────────────────────────
  'transform': {
    name: 'Transform', type: 'Normal', rpsSlot: 'rock', kind: 'super', damage: 0,
    special: 'imposter',
    description: 'Transforma-se no inimigo: copia tipo, moves e habilidade.',
  },
  // Aerial Ace for Pidgeot (replaces Hurricane)
  'aerial-ace': {
    name: 'Aerial Ace', type: 'Flying', rpsSlot: 'scissors', kind: 'super', damage: 2,
    description: 'Ataque aéreo certeiro. Causa 2 de dano.',
  },
}

export function getUnique(id: string): UniqueDefinition {
  const u = UNIQUES[id]
  if (!u) throw new Error(`[RTT] unique not found in catalog: "${id}"`)
  return u
}
