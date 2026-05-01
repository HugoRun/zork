<script setup lang="ts">
/**
 * 进度条组件
 * 用于显示血条、魔法条、经验条等
 */
import { computed } from 'vue'

interface Props {
  /** 当前值 */
  current: number
  /** 最大值 */
  max: number
  /** 进度条颜色主题 */
  variant?: 'hp' | 'mp' | 'exp' | 'custom'
  /** 自定义颜色 */
  color?: string
  /** 是否显示文字 */
  showText?: boolean
  /** 高度（像素） */
  height?: number
  /** 是否显示动画 */
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'custom',
  showText: true,
  height: 20,
  animated: true
})

/** 计算百分比 */
const percentage = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, Math.max(0, (props.current / props.max) * 100))
})

/** 颜色映射 */
const variantColors = {
  hp: 'var(--progress-hp, #EF4444)',
  mp: 'var(--progress-mp, #3B82F6)',
  exp: 'var(--progress-exp, #F59E0B)',
  custom: 'var(--progress-success, #22C55E)'
}

/** 进度条颜色 */
const barColor = computed(() => {
  if (props.color) return props.color
  return variantColors[props.variant]
})

/** 进度条样式 */
const barStyle = computed(() => ({
  width: `${percentage.value}%`,
  backgroundColor: barColor.value,
  transition: props.animated ? 'width 0.3s ease-out' : 'none'
}))

/** 文字大小根据高度自适应 */
const textFontSize = computed(() => {
  if (props.height >= 16) return '0.7rem'
  if (props.height >= 12) return '0.6rem'
  return '0.7rem'
})
</script>

<template>
  <div 
    class="progress-wrapper"
    :style="{ height: `${height}px` }"
  >
    <div class="progress">
      <div 
        class="progress-bar" 
        role="progressbar"
        :style="barStyle"
        :aria-valuenow="current"
        :aria-valuemin="0"
        :aria-valuemax="max"
      ></div>
    </div>
    <span 
      v-if="showText" 
      class="progress-text"
      :style="{ lineHeight: `${height}px`, fontSize: textFontSize }"
    >
      {{ Math.floor(current) }} / {{ Math.floor(max) }}
    </span>
  </div>
</template>

<style scoped>
.progress-wrapper {
  width: 100%;
  position: relative;
}

.progress {
  width: 100%;
  height: 100%;
  background-color: var(--bg-tertiary, rgba(0, 0, 0, 0.25));
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: block;
  text-align: center;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
</style>
