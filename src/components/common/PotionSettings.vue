<script setup lang="ts">
/**
 * 药水配置组件
 * 配置自动使用药水的阈值
 */
import { useInventoryStore } from '@/stores/inventoryStore'

const inventoryStore = useInventoryStore()

const hpThreshold = computed({
  get: () => inventoryStore.potionConfig.hpThreshold,
  set: (v) => inventoryStore.updatePotionConfig({ hpThreshold: v })
})

const mpThreshold = computed({
  get: () => inventoryStore.potionConfig.mpThreshold,
  set: (v) => inventoryStore.updatePotionConfig({ mpThreshold: v })
})

const autoUseEnabled = computed({
  get: () => inventoryStore.potionConfig.autoUseEnabled,
  set: (v) => inventoryStore.updatePotionConfig({ autoUseEnabled: v })
})

import { computed } from 'vue'
</script>

<template>
  <div class="potion-settings">
    <h6 class="mb-3">药水配置</h6>

    <!-- 自动使用开关 -->
    <div class="form-check form-switch mb-3">
      <input
        :id="'auto-potion-switch'"
        v-model="autoUseEnabled"
        class="form-check-input"
        type="checkbox"
      />
      <label class="form-check-label small" :for="'auto-potion-switch'">
        启用自动药水
      </label>
    </div>

    <template v-if="autoUseEnabled">
      <!-- HP阈值 -->
      <div class="mb-3">
        <label class="form-label small">
          生命药水阈值: {{ Math.round(hpThreshold * 100) }}%
        </label>
        <input
          v-model.number="hpThreshold"
          type="range"
          class="form-range"
          min="0.1"
          max="0.8"
          step="0.05"
        />
        <div class="d-flex justify-content-between text-muted" style="font-size: 0.7rem;">
          <span>10%</span>
          <span>80%</span>
        </div>
      </div>

      <!-- MP阈值 -->
      <div class="mb-3">
        <label class="form-label small">
          魔法药水阈值: {{ Math.round(mpThreshold * 100) }}%
        </label>
        <input
          v-model.number="mpThreshold"
          type="range"
          class="form-range"
          min="0.1"
          max="0.8"
          step="0.05"
        />
        <div class="d-flex justify-content-between text-muted" style="font-size: 0.7rem;">
          <span>10%</span>
          <span>80%</span>
        </div>
      </div>
    </template>
  </div>
</template>
