<script setup lang="ts">
/**
 * 成就面板组件
 * 使用 AchievementList 组件展示所有成就
 */
import { computed } from 'vue'
import { useAchievementStore } from '@/stores/achievementStore'
import AchievementList from './AchievementList.vue'

const emit = defineEmits<{
  'close': []
}>()

const achievementStore = useAchievementStore()

const totalCount = computed(() => (achievementStore.allAchievements || []).length)
const unlockedCount = computed(() => achievementStore.unlockedCount)
const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.floor((unlockedCount.value / totalCount.value) * 100)
})
</script>

<template>
  <div class="achievement-panel">
    <!-- 总进度 -->
    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1">
        <span class="fw-bold">成就进度</span>
        <span class="text-muted">{{ unlockedCount }}/{{ totalCount }}</span>
      </div>
      <div class="progress" style="height: 8px;">
        <div
          class="progress-bar bg-warning"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- 成就列表（含筛选、排序、领取功能） -->
    <AchievementList />
  </div>
</template>

<style scoped>
.achievement-panel {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
