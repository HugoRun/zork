<script setup lang="ts">
/**
 * 装备栏位展示组件
 * 显示7个装备槽位，点击可查看详情并卸下
 */
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useGameStore } from '@/stores/gameStore'
import { EquipSlot, type Item } from '@/types'
import QualityBadge from '@/components/common/QualityBadge.vue'
import { formatStatValue } from '@/utils/formatter'

const playerStore = usePlayerStore()
const inventoryStore = useInventoryStore()
const gameStore = useGameStore()

/** 当前选中的槽位 */
const selectedSlot = ref<EquipSlot | null>(null)

/** 选中的装备 */
const selectedItem = computed<Item | null>(() => {
  if (!selectedSlot.value) return null
  const player = playerStore.player
  if (!player) return null
  return player.equipment[selectedSlot.value] || null
})

/** 装备属性列表 */
const statsList = computed(() => {
  if (!selectedItem.value) return []
  const stats = (selectedItem.value as any).stats
  if (!stats) return []
  const entries: string[] = []
  if (stats.hp) entries.push(`+${stats.hp} 生命值`)
  if (stats.mp) entries.push(`+${stats.mp} 魔法值`)
  if (stats.attack) entries.push(`+${stats.attack} 攻击力`)
  if (stats.defense) entries.push(`+${stats.defense} 防御力`)
  if (stats.magicAttack) entries.push(`+${stats.magicAttack} 法术强度`)
  if (stats.magicDefense) entries.push(`+${stats.magicDefense} 魔法抗性`)
  if (stats.speed) entries.push(`+${stats.speed} 速度`)
  if (stats.critRate) entries.push(`+${formatStatValue(stats.critRate, true)} 暴击率`)
  if (stats.critDamage) entries.push(`+${formatStatValue(stats.critDamage - 1, true)} 暴击伤害`)
  if (stats.dodge) entries.push(`+${formatStatValue(stats.dodge, true)} 闪避率`)
  return entries
})

/** 品质文本 */
const qualityText = computed(() => {
  if (!selectedItem.value) return ''
  const map: Record<string, string> = {
    common: '普通', uncommon: '优秀', rare: '精良',
    epic: '史诗', legendary: '传说'
  }
  return map[selectedItem.value.quality] || '普通'
})

/** 装备槽位配置 */
const slotConfigs: Array<{ slot: EquipSlot; label: string; icon: string }> = [
  { slot: EquipSlot.Weapon, label: '武器', icon: '⚔️' },
  { slot: EquipSlot.Helmet, label: '头盔', icon: '⛑️' },
  { slot: EquipSlot.Armor, label: '铠甲', icon: '🛡️' },
  { slot: EquipSlot.Legs, label: '护腿', icon: '👖' },
  { slot: EquipSlot.Boots, label: '靴子', icon: '👢' },
  { slot: EquipSlot.Ring, label: '戒指', icon: '💍' },
  { slot: EquipSlot.Necklace, label: '项链', icon: '📿' }
]

/** 获取槽位上的装备 */
function getSlotItem(slot: EquipSlot): Item | undefined {
  const player = playerStore.player
  if (!player) return undefined
  return player.equipment[slot]
}

/** 点击槽位 */
function handleClickSlot(slot: EquipSlot) {
  selectedSlot.value = selectedSlot.value === slot ? null : slot
}

/** 卸下装备 */
function handleUnequip() {
  if (!selectedSlot.value) return
  const item = playerStore.unequipItem(selectedSlot.value)
  if (!item) return

  // 放回背包
  inventoryStore.addItem(item)

  gameStore.addLog({
    type: 'system',
    content: `卸下了 ${item.name}`
  })

  selectedSlot.value = null
}
</script>

<template>
  <div class="equipment-slots">
    <h6 class="mb-2 small fw-bold">装备</h6>
    <div class="slots-grid">
      <div
        v-for="config in slotConfigs"
        :key="config.slot"
        class="slot-cell border rounded text-center p-1"
        :class="[
          getSlotItem(config.slot)
            ? ['border-success', 'equipped', { active: selectedSlot === config.slot }]
            : 'border-dashed',
          getSlotItem(config.slot)?.quality ? 'quality-' + getSlotItem(config.slot)!.quality : ''
        ]"
        @click="handleClickSlot(config.slot)"
        :title="getSlotItem(config.slot)?.name || config.label"
      >
        <div v-if="getSlotItem(config.slot)" class="slot-filled">
          <QualityBadge :quality="getSlotItem(config.slot)!.quality" />
          <div class="slot-name small text-truncate">{{ getSlotItem(config.slot)!.name }}</div>
        </div>
        <div v-else class="slot-empty text-muted">
          <span>{{ config.icon }}</span>
          <div class="small">{{ config.label }}</div>
        </div>
      </div>
    </div>

    <!-- 装备详情面板 -->
    <div v-if="selectedItem" class="equip-detail card mt-2">
      <div class="card-body p-2">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-bold small">
            <QualityBadge :quality="selectedItem.quality" />
            {{ selectedItem.name }}
          </span>
          <button class="btn-close btn-close-sm" @click="selectedSlot = null"></button>
        </div>

        <div class="small text-muted mb-2">
          装备 · {{ qualityText }}
          <template v-if="selectedItem.description"> · {{ selectedItem.description }}</template>
        </div>

        <!-- 装备属性 -->
        <div v-if="statsList.length > 0" class="mb-2">
          <div v-for="(stat, idx) in statsList" :key="idx" class="small text-success">
            {{ stat }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="d-flex gap-2">
          <button
            class="btn btn-sm btn-outline-warning flex-grow-1"
            style="font-size: 0.75rem;"
            @click="handleUnequip"
          >
            卸下
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slots-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.slot-cell {
  background-color: var(--bg-secondary);
  min-height: 48px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.slot-cell:hover {
  transform: scale(1.05);
}

.slot-cell.equipped.active {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

/* 品质背景色 */
.slot-cell.quality-common { background-color: var(--bg-secondary); }
.slot-cell.quality-uncommon { background-color: rgba(34, 197, 94, 0.08); }
.slot-cell.quality-rare { background-color: rgba(59, 130, 246, 0.08); }
.slot-cell.quality-epic { background-color: rgba(139, 92, 246, 0.08); }
.slot-cell.quality-legendary { background-color: rgba(245, 158, 11, 0.08); }

.slot-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
}

.slot-filled {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slot-name {
  font-size: 0.65rem;
}

.equip-detail {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
}
</style>
