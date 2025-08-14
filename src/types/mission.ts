export type MissionId = string;

export type ConditionType = 'KILL' | 'WINS' | 'WEAPON_KILL';

export interface Condition {
  type: ConditionType;
  weaponId?: string; // only for WEAPON_KILL
}

export interface Reward {
  coins?: number;
  gems?: number;
  itemId?: string;
  amount?: number;
}

export interface MissionDef {
  id: MissionId;
  title: string;
  desc: string;
  target: number;
  condition: Condition;
  reward: Reward;
}

export interface MissionProgress {
  id: MissionId;
  value: number; // current progress value
  completedAt?: number; // epoch ms
  claimed?: boolean;
}

export interface WeeklyMissionsData {
  weekKey: string; // e.g. 2025-W33
  missions: MissionDef[];
  progress: Record<MissionId, MissionProgress>;
}

export interface ClaimResult {
  success: boolean;
  reward?: Reward;
  reason?: string;
}
