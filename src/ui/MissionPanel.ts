import Phaser from 'phaser';
import type { MissionManager } from '@/managers/MissionManager';
import type { MissionDef, WeeklyMissionsData } from '@/types/mission';
import { EventBus, EVT } from '@/managers/EventBus';
import { playRewardAnimation } from '@/effects/RewardAnimation';

export class MissionPanel extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.RoundRectangle;
  private title!: Phaser.GameObjects.Text;
  private closeBtn!: Phaser.GameObjects.Text;
  private list!: Phaser.GameObjects.Container;
  private mm: MissionManager;

  constructor(scene: Phaser.Scene, x: number, y: number, mm: MissionManager) {
    super(scene, x, y);
    this.mm = mm;
    this.build();
    this.refresh();

    EventBus.on(EVT.MissionsChanged, () => this.refresh());
    EventBus.on(EVT.MissionProgress, () => this.refresh());
    EventBus.on(EVT.MissionClaimed, () => this.refresh());
  }

  private build() {
    const w = 480,
      h = 360;
    this.bg = this.scene.add
      .roundRectangle(0, 0, w, h, 18, 0x1f232b, 0.95)
      .setStrokeStyle(2, 0x475569, 1)
      .setOrigin(0.5);
    this.title = this.scene.add
      .text(0, -h / 2 + 24, 'Weekly Missions', { fontSize: '20px', fontFamily: 'Arial' })
      .setOrigin(0.5, 0.5);
    this.closeBtn = this.scene.add
      .text(w / 2 - 28, -h / 2 + 16, '✕', { fontSize: '18px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.setVisible(false));

    this.list = this.scene.add.container(-w / 2 + 16, -h / 2 + 52);

    this.add([this.bg, this.title, this.closeBtn, this.list]);
    this.setVisible(false);
  }

  private clearList() {
    this.list.removeAll(true);
  }

  private addMissionItem(def: MissionDef, y: number, data: WeeklyMissionsData) {
    const p = data.progress[def.id];

    const g = this.scene.add.graphics();
    g.fillStyle(0x242a33, 0.85);
    g.fillRoundedRect(0, y, 448, 76, 12);

    const barX = 16,
      barY = y + 40,
      barW = 300,
      barH = 14;
    g.fillStyle(0x1b2028, 1);
    g.fillRoundedRect(barX, barY, barW, barH, 7);

    const ratio = Math.min(1, p.value / def.target);
    g.fillStyle(0x7c9cff, 1);
    g.fillRoundedRect(barX, barY, Math.max(8, Math.floor(barW * ratio)), barH, 7);

    const title = this.scene.add.text(16, y + 12, def.title, { fontSize: '16px', fontFamily: 'Arial' });
    const desc = this.scene.add.text(16, y + 28, def.desc, { fontSize: '12px', color: '#9aa4b2' });
    const counter = this.scene.add.text(barX + barW + 12, barY - 4, `${p.value}/${def.target}`, {
      fontSize: '14px',
    });

    const claimable = p.value >= def.target && !p.claimed;
    const claimed = p.claimed === true;

    const btn = this.createButton(364, y + 20, claimed ? 'Claimed' : claimable ? 'Claim' : 'Go');
    if (claimable) {
      btn.on('pointerup', async () => {
        btn.disableInteractive();
        const result = await this.mm.claim(def.id);
        if (result.success && result.reward) {
          const globalStart = this.getGlobalCenterOf(btn);
          const globalEnd = this.getGlobalBagIconPos();
          await playRewardAnimation(
            this.scene,
            globalStart.x,
            globalStart.y,
            globalEnd.x,
            globalEnd.y,
          );
        }
        btn.setInteractive({ useHandCursor: true });
      });
    } else if (!claimed) {
      btn.on('pointerup', () => {
        this.scene
          .add.text(this.x - 200, this.y + 160, 'Play any mode to progress!', {
            fontSize: '12px',
            color: '#cbd5e1',
          })
          .setDepth(999)
          .setAlpha(0)
          .setScrollFactor(0);
      });
    }

    this.list.add([g, title, desc, counter, btn]);
  }

  private createButton(x: number, y: number, text: string) {
    const bg = this.scene.add
      .roundRectangle(x, y, 84, 32, 8, 0x2b3340, 1)
      .setStrokeStyle(2, 0x7c9cff)
      .setInteractive({ useHandCursor: true });
    const label = this.scene.add.text(x, y, text, { fontSize: '14px' }).setOrigin(0.5);
    const c = this.scene.add.container(0, 0, [bg, label]);
    return c.setSize(84, 32).setInteractive(new Phaser.Geom.Rectangle(x - 42, y - 16, 84, 32), () => true);
  }

  private getGlobalCenterOf(obj: Phaser.GameObjects.Container) {
    const bounds = obj.getBounds();
    return obj.getWorldTransformMatrix().apply(bounds.centerX, bounds.centerY, { x: 0, y: 0 });
  }

  private getGlobalBagIconPos() {
    const cam = this.scene.cameras.main;
    return { x: cam.worldView.x + cam.width - 60, y: cam.worldView.y + 50 };
  }

  refresh() {
    this.clearList();
    const data = this.mm.getAll();
    let y = 0;
    for (const def of data.missions) {
      this.addMissionItem(def, y, data);
      y += 84;
    }
  }
}
