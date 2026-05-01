<script setup lang="ts">
/**
 * 战斗地图组件
 * 在地图选择面板中展示当前战斗地图状态
 */
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { getSmallMap } from '@/config/maps'

const gameStore = useGameStore()

const currentMap = computed(() => {
  if (!gameStore.currentMapId) return null
  return getSmallMap(gameStore.currentMapId)
})

const areaNames: Record<string, string> = {
  village: '新手村',
  forest: '暗影森林',
  canyon: '熔岩峡谷',
  fortress: '冰霜要塞',
  dragon: '魔龙巢穴'
}

const areaGradients: Record<string, string> = {
  village: 'linear-gradient(135deg, #4a7c59, #6b8f71)',
  forest: 'linear-gradient(135deg, #2d5a27, #3d7a37)',
  canyon: 'linear-gradient(135deg, #8b2500, #cd6600)',
  fortress: 'linear-gradient(135deg, #1a3a5c, #2e5a8a)',
  dragon: 'linear-gradient(135deg, #4a0080, #8b0000)',
}
</script>

<template>
  <div v-if="currentMap" class="battle-map-bar" :style="{ background: areaGradients[currentMap.areaId] || areaGradients.village }">
    <div class="bar-content">
      <div class="bar-left">
        <span class="area-label">{{ areaNames[currentMap.areaId] || '' }}</span>
        <span class="map-name">{{ currentMap.name }}</span>
      </div>
      <div class="bar-right">
        <span class="level-badge">Lv.{{ currentMap.levelRange[0] }}-{{ currentMap.levelRange[1] }}</span>
        <span v-if="gameStore.isFighting" class="fighting-tag">
          <span class="fighting-dot"></span>
          战斗中
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.battle-map-bar {
  border-radius: 10px;
  padding: 10px 14px;
  color: white;
  position: relative;
  overflow: hidden;
}

.battle-map-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
}

.bar-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.area-label {
  font-size: 0.7rem;
  opacity: 0.8;
  padding: 1px 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.15);
}

.map-name {
  font-weight: 700;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-badge {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  font-weight: 600;
}

.fighting-tag {
  font-size: 0.72rem;
  padding: 2px 10px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.5);
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  animation: fightPulse 1.5s ease-in-out infinite;
}

@keyframes fightPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.fighting-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  animation: dotBlink 0.8s ease-in-out infinite;
}

@keyframes dotBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
