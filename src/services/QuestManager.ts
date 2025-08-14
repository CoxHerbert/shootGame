import Phaser from 'phaser';
import type { QuestPack, Task } from '@/types/quests';

const DAILY_URL = '/quests/daily.json';
const WEEKLY_URL = '/quests/weekly.json';
const LS_KEY = 'phaser.quest.progress.v1';

interface PersistTask extends Task { type: 'daily' | 'weekly'; }
interface PersistData {
  dailyResetAt: number;
  weeklyResetAt: number;
  tasks: Record<string, PersistTask>;
}

export class QuestManager extends Phaser.Events.EventEmitter {
  private data: PersistData = { dailyResetAt: 0, weeklyResetAt: 0, tasks: {} };

  async init() {
    await this.resetIfNeeded();
    const [daily, weekly] = await Promise.all([
      fetch(DAILY_URL).then(r => r.json()) as Promise<QuestPack>,
      fetch(WEEKLY_URL).then(r => r.json()) as Promise<QuestPack>
    ]);
    const stored = this.loadLS();
    const packs: Array<{ pack: QuestPack; type: 'daily' | 'weekly' }> = [
      { pack: daily, type: 'daily' },
      { pack: weekly, type: 'weekly' }
    ];
    for (const { pack, type } of packs) {
      for (const t of pack.tasks) {
        const exist = stored.tasks[t.id];
        if (!exist || exist.type !== type) {
          stored.tasks[t.id] = { ...t, progress: 0, claimed: false, type };
        }
      }
    }
    this.data = stored;
    this.saveLS();
    this.emit('ready');
  }

  private loadLS(): PersistData {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      dailyResetAt: this.todayZero(),
      weeklyResetAt: this.weekZero(),
      tasks: {}
    };
  }

  private saveLS() {
    localStorage.setItem(LS_KEY, JSON.stringify(this.data));
    this.emit('changed');
  }

  private todayZero() {
    const d = new Date();
    d.setHours(0,0,0,0); return d.getTime();
  }
  private weekZero() {
    const d = new Date();
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate()+diff); d.setHours(0,0,0,0);
    return d.getTime();
  }

  private async resetIfNeeded() {
    const now = Date.now();
    const ls = this.loadLS();
    const t0 = this.todayZero();
    const w0 = this.weekZero();
    const needDaily = now >= t0 && t0 !== ls.dailyResetAt;
    const needWeekly = now >= w0 && w0 !== ls.weeklyResetAt;
    if (needDaily || needWeekly) {
      for (const t of Object.values(ls.tasks)) {
        if (needDaily && t.type === 'daily') { t.progress = 0; t.claimed = false; }
        if (needWeekly && t.type === 'weekly') { t.progress = 0; t.claimed = false; }
      }
      if (needDaily) ls.dailyResetAt = t0;
      if (needWeekly) ls.weeklyResetAt = w0;
      localStorage.setItem(LS_KEY, JSON.stringify(ls));
    }
  }

  getTasks(type: 'daily' | 'weekly') {
    return Object.values(this.data.tasks).filter(t => t.type === type);
  }

  progress(id: string, delta = 1) {
    const t = this.data.tasks[id];
    if (!t) return;
    t.progress = Math.min((t.progress ?? 0) + delta, t.progressRequired);
    this.saveLS();
  }

  canClaim(id: string) {
    const t = this.data.tasks[id];
    return !!t && !t.claimed && (t.progress ?? 0) >= t.progressRequired;
  }

  claim(id: string) {
    const t = this.data.tasks[id];
    if (!this.canClaim(id)) return false;
    t.claimed = true;
    this.saveLS();
    this.emit('claimed', t);
    return true;
  }

  badgeCount() {
    return Object.values(this.data.tasks).filter(t => !t.claimed && (t.progress ?? 0) >= t.progressRequired).length;
  }
}
