import { defineStore } from 'pinia';
import {
  questsService,
  type QuestDef,
  type DailyProgress,
} from '@/core/quests/quests.service';

export const useQuestsStore = defineStore('quests', {
  state: () => ({
    defs: [] as QuestDef[],
    progress: { dateKey: '', counters: {}, claimed: [] } as DailyProgress,
    loaded: false,
  }),
  getters: {
    list(state) {
      return state.defs.map((q) => ({
        ...q,
        done: (state.progress.counters[q.id] ?? 0) >= q.goal,
        claimed: state.progress.claimed.includes(q.id),
        value: state.progress.counters[q.id] ?? 0,
      }));
    },
  },
  actions: {
    async init() {
      if (this.loaded) return;
      const defs = await questsService.loadDefs();
      this.defs = defs.daily;
      this.progress = await questsService.loadProgress();
      this.loaded = true;
    },
    add(id: string, delta = 1) {
      const cur = this.progress.counters[id] ?? 0;
      const goal = this.defs.find((d) => d.id === id)?.goal ?? cur + delta;
      this.progress.counters[id] = Math.min(cur + delta, goal);
      questsService.saveProgress(this.progress);
    },
    onWin() {
      this.add('d_win2', 1);
    },
    onKills(n: number) {
      this.add('d_kill150', n);
    },
    onWeaponFamilyRun() {
      this.add('d_weapon_family', 1);
    },
    async claim(id: string) {
      const q = this.defs.find((d) => d.id === id);
      if (!q) return;
      const done = (this.progress.counters[id] ?? 0) >= q.goal;
      if (!done || this.progress.claimed.includes(id)) return;
      await questsService.grantReward(q.reward);
      this.progress.claimed.push(id);
      await questsService.saveProgress(this.progress);
    },
  },
});
