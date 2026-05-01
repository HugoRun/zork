<script setup lang="ts">
/**
 * 地图面板组件
 * 整合 WorldMap 和 AreaMap，支持切换
 */
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import { useSharedBattleEngine } from '@/composables/useSharedBattleEngine'
import WorldMap from './WorldMap.vue'
import AreaMap from './AreaMap.vue'
import BattleMap from './BattleMap.vue'

const playerStore = usePlayerStore()
const gameStore = useGameStore()
const battleEngine = useSharedBattleEngine()

const emit = defineEmits<{ close: [] }>()

const selectedAreaId = ref<string | null>(null)
const showAreaDetail = computed(() => selectedAreaId.value !== null)

function handleSelectArea(areaId: string) {
  selectedAreaId.value = areaId
}

function handleGoBack() {
  selectedAreaId.value = null
}
</script>

<template>
  <div class="map-panel h-100 d-flex flex-column">
    <!-- 当前战斗地图 -->
    <div v-if="gameStore.currentMapId" class="mb-3">
      <BattleMap />
    </div>

    <!-- 世界地图 -->
    <div v-if="!showAreaDetail" class="flex-grow-1 overflow-auto">
      <WorldMap @select-area="handleSelectArea" />
    </div>

    <!-- 区域地图 -->
    <div v-else class="flex-grow-1 overflow-auto">
      <AreaMap
        :area-id="selectedAreaId || ''"
        @go-back="handleGoBack"
      />
    </div>
  </div>
</template>

<style scoped>
.map-panel {
  padding: 4px;
}
</style>
