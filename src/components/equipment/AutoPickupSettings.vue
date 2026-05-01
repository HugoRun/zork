<script setup lang="ts">
/**
 * 自动拾取配置组件
 */
import { computed } from 'vue'
import { useInventoryStore } from '@/stores/inventoryStore'
import { Quality } from '@/types'

const inventoryStore = useInventoryStore()

/** 品质选项 */
const qualityOptions = [
  { value: Quality.Common, label: '普通', color: 'text-secondary' },
  { value: Quality.Uncommon, label: '优秀', color: 'text-success' },
  { value: Quality.Rare, label: '精良', color: 'text-primary' },
  { value: Quality.Epic, label: '史诗', color: 'text-violet' },
  { value: Quality.Legendary, label: '传说', color: 'text-warning' }
]

const qualityOrder = [Quality.Common, Quality.Uncommon, Quality.Rare, Quality.Epic, Quality.Legendary]

/** 更新最低品质 */
function updateMinQuality(quality: Quality) {
  inventoryStore.updateAutoPickupConfig({ minQuality: quality })
}

/** 更新最高品质 */
function updateMaxQuality(quality: Quality) {
  inventoryStore.updateAutoPickupConfig({ maxQuality: quality })
}
</script>

<template>
  <div class="auto-pickup-settings">
    <h6 class="mb-3">自动拾取配置</h6>

    <div class="mb-3">
      <label class="form-label small">最低品质</label>
      <div class="d-flex gap-1 flex-wrap">
        <button
          v-for="q in qualityOptions"
          :key="q.value"
          class="btn btn-sm"
          :class="inventoryStore.autoPickupConfig.minQuality === q.value ? 'btn-primary' : 'btn-outline-secondary'"
          @click="updateMinQuality(q.value)"
        >
          {{ q.label }}
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small">最高品质</label>
      <div class="d-flex gap-1 flex-wrap">
        <button
          v-for="q in qualityOptions"
          :key="q.value"
          class="btn btn-sm"
          :class="inventoryStore.autoPickupConfig.maxQuality === q.value ? 'btn-primary' : 'btn-outline-secondary'"
          @click="updateMaxQuality(q.value)"
        >
          {{ q.label }}
        </button>
      </div>
    </div>
  </div>
</template>
