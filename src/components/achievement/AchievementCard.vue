<script setup lang="ts">
/**
 * 成就卡片组件
 */
import { computed } from 'vue'
import type { Achievement } from '@/types'

const props = defineProps<{
  achievement: Achievement & {
    isUnlocked: boolean
    isClaimed: boolean
    currentProgress: number
  }
}>()

const emit = defineEmits<{
  'claim': [id: string]
}>()

/** 进度百分比 */
const progressPercent = computed(() => {
  const target = props.achievement.requirement.count
  const current = Math.min(props.achievement.currentProgress, target)
  return Math.floor((current / target) * 100)
})

/** 是否可领取 */
const canClaim = computed(() => props.achievement.isUnlocked && !props.achievement.isClaimed)
</script>

<template>
  <div class="achievement-card card mb-2" :class="{ 'unlocked': achievement.isUnlocked, 'claimed': achievement.isClaimed }">
    <div class="card-body p-2">
      <div class="d-flex align-items-center gap-2">
        <!-- 图标 -->
        <span class="achievement-icon" :class="{ 'grayscale': !achievement.isUnlocked }">
          {{ achievement.icon }}
        </span>

        <!-- 信息 -->
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-1">
            <span class="fw-bold small">{{ achievement.name }}</span>
            <span v-if="achievement.isClaimed" class="badge bg-success" style="font-size: 0.6rem;">已领取</span>
            <span v-else-if="achievement.isUnlocked" class="badge bg-warning" style="font-size: 0.6rem;">可领取</span>
          </div>
          <div class="text-muted small">{{ achievement.description }}</div>

          <!-- 进度条 -->
          <div class="progress mt-1" style="height: 4px;">
            <div
              class="progress-bar"
              :class="achievement.isUnlocked ? 'bg-success' : 'bg-primary'"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
          <div class="text-muted" style="font-size: 0.65rem;">
            {{ Math.min(achievement.currentProgress, achievement.requirement.count) }}/{{ achievement.requirement.count }}
          </div>
        </div>

        <!-- 奖励和领取 -->
        <div class="text-end">
          <div class="small text-warning mb-1">
            <div v-if="achievement.rewards.gold">+{{ achievement.rewards.gold }}G</div>
            <div v-if="achievement.rewards.exp">+{{ achievement.rewards.exp }}EXP</div>
          </div>
          <button
            v-if="canClaim"
            class="btn btn-sm btn-warning"
            style="font-size: 0.65rem; padding: 2px 8px;"
            @click="emit('claim', achievement.id)"
          >
            领取
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievement-card {
  background-color: var(--bg-card);
  border-color: var(--border-color);
  transition: transform 0.1s;
}

.achievement-card:hover {
  transform: translateX(2px);
}

.achievement-card.claimed {
  opacity: 0.7;
}

.achievement-icon {
  font-size: 1.5rem;
  min-width: 32px;
  text-align: center;
}

.achievement-icon.grayscale {
  filter: grayscale(100%);
  opacity: 0.5;
}
</style>
