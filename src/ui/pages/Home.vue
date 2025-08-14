<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { saveService } from '@/core/save/save.service';

const gold = ref(0);
onMounted(async () => {
  const data = await saveService.get<any>('slot1');
  gold.value = data?.inventory?.gold ?? 0;
});
</script>

<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">基地</h1>
    <div>金币：<b>{{ gold }}</b></div>
    <router-link to="/battle" class="px-4 py-2 bg-blue-600 text-white rounded">
      开始战斗
    </router-link>
    <router-link
      to="/quests"
      class="px-4 py-2 bg-slate-700 text-white rounded inline-block ml-3"
    >
      每日任务
    </router-link>
  </div>
</template>
