export type Task = {
  id: string;
  title: string;
  progressRequired: number;
  progress?: number;
  claimed?: boolean;
};

export type QuestPack = {
  version: number;
  reset: 'daily' | 'weekly';
  tasks: Task[];
};
