import type { PokemonCard, PokemonType, Rarity, RPS, Move, UniqueMove, Ability } from '@/types'
import { getMove } from './moves'
import { getAbility } from './abilities'
import { getUnique } from './uniques'

interface NormalizedTemplate {
  id: number
  name: string
  type1: PokemonType
  type2: PokemonType | null
  rarity: Rarity
  abilityId: string
  moves: { rock: string; paper: string; scissors: string }
  uniqueId: string | null
}

// prettier-ignore
const TEMPLATES: NormalizedTemplate[] = [
  // ─── #1 BULBASAUR ───
  { id: 1,  name: 'Bulbasaur',   type1: 'Grass',    type2: 'Poison',  rarity: 'comum',
    abilityId: 'overgrow',
    moves: { rock: 'vine-whip',   paper: 'tackle',       scissors: 'poison-powder' },
    uniqueId: null },
  // ─── #2 IVYSAUR ───
  { id: 2,  name: 'Ivysaur',     type1: 'Grass',    type2: 'Poison',  rarity: 'rara',
    abilityId: 'overgrow',
    moves: { rock: 'razor-leaf',  paper: 'body-slam',    scissors: 'poison-powder' },
    uniqueId: null },
  // ─── #3 VENUSAUR ───
  { id: 3,  name: 'Venusaur',    type1: 'Grass',    type2: 'Poison',  rarity: 'ultra-rara',
    abilityId: 'overgrow',
    moves: { rock: 'solar-beam',  paper: 'sludge-bomb',  scissors: 'body-slam' },
    uniqueId: 'petal-dance' },
  // ─── #4 CHARMANDER ───
  { id: 4,  name: 'Charmander',  type1: 'Fire',     type2: null,      rarity: 'comum',
    abilityId: 'blaze',
    moves: { rock: 'ember',       paper: 'scratch',      scissors: 'dragon-rage' },
    uniqueId: null },
  // ─── #5 CHARMELEON ───
  { id: 5,  name: 'Charmeleon',  type1: 'Fire',     type2: null,      rarity: 'rara',
    abilityId: 'blaze',
    moves: { rock: 'fire-fang',   paper: 'slash',        scissors: 'dragon-rage' },
    uniqueId: null },
  // ─── #6 CHARIZARD ───
  { id: 6,  name: 'Charizard',   type1: 'Fire',     type2: 'Flying',  rarity: 'ultra-rara',
    abilityId: 'blaze',
    moves: { rock: 'fire-blast',  paper: 'wing-attack',  scissors: 'dragon-rage' },
    uniqueId: 'inferno' },
  // ─── #7 SQUIRTLE ───
  { id: 7,  name: 'Squirtle',    type1: 'Water',    type2: null,      rarity: 'comum',
    abilityId: 'torrent',
    moves: { rock: 'water-gun',   paper: 'tackle',       scissors: 'protect' },
    uniqueId: null },
  // ─── #8 WARTORTLE ───
  { id: 8,  name: 'Wartortle',   type1: 'Water',    type2: null,      rarity: 'rara',
    abilityId: 'torrent',
    moves: { rock: 'bubble-beam', paper: 'rapid-spin-clear', scissors: 'protect' },
    uniqueId: null },
  // ─── #9 BLASTOISE ───
  { id: 9,  name: 'Blastoise',   type1: 'Water',    type2: null,      rarity: 'ultra-rara',
    abilityId: 'torrent',
    moves: { rock: 'hydro-pump',  paper: 'flash-cannon', scissors: 'skull-bash' },
    uniqueId: 'hydro-cannon' },
  // ─── #10 CATERPIE ───
  { id: 10, name: 'Caterpie',    type1: 'Bug',      type2: null,      rarity: 'comum',
    abilityId: 'no-guard',
    moves: { rock: 'tackle',      paper: 'string-shot',  scissors: 'bug-bite' },
    uniqueId: null },
  // ─── #11 METAPOD ───
  { id: 11, name: 'Metapod',     type1: 'Bug',      type2: null,      rarity: 'comum',
    abilityId: 'sturdy',
    moves: { rock: 'tackle',      paper: 'harden',       scissors: 'protect' },
    uniqueId: null },
  // ─── #12 BUTTERFREE ───
  { id: 12, name: 'Butterfree',  type1: 'Bug',      type2: 'Flying',  rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'air-slash',   paper: 'sticky-web',   scissors: 'sleep-powder' },
    uniqueId: 'quiver-dance-unique' },
  // ─── #13 WEEDLE ───
  { id: 13, name: 'Weedle',      type1: 'Bug',      type2: 'Poison',  rarity: 'comum',
    abilityId: 'no-guard',
    moves: { rock: 'poison-sting', paper: 'tackle',      scissors: 'bug-bite' },
    uniqueId: null },
  // ─── #14 KAKUNA ───
  { id: 14, name: 'Kakuna',      type1: 'Bug',      type2: 'Poison',  rarity: 'comum',
    abilityId: 'sturdy',
    moves: { rock: 'poison-sting', paper: 'harden',      scissors: 'protect' },
    uniqueId: null },
  // ─── #15 BEEDRILL ───
  { id: 15, name: 'Beedrill',    type1: 'Bug',      type2: 'Poison',  rarity: 'rara',
    abilityId: 'intimidate',
    moves: { rock: 'twineedle',   paper: 'fury-attack',  scissors: 'toxic-spikes' },
    uniqueId: 'pin-missile' },
  // ─── #16 PIDGEY ───
  { id: 16, name: 'Pidgey',      type1: 'Normal',   type2: 'Flying',  rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'tackle',      paper: 'gust',         scissors: 'feather-dance' },
    uniqueId: null },
  // ─── #17 PIDGEOTTO ───
  { id: 17, name: 'Pidgeotto',   type1: 'Normal',   type2: 'Flying',  rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'wing-attack', paper: 'quick-attack', scissors: 'feather-dance' },
    uniqueId: null },
  // ─── #18 PIDGEOT ─── scissors = hurricane (buff: atk -1 opponent)
  { id: 18, name: 'Pidgeot',     type1: 'Normal',   type2: 'Flying',  rarity: 'ultra-rara',
    abilityId: 'intimidate',
    moves: { rock: 'quick-attack', paper: 'air-slash',   scissors: 'fly' },
    uniqueId: 'aerial-ace' },
  // ─── #19 RATTATA ───
  { id: 19, name: 'Rattata',     type1: 'Normal',   type2: null,      rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'quick-attack', paper: 'bite',        scissors: 'tail-whip' },
    uniqueId: null },
  // ─── #20 RATICATE ───
  { id: 20, name: 'Raticate',    type1: 'Normal',   type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'thief',       paper: 'super-fang',   scissors: 'counter' },
    uniqueId: 'hyper-fang-unique' },
  // ─── #21 SPEAROW ───
  { id: 21, name: 'Spearow',     type1: 'Normal',   type2: 'Flying',  rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'peck',        paper: 'growl',        scissors: 'leer' },
    uniqueId: null },
  // ─── #22 FEAROW ───
  { id: 22, name: 'Fearow',      type1: 'Normal',   type2: 'Flying',  rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'drill-peck',  paper: 'fury-attack',  scissors: 'mirror-move' },
    uniqueId: 'drill-run-unique' },
  // ─── #23 EKANS ───
  { id: 23, name: 'Ekans',       type1: 'Poison',   type2: null,      rarity: 'comum',
    abilityId: 'intimidate',
    moves: { rock: 'poison-sting', paper: 'acid',        scissors: 'poison-gas' },
    uniqueId: null },
  // ─── #24 ARBOK ───
  { id: 24, name: 'Arbok',       type1: 'Poison',   type2: null,      rarity: 'rara',
    abilityId: 'intimidate',
    moves: { rock: 'gunk-shot',   paper: 'crunch',       scissors: 'ice-fang' },
    uniqueId: 'glare-unique' },
  // ─── #25 PIKACHU ─── scissors: thunder-wave (paralysis)
  { id: 25, name: 'Pikachu',     type1: 'Electric', type2: null,      rarity: 'rara',
    abilityId: 'volt-absorb',
    moves: { rock: 'thunder-shock', paper: 'quick-attack', scissors: 'thunder-wave' },
    uniqueId: null },
  // ─── #26 RAICHU ─── scissors: thunder-wave (paralysis)
  { id: 26, name: 'Raichu',      type1: 'Electric', type2: null,      rarity: 'ultra-rara',
    abilityId: 'volt-absorb',
    moves: { rock: 'thunderbolt', paper: 'quick-attack', scissors: 'thunder-wave' },
    uniqueId: 'thunder' },
  // ─── #27 SANDSHREW ───
  { id: 27, name: 'Sandshrew',   type1: 'Ground',   type2: null,      rarity: 'comum',
    abilityId: 'sturdy',
    moves: { rock: 'scratch',     paper: 'gyro-ball',    scissors: 'dig' },
    uniqueId: null },
  // ─── #28 SANDSLASH ───
  { id: 28, name: 'Sandslash',   type1: 'Ground',   type2: null,      rarity: 'rara',
    abilityId: 'sturdy',
    moves: { rock: 'slash',       paper: 'gyro-ball',    scissors: 'dig' },
    uniqueId: 'rollout-unique' },
  // ─── #29 NIDORAN♀ ───
  { id: 29, name: 'Nidoran♀',   type1: 'Poison',   type2: null,      rarity: 'comum',
    abilityId: 'intimidate',
    moves: { rock: 'scratch',     paper: 'poison-sting', scissors: 'growl' },
    uniqueId: null },
  // ─── #30 NIDORINA ───
  { id: 30, name: 'Nidorina',    type1: 'Poison',   type2: null,      rarity: 'rara',
    abilityId: 'intimidate',
    moves: { rock: 'bite',        paper: 'double-kick',  scissors: 'poison-fang' },
    uniqueId: null },
  // ─── #31 NIDOQUEEN ───
  { id: 31, name: 'Nidoqueen',   type1: 'Poison',   type2: 'Ground',  rarity: 'ultra-rara',
    abilityId: 'sturdy',
    moves: { rock: 'body-slam',   paper: 'earth-power',  scissors: 'sludge-wave' },
    uniqueId: 'earthquake-unique' },
  // ─── #32 NIDORAN♂ ───
  { id: 32, name: 'Nidoran♂',   type1: 'Poison',   type2: null,      rarity: 'comum',
    abilityId: 'intimidate',
    moves: { rock: 'horn-attack', paper: 'poison-sting', scissors: 'leer' },
    uniqueId: null },
  // ─── #33 NIDORINO ───
  { id: 33, name: 'Nidorino',    type1: 'Poison',   type2: null,      rarity: 'rara',
    abilityId: 'intimidate',
    moves: { rock: 'horn-attack', paper: 'double-kick',  scissors: 'poison-jab' },
    uniqueId: null },
  // ─── #34 NIDOKING ───
  { id: 34, name: 'Nidoking',    type1: 'Poison',   type2: 'Ground',  rarity: 'ultra-rara',
    abilityId: 'sturdy',
    moves: { rock: 'gunk-shot',   paper: 'earth-power',  scissors: 'poison-jab' },
    uniqueId: 'earthquake-unique' },
  // ─── #35 CLEFAIRY ───
  { id: 35, name: 'Clefairy',    type1: 'Fairy',    type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'pound',       paper: 'confusion',    scissors: 'fairy-wind' },
    uniqueId: null },
  // ─── #36 CLEFABLE ───
  { id: 36, name: 'Clefable',    type1: 'Fairy',    type2: null,      rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'fairy-wind',  paper: 'stored-power', scissors: 'minimize' },
    uniqueId: 'metronome' },
  // ─── #37 VULPIX ───
  { id: 37, name: 'Vulpix',      type1: 'Fire',     type2: null,      rarity: 'rara',
    abilityId: 'flash-fire',
    moves: { rock: 'ember',       paper: 'quick-attack', scissors: 'will-o-wisp' },
    uniqueId: null },
  // ─── #38 NINETALES ───
  { id: 38, name: 'Ninetales',   type1: 'Fire',     type2: null,      rarity: 'ultra-rara',
    abilityId: 'flash-fire',
    moves: { rock: 'fire-blast',  paper: 'hex',          scissors: 'nasty-plot' },
    uniqueId: 'ninetales-inferno' },
  // ─── #39 JIGGLYPUFF ───
  { id: 39, name: 'Jigglypuff',  type1: 'Normal',   type2: 'Fairy',   rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'pound',       paper: 'disarming-voice', scissors: 'sing' },
    uniqueId: null },
  // ─── #40 WIGGLYTUFF ───
  { id: 40, name: 'Wigglytuff',  type1: 'Normal',   type2: 'Fairy',   rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'body-slam',   paper: 'dazzling-gleam', scissors: 'sing' },
    uniqueId: 'hyper-voice-unique' },
  // ─── #41 ZUBAT ───
  { id: 41, name: 'Zubat',       type1: 'Poison',   type2: 'Flying',  rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'absorb',      paper: 'poison-sting', scissors: 'wing-attack' },
    uniqueId: null },
  // ─── #42 GOLBAT ───
  { id: 42, name: 'Golbat',      type1: 'Poison',   type2: 'Flying',  rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'air-cutter',  paper: 'poison-fang',  scissors: 'confuse-ray' },
    uniqueId: 'leech-life-unique' },
  // ─── #43 ODDISH ───
  { id: 43, name: 'Oddish',      type1: 'Grass',    type2: 'Poison',  rarity: 'comum',
    abilityId: 'overgrow',
    moves: { rock: 'absorb',      paper: 'acid',         scissors: 'sleep-powder' },
    uniqueId: null },
  // ─── #44 GLOOM ───
  { id: 44, name: 'Gloom',       type1: 'Grass',    type2: 'Poison',  rarity: 'rara',
    abilityId: 'overgrow',
    moves: { rock: 'mega-drain',  paper: 'sludge',       scissors: 'stun-spore' },
    uniqueId: null },
  // ─── #45 VILEPLUME ───
  { id: 45, name: 'Vileplume',   type1: 'Grass',    type2: 'Poison',  rarity: 'ultra-rara',
    abilityId: 'overgrow',
    moves: { rock: 'mega-drain',  paper: 'sludge-bomb',  scissors: 'moonblast' },
    uniqueId: 'petal-blizzard-unique' },
  // ─── #46 PARAS ───
  { id: 46, name: 'Paras',       type1: 'Bug',      type2: 'Grass',   rarity: 'comum',
    abilityId: 'no-guard',
    moves: { rock: 'scratch',     paper: 'absorb',       scissors: 'stun-spore' },
    uniqueId: null },
  // ─── #47 PARASECT ───
  { id: 47, name: 'Parasect',    type1: 'Bug',      type2: 'Grass',   rarity: 'rara',
    abilityId: 'no-guard',
    moves: { rock: 'x-scissor',   paper: 'giga-drain',   scissors: 'stun-spore' },
    uniqueId: 'spore-unique' },
  // ─── #48 VENONAT ───
  { id: 48, name: 'Venonat',     type1: 'Bug',      type2: 'Poison',  rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'confusion',   paper: 'poison-powder', scissors: 'disable' },
    uniqueId: null },
  // ─── #49 VENOMOTH ───
  { id: 49, name: 'Venomoth',    type1: 'Bug',      type2: 'Poison',  rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'confusion',   paper: 'poison-powder', scissors: 'bug-buzz' },
    uniqueId: 'psybeam-unique' },
  // ─── #50 DIGLETT ───
  { id: 50, name: 'Diglett',     type1: 'Ground',   type2: null,      rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'scratch',     paper: 'mud-slap',     scissors: 'dig' },
    uniqueId: null },
  // ─── #51 DUGTRIO ───
  { id: 51, name: 'Dugtrio',     type1: 'Ground',   type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'slash',       paper: 'earth-power',  scissors: 'dig' },
    uniqueId: 'fissure' },
  // ─── #52 MEOWTH ───
  { id: 52, name: 'Meowth',      type1: 'Normal',   type2: null,      rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'scratch',     paper: 'bite',         scissors: 'charm' },
    uniqueId: null },
  // ─── #53 PERSIAN ───
  { id: 53, name: 'Persian',     type1: 'Normal',   type2: null,      rarity: 'rara',
    abilityId: 'intimidate',
    moves: { rock: 'slash',       paper: 'bite',         scissors: 'charm' },
    uniqueId: 'swift-unique' },
  // ─── #54 PSYDUCK ───
  { id: 54, name: 'Psyduck',     type1: 'Water',    type2: null,      rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'water-gun',   paper: 'confusion',    scissors: 'tail-whip' },
    uniqueId: null },
  // ─── #55 GOLDUCK ───
  { id: 55, name: 'Golduck',     type1: 'Water',    type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'hydro-pump',  paper: 'confusion',    scissors: 'ice-beam' },
    uniqueId: 'zen-headbutt-unique' },
  // ─── #56 MANKEY ───
  { id: 56, name: 'Mankey',      type1: 'Fighting', type2: null,      rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'karate-chop', paper: 'low-kick',     scissors: 'fury-swipes' },
    uniqueId: null },
  // ─── #57 PRIMEAPE ───
  { id: 57, name: 'Primeape',    type1: 'Fighting', type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'karate-chop', paper: 'thunder-punch', scissors: 'rage' },
    uniqueId: 'cross-chop-unique' },
  // ─── #58 GROWLITHE ───
  { id: 58, name: 'Growlithe',   type1: 'Fire',     type2: null,      rarity: 'rara',
    abilityId: 'flash-fire',
    moves: { rock: 'ember',       paper: 'bite',         scissors: 'tackle' },
    uniqueId: null },
  // ─── #59 ARCANINE ───
  { id: 59, name: 'Arcanine',    type1: 'Fire',     type2: null,      rarity: 'ultra-rara',
    abilityId: 'flash-fire',
    moves: { rock: 'flamethrower', paper: 'take-down',   scissors: 'crunch' },
    uniqueId: 'extremespeed' },
  // ─── #60 POLIWAG ───
  { id: 60, name: 'Poliwag',     type1: 'Water',    type2: null,      rarity: 'comum',
    abilityId: 'water-absorb',
    moves: { rock: 'pound',       paper: 'bubble',       scissors: 'hypnosis' },
    uniqueId: null },
  // ─── #61 POLIWHIRL ───
  { id: 61, name: 'Poliwhirl',   type1: 'Water',    type2: null,      rarity: 'rara',
    abilityId: 'water-absorb',
    moves: { rock: 'bubble-beam', paper: 'body-slam',    scissors: 'hypnosis' },
    uniqueId: null },
  // ─── #62 POLIWRATH ───
  { id: 62, name: 'Poliwrath',   type1: 'Water',    type2: 'Fighting', rarity: 'ultra-rara',
    abilityId: 'water-absorb',
    moves: { rock: 'waterfall',   paper: 'submission',   scissors: 'ice-punch' },
    uniqueId: 'dynamic-punch-unique' },
  // ─── #63 ABRA ───
  { id: 63, name: 'Abra',        type1: 'Psychic',  type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'confusion',   paper: 'teleport',     scissors: 'hidden-power' },
    uniqueId: null },
  // ─── #64 KADABRA ───
  { id: 64, name: 'Kadabra',     type1: 'Psychic',  type2: null,      rarity: 'rara',
    abilityId: 'synchronize',
    moves: { rock: 'confusion',   paper: 'hidden-power-dark', scissors: 'disable' },
    uniqueId: null },
  // ─── #65 ALAKAZAM ───
  { id: 65, name: 'Alakazam',    type1: 'Psychic',  type2: null,      rarity: 'ultra-rara',
    abilityId: 'synchronize',
    moves: { rock: 'psychic',     paper: 'hidden-power-dark', scissors: 'focus-blast' },
    uniqueId: 'future-sight-unique' },
  // ─── #66 MACHOP ───
  { id: 66, name: 'Machop',      type1: 'Fighting', type2: null,      rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'karate-chop', paper: 'bullet-punch', scissors: 'work-up' },
    uniqueId: null },
  // ─── #67 MACHOKE ───
  { id: 67, name: 'Machoke',     type1: 'Fighting', type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'karate-chop', paper: 'bullet-punch', scissors: 'thunder-punch' },
    uniqueId: null },
  // ─── #68 MACHAMP ───
  { id: 68, name: 'Machamp',     type1: 'Fighting', type2: null,      rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'hammer-arm',  paper: 'bullet-punch', scissors: 'thunder-punch' },
    uniqueId: 'focus-punch' },
  // ─── #69 BELLSPROUT ───
  { id: 69, name: 'Bellsprout',  type1: 'Grass',    type2: 'Poison',  rarity: 'comum',
    abilityId: 'overgrow',
    moves: { rock: 'vine-whip',   paper: 'acid',         scissors: 'sleep-powder' },
    uniqueId: null },
  // ─── #70 WEEPINBELL ───
  { id: 70, name: 'Weepinbell',  type1: 'Grass',    type2: 'Poison',  rarity: 'rara',
    abilityId: 'overgrow',
    moves: { rock: 'razor-leaf',  paper: 'sludge',       scissors: 'stun-spore' },
    uniqueId: null },
  // ─── #71 VICTREEBEL ───
  { id: 71, name: 'Victreebel',  type1: 'Grass',    type2: 'Poison',  rarity: 'ultra-rara',
    abilityId: 'overgrow',
    moves: { rock: 'leaf-blade',  paper: 'sludge-bomb',  scissors: 'bite' },
    uniqueId: 'leaf-storm-unique' },
  // ─── #72 TENTACOOL ───
  { id: 72, name: 'Tentacool',   type1: 'Water',    type2: 'Poison',  rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'bubble',      paper: 'acid',         scissors: 'toxic-spikes' },
    uniqueId: null },
  // ─── #73 TENTACRUEL ─── scissors: acid-spray (buff: def -1)
  { id: 73, name: 'Tentacruel',  type1: 'Water',    type2: 'Poison',  rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'hydro-pump',  paper: 'sludge-wave',  scissors: 'poison-gas' },
    uniqueId: 'acid-spray-unique' },
  // ─── #74 GEODUDE ───
  { id: 74, name: 'Geodude',     type1: 'Rock',     type2: 'Ground',  rarity: 'comum',
    abilityId: 'sturdy',
    moves: { rock: 'rock-throw',  paper: 'tackle',       scissors: 'stealth-rock' },
    uniqueId: null },
  // ─── #75 GRAVELER ───
  { id: 75, name: 'Graveler',    type1: 'Rock',     type2: 'Ground',  rarity: 'rara',
    abilityId: 'sturdy',
    moves: { rock: 'rock-blast',  paper: 'double-edge',  scissors: 'magnitude' },
    uniqueId: null },
  // ─── #76 GOLEM ───
  { id: 76, name: 'Golem',       type1: 'Rock',     type2: 'Ground',  rarity: 'ultra-rara',
    abilityId: 'sturdy',
    moves: { rock: 'stone-edge',  paper: 'thunder-punch', scissors: 'magnitude' },
    uniqueId: 'explosion-unique' },
  // ─── #77 PONYTA ───
  { id: 77, name: 'Ponyta',      type1: 'Fire',     type2: null,      rarity: 'rara',
    abilityId: 'flash-fire',
    moves: { rock: 'ember',       paper: 'stomp',        scissors: 'quick-attack' },
    uniqueId: null },
  // ─── #78 RAPIDASH ───
  { id: 78, name: 'Rapidash',    type1: 'Fire',     type2: null,      rarity: 'ultra-rara',
    abilityId: 'flash-fire',
    moves: { rock: 'fire-blast',  paper: 'high-horsepower', scissors: 'quick-attack' },
    uniqueId: 'flame-charge-unique' },
  // ─── #79 SLOWPOKE ───
  { id: 79, name: 'Slowpoke',    type1: 'Water',    type2: 'Psychic', rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'water-gun',   paper: 'confusion',    scissors: 'amnesia' },
    uniqueId: null },
  // ─── #80 SLOWBRO ───
  { id: 80, name: 'Slowbro',     type1: 'Water',    type2: 'Psychic', rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'scald',       paper: 'psychic',      scissors: 'hidden-power-dark' },
    uniqueId: 'slack-off' },
  // ─── #81 MAGNEMITE ───
  { id: 81, name: 'Magnemite',   type1: 'Electric', type2: 'Steel',   rarity: 'rara',
    abilityId: 'volt-absorb',
    moves: { rock: 'thunder-shock', paper: 'metal-sound', scissors: 'supersonic' },
    uniqueId: null },
  // ─── #82 MAGNETON ───
  { id: 82, name: 'Magneton',    type1: 'Electric', type2: 'Steel',   rarity: 'ultra-rara',
    abilityId: 'volt-absorb',
    moves: { rock: 'thunderbolt', paper: 'flash-cannon', scissors: 'supersonic' },
    uniqueId: 'tri-attack' },
  // ─── #83 FARFETCH'D ───
  { id: 83, name: "Farfetch'd",  type1: 'Normal',   type2: 'Flying',  rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'slash',       paper: 'air-cutter',   scissors: 'night-slash' },
    uniqueId: 'stick-unique' },
  // ─── #84 DODUO ───
  { id: 84, name: 'Doduo',       type1: 'Normal',   type2: 'Flying',  rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'peck',        paper: 'fury-attack',  scissors: 'growl' },
    uniqueId: null },
  // ─── #85 DODRIO ───
  { id: 85, name: 'Dodrio',      type1: 'Normal',   type2: 'Flying',  rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'drill-peck',  paper: 'fury-attack',  scissors: 'agility' },
    uniqueId: 'tri-attack' },
  // ─── #86 SEEL ───
  { id: 86, name: 'Seel',        type1: 'Water',    type2: null,      rarity: 'comum',
    abilityId: 'water-absorb',
    moves: { rock: 'aurora-beam', paper: 'water-gun',    scissors: 'headbutt' },
    uniqueId: null },
  // ─── #87 DEWGONG ───
  { id: 87, name: 'Dewgong',     type1: 'Water',    type2: 'Ice',     rarity: 'rara',
    abilityId: 'water-absorb',
    moves: { rock: 'ice-beam',    paper: 'surf',         scissors: 'take-down' },
    uniqueId: 'sheer-cold' },
  // ─── #88 GRIMER ───
  { id: 88, name: 'Grimer',      type1: 'Poison',   type2: null,      rarity: 'comum',
    abilityId: 'sturdy',
    moves: { rock: 'poison-gas',  paper: 'acid',         scissors: 'minimize' },
    uniqueId: null },
  // ─── #89 MUK ───
  { id: 89, name: 'Muk',         type1: 'Poison',   type2: null,      rarity: 'rara',
    abilityId: 'sturdy',
    moves: { rock: 'sludge-bomb', paper: 'thief',        scissors: 'minimize' },
    uniqueId: 'acid-armor-unique' },
  // ─── #90 SHELLDER ───
  { id: 90, name: 'Shellder',    type1: 'Water',    type2: null,      rarity: 'comum',
    abilityId: 'sturdy',
    moves: { rock: 'tackle',      paper: 'water-gun',    scissors: 'withdraw' },
    uniqueId: null },
  // ─── #91 CLOYSTER ───
  { id: 91, name: 'Cloyster',    type1: 'Water',    type2: 'Ice',     rarity: 'ultra-rara',
    abilityId: 'sturdy',
    moves: { rock: 'icicle-spear', paper: 'surf',        scissors: 'spike-cannon' },
    uniqueId: 'shell-smash-unique' },
  // ─── #92 GASTLY ───
  { id: 92, name: 'Gastly',      type1: 'Ghost',    type2: 'Poison',  rarity: 'rara',
    abilityId: 'levitate',
    moves: { rock: 'lick',        paper: 'hypnosis',     scissors: 'night-shade' },
    uniqueId: null },
  // ─── #93 HAUNTER ───
  { id: 93, name: 'Haunter',     type1: 'Ghost',    type2: 'Poison',  rarity: 'rara',
    abilityId: 'levitate',
    moves: { rock: 'lick',        paper: 'sludge-wave',  scissors: 'dark-pulse' },
    uniqueId: null },
  // ─── #94 GENGAR ───
  { id: 94, name: 'Gengar',      type1: 'Ghost',    type2: 'Poison',  rarity: 'ultra-rara',
    abilityId: 'levitate',
    moves: { rock: 'lick',        paper: 'sludge-wave',  scissors: 'dark-pulse' },
    uniqueId: 'shadow-ball-gengar' },
  // ─── #95 ONIX ─── scissors: protect
  { id: 95, name: 'Onix',        type1: 'Rock',     type2: 'Ground',  rarity: 'rara',
    abilityId: 'sturdy',
    moves: { rock: 'rock-throw',  paper: 'rock-blast',   scissors: 'stealth-rock' },
    uniqueId: null },
  // ─── #96 DROWZEE ───
  { id: 96, name: 'Drowzee',     type1: 'Psychic',  type2: null,      rarity: 'rara',
    abilityId: 'synchronize',
    moves: { rock: 'confusion',   paper: 'headbutt',     scissors: 'hypnosis' },
    uniqueId: null },
  // ─── #97 HYPNO ───
  { id: 97, name: 'Hypno',       type1: 'Psychic',  type2: null,      rarity: 'ultra-rara',
    abilityId: 'synchronize',
    moves: { rock: 'hypnosis',    paper: 'hidden-power', scissors: 'shadow-claw' },
    uniqueId: 'dream-eater' },
  // ─── #98 KRABBY ───
  { id: 98, name: 'Krabby',      type1: 'Water',    type2: null,      rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'vicegrip',    paper: 'bubble',       scissors: 'harden' },
    uniqueId: null },
  // ─── #99 KINGLER ───
  { id: 99, name: 'Kingler',     type1: 'Water',    type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'crabhammer',  paper: 'dig',          scissors: 'vicegrip' },
    uniqueId: 'guillotine' },
  // ─── #100 VOLTORB ───
  { id: 100, name: 'Voltorb',    type1: 'Electric', type2: null,      rarity: 'rara',
    abilityId: 'volt-absorb',
    moves: { rock: 'thunder-shock', paper: 'spark',      scissors: 'self-destruct' },
    uniqueId: null },
  // ─── #101 ELECTRODE ───
  { id: 101, name: 'Electrode',  type1: 'Electric', type2: null,      rarity: 'ultra-rara',
    abilityId: 'volt-absorb',
    moves: { rock: 'thunderbolt', paper: 'rapid-spin',   scissors: 'self-destruct' },
    uniqueId: 'electrode-explosion' },
  // ─── #102 EXEGGCUTE ───
  { id: 102, name: 'Exeggcute',  type1: 'Grass',    type2: 'Psychic', rarity: 'rara',
    abilityId: 'overgrow',
    moves: { rock: 'confusion',   paper: 'absorb',       scissors: 'sleep-powder' },
    uniqueId: null },
  // ─── #103 EXEGGUTOR ───
  { id: 103, name: 'Exeggutor',  type1: 'Grass',    type2: 'Psychic', rarity: 'ultra-rara',
    abilityId: 'overgrow',
    moves: { rock: 'psychic',     paper: 'solar-beam',   scissors: 'hidden-power' },
    uniqueId: 'egg-bomb-unique' },
  // ─── #104 CUBONE ───
  { id: 104, name: 'Cubone',     type1: 'Ground',   type2: null,      rarity: 'comum',
    abilityId: 'sturdy',
    moves: { rock: 'bonemerang',  paper: 'astonish',     scissors: 'growl' },
    uniqueId: null },
  // ─── #105 MAROWAK ───
  { id: 105, name: 'Marowak',    type1: 'Ground',   type2: null,      rarity: 'rara',
    abilityId: 'sturdy',
    moves: { rock: 'bonemerang',  paper: 'smack-down',   scissors: 'headbutt' },
    uniqueId: 'bone-rush-unique' },
  // ─── #106 HITMONLEE ───
  { id: 106, name: 'Hitmonlee',  type1: 'Fighting', type2: null,      rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'low-kick',    paper: 'faint-attack', scissors: 'blaze-kick' },
    uniqueId: 'high-jump-kick-unique' },
  // ─── #107 HITMONCHAN ───
  { id: 107, name: 'Hitmonchan', type1: 'Fighting', type2: null,      rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'mega-punch',  paper: 'thunder-punch', scissors: 'ice-punch' },
    uniqueId: 'mach-punch-unique' },
  // ─── #108 LICKITUNG ───
  { id: 108, name: 'Lickitung',  type1: 'Normal',   type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'lick',        paper: 'body-slam',    scissors: 'counter' },
    uniqueId: 'wrap-unique' },
  // ─── #109 KOFFING ───
  { id: 109, name: 'Koffing',    type1: 'Poison',   type2: null,      rarity: 'comum',
    abilityId: 'levitate',
    moves: { rock: 'smog',        paper: 'thief',        scissors: 'smokescreen' },
    uniqueId: null },
  // ─── #110 WEEZING ───
  { id: 110, name: 'Weezing',    type1: 'Poison',   type2: null,      rarity: 'rara',
    abilityId: 'levitate',
    moves: { rock: 'sludge-bomb', paper: 'fire-blast',   scissors: 'thief' },
    uniqueId: 'destiny-bond' },
  // ─── #111 RHYHORN ───
  { id: 111, name: 'Rhyhorn',    type1: 'Ground',   type2: 'Rock',    rarity: 'rara',
    abilityId: 'sturdy',
    moves: { rock: 'stomp',       paper: 'rock-blast',   scissors: 'horn-attack' },
    uniqueId: null },
  // ─── #112 RHYDON ───
  { id: 112, name: 'Rhydon',     type1: 'Ground',   type2: 'Rock',    rarity: 'ultra-rara',
    abilityId: 'sturdy',
    moves: { rock: 'hammer-arm',  paper: 'earth-power',  scissors: 'horn-attack' },
    uniqueId: 'rock-wrecker' },
  // ─── #113 CHANSEY ───
  { id: 113, name: 'Chansey',    type1: 'Normal',   type2: null,      rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'double-slap', paper: 'body-slam',    scissors: 'disarming-voice' },
    uniqueId: 'soft-boiled' },
  // ─── #114 TANGELA ───
  { id: 114, name: 'Tangela',    type1: 'Grass',    type2: null,      rarity: 'rara',
    abilityId: 'overgrow',
    moves: { rock: 'vine-whip',   paper: 'mega-drain',   scissors: 'slam' },
    uniqueId: 'bind-unique' },
  // ─── #115 KANGASKHAN ───
  { id: 115, name: 'Kangaskhan', type1: 'Normal',   type2: null,      rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'comet-punch', paper: 'earth-power',  scissors: 'surf' },
    uniqueId: 'parental-bond' },
  // ─── #116 HORSEA ───
  { id: 116, name: 'Horsea',     type1: 'Water',    type2: null,      rarity: 'comum',
    abilityId: 'water-absorb',
    moves: { rock: 'twister',     paper: 'bubble',       scissors: 'smokescreen' },
    uniqueId: null },
  // ─── #117 SEADRA ───
  { id: 117, name: 'Seadra',     type1: 'Water',    type2: null,      rarity: 'rara',
    abilityId: 'water-absorb',
    moves: { rock: 'twister',     paper: 'bubble-beam',  scissors: 'agility' },
    uniqueId: 'dragon-pulse' },
  // ─── #118 GOLDEEN ───
  { id: 118, name: 'Goldeen',    type1: 'Water',    type2: null,      rarity: 'comum',
    abilityId: 'water-absorb',
    moves: { rock: 'horn-attack', paper: 'water-gun',    scissors: 'supersonic' },
    uniqueId: null },
  // ─── #119 SEAKING ───
  { id: 119, name: 'Seaking',    type1: 'Water',    type2: null,      rarity: 'rara',
    abilityId: 'water-absorb',
    moves: { rock: 'horn-attack', paper: 'waterfall',    scissors: 'ice-beam' },
    uniqueId: 'megahorn' },
  // ─── #120 STARYU ───
  { id: 120, name: 'Staryu',     type1: 'Water',    type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'water-gun',   paper: 'rapid-spin',   scissors: 'confusion' },
    uniqueId: null },
  // ─── #121 STARMIE ───
  { id: 121, name: 'Starmie',    type1: 'Water',    type2: 'Psychic', rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'hydro-pump',  paper: 'psychic',      scissors: 'thunderbolt' },
    uniqueId: 'power-gem-unique' },
  // ─── #122 MR. MIME ───
  { id: 122, name: 'Mr. Mime',   type1: 'Psychic',  type2: 'Fairy',   rarity: 'ultra-rara',
    abilityId: 'synchronize',
    moves: { rock: 'confusion',   paper: 'dazzling-gleam', scissors: 'mimic' },
    uniqueId: 'barrier-unique' },
  // ─── #123 SCYTHER ───
  { id: 123, name: 'Scyther',    type1: 'Bug',      type2: 'Flying',  rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'x-scissor',   paper: 'wing-attack',  scissors: 'slash' },
    uniqueId: 'cut-unique' },
  // ─── #124 JYNX ───
  { id: 124, name: 'Jynx',       type1: 'Ice',      type2: 'Psychic', rarity: 'ultra-rara',
    abilityId: 'synchronize',
    moves: { rock: 'ice-beam',    paper: 'psychic',      scissors: 'charm' },
    uniqueId: 'lovely-kiss-unique' },
  // ─── #125 ELECTABUZZ ───
  { id: 125, name: 'Electabuzz', type1: 'Electric', type2: null,      rarity: 'ultra-rara',
    abilityId: 'volt-absorb',
    moves: { rock: 'ice-punch',   paper: 'thunder-punch', scissors: 'thunder-wave' },
    uniqueId: 'volt-switch-unique' },
  // ─── #126 MAGMAR ───
  { id: 126, name: 'Magmar',     type1: 'Fire',     type2: null,      rarity: 'ultra-rara',
    abilityId: 'flash-fire',
    moves: { rock: 'fire-punch',  paper: 'counter',      scissors: 'thunder-punch' },
    uniqueId: 'lava-plume' },
  // ─── #127 PINSIR ───
  { id: 127, name: 'Pinsir',     type1: 'Bug',      type2: null,      rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'vicegrip',    paper: 'x-scissor',    scissors: 'submission' },
    uniqueId: 'cut-unique' },
  // ─── #128 TAUROS ───
  { id: 128, name: 'Tauros',     type1: 'Normal',   type2: null,      rarity: 'ultra-rara',
    abilityId: 'intimidate',
    moves: { rock: 'body-slam',   paper: 'iron-tail',    scissors: 'counter' },
    uniqueId: 'giga-impact' },
  // ─── #129 MAGIKARP ───
  { id: 129, name: 'Magikarp',   type1: 'Water',    type2: null,      rarity: 'comum',
    abilityId: 'inner-focus',
    moves: { rock: 'splash',      paper: 'tackle',       scissors: 'flail' },
    uniqueId: null },
  // ─── #130 GYARADOS ───
  { id: 130, name: 'Gyarados',   type1: 'Water',    type2: 'Flying',  rarity: 'ultra-rara',
    abilityId: 'intimidate',
    moves: { rock: 'waterfall',   paper: 'twister',      scissors: 'ice-fang' },
    uniqueId: 'hyper-beam' },
  // ─── #131 LAPRAS ───
  { id: 131, name: 'Lapras',     type1: 'Water',    type2: 'Ice',     rarity: 'ultra-rara',
    abilityId: 'water-absorb',
    moves: { rock: 'ice-beam',    paper: 'surf',         scissors: 'thunderbolt' },
    uniqueId: 'perish-song' },
  // ─── #132 DITTO ───
  { id: 132, name: 'Ditto',      type1: 'Normal',   type2: null,      rarity: 'epico',
    abilityId: 'imposter',
    moves: { rock: 'tackle',      paper: 'tackle',       scissors: 'tackle' },
    uniqueId: 'transform' },
  // ─── #133 EEVEE ───
  { id: 133, name: 'Eevee',      type1: 'Normal',   type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'quick-attack', paper: 'bite',        scissors: 'tail-whip' },
    uniqueId: null },
  // ─── #134 VAPOREON ───
  { id: 134, name: 'Vaporeon',   type1: 'Water',    type2: null,      rarity: 'ultra-rara',
    abilityId: 'water-absorb',
    moves: { rock: 'hydro-pump',  paper: 'ice-beam',     scissors: 'last-resort' },
    uniqueId: 'aqua-ring-unique' },
  // ─── #135 JOLTEON ───
  { id: 135, name: 'Jolteon',    type1: 'Electric', type2: null,      rarity: 'ultra-rara',
    abilityId: 'volt-absorb',
    moves: { rock: 'thunderbolt', paper: 'crunch',       scissors: 'quick-attack' },
    uniqueId: 'jolteon-pin-missile' },
  // ─── #136 FLAREON ───
  { id: 136, name: 'Flareon',    type1: 'Fire',     type2: null,      rarity: 'ultra-rara',
    abilityId: 'flash-fire',
    moves: { rock: 'fire-blast',  paper: 'bite',         scissors: 'will-o-wisp' },
    uniqueId: 'flare-blitz' },
  // ─── #137 PORYGON ───
  { id: 137, name: 'Porygon',    type1: 'Normal',   type2: null,      rarity: 'ultra-rara',
    abilityId: 'no-guard',
    moves: { rock: 'hidden-power', paper: 'confusion',   scissors: 'dark-pulse' },
    uniqueId: 'conversion' },
  // ─── #138 OMANYTE ───
  { id: 138, name: 'Omanyte',    type1: 'Rock',     type2: 'Water',   rarity: 'rara',
    abilityId: 'sturdy',
    moves: { rock: 'water-gun',   paper: 'rock-blast',   scissors: 'tackle' },
    uniqueId: null },
  // ─── #139 OMASTAR ───
  { id: 139, name: 'Omastar',    type1: 'Rock',     type2: 'Water',   rarity: 'ultra-rara',
    abilityId: 'sturdy',
    moves: { rock: 'rock-blast',  paper: 'hydro-pump',   scissors: 'spike-cannon' },
    uniqueId: 'ancient-power-unique' },
  // ─── #140 KABUTO ───
  { id: 140, name: 'Kabuto',     type1: 'Rock',     type2: 'Water',   rarity: 'rara',
    abilityId: 'sturdy',
    moves: { rock: 'rock-blast',  paper: 'bubble',       scissors: 'scratch' },
    uniqueId: null },
  // ─── #141 KABUTOPS ───
  { id: 141, name: 'Kabutops',   type1: 'Rock',     type2: 'Water',   rarity: 'ultra-rara',
    abilityId: 'sturdy',
    moves: { rock: 'stone-edge',  paper: 'waterfall',    scissors: 'slash' },
    uniqueId: 'aqua-jet' },
  // ─── #142 AERODACTYL ───
  { id: 142, name: 'Aerodactyl', type1: 'Rock',     type2: 'Flying',  rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'smack-down',  paper: 'wing-attack',  scissors: 'twister' },
    uniqueId: 'rock-slide-unique' },
  // ─── #143 SNORLAX ───
  { id: 143, name: 'Snorlax',    type1: 'Normal',   type2: null,      rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'body-slam',   paper: 'crunch',       scissors: 'earth-power' },
    uniqueId: 'rest' },
  // ─── #144 ARTICUNO ───
  { id: 144, name: 'Articuno',   type1: 'Ice',      type2: 'Flying',  rarity: 'lendaria',
    abilityId: 'inner-focus',
    moves: { rock: 'blizzard',    paper: 'air-slash',    scissors: 'reflect' },
    uniqueId: 'articuno-sheer-cold' },
  // ─── #145 ZAPDOS ───
  { id: 145, name: 'Zapdos',     type1: 'Electric', type2: 'Flying',  rarity: 'lendaria',
    abilityId: 'volt-absorb',
    moves: { rock: 'thunderbolt', paper: 'fly',          scissors: 'detect' },
    uniqueId: 'thunder' },
  // ─── #146 MOLTRES ───
  { id: 146, name: 'Moltres',    type1: 'Fire',     type2: 'Flying',  rarity: 'lendaria',
    abilityId: 'flash-fire',
    moves: { rock: 'fire-blast',  paper: 'wing-attack',  scissors: 'payback' },
    uniqueId: 'sky-attack' },
  // ─── #147 DRATINI ───
  { id: 147, name: 'Dratini',    type1: 'Dragon',   type2: null,      rarity: 'rara',
    abilityId: 'inner-focus',
    moves: { rock: 'twister',     paper: 'dragon-rage',  scissors: 'thunder-wave' },
    uniqueId: null },
  // ─── #148 DRAGONAIR ───
  { id: 148, name: 'Dragonair',  type1: 'Dragon',   type2: null,      rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'twister',     paper: 'aqua-tail',    scissors: 'thunder-wave' },
    uniqueId: null },
  // ─── #149 DRAGONITE ───
  { id: 149, name: 'Dragonite',  type1: 'Dragon',   type2: 'Flying',  rarity: 'ultra-rara',
    abilityId: 'inner-focus',
    moves: { rock: 'dragon-claw', paper: 'fly',          scissors: 'thunder-wave' },
    uniqueId: 'outrage' },
  // ─── #150 MEWTWO ───
  { id: 150, name: 'Mewtwo',     type1: 'Psychic',  type2: null,      rarity: 'lendaria',
    abilityId: 'inner-focus',
    moves: { rock: 'psychic',     paper: 'aura-sphere',  scissors: 'dark-pulse' },
    uniqueId: 'psystrike' },
  // ─── #151 MEW ───
  { id: 151, name: 'Mew',        type1: 'Psychic',  type2: null,      rarity: 'epico',
    abilityId: 'synchronize-mew',
    moves: { rock: 'pound',       paper: 'psychic',      scissors: 'rock-blast' },
    uniqueId: 'transform' },
  // ─── #9025 ASH'S PIKACHU ─── (Easter egg)
  { id: 9025, name: "Ash's Pikachu", type1: 'Electric', type2: null,  rarity: 'lendaria',
    abilityId: 'lightning-rod',
    moves: { rock: 'thunderbolt', paper: 'surf',         scissors: 'fly' },
    uniqueId: 'volt-tackle' },
  // ─── #0 MISSINGNO. ───
  { id: 0,   name: 'MissingNo.', type1: 'Normal',   type2: 'Flying',  rarity: 'epico',
    abilityId: 'glitch',
    moves: { rock: 'water-gun',   paper: 'water-gun',    scissors: 'wing-attack' },
    uniqueId: 'glitch-beam' },
]

function resolveMove(moveId: string, slot: RPS): Move {
  const def = getMove(moveId)
  return {
    name: def.name,
    type: def.type,
    category: slot,
    kind: def.kind,
    ...(def.drain         !== undefined && { drain:        def.drain }),
    ...(def.statusEffect  !== undefined && { statusEffect: def.statusEffect }),
    ...(def.buffEffect    !== undefined && { buffEffect:   def.buffEffect }),
    ...(def.special       !== undefined && { special:      def.special }),
  }
}

function resolveAbility(abilityId: string): Ability {
  const def = getAbility(abilityId)
  return { name: def.name, description: def.description }
}

function resolveUnique(uniqueId: string): UniqueMove {
  const def = getUnique(uniqueId)
  return {
    name:        def.name,
    type:        def.type,
    category:    def.rpsSlot,
    description: def.description,
    kind:        def.kind,
    ...(def.healAmount        !== undefined && { healAmount:        def.healAmount }),
    ...(def.selfStatus        !== undefined && { selfStatus:        def.selfStatus }),
    ...(def.benchDamage       !== undefined && { benchDamage:       def.benchDamage }),
    ...(def.damage            !== undefined && { damage:            def.damage }),
    ...(def.recoil            !== undefined && { recoil:            def.recoil }),
    ...(def.drain             !== undefined && { drain:             def.drain }),
    ...(def.userFaints        !== undefined && { userFaints:        def.userFaints }),
    ...(def.cooldown          !== undefined && { cooldown:          def.cooldown }),
    ...(def.applyEnemyStatus  !== undefined && { applyEnemyStatus:  def.applyEnemyStatus }),
    ...(def.critChance        !== undefined && { critChance:        def.critChance }),
    ...(def.special           !== undefined && { special:           def.special }),
  }
}

export const ASH_PIKACHU_ID = 9025
export const MISSINGNO_ID = 0
export const STARTER_IDS = [1, 4, 7] as const

type PokemonTemplate = Omit<PokemonCard, 'hearts' | 'isFainted' | 'statusEffects' | 'isShiny' | 'heldItem'>

export const POKEMON_TEMPLATES: PokemonTemplate[] = TEMPLATES.map((t) => ({
  id:       t.id,
  name:     t.name,
  type1:    t.type1,
  type2:    t.type2,
  rarity:   t.rarity,
  ability:  resolveAbility(t.abilityId),
  moves: {
    rock:     resolveMove(t.moves.rock,     'rock'),
    paper:    resolveMove(t.moves.paper,    'paper'),
    scissors: resolveMove(t.moves.scissors, 'scissors'),
  },
  unique: t.uniqueId ? resolveUnique(t.uniqueId) : null,
}))

export function getPokemonById(id: number): PokemonTemplate | undefined {
  return POKEMON_TEMPLATES.find((p) => p.id === id)
}

export function makePokemonCard(id: number, isShiny = false): PokemonCard | undefined {
  const template = getPokemonById(id)
  if (!template) return undefined
  return {
    ...template,
    isShiny,
    hearts: 5,
    isFainted: false,
    statusEffects: [],
    heldItem: null,
  }
}

export const DRAFT_POOL_COMMON = POKEMON_TEMPLATES.filter(
  (p) => p.rarity === 'comum' && p.id !== 0,
).map((p) => p.id)

export const DRAFT_POOL_RARE = POKEMON_TEMPLATES.filter(
  (p) => p.rarity === 'rara' && p.id !== 0,
).map((p) => p.id)

export const DRAFT_POOL_ULTRA = POKEMON_TEMPLATES.filter(
  (p) => p.rarity === 'ultra-rara',
).map((p) => p.id)

export const LEGENDARY_IDS = [144, 145, 146, 150] as const

// ─── Sistema de zonas geográficas ────────────────────────────────────────────
// Iniciais e suas evoluções nunca aparecem nos pools selvagens
export const STARTER_LINE_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])

interface ZonePool {
  name: string
  floors: number[]  // prevFloor (andar que acabou de ser vencido)
  common: number[]
  rare:   number[]
  ultra:  number[]
}

export const ZONE_POOLS: readonly ZonePool[] = [
  // Z1 — Floresta Viridian / Route 1-5 / Mt. Moon (após Brock e Misty)
  {
    name: 'Floresta Viridian',
    floors: [0, 1],
    common: [10, 13, 16, 19, 21, 29, 32, 41, 74],
    rare:   [11, 14, 17, 23, 25, 27, 35, 39, 56, 95],
    ultra:  [12, 15, 18, 20, 22, 24, 26, 28, 30, 33, 36, 37, 40, 42],
  },
  // Z2 — Route 6-12 / Rock Tunnel / Celadon / SS Anne (após Surge e Erika)
  {
    name: 'Vermilion & Rock Tunnel',
    floors: [2, 3],
    common: [43, 46, 60, 69, 79, 84, 96, 100, 118],
    rare:   [44, 47, 48, 52, 54, 61, 70, 80, 81, 83, 85, 98, 116],
    ultra:  [45, 49, 51, 53, 55, 57, 62, 71, 82, 86, 97, 99, 101, 117, 119, 120],
  },
  // Z3 — Routes 13-18 / Safari Zone / Silph Co. / Torre Lavender (após Koga e Sabrina)
  {
    name: 'Safari Zone',
    floors: [4, 5],
    common: [102, 104, 108, 113, 114, 115, 128, 129],
    rare:   [63, 72, 87, 92, 103, 105, 106, 107, 109, 111, 112, 122, 132],
    ultra:  [64, 65, 73, 88, 89, 93, 94, 110, 121, 123, 127, 130, 131, 133, 143],
  },
  // Z4 — Ilha Cinnabar / Power Plant / Routes 19-25 (após Blaine e Giovanni)
  {
    name: 'Ilha Cinnabar',
    floors: [6, 7],
    common: [58, 77, 90, 129, 138, 140],
    rare:   [59, 78, 91, 124, 125, 126, 130, 139, 141],
    ultra:  [68, 134, 135, 136, 137, 142],
  },
  // Z5 — Victory Road / Cerulean Cave / Pokemon League (Elite 4)
  {
    name: 'Victory Road',
    floors: [8, 9, 10, 11],
    common: [66, 75, 147],
    rare:   [67, 76, 111, 148],
    ultra:  [144, 145, 146, 149, 150, 151],
  },
] as const

function rngShuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Gera 3 IDs para o pool pós-batalha baseado na zona geográfica e no andar
export function generateZonePool(prevFloor: number, excludeIds: Set<number>): number[] {
  const zone = ZONE_POOLS.find(z => z.floors.includes(prevFloor)) ?? ZONE_POOLS[ZONE_POOLS.length - 1]
  const deepInZone = zone.floors.indexOf(prevFloor) > 0

  // Bag ponderada: mais comum no início da zona, mais rara/ultra no final
  const bag: number[] = deepInZone
    ? [...zone.common, ...zone.rare, ...zone.rare, ...zone.ultra, ...zone.ultra]
    : [...zone.common, ...zone.common, ...zone.common, ...zone.rare, ...zone.rare, ...zone.ultra]

  const shuffled = rngShuffle(bag)
  const result: number[] = []
  const seen = new Set<number>()

  for (const id of shuffled) {
    if (result.length >= 3) break
    if (seen.has(id) || excludeIds.has(id)) continue
    seen.add(id)
    result.push(id)
  }

  // Fallback: se a zona não tem Pokémon suficientes, pega de qualquer zona
  if (result.length < 3) {
    const all = rngShuffle(Array.from(new Set(ZONE_POOLS.flatMap(z => [...z.common, ...z.rare, ...z.ultra]))))
    for (const id of all) {
      if (result.length >= 3) break
      if (excludeIds.has(id) || result.includes(id)) continue
      result.push(id)
    }
  }

  // Missingno easter egg em Z5 (5% de chance)
  if (zone.name === 'Victory Road' && !excludeIds.has(0) && Math.random() < 0.05) {
    result[Math.floor(Math.random() * result.length)] = 0
  }

  return result
}

// Pool para as rodadas 2-6 do draft inicial (Pallet Town / Rota 1 — Z1)
export function generateInitialDraftPool(excludeIds: Set<number>): number[] {
  return generateZonePool(0, excludeIds)
}
