<script setup lang="ts">
/**
 * 仓库面板组件
 * 与背包面板布局一致，支持一键存库
 */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useGameStore } from '@/stores/gameStore'
import { ItemType, Quality } from '@/types'
import ItemGrid from '@/components/inventory/ItemGrid.vue'
import ItemTooltip from '@/components/inventory/ItemTooltip.vue'

const { t } = useI18n()
const warehouseStore = useWarehouseStore()
const inventoryStore = useInventoryStore()
const gameStore = useGameStore()

const emit = defineEmits<{ 'close': [] }>()

const tabs: { id: string; label: string }[] = [
  { id: 'all', label: 'inventory.tab.all' },
  { id: ItemType.Equipment, label: 'inventory.tab.equipment' },
  { id: ItemType.Potion, label: 'inventory.tab.potion' },
  { id: ItemType.Material, label: 'inventory.tab.material' }
]

const currentTab = ref('all')
const selectedItemId = ref<string | null>(null)

const selectedItem = computed(() => {
  if (!selectedItemId.value) return null
  return warehouseStore.getItem(selectedItemId.value) || null
})

const capacity = computed(() => `${warehouseStore.itemCount}/${warehouseStore.capacity}`)

/** 仓库已有的 templateId 集合 */
const warehouseTemplateIds = computed(() =>
  new Set(warehouseStore.items.map(i => i.templateId))
)

/** 背包中与仓库已有的相同 templateId 的物品列表（用于一键存库） */
const matchableInventoryItems = computed(() =>
  inventoryStore.items.filter(i => warehouseTemplateIds.value.has(i.templateId))
)

const matchableCount = computed(() => matchableInventoryItems.value.length)

/** 点击物品 */
function handleClickItem(itemId: string) {
  selectedItemId.value = selectedItemId.value === itemId ? null : itemId
}

/** 取出到背包 */
function handleTakeOut(itemId: string) {
  if (inventoryStore.isFull) {
    gameStore.addLog({ type: 'system', content: '背包已满，无法取出' })
    return
  }
  const item = warehouseStore.removeItem(itemId)
  if (item) {
    inventoryStore.addItem(item)
    gameStore.addLog({ type: 'system', content: `从仓库取出 ${item.name}` })
  }
  selectedItemId.value = null
}

/** 存入仓库 */
function handleStoreItem(itemId: string) {
  if (warehouseStore.isFull) {
    gameStore.addLog({ type: 'system', content: '仓库已满，无法存入' })
    return
  }
  const removed = inventoryStore.removeItem(itemId)
  if (removed) {
    warehouseStore.addItem(removed)
    gameStore.addLog({ type: 'system', content: `将 ${removed.name} 存入仓库` })
  }
  selectedItemId.value = null
}

/** 一键存库：将背包中仓库已有的同类物品逐件存入 */
function handleQuickStore() {
  if (warehouseStore.isFull) {
    gameStore.addLog({ type: 'system', content: '仓库已满，无法存入' })
    return
  }

  let storedCount = 0
  const currentWarehouseIds = new Set(warehouseStore.items.map(i => i.templateId))

  for (const item of [...inventoryStore.items]) {
    if (warehouseStore.isFull) break
    if (!currentWarehouseIds.has(item.templateId)) continue

    const removed = inventoryStore.removeItem(item.id)
    if (removed) {
      warehouseStore.addItem(removed)
      storedCount++
    }
  }

  if (storedCount > 0) {
    gameStore.addLog({ type: 'system', content: `一键存入 ${storedCount} 件物品到仓库` })
  } else {
    gameStore.addLog({ type: 'system', content: '没有可存入的物品' })
  }
  selectedItemId.value = null
}

function closeTooltip() {
  selectedItemId.value = null
}
</script>

<template>
  <div class="warehouse-panel h-100 d-flex flex-column">
    <!-- 容量 + 一键存库 -->
    <div class="wh-header d-flex justify-content-between align-items-center mb-2">
      <div>
        仓库容量: <span class="text-muted small">{{ capacity }}</span>
      </div>
      <button
        class="btn btn-sm btn-outline-info"
        :disabled="matchableCount === 0 || warehouseStore.isFull"
        @click="handleQuickStore"
      >
        📥 一键存库 <small>({{ matchableCount }})</small>
      </button>
    </div>

    <!-- 标签页 -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="btn-group flex-grow-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="btn btn-sm"
          :class="currentTab === tab.id ? 'btn-primary' : 'btn-outline-secondary'"
          @click="currentTab = tab.id"
        >
          {{ t(tab.label) }}
        </button>
      </div>
    </div>

    <!-- 物品网格（复用 ItemGrid，仓库模式） -->
    <div class="items-area flex-grow-1 overflow-auto">
      <ItemGrid
        :tab="currentTab"
        :external-items="warehouseStore.items"
        :empty-slots="Math.max(0, warehouseStore.capacity - warehouseStore.itemCount)"
        mode="warehouse"
        @click-item="handleClickItem"
        @take-out="handleTakeOut"
      />
    </div>

    <!-- 物品详情弹窗（Modal） -->
    <Teleport to="body">
      <div v-if="selectedItem" class="item-detail-modal-overlay" @click.self="closeTooltip">
        <div class="item-detail-modal">
          <ItemTooltip :item="selectedItem" @close="closeTooltip" />
          <div class="detail-actions">
            <button class="btn btn-sm btn-outline-success flex-grow-1" @click="handleTakeOut(selectedItem!.id)">
              📤 取出到背包
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.warehouse-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.wh-header {
  background-color: var(--bg-card);
  padding: 6px 8px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  font-size: var(--text-sm);
}

.items-area {
  background-color: var(--bg-primary);
}

/* 物品详情弹窗（Modal） */
.item-detail-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.item-detail-modal {
  background-color: var(--bg-card, #1a1a2e);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  overflow: hidden;
}

.detail-actions {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
  border-top: 1px solid var(--border-color);
}
</style>
