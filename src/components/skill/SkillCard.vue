<script setup lang="ts">
/**
 * 技能卡片组件
 * 显示单个技能的详细信息
 */
import { computed } from 'vue'
import type { SkillInstance } from '@/types'

const props = defineProps<{
  skill: SkillInstance
}>()

const config = computed(() => props.skill.config)

/** 冷却时间文本 */
const cooldownText = computed(() => {
  const cd = config.value.cooldown
  if (cd >= 1000) return `${(cd / 1000).toFixed(1)}s`
  return `${cd}ms`
})

/** 效果类型文本 */
const effectTypeText = computed(() => {
  const map: Record<string, string> = {
    physicalDamage: '物理伤害',
    magicDamage: '魔法伤害',
    heal: '治疗',
    buffSelf: '自身增益',
    buffAll: '群体增益',
    debuff: '减益'
  }
  return map[config.value.effectType] || config.value.effectType
})

/** 目标类型文本 */
const targetText = computed(() => {
  const map: Record<string, string> = {
    single: '单体',
    all: '群体',
    self: '自身'
  }
  return map[config.value.target] || config.value.target
})

/** 是否在冷却中 */
const isOnCooldown = computed(() => props.skill.cooldownRemaining > 0)

/** 冷却进度百分比 */
const cooldownPercent = computed(() => {
  if (config.value.cooldown <= 0) return 0
  return Math.min(100, (props.skill.cooldownRemaining / config.value.cooldown) * 100)
})
</script>

<template>
  <div class="skill-card card" :class="{ 'on-cooldown': isOnCooldown }">
    <div class="card-body p-2">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="fw-bold small">{{ config.name }}</span>
            <span class="badge" :class="isOnCooldown ? 'bg-secondary' : 'bg-primary'">
              {{ isOnCooldown ? '冷却中' : '就绪' }}
            </span>
          </div>
          <div class="text-muted small">{{ config.description }}</div>
        </div>
      </div>

      <!-- 属性信息 -->
      <div class="d-flex gap-3 mt-2 small text-muted flex-wrap">
        <span>{{ effectTypeText }}</span>
        <span>{{ targetText }}</span>
        <span>冷却: {{ cooldownText }}</span>
        <span>消耗: {{ config.mpCost }} MP</span>
        <span v-if="config.value && config.effectType !== 'heal'">
          伤害: {{ (config.value * 100).toFixed(0) }}%
        </span>
        <span v-if="config.value && config.effectType === 'heal'">
          治疗: {{ config.value }}
        </span>
      </div>

      <!-- 冷却遮罩 -->
      <div
        v-if="isOnCooldown"
        class="cooldown-overlay"
        :style="{ width: cooldownPercent + '%' }"
      >
        <span class="small">{{ (skill.cooldownRemaining / 1000).toFixed(1) }}s</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  transition: all var(--duration-normal) var(--easing-default);
}

.skill-card:hover {
  border-color: var(--accent-primary);
}

.skill-card.on-cooldown {
  opacity: 0.6;
}

.cooldown-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: var(--accent-primary);
  transition: width var(--duration-normal) var(--easing-default);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--space-sm);
}
</style>
