import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Achievement, AchievementType } from '@/types'
import { getAllAchievements, getAchievementsByType } from '@/config/achievements'
import { useAccountStore } from './accountStore'

function createAccountStorage() {
  return {
    getItem: (key: string): string | null => {
      const prefix = useAccountStore().getAccountStoragePrefix()
      return localStorage.getItem(prefix + key)
    },
    setItem: (key: string, value: string): void => {
      const prefix = useAccountStore().getAccountStoragePrefix()
      localStorage.setItem(prefix + key, value)
    },
    removeItem: (key: string): void => {
      const prefix = useAccountStore().getAccountStoragePrefix()
      localStorage.removeItem(prefix + key)
    }
  }
}

/** 自定义序列化器：Set <-> JSON Array */
function createSetSerializer() {
  return {
    serialize: (state: any) => JSON.stringify({
      unlockedIds: Array.from(state.unlockedIds),
      claimedIds: Array.from(state.claimedIds),
      progress: state.progress
    }),
    deserialize: (value: string) => {
      const data = JSON.parse(value)
      return {
        unlockedIds: new Set(data.unlockedIds || []),
        claimedIds: new Set(data.claimedIds || []),
        progress: data.progress || {}
      }
    }
  }
}

/**
 * 成就状态管理
 */
export const useAchievementStore = defineStore('achievement', () => {
  // ==================== 状态 ====================

  /** 已解锁的成就ID集合 */
  const unlockedIds = ref<Set<string>>(new Set())

  /** 已领取奖励的成就ID集合 */
  const claimedIds = ref<Set<string>>(new Set())

  /** 成就进度记录 { achievementId: currentCount } */
  const progress = ref<Record<string, number>>({})

  // ==================== 计算属性 ====================

  /** 所有成就列表（带状态） */
  const allAchievements = computed(() => {
    const configs = getAllAchievements()
    return configs.map(config => ({
      ...config,
      isUnlocked: unlockedIds.value.has(config.id),
      isClaimed: claimedIds.value.has(config.id),
      currentProgress: progress.value[config.id] || 0
    }))
  })

  /** 按类型筛选成就 */
  function getAchievements(type?: AchievementType) {
    if (!type) return allAchievements.value
    return allAchievements.value.filter(a => a.type === type)
  }

  /** 可领取奖励的成就 */
  const claimableAchievements = computed(() =>
    allAchievements.value.filter(a => a.isUnlocked && !a.isClaimed)
  )

  /** 已解锁成就数 */
  const unlockedCount = computed(() => unlockedIds.value.size)

  // ==================== 方法 ====================

  /**
   * 记录进度（外部调用）
   */
  function recordProgress(key: string, amount: number = 1): void {
    const all = getAllAchievements()
    const matched = all.filter(a => a.requirement.target === key)

    matched.forEach(achievement => {
      if (unlockedIds.value.has(achievement.id)) return

      const current = progress.value[achievement.id] || 0
      progress.value[achievement.id] = Math.min(current + amount, 99999)

      // 检查是否达标
      if (progress.value[achievement.id] >= achievement.requirement.count) {
        unlockAchievement(achievement.id)
      }
    })
  }

  /**
   * 直接解锁成就
   */
  function unlockAchievement(id: string): void {
    if (unlockedIds.value.has(id)) return
    unlockedIds.value.add(id)
  }

  /**
   * 领取成就奖励
   */
  function claimReward(id: string): { gold: number; exp: number } | null {
    const achievement = allAchievements.value.find(a => a.id === id)
    if (!achievement || !achievement.isUnlocked || achievement.isClaimed) return null

    claimedIds.value.add(id)

    return {
      gold: achievement.rewards.gold || 0,
      exp: achievement.rewards.exp || 0
    }
  }

  /**
   * 检查成就是否已解锁
   */
  function isUnlocked(id: string): boolean {
    return unlockedIds.value.has(id)
  }

  return {
    unlockedIds,
    claimedIds,
    progress,
    allAchievements,
    claimableAchievements,
    unlockedCount,
    getAchievements,
    recordProgress,
    unlockAchievement,
    claimReward,
    isUnlocked
  }
}, {
  persist: {
    key: 'achievement',
    storage: createAccountStorage(),
    paths: ['unlockedIds', 'claimedIds', 'progress'],
    serializer: createSetSerializer()
  }
})
