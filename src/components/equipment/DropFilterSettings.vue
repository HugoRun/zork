<script setup lang="ts">
/**
 * 掉落过滤设置组件
 * 玩家可以设置品质和等级筛选，低于阈值的装备自动出售
 */
import { computed } from 'vue'
import { useInventoryStore } from '@/stores/inventoryStore'
import { Quality } from '@/types'

const inventoryStore = useInventoryStore()
const config = computed(() => inventoryStore.autoSellConfig)

/** 品质选项 */
const qualityOptions = [
  { value: Quality.Common, label: '普通', color: '#9CA3AF' },
  { value: Quality.Uncommon, label: '优秀', color: '#10B981' },
  { value: Quality.Rare, label: '精良', color: '#3B82F6' },
  { value: Quality.Epic, label: '史诗', color: '#8B5CF6' },
  { value: Quality.Legendary, label: '传说', color: '#F59E0B' }
]

/** 等级差距选项 */
const gapOptions = [0, 5, 10, 15, 20, 30]

function toggleEnabled() {
  inventoryStore.updateAutoSellConfig({ enabled: !config.value.enabled })
}

function updateMinQuality(quality: Quality) {
  inventoryStore.updateAutoSellConfig({ minQuality: quality })
}

function updateLevelGap(gap: number) {
  inventoryStore.updateAutoSellConfig({ levelGap: gap })
}
</script>

<template>
  <div class="drop-filter-settings">
    <div class="filter-header">
      <span class="filter-title">掉落过滤</span>
      <label class="toggle-switch" :class="{ active: config.enabled }" @click="toggleEnabled">
        <span class="toggle-track">
          <span class="toggle-thumb"></span>
        </span>
        <span class="toggle-label">{{ config.enabled ? '已开启' : '已关闭' }}</span>
      </label>
    </div>

    <div v-if="config.enabled" class="filter-body">
      <div class="filter-section">
        <div class="filter-label">
          <span class="filter-icon">🏷️</span>
          低于此品质的装备自动出售
        </div>
        <div class="quality-buttons">
          <button
            v-for="q in qualityOptions"
            :key="q.value"
            class="quality-btn"
            :class="{ active: config.minQuality === q.value }"
            :style="config.minQuality === q.value ? { borderColor: q.color, color: q.color, background: q.color + '18' } : {}"
            @click="updateMinQuality(q.value)"
          >
            {{ q.label }}
          </button>
        </div>
        <div class="filter-hint">
          低于 <span :style="{ color: qualityOptions.find(q => q.value === config.minQuality)?.color }">
            {{ qualityOptions.find(q => q.value === config.minQuality)?.label }}
          </span> 品质的装备将被自动出售
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-label">
          <span class="filter-icon">📊</span>
          等级差距阈值
        </div>
        <div class="gap-buttons">
          <button
            v-for="gap in gapOptions"
            :key="gap"
            class="gap-btn"
            :class="{ active: config.levelGap === gap }"
            @click="updateLevelGap(gap)"
          >
            {{ gap === 0 ? '关闭' : `${gap}级` }}
          </button>
        </div>
        <div class="filter-hint">
          {{ config.levelGap === 0
            ? '不根据等级过滤装备'
            : `装备需求等级低于玩家等级 ${config.levelGap} 级时自动出售`
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drop-filter-settings {
  padding: 10px 12px;
  background: var(--bg-tertiary, rgba(255,255,255,0.03));
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--border-color, rgba(255,255,255,0.08));
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.filter-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.toggle-track {
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: var(--bg-secondary, rgba(255,255,255,0.1));
  position: relative;
  transition: background 0.2s;
}

.toggle-switch.active .toggle-track {
  background: #10B981;
}

.toggle-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(14px);
}

.toggle-label {
  font-size: 0.7rem;
  color: var(--text-muted, #888);
}

.toggle-switch.active .toggle-label {
  color: #10B981;
}

.filter-body {
  margin-top: 8px;
}

.filter-section {
  margin-bottom: 10px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 0.72rem;
  color: var(--text-secondary, #aaa);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-icon {
  font-size: 0.8rem;
}

.quality-buttons,
.gap-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.quality-btn,
.gap-btn {
  padding: 3px 10px;
  border-radius: var(--radius-sm, 4px);
  border: 1px solid var(--border-color, rgba(255,255,255,0.12));
  background: transparent;
  color: var(--text-muted, #888);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.15s;
}

.quality-btn:hover,
.gap-btn:hover {
  border-color: rgba(255,255,255,0.25);
  color: var(--text-secondary);
}

.quality-btn.active,
.gap-btn.active {
  border-color: #8B5CF6;
  color: #8B5CF6;
  background: rgba(139, 92, 246, 0.12);
}

.filter-hint {
  font-size: 0.62rem;
  color: var(--text-muted, #666);
  margin-top: 4px;
  line-height: 1.4;
}
</style>
