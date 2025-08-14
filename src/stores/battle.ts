import { defineStore } from 'pinia';

export const useBattleStore = defineStore('battle', {
  state: () => ({
    levelId: 'lv_1_1',
    startedAt: 0,
    elapsed: 0,
    kills: 0,
    goldGained: 0,
    isEnded: false,
    resultGrade: 'B' as 'S' | 'A' | 'B',
  }),
  actions: {
    start(id: string) {
      this.levelId = id;
      this.startedAt = Date.now();
      this.elapsed = 0;
      this.kills = 0;
      this.goldGained = 0;
      this.isEnded = false;
    },
    tick(dt: number) {
      this.elapsed += dt;
    },
    addKill() {
      this.kills++;
    },
    addGold(n: number) {
      this.goldGained += n;
    },
    end(grade: 'S' | 'A' | 'B') {
      this.isEnded = true;
      this.resultGrade = grade;
    },
  },
});
