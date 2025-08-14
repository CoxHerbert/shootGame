import { Storage } from '@/services/storage';
import { fakeApi } from '@/services/network';
import { EventBus, EVT } from './EventBus';
import type {
  MissionDef,
  MissionId,
  MissionProgress,
  WeeklyMissionsData,
  Reward,
  ClaimResult,
  ConditionType,
} from '@/types/mission';
import { RedDotManager } from './RedDotManager';

const STORAGE_KEY = 'weekly-missions-v1';

function getWeekKeyTZ(date = new Date(), tz = 'Asia/Singapore'): string {
  const d = new Date(date.toLocaleString('en-US', { timeZone: tz }));
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  const year = d.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const week = Math.floor((days + ((start.getDay() + 6) % 7)) / 7) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export class MissionManager {
  private data: WeeklyMissionsData | null = null;
  private defaultDefs: MissionDef[] = [];

  constructor(defs: MissionDef[]) {
    this.defaultDefs = defs;
  }

  ensureWeek(now = new Date()) {
    const weekKey = getWeekKeyTZ(now);
    const saved = Storage.get<WeeklyMissionsData | null>(STORAGE_KEY, null);
    if (!saved || saved.weekKey !== weekKey) {
      const progress: Record<MissionId, MissionProgress> = {};
      for (const def of this.defaultDefs) {
        progress[def.id] = { id: def.id, value: 0, claimed: false };
      }
      this.data = { weekKey, missions: this.defaultDefs, progress };
      Storage.set(STORAGE_KEY, this.data);
      EventBus.emit(EVT.MissionsChanged, this.data);
      this.refreshRedDot();
    } else {
      this.data = saved;
      this.refreshRedDot();
    }
  }

  getAll(): WeeklyMissionsData {
    if (!this.data) this.ensureWeek();
    return this.data!;
  }

  addProgress(type: ConditionType, amount = 1, weaponId?: string) {
    const data = this.getAll();
    let changed = false;
    for (const def of data.missions) {
      if (def.condition.type !== type) continue;
      if (type === 'WEAPON_KILL' && def.condition.weaponId && def.condition.weaponId !== weaponId) continue;
      const p = data.progress[def.id];
      const before = p.value;
      p.value = Math.min(def.target, p.value + amount);
      if (p.value !== before) {
        EventBus.emit(EVT.MissionProgress, def.id, p.value, def.target);
        if (p.value >= def.target && !p.completedAt) {
          p.completedAt = Date.now();
          EventBus.emit(EVT.MissionCompleted, def.id);
        }
        changed = true;
      }
    }
    if (changed) {
      Storage.set(STORAGE_KEY, data);
      this.refreshRedDot();
    }
  }

  canClaim(id: MissionId): boolean {
    const d = this.getAll();
    const def = d.missions.find((m) => m.id === id);
    const p = d.progress[id];
    return !!def && p.value >= def.target && !p.claimed;
  }

  async claim(id: MissionId): Promise<ClaimResult> {
    const d = this.getAll();
    const def = d.missions.find((m) => m.id === id);
    const p = d.progress[id];
    if (!def || !p) return { success: false, reason: 'Mission not found' };
    if (!this.canClaim(id)) return { success: false, reason: 'Not claimable' };

    const result = await fakeApi<ClaimResult>({ success: true, reward: def.reward }, 150);
    if (result.success) {
      p.claimed = true;
      Storage.set(STORAGE_KEY, d);
      EventBus.emit(EVT.MissionClaimed, id, def.reward);
      this.refreshRedDot();
    }
    return result;
  }

  private refreshRedDot() {
    const d = this.getAll();
    const hasUnclaimed = d.missions.some((m) => {
      const p = d.progress[m.id];
      return p.value >= m.target && !p.claimed;
    });
    RedDotManager.set('missions', hasUnclaimed);
  }
}
