import type { PokemonCard } from '@/types'
import { mv, ab, uniq } from './catalog'

type PokemonTemplate = Omit<PokemonCard, 'hearts' | 'isFainted' | 'statusEffects' | 'isShiny'>

// prettier-ignore
export const POKEMON_TEMPLATES: PokemonTemplate[] = [
  // ─── #1 BULBASAUR ───
  {
    id: 1, name: 'Bulbasaur', type1: 'Grass', type2: 'Poison', rarity: 'comum',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Vine Whip', 'rock'),
      paper: mv('Tackle', 'paper'),
      scissors: mv('Poison Powder', 'scissors'),
    },
    unique: null,
  },
  // ─── #2 IVYSAUR ───
  {
    id: 2, name: 'Ivysaur', type1: 'Grass', type2: 'Poison', rarity: 'rara',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Razor Leaf', 'rock'),
      paper: mv('Body Slam', 'paper'),
      scissors: mv('Poison Powder', 'scissors'),
    },
    unique: null,
  },
  // ─── #3 VENUSAUR ───
  {
    id: 3, name: 'Venusaur', type1: 'Grass', type2: 'Poison', rarity: 'ultra-rara',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Solar Beam', 'rock'),
      paper: mv('Sludge Bomb', 'paper'),
      scissors: mv('Body Slam', 'scissors'),
    },
    unique: uniq('Petal Dance', 'rock', 'Desencadeia 3 pétalas em sequência. Cada pétala causa 1 de dano extra se vencer no Jokenpô.'),
  },
  // ─── #4 CHARMANDER ───
  {
    id: 4, name: 'Charmander', type1: 'Fire', type2: null, rarity: 'comum',
    ability: ab('Blaze'),
    moves: {
      rock: mv('Ember', 'rock'),
      paper: mv('Scratch', 'paper'),
      scissors: mv('Dragon Rage', 'scissors'),
    },
    unique: null,
  },
  // ─── #5 CHARMELEON ───
  {
    id: 5, name: 'Charmeleon', type1: 'Fire', type2: null, rarity: 'rara',
    ability: ab('Blaze'),
    moves: {
      rock: mv('Fire Fang', 'rock'),
      paper: mv('Slash', 'paper'),
      scissors: mv('Dragon Rage', 'scissors'),
    },
    unique: null,
  },
  // ─── #6 CHARIZARD ───
  {
    id: 6, name: 'Charizard', type1: 'Fire', type2: 'Flying', rarity: 'ultra-rara',
    ability: ab('Blaze'),
    moves: {
      rock: mv('Fire Blast', 'rock'),
      paper: mv('Wing Attack', 'paper'),
      scissors: mv('Dragon Rage', 'scissors'),
    },
    unique: uniq('Inferno', 'rock', 'Lança uma chama devastadora. Se vencer no Jokenpô, causa 2 de dano base ignorando resistências.'),
  },
  // ─── #7 SQUIRTLE ───
  {
    id: 7, name: 'Squirtle', type1: 'Water', type2: null, rarity: 'comum',
    ability: ab('Torrent'),
    moves: {
      rock: mv('Water Gun', 'rock'),
      paper: mv('Tackle', 'paper'),
      scissors: mv('Bite', 'scissors'),
    },
    unique: null,
  },
  // ─── #8 WARTORTLE ───
  {
    id: 8, name: 'Wartortle', type1: 'Water', type2: null, rarity: 'rara',
    ability: ab('Torrent'),
    moves: {
      rock: mv('Bubble Beam', 'rock'),
      paper: mv('Rapid Spin', 'paper'),
      scissors: mv('Bite', 'scissors'),
    },
    unique: null,
  },
  // ─── #9 BLASTOISE ───
  {
    id: 9, name: 'Blastoise', type1: 'Water', type2: null, rarity: 'ultra-rara',
    ability: ab('Torrent'),
    moves: {
      rock: mv('Hydro Pump', 'rock'),
      paper: mv('Flash Cannon', 'paper'),
      scissors: mv('Skull Bash', 'scissors'),
    },
    unique: uniq('Hydro Cannon', 'rock', 'Dispara canhões d\'água duplos. Se vencer, causa 2 de dano. Não pode ser usado dois turnos seguidos.'),
  },
  // ─── #10 CATERPIE ───
  {
    id: 10, name: 'Caterpie', type1: 'Bug', type2: null, rarity: 'comum',
    ability: ab('NoGuard'),
    moves: {
      rock: mv('Tackle', 'rock'),
      paper: mv('String Shot', 'paper'),
      scissors: mv('Bug Bite', 'scissors'),
    },
    unique: null,
  },
  // ─── #11 METAPOD ───
  {
    id: 11, name: 'Metapod', type1: 'Bug', type2: null, rarity: 'comum',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Tackle', 'rock'),
      paper: mv('Harden', 'paper'),
      scissors: mv('String Shot', 'scissors'),
    },
    unique: null,
  },
  // ─── #12 BUTTERFREE ───
  {
    id: 12, name: 'Butterfree', type1: 'Bug', type2: 'Flying', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Air Slash', 'rock'),
      paper: mv('Silver Wind', 'paper'),
      scissors: mv('Sleep Powder', 'scissors'),
    },
    unique: uniq('Quiver Dance', 'scissors', 'Dança e potencializa os próximos 2 ataques, causando +1 de dano em cada vitória do Jokenpô.'),
  },
  // ─── #13 WEEDLE ───
  {
    id: 13, name: 'Weedle', type1: 'Bug', type2: 'Poison', rarity: 'comum',
    ability: ab('NoGuard'),
    moves: {
      rock: mv('Poison Sting', 'rock'),
      paper: mv('Tackle', 'paper'),
      scissors: mv('Bug Bite', 'scissors'),
    },
    unique: null,
  },
  // ─── #14 KAKUNA ───
  {
    id: 14, name: 'Kakuna', type1: 'Bug', type2: 'Poison', rarity: 'comum',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Poison Sting', 'rock'),
      paper: mv('Harden', 'paper'),
      scissors: mv('Bug Bite', 'scissors'),
    },
    unique: null,
  },
  // ─── #15 BEEDRILL ───
  {
    id: 15, name: 'Beedrill', type1: 'Bug', type2: 'Poison', rarity: 'rara',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Twineedle', 'rock'),
      paper: mv('Fury Attack', 'paper'),
      scissors: mv('Poison Jab', 'scissors'),
    },
    unique: uniq('Pin Missile', 'rock', 'Dispara 2 a 5 agulhadas. Cada agulhada que vencer no Jokenpô causa 1 de dano.'),
  },
  // ─── #16 PIDGEY ───
  {
    id: 16, name: 'Pidgey', type1: 'Normal', type2: 'Flying', rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Tackle', 'rock'),
      paper: mv('Gust', 'paper'),
      scissors: mv('Sand Attack', 'scissors'),
    },
    unique: null,
  },
  // ─── #17 PIDGEOTTO ───
  {
    id: 17, name: 'Pidgeotto', type1: 'Normal', type2: 'Flying', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Wing Attack', 'rock'),
      paper: mv('Quick Attack', 'paper'),
      scissors: mv('Feather Dance', 'scissors'),
    },
    unique: null,
  },
  // ─── #18 PIDGEOT ───
  {
    id: 18, name: 'Pidgeot', type1: 'Normal', type2: 'Flying', rarity: 'ultra-rara',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Quick Attack', 'rock'),
      paper: mv('Air Slash', 'paper'),
      scissors: mv('Twister', 'scissors'),
    },
    unique: uniq('Hurricane', 'scissors', 'Tempestade de vento que confunde o inimigo. Se vencer, o inimigo usa o mesmo Jokenpô do turno anterior no próximo turno.'),
  },
  // ─── #19 RATTATA ───
  {
    id: 19, name: 'Rattata', type1: 'Normal', type2: null, rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Quick Attack', 'rock'),
      paper: mv('Bite', 'paper'),
      scissors: mv('Tail Whip', 'scissors'),
    },
    unique: null,
  },
  // ─── #20 RATICATE ───
  {
    id: 20, name: 'Raticate', type1: 'Normal', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Thief', 'rock'),
      paper: mv('Super Fang', 'paper'),
      scissors: mv('Counter', 'scissors'),
    },
    unique: uniq('Hyper Fang', 'paper', 'Morde tão forte que reduz os corações do inimigo à metade se vencer no Jokenpô.'),
  },
  // ─── #21 SPEAROW ───
  {
    id: 21, name: 'Spearow', type1: 'Normal', type2: 'Flying', rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Peck', 'rock'),
      paper: mv('Growl', 'paper'),
      scissors: mv('Leer', 'scissors'),
    },
    unique: null,
  },
  // ─── #22 FEAROW ───
  {
    id: 22, name: 'Fearow', type1: 'Normal', type2: 'Flying', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Drill Peck', 'rock'),
      paper: mv('Fury Attack', 'paper'),
      scissors: mv('Mirror Move', 'scissors'),
    },
    unique: uniq('Drill Run', 'rock', 'Ataca em espiral perfurante. Se o tipo do inimigo for fraco a Normal, causa 2 de dano ao vencer.'),
  },
  // ─── #23 EKANS ───
  {
    id: 23, name: 'Ekans', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Poison Sting', 'rock'),
      paper: mv('Wrap', 'paper'),
      scissors: mv('Glare', 'scissors'),
    },
    unique: null,
  },
  // ─── #24 ARBOK ───
  {
    id: 24, name: 'Arbok', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Gunk Shot', 'rock'),
      paper: mv('Crunch', 'paper'),
      scissors: mv('Ice Fang', 'scissors'),
    },
    unique: uniq('Glare', 'scissors', 'O padrão aterrorizante do escudo paralisa o inimigo. Se vencer, o inimigo repete o mesmo Jokenpô por 2 turnos.'),
  },
  // ─── #25 PIKACHU ───
  {
    id: 25, name: 'Pikachu', type1: 'Electric', type2: null, rarity: 'rara',
    ability: ab('VoltAbsorb'),
    moves: {
      rock: mv('Thunder Shock', 'rock'),
      paper: mv('Quick Attack', 'paper'),
      scissors: mv('Iron Tail', 'scissors'),
    },
    unique: null,
  },
  // ─── #26 RAICHU ───
  {
    id: 26, name: 'Raichu', type1: 'Electric', type2: null, rarity: 'ultra-rara',
    ability: ab('VoltAbsorb'),
    moves: {
      rock: mv('Thunderbolt', 'rock'),
      paper: mv('Quick Attack', 'paper'),
      scissors: mv('Iron Tail', 'scissors'),
    },
    unique: uniq('Thunder', 'scissors', 'Invoca um raio do céu. Sempre que vencer no Jokenpô, causa 2 de dano independente de resistências.'),
  },
  // ─── #27 SANDSHREW ───
  {
    id: 27, name: 'Sandshrew', type1: 'Ground', type2: null, rarity: 'comum',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Scratch', 'rock'),
      paper: mv('Gyro Ball', 'paper'),
      scissors: mv('Dig', 'scissors'),
    },
    unique: null,
  },
  // ─── #28 SANDSLASH ───
  {
    id: 28, name: 'Sandslash', type1: 'Ground', type2: null, rarity: 'rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Slash', 'rock'),
      paper: mv('Gyro Ball', 'paper'),
      scissors: mv('Dig', 'scissors'),
    },
    unique: uniq('Rollout', 'paper', 'Vem como um rolo compressor. Se vencer, causa dano a todos os inimigos no banco também (1 de dano extra).'),
  },
  // ─── #29 NIDORAN♀ ───
  {
    id: 29, name: 'Nidoran♀', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Scratch', 'rock'),
      paper: mv('Poison Sting', 'paper'),
      scissors: mv('Growl', 'scissors'),
    },
    unique: null,
  },
  // ─── #30 NIDORINA ───
  {
    id: 30, name: 'Nidorina', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Bite', 'rock'),
      paper: mv('Double Kick', 'paper'),
      scissors: mv('Poison Fang', 'scissors'),
    },
    unique: null,
  },
  // ─── #31 NIDOQUEEN ───
  {
    id: 31, name: 'Nidoqueen', type1: 'Poison', type2: 'Ground', rarity: 'ultra-rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Body Slam', 'rock'),
      paper: mv('Earth Power', 'paper'),
      scissors: mv('Sludge Wave', 'scissors'),
    },
    unique: uniq('Earthquake', 'rock', 'Abalo sísmico. Se vencer, causa dano a todos os inimigos no banco também (1 de dano extra).'),
  },
  // ─── #32 NIDORAN♂ ───
  {
    id: 32, name: 'Nidoran♂', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Horn Attack', 'rock'),
      paper: mv('Poison Sting', 'paper'),
      scissors: mv('Leer', 'scissors'),
    },
    unique: null,
  },
  // ─── #33 NIDORINO ───
  {
    id: 33, name: 'Nidorino', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Horn Attack', 'rock'),
      paper: mv('Double Kick', 'paper'),
      scissors: mv('Poison Jab', 'scissors'),
    },
    unique: null,
  },
  // ─── #34 NIDOKING ───
  {
    id: 34, name: 'Nidoking', type1: 'Poison', type2: 'Ground', rarity: 'ultra-rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Megahorn', 'rock'),
      paper: mv('Earth Power', 'paper'),
      scissors: mv('Poison Jab', 'scissors'),
    },
    unique: uniq('Earthquake', 'rock', 'Abalo sísmico. Se vencer, causa dano a todos os inimigos no banco também (1 de dano extra).'),
  },
  // ─── #35 CLEFAIRY ───
  {
    id: 35, name: 'Clefairy', type1: 'Fairy', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Pound', 'rock'),
      paper: mv('Confusion', 'paper'),
      scissors: mv('Fairy Wind', 'scissors'),
    },
    unique: null,
  },
  // ─── #36 CLEFABLE ───
  {
    id: 36, name: 'Clefable', type1: 'Fairy', type2: null, rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Fairy Wind', 'rock'),
      paper: mv('Stored Power', 'paper'),
      scissors: mv('Minimize', 'scissors'),
    },
    unique: uniq('Metronome', 'paper', 'Usa um ataque aleatório de qualquer tipo. O tipo é sorteado no momento do reveal, podendo ser super efetivo.'),
  },
  // ─── #37 VULPIX ───
  {
    id: 37, name: 'Vulpix', type1: 'Fire', type2: null, rarity: 'rara',
    ability: ab('FlashFire'),
    moves: {
      rock: mv('Ember', 'rock'),
      paper: mv('Quick Attack', 'paper'),
      scissors: mv('Will-O-Wisp', 'scissors'),
    },
    unique: null,
  },
  // ─── #38 NINETALES ───
  {
    id: 38, name: 'Ninetales', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ab('FlashFire'),
    moves: {
      rock: mv('Fire Blast', 'rock'),
      paper: mv('Hex', 'paper'),
      scissors: mv('Nasty Plot', 'scissors'),
    },
    unique: uniq('Inferno', 'scissors', 'Queima o inimigo com chamas amaldiçoadas. Se vencer, o inimigo perde 1 coração adicional no próximo turno (queimadura).'),
  },
  // ─── #39 JIGGLYPUFF ───
  {
    id: 39, name: 'Jigglypuff', type1: 'Normal', type2: 'Fairy', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Pound', 'rock'),
      paper: mv('Disarming Voice', 'paper'),
      scissors: mv('Sing', 'scissors'),
    },
    unique: null,
  },
  // ─── #40 WIGGLYTUFF ───
  {
    id: 40, name: 'Wigglytuff', type1: 'Normal', type2: 'Fairy', rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Body Slam', 'rock'),
      paper: mv('Dazzling Gleam', 'paper'),
      scissors: mv('Sing', 'scissors'),
    },
    unique: uniq('Hyper Voice', 'scissors', 'Grito ensurdecedor que atinge o banco inimigo. Se vencer, todos os inimigos no banco perdem 1 coração.'),
  },
  // ─── #41 ZUBAT ───
  {
    id: 41, name: 'Zubat', type1: 'Poison', type2: 'Flying', rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Absorb', 'rock'),
      paper: mv('Poison Sting', 'paper'),
      scissors: mv('Wing Attack', 'scissors'),
    },
    unique: null,
  },
  // ─── #42 GOLBAT ───
  {
    id: 42, name: 'Golbat', type1: 'Poison', type2: 'Flying', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Air Cutter', 'rock'),
      paper: mv('Poison Fang', 'paper'),
      scissors: mv('Confuse Ray', 'scissors'),
    },
    unique: uniq('Leech Life', 'rock', 'Suga a energia vital do inimigo. Se vencer, recupera 1 coração além de causar o dano normal.'),
  },
  // ─── #43 ODDISH ───
  {
    id: 43, name: 'Oddish', type1: 'Grass', type2: 'Poison', rarity: 'comum',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Absorb', 'rock'),
      paper: mv('Acid', 'paper'),
      scissors: mv('Sleep Powder', 'scissors'),
    },
    unique: null,
  },
  // ─── #44 GLOOM ───
  {
    id: 44, name: 'Gloom', type1: 'Grass', type2: 'Poison', rarity: 'rara',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Mega Drain', 'rock'),
      paper: mv('Sludge', 'paper'),
      scissors: mv('Stun Spore', 'scissors'),
    },
    unique: null,
  },
  // ─── #45 VILEPLUME ───
  {
    id: 45, name: 'Vileplume', type1: 'Grass', type2: 'Poison', rarity: 'ultra-rara',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Mega Drain', 'rock'),
      paper: mv('Sludge Bomb', 'paper'),
      scissors: mv('Moonblast', 'scissors'),
    },
    unique: uniq('Petal Blizzard', 'rock', 'Tempestade de pétalas venenosas. Se vencer, envenena o inimigo causando 1 de dano extra por turno por 2 turnos.'),
  },
  // ─── #46 PARAS ───
  {
    id: 46, name: 'Paras', type1: 'Bug', type2: 'Grass', rarity: 'comum',
    ability: ab('NoGuard'),
    moves: {
      rock: mv('Scratch', 'rock'),
      paper: mv('Absorb', 'paper'),
      scissors: mv('Stun Spore', 'scissors'),
    },
    unique: null,
  },
  // ─── #47 PARASECT ───
  {
    id: 47, name: 'Parasect', type1: 'Bug', type2: 'Grass', rarity: 'rara',
    ability: ab('NoGuard'),
    moves: {
      rock: mv('X-Scissor', 'rock'),
      paper: mv('Giga Drain', 'paper'),
      scissors: mv('Stun Spore', 'scissors'),
    },
    unique: uniq('Spore', 'scissors', 'Nuvem de esporos adormecedores. Se vencer, o inimigo dorme por 1 turno e não escolhe ação (usa rock por padrão).'),
  },
  // ─── #48 VENONAT ───
  {
    id: 48, name: 'Venonat', type1: 'Bug', type2: 'Poison', rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Confusion', 'rock'),
      paper: mv('Poison Powder', 'paper'),
      scissors: mv('Disable', 'scissors'),
    },
    unique: null,
  },
  // ─── #49 VENOMOTH ───
  {
    id: 49, name: 'Venomoth', type1: 'Bug', type2: 'Poison', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Confusion', 'rock'),
      paper: mv('Poison Powder', 'paper'),
      scissors: mv('Bug Buzz', 'scissors'),
    },
    unique: uniq('Psybeam', 'rock', 'Raio psíquico confuso. Se vencer, o inimigo fica confuso e escolhe um Jokenpô aleatório no próximo turno.'),
  },
  // ─── #50 DIGLETT ───
  {
    id: 50, name: 'Diglett', type1: 'Ground', type2: null, rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Scratch', 'rock'),
      paper: mv('Mud Slap', 'paper'),
      scissors: mv('Dig', 'scissors'),
    },
    unique: null,
  },
  // ─── #51 DUGTRIO ───
  {
    id: 51, name: 'Dugtrio', type1: 'Ground', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Slash', 'rock'),
      paper: mv('Earth Power', 'paper'),
      scissors: mv('Rock Slide', 'scissors'),
    },
    unique: uniq('Fissure', 'scissors', 'Abre uma fenda no solo. Se vencer e o inimigo for do tipo Terra, Rock ou Aço, causa derrota instantânea (KO).'),
  },
  // ─── #52 MEOWTH ───
  {
    id: 52, name: 'Meowth', type1: 'Normal', type2: null, rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Scratch', 'rock'),
      paper: mv('Bite', 'paper'),
      scissors: mv('Charm', 'scissors'),
    },
    unique: null,
  },
  // ─── #53 PERSIAN ───
  {
    id: 53, name: 'Persian', type1: 'Normal', type2: null, rarity: 'rara',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Slash', 'rock'),
      paper: mv('Bite', 'paper'),
      scissors: mv('Charm', 'scissors'),
    },
    unique: uniq('Swift', 'paper', 'Ataque que nunca erra. Se houver empate no Jokenpô, ainda causa 1 de dano ao inimigo.'),
  },
  // ─── #54 PSYDUCK ───
  {
    id: 54, name: 'Psyduck', type1: 'Water', type2: null, rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Water Gun', 'rock'),
      paper: mv('Confusion', 'paper'),
      scissors: mv('Tail Whip', 'scissors'),
    },
    unique: null,
  },
  // ─── #55 GOLDUCK ───
  {
    id: 55, name: 'Golduck', type1: 'Water', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Hydro Pump', 'rock'),
      paper: mv('Confusion', 'paper'),
      scissors: mv('Ice Beam', 'scissors'),
    },
    unique: uniq('Zen Headbutt', 'rock', 'Golpe psíquico poderoso. Se vencer, ignora qualquer habilidade passiva do inimigo neste turno.'),
  },
  // ─── #56 MANKEY ───
  {
    id: 56, name: 'Mankey', type1: 'Fighting', type2: null, rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Karate Chop', 'rock'),
      paper: mv('Low Kick', 'paper'),
      scissors: mv('Fury Swipes', 'scissors'),
    },
    unique: null,
  },
  // ─── #57 PRIMEAPE ───
  {
    id: 57, name: 'Primeape', type1: 'Fighting', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Match Punch', 'rock'),
      paper: mv('Thunder Punch', 'paper'),
      scissors: mv('Rage', 'scissors'),
    },
    unique: uniq('Cross Chop', 'rock', 'Golpe cruzado com chance de crítico. Se vencer, tem 50% de chance de causar 2 de dano em vez de 1.'),
  },
  // ─── #58 GROWLITHE ───
  {
    id: 58, name: 'Growlithe', type1: 'Fire', type2: null, rarity: 'rara',
    ability: ab('FlashFire'),
    moves: {
      rock: mv('Ember', 'rock'),
      paper: mv('Bite', 'paper'),
      scissors: mv('Tackle', 'scissors'),
    },
    unique: null,
  },
  // ─── #59 ARCANINE ───
  {
    id: 59, name: 'Arcanine', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ab('FlashFire'),
    moves: {
      rock: mv('Flamethrower', 'rock'),
      paper: mv('Take Down', 'paper'),
      scissors: mv('Crunch', 'scissors'),
    },
    unique: uniq('ExtremeSpeed', 'paper', 'Velocidade extrema que age antes de qualquer coisa. Ao empatar no Jokenpô, Arcanine vence o empate e causa 1 de dano.'),
  },
  // ─── #60 POLIWAG ───
  {
    id: 60, name: 'Poliwag', type1: 'Water', type2: null, rarity: 'comum',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Pound', 'rock'),
      paper: mv('Bubble', 'paper'),
      scissors: mv('Hypnosis', 'scissors'),
    },
    unique: null,
  },
  // ─── #61 POLIWHIRL ───
  {
    id: 61, name: 'Poliwhirl', type1: 'Water', type2: null, rarity: 'rara',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Bubble Beam', 'rock'),
      paper: mv('Body Slam', 'paper'),
      scissors: mv('Hypnosis', 'scissors'),
    },
    unique: null,
  },
  // ─── #62 POLIWRATH ───
  {
    id: 62, name: 'Poliwrath', type1: 'Water', type2: 'Fighting', rarity: 'ultra-rara',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Waterfall', 'rock'),
      paper: mv('Match Punch', 'paper'),
      scissors: mv('Ice Punch', 'scissors'),
    },
    unique: uniq('Dynamic Punch', 'paper', 'Soco tão poderoso que sempre confunde. Se vencer, o inimigo fica confuso por 2 turnos (Jokenpô aleatório).'),
  },
  // ─── #63 ABRA ───
  {
    id: 63, name: 'Abra', type1: 'Psychic', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Confusion', 'rock'),
      paper: mv('Teleport', 'paper'),
      scissors: mv('Hidden Power', 'scissors'),
    },
    unique: null,
  },
  // ─── #64 KADABRA ───
  {
    id: 64, name: 'Kadabra', type1: 'Psychic', type2: null, rarity: 'rara',
    ability: ab('Synchronize'),
    moves: {
      rock: mv('Confusion', 'rock'),
      paper: mv('Hidden Power', 'paper', 'Dark'),
      scissors: mv('Disable', 'scissors'),
    },
    unique: null,
  },
  // ─── #65 ALAKAZAM ───
  {
    id: 65, name: 'Alakazam', type1: 'Psychic', type2: null, rarity: 'ultra-rara',
    ability: ab('Synchronize'),
    moves: {
      rock: mv('Psychic', 'rock'),
      paper: mv('Hidden Power', 'paper', 'Dark'),
      scissors: mv('Focus Blast', 'scissors'),
    },
    unique: uniq('Future Sight', 'scissors', 'Prevê o futuro: escolhe o Jokenpô do próximo turno agora. Se acertar a previsão, causa 2 de dano.'),
  },
  // ─── #66 MACHOP ───
  {
    id: 66, name: 'Machop', type1: 'Fighting', type2: null, rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Karate Chop', 'rock'),
      paper: mv('Bullet Punch', 'paper'),
      scissors: mv('Work Up', 'scissors'),
    },
    unique: null,
  },
  // ─── #67 MACHOKE ───
  {
    id: 67, name: 'Machoke', type1: 'Fighting', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Karate Chop', 'rock'),
      paper: mv('Bullet Punch', 'paper'),
      scissors: mv('Thunder Punch', 'scissors'),
    },
    unique: null,
  },
  // ─── #68 MACHAMP ───
  {
    id: 68, name: 'Machamp', type1: 'Fighting', type2: null, rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Dynamic Punch', 'rock'),
      paper: mv('Bullet Punch', 'paper'),
      scissors: mv('Thunder Punch', 'scissors'),
    },
    unique: uniq('Focus Punch', 'scissors', 'Compromete-se totalmente ao ataque. Concentra toda a força em um único soco devastador. Causa 1HKO.'),
  },
  // ─── #69 BELLSPROUT ───
  {
    id: 69, name: 'Bellsprout', type1: 'Grass', type2: 'Poison', rarity: 'comum',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Vine Whip', 'rock'),
      paper: mv('Acid', 'paper'),
      scissors: mv('Sleep Powder', 'scissors'),
    },
    unique: null,
  },
  // ─── #70 WEEPINBELL ───
  {
    id: 70, name: 'Weepinbell', type1: 'Grass', type2: 'Poison', rarity: 'rara',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Razor Leaf', 'rock'),
      paper: mv('Sludge', 'paper'),
      scissors: mv('Stun Spore', 'scissors'),
    },
    unique: null,
  },
  // ─── #71 VICTREEBEL ───
  {
    id: 71, name: 'Victreebel', type1: 'Grass', type2: 'Poison', rarity: 'ultra-rara',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Leaf Blade', 'rock'),
      paper: mv('Sludge Bomb', 'paper'),
      scissors: mv('Bite', 'scissors'),
    },
    unique: uniq('Leaf Storm', 'rock', 'Furacão de folhas afiadas. Causa 2 de dano se vencer, mas reduz o próprio poder: próximo ataque de Grama causa 1 de dano base.'),
  },
  // ─── #72 TENTACOOL ───
  {
    id: 72, name: 'Tentacool', type1: 'Water', type2: 'Poison', rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Bubble', 'rock'),
      paper: mv('Acid', 'paper'),
      scissors: mv('Wrap', 'scissors'),
    },
    unique: null,
  },
  // ─── #73 TENTACRUEL ───
  {
    id: 73, name: 'Tentacruel', type1: 'Water', type2: 'Poison', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Hydro Pump', 'rock'),
      paper: mv('Sludge Wave', 'paper'),
      scissors: mv('Barrier', 'scissors'),
    },
    unique: uniq('Acid Spray', 'scissors', 'Spray corrosivo que enfraquece defesas. Se vencer, o inimigo toma +1 de dano em todos os ataques pelo próximo turno.'),
  },
  // ─── #74 GEODUDE ───
  {
    id: 74, name: 'Geodude', type1: 'Rock', type2: 'Ground', rarity: 'comum',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Rock Throw', 'rock'),
      paper: mv('Tackle', 'paper'),
      scissors: mv('Magnitude', 'scissors'),
    },
    unique: null,
  },
  // ─── #75 GRAVELER ───
  {
    id: 75, name: 'Graveler', type1: 'Rock', type2: 'Ground', rarity: 'rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Rock Blast', 'rock'),
      paper: mv('Double-Edge', 'paper'),
      scissors: mv('Magnitude', 'scissors'),
    },
    unique: null,
  },
  // ─── #76 GOLEM ───
  {
    id: 76, name: 'Golem', type1: 'Rock', type2: 'Ground', rarity: 'ultra-rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Stone Edge', 'rock'),
      paper: mv('Thunder Punch', 'paper'),
      scissors: mv('Magnitude', 'scissors'),
    },
    unique: uniq('Explosion', 'scissors', 'Explosão catastrófica. Causa 3 de dano ao inimigo se vencer, mas Golem também perde 2 corações.'),
  },
  // ─── #77 PONYTA ───
  {
    id: 77, name: 'Ponyta', type1: 'Fire', type2: null, rarity: 'rara',
    ability: ab('FlashFire'),
    moves: {
      rock: mv('Ember', 'rock'),
      paper: mv('Stomp', 'paper'),
      scissors: mv('Flame Charge', 'scissors'),
    },
    unique: null,
  },
  // ─── #78 RAPIDASH ───
  {
    id: 78, name: 'Rapidash', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ab('FlashFire'),
    moves: {
      rock: mv('Fire Blast', 'rock'),
      paper: mv('High Horsepower', 'paper'),
      scissors: mv('Quick Attack', 'scissors'),
    },
    unique: uniq('Flame Charge', 'scissors', 'Carrega em chamas acumulando velocidade. A cada vitória consecutiva no Jokenpô, causa +1 de dano extra (acumula até +3).'),
  },
  // ─── #79 SLOWPOKE ───
  {
    id: 79, name: 'Slowpoke', type1: 'Water', type2: 'Psychic', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Water Gun', 'rock'),
      paper: mv('Confusion', 'paper'),
      scissors: mv('Amnesia', 'scissors'),
    },
    unique: null,
  },
  // ─── #80 SLOWBRO ───
  {
    id: 80, name: 'Slowbro', type1: 'Water', type2: 'Psychic', rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Scald', 'rock'),
      paper: mv('Psychic', 'paper'),
      scissors: mv('Hidden Power', 'scissors', 'Dark'),
    },
    unique: uniq('Slack Off', 'scissors', 'Tão lento que confunde a IA inimiga. Se perder no Jokenpô, a IA ignora o dano com 50% de chance (ele dormiu no golpe).'),
  },
  // ─── #81 MAGNEMITE ───
  {
    id: 81, name: 'Magnemite', type1: 'Electric', type2: 'Steel', rarity: 'rara',
    ability: ab('VoltAbsorb'),
    moves: {
      rock: mv('Thunder Shock', 'rock'),
      paper: mv('Metal Sound', 'paper'),
      scissors: mv('Supersonic', 'scissors'),
    },
    unique: null,
  },
  // ─── #82 MAGNETON ───
  {
    id: 82, name: 'Magneton', type1: 'Electric', type2: 'Steel', rarity: 'ultra-rara',
    ability: ab('VoltAbsorb'),
    moves: {
      rock: mv('Thunderbolt', 'rock'),
      paper: mv('Flash Cannon', 'paper'),
      scissors: mv('Supersonic', 'scissors'),
    },
    unique: uniq('Tri Attack', 'scissors', 'Ataca com 3 elementos ao mesmo tempo. Ao vencer, sorteia entre queimadura, paralisia ou congelamento (1 turno cada).'),
  },
  // ─── #83 FARFETCH'D ───
  {
    id: 83, name: "Farfetch'd", type1: 'Normal', type2: 'Flying', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Slash', 'rock'),
      paper: mv('Air Cutter', 'paper'),
      scissors: mv('Night Slash', 'scissors'),
    },
    unique: uniq('Stick', 'rock', 'Golpe com o galho sagrado. Tem 33% de chance de crítico a cada turno — se crítico, causa 2 de dano.'),
  },
  // ─── #84 DODUO ───
  {
    id: 84, name: 'Doduo', type1: 'Normal', type2: 'Flying', rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Peck', 'rock'),
      paper: mv('Fury Attack', 'paper'),
      scissors: mv('Growl', 'scissors'),
    },
    unique: null,
  },
  // ─── #85 DODRIO ───
  {
    id: 85, name: 'Dodrio', type1: 'Normal', type2: 'Flying', rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Drill Peck', 'rock'),
      paper: mv('Fury Attack', 'paper'),
      scissors: mv('Agility', 'scissors'),
    },
    unique: uniq('Tri Attack', 'scissors', 'Ataca com 3 elementos ao mesmo tempo. Ao vencer, sorteia entre queimadura, paralisia ou congelamento (1 turno cada).'),
  },
  // ─── #86 SEEL ───
  {
    id: 86, name: 'Seel', type1: 'Water', type2: null, rarity: 'comum',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Aurora Beam', 'rock'),
      paper: mv('Water Gun', 'paper'),
      scissors: mv('Headbutt', 'scissors'),
    },
    unique: null,
  },
  // ─── #87 DEWGONG ───
  {
    id: 87, name: 'Dewgong', type1: 'Water', type2: 'Ice', rarity: 'rara',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Ice Beam', 'rock'),
      paper: mv('Surf', 'paper'),
      scissors: mv('Take Down', 'scissors'),
    },
    unique: uniq('Sheer Cold', 'scissors', 'Frio absoluto. Se vencer e o inimigo for do tipo Água, Grama, Voador ou Dragão, causa KO instantâneo.'),
  },
  // ─── #88 GRIMER ───
  {
    id: 88, name: 'Grimer', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Poison Gas', 'rock'),
      paper: mv('Acid', 'paper'),
      scissors: mv('Minimize', 'scissors'),
    },
    unique: null,
  },
  // ─── #89 MUK ───
  {
    id: 89, name: 'Muk', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Sludge Bomb', 'rock'),
      paper: mv('Thief', 'paper'),
      scissors: mv('Minimize', 'scissors'),
    },
    unique: uniq('Acid Armor', 'scissors', 'Dissolve completamente sua forma. Por 2 turnos, todos os ataques físicos inimigos causam 0 de dano (imunidade).'),
  },
  // ─── #90 SHELLDER ───
  {
    id: 90, name: 'Shellder', type1: 'Water', type2: null, rarity: 'comum',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Tackle', 'rock'),
      paper: mv('Water Gun', 'paper'),
      scissors: mv('Withdraw', 'scissors'),
    },
    unique: null,
  },
  // ─── #91 CLOYSTER ───
  {
    id: 91, name: 'Cloyster', type1: 'Water', type2: 'Ice', rarity: 'ultra-rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Icicle Spear', 'rock'),
      paper: mv('Surf', 'paper'),
      scissors: mv('Spike Cannon', 'scissors'),
    },
    unique: uniq('Shell Smash', 'scissors', 'Quebra a própria concha liberando toda a potência. Por 3 turnos, todos os ataques causam +1 de dano, mas defesa cai (recebe +1 de dano).'),
  },
  // ─── #92 GASTLY ───
  {
    id: 92, name: 'Gastly', type1: 'Ghost', type2: 'Poison', rarity: 'rara',
    ability: ab('Levitate'),
    moves: {
      rock: mv('Lick', 'rock'),
      paper: mv('Hypnosis', 'paper'),
      scissors: mv('Night Shade', 'scissors'),
    },
    unique: null,
  },
  // ─── #93 HAUNTER ───
  {
    id: 93, name: 'Haunter', type1: 'Ghost', type2: 'Poison', rarity: 'rara',
    ability: ab('Levitate'),
    moves: {
      rock: mv('Lick', 'rock'),
      paper: mv('Sludge Wave', 'paper'),
      scissors: mv('Dark Pulse', 'scissors'),
    },
    unique: null,
  },
  // ─── #94 GENGAR ───
  {
    id: 94, name: 'Gengar', type1: 'Ghost', type2: 'Poison', rarity: 'ultra-rara',
    ability: ab('Levitate'),
    moves: {
      rock: mv('Lick', 'rock'),
      paper: mv('Sludge Wave', 'paper'),
      scissors: mv('Dark Pulse', 'scissors'),
    },
    unique: uniq('Shadow Ball', 'rock', 'Esfera de trevas que atravessa qualquer barreira. Se vencer, ignora as habilidades passivas e imunidades do inimigo neste turno.'),
  },
  // ─── #95 ONIX ───
  {
    id: 95, name: 'Onix', type1: 'Rock', type2: 'Ground', rarity: 'rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Rock Throw', 'rock'),
      paper: mv('Bind', 'paper'),
      scissors: mv('Dig', 'scissors'),
    },
    unique: null,
  },
  // ─── #96 DROWZEE ───
  {
    id: 96, name: 'Drowzee', type1: 'Psychic', type2: null, rarity: 'rara',
    ability: ab('Synchronize'),
    moves: {
      rock: mv('Confusion', 'rock'),
      paper: mv('Headbutt', 'paper'),
      scissors: mv('Hypnosis', 'scissors'),
    },
    unique: null,
  },
  // ─── #97 HYPNO ───
  {
    id: 97, name: 'Hypno', type1: 'Psychic', type2: null, rarity: 'ultra-rara',
    ability: ab('Synchronize'),
    moves: {
      rock: mv('Hypnosis', 'rock'),
      paper: mv('Hidden Power', 'paper'),
      scissors: mv('Shadow Claw', 'scissors'),
    },
    unique: uniq('Dream Eater', 'paper', 'Devora os sonhos do inimigo dormindo. Só funciona se inimigo estiver dormindo; se sim, causa 2 de dano e recupera 2 corações.'),
  },
  // ─── #98 KRABBY ───
  {
    id: 98, name: 'Krabby', type1: 'Water', type2: null, rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Vicegrip', 'rock'),
      paper: mv('Bubble', 'paper'),
      scissors: mv('Harden', 'scissors'),
    },
    unique: null,
  },
  // ─── #99 KINGLER ───
  {
    id: 99, name: 'Kingler', type1: 'Water', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Crabhammer', 'rock'),
      paper: mv('Dig', 'paper'),
      scissors: mv('Vicegrip', 'scissors'),
    },
    unique: uniq('Guillotine', 'rock', 'Golpe da guilhotina. 25% de chance de KO instantâneo ao vencer. Se não KO, causa 2 de dano normal.'),
  },
  // ─── #100 VOLTORB ───
  {
    id: 100, name: 'Voltorb', type1: 'Electric', type2: null, rarity: 'rara',
    ability: ab('VoltAbsorb'),
    moves: {
      rock: mv('Thunder Shock', 'rock'),
      paper: mv('Spark', 'paper'),
      scissors: mv('Self-Destruct', 'scissors'),
    },
    unique: null,
  },
  // ─── #101 ELECTRODE ───
  {
    id: 101, name: 'Electrode', type1: 'Electric', type2: null, rarity: 'ultra-rara',
    ability: ab('VoltAbsorb'),
    moves: {
      rock: mv('Thunderbolt', 'rock'),
      paper: mv('Rapid Spin', 'paper'),
      scissors: mv('Self-Destruct', 'scissors'),
    },
    unique: uniq('Explosion', 'scissors', 'Autodetona com energia máxima. Causa 3 de dano ao inimigo, mas Electrode é derrotado. Só pode ser usado uma vez.'),
  },
  // ─── #102 EXEGGCUTE ───
  {
    id: 102, name: 'Exeggcute', type1: 'Grass', type2: 'Psychic', rarity: 'rara',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Confusion', 'rock'),
      paper: mv('Absorb', 'paper'),
      scissors: mv('Sleep Powder', 'scissors'),
    },
    unique: null,
  },
  // ─── #103 EXEGGUTOR ───
  {
    id: 103, name: 'Exeggutor', type1: 'Grass', type2: 'Psychic', rarity: 'ultra-rara',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Psychic', 'rock'),
      paper: mv('Solar Beam', 'paper'),
      scissors: mv('Hidden Power', 'scissors'),
    },
    unique: uniq('Egg Bomb', 'scissors', 'Lança bombas-ovo em sequência. Se vencer, 50% de chance de atordoar o inimigo (usa o mesmo Jokenpô do turno anterior).'),
  },
  // ─── #104 CUBONE ───
  {
    id: 104, name: 'Cubone', type1: 'Ground', type2: null, rarity: 'comum',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Bonemerang', 'rock'),
      paper: mv('Astonish', 'paper'),
      scissors: mv('Growl', 'scissors'),
    },
    unique: null,
  },
  // ─── #105 MAROWAK ───
  {
    id: 105, name: 'Marowak', type1: 'Ground', type2: null, rarity: 'rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Bonemerang', 'rock'),
      paper: mv('Smack Down', 'paper'),
      scissors: mv('Headbutt', 'scissors'),
    },
    unique: uniq('Bone Rush', 'paper', 'Golpeia com o osso de 2 a 5 vezes. Cada acerto que ganhar no Jokenpô causa 1 de dano.'),
  },
  // ─── #106 HITMONLEE ───
  {
    id: 106, name: 'Hitmonlee', type1: 'Fighting', type2: null, rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Low Kick', 'rock'),
      paper: mv('Faint Attack', 'paper'),
      scissors: mv('Blaze Kick', 'scissors'),
    },
    unique: uniq('High Jump Kick', 'rock', 'Chute voador devastador. Se vencer, causa 2 de dano. Se perder, Hitmonlee sofre 1 de dano a si mesmo.'),
  },
  // ─── #107 HITMONCHAN ───
  {
    id: 107, name: 'Hitmonchan', type1: 'Fighting', type2: null, rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Mega Punch', 'rock'),
      paper: mv('Thunder Punch', 'paper'),
      scissors: mv('Ice Punch', 'scissors'),
    },
    unique: uniq('Focus Punch', 'paper', 'Soco com força total. Ao empatar no Jokenpô, Hitmonchan vence o empate e causa 1 de dano.'),
  },
  // ─── #108 LICKITUNG ───
  {
    id: 108, name: 'Lickitung', type1: 'Normal', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Lick', 'rock'),
      paper: mv('Body Slam', 'paper'),
      scissors: mv('Counter', 'scissors'),
    },
    unique: uniq('Wrap', 'scissors', 'Enrolado e preso. Se vencer, o inimigo perde 1 coração por turno por 3 turnos e não pode trocar de Pokémon.'),
  },
  // ─── #109 KOFFING ───
  {
    id: 109, name: 'Koffing', type1: 'Poison', type2: null, rarity: 'comum',
    ability: ab('Levitate'),
    moves: {
      rock: mv('Smog', 'rock'),
      paper: mv('Thief', 'paper'),
      scissors: mv('Smokescreen', 'scissors'),
    },
    unique: null,
  },
  // ─── #110 WEEZING ───
  {
    id: 110, name: 'Weezing', type1: 'Poison', type2: null, rarity: 'rara',
    ability: ab('Levitate'),
    moves: {
      rock: mv('Sludge Bomb', 'rock'),
      paper: mv('Fire Blast', 'paper'),
      scissors: mv('Thief', 'scissors'),
    },
    unique: uniq('Destiny Bond', 'scissors', 'Liga os destinos. Se Weezing for derrotado no próximo turno, o inimigo também é derrotado imediatamente.'),
  },
  // ─── #111 RHYHORN ───
  {
    id: 111, name: 'Rhyhorn', type1: 'Ground', type2: 'Rock', rarity: 'rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Stomp', 'rock'),
      paper: mv('Rock Blast', 'paper'),
      scissors: mv('Horn Attack', 'scissors'),
    },
    unique: null,
  },
  // ─── #112 RHYDON ───
  {
    id: 112, name: 'Rhydon', type1: 'Ground', type2: 'Rock', rarity: 'ultra-rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Hammer Arm', 'rock'),
      paper: mv('Earth Power', 'paper'),
      scissors: mv('Horn Attack', 'scissors'),
    },
    unique: uniq('Rock Wrecker', 'scissors', 'Lança uma rocha gigante. Se vencer, causa 2 de dano mas fica recarregando no turno seguinte.'),
  },
  // ─── #113 CHANSEY ───
  {
    id: 113, name: 'Chansey', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Double Slap', 'rock'),
      paper: mv('Egg Bomb', 'paper'),
      scissors: mv('Disarming Voice', 'scissors'),
    },
    unique: uniq('Soft-Boiled', 'scissors', 'Chansey usa scissors para se curar. Se vencer, recupera 2 corações em vez de causar dano.'),
  },
  // ─── #114 TANGELA ───
  {
    id: 114, name: 'Tangela', type1: 'Grass', type2: null, rarity: 'rara',
    ability: ab('Overgrow'),
    moves: {
      rock: mv('Vine Whip', 'rock'),
      paper: mv('Bind', 'paper'),
      scissors: mv('Slam', 'scissors'),
    },
    unique: uniq('Bind', 'paper', 'Envolve o inimigo com cipós. Se vencer, o inimigo perde 1 coração por turno por 3 turnos e não pode trocar.'),
  },
  // ─── #115 KANGASKHAN ───
  {
    id: 115, name: 'Kangaskhan', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Comet Punch', 'rock'),
      paper: mv('Earth Power', 'paper'),
      scissors: mv('Surf', 'scissors'),
    },
    unique: uniq('Parental Bond', 'rock', 'Ataca duas vezes: mãe e filhote juntos. Vencer causa 2 de dano total (1 por golpe), mas cada golpe é calculado separadamente.'),
  },
  // ─── #116 HORSEA ───
  {
    id: 116, name: 'Horsea', type1: 'Water', type2: null, rarity: 'comum',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Twister', 'rock'),
      paper: mv('Bubble', 'paper'),
      scissors: mv('Smokescreen', 'scissors'),
    },
    unique: null,
  },
  // ─── #117 SEADRA ───
  {
    id: 117, name: 'Seadra', type1: 'Water', type2: null, rarity: 'rara',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Twister', 'rock'),
      paper: mv('Bubble Beam', 'paper'),
      scissors: mv('Agility', 'scissors'),
    },
    unique: uniq('Dragon Pulse', 'rock', 'Pulso dracônico que causa sempre exatamente 2 de dano ao vencer, independente de tipo ou habilidades.'),
  },
  // ─── #118 GOLDEEN ───
  {
    id: 118, name: 'Goldeen', type1: 'Water', type2: null, rarity: 'comum',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Horn Attack', 'rock'),
      paper: mv('Water Gun', 'paper'),
      scissors: mv('Supersonic', 'scissors'),
    },
    unique: null,
  },
  // ─── #119 SEAKING ───
  {
    id: 119, name: 'Seaking', type1: 'Water', type2: null, rarity: 'rara',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Horn Attack', 'rock'),
      paper: mv('Waterfall', 'paper'),
      scissors: mv('Ice Beam', 'scissors'),
    },
    unique: uniq('Megahorn', 'rock', 'Chifrada mega poderosa. Se vencer contra um Pokémon Psíquico ou Escuro, causa 3 de dano.'),
  },
  // ─── #120 STARYU ───
  {
    id: 120, name: 'Staryu', type1: 'Water', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Water Gun', 'rock'),
      paper: mv('Rapid Spin', 'paper'),
      scissors: mv('Confusion', 'scissors'),
    },
    unique: null,
  },
  // ─── #121 STARMIE ───
  {
    id: 121, name: 'Starmie', type1: 'Water', type2: 'Psychic', rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Hydro Pump', 'rock'),
      paper: mv('Psychic', 'paper'),
      scissors: mv('Thunderbolt', 'scissors'),
    },
    unique: uniq('Power Gem', 'rock', 'Dispara raios da joia central. Se vencer, escolhe um tipo extra aleatório para o ataque — podendo ser super efetivo no inimigo.'),
  },
  // ─── #122 MR. MIME ───
  {
    id: 122, name: 'Mr. Mime', type1: 'Psychic', type2: 'Fairy', rarity: 'ultra-rara',
    ability: ab('Synchronize'),
    moves: {
      rock: mv('Confusion', 'rock'),
      paper: mv('Dazzling Gleam', 'paper'),
      scissors: mv('Mimic', 'scissors'),
    },
    unique: uniq('Barrier', 'scissors', 'Ergue uma barreira invisível. Por 2 turnos, ataques que perderem no Jokenpô causam 0 de dano em vez do normal.'),
  },
  // ─── #123 SCYTHER ───
  {
    id: 123, name: 'Scyther', type1: 'Bug', type2: 'Flying', rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('X-Scissor', 'rock'),
      paper: mv('Wing Attack', 'paper'),
      scissors: mv('Slash', 'scissors'),
    },
    unique: uniq('Cut', 'scissors', 'Golpe de lâmina afiada com chance elevada de crítico. Se vencer, tem 50% de chance de causar 2 de dano em vez de 1.'),
  },
  // ─── #124 JYNX ───
  {
    id: 124, name: 'Jynx', type1: 'Ice', type2: 'Psychic', rarity: 'ultra-rara',
    ability: ab('Synchronize'),
    moves: {
      rock: mv('Ice Beam', 'rock'),
      paper: mv('Psychic', 'paper'),
      scissors: mv('Charm', 'scissors'),
    },
    unique: uniq('Lovely Kiss', 'scissors', 'Beijo amaldiçoado. Se vencer, o inimigo dorme por 2 turnos (usa rock automaticamente enquanto dorme).'),
  },
  // ─── #125 ELECTABUZZ ───
  {
    id: 125, name: 'Electabuzz', type1: 'Electric', type2: null, rarity: 'ultra-rara',
    ability: ab('VoltAbsorb'),
    moves: {
      rock: mv('Ice Punch', 'rock'),
      paper: mv('Thunder Punch', 'paper'),
      scissors: mv('Swift', 'scissors'),
    },
    unique: uniq('Volt Switch', 'paper', 'Soco elétrico poderoso. Se vencer, 33% de chance de paralisar o inimigo por 1 turno.'),
  },
  // ─── #126 MAGMAR ───
  {
    id: 126, name: 'Magmar', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ab('FlashFire'),
    moves: {
      rock: mv('Fire Punch', 'rock'),
      paper: mv('Counter', 'paper'),
      scissors: mv('Thunder Punch', 'scissors'),
    },
    unique: uniq('Lava Plume', 'scissors', 'Erupção de lava que queima o campo. Se vencer, inimigos no banco também sofrem queimadura (1 de dano antes de entrar em campo).'),
  },
  // ─── #127 PINSIR ───
  {
    id: 127, name: 'Pinsir', type1: 'Bug', type2: null, rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Vicegrip', 'rock'),
      paper: mv('X-Scissor', 'paper'),
      scissors: mv('Submission', 'scissors'),
    },
    unique: uniq('Cut', 'scissors', 'Golpe de lâmina afiada com chance elevada de crítico. Se vencer, tem 50% de chance de causar 2 de dano em vez de 1.'),
  },
  // ─── #128 TAUROS ───
  {
    id: 128, name: 'Tauros', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Body Slam', 'rock'),
      paper: mv('Iron Tail', 'paper'),
      scissors: mv('Counter', 'scissors'),
    },
    unique: uniq('Giga Impact', 'paper', 'O ataque mais poderoso. Se vencer, causa 2 de dano mas Tauros fica sem ação no turno seguinte.'),
  },
  // ─── #129 MAGIKARP ───
  {
    id: 129, name: 'Magikarp', type1: 'Water', type2: null, rarity: 'comum',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Splash', 'rock'),
      paper: mv('Tackle', 'paper'),
      scissors: mv('Flail', 'scissors'),
    },
    unique: null,
  },
  // ─── #130 GYARADOS ───
  {
    id: 130, name: 'Gyarados', type1: 'Water', type2: 'Flying', rarity: 'ultra-rara',
    ability: ab('Intimidate'),
    moves: {
      rock: mv('Waterfall', 'rock'),
      paper: mv('Twister', 'paper'),
      scissors: mv('Ice Fang', 'scissors'),
    },
    unique: uniq('Hyper Beam', 'scissors', 'Destruição total. Causa 2 de dano se vencer, mas Gyarados descansa no turno seguinte (usa rock automaticamente).'),
  },
  // ─── #131 LAPRAS ───
  {
    id: 131, name: 'Lapras', type1: 'Water', type2: 'Ice', rarity: 'ultra-rara',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Ice Beam', 'rock'),
      paper: mv('Surf', 'paper'),
      scissors: mv('Thunderbolt', 'scissors'),
    },
    unique: uniq('Perish Song', 'scissors', 'Melodia amaldiçoada. Após 3 turnos do uso, tanto Lapras quanto o inimigo ativo são derrotados simultaneamente.'),
  },
  // ─── #132 DITTO ───
  {
    id: 132, name: 'Ditto', type1: 'Normal', type2: null, rarity: 'epico',
    ability: ab('Imposter'),
    moves: {
      rock: mv('Transform', 'rock'),
      paper: mv('Transform', 'paper'),
      scissors: mv('Transform', 'scissors'),
    },
    unique: uniq('Transform', 'rock', 'Transforma-se no inimigo: copia tipo, moves e habilidade. Após a cópia, age como o Pokémon copiado por toda a batalha.'),
  },
  // ─── #133 EEVEE ───
  {
    id: 133, name: 'Eevee', type1: 'Normal', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Quick Attack', 'rock'),
      paper: mv('Bite', 'paper'),
      scissors: mv('Tail Whip', 'scissors'),
    },
    unique: null,
  },
  // ─── #134 VAPOREON ───
  {
    id: 134, name: 'Vaporeon', type1: 'Water', type2: null, rarity: 'ultra-rara',
    ability: ab('WaterAbsorb'),
    moves: {
      rock: mv('Hydro Pump', 'rock'),
      paper: mv('Ice Beam', 'paper'),
      scissors: mv('Last Resort', 'scissors'),
    },
    unique: uniq('Aqua Ring', 'paper', 'Envolve-se em água curativa. A cada 2 turnos, recupera 1 coração automaticamente durante a batalha.'),
  },
  // ─── #135 JOLTEON ───
  {
    id: 135, name: 'Jolteon', type1: 'Electric', type2: null, rarity: 'ultra-rara',
    ability: ab('VoltAbsorb'),
    moves: {
      rock: mv('Thunderbolt', 'rock'),
      paper: mv('Crunch', 'paper'),
      scissors: mv('Quick Attack', 'scissors'),
    },
    unique: uniq('Pin Missile', 'paper', 'Dispara agulhas de pelos. Ao empatar no Jokenpô, Jolteon ainda causa 1 de dano (pelo menos 1 agulha acerta).'),
  },
  // ─── #136 FLAREON ───
  {
    id: 136, name: 'Flareon', type1: 'Fire', type2: null, rarity: 'ultra-rara',
    ability: ab('FlashFire'),
    moves: {
      rock: mv('Fire Blast', 'rock'),
      paper: mv('Bite', 'paper'),
      scissors: mv('Will-O-Wisp', 'scissors'),
    },
    unique: uniq('Flare Blitz', 'paper', 'Carrega em chamas com recuo. Causa 2 de dano ao vencer, mas Flareon sofre 1 de dano de recuo.'),
  },
  // ─── #137 PORYGON ───
  {
    id: 137, name: 'Porygon', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ab('NoGuard'),
    moves: {
      rock: mv('Hidden Power', 'rock'),
      paper: mv('Confusion', 'paper'),
      scissors: mv('Dark Pulse', 'scissors'),
    },
    unique: uniq('Conversion', 'scissors', 'Muda seu tipo para o tipo do último ataque vencedor. A imunidade e resistências mudam junto pelo resto da batalha.'),
  },
  // ─── #138 OMANYTE ───
  {
    id: 138, name: 'Omanyte', type1: 'Rock', type2: 'Water', rarity: 'rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Water Gun', 'rock'),
      paper: mv('Rock Blast', 'paper'),
      scissors: mv('Tackle', 'scissors'),
    },
    unique: null,
  },
  // ─── #139 OMASTAR ───
  {
    id: 139, name: 'Omastar', type1: 'Rock', type2: 'Water', rarity: 'ultra-rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Rock Blast', 'rock'),
      paper: mv('Hydro Pump', 'paper'),
      scissors: mv('Spike Cannon', 'scissors'),
    },
    unique: uniq('Ancient Power', 'rock', 'Poder ancestral que pode aumentar todos os atributos. Se vencer, 20% de chance de causar +1 de dano em todos os ataques pelos próximos 3 turnos.'),
  },
  // ─── #140 KABUTO ───
  {
    id: 140, name: 'Kabuto', type1: 'Rock', type2: 'Water', rarity: 'rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Rock Blast', 'rock'),
      paper: mv('Bubble', 'paper'),
      scissors: mv('Scratch', 'scissors'),
    },
    unique: null,
  },
  // ─── #141 KABUTOPS ───
  {
    id: 141, name: 'Kabutops', type1: 'Rock', type2: 'Water', rarity: 'ultra-rara',
    ability: ab('Sturdy'),
    moves: {
      rock: mv('Stone Edge', 'rock'),
      paper: mv('Waterfall', 'paper'),
      scissors: mv('Slash', 'scissors'),
    },
    unique: uniq('Aqua Jet', 'scissors', 'Jato de água ultra rápido. Ao empatar no Jokenpô, Kabutops vence o empate e causa 1 de dano.'),
  },
  // ─── #142 AERODACTYL ───
  {
    id: 142, name: 'Aerodactyl', type1: 'Rock', type2: 'Flying', rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Smack Down', 'rock'),
      paper: mv('Wing Attack', 'paper'),
      scissors: mv('Twister', 'scissors'),
    },
    unique: uniq('Rock Slide', 'rock', 'Queda de pedras que pode assustar. Se vencer, 30% de chance de o inimigo ficar aterrorizado e usar rock automaticamente no próximo turno.'),
  },
  // ─── #143 SNORLAX ───
  {
    id: 143, name: 'Snorlax', type1: 'Normal', type2: null, rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Body Slam', 'rock'),
      paper: mv('Crunch', 'paper'),
      scissors: mv('Earth Power', 'scissors'),
    },
    unique: uniq('Rest', 'scissors', 'Dorme profundamente recuperando toda a saúde (3 corações), mas fica dormindo por 2 turnos usando rock automaticamente.'),
  },
  // ─── #144 ARTICUNO ───
  {
    id: 144, name: 'Articuno', type1: 'Ice', type2: 'Flying', rarity: 'lendaria',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Blizzard', 'rock'),
      paper: mv('Hurricane', 'paper'),
      scissors: mv('Reflect', 'scissors'),
    },
    unique: uniq('Sheer Cold', 'scissors', 'Frio absoluto lendário. Se vencer, KO instantâneo em qualquer inimigo do tipo Água, Grama, Voador ou Dragão.'),
  },
  // ─── #145 ZAPDOS ───
  {
    id: 145, name: 'Zapdos', type1: 'Electric', type2: 'Flying', rarity: 'lendaria',
    ability: ab('VoltAbsorb'),
    moves: {
      rock: mv('Thunderbolt', 'rock'),
      paper: mv('Fly', 'paper'),
      scissors: mv('Detect', 'scissors'),
    },
    unique: uniq('Thunder', 'scissors', 'Raio lendário dos céus. Causa sempre 2 de dano ao vencer, independente de resistências ou imunidades.'),
  },
  // ─── #146 MOLTRES ───
  {
    id: 146, name: 'Moltres', type1: 'Fire', type2: 'Flying', rarity: 'lendaria',
    ability: ab('FlashFire'),
    moves: {
      rock: mv('Fire Blast', 'rock'),
      paper: mv('Wing Attack', 'paper'),
      scissors: mv('Payback', 'scissors'),
    },
    unique: uniq('Sky Attack', 'scissors', 'Mergulho em chamas lendário. Causa 2 de dano ao vencer. Se o inimigo for do tipo Grama ou Bug, causa 3 de dano.'),
  },
  // ─── #147 DRATINI ───
  {
    id: 147, name: 'Dratini', type1: 'Dragon', type2: null, rarity: 'rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Twister', 'rock'),
      paper: mv('Wrap', 'paper'),
      scissors: mv('Thunder Wave', 'scissors'),
    },
    unique: null,
  },
  // ─── #148 DRAGONAIR ───
  {
    id: 148, name: 'Dragonair', type1: 'Dragon', type2: null, rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Twister', 'rock'),
      paper: mv('Aqua Tail', 'paper'),
      scissors: mv('Thunder Wave', 'scissors'),
    },
    unique: null,
  },
  // ─── #149 DRAGONITE ───
  {
    id: 149, name: 'Dragonite', type1: 'Dragon', type2: 'Flying', rarity: 'ultra-rara',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Dragon Claw', 'rock'),
      paper: mv('Fly', 'paper'),
      scissors: mv('Thunder Wave', 'scissors'),
    },
    unique: uniq('Outrage', 'scissors', 'Fúria dracônica incontrolável. Causa 2 de dano por 2 turnos consecutivos (força o mesmo Jokenpô em ambos os turnos).'),
  },
  // ─── #150 MEWTWO ───
  {
    id: 150, name: 'Mewtwo', type1: 'Psychic', type2: null, rarity: 'lendaria',
    ability: ab('InnerFocus'),
    moves: {
      rock: mv('Psychic', 'rock'),
      paper: mv('Aura Sphere', 'paper'),
      scissors: mv('Shadow Ball', 'scissors'),
    },
    unique: uniq('Psystrike', 'rock', 'O ataque mental mais poderoso. Se vencer, ignora completamente a habilidade e os efeitos de status do inimigo. Causa 2 de dano base.'),
  },
  // ─── #151 MEW ───
  {
    id: 151, name: 'Mew', type1: 'Psychic', type2: null, rarity: 'epico',
    ability: ab('Synchronize', 'Todo ataque vencedor de Mew é tratado como super efetivo (causa 2 de dano), independente de tipos.'),
    moves: {
      rock: mv('Pound', 'rock'),
      paper: mv('Psychic', 'paper'),
      scissors: mv('Rock Blast', 'scissors'),
    },
    unique: uniq('Transform', 'rock', 'Mew copia o ataque único do inimigo e o usa imediatamente com as vantagens de sua habilidade (sempre super efetivo).'),
  },
  // ─── #9025 ASH'S PIKACHU ─── (Easter egg)
  {
    id: 9025, name: "Ash's Pikachu", type1: 'Electric', type2: null, rarity: 'lendaria',
    ability: ab('Lightning Rod'),
    moves: {
      rock: mv('Thunderbolt', 'rock'),
      paper: mv('Surf', 'paper'),
      scissors: mv('Fly', 'scissors'),
    },
    unique: uniq('Volt Tackle', 'rock', 'Carrega com toda energia elétrica. Super efetivo contra Terra e Pedra, ignorando a imunidade elétrica normal. Causa 2 de dano (3 vs Ground/Rock).'),
  },
  // ─── #0 MISSINGNO. ───
  {
    id: 0, name: 'MissingNo.', type1: 'Normal', type2: 'Flying', rarity: 'epico',
    ability: ab('Glitch'),
    moves: {
      rock: mv('Water Gun', 'rock'),
      paper: mv('Water Gun', 'paper'),
      scissors: mv('Sky Attack', 'scissors'),
    },
    unique: uniq('Glitch Beam', 'rock', '???: emite um raio de dados corrompidos. Ao vencer, causa KO instantâneo. Os dados do inimigo ficam temporariamente ilegíveis.'),
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
