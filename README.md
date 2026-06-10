# Pokémon Reach the Top

Roguelike de deck-building com batalhas em Jokenpô ambientado na região de Kanto.  
Monte um time de 6, escale 12 andares de ginásios e derrote Lance para se tornar Campeão.

> Fan project não-comercial · Pokémon © Nintendo / Game Freak / TPCi

---

## Como jogar

1. **Escolha a dificuldade** — Normal (cura entre ginásios) ou Hard (sem cura, dano permanente)
2. **Draft** — escolha 1 Pokémon por rodada até montar um deck de 6
3. **Torre** — selecione 3 Pokémon para cada batalha e enfrente os líderes de ginásio
4. **Batalha** — cada turno é um Jokenpô. O tipo do ataque define o dano; habilidades e ataques únicos mudam tudo
5. **Evolua o time** — após cada vitória, recrute 1 novo Pokémon e substitua outro do deck
6. **Chegue ao topo** — derrote os 8 líderes + Elite 4 e veja seu ranking final

---

## Mecânicas principais

**Jokenpô com tipos**  
Pedra, Papel ou Tesoura — o vencedor ataca com o move do seu Pokémon. Cada move tem um tipo (Fire, Water, Psychic...) que é comparado ao tipo do defensor. Super efetivo causa +1 de dano; imune causa 0.

**Ataque Único**  
Todo Pokémon de forma final ou lendário possui um ataque especial de uso único por batalha que sempre vence o Jokenpô. Pode causar dano fixo, curar, forçar movimento, dormir o inimigo, entre outros.

**Habilidades passivas**  
Cada Pokémon tem uma habilidade que ativa automaticamente — imunidades, recuperação de HP, buff de dano ao ficar com 1 coração, intimidação ao entrar em campo, e mais.

**Progressão de IA**  
Os primeiros líderes jogam aleatoriamente. A partir do meio da torre, a IA começa a aprender seus padrões e a contra-atacar com mais frequência.

---

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS**
- **Zustand** para estado global com persistência em localStorage
- Deploy na **Vercel**

---

> Sprites via [PokeAPI](https://pokeapi.co) · Retratos de treinadores via [Pokémon Showdown](https://pokemonshowdown.com)
