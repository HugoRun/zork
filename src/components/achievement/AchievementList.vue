<script setup lang="ts">
/**
 * 成就列表组件
 * 展示所有成就，支持筛选和排序
 */
import { computed, ref } from 'vue'
import { useAchievementStore } from '@/stores/achievementStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import AchievementCard from './AchievementCard.vue'
import type { AchievementType } from '@/types'

const achievementStore = useAchievementStore()
const playerStore = usePlayerStore()
const gameStore = useGameStore()

/** 当前筛选类型 */
const filterType = ref<AchievementType | 'all'>('all')

/** 排序后的成就列表：可领奖 > 已解锁未领 > 其他 */
const sortedAchievements = computed(() => {
  let list = achievementStore.allAchievements || []

  // 筛选
  if (filterType.value !== 'all') {
    list = list.filter(a => a.type === filterType.value)
  }

  // 排序：可领奖的优先，然后未解锁的在前
  return [...list].sort((a, b) => {
    // 可领取优先
    if (a.isUnlocked && !a.isClaimed && !(b.isUnlocked && !b.isClaimed)) return -1
    if (!(a.isUnlocked && !a.isClaimed) && b.isUnlocked && !b.isClaimed) return 1
    // 已领取的放最后
    if (a.isClaimed && !b.isClaimed) return 1
    if (!a.isClaimed && b.isClaimed) return -1
    // 其他按ID排序
    return a.id.localeCompare(b.id)
  })
})

/** 领取奖励 */
function claimReward(id: string) {
  const result = achievementStore.claimReward(id)
  if (result) {
    if (result.gold > 0) playerStore.addGold(result.gold)
    if (result.exp > 0) playerStore.addExp(result.exp)
    gameStore.addLog({
      type: 'system',
      content: `领取成就奖励：+${result.gold} 金币，+${result.exp} 经验`
    })
  }
}

/** 筛选类型选项 */
const filterOptions: Array<{ value: AchievementType | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'kill', label: '击杀' },
  { value: 'level', label: '等级' },
  { value: 'collect', label: '收集' },
  { value: 'explore', label: '探索' },
  { value: 'combat', label: '战斗' }
]
</script>

<template>
  <div class="achievement-list">
    <!-- 筛选标签 -->
    <div class="d-flex gap-2 mb-3 flex-wrap">
      <button
        v-for="opt in filterOptions"
        :key="opt.value"
        class="btn btn-sm"
        :class="filterType === opt.value ? 'btn-primary' : 'btn-outline-secondary'"
        @click="filterType = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 统计 -->
    <div class="small text-muted mb-3">
      已解锁: {{ achievementStore.unlockedCount }} / {{ (achievementStore.allAchievements || []).length }}
    </div>

    <!-- 成就列表 -->
    <div v-if="sortedAchievements.length > 0">
      <AchievementCard
        v-for="ach in sortedAchievements"
        :key="ach.id"
        :achievement="ach"
        @claim="claimReward"
      />
    </div>
    <div v-else class="text-center text-muted py-4">
      暂无符合条件的成就
    </div>
  </div>
</template>
