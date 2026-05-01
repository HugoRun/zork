<script setup lang="ts">
/**
 * 地图选择页面
 * 连接真实地图配置，点击地图后通过战斗引擎进入对应地图
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '@/stores/playerStore'
import { worldMap, getArea, getSmallMap } from '@/config/maps'
import { useSharedBattleEngine } from '@/composables/useSharedBattleEngine'

const { t } = useI18n()
const router = useRouter()
const playerStore = usePlayerStore()
const battleEngine = useSharedBattleEngine()

/** 玩家等级 */
const playerLevel = computed(() => playerStore.player?.level || 1)

/**
 * 检查区域是否已解锁
 */
function isAreaUnlocked(area: typeof worldMap.areas[0]): boolean {
  return playerLevel.value >= area.levelRange[0]
}

/**
 * 检查小地图是否已解锁
 */
function isMapUnlocked(map: ReturnType<typeof getSmallMap>): boolean {
  if (!map) return false
  return playerLevel.value >= map.unlockLevel
}

/**
 * 获取区域解锁等级
 */
function getAreaUnlockLevel(area: typeof worldMap.areas[0]): number {
  const firstMap = area.maps[0]
  return firstMap?.unlockLevel || 1
}

/**
 * 进入地图
 */
function enterMap(mapId: string, areaId: string) {
  battleEngine.enterMap(mapId, areaId)
  router.push('/game')
}

function goBack() {
  router.push('/game')
}
</script>

<template>
  <div class="map-view min-vh-100 p-4">
    <!-- 顶部 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>{{ t('map.world') }}</h4>
      <button class="btn btn-outline-primary btn-sm" @click="goBack">
        {{ t('common.back') || '返回' }}
      </button>
    </div>

    <!-- 区域列表 -->
    <div class="row g-4">
      <div
        v-for="area in worldMap.areas"
        :key="area.id"
        class="col-lg-4 col-md-6"
      >
        <!-- 区域卡片 -->
        <div class="card h-100" :class="{ 'opacity-50': !isAreaUnlocked(area) }">
          <div class="card-header">
            <h6 class="mb-0">
              {{ area.name }}
              <span v-if="!isAreaUnlocked(area)" class="badge bg-secondary ms-2">
                {{ t('map.locked') || '未解锁' }}
              </span>
            </h6>
          </div>
          <div class="card-body">
            <p class="text-muted small mb-3">{{ area.description }}</p>
            <p class="text-secondary small mb-3">
              {{ t('map.levelRange') || '等级范围' }}: {{ area.levelRange[0] }}-{{ area.levelRange[1] }}
            </p>

            <!-- 小地图列表 -->
            <div class="d-grid gap-2">
              <div
                v-for="map in area.maps"
                :key="map.id"
                class="d-flex justify-content-between align-items-center p-2 rounded border"
                :class="{
                  'border-secondary': isMapUnlocked(map),
                  'opacity-50': !isMapUnlocked(map)
                }"
              >
                <div>
                  <div class="fw-semibold small">{{ map.name }}</div>
                  <div class="text-muted" style="font-size: 0.7rem;">
                    Lv.{{ map.levelRange[0] }}-{{ map.levelRange[1] }}
                    <span v-if="!isMapUnlocked(map)" class="text-danger ms-1">
                      ({{ t('map.locked') || '未解锁' }})
                    </span>
                  </div>
                </div>
                <button
                  class="btn btn-sm"
                  :class="isMapUnlocked(map) ? 'btn-outline-success' : 'btn-outline-secondary'"
                  :disabled="!isMapUnlocked(map)"
                  @click="enterMap(map.id, area.id)"
                >
                  {{ isMapUnlocked(map) ? (t('map.enter') || '进入') : (t('map.locked') || '未解锁') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-view {
  background-color: var(--bg-primary);
}

.card {
  background-color: var(--bg-card);
  border-color: var(--border-color);
}

.card-header {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--accent-primary);
}
</style>
