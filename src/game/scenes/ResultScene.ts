import Phaser from 'phaser';
import { useBattleStore } from '@/stores/battle';
import { saveService } from '@/core/save/save.service';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create() {
    const b = useBattleStore();
    const { width, height } = this.scale;
    this.add
      .rectangle(width / 2, height / 2, 420, 240, 0x000000, 0.7)
      .setStrokeStyle(2, 0xffffff, 0.4);
    this.add
      .text(width / 2, height / 2 - 60, `评定 ${b.resultGrade}`, {
        fontSize: '28px',
        color: '#fff',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 - 10, `击杀 ${b.kills} | 金币 +${b.goldGained}`, {
        fontSize: '18px',
        color: '#fff',
      })
      .setOrigin(0.5);

    const btn = this.add
      .text(width / 2, height / 2 + 60, '回基地（保存）', {
        fontSize: '20px',
        color: '#5B8CFF',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', async () => {
      const prev = (await saveService.get<any>('slot1')) ?? { inventory: { gold: 0 }, progress: {} };
      prev.inventory.gold = (prev.inventory.gold ?? 0) + b.goldGained;
      await saveService.put('slot1', prev);
      window.location.hash = '#/';
    });
  }
}
