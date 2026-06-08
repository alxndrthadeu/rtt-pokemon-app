import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './types/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette principal — Sugimori watercolor warmth
        parchment: '#F5EDD8',      // fundo papel aquarela
        'parchment-light': '#FBF5E6', // cards
        ink: '#2C1810',            // tinta quente (não preto frio)
        'ink-soft': '#5C3D2E',     // texto secundário

        // Pokémon brand
        pokemon: {
          red:    '#CC2200',
          coral:  '#E83535',
          blue:   '#3B4CCA',
          yellow: '#FFDE00',
          lime:   '#C8FF00',
          cream:  '#FAF9F4',
          sky:    '#C2E4F5',
          ink:    '#1A1A1A',
        },

        // Gen 1 type colors originais (Sugimori palette)
        type: {
          normal:   '#A8A878',
          fire:     '#F08030',
          water:    '#6890F0',
          grass:    '#78C850',
          electric: '#F8D030',
          ice:      '#98D8D8',
          fighting: '#C03028',
          poison:   '#A040A0',
          ground:   '#E0C068',
          flying:   '#A890F0',
          psychic:  '#F85888',
          bug:      '#A8B820',
          rock:     '#B8A038',
          ghost:    '#705898',
          dragon:   '#7038F8',
        },
      },
      fontFamily: {
        game: ['var(--font-press-start)', 'monospace'],
      },
      boxShadow: {
        'neo':    '4px 4px 0px #2C1810',
        'neo-sm': '3px 3px 0px #2C1810',
        'neo-lg': '6px 6px 0px #2C1810',
        'neo-red': '4px 4px 0px #CC2200',
      },
    },
  },
  plugins: [],
};

export default config;
