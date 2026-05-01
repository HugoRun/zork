<script setup lang="ts">
/**
 * 世界大地图组件
 * 紧凑的横向区域列表
 */
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { worldMap } from '@/config/maps'
import { ChevronRight, Lock, Check, Swords } from 'lucide-vue-next'

const playerStore = usePlayerStore()
const emit = defineEmits<{
  'select-area': [areaId: string]
}>()

const playerLevel = computed(() => playerStore.player?.level || 1)

function isAreaUnlocked(area: typeof worldMap.areas[0]): boolean {
  return playerLevel.value >= area.levelRange[0]
}

function isAreaCleared(area: typeof worldMap.areas[0]): boolean {
  return playerLevel.value >= area.levelRange[1] + 3
}

function selectArea(areaId: string) {
  emit('select-area', areaId)
}

const areaMeta: Record<string, { icon: string; gradient: string; desc: string }> = {
  village: {
    icon: '🏘️',
    gradient: 'linear-gradient(135deg, #4a7c59 0%, #6b8f71 100%)',
    desc: '宁静的村庄，适合新冒险者'
  },
  forest: {
    icon: '🌲',
    gradient: 'linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%)',
    desc: '幽深的密林，危机四伏'
  },
  canyon: {
    icon: '🌋',
    gradient: 'linear-gradient(135deg, #8b2500 0%, #cd6600 100%)',
    desc: '灼热的峡谷，火焰生物横行'
  },
  fortress: {
    icon: '🏰',
    gradient: 'linear-gradient(135deg, #1a3a5c 0%, #2e5a8a 100%)',
    desc: '永恒寒冰覆盖的古老要塞'
  },
  dragon: {
    icon: '🐉',
    gradient: 'linear-gradient(135deg, #4a0080 0%, #8b0000 100%)',
    desc: '传说中魔龙的栖息地'
  }
}
</script>

<template>
  <div class="world-map">
    <div class="section-title">
      <Swords :size="14" />
      <span>世界地图</span>
    </div>

    <div class="area-list">
      <div
        v-for="(area, index) in worldMap.areas"
        :key="area.id"
        class="area-card"
        :class="{
          unlocked: isAreaUnlocked(area),
          locked: !isAreaUnlocked(area),
          cleared: isAreaCleared(area)
        }"
        :style="{ animationDelay: index * 0.06 + 's' }"
        @click="isAreaUnlocked(area) && selectArea(area.id)"
      >
        <!-- 左侧图标 -->
        <div class="area-icon-wrap" :style="{ background: (areaMeta[area.id] || areaMeta.village).gradient }">
          <span class="area-emoji">{{ (areaMeta[area.id] || areaMeta.village).icon }}</span>
          <div v-if="isAreaCleared(area)" class="cleared-dot"></div>
        </div>

        <!-- 信息 -->
        <div class="area-info">
          <div class="area-name-row">
            <span class="area-name">{{ area.name }}</span>
            <span class="level-badge">Lv.{{ area.levelRange[0] }}-{{ area.levelRange[1] }}</span>
          </div>
          <div class="area-desc">{{ (areaMeta[area.id] || areaMeta.village).desc }}</div>
          <div class="area-footer">
            <span class="map-count">{{ area.maps.length }} 个地图</span>
            <Lock v-if="!isAreaUnlocked(area)" :size="12" class="lock-icon" />
            <Check v-else-if="isAreaCleared(area)" :size="12" class="check-icon" />
            <ChevronRight v-else :size="14" class="arrow-icon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.world-map {
  padding: 6px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: 10px;
  padding: 0 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 区域列表 */
.area-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 区域卡片 */
.area-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 10px);
  cursor: pointer;
  transition: all 0.2s ease;
  animation: fadeIn 0.3s ease-out both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

.area-card.unlocked:hover {
  border-color: var(--accent-primary);
  background: var(--bg-hover, rgba(255,255,255,0.03));
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  transform: translateX(4px);
}

.area-card.locked {
  opacity: 0.45;
  cursor: not-allowed;
}

.area-card.locked:hover {
  transform: none;
  border-color: var(--border-color);
}

.area-card.cleared {
  border-left: 3px solid #22c55e;
}

/* 图标 */
.area-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.area-emoji {
  font-size: 1.4rem;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
}

.cleared-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid var(--bg-card);
}

/* 信息 */
.area-info {
  flex: 1;
  min-width: 0;
}

.area-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.area-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.level-badge {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-full, 9999px);
  background: var(--bg-tertiary, rgba(255,255,255,0.05));
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.area-desc {
  font-size: 0.68rem;
  color: var(--text-muted);
  line-height: 1.3;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.area-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.map-count {
  font-size: 0.6rem;
  color: var(--text-muted);
}

.lock-icon {
  color: var(--text-muted);
}

.check-icon {
  color: #22c55e;
}

.arrow-icon {
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.area-card.unlocked:hover .arrow-icon {
  color: var(--accent-primary);
  transform: translateX(2px);
}
</style>
