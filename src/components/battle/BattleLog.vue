<script setup lang="ts">
/**
 * 战斗日志组件
 */
import { ref, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore'
import type { BattleLogFilter } from '@/types'

const { t } = useI18n()
const gameStore = useGameStore()

const logContainer = ref<HTMLElement | null>(null)

const filters: { id: BattleLogFilter; label: string }[] = [
  { id: 'all', label: 'log.all' },
  { id: 'battle', label: 'log.battle' },
  { id: 'pickup', label: 'log.pickup' },
  { id: 'system', label: 'log.system' }
]

const currentFilter = computed({
  get: () => gameStore.logFilter,
  set: (value) => gameStore.setLogFilter(value)
})

const logs = computed(() => gameStore.filteredLogs)

// 自动滚动到底部
watch(logs, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}, { deep: true })

function getLogTypeClass(type: string): string {
  const classes: Record<string, string> = {
    damage: 'log-damage',
    heal: 'log-heal',
    death: 'log-death',
    pickup: 'log-pickup',
    levelup: 'log-levelup',
    skill: 'log-skill',
    system: 'log-system'
  }
  return classes[type] || ''
}
</script>

<template>
  <div class="battle-log h-100 d-flex flex-column">
    <!-- 过滤器 -->
    <div class="log-filters p-2 d-flex gap-2 border-bottom">
      <button 
        v-for="filter in filters"
        :key="filter.id"
        class="btn btn-sm"
        :class="currentFilter === filter.id ? 'btn-primary' : 'btn-outline-secondary'"
        @click="currentFilter = filter.id"
      >
        {{ t(filter.label) }}
      </button>
    </div>
    
    <!-- 日志列表 -->
    <div ref="logContainer" class="log-list flex-grow-1 overflow-auto p-2">
      <div 
        v-for="log in logs" 
        :key="log.id"
        class="log-entry mb-1"
        :class="getLogTypeClass(log.type)"
      >
        <small class="log-time">{{ new Date(log.timestamp).toLocaleTimeString() }}</small>
        <span class="log-content">{{ log.content }}</span>
      </div>
      
      <div v-if="logs.length === 0" class="text-center text-muted py-4">
        暂无日志
      </div>
    </div>
  </div>
</template>

<style scoped>
.battle-log {
  background-color: var(--bg-secondary);
}

.log-filters {
  background-color: var(--bg-card);
}

.log-filters .btn {
  font-size: 0.75rem;
}

.log-list {
  font-size: 0.875rem;
}

.log-entry {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: var(--bg-card);
}

.log-time {
  color: var(--text-secondary);
  margin-right: 8px;
}

.log-content {
  color: var(--text-primary);
}

.log-damage .log-content {
  color: #EF4444;
}

.log-heal .log-content {
  color: #10B981;
}

.log-death .log-content {
  color: #EF4444;
  font-weight: 600;
}

.log-pickup .log-content {
  color: #F59E0B;
}

.log-levelup .log-content {
  color: #8B5CF6;
  font-weight: 600;
}

.log-skill {
  background-color: rgba(59, 130, 246, 0.08) !important;
  border-left: 3px solid #3B82F6;
}

.log-skill .log-content {
  color: #3B82F6;
  font-weight: 500;
}

.log-system .log-content {
  color: var(--text-secondary);
}
</style>
