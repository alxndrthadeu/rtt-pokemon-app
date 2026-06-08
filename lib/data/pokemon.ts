import type { PokemonCard, PokemonType, Ability, Move, UniqueMove, Rarity } from '@/types'

type PokemonTemplate = Omit<PokemonCard, 'hearts' | 'isFainted' | 'statusEffects' | 'isShiny'>

function m(name: string, type: PokemonType, category: 'rock' | 'paper' | 'scissors'): Move {
  return { name, type, category }
}

function ability(name: PokemonCard['ability']['name'], description: string): Ability {
  return { name, description }
}

function unique(name: string, type: PokemonType, category: 'rock' | 'paper' | 'scissors', description: string): UniqueMove {
  return { name, type, category, description }
}

// prettier-ignore
export const POKEMON_TEMPLATES: PokemonTemplate[] = [
  // ─── #1 BULBASAUR ───
  {
    id: 1, name: 'Bulbasaur', type1: 'Grass', type2: 'Poison', rarity: 'comum',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Vine Whip', 'Grass', 'rock'),
      paper: m('Tackle', 'Normal', 'paper'),
      scissors: m('Poison Powder', 'Poison', 'scissors'),
    },
    unique: null,
  },
  // ─── #2 IVYSAUR ───
  {
    id: 2, name: 'Ivysaur', type1: 'Grass', type2: 'Poison', rarity: 'rara',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Razor Leaf', 'Grass', 'rock'),
      paper: m('Body Slam', 'Normal', 'paper'),
      scissors: m('Poison Powder', 'Poison', 'scissors'),
    },
    unique: null,
  },
  // ─── #3 VENUSAUR ───
  {
    id: 3, name: 'Venusaur', type1: 'Grass', type2: 'Poison', rarity: 'ultra-rara',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Solar Beam', 'Grass', 'rock'),
      paper: m('Sludge Bomb', 'Poison', 'paper'),
      scissors: m('Body Slam', 'Normal', 'paper'),
    },
    unique: unique('Petal Dance', 'Grass', 'rock', 'Desencadeia 3 pétalas em sequência. Cada pétala causa 1 de dano extra se vencer no Jokenpô.'),
  },
  // ─── #4 CHARMANDER ───
  {
    id: 4, name: 'Charmander', type1: 'Fire', type2: null, rarity: 'comum',
    ability: ability('Blaze', 'Quando com 1 coração restante, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Ember', 'Fire', 'rock'),
      paper: m('Scratch', 'Normal', 'paper'),
      scissors: m('Dragon Rage', 'Dragon', 'scissors'),
    },
    unique: null,
  },
  // ─── #5 CHARMELEON ───
  {
    id: 5, name: 'Charmeleon', type1: 'Fire', type2: null, rarity: 'rara',
    ability: ability('Blaze', 'Quando com 1 coração restante, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Fire Fang', 'Fire', 'rock'),
      paper: m('Slash', 'Normal', 'paper'),
      scissors: m('Dragon Rage', 'Dragon', 'scissors'),
    },
    unique: null,
  },
  // ─── #6 CHARIZARD ───
  {
    id: 6, name: 'Charizard', type1: 'Fire', type2: 'Flying', rarity: 'ultra-rara',
    ability: ability('Blaze', 'Quando com 1 coração restante, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Fire Blast', 'Fire', 'rock'),
      paper: m('Wing Attack', 'Flying', 'paper'),
      scissors: m('Dragon Rage', 'Dragon', 'scissors'),
    },
    unique: unique('Inferno', 'Fire', 'rock', 'Lança uma chama devastadora. Se vencer no Jokenpô, causa 2 de dano base ignorando resistências.'),
  },
  // ─── #7 SQUIRTLE ───
  {
    id: 7, name: 'Squirtle', type1: 'Water', type2: null, rarity: 'comum',
    ability: ability('Torrent', 'Quando com 1 coração restante, ataques de Água causam +1 de dano.'),
    moves: {
      rock: m('Water Gun', 'Water', 'rock'),
      paper: m('Tackle', 'Normal', 'paper'),
      scissors: m('Bite', 'Dark', 'scissors'),
    },
    unique: null,
  },
  // ─── #8 WARTORTLE ───
  {
    id: 8, name: 'Wartortle', type1: 'Water', type2: null, rarity: 'rara',
    ability: ability('Torrent', 'Quando com 1 coração restante, ataques de Água causam +1 de dano.'),
    moves: {
      rock: m('Bubble Beam', 'Water', 'rock'),
      paper: m('Bite', 'Normal', 'paper'),
      scissors: m('Rapid Spin', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #9 BLASTOISE ───
  {
    id: 9, name: 'Blastoise', type1: 'Water', type2: null, rarity: 'ultra-rara',
    ability: ability('Torrent', 'Quando com 1 coração restante, ataques de Água causam +1 de dano.'),
    moves: {
      rock: m('Hydro Pump', 'Water', 'rock'),
      paper: m('Flash Cannon', 'Steel', 'paper'),
      scissors: m('Skull Bash', 'Normal', 'scissors'),
    },
    unique: unique('Hydro Cannon', 'Water', 'rock', 'Dispara canhões d\'água duplos. Se vencer, causa 2 de dano. Não pode ser usado dois turnos seguidos.'),
  },
  // ─── #10 CATERPIE ───
  {
    id: 10, name: 'Caterpie', type1: 'Bug', type2: null, rarity: 'comum',
    ability: ability('NoGuard', 'Todos os ataques acertam, mas o inimigo também não pode errar.'),
    moves: {
      rock: m('Tackle', 'Normal', 'rock'),
      paper: m('String Shot', 'Bug', 'paper'),
      scissors: m('Bug Bite', 'Bug', 'scissors'),
    },
    unique: null,
  },
  // ─── #11 METAPOD ───
  {
    id: 11, name: 'Metapod', type1: 'Bug', type2: null, rarity: 'comum',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Tackle', 'Normal', 'rock'),
      paper: m('Harden', 'Normal', 'paper'),
      scissors: m('String Shot', 'Bug', 'scissors'),
    },
    unique: null,
  },
  // ─── #12 BUTTERFREE ───
  {
    id: 12, name: 'Butterfree', type1: 'Bug', type2: 'Flying', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Air Slash', 'Flying', 'rock'),
      paper: m('Silver Wind', 'Bug', 'paper'),
      scissors: m('Sleep Powder', 'Bug', 'scissors'),
    },
    unique: unique('Quiver Dance', 'Bug', 'scissors', 'Dança e potencializa os próximos 2 ataques, causando +1 de dano em cada vitória do Jokenpô.'),
  },
  // ─── #13 WEEDLE ───
  {
    id: 13, name: 'Weedle', type1: 'Bug', type2: 'Poison', rarity: 'comum',
    ability: ability('NoGuard', 'Todos os ataques acertam, mas o inimigo também não pode errar.'),
    moves: {
      rock: m('Poison Sting', 'Poison', 'rock'),
      paper: m('Tackle', 'Normal', 'paper'),
      scissors: m('Bug Bite', 'Bug', 'scissors'),
    },
    unique: null,
  },
  // ─── #14 KAKUNA ───
  {
    id: 14, name: 'Kakuna', type1: 'Bug', type2: 'Poison', rarity: 'comum',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Poison Sting', 'Poison', 'rock'),
      paper: m('Harden', 'Normal', 'paper'),
      scissors: m('Bug Bite', 'Bug', 'scissors'),
    },
    unique: null,
  },
  // ─── #15 BEEDRILL ───
  {
    id: 15, name: 'Beedrill', type1: 'Bug', type2: 'Poison', rarity: 'rara',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Twineedle', 'Bug', 'rock'),
      paper: m('Fury Attack', 'Normal', 'paper'),
      scissors: m('Poison Jab', 'Poison', 'scissors'),
    },
    unique: unique('Pin Missile', 'Bug', 'rock', 'Dispara 2 a 5 agulhadas. Cada agulhada que vencer no Jokenpô causa 1 de dano.'),
  },
  // ─── #16 PIDGEY ───
  {
    id: 16, name: 'Pidgey', type1: 'Normal', type2: 'Flying', rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Tackle', 'Normal', 'rock'),
      paper: m('Gust', 'Flying', 'paper'),
      scissors: m('Sand Attack', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #17 PIDGEOTTO ───
  {
    id: 17, name: 'Pidgeotto', type1: 'Normal', type2: 'Flying', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Wing Attack', 'Flying', 'rock'),
      paper: m('Quick Attack', 'Normal', 'paper'),
      scissors: m('Feather Dance', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #18 PIDGEOT ───
  {
    id: 18, name: 'Pidgeot', type1: 'Normal', type2: 'Flying', rarity: 'ultra-rara',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Brave Bird', 'Flying', 'rock'),
      paper: m('Air Slash', 'Flying', 'paper'),
      scissors: m('Hurricane', 'Flying', 'scissors'),
    },
    unique: unique('Hurricane', 'Flying', 'scissors', 'Tempestade de vento que confunde o inimigo. Se vencer, o inimigo usa o mesmo Jokenpô do turno anterior no próximo turno.'),
  },
  // ─── #19 RATTATA ───
  {
    id: 19, name: 'Rattata', type1: 'Normal', type2: null, rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Quick Attack', 'Normal', 'rock'),
      paper: m('Bite', 'Normal', 'paper'),
      scissors: m('Tail Whip', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #20 RATICATE ───
  {
    id: 20, name: 'Raticate', type1: 'Normal', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Hyper Fang', 'Normal', 'rock'),
      paper: m('Super Fang', 'Normal', 'paper'),
      scissors: m('Scary Face', 'Normal', 'scissors'),
    },
    unique: unique('Super Fang', 'Normal', 'paper', 'Morde tão forte que reduz os corações do inimigo à metade se vencer no Jokenpô.'),
  },
  // ─── #21 SPEAROW ───
  {
    id: 21, name: 'Spearow', type1: 'Normal', type2: 'Flying', rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Peck', 'Flying', 'rock'),
      paper: m('Growl', 'Normal', 'paper'),
      scissors: m('Leer', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #22 FEAROW ───
  {
    id: 22, name: 'Fearow', type1: 'Normal', type2: 'Flying', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Drill Peck', 'Flying', 'rock'),
      paper: m('Fury Attack', 'Normal', 'paper'),
      scissors: m('Mirror Move', 'Normal', 'scissors'),
    },
    unique: unique('Drill Run', 'Normal', 'rock', 'Ataca em espiral perfurante. Se o tipo do inimigo for fraco a Normal, causa 2 de dano ao vencer.'),
  },
  // ─── #23 EKANS ───
  {
    id: 23, name: 'Ekans', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Poison Sting', 'Poison', 'rock'),
      paper: m('Wrap', 'Normal', 'paper'),
      scissors: m('Glare', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #24 ARBOK ───
  {
    id: 24, name: 'Arbok', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Gunk Shot', 'Poison', 'rock'),
      paper: m('Crunch', 'Normal', 'paper'),
      scissors: m('Coil', 'Poison', 'scissors'),
    },
    unique: unique('Glare', 'Normal', 'scissors', 'O padrão aterrorizante do escudo paralisa o inimigo. Se vencer, o inimigo repete o mesmo Jokenpô por 2 turnos.'),
  },
  // ─── #25 PIKACHU ───
  {
    id: 25, name: 'Pikachu', type1: 'Electric', type2: null, rarity: 'rara',
    ability: ability('VoltAbsorb', 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Thunder Shock', 'Electric', 'rock'),
      paper: m('Quick Attack', 'Normal', 'paper'),
      scissors: m('Thunder Wave', 'Electric', 'scissors'),
    },
    unique: null,
  },
  // ─── #26 RAICHU ───
  {
    id: 26, name: 'Raichu', type1: 'Electric', type2: null, rarity: 'ultra-rara',
    ability: ability('VoltAbsorb', 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Thunderbolt', 'Electric', 'rock'),
      paper: m('Volt Tackle', 'Electric', 'paper'),
      scissors: m('Thunder', 'Electric', 'scissors'),
    },
    unique: unique('Thunder', 'Electric', 'scissors', 'Invoca um raio do céu. Sempre que vencer no Jokenpô, causa 2 de dano independente de resistências.'),
  },
  // ─── #27 SANDSHREW ───
  {
    id: 27, name: 'Sandshrew', type1: 'Ground', type2: null, rarity: 'comum',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Scratch', 'Normal', 'rock'),
      paper: m('Sand Attack', 'Normal', 'paper'),
      scissors: m('Defense Curl', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #28 SANDSLASH ───
  {
    id: 28, name: 'Sandslash', type1: 'Ground', type2: null, rarity: 'rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Slash', 'Normal', 'rock'),
      paper: m('Earthquake', 'Ground', 'paper'),
      scissors: m('Sand Tomb', 'Ground', 'scissors'),
    },
    unique: unique('Earthquake', 'Ground', 'paper', 'Abala o solo com força extrema. Se vencer, causa dano a todos os inimigos no banco também (1 de dano extra).'),
  },
  // ─── #29 NIDORAN♀ ───
  {
    id: 29, name: 'Nidoran♀', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Scratch', 'Normal', 'rock'),
      paper: m('Poison Sting', 'Poison', 'paper'),
      scissors: m('Growl', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #30 NIDORINA ───
  {
    id: 30, name: 'Nidorina', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Bite', 'Normal', 'rock'),
      paper: m('Double Kick', 'Fighting', 'paper'),
      scissors: m('Poison Fang', 'Poison', 'scissors'),
    },
    unique: null,
  },
  // ─── #31 NIDOQUEEN ───
  {
    id: 31, name: 'Nidoqueen', type1: 'Poison', type2: 'Ground', rarity: 'ultra-rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Body Slam', 'Normal', 'rock'),
      paper: m('Earth Power', 'Ground', 'paper'),
      scissors: m('Sludge Wave', 'Poison', 'scissors'),
    },
    unique: unique('Earth Power', 'Ground', 'paper', 'Poder sísmico que ignora o tipo voador do inimigo. Sempre causa dano normal a pokémons do tipo Voador.'),
  },
  // ─── #32 NIDORAN♂ ───
  {
    id: 32, name: 'Nidoran♂', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Horn Attack', 'Normal', 'rock'),
      paper: m('Poison Sting', 'Poison', 'paper'),
      scissors: m('Leer', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #33 NIDORINO ───
  {
    id: 33, name: 'Nidorino', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Horn Attack', 'Normal', 'rock'),
      paper: m('Double Kick', 'Fighting', 'paper'),
      scissors: m('Poison Jab', 'Poison', 'scissors'),
    },
    unique: null,
  },
  // ─── #34 NIDOKING ───
  {
    id: 34, name: 'Nidoking', type1: 'Poison', type2: 'Ground', rarity: 'ultra-rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Megahorn', 'Bug', 'rock'),
      paper: m('Earthquake', 'Ground', 'paper'),
      scissors: m('Poison Jab', 'Poison', 'scissors'),
    },
    unique: unique('Thrash', 'Normal', 'rock', 'Ataca sem parar por 2 turnos consecutivos, forçando o mesmo Jokenpô em ambos. Causa 2 de dano se ambos vencerem.'),
  },
  // ─── #35 CLEFAIRY ───
  {
    id: 35, name: 'Clefairy', type1: 'Fairy', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Pound', 'Normal', 'rock'),
      paper: m('Metronome', 'Normal', 'paper'),
      scissors: m('Moonblast', 'Fairy', 'scissors'),
    },
    unique: null,
  },
  // ─── #36 CLEFABLE ───
  {
    id: 36, name: 'Clefable', type1: 'Fairy', type2: null, rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Moonblast', 'Fairy', 'rock'),
      paper: m('Stored Power', 'Psychic', 'paper'),
      scissors: m('Minimize', 'Normal', 'scissors'),
    },
    unique: unique('Metronome', 'Normal', 'paper', 'Usa um ataque aleatório de qualquer tipo. O tipo é sorteado no momento do reveal, podendo ser super efetivo.'),
  },
  // ─── #37 VULPIX ───
  {
    id: 37, name: 'Vulpix', type1: 'Fire', type2: null, rarity: 'rara',
    ability: ability('FlashFire', 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Ember', 'Fire', 'rock'),
      paper: m('Quick Attack', 'Normal', 'paper'),
      scissors: m('Will-O-Wisp', 'Fire', 'scissors'),
    },
    unique: null,
  },
  // ─── #38 NINETALES ───
  {
    id: 38, name: 'Ninetales', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ability('FlashFire', 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Fire Blast', 'Fire', 'rock'),
      paper: m('Hex', 'Ghost', 'paper'),
      scissors: m('Nasty Plot', 'Normal', 'scissors'),
    },
    unique: unique('Inferno', 'Fire', 'scissors', 'Queima o inimigo com chamas amaldiçoadas. Se vencer, o inimigo perde 1 coração adicional no próximo turno (queimadura).'),
  },
  // ─── #39 JIGGLYPUFF ───
  {
    id: 39, name: 'Jigglypuff', type1: 'Normal', type2: 'Fairy', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Pound', 'Normal', 'rock'),
      paper: m('Disarming Voice', 'Fairy', 'paper'),
      scissors: m('Sing', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #40 WIGGLYTUFF ───
  {
    id: 40, name: 'Wigglytuff', type1: 'Normal', type2: 'Fairy', rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Body Slam', 'Normal', 'rock'),
      paper: m('Dazzling Gleam', 'Fairy', 'paper'),
      scissors: m('Hyper Voice', 'Normal', 'scissors'),
    },
    unique: unique('Hyper Voice', 'Normal', 'scissors', 'Grito ensurdecedor que atinge o banco inimigo. Se vencer, todos os inimigos no banco perdem 1 coração.'),
  },
  // ─── #41 ZUBAT ───
  {
    id: 41, name: 'Zubat', type1: 'Poison', type2: 'Flying', rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Leech Life', 'Bug', 'rock'),
      paper: m('Supersonic', 'Normal', 'paper'),
      scissors: m('Astonish', 'Ghost', 'scissors'),
    },
    unique: null,
  },
  // ─── #42 GOLBAT ───
  {
    id: 42, name: 'Golbat', type1: 'Poison', type2: 'Flying', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Air Cutter', 'Flying', 'rock'),
      paper: m('Poison Fang', 'Poison', 'paper'),
      scissors: m('Confuse Ray', 'Ghost', 'scissors'),
    },
    unique: unique('Leech Life', 'Bug', 'rock', 'Suga a energia vital do inimigo. Se vencer, recupera 1 coração além de causar o dano normal.'),
  },
  // ─── #43 ODDISH ───
  {
    id: 43, name: 'Oddish', type1: 'Grass', type2: 'Poison', rarity: 'comum',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Absorb', 'Grass', 'rock'),
      paper: m('Acid', 'Poison', 'paper'),
      scissors: m('Sleep Powder', 'Grass', 'scissors'),
    },
    unique: null,
  },
  // ─── #44 GLOOM ───
  {
    id: 44, name: 'Gloom', type1: 'Grass', type2: 'Poison', rarity: 'rara',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Mega Drain', 'Grass', 'rock'),
      paper: m('Sludge', 'Poison', 'paper'),
      scissors: m('Stun Spore', 'Grass', 'scissors'),
    },
    unique: null,
  },
  // ─── #45 VILEPLUME ───
  {
    id: 45, name: 'Vileplume', type1: 'Grass', type2: 'Poison', rarity: 'ultra-rara',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Petal Blizzard', 'Grass', 'rock'),
      paper: m('Sludge Bomb', 'Poison', 'paper'),
      scissors: m('Moonblast', 'Fairy', 'scissors'),
    },
    unique: unique('Petal Blizzard', 'Grass', 'rock', 'Tempestade de pétalas venenosas. Se vencer, envenena o inimigo causando 1 de dano extra por turno por 2 turnos.'),
  },
  // ─── #46 PARAS ───
  {
    id: 46, name: 'Paras', type1: 'Bug', type2: 'Grass', rarity: 'comum',
    ability: ability('NoGuard', 'Todos os ataques acertam, mas o inimigo também não pode errar.'),
    moves: {
      rock: m('Scratch', 'Normal', 'rock'),
      paper: m('Absorb', 'Grass', 'paper'),
      scissors: m('Spore', 'Grass', 'scissors'),
    },
    unique: null,
  },
  // ─── #47 PARASECT ───
  {
    id: 47, name: 'Parasect', type1: 'Bug', type2: 'Grass', rarity: 'rara',
    ability: ability('NoGuard', 'Todos os ataques acertam, mas o inimigo também não pode errar.'),
    moves: {
      rock: m('X-Scissor', 'Bug', 'rock'),
      paper: m('Giga Drain', 'Grass', 'paper'),
      scissors: m('Spore', 'Grass', 'scissors'),
    },
    unique: unique('Spore', 'Grass', 'scissors', 'Nuvem de esporos adormecedores. Se vencer, o inimigo dorme por 1 turno e não escolhe ação (usa rock por padrão).'),
  },
  // ─── #48 VENONAT ───
  {
    id: 48, name: 'Venonat', type1: 'Bug', type2: 'Poison', rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Confusion', 'Psychic', 'rock'),
      paper: m('Poison Powder', 'Poison', 'paper'),
      scissors: m('Disable', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #49 VENOMOTH ───
  {
    id: 49, name: 'Venomoth', type1: 'Bug', type2: 'Poison', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Psybeam', 'Psychic', 'rock'),
      paper: m('Silver Wind', 'Bug', 'paper'),
      scissors: m('Quiver Dance', 'Bug', 'scissors'),
    },
    unique: unique('Psybeam', 'Psychic', 'rock', 'Raio psíquico confuso. Se vencer, o inimigo fica confuso e escolhe um Jokenpô aleatório no próximo turno.'),
  },
  // ─── #50 DIGLETT ───
  {
    id: 50, name: 'Diglett', type1: 'Ground', type2: null, rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Scratch', 'Normal', 'rock'),
      paper: m('Mud Slap', 'Ground', 'paper'),
      scissors: m('Dig', 'Ground', 'scissors'),
    },
    unique: null,
  },
  // ─── #51 DUGTRIO ───
  {
    id: 51, name: 'Dugtrio', type1: 'Ground', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Slash', 'Normal', 'rock'),
      paper: m('Earthquake', 'Ground', 'paper'),
      scissors: m('Fissure', 'Ground', 'scissors'),
    },
    unique: unique('Fissure', 'Ground', 'scissors', 'Abre uma fenda no solo. Se vencer e o inimigo for do tipo Terra, Rock ou Aço, causa derrota instantânea (KO).'),
  },
  // ─── #52 MEOWTH ───
  {
    id: 52, name: 'Meowth', type1: 'Normal', type2: null, rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Scratch', 'Normal', 'rock'),
      paper: m('Pay Day', 'Normal', 'paper'),
      scissors: m('Growl', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #53 PERSIAN ───
  {
    id: 53, name: 'Persian', type1: 'Normal', type2: null, rarity: 'rara',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Slash', 'Normal', 'rock'),
      paper: m('Swift', 'Normal', 'paper'),
      scissors: m('Feint Attack', 'Normal', 'scissors'),
    },
    unique: unique('Swift', 'Normal', 'paper', 'Ataque que nunca erra. Se houver empate no Jokenpô, ainda causa 1 de dano ao inimigo.'),
  },
  // ─── #54 PSYDUCK ───
  {
    id: 54, name: 'Psyduck', type1: 'Water', type2: null, rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Water Gun', 'Water', 'rock'),
      paper: m('Confusion', 'Psychic', 'paper'),
      scissors: m('Tail Whip', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #55 GOLDUCK ───
  {
    id: 55, name: 'Golduck', type1: 'Water', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Hydro Pump', 'Water', 'rock'),
      paper: m('Psybeam', 'Psychic', 'paper'),
      scissors: m('Aqua Tail', 'Water', 'scissors'),
    },
    unique: unique('Zen Headbutt', 'Psychic', 'rock', 'Golpe psíquico poderoso. Se vencer, ignora qualquer habilidade passiva do inimigo neste turno.'),
  },
  // ─── #56 MANKEY ───
  {
    id: 56, name: 'Mankey', type1: 'Fighting', type2: null, rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Karate Chop', 'Fighting', 'rock'),
      paper: m('Low Kick', 'Fighting', 'paper'),
      scissors: m('Fury Swipes', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #57 PRIMEAPE ───
  {
    id: 57, name: 'Primeape', type1: 'Fighting', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Cross Chop', 'Fighting', 'rock'),
      paper: m('Close Combat', 'Fighting', 'paper'),
      scissors: m('Rage', 'Normal', 'scissors'),
    },
    unique: unique('Cross Chop', 'Fighting', 'rock', 'Golpe cruzado com chance de crítico. Se vencer, tem 50% de chance de causar 2 de dano em vez de 1.'),
  },
  // ─── #58 GROWLITHE ───
  {
    id: 58, name: 'Growlithe', type1: 'Fire', type2: null, rarity: 'rara',
    ability: ability('FlashFire', 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Ember', 'Fire', 'rock'),
      paper: m('Bite', 'Normal', 'paper'),
      scissors: m('Roar', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #59 ARCANINE ───
  {
    id: 59, name: 'Arcanine', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ability('FlashFire', 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Flamethrower', 'Fire', 'rock'),
      paper: m('ExtremeSpeed', 'Normal', 'paper'),
      scissors: m('Crunch', 'Normal', 'scissors'),
    },
    unique: unique('ExtremeSpeed', 'Normal', 'paper', 'Velocidade extrema que age antes de qualquer coisa. Ao empatar no Jokenpô, Arcanine vence o empate e causa 1 de dano.'),
  },
  // ─── #60 POLIWAG ───
  {
    id: 60, name: 'Poliwag', type1: 'Water', type2: null, rarity: 'comum',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Water Gun', 'Water', 'rock'),
      paper: m('Bubble', 'Water', 'paper'),
      scissors: m('Hypnosis', 'Psychic', 'scissors'),
    },
    unique: null,
  },
  // ─── #61 POLIWHIRL ───
  {
    id: 61, name: 'Poliwhirl', type1: 'Water', type2: null, rarity: 'rara',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Bubble Beam', 'Water', 'rock'),
      paper: m('Body Slam', 'Normal', 'paper'),
      scissors: m('Hypnosis', 'Psychic', 'scissors'),
    },
    unique: null,
  },
  // ─── #62 POLIWRATH ───
  {
    id: 62, name: 'Poliwrath', type1: 'Water', type2: 'Fighting', rarity: 'ultra-rara',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Waterfall', 'Water', 'rock'),
      paper: m('Dynamic Punch', 'Fighting', 'paper'),
      scissors: m('Submission', 'Fighting', 'scissors'),
    },
    unique: unique('Dynamic Punch', 'Fighting', 'paper', 'Soco tão poderoso que sempre confunde. Se vencer, o inimigo fica confuso por 2 turnos (Jokenpô aleatório).'),
  },
  // ─── #63 ABRA ───
  {
    id: 63, name: 'Abra', type1: 'Psychic', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Confusion', 'Psychic', 'rock'),
      paper: m('Teleport', 'Normal', 'paper'),
      scissors: m('Hidden Power', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #64 KADABRA ───
  {
    id: 64, name: 'Kadabra', type1: 'Psychic', type2: null, rarity: 'rara',
    ability: ability('Synchronize', 'Quando sofre um status, o inimigo recebe o mesmo status por 1 turno.'),
    moves: {
      rock: m('Psybeam', 'Psychic', 'rock'),
      paper: m('Recover', 'Normal', 'paper'),
      scissors: m('Disable', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #65 ALAKAZAM ───
  {
    id: 65, name: 'Alakazam', type1: 'Psychic', type2: null, rarity: 'ultra-rara',
    ability: ability('Synchronize', 'Quando sofre um status, o inimigo recebe o mesmo status por 1 turno.'),
    moves: {
      rock: m('Psychic', 'Psychic', 'rock'),
      paper: m('Calm Mind', 'Psychic', 'paper'),
      scissors: m('Future Sight', 'Psychic', 'scissors'),
    },
    unique: unique('Future Sight', 'Psychic', 'scissors', 'Prevê o futuro: escolhe o Jokenpô do próximo turno agora. Se acertar a previsão, causa 2 de dano.'),
  },
  // ─── #66 MACHOP ───
  {
    id: 66, name: 'Machop', type1: 'Fighting', type2: null, rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Karate Chop', 'Fighting', 'rock'),
      paper: m('Low Kick', 'Fighting', 'paper'),
      scissors: m('Bulk Up', 'Fighting', 'scissors'),
    },
    unique: null,
  },
  // ─── #67 MACHOKE ───
  {
    id: 67, name: 'Machoke', type1: 'Fighting', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Cross Chop', 'Fighting', 'rock'),
      paper: m('Submission', 'Fighting', 'paper'),
      scissors: m('Scary Face', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #68 MACHAMP ───
  {
    id: 68, name: 'Machamp', type1: 'Fighting', type2: null, rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Dynamic Punch', 'Fighting', 'rock'),
      paper: m('Close Combat', 'Fighting', 'paper'),
      scissors: m('No Retreat', 'Fighting', 'scissors'),
    },
    unique: unique('No Retreat', 'Fighting', 'scissors', 'Compromete-se totalmente ao ataque. Causa +1 de dano por 3 turnos, mas não pode usar Switch durante esse tempo.'),
  },
  // ─── #69 BELLSPROUT ───
  {
    id: 69, name: 'Bellsprout', type1: 'Grass', type2: 'Poison', rarity: 'comum',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Vine Whip', 'Grass', 'rock'),
      paper: m('Acid', 'Poison', 'paper'),
      scissors: m('Sleep Powder', 'Grass', 'scissors'),
    },
    unique: null,
  },
  // ─── #70 WEEPINBELL ───
  {
    id: 70, name: 'Weepinbell', type1: 'Grass', type2: 'Poison', rarity: 'rara',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Razor Leaf', 'Grass', 'rock'),
      paper: m('Sludge', 'Poison', 'paper'),
      scissors: m('Stun Spore', 'Grass', 'scissors'),
    },
    unique: null,
  },
  // ─── #71 VICTREEBEL ───
  {
    id: 71, name: 'Victreebel', type1: 'Grass', type2: 'Poison', rarity: 'ultra-rara',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Leaf Blade', 'Grass', 'rock'),
      paper: m('Sludge Bomb', 'Poison', 'paper'),
      scissors: m('Leaf Tornado', 'Grass', 'scissors'),
    },
    unique: unique('Leaf Storm', 'Grass', 'rock', 'Furacão de folhas afiadas. Causa 2 de dano se vencer, mas reduz o próprio poder: próximo ataque de Grama causa 1 de dano base.'),
  },
  // ─── #72 TENTACOOL ───
  {
    id: 72, name: 'Tentacool', type1: 'Water', type2: 'Poison', rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Bubble', 'Water', 'rock'),
      paper: m('Acid', 'Poison', 'paper'),
      scissors: m('Wrap', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #73 TENTACRUEL ───
  {
    id: 73, name: 'Tentacruel', type1: 'Water', type2: 'Poison', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Hydro Pump', 'Water', 'rock'),
      paper: m('Sludge Wave', 'Poison', 'paper'),
      scissors: m('Barrier', 'Psychic', 'scissors'),
    },
    unique: unique('Acid Spray', 'Poison', 'scissors', 'Spray corrosivo que enfraquece defesas. Se vencer, o inimigo toma +1 de dano em todos os ataques pelo próximo turno.'),
  },
  // ─── #74 GEODUDE ───
  {
    id: 74, name: 'Geodude', type1: 'Rock', type2: 'Ground', rarity: 'comum',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Rock Throw', 'Rock', 'rock'),
      paper: m('Tackle', 'Normal', 'paper'),
      scissors: m('Magnitude', 'Ground', 'scissors'),
    },
    unique: null,
  },
  // ─── #75 GRAVELER ───
  {
    id: 75, name: 'Graveler', type1: 'Rock', type2: 'Ground', rarity: 'rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Rock Blast', 'Rock', 'rock'),
      paper: m('Rollout', 'Rock', 'paper'),
      scissors: m('Earthquake', 'Ground', 'scissors'),
    },
    unique: null,
  },
  // ─── #76 GOLEM ───
  {
    id: 76, name: 'Golem', type1: 'Rock', type2: 'Ground', rarity: 'ultra-rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Stone Edge', 'Rock', 'rock'),
      paper: m('Earthquake', 'Ground', 'paper'),
      scissors: m('Explosion', 'Normal', 'scissors'),
    },
    unique: unique('Explosion', 'Normal', 'scissors', 'Explosão catastrófica. Causa 3 de dano ao inimigo se vencer, mas Golem também perde 2 corações.'),
  },
  // ─── #77 PONYTA ───
  {
    id: 77, name: 'Ponyta', type1: 'Fire', type2: null, rarity: 'rara',
    ability: ability('FlashFire', 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Ember', 'Fire', 'rock'),
      paper: m('Stomp', 'Normal', 'paper'),
      scissors: m('Flame Charge', 'Fire', 'scissors'),
    },
    unique: null,
  },
  // ─── #78 RAPIDASH ───
  {
    id: 78, name: 'Rapidash', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ability('FlashFire', 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Fire Blast', 'Fire', 'rock'),
      paper: m('High Horsepower', 'Ground', 'paper'),
      scissors: m('Drill Run', 'Ground', 'scissors'),
    },
    unique: unique('Flame Charge', 'Fire', 'scissors', 'Carrega em chamas acumulando velocidade. A cada vitória consecutiva no Jokenpô, causa +1 de dano extra (acumula até +3).'),
  },
  // ─── #79 SLOWPOKE ───
  {
    id: 79, name: 'Slowpoke', type1: 'Water', type2: 'Psychic', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Water Gun', 'Water', 'rock'),
      paper: m('Confusion', 'Psychic', 'paper'),
      scissors: m('Amnesia', 'Psychic', 'scissors'),
    },
    unique: null,
  },
  // ─── #80 SLOWBRO ───
  {
    id: 80, name: 'Slowbro', type1: 'Water', type2: 'Psychic', rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Scald', 'Water', 'rock'),
      paper: m('Psychic', 'Psychic', 'paper'),
      scissors: m('Slack Off', 'Normal', 'scissors'),
    },
    unique: unique('Slack Off', 'Normal', 'scissors', 'Tão lento que confunde a IA inimiga. Se perder no Jokenpô, a IA ignora o dano com 50% de chance (ele dormiu no golpe).'),
  },
  // ─── #81 MAGNEMITE ───
  {
    id: 81, name: 'Magnemite', type1: 'Electric', type2: 'Steel', rarity: 'rara',
    ability: ability('VoltAbsorb', 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Thunder Shock', 'Electric', 'rock'),
      paper: m('Metal Sound', 'Steel', 'paper'),
      scissors: m('Spark', 'Electric', 'scissors'),
    },
    unique: null,
  },
  // ─── #82 MAGNETON ───
  {
    id: 82, name: 'Magneton', type1: 'Electric', type2: 'Steel', rarity: 'ultra-rara',
    ability: ability('VoltAbsorb', 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Thunderbolt', 'Electric', 'rock'),
      paper: m('Flash Cannon', 'Steel', 'paper'),
      scissors: m('Tri Attack', 'Normal', 'scissors'),
    },
    unique: unique('Tri Attack', 'Normal', 'scissors', 'Ataca com 3 elementos ao mesmo tempo. Ao vencer, sorteia entre queimadura, paralisia ou congelamento (1 turno cada).'),
  },
  // ─── #83 FARFETCH'D ───
  {
    id: 83, name: "Farfetch'd", type1: 'Normal', type2: 'Flying', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Slash', 'Normal', 'rock'),
      paper: m('Air Cutter', 'Flying', 'paper'),
      scissors: m('Night Slash', 'Normal', 'scissors'),
    },
    unique: unique('Stick', 'Normal', 'rock', 'Golpe com o galho sagrado. Tem 33% de chance de crítico a cada turno — se crítico, causa 2 de dano.'),
  },
  // ─── #84 DODUO ───
  {
    id: 84, name: 'Doduo', type1: 'Normal', type2: 'Flying', rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Peck', 'Flying', 'rock'),
      paper: m('Fury Attack', 'Normal', 'paper'),
      scissors: m('Growl', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #85 DODRIO ───
  {
    id: 85, name: 'Dodrio', type1: 'Normal', type2: 'Flying', rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Drill Peck', 'Flying', 'rock'),
      paper: m('Tri Attack', 'Normal', 'paper'),
      scissors: m('Agility', 'Normal', 'scissors'),
    },
    unique: unique('Tri Attack', 'Normal', 'paper', 'Três cabeças atacam ao mesmo tempo. Ao vencer, pode usar o mesmo Jokenpô vencedor gratuitamente no próximo turno.'),
  },
  // ─── #86 SEEL ───
  {
    id: 86, name: 'Seel', type1: 'Water', type2: null, rarity: 'comum',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Aurora Beam', 'Ice', 'rock'),
      paper: m('Water Gun', 'Water', 'paper'),
      scissors: m('Headbutt', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #87 DEWGONG ───
  {
    id: 87, name: 'Dewgong', type1: 'Water', type2: 'Ice', rarity: 'rara',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Ice Beam', 'Ice', 'rock'),
      paper: m('Surf', 'Water', 'paper'),
      scissors: m('Sheer Cold', 'Ice', 'scissors'),
    },
    unique: unique('Sheer Cold', 'Ice', 'scissors', 'Frio absoluto. Se vencer e o inimigo for do tipo Água, Grama, Voador ou Dragão, causa KO instantâneo.'),
  },
  // ─── #88 GRIMER ───
  {
    id: 88, name: 'Grimer', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Poison Gas', 'Poison', 'rock'),
      paper: m('Acid', 'Poison', 'paper'),
      scissors: m('Minimize', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #89 MUK ───
  {
    id: 89, name: 'Muk', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Sludge Bomb', 'Poison', 'rock'),
      paper: m('Gunk Shot', 'Poison', 'paper'),
      scissors: m('Acid Armor', 'Poison', 'scissors'),
    },
    unique: unique('Acid Armor', 'Poison', 'scissors', 'Dissolve completamente sua forma. Por 2 turnos, todos os ataques físicos inimigos causam 0 de dano (imunidade).'),
  },
  // ─── #90 SHELLDER ───
  {
    id: 90, name: 'Shellder', type1: 'Water', type2: null, rarity: 'comum',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Tackle', 'Normal', 'rock'),
      paper: m('Water Gun', 'Water', 'paper'),
      scissors: m('Withdraw', 'Water', 'scissors'),
    },
    unique: null,
  },
  // ─── #91 CLOYSTER ───
  {
    id: 91, name: 'Cloyster', type1: 'Water', type2: 'Ice', rarity: 'ultra-rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Icicle Spear', 'Ice', 'rock'),
      paper: m('Surf', 'Water', 'paper'),
      scissors: m('Spike Cannon', 'Normal', 'scissors'),
    },
    unique: unique('Shell Smash', 'Normal', 'scissors', 'Quebra a própria concha liberando toda a potência. Por 3 turnos, todos os ataques causam +1 de dano, mas defesa cai (recebe +1 de dano).'),
  },
  // ─── #92 GASTLY ───
  {
    id: 92, name: 'Gastly', type1: 'Ghost', type2: 'Poison', rarity: 'rara',
    ability: ability('Levitate', 'Imune a ataques do tipo Terra.'),
    moves: {
      rock: m('Lick', 'Ghost', 'rock'),
      paper: m('Hypnosis', 'Psychic', 'paper'),
      scissors: m('Night Shade', 'Ghost', 'scissors'),
    },
    unique: null,
  },
  // ─── #93 HAUNTER ───
  {
    id: 93, name: 'Haunter', type1: 'Ghost', type2: 'Poison', rarity: 'rara',
    ability: ability('Levitate', 'Imune a ataques do tipo Terra.'),
    moves: {
      rock: m('Shadow Ball', 'Ghost', 'rock'),
      paper: m('Dream Eater', 'Psychic', 'paper'),
      scissors: m('Confuse Ray', 'Ghost', 'scissors'),
    },
    unique: null,
  },
  // ─── #94 GENGAR ───
  {
    id: 94, name: 'Gengar', type1: 'Ghost', type2: 'Poison', rarity: 'ultra-rara',
    ability: ability('Levitate', 'Imune a ataques do tipo Terra.'),
    moves: {
      rock: m('Shadow Ball', 'Ghost', 'rock'),
      paper: m('Sludge Wave', 'Poison', 'paper'),
      scissors: m('Hex', 'Ghost', 'scissors'),
    },
    unique: unique('Shadow Ball', 'Ghost', 'rock', 'Esfera de trevas que atravessa qualquer barreira. Se vencer, ignora as habilidades passivas e imunidades do inimigo neste turno.'),
  },
  // ─── #95 ONIX ───
  {
    id: 95, name: 'Onix', type1: 'Rock', type2: 'Ground', rarity: 'rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Rock Throw', 'Rock', 'rock'),
      paper: m('Bind', 'Normal', 'paper'),
      scissors: m('Sandstorm', 'Rock', 'scissors'),
    },
    unique: null,
  },
  // ─── #96 DROWZEE ───
  {
    id: 96, name: 'Drowzee', type1: 'Psychic', type2: null, rarity: 'rara',
    ability: ability('Synchronize', 'Quando sofre um status, o inimigo recebe o mesmo status por 1 turno.'),
    moves: {
      rock: m('Confusion', 'Psychic', 'rock'),
      paper: m('Headbutt', 'Normal', 'paper'),
      scissors: m('Hypnosis', 'Psychic', 'scissors'),
    },
    unique: null,
  },
  // ─── #97 HYPNO ───
  {
    id: 97, name: 'Hypno', type1: 'Psychic', type2: null, rarity: 'ultra-rara',
    ability: ability('Synchronize', 'Quando sofre um status, o inimigo recebe o mesmo status por 1 turno.'),
    moves: {
      rock: m('Psychic', 'Psychic', 'rock'),
      paper: m('Dream Eater', 'Psychic', 'paper'),
      scissors: m('Hypnosis', 'Psychic', 'scissors'),
    },
    unique: unique('Dream Eater', 'Psychic', 'paper', 'Devora os sonhos do inimigo dormindo. Só funciona se inimigo estiver dormindo; se sim, causa 2 de dano e recupera 2 corações.'),
  },
  // ─── #98 KRABBY ───
  {
    id: 98, name: 'Krabby', type1: 'Water', type2: null, rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Vicegrip', 'Normal', 'rock'),
      paper: m('Bubble', 'Water', 'paper'),
      scissors: m('Harden', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #99 KINGLER ───
  {
    id: 99, name: 'Kingler', type1: 'Water', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Crabhammer', 'Water', 'rock'),
      paper: m('Stomp', 'Normal', 'paper'),
      scissors: m('Guillotine', 'Normal', 'scissors'),
    },
    unique: unique('Guillotine', 'Normal', 'rock', 'Golpe da guilhotina. 25% de chance de KO instantâneo ao vencer. Se não KO, causa 2 de dano normal.'),
  },
  // ─── #100 VOLTORB ───
  {
    id: 100, name: 'Voltorb', type1: 'Electric', type2: null, rarity: 'rara',
    ability: ability('VoltAbsorb', 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Thunder Shock', 'Electric', 'rock'),
      paper: m('Spark', 'Electric', 'paper'),
      scissors: m('Self-Destruct', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #101 ELECTRODE ───
  {
    id: 101, name: 'Electrode', type1: 'Electric', type2: null, rarity: 'ultra-rara',
    ability: ability('VoltAbsorb', 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Thunderbolt', 'Electric', 'rock'),
      paper: m('Swift', 'Normal', 'paper'),
      scissors: m('Explosion', 'Normal', 'scissors'),
    },
    unique: unique('Explosion', 'Normal', 'scissors', 'Autodetona com energia máxima. Causa 3 de dano ao inimigo, mas Electrode é derrotado. Só pode ser usado uma vez.'),
  },
  // ─── #102 EXEGGCUTE ───
  {
    id: 102, name: 'Exeggcute', type1: 'Grass', type2: 'Psychic', rarity: 'rara',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Confusion', 'Psychic', 'rock'),
      paper: m('Absorb', 'Grass', 'paper'),
      scissors: m('Sleep Powder', 'Grass', 'scissors'),
    },
    unique: null,
  },
  // ─── #103 EXEGGUTOR ───
  {
    id: 103, name: 'Exeggutor', type1: 'Grass', type2: 'Psychic', rarity: 'ultra-rara',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Psychic', 'Psychic', 'rock'),
      paper: m('Solar Beam', 'Grass', 'paper'),
      scissors: m('Egg Bomb', 'Normal', 'scissors'),
    },
    unique: unique('Egg Bomb', 'Normal', 'scissors', 'Lança bombas-ovo em sequência. Se vencer, 50% de chance de atordoar o inimigo (usa o mesmo Jokenpô do turno anterior).'),
  },
  // ─── #104 CUBONE ───
  {
    id: 104, name: 'Cubone', type1: 'Ground', type2: null, rarity: 'comum',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Bonemerang', 'Ground', 'rock'),
      paper: m('Bone Club', 'Ground', 'paper'),
      scissors: m('Growl', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #105 MAROWAK ───
  {
    id: 105, name: 'Marowak', type1: 'Ground', type2: null, rarity: 'rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Bonemerang', 'Ground', 'rock'),
      paper: m('Bone Rush', 'Ground', 'paper'),
      scissors: m('Headbutt', 'Normal', 'scissors'),
    },
    unique: unique('Bone Rush', 'Ground', 'paper', 'Golpeia com o osso de 2 a 5 vezes. Cada acerto que ganhar no Jokenpô causa 1 de dano.'),
  },
  // ─── #106 HITMONLEE ───
  {
    id: 106, name: 'Hitmonlee', type1: 'Fighting', type2: null, rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('High Jump Kick', 'Fighting', 'rock'),
      paper: m('Rolling Kick', 'Fighting', 'paper'),
      scissors: m('Blaze Kick', 'Fire', 'scissors'),
    },
    unique: unique('High Jump Kick', 'Fighting', 'rock', 'Chute voador devastador. Se vencer, causa 2 de dano. Se perder, Hitmonlee sofre 1 de dano a si mesmo.'),
  },
  // ─── #107 HITMONCHAN ───
  {
    id: 107, name: 'Hitmonchan', type1: 'Fighting', type2: null, rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Mega Punch', 'Normal', 'rock'),
      paper: m('Thunder Punch', 'Electric', 'paper'),
      scissors: m('Ice Punch', 'Ice', 'scissors'),
    },
    unique: unique('Mach Punch', 'Fighting', 'paper', 'Soco mais rápido que a luz. Ao empatar no Jokenpô, Hitmonchan vence e causa 1 de dano.'),
  },
  // ─── #108 LICKITUNG ───
  {
    id: 108, name: 'Lickitung', type1: 'Normal', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Lick', 'Ghost', 'rock'),
      paper: m('Body Slam', 'Normal', 'paper'),
      scissors: m('Wrap', 'Normal', 'scissors'),
    },
    unique: unique('Wrap', 'Normal', 'scissors', 'Enrolado e preso. Se vencer, o inimigo perde 1 coração por turno por 3 turnos e não pode trocar de Pokémon.'),
  },
  // ─── #109 KOFFING ───
  {
    id: 109, name: 'Koffing', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ability('Levitate', 'Imune a ataques do tipo Terra.'),
    moves: {
      rock: m('Smog', 'Poison', 'rock'),
      paper: m('Sludge', 'Poison', 'paper'),
      scissors: m('Smokescreen', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #110 WEEZING ───
  {
    id: 110, name: 'Weezing', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ability('Levitate', 'Imune a ataques do tipo Terra.'),
    moves: {
      rock: m('Sludge Bomb', 'Poison', 'rock'),
      paper: m('Gunk Shot', 'Poison', 'paper'),
      scissors: m('Destiny Bond', 'Ghost', 'scissors'),
    },
    unique: unique('Destiny Bond', 'Ghost', 'scissors', 'Liga os destinos. Se Weezing for derrotado no próximo turno, o inimigo também é derrotado imediatamente.'),
  },
  // ─── #111 RHYHORN ───
  {
    id: 111, name: 'Rhyhorn', type1: 'Ground', type2: 'Rock', rarity: 'rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Stomp', 'Normal', 'rock'),
      paper: m('Rock Blast', 'Rock', 'paper'),
      scissors: m('Horn Attack', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #112 RHYDON ───
  {
    id: 112, name: 'Rhydon', type1: 'Ground', type2: 'Rock', rarity: 'ultra-rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Hammer Arm', 'Fighting', 'rock'),
      paper: m('Earthquake', 'Ground', 'paper'),
      scissors: m('Rock Wrecker', 'Rock', 'scissors'),
    },
    unique: unique('Rock Wrecker', 'Rock', 'scissors', 'Lança uma rocha gigante. Se vencer, causa 2 de dano mas fica recarregando no turno seguinte.'),
  },
  // ─── #113 CHANSEY ───
  {
    id: 113, name: 'Chansey', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Double Slap', 'Normal', 'rock'),
      paper: m('Egg Bomb', 'Normal', 'paper'),
      scissors: m('Soft-Boiled', 'Normal', 'scissors'),
    },
    unique: unique('Soft-Boiled', 'Normal', 'scissors', 'Chansey usa scissors para se curar. Se vencer, recupera 2 corações em vez de causar dano.'),
  },
  // ─── #114 TANGELA ───
  {
    id: 114, name: 'Tangela', type1: 'Grass', type2: null, rarity: 'rara',
    ability: ability('Overgrow', 'Quando com 1 coração restante, ataques de Grama causam +1 de dano.'),
    moves: {
      rock: m('Vine Whip', 'Grass', 'rock'),
      paper: m('Bind', 'Normal', 'paper'),
      scissors: m('Slam', 'Normal', 'scissors'),
    },
    unique: unique('Bind', 'Normal', 'paper', 'Envolve o inimigo com cipós. Se vencer, o inimigo perde 1 coração por turno por 3 turnos e não pode trocar.'),
  },
  // ─── #115 KANGASKHAN ───
  {
    id: 115, name: 'Kangaskhan', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Comet Punch', 'Normal', 'rock'),
      paper: m('Dizzy Punch', 'Normal', 'paper'),
      scissors: m('Tail Whip', 'Normal', 'scissors'),
    },
    unique: unique('Parental Bond', 'Normal', 'rock', 'Ataca duas vezes: mãe e filhote juntos. Vencer causa 2 de dano total (1 por golpe), mas cada golpe é calculado separadamente.'),
  },
  // ─── #116 HORSEA ───
  {
    id: 116, name: 'Horsea', type1: 'Water', type2: null, rarity: 'comum',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Water Gun', 'Water', 'rock'),
      paper: m('Bubble', 'Water', 'paper'),
      scissors: m('Smokescreen', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #117 SEADRA ───
  {
    id: 117, name: 'Seadra', type1: 'Water', type2: null, rarity: 'rara',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Twister', 'Dragon', 'rock'),
      paper: m('Bubble Beam', 'Water', 'paper'),
      scissors: m('Agility', 'Normal', 'scissors'),
    },
    unique: unique('Dragon Rage', 'Dragon', 'rock', 'Raiva dracônica que causa sempre exatamente 2 de dano ao vencer, independente de tipo ou habilidades.'),
  },
  // ─── #118 GOLDEEN ───
  {
    id: 118, name: 'Goldeen', type1: 'Water', type2: null, rarity: 'comum',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Horn Attack', 'Normal', 'rock'),
      paper: m('Water Gun', 'Water', 'paper'),
      scissors: m('Supersonic', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #119 SEAKING ───
  {
    id: 119, name: 'Seaking', type1: 'Water', type2: null, rarity: 'rara',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Megahorn', 'Bug', 'rock'),
      paper: m('Waterfall', 'Water', 'paper'),
      scissors: m('Aqua Tail', 'Water', 'scissors'),
    },
    unique: unique('Megahorn', 'Bug', 'rock', 'Chifrada mega poderosa. Se vencer contra um Pokémon Psíquico ou Escuro, causa 3 de dano.'),
  },
  // ─── #120 STARYU ───
  {
    id: 120, name: 'Staryu', type1: 'Water', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Water Gun', 'Water', 'rock'),
      paper: m('Rapid Spin', 'Normal', 'paper'),
      scissors: m('Swift', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #121 STARMIE ───
  {
    id: 121, name: 'Starmie', type1: 'Water', type2: 'Psychic', rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Hydro Pump', 'Water', 'rock'),
      paper: m('Psychic', 'Psychic', 'paper'),
      scissors: m('Thunderbolt', 'Electric', 'scissors'),
    },
    unique: unique('Power Gem', 'Rock', 'rock', 'Dispara raios da joia central. Se vencer, escolhe um tipo extra aleatório para o ataque — podendo ser super efetivo no inimigo.'),
  },
  // ─── #122 MR. MIME ───
  {
    id: 122, name: 'Mr. Mime', type1: 'Psychic', type2: 'Fairy', rarity: 'ultra-rara',
    ability: ability('Synchronize', 'Quando sofre um status, o inimigo recebe o mesmo status por 1 turno.'),
    moves: {
      rock: m('Psybeam', 'Psychic', 'rock'),
      paper: m('Dazzling Gleam', 'Fairy', 'paper'),
      scissors: m('Barrier', 'Psychic', 'scissors'),
    },
    unique: unique('Barrier', 'Psychic', 'scissors', 'Ergue uma barreira invisível. Por 2 turnos, ataques que perderem no Jokenpô causam 0 de dano em vez do normal.'),
  },
  // ─── #123 SCYTHER ───
  {
    id: 123, name: 'Scyther', type1: 'Bug', type2: 'Flying', rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('X-Scissor', 'Bug', 'rock'),
      paper: m('Wing Attack', 'Flying', 'paper'),
      scissors: m('Slash', 'Normal', 'scissors'),
    },
    unique: unique('Slash', 'Normal', 'scissors', 'Sempre tem chance elevada de crítico. Se vencer, tem 50% de chance de causar 2 de dano em vez de 1.'),
  },
  // ─── #124 JYNX ───
  {
    id: 124, name: 'Jynx', type1: 'Ice', type2: 'Psychic', rarity: 'ultra-rara',
    ability: ability('Synchronize', 'Quando sofre um status, o inimigo recebe o mesmo status por 1 turno.'),
    moves: {
      rock: m('Blizzard', 'Ice', 'rock'),
      paper: m('Psychic', 'Psychic', 'paper'),
      scissors: m('Lovely Kiss', 'Normal', 'scissors'),
    },
    unique: unique('Lovely Kiss', 'Normal', 'scissors', 'Beijo amaldiçoado. Se vencer, o inimigo dorme por 2 turnos (usa rock automaticamente enquanto dorme).'),
  },
  // ─── #125 ELECTABUZZ ───
  {
    id: 125, name: 'Electabuzz', type1: 'Electric', type2: null, rarity: 'ultra-rara',
    ability: ability('VoltAbsorb', 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Thunderbolt', 'Electric', 'rock'),
      paper: m('Thunder Punch', 'Electric', 'paper'),
      scissors: m('Swift', 'Normal', 'scissors'),
    },
    unique: unique('Thunder Punch', 'Electric', 'paper', 'Soco elétrico poderoso. Se vencer, 33% de chance de paralisar o inimigo por 1 turno.'),
  },
  // ─── #126 MAGMAR ───
  {
    id: 126, name: 'Magmar', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ability('FlashFire', 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Fire Blast', 'Fire', 'rock'),
      paper: m('Flamethrower', 'Fire', 'paper'),
      scissors: m('Lava Plume', 'Fire', 'scissors'),
    },
    unique: unique('Lava Plume', 'Fire', 'scissors', 'Erupção de lava que queima o campo. Se vencer, inimigos no banco também sofrem queimadura (1 de dano antes de entrar em campo).'),
  },
  // ─── #127 PINSIR ───
  {
    id: 127, name: 'Pinsir', type1: 'Bug', type2: null, rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Vicegrip', 'Normal', 'rock'),
      paper: m('X-Scissor', 'Bug', 'paper'),
      scissors: m('Submission', 'Fighting', 'scissors'),
    },
    unique: unique('Seismic Toss', 'Fighting', 'rock', 'Arremesso baseado no andar atual da torre. Causa dano igual ao número do andar (mín. 1, máx. 3).'),
  },
  // ─── #128 TAUROS ───
  {
    id: 128, name: 'Tauros', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Body Slam', 'Normal', 'rock'),
      paper: m('Hyper Beam', 'Normal', 'paper'),
      scissors: m('Thrash', 'Normal', 'scissors'),
    },
    unique: unique('Hyper Beam', 'Normal', 'paper', 'O ataque mais poderoso. Se vencer, causa 2 de dano mas Tauros fica sem ação no turno seguinte.'),
  },
  // ─── #129 MAGIKARP ───
  {
    id: 129, name: 'Magikarp', type1: 'Water', type2: null, rarity: 'comum',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Splash', 'Normal', 'rock'),
      paper: m('Tackle', 'Normal', 'paper'),
      scissors: m('Flail', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #130 GYARADOS ───
  {
    id: 130, name: 'Gyarados', type1: 'Water', type2: 'Flying', rarity: 'ultra-rara',
    ability: ability('Intimidate', 'Ao entrar em campo, reduz o dano do próximo ataque inimigo em 1.'),
    moves: {
      rock: m('Waterfall', 'Water', 'rock'),
      paper: m('Dragon Rage', 'Dragon', 'paper'),
      scissors: m('Hyper Beam', 'Normal', 'scissors'),
    },
    unique: unique('Hyper Beam', 'Normal', 'scissors', 'Destruição total. Causa 2 de dano se vencer, mas Gyarados descansa no turno seguinte (usa rock automaticamente).'),
  },
  // ─── #131 LAPRAS ───
  {
    id: 131, name: 'Lapras', type1: 'Water', type2: 'Ice', rarity: 'ultra-rara',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Ice Beam', 'Ice', 'rock'),
      paper: m('Surf', 'Water', 'paper'),
      scissors: m('Thunderbolt', 'Electric', 'scissors'),
    },
    unique: unique('Perish Song', 'Normal', 'scissors', 'Melodia amaldiçoada. Após 3 turnos do uso, tanto Lapras quanto o inimigo ativo são derrotados simultaneamente.'),
  },
  // ─── #132 DITTO ───
  {
    id: 132, name: 'Ditto', type1: 'Normal', type2: null, rarity: 'epico',
    ability: ability('Imposter', 'Ao entrar em campo, copia o tipo e os moves do inimigo ativo. Sempre recebe no máximo 1 de dano por turno.'),
    moves: {
      rock: m('Transform', 'Normal', 'rock'),
      paper: m('Transform', 'Normal', 'paper'),
      scissors: m('Transform', 'Normal', 'scissors'),
    },
    unique: unique('Transform', 'Normal', 'rock', 'Transforma-se no inimigo: copia tipo, moves e habilidade. Após a cópia, age como o Pokémon copiado por toda a batalha.'),
  },
  // ─── #133 EEVEE ───
  {
    id: 133, name: 'Eevee', type1: 'Normal', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Quick Attack', 'Normal', 'rock'),
      paper: m('Bite', 'Normal', 'paper'),
      scissors: m('Tail Whip', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #134 VAPOREON ───
  {
    id: 134, name: 'Vaporeon', type1: 'Water', type2: null, rarity: 'ultra-rara',
    ability: ability('WaterAbsorb', 'Imune a ataques de Água; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Hydro Pump', 'Water', 'rock'),
      paper: m('Aqua Ring', 'Water', 'paper'),
      scissors: m('Last Resort', 'Normal', 'scissors'),
    },
    unique: unique('Aqua Ring', 'Water', 'paper', 'Envolve-se em água curativa. A cada 2 turnos, recupera 1 coração automaticamente durante a batalha.'),
  },
  // ─── #135 JOLTEON ───
  {
    id: 135, name: 'Jolteon', type1: 'Electric', type2: null, rarity: 'ultra-rara',
    ability: ability('VoltAbsorb', 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Thunderbolt', 'Electric', 'rock'),
      paper: m('Pin Missile', 'Bug', 'paper'),
      scissors: m('Thunder Wave', 'Electric', 'scissors'),
    },
    unique: unique('Pin Missile', 'Bug', 'paper', 'Dispara agulhas de pelos. Ao empatar no Jokenpô, Jolteon ainda causa 1 de dano (pelo menos 1 agulha acerta).'),
  },
  // ─── #136 FLAREON ───
  {
    id: 136, name: 'Flareon', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ability('FlashFire', 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Fire Blast', 'Fire', 'rock'),
      paper: m('Flare Blitz', 'Fire', 'paper'),
      scissors: m('Will-O-Wisp', 'Fire', 'scissors'),
    },
    unique: unique('Flare Blitz', 'Fire', 'paper', 'Carrega em chamas com recuo. Causa 2 de dano ao vencer, mas Flareon sofre 1 de dano de recuo.'),
  },
  // ─── #137 PORYGON ───
  {
    id: 137, name: 'Porygon', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ability('NoGuard', 'Todos os ataques acertam, mas o inimigo também não pode errar.'),
    moves: {
      rock: m('Tri Attack', 'Normal', 'rock'),
      paper: m('Psybeam', 'Psychic', 'paper'),
      scissors: m('Conversion', 'Normal', 'scissors'),
    },
    unique: unique('Conversion', 'Normal', 'scissors', 'Muda seu tipo para o tipo do último ataque vencedor. A imunidade e resistências mudam junto pelo resto da batalha.'),
  },
  // ─── #138 OMANYTE ───
  {
    id: 138, name: 'Omanyte', type1: 'Rock', type2: 'Water', rarity: 'rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Water Gun', 'Water', 'rock'),
      paper: m('Rock Blast', 'Rock', 'paper'),
      scissors: m('Withdraw', 'Water', 'scissors'),
    },
    unique: null,
  },
  // ─── #139 OMASTAR ───
  {
    id: 139, name: 'Omastar', type1: 'Rock', type2: 'Water', rarity: 'ultra-rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Ancient Power', 'Rock', 'rock'),
      paper: m('Hydro Pump', 'Water', 'paper'),
      scissors: m('Spike Cannon', 'Normal', 'scissors'),
    },
    unique: unique('Ancient Power', 'Rock', 'rock', 'Poder ancestral que pode aumentar todos os atributos. Se vencer, 20% de chance de causar +1 de dano em todos os ataques pelos próximos 3 turnos.'),
  },
  // ─── #140 KABUTO ───
  {
    id: 140, name: 'Kabuto', type1: 'Rock', type2: 'Water', rarity: 'rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Rock Blast', 'Rock', 'rock'),
      paper: m('Bubble', 'Water', 'paper'),
      scissors: m('Scratch', 'Normal', 'scissors'),
    },
    unique: null,
  },
  // ─── #141 KABUTOPS ───
  {
    id: 141, name: 'Kabutops', type1: 'Rock', type2: 'Water', rarity: 'ultra-rara',
    ability: ability('Sturdy', 'Não pode ser derrotado em um único golpe. Sobrevive com 1 coração se estiver com mais.'),
    moves: {
      rock: m('Stone Edge', 'Rock', 'rock'),
      paper: m('Waterfall', 'Water', 'paper'),
      scissors: m('Slash', 'Normal', 'scissors'),
    },
    unique: unique('Aqua Jet', 'Water', 'scissors', 'Jato de água ultra rápido. Ao empatar no Jokenpô, Kabutops vence o empate e causa 1 de dano.'),
  },
  // ─── #142 AERODACTYL ───
  {
    id: 142, name: 'Aerodactyl', type1: 'Rock', type2: 'Flying', rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Rock Slide', 'Rock', 'rock'),
      paper: m('Wing Attack', 'Flying', 'paper'),
      scissors: m('Hyper Beam', 'Normal', 'scissors'),
    },
    unique: unique('Rock Slide', 'Rock', 'rock', 'Queda de pedras que pode assustar. Se vencer, 30% de chance de o inimigo ficar aterrorizado e usar rock automaticamente no próximo turno.'),
  },
  // ─── #143 SNORLAX ───
  {
    id: 143, name: 'Snorlax', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Body Slam', 'Normal', 'rock'),
      paper: m('Crunch', 'Normal', 'paper'),
      scissors: m('Rest', 'Normal', 'scissors'),
    },
    unique: unique('Rest', 'Normal', 'scissors', 'Dorme profundamente recuperando toda a saúde (3 corações), mas fica dormindo por 2 turnos usando rock automaticamente.'),
  },
  // ─── #144 ARTICUNO ───
  {
    id: 144, name: 'Articuno', type1: 'Ice', type2: 'Flying', rarity: 'lendaria',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Blizzard', 'Ice', 'rock'),
      paper: m('Hurricane', 'Flying', 'paper'),
      scissors: m('Sheer Cold', 'Ice', 'scissors'),
    },
    unique: unique('Sheer Cold', 'Ice', 'scissors', 'Frio absoluto lendário. Se vencer, KO instantâneo em qualquer inimigo do tipo Água, Grama, Voador ou Dragão.'),
  },
  // ─── #145 ZAPDOS ───
  {
    id: 145, name: 'Zapdos', type1: 'Electric', type2: 'Flying', rarity: 'lendaria',
    ability: ability('VoltAbsorb', 'Imune a ataques Elétricos; ao receber um, recupera 1 coração.'),
    moves: {
      rock: m('Thunderbolt', 'Electric', 'rock'),
      paper: m('Drill Peck', 'Flying', 'paper'),
      scissors: m('Thunder', 'Electric', 'scissors'),
    },
    unique: unique('Thunder', 'Electric', 'scissors', 'Raio lendário dos céus. Causa sempre 2 de dano ao vencer, independente de resistências ou imunidades.'),
  },
  // ─── #146 MOLTRES ───
  {
    id: 146, name: 'Moltres', type1: 'Fire', type2: 'Flying', rarity: 'lendaria',
    ability: ability('FlashFire', 'Imune a ataques de Fogo; ao receber um, ataques de Fogo causam +1 de dano.'),
    moves: {
      rock: m('Fire Blast', 'Fire', 'rock'),
      paper: m('Wing Attack', 'Flying', 'paper'),
      scissors: m('Sky Attack', 'Flying', 'scissors'),
    },
    unique: unique('Sky Attack', 'Flying', 'scissors', 'Mergulho em chamas lendário. Causa 2 de dano ao vencer. Se o inimigo for do tipo Grama ou Bug, causa 3 de dano.'),
  },
  // ─── #147 DRATINI ───
  {
    id: 147, name: 'Dratini', type1: 'Dragon', type2: null, rarity: 'rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Twister', 'Dragon', 'rock'),
      paper: m('Wrap', 'Normal', 'paper'),
      scissors: m('Dragon Rage', 'Dragon', 'scissors'),
    },
    unique: null,
  },
  // ─── #148 DRAGONAIR ───
  {
    id: 148, name: 'Dragonair', type1: 'Dragon', type2: null, rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Dragon Rage', 'Dragon', 'rock'),
      paper: m('Aqua Tail', 'Water', 'paper'),
      scissors: m('Outrage', 'Dragon', 'scissors'),
    },
    unique: null,
  },
  // ─── #149 DRAGONITE ───
  {
    id: 149, name: 'Dragonite', type1: 'Dragon', type2: 'Flying', rarity: 'ultra-rara',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Dragon Claw', 'Dragon', 'rock'),
      paper: m('Fly', 'Flying', 'paper'),
      scissors: m('Outrage', 'Dragon', 'scissors'),
    },
    unique: unique('Outrage', 'Dragon', 'scissors', 'Fúria dracônica incontrolável. Causa 2 de dano por 2 turnos consecutivos (força o mesmo Jokenpô em ambos os turnos).'),
  },
  // ─── #150 MEWTWO ───
  {
    id: 150, name: 'Mewtwo', type1: 'Psychic', type2: null, rarity: 'lendaria',
    ability: ability('InnerFocus', 'Imune a efeitos que causem flinch ou interrupção de ataque.'),
    moves: {
      rock: m('Psychic', 'Psychic', 'rock'),
      paper: m('Aura Sphere', 'Fighting', 'paper'),
      scissors: m('Shadow Ball', 'Ghost', 'scissors'),
    },
    unique: unique('Psystrike', 'Psychic', 'rock', 'O ataque mental mais poderoso. Se vencer, ignora completamente a habilidade e os efeitos de status do inimigo. Causa 2 de dano base.'),
  },
  // ─── #151 MEW ───
  {
    id: 151, name: 'Mew', type1: 'Psychic', type2: null, rarity: 'epico',
    ability: ability('Synchronize', 'Todo ataque vencedor de Mew é tratado como super efetivo (causa 2 de dano), independente de tipos.'),
    moves: {
      rock: m('Pound', 'Normal', 'rock'),
      paper: m('Psychic', 'Psychic', 'paper'),
      scissors: m('Ancient Power', 'Rock', 'scissors'),
    },
    unique: unique('Transform', 'Normal', 'rock', 'Mew copia o ataque único do inimigo e o usa imediatamente com as vantagens de sua habilidade (sempre super efetivo).'),
  },
  // ─── #9025 ASH'S PIKACHU ─── (Easter egg — personagem masculino chamado Ash)
  {
    id: 9025, name: "Ash's Pikachu", type1: 'Electric', type2: null, rarity: 'lendaria',
    ability: ability('Lightning Rod', 'Ao perder no Jokenpô, tem 40% de chance de absorver o golpe e não sofrer dano.'),
    moves: {
      rock: m('Thunderbolt', 'Electric', 'rock'),
      paper: m('Surf', 'Water', 'paper'),
      scissors: m('Fly', 'Flying', 'scissors'),
    },
    unique: unique('Volt Tackle', 'Electric', 'rock', 'Carrega com toda energia elétrica. Super efetivo contra Terra e Pedra, ignorando a imunidade elétrica normal. Causa 2 de dano (3 vs Ground/Rock).'),
  },
  // ─── #0 MISSINGNO ───
  {
    id: 0, name: 'MissingNo.', type1: 'Normal', type2: 'Flying', rarity: 'epico',
    ability: ability('Glitch', 'Bug lendário do jogo: ao vencer qualquer Jokenpô, o inimigo é derrotado instantaneamente (KO).'),
    moves: {
      rock: m('Water Gun', 'Water', 'rock'),
      paper: m('Water Gun', 'Water', 'paper'),
      scissors: m('Sky Attack', 'Flying', 'scissors'),
    },
    unique: unique('Glitch Beam', 'Normal', 'rock', '???: emite um raio de dados corrompidos. Ao vencer, causa KO instantâneo. Os dados do inimigo ficam temporariamente ilegíveis.'),
  },
]

export const ASH_PIKACHU_ID = 9025

export function getPokemonById(id: number): PokemonTemplate | undefined {
  return POKEMON_TEMPLATES.find((p) => p.id === id)
}

export function makePokemonCard(id: number, isShiny = false): PokemonCard | undefined {
  const template = getPokemonById(id)
  if (!template) return undefined
  return {
    ...template,
    isShiny,
    hearts: 3,
    isFainted: false,
    statusEffects: [],
  }
}

// Round 1 draft: always the 3 starters
export const STARTER_IDS = [1, 4, 7] as const

// Pokémon available in gym draft pools (excludes legendaries and epics)
export const DRAFT_POOL_COMMON = POKEMON_TEMPLATES.filter(
  (p) => p.rarity === 'comum' && p.id !== 0,
).map((p) => p.id)

export const DRAFT_POOL_RARE = POKEMON_TEMPLATES.filter(
  (p) => p.rarity === 'rara' && p.id !== 0,
).map((p) => p.id)

export const DRAFT_POOL_ULTRA = POKEMON_TEMPLATES.filter(
  (p) => p.rarity === 'ultra-rara',
).map((p) => p.id)

// Post-gym 6+: legendaries become available
export const LEGENDARY_IDS = [144, 145, 146, 150] as const
export const MISSINGNO_ID = 0
