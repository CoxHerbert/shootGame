import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    level: 1,
    exp: 0,
    gold: 0,
    stats: {
      atk: 10,
      hp: 100,
      def: 0,
      critRate: 0.05,
      critDmg: 1.5,
      ms: 1,
      as: 1,
      cdr: 0
    }
  }),
  actions: {
    addGold(n: number) {
      this.gold += n;
    }
  }
});
