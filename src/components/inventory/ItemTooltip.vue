<script setup lang="ts">
/**
 * 物品提示框组件
 * 显示物品详细信息，支持装备属性对比
 */
import { computed } from 'vue'
import type { Item } from '@/types'
import { ItemType, Quality } from '@/types'
import QualityBadge from '@/components/common/QualityBadge.vue'
import { formatStatValue } from '@/utils/formatter'

const props = defineProps<{
  item: Item
  compareItem?: Item | null
}>()

const emit = defineEmits<{
  'close': []
}>()

/** 品质文本 */
const qualityText = computed(() => {
  const map: Record<string, string> = {
    common: '普通',
    uncommon: '优秀',
    rare: '精良',
    epic: '史诗',
    legendary: '传说'
  }
  return map[props.item.quality] || '普通'
})

/** 是否为装备 */
const isEquipment = computed(() => props.item.type === ItemType.Equipment)

/** 物品类型文本 */
const typeText = computed(() => {
  const map: Record<string, string> = {
    [ItemType.Equipment]: '装备',
    [ItemType.Potion]: '药水',
    [ItemType.Material]: '材料'
  }
  return map[props.item.type] || '物品'
})

/** 获取装备的 stats 对象 */
function getStats(item: Item): Record<string, number> {
  return ('stats' in item ? (item as any).stats : null) || {}
}

/** 属性中文名 */
const STAT_LABELS: Record<string, string> = {
  hp: '生命值', mp: '魔法值', attack: '攻击力', defense: '防御力',
  magicAttack: '法术强度', magicDefense: '魔法抗性', speed: '速度',
  critRate: '暴击率', critDamage: '暴击伤害', dodge: '闪避率'
}

/** 是否为百分比属性 */
const PERCENT_STATS = new Set(['critRate', 'critDamage', 'dodge'])

/** 装备属性列表（含对比） */
const statsList = computed(() => {
  if (!isEquipment.value) return []
  const stats = getStats(props.item)
  const compareStats = props.compareItem ? getStats(props.compareItem) : {}
  const allKeys = new Set([...Object.keys(stats), ...Object.keys(compareStats)])
  const entries: { label: string; value: string; diff: number | null; isPercent: boolean }[] = []

  for (const key of allKeys) {
    const label = STAT_LABELS[key] || key
    const isPercent = PERCENT_STATS.has(key)
    const val = stats[key] || 0
    const oldVal = compareStats[key] || 0
    const diff = val - oldVal

    // 格式化显示值
    let valueStr: string
    if (isPercent) {
      if (key === 'critDamage') {
        valueStr = `+${formatStatValue(val - 1, true)}`
      } else {
        valueStr = `+${formatStatValue(val, true)}`
      }
    } else {
      valueStr = `+${val}`
    }

    // 格式化差值
    if (diff === 0) continue // 无变化不显示
    entries.push({ label, value: valueStr, diff, isPercent })
  }
  return entries
})
</script>

<template>
  <div class="item-tooltip card" :class="'tooltip-quality-' + item.quality">
    <div class="card-header d-flex justify-content-between align-items-center py-2 px-3">
      <span class="fw-bold">
        <QualityBadge :quality="item.quality" />
        {{ item.name }}
      </span>
      <button class="btn-close btn-close-sm" @click="emit('close')"></button>
    </div>
    <div class="card-body py-2 px-3">
      <!-- 基础信息 -->
      <div class="small text-muted mb-2">
        {{ typeText }} · {{ qualityText }}
      </div>

      <!-- 数量 -->
      <div v-if="item.quantity > 1" class="small mb-2">
        数量: {{ item.quantity }}/{{ item.maxStack }}
      </div>

      <!-- 装备属性对比 -->
      <div v-if="isEquipment && statsList.length > 0" class="mb-2">
        <!-- 对比标题 -->
        <div v-if="compareItem" class="compare-header small text-muted mb-1">
          对比: {{ compareItem.name }}
        </div>
        <div v-for="(stat, idx) in statsList" :key="idx" class="stat-compare-row">
          <span class="stat-label small">{{ stat.label }}</span>
          <span class="stat-value small" :class="stat.diff > 0 ? 'text-green' : 'text-red'">
            {{ stat.value }}
            <span class="stat-diff">({{ stat.diff > 0 ? '+' : '' }}{{ stat.isPercent ? (stat.diff * 100).toFixed(1) + '%' : stat.diff }})</span>
          </span>
        </div>
      </div>

      <!-- 装备属性（无对比时） -->
      <div v-else-if="isEquipment && !compareItem" class="mb-2">
        <template v-for="(val, key) in getStats(item)" :key="key">
          <div v-if="val" class="small text-success">
            +{{ val }} {{ STAT_LABELS[key as string] || key }}
          </div>
        </template>
      </div>

      <!-- 描述 -->
      <div v-if="item.description" class="small text-muted mb-2">
        {{ item.description }}
      </div>

      <!-- 使用效果 -->
      <div v-if="item.useEffect" class="small text-info mb-2">
        <template v-if="item.useEffect.type === 'heal_hp'">
          恢复 {{ item.useEffect.value }} 点生命值
        </template>
        <template v-else-if="item.useEffect.type === 'heal_mp'">
          恢复 {{ item.useEffect.value }} 点魔法值
        </template>
      </div>

      <!-- 售价 -->
      <div class="small text-warning mt-2 pt-2 border-top">
        售价: {{ item.sellPrice || 0 }} 金币
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-tooltip {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  min-width: 220px;
  max-width: 100%;
  z-index: 1070;
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;
}

.card-header {
  border-bottom: 1px solid var(--border-color);
}

.tooltip-quality-common { border-left: 3px solid #6B7280; }
.tooltip-quality-uncommon { border-left: 3px solid #16A34A; }
.tooltip-quality-rare { border-left: 3px solid #2563EB; }
.tooltip-quality-epic { border-left: 3px solid #9333EA; }
.tooltip-quality-legendary { border-left: 3px solid #D97706; }

.compare-header {
  padding-bottom: 2px;
  border-bottom: 1px dashed var(--border-color);
}

.stat-compare-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1px 0;
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 500;
}

.stat-diff {
  margin-left: 4px;
  font-size: 0.65rem;
  opacity: 0.8;
}

.text-green { color: #22C55E; }
.text-red { color: #EF4444; }
</style>
