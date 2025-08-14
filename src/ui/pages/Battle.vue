<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import Phaser from 'phaser';
import { GameScene } from '@/game/scenes/GameScene';
import { BootScene } from '@/game/scenes/BootScene';
import { ResultScene } from '@/game/scenes/ResultScene';
import UIScene from '@/game/scenes/UIScene';

let game: Phaser.Game | null = null;
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-root',
  width: 960,
  height: 540,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, GameScene, UIScene, ResultScene],
};

onMounted(() => {
  game = new Phaser.Game(config);
});
onBeforeUnmount(() => {
  game?.destroy(true);
  game = null;
});
</script>

<template>
  <div class="p-2 h-[calc(100vh-64px)]">
    <div id="phaser-root" class="w-full h-full rounded-xl overflow-hidden bg-black" />
  </div>
</template>
