<script setup lang="ts">
/**
 * 商店物品行组件
 */
import type { Item } from '@/types'
import QualityBadge from '@/components/common/QualityBadge.vue'
import { getItemTemplate } from '@/config/shop'
import { getEquipmentTemplate } from '@/config/equipment'

const props = defineProps<{
  item: Item
  price: number
}>()

const emit = defineEmits<{
  'buy': [item: Item, price: number]
}>()

const playerStore = usePlayerStore()
import { usePlayerStore } from '@/stores/playerStore'

const DEFAULT_ITEM_IMAGE = '/1cf070f4bb3e7a418fc812a5f8dc37b87ab9fa4e1db20-PzV65T.png'

function getItemImage(item: Item): string {
  const tpl = getItemTemplate(item.templateId) || getEquipmentTemplate(item.templateId)
  return tpl?.image || DEFAULT_ITEM_IMAGE
}

function getQualityClass(item: Item): string {
  const map: Record<string, string> = {
    common: 'border-secondary bg-light',
    uncommon: 'border-success bg-success bg-opacity-10',
    rare: 'border-primary bg-primary bg-opacity-10',
    epic: 'border-violet bg-violet bg-opacity-10',
    legendary: 'border-warning bg-warning bg-opacity-10'
  }
  return map[item.quality] || 'border-secondary bg-light'
}

function handleBuy() {
  emit('buy', props.item, props.price)
}
</script>

<template>
  <div class="shop-item d-flex align-items-center p-2 border-bottom" :class="getQualityClass(item)">
    <img :src="getItemImage(item)" :alt="item.name" class="shop-item-image me-2" />
    <div class="flex-grow-1">
      <div class="d-flex align-items-center gap-1">
        <QualityBadge :quality="item.quality" />
        <span class="fw-semibold small">{{ item.name }}</span>
        <span v-if="item.maxStack > 1" class="text-muted small">x{{ item.maxStack }}</span>
      </div>
      <div v-if="item.description" class="text-muted small">{{ item.description }}</div>
    </div>
    <button
      class="btn btn-sm btn-success ms-2"
      :disabled="(playerStore.player?.gold || 0) < price"
      @click="handleBuy"
    >
      {{ price }} G
    </button>
  </div>
</template>

<style scoped>
.shop-item-image {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  padding: 2px;
}
</style>
