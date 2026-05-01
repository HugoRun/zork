<script setup lang="ts">
/**
 * 背包面板组件
 * 集成 ItemGrid、ItemTooltip、shopStore
 */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useShopStore } from '@/stores/shopStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import { useItemDecompose } from '@/composables/useItemDecompose'
import { ItemType, EquipSlot, Quality } from '@/types'
import { getEquipmentTemplate } from '@/config/equipment'
import ItemGrid from './ItemGrid.vue'
import ItemTooltip from './ItemTooltip.vue'
import DropFilterSettings from '@/components/equipment/DropFilterSettings.vue'

const { t } = useI18n()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const shopStore = useShopStore()
const playerStore = usePlayerStore()
const gameStore = useGameStore()
const { decompose, batchDecompose } = useItemDecompose()

const emit = defineEmits<{
  'close': []
}>()

const tabs: { id: string; label: string }[] = [
  { id: 'all', label: 'inventory.tab.all' },
  { id: ItemType.Equipment, label: 'inventory.tab.equipment' },
  { id: ItemType.Potion, label: 'inventory.tab.potion' },
  { id: ItemType.Material, label: 'inventory.tab.material' }
]

const currentTab = ref<string>('all')
const showFilterSettings = ref(false)

/** 当前选中的物品（显示tooltip） */
const selectedItemId = ref<string | null>(null)
const selectedItem = computed(() => {
  if (!selectedItemId.value) return null
  return inventoryStore.getItem(selectedItemId.value) || null
})

/** 对比装备：当前穿戴的同槽位装备 */
const compareEquip = computed(() => {
  if (!selectedItem.value || selectedItem.value.type !== ItemType.Equipment) return null
  const tpl = getEquipmentTemplate(selectedItem.value.templateId)
  if (!tpl) return null
  const slot = tpl.slot as EquipSlot
  return playerStore.player?.equipment[slot] || null
})

/** 容量文字 */
const capacity = computed(() => `${inventoryStore.itemCount}/${inventoryStore.capacity}`)

/** 批量操作筛选 */
const batchFilterMaxQuality = ref<Quality>(Quality.Common)
const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: Quality.Common, label: '普通及以下' },
  { value: Quality.Uncommon, label: '优秀及以下' },
  { value: Quality.Rare, label: '稀有及以下' },
  { value: Quality.Epic, label: '史诗及以下' },
  { value: Quality.Legendary, label: '传说及以下' },
]

const QUALITY_ORDER: Quality[] = [Quality.Common, Quality.Uncommon, Quality.Rare, Quality.Epic, Quality.Legendary]

/** 符合筛选条件的装备ID列表 */
const filterableItemIds = computed(() => {
  const maxIndex = QUALITY_ORDER.indexOf(batchFilterMaxQuality.value)
  return inventoryStore.items
    .filter(item => {
      if (item.type !== ItemType.Equipment) return false
      const itemIndex = QUALITY_ORDER.indexOf(item.quality)
      return itemIndex <= maxIndex
    })
    .map(item => item.id)
})

/** 可分解物品（绿色及以上不分解） */
const decomposableItemIds = computed(() => {
  const maxIndex = QUALITY_ORDER.indexOf(Quality.Rare)
  return inventoryStore.items
    .filter(item => {
      if (item.type !== ItemType.Equipment) return false
      const itemIndex = QUALITY_ORDER.indexOf(item.quality)
      return itemIndex <= maxIndex
    })
    .map(item => item.id)
})

/** 点击物品显示详情 */
function handleClickItem(itemId: string) {
  selectedItemId.value = selectedItemId.value === itemId ? null : itemId
}

/** 使用物品 */
function handleUseItem(itemId: string) {
  const item = inventoryStore.getItem(itemId)
  if (!item) return

  if (item.useEffect) {
    if (item.useEffect.type === 'healHp') {
      const actualHeal = Math.min(item.useEffect.value, playerStore.player!.baseStats.hp - playerStore.player!.currentHp)
      playerStore.modifyHp(actualHeal)
      gameStore.addLog({ type: 'heal', content: `使用 ${item.name}，恢复 ${Math.floor(actualHeal)} HP` })
    } else if (item.useEffect.type === 'healMp') {
      const actualHeal = Math.min(item.useEffect.value, playerStore.player!.baseStats.mp - playerStore.player!.currentMp)
      playerStore.modifyMp(actualHeal)
      gameStore.addLog({ type: 'system', content: `使用 ${item.name}，恢复 ${Math.floor(actualHeal)} MP` })
    }
    inventoryStore.decreaseItemQuantity(itemId)
  }

  selectedItemId.value = null
}

/** 装备物品 */
function handleEquipItem(itemId: string) {
  const item = inventoryStore.getItem(itemId)
  if (!item || item.type !== ItemType.Equipment) return

  const equipTpl = getEquipmentTemplate(item.templateId)
  if (!equipTpl) return

  const slot = equipTpl.slot as EquipSlot
  const oldItem = playerStore.equipItem(slot, item)
  inventoryStore.removeItem(itemId)

  if (oldItem) {
    inventoryStore.addItem(oldItem)
  }

  gameStore.addLog({
    type: 'system',
    content: `装备了 ${item.name}`
  })

  selectedItemId.value = null
}

/** 丢弃物品 */
function handleDropItem(itemId: string) {
  if (confirm(`确定要丢弃 ${inventoryStore.getItem(itemId)?.name} 吗？`)) {
    inventoryStore.removeItem(itemId)
    selectedItemId.value = null
  }
}

/** 出售选中物品 */
function handleSellItem(itemId: string) {
  const gold = shopStore.sellItem(itemId)
  if (gold > 0) {
    gameStore.addLog({ type: 'system', content: `出售物品，获得 ${gold} 金币` })
  }
  selectedItemId.value = null
}

/** 分解物品 */
function handleDecompose(itemId: string) {
  decompose(itemId)
  selectedItemId.value = null
}

/** 存入仓库 */
function handleStoreItem(itemId: string) {
  const item = inventoryStore.getItem(itemId)
  if (!item) return

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

/** 一键出售 */
function handleBatchSell() {
  const ids = filterableItemIds.value
  if (ids.length === 0) {
    gameStore.addLog({ type: 'system', content: '没有符合条件的物品可出售' })
    return
  }
  if (!confirm(`确定要出售 ${ids.length} 件品质≤${batchFilterMaxQuality.value}的装备吗？`)) return
  const totalGold = shopStore.batchSell(ids)
  gameStore.addLog({ type: 'system', content: `批量出售 ${ids.length} 件装备，获得 ${totalGold} 金币` })
  selectedItemId.value = null
}

/** 一键分解 */
function handleBatchDecompose() {
  const ids = decomposableItemIds.value
  if (ids.length === 0) {
    gameStore.addLog({ type: 'system', content: '没有符合条件的装备可分解' })
    return
  }
  if (!confirm(`确定要分解 ${ids.length} 件品质≤稀有的装备吗？`)) return
  const count = batchDecompose(ids)
  gameStore.addLog({ type: 'system', content: `批量分解 ${count} 件装备` })
  selectedItemId.value = null
}

/** 关闭tooltip */
function closeTooltip() {
  selectedItemId.value = null
}
</script>

<template>
    <div>
      背包容量: <span class="ms-2 text-muted small">{{ capacity }}</span>
    </div>
  <div class="inventory-panel h-100 d-flex flex-column">
    <!-- 标签页 + 批量操作 -->
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

    <!-- 批量操作栏 -->
    <div class="batch-bar d-flex align-items-center gap-2 mb-2">
      <select v-model="batchFilterMaxQuality" class="form-select form-select-sm" style="width: auto">
        <option v-for="q in QUALITY_OPTIONS" :key="q.value" :value="q.value">{{ q.label }}</option>
      </select>
      <button
        class="btn btn-sm btn-outline-warning"
        :disabled="filterableItemIds.length === 0"
        @click="handleBatchSell"
      >
        💰 出售 ({{ filterableItemIds.length }})
      </button>
      <button
        class="btn btn-sm btn-outline-danger"
        :disabled="decomposableItemIds.length === 0"
        @click="handleBatchDecompose"
      >
        🔨 分解 (≤稀有 {{ decomposableItemIds.length }})
      </button>
      <button
        class="btn btn-sm btn-outline-secondary ms-auto"
        :class="{ active: showFilterSettings }"
        @click="showFilterSettings = !showFilterSettings"
      >
        ⚙️ 过滤
      </button>
    </div>

    <!-- 掉落过滤设置 -->
    <div v-if="showFilterSettings" class="mb-2">
      <DropFilterSettings />
    </div>

    <!-- 物品网格 -->
    <div class="items-area flex-grow-1 overflow-auto">
      <ItemGrid
        :tab="currentTab"
        @use-item="handleUseItem"
        @equip-item="handleEquipItem"
        @drop-item="handleDropItem"
        @click-item="handleClickItem"
      />
    </div>

    <!-- 物品详情弹窗（Modal） -->
    <Teleport to="body">
      <div v-if="selectedItem" class="item-detail-modal-overlay" @click.self="closeTooltip">
        <div class="item-detail-modal">
          <ItemTooltip :item="selectedItem" :compare-item="compareEquip" @close="closeTooltip" />
          <div class="detail-actions">
            <button class="btn btn-sm btn-warning flex-grow-1" @click="handleSellItem(selectedItem!.id)">
              💰 出售 {{ selectedItem.sellPrice || 0 }}G
            </button>
            <button
              v-if="selectedItem.type === ItemType.Equipment"
              class="btn btn-sm btn-outline-danger flex-grow-1"
              @click="handleDecompose(selectedItem!.id)"
            >
              🔨 分解
            </button>
            <button
              class="btn btn-sm btn-outline-info flex-grow-1"
              @click="handleStoreItem(selectedItem!.id)"
            >
              📦 存入仓库
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.inventory-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.batch-bar {
  background-color: var(--bg-card);
  padding: 6px 8px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.batch-bar .form-select {
  font-size: 0.8rem;
  padding: 2px 8px;
}

.batch-bar .btn {
  font-size: 0.8rem;
  white-space: nowrap;
}
</style>
