<script setup lang="ts">
/**
 * 物品网格展示组件
 * 支持外部传入物品列表（背包/仓库复用）
 */
import { computed } from 'vue'
import { useInventoryStore } from '@/stores/inventoryStore'
import { ItemType, type Item } from '@/types'
import { getItemTemplate } from '@/config/shop'
import { getEquipmentTemplate } from '@/config/equipment'
import QualityBadge from '@/components/common/QualityBadge.vue'

const inventoryStore = useInventoryStore()

/** 默认物品图片 */
const DEFAULT_ITEM_IMAGE = '/1cf070f4bb3e7a418fc812a5f8dc37b87ab9fa4e1db20-PzV65T.png'

/** 获取物品图片 */
function getItemImage(item: Item): string {
  const tpl = getItemTemplate(item.templateId) || getEquipmentTemplate(item.templateId)
  return tpl?.image || DEFAULT_ITEM_IMAGE
}

const props = withDefaults(defineProps<{
  /** 标签页筛选 */
  tab?: string
  /** 外部物品列表（传入则不使用 inventoryStore） */
  externalItems?: Item[]
  /** 空位数量（默认取背包容量） */
  emptySlots?: number
  /** 操作模式 */
  mode?: 'inventory' | 'warehouse'
}>(), {
  tab: 'all',
  mode: 'inventory'
})

const emit = defineEmits<{
  'use-item': [itemId: string]
  'equip-item': [itemId: string]
  'drop-item': [itemId: string]
  'click-item': [itemId: string]
  'take-out': [itemId: string]
}>()

/** 当前显示的物品列表 */
const displayItems = computed(() => {
  const source = props.externalItems || inventoryStore.items || []
  if (!props.tab || props.tab === 'all') return source
  const typeMap: Record<string, ItemType> = {
    equipment: ItemType.Equipment,
    potion: ItemType.Potion,
    material: ItemType.Material
  }
  return source.filter(item =>
    item.type === typeMap[props.tab!]
  )
})

/** 空位数量 */
const emptySlotCount = computed(() => {
  if (props.emptySlots !== undefined) return props.emptySlots
  return Math.max(0, (inventoryStore.capacity || 40) - displayItems.value.length)
})

/** 获取品质对应的边框色 */
function getQualityBorder(item: Item): string {
  const map: Record<string, string> = {
    common: 'quality-common',
    uncommon: 'quality-uncommon',
    rare: 'quality-rare',
    epic: 'quality-epic',
    legendary: 'quality-legendary'
  }
  return map[item.quality] || 'quality-common'
}
</script>

<template>
  <div class="item-grid">
    <div
      v-for="item in displayItems"
      :key="item.id"
      class="item-cell rounded p-1 text-center"
      :class="getQualityBorder(item)"
      @click="emit('click-item', item.id)"
      title="左键查看详情"
    >
      <img :src="getItemImage(item)" :alt="item.name" class="item-image" />
      <div class="item-name small text-truncate">{{ item.name }}</div>
      <div v-if="item.quantity > 1" class="item-quantity text-muted" style="font-size: 0.7rem;">
        x{{ item.quantity }}
      </div>
      <div class="item-actions mt-1 d-flex gap-1 justify-content-center">
        <!-- 背包模式操作 -->
        <template v-if="mode === 'inventory'">
          <button
            v-if="item.type === 'equipment'"
            class="btn btn-outline-success btn-sm"
            style="font-size: 0.65rem; padding: 1px 4px;"
            @click.stop="emit('equip-item', item.id)"
          >
            装备
          </button>
          <button
            v-if="item.type === 'potion' || item.type === 'material'"
            class="btn btn-outline-primary btn-sm"
            style="font-size: 0.65rem; padding: 1px 4px;"
            @click.stop="emit('use-item', item.id)"
          >
            使用
          </button>
          <button
            class="btn btn-outline-danger btn-sm"
            style="font-size: 0.65rem; padding: 1px 4px;"
            @click.stop="emit('drop-item', item.id)"
          >
            丢弃
          </button>
        </template>
        <!-- 仓库模式操作 -->
        <template v-else-if="mode === 'warehouse'">
          <button
            class="btn btn-outline-success btn-sm"
            style="font-size: 0.65rem; padding: 1px 4px;"
            @click.stop="emit('take-out', item.id)"
          >
            取出
          </button>
        </template>
      </div>
    </div>

    <!-- 空位占位 -->
    <div
      v-for="n in emptySlotCount"
      :key="'empty-' + n"
      class="item-cell border border-dashed rounded p-1"
    ></div>
  </div>
</template>

<style scoped>
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--space-sm);
}

.item-cell {
  background-color: var(--bg-secondary);
  min-height: 80px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-default);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-style: solid;
}

.item-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-bottom: 4px;
  border-radius: var(--radius-sm);
}

.item-cell:hover {
  background-color: var(--bg-hover);
  transform: translateY(-1px);
}

.item-name {
  color: var(--text-primary);
  font-size: var(--text-xs);
}

/* 品质颜色 */
.quality-common {
  border-color: #6B7280;
  background-color: rgba(107, 114, 128, 0.1);
}
.quality-common:hover { background-color: rgba(107, 114, 128, 0.18); }

.quality-uncommon {
  border-color: #16A34A;
  background-color: rgba(22, 163, 74, 0.12);
}
.quality-uncommon:hover { background-color: rgba(22, 163, 74, 0.2); }

.quality-rare {
  border-color: #2563EB;
  background-color: rgba(37, 99, 235, 0.12);
}
.quality-rare:hover { background-color: rgba(37, 99, 235, 0.2); }

.quality-epic {
  border-color: #9333EA;
  background-color: rgba(147, 51, 234, 0.12);
}
.quality-epic:hover { background-color: rgba(147, 51, 234, 0.2); }

.quality-legendary {
  border-color: #D97706;
  background-color: rgba(217, 119, 6, 0.12);
}
.quality-legendary:hover { background-color: rgba(217, 119, 6, 0.2); }
</style>
