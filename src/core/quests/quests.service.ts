import { configService } from '@/core/config/config.service';
import { saveService } from '@/core/save/save.service';

export interface QuestDef { id:string; desc:string; goal:number; reward: Record<string, number> }
export interface QuestsDef { daily: QuestDef[]; weekly?: QuestDef[] }
export interface DailyProgress { dateKey: string; counters: Record<string, number>; claimed: string[] }

export const dateKeyToday = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

const SLOT_ID = 'slot1';
const KEY = 'daily_progress';

export class QuestsService {
  async loadDefs(): Promise<QuestsDef> {
    return configService.loadJson<QuestsDef>('/data/quests.json', (x: any) => x);
  }
  async loadProgress(): Promise<DailyProgress> {
    const save = (await saveService.get<any>(SLOT_ID)) ?? { inventory: { gold: 0, items: [] } };
    const dp: DailyProgress =
      save[KEY] ?? { dateKey: dateKeyToday(), counters: {}, claimed: [] };
    if (dp.dateKey !== dateKeyToday()) {
      dp.dateKey = dateKeyToday();
      dp.counters = {};
      dp.claimed = [];
      save[KEY] = dp;
      await saveService.put(SLOT_ID, save);
    }
    return dp;
  }
  async saveProgress(p: DailyProgress) {
    const save = (await saveService.get<any>(SLOT_ID)) ?? { inventory: { gold: 0, items: [] } };
    save[KEY] = p;
    await saveService.put(SLOT_ID, save);
  }
  async grantReward(reward: Record<string, number>) {
    const save = (await saveService.get<any>(SLOT_ID)) ?? { inventory: { gold: 0, items: [] } };
    save.inventory.gold = (save.inventory.gold ?? 0) + (reward.gold ?? 0);
    if (reward.crystal)
      save.inventory.crystal = (save.inventory.crystal ?? 0) + reward.crystal;
    for (const [k, v] of Object.entries(reward)) {
      if (k === 'gold' || k === 'crystal') continue;
      const items = save.inventory.items ?? (save.inventory.items = []);
      const idx = items.findIndex((it: any) => it.id === k);
      if (idx >= 0) items[idx].count += v;
      else items.push({ id: k, count: v });
    }
    await saveService.put(SLOT_ID, save);
  }
}

export const questsService = new QuestsService();
