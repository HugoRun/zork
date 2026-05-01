<script setup lang="ts">
/**
 * 战斗统计面板组件
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore'
import { formatNumber, formatTime } from '@/utils/formatter'

const { t } = useI18n()
const gameStore = useGameStore()

const stats = computed(() => gameStore.battleStats)
const currentMapId = computed(() => gameStore.currentMapId)

const survivalTime = computed(() => {
  const seconds = Math.floor((Date.now() - stats.value.startTime) / 1000)
  return formatTime(seconds)
})
</script>

<template>
  <div class="battle-stats card">
    <div class="card-body p-2">
      <div class="stats-row">
        <span class="stat-label">DPS</span>
        <span class="stat-value">{{ formatNumber(stats.dps) }}</span>
      </div>
      <div class="stats-row">
        <span class="stat-label">{{ t('battle.kills') }}</span>
        <span class="stat-value">{{ stats.totalKills }}</span>
      </div>
      <div class="stats-row">
        <span class="stat-label">{{ t('battle.survivalTime') }}</span>
        <span class="stat-value">{{ survivalTime }}</span>
      </div>
      <div v-if="currentMapId" class="stats-row map-name">
        <span class="stat-label">地图</span>
        <span class="stat-value">{{ currentMapId }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.battle-stats {
  background-color: var(--bg-card);
  border-color: var(--border-color);
  min-width: 120px;
}

.card-body {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.stats-row.map-name {
  border-top: 1px solid var(--border-color);
  margin-top: 4px;
  padding-top: 6px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
