<script setup lang="ts">
/**
 * 品质徽章组件
 * 显示物品品质或怪物头衔
 */
import { computed } from 'vue'
import { Quality, MonsterTitle, QUALITY_COLORS, TITLE_COLORS } from '@/types'

interface Props {
  /** 品质 */
  quality?: Quality
  /** 头衔 */
  title?: MonsterTitle
  /** 是否显示发光效果（领主专用） */
  glow?: boolean
}

const props = defineProps<Props>()

/** 显示文字 */
const displayText = computed(() => {
  if (props.quality) {
    const qualityNames: Record<Quality, string> = {
      [Quality.Common]: '普通',
      [Quality.Uncommon]: '优秀',
      [Quality.Rare]: '稀有',
      [Quality.Epic]: '史诗',
      [Quality.Legendary]: '传说'
    }
    return qualityNames[props.quality]
  }
  
  if (props.title) {
    const titleNames: Record<MonsterTitle, string> = {
      [MonsterTitle.Normal]: '普通',
      [MonsterTitle.Elite]: '精英',
      [MonsterTitle.Lord]: '领主'
    }
    return titleNames[props.title]
  }
  
  return ''
})

/** 颜色 */
const color = computed(() => {
  if (props.quality) {
    return QUALITY_COLORS[props.quality]
  }
  if (props.title) {
    return TITLE_COLORS[props.title]
  }
  return '#9CA3AF'
})

/** 是否为领主 */
const isLord = computed(() => props.title === MonsterTitle.Lord)
</script>

<template>
  <span 
    class="quality-badge"
    :class="{ 'lord-glow': isLord && glow }"
    :style="{ color }"
  >
    {{ displayText }}
  </span>
</template>

<style scoped>
.quality-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.545);
  box-sizing: -box;
}

.lord-glow {
  animation: lord-pulse 2s infinite;
}

@keyframes lord-pulse {
  0%, 100% {
    text-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
  }
  50% {
    text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
  }
}
</style>
