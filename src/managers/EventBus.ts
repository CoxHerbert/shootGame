import Phaser from 'phaser';
export const EventBus = new Phaser.Events.EventEmitter();

export const EVT = {
  MissionProgress: 'mission:progress',
  MissionCompleted: 'mission:completed',
  MissionClaimed: 'mission:claimed',
  MissionsChanged: 'missions:changed',
  RedDotChanged: 'reddot:changed',
};
