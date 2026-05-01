<script setup lang="ts">
/**
 * 装备对比组件
 * 显示当前装备和新装备的属性对比
 */
import { computed } from 'vue'
import type { Item } from '@/types'
import { formatStatValue } from '@/utils/formatter'

const props = defineProps<{
  /** 当前装备的物品 */
  currentItem: Item | null
  /** 新装备的物品 */
  newItem: Item
}>()

const emit = defineEmits<{
  'replace': []
  'close': []
}>()

/** 对比属性列表 */
const compareStats = computed(() => {
  const newStats = (props.newItem as any).stats || {}
  const oldStats = (props.currentItem as any)?.stats || {}

  const allKeys = new Set([...Object.keys(newStats), ...Object.keys(oldStats)])
  const entries: Array<{ key: string; label: string; oldVal: number; newVal: number; diff: number; isPercent: boolean }> = []

  const labelMap: Record<string, { label: string; isPercent: boolean }> = {
    hp: { label: '生命值', isPercent: false },
    mp: { label: '魔法值', isPercent: false },
    attack: { label: '攻击力', isPercent: false },
    defense: { label: '防御力', isPercent: false },
    magicAttack: { label: '法术强度', isPercent: false },
    magicDefense: { label: '魔法抗性', isPercent: false },
    speed: { label: '速度', isPercent: false },
    critRate: { label: '暴击率', isPercent: true },
    critDamage: { label: '暴击伤害', isPercent: true },
    dodge: { label: '闪避率', isPercent: true }
  }

  allKeys.forEach(key => {
    const config = labelMap[key]
    if (!config) return
    const oldVal = (oldStats[key] as number) || 0
    const newVal = (newStats[key] as number) || 0
    if (oldVal === 0 && newVal === 0) return
    entries.push({
      key,
      label: config.label,
      oldVal,
      newVal,
      diff: newVal - oldVal,
      isPercent: config.isPercent
    })
  })

  return entries
})
</script>

<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h6 class="mb-0">装备对比</h6>
      <button class="btn-close btn-close-sm" @click="emit('close')"></button>
    </div>
    <div class="card-body">
      <!-- 属性对比表 -->
      <table class="table table-sm table-borderless mb-3">
        <thead>
          <tr class="text-muted small">
            <th>属性</th>
            <th class="text-center">{{ currentItem ? currentItem.name : '无' }}</th>
            <th class="text-center">{{ newItem.name }}</th>
            <th class="text-center">差值</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in compareStats" :key="stat.key">
            <td class="small">{{ stat.label }}</td>
            <td class="text-center small">{{ formatStatValue(stat.oldVal, stat.isPercent) }}</td>
            <td class="text-center small">{{ formatStatValue(stat.newVal, stat.isPercent) }}</td>
            <td class="text-center small fw-bold" :class="stat.diff > 0 ? 'text-success' : stat.diff < 0 ? 'text-danger' : 'text-muted'">
              <template v-if="stat.diff > 0">+</template>
              {{ formatStatValue(stat.diff, stat.isPercent) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 操作按钮 -->
      <div class="d-flex gap-2 justify-content-end">
        <button class="btn btn-sm btn-outline-secondary" @click="emit('close')">取消</button>
        <button class="btn btn-sm btn-success" @click="emit('replace')">替换装备</button>
      </div>
    </div>
  </div>
</template>
