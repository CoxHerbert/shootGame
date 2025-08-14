import Phaser from 'phaser';
import { configService } from '@/core/config/config.service';
import type { LevelCfg, EnemyCfg, DropTable } from '@/types/battle';
import { Spawner } from '@/game/systems/spawner';
import { createEnemy, type EnemyGO } from '@/game/prefabs/enemyFactory';
import { makeChase } from '@/game/systems/ai/chase';
import { makeKiteShoot } from '@/game/systems/ai/kite_shoot';
import { useBattleStore } from '@/stores/battle';
import { useQuestsStore } from '@/stores/quests';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private drops!: Phaser.Physics.Arcade.Group;

  private level!: LevelCfg;
  private enemyCfgs!: Record<string, EnemyCfg>;
  private dropTables!: DropTable;
  private spawner!: Spawner;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.svg('player', '/assets/svg/player.svg');
    this.load.svg('enemy_grunt', '/assets/svg/enemy_grunt.svg');
    this.load.svg('enemy_shooter', '/assets/svg/enemy_shooter.svg');
    this.load.svg('bullet', '/assets/svg/bullet.svg');
    this.load.svg('pickup_gold', '/assets/svg/pickup_gold.svg');
    this.load.svg('tile_dark', '/assets/svg/tile_dark.svg');
  }

  async create() {
    const battle = useBattleStore();
    battle.start(battle.levelId);
    const qs = useQuestsStore();
    await qs.init();

    const { width, height } = this.scale;
    const bg = this.add.tileSprite(0, 0, width * 4, height * 4, 'tile_dark').setOrigin(0);
    this.physics.world.setBounds(0, 0, bg.width, bg.height);

    const [levels] = await Promise.all([
      configService.loadJson<LevelCfg[]>('/data/levels.json', (x: any) => x),
    ]);
    this.level = levels.find((l) => l.id === battle.levelId)!;

    const enemies = await configService.loadJson<any[]>('/data/enemies.json', (x: any) => x);
    this.enemyCfgs = Object.fromEntries(enemies.map((e) => [e.id, e]));
    this.dropTables = await configService.loadJson<DropTable>(
      '/data/drops.json',
      (x: any) => x,
    );

    this.player = this.physics.add
      .sprite(400, 300, 'player')
      .setCircle(10)
      .setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, bg.width, bg.height);

    this.bullets = this.physics.add.group({ maxSize: 200 });
    this.enemies = this.physics.add.group({ maxSize: 100 });
    this.drops = this.physics.add.group({ maxSize: 100 });

    this.spawner = new Spawner(this.level, (enemyId) => this.spawnEnemy(enemyId));

    this.physics.add.overlap(this.bullets, this.enemies, (_b, _e) => {
      const b = _b as Phaser.Physics.Arcade.Sprite;
      const e = _e as EnemyGO;
      if ((b as any).hostile) return;
      b.destroy();
      this.hurtEnemy(e, 20);
    });

    this.physics.add.overlap(this.bullets, this.player, (_b) => {
      const b = _b as any;
      if (!b.hostile) return;
      b.destroy();
      // TODO: player damage handling
    });

    this.physics.add.overlap(this.drops, this.player, (_d) => {
      _d.destroy();
      battle.addGold(5);
    });

    this.input.on('pointerdown', () => this.fire());
  }

  update(_: number, dtMs: number) {
    const dt = dtMs / 1000;
    const battle = useBattleStore();
    battle.tick(dt);

    const speed = 220;
    const vx = (this.cursors.left?.isDown ? -1 : 0) + (this.cursors.right?.isDown ? 1 : 0);
    const vy = (this.cursors.up?.isDown ? -1 : 0) + (this.cursors.down?.isDown ? 1 : 0);
    const len = Math.hypot(vx, vy) || 1;
    this.player.setVelocity((vx / len) * speed, (vy / len) * speed);

    this.spawner.update(dt);

    (this.enemies.getChildren() as EnemyGO[]).forEach((e) => e.aiTick?.(dt));

    if (this.level.mode === 'survival' && battle.elapsed >= this.level.duration) {
      this.finish();
    }
  }

  private fire() {
    const p = this.input.activePointer;
    const ang = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      p.worldX,
      p.worldY,
    );
    const b = this.bullets.create(this.player.x, this.player.y, 'bullet') as Phaser.Physics.Arcade.Sprite;
    b.setCircle(3).body.setAllowGravity(false);
    const speed = 560;
    b.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
    (b as any).hostile = false;
    this.time.delayedCall(2000, () => b.destroy());
  }

  private spawnEnemy(enemyId: string) {
    const cfg = this.enemyCfgs[enemyId];
    if (!cfg) return;
    const x = this.player.x + (Math.random() < 0.5 ? -1 : 1) * (300 + Math.random() * 200);
    const y = this.player.y + (Math.random() < 0.5 ? -1 : 1) * (300 + Math.random() * 200);
    const e = createEnemy(this, cfg, x, y);
    if (cfg.ai === 'kite_shoot') makeKiteShoot(this, e, this.player);
    else makeChase(e, this.player);
    this.enemies.add(e);
  }

  private hurtEnemy(e: EnemyGO, dmg: number) {
    e.hp -= dmg;
    e.setTintFill(0xffffff);
    this.time.delayedCall(50, () => e.clearTint());
    if (e.hp <= 0) {
      useBattleStore().addKill();
      this.dropFrom(e.cfg.dropTableId ?? 'dt_common', e.x, e.y);
      e.destroy();
    }
  }

  private dropFrom(tableId: string, x: number, y: number) {
    const table = this.dropTables[tableId];
    if (!table) return;
    const d = this.drops.create(x, y, 'pickup_gold') as Phaser.Physics.Arcade.Sprite;
    d.setCircle(8);
    d.body.setAllowGravity(false);
    const mag = () => {
      const dx = this.player.x - d.x;
      const dy = this.player.y - d.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 220) d.setVelocity((dx / dist) * 180, (dy / dist) * 180);
    };
    this.time.addEvent({ delay: 50, callback: mag, loop: true });
    this.time.delayedCall(6000, () => d.destroy());
  }

  private finish() {
    const battle = useBattleStore();
    const qs = useQuestsStore();
    qs.onWin();
    qs.onKills(battle.kills);
    battle.end(battle.kills > 30 ? 'S' : battle.kills > 15 ? 'A' : 'B');
    this.scene.pause();
    this.scene.launch('ResultScene');
  }
}
