<script setup lang="ts">
/**
 * 属性列表展示组件
 * 显示角色所有属性（基础+装备加成）
 */
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useStatsCalculator } from '@/composables/useStatsCalculator'
import { formatStatValue } from '@/utils/formatter'

const { totalStats } = useStatsCalculator()
const playerStore = usePlayerStore()

const player = computed(() => playerStore.player)

/** 属性展示列表 */
const statEntries = computed(() => {
  const stats = totalStats.value
  const base = player.value?.baseStats
  return [
    { label: '攻击力', value: stats.attack, base: base?.attack || 0, isPercent: false },
    { label: '防御力', value: stats.defense, base: base?.defense || 0, isPercent: false },
    { label: '法术强度', value: stats.magicAttack, base: base?.magicAttack || 0, isPercent: false },
    { label: '魔法抗性', value: stats.magicDefense, base: base?.magicDefense || 0, isPercent: false },
    { label: '速度', value: stats.speed, base: base?.speed || 0, isPercent: false, decimals: 2 },
    { label: '暴击率', value: stats.critRate, base: base?.critRate || 0, isPercent: true },
    { label: '暴击伤害', value: stats.critDamage, base: base?.critDamage || 0, isPercent: true },
    { label: '闪避率', value: stats.dodge, base: base?.dodge || 0, isPercent: true },
    { label: '命中率', value: stats.hitRate, base: base?.hitRate || 0, isPercent: true }
  ]
})
</script>

<template>
  <div class="attribute-list">
    <h6 class="mb-2 small fw-bold">属性详情</h6>
    <table class="table table-sm table-borderless mb-0">
      <tbody>
        <tr v-for="stat in statEntries" :key="stat.label">
          <td class="small text-muted">{{ stat.label }}</td>
          <td class="text-end small fw-bold">
            {{ formatStatValue(stat.value, stat.isPercent) }}
          </td>
          <td
            v-if="stat.value !== stat.base"
            class="text-end small text-success"
            style="font-size: 0.7rem;"
          >
            (+{{ formatStatValue(stat.value - stat.base, stat.isPercent) }})
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
