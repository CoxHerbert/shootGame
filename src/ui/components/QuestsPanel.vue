<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuestsStore } from '@/stores/quests';
const qs = useQuestsStore();
onMounted(() => qs.init());
</script>

<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-bold">每日任务</h2>
    <div class="text-sm text-gray-400">
      重置时间：本地每日 00:00（当前批次：{{ qs.progress.dateKey }})
    </div>

    <div
      v-for="q in qs.list"
      :key="q.id"
      class="p-3 rounded-lg border border-gray-700/40 bg-black/30"
    >
      <div class="flex items-center justify-between">
        <div class="font-medium">{{ q.desc }}</div>
        <div class="text-sm">{{ q.value }} / {{ q.goal }}</div>
      </div>
      <div class="w-full h-2 mt-2 rounded bg-gray-700/50">
        <div
          class="h-2 rounded bg-blue-500"
          :style="{ width: Math.min(100, Math.floor((q.value / q.goal) * 100)) + '%' }"
        ></div>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <div class="text-xs text-gray-400">
          奖励：
          <span v-for="(v, k) in q.reward" :key="k" class="mr-2">{{ k }}×{{ v }}</span>
        </div>
        <button
          class="px-3 py-1 rounded text-white"
          :class="
            q.claimed
              ? 'bg-gray-600 cursor-not-allowed'
              : q.done
              ? 'bg-green-600'
              : 'bg-gray-700 cursor-not-allowed'
          "
          :disabled="!q.done || q.claimed"
          @click="$event.stopPropagation(); qs.claim(q.id)"
        >
          {{ q.claimed ? '已领取' : q.done ? '领取' : '未完成' }}
        </button>
      </div>
    </div>
  </div>
</template>
