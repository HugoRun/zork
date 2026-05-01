<script setup lang="ts">
/**
 * Buff图标组件
 * 方形360°进度条显示剩余时间，悬浮显示详情
 */
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { ActiveBuff } from '@/types'
import { BuffType, STAT_NAMES } from '@/types'

interface Props {
  buff: ActiveBuff
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 28
})

const now = ref(Date.now())
const showTip = ref(false)
const tipPos = ref({ x: 0, y: 0 })
const wrapperRef = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => { now.value = Date.now() }, 200)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function onEnter(e: MouseEvent) {
  const rect = (wrapperRef.value as HTMLElement).getBoundingClientRect()
  const tipW = 150
  const tipH = 90
  let x = rect.left + rect.width / 2 - tipW / 2
  let y = rect.top - tipH - 6
  // 防止超出屏幕
  if (x < 4) x = 4
  if (x + tipW > window.innerWidth - 4) x = window.innerWidth - tipW - 4
  if (y < 4) y = rect.bottom + 6
  tipPos.value = { x, y }
  showTip.value = true
}

/** 剩余时间百分比 (0~1) */
const progress = computed(() => {
  const total = props.buff.expireAt - props.buff.appliedAt
  const remaining = props.buff.expireAt - now.value
  if (total <= 0) return 0
  return Math.max(0, Math.min(1, remaining / total))
})

/** 剩余秒数 */
const remainingSeconds = computed(() => {
  return Math.max(0, Math.ceil((props.buff.expireAt - now.value) / 1000))
})

/** 是否已过期 */
const isExpired = computed(() => now.value >= props.buff.expireAt)

/** 进度条角度（顺时针） */
const degree = computed(() => Math.floor(progress.value * 360))

/** 进度条样式 */
const ringStyle = computed(() => {
  const deg = degree.value
  if (deg >= 360) return { background: getRingColor() }
  return {
    background: `conic-gradient(from 0deg, ${getRingColor()} ${deg}deg, rgba(255,255,255,0.08) ${deg}deg)`
  }
})

/** buff颜色 */
function getRingColor(): string {
  if (props.buff.isDebuff) {
    const colors: Record<string, string> = {
      [BuffType.Poison]: '#22C55E',
      [BuffType.Burn]: '#EF4444',
      [BuffType.Freeze]: '#60A5FA',
      [BuffType.Bind]: '#A78BFA',
      [BuffType.Stun]: '#FBBF24',
      [BuffType.StatMod]: '#F87171',
      [BuffType.Shield]: '#94A3B8',
    }
    return colors[props.buff.type] || '#F87171'
  }
  const colors: Record<string, string> = {
    [BuffType.StatMod]: '#22C55E',
    [BuffType.Regen]: '#34D399',
    [BuffType.Shield]: '#60A5FA',
    [BuffType.Freeze]: '#60A5FA',
  }
  return colors[props.buff.type] || '#22C55E'
}

function getTypeName(): string {
  const map: Record<string, string> = {
    [BuffType.StatMod]: '属性',
    [BuffType.Poison]: '中毒',
    [BuffType.Burn]: '灼烧',
    [BuffType.Regen]: '恢复',
    [BuffType.Freeze]: '冰冻',
    [BuffType.Bind]: '束缚',
    [BuffType.Stun]: '眩晕',
    [BuffType.Shield]: '护盾',
  }
  return map[props.buff.type] || '效果'
}

function getEffectDesc(): string {
  if (props.buff.type === BuffType.Poison || props.buff.type === BuffType.Burn) {
    return `每${(props.buff.tickInterval || 2000) / 1000}秒造成${props.buff.tickDamage || 0}点伤害`
  }
  if (props.buff.type === BuffType.Regen) {
    return `每${(props.buff.tickInterval || 2000) / 1000}秒恢复${props.buff.tickDamage || 0}点生命`
  }
  if (props.buff.type === BuffType.Shield) {
    return `吸收${props.buff.shieldAmount || 0}点伤害`
  }
  if (props.buff.type === BuffType.Freeze) return '无法行动'
  if (props.buff.type === BuffType.Stun) return '无法行动'
  if (props.buff.type === BuffType.Bind) return '无法攻击'
  if (props.buff.type === BuffType.StatMod && props.buff.stat) {
    const statName = STAT_NAMES[props.buff.stat] || props.buff.stat
    const val = props.buff.value || 0
    if (props.buff.isPercent) {
      return `${statName} ${val > 0 ? '+' : ''}${Math.floor(val * 100)}%`
    }
    return `${statName} ${val > 0 ? '+' : ''}${Math.floor(val)}`
  }
  return ''
}

const sz = computed(() => props.size)
const iconSize = computed(() => Math.floor(props.size * 0.55))
</script>

<template>
  <div
    v-if="!isExpired"
    ref="wrapperRef"
    class="buff-icon-wrapper"
    :style="{ width: sz + 'px', height: sz + 'px' }"
    @mouseenter="onEnter"
    @mouseleave="showTip = false"
  >
    <div
      class="buff-ring"
      :style="{ ...ringStyle, width: sz + 'px', height: sz + 'px' }"
    ></div>
    <span class="buff-emoji" :style="{ fontSize: iconSize + 'px' }">
      {{ buff.icon }}
    </span>
  </div>

  <!-- Tooltip 渲染到 body，不受父级 overflow:hidden 裁切 -->
  <Teleport to="body">
    <div
      v-if="showTip && !isExpired"
      class="buff-tooltip"
      :style="{ left: tipPos.x + 'px', top: tipPos.y + 'px' }"
    >
      <div class="tooltip-header" :class="{ debuff: buff.isDebuff }">
        <span>{{ buff.icon }} {{ buff.name }}</span>
        <span class="tooltip-type">{{ getTypeName() }}</span>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-effect">{{ getEffectDesc() }}</div>
        <div class="tooltip-source">来自: {{ buff.sourceName }}</div>
        <div class="tooltip-time" :class="{ 'time-low': remainingSeconds <= 3 }">
          剩余 {{ remainingSeconds }}秒
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.buff-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.buff-ring {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: background 0.3s linear;
}

.buff-emoji {
  position: relative;
  z-index: 1;
  text-align: center;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
}
</style>

<style>
/* 全局样式，不受 scoped 限制（Teleport 到 body） */
.buff-tooltip {
  position: fixed;
  min-width: 150px;
  background-color: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 6px 8px;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  color: #E2E8F0;
  font-size: 11px;
  line-height: 1.4;
}

.buff-tooltip .tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 11px;
  color: #22C55E;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 4px;
}

.buff-tooltip .tooltip-header.debuff {
  color: #F87171;
}

.buff-tooltip .tooltip-type {
  font-weight: 400;
  font-size: 10px;
  opacity: 0.7;
}

.buff-tooltip .tooltip-effect {
  color: #CBD5E1;
  margin-bottom: 2px;
}

.buff-tooltip .tooltip-source {
  color: #94A3B8;
  font-size: 10px;
  margin-bottom: 2px;
}

.buff-tooltip .tooltip-time {
  color: #22C55E;
  font-size: 10px;
}

.buff-tooltip .tooltip-time.time-low {
  color: #FBBF24;
  animation: buffBlink 0.6s infinite;
}

@keyframes buffBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
