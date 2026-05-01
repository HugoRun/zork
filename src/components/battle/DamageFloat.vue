<script setup lang="ts">
/**
 * 伤害飘字组件
 * 显示伤害/治疗/闪避等浮动文字
 */
import { ref, computed, onMounted } from 'vue'
import type { DamageFloat as DamageFloatType } from '@/types'

const props = defineProps<{
  data: DamageFloatType
}>()

const visible = ref(true)
const isHeal = computed(() => props.data.type === 'heal')
const isDodge = computed(() => props.data.type === 'dodge')
const isCrit = computed(() => props.data.isCrit || props.data.type === 'critical')

/** 根据类型获取样式类 */
const floatClass = computed(() => {
  const base = 'damage-float'
  if (isDodge.value) return `${base} text-dodge`
  if (isHeal.value) return `${base} text-heal`
  if (isCrit.value) return `${base} text-crit`
  return `${base} text-normal`
})

const displayText = computed(() => {
  if (isDodge.value) return 'MISS'
  if (isHeal.value) return `+${Math.floor(props.data.value)}`
  return `-${Math.floor(props.data.value)}`
})

onMounted(() => {
  setTimeout(() => {
    visible.value = false
  }, 1200)
})
</script>

<template>
  <Transition name="float">
    <div v-if="visible" :class="floatClass">
      {{ displayText }}
    </div>
  </Transition>
</template>

<style scoped>
.damage-float {
  pointer-events: none;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  animation: floatUp 1s ease-out forwards;
  z-index: 50;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.text-normal {
  color: #fff;
  font-size: 0.9rem;
}

.text-crit {
  color: #ffd700;
  font-size: 1.4rem;
  animation: floatUp 1s ease-out forwards, critShake 0.3s ease-out;
}

.text-heal {
  color: #4ade80;
  font-size: 1rem;
}

.text-dodge {
  color: #94a3b8;
  font-size: 0.85rem;
  font-style: italic;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    top: 40%;
  }
  100% {
    opacity: 0;
    top: 10%;
  }
}

@keyframes critShake {
  0%, 100% { transform: translateX(-50%) scale(1); }
  25% { transform: translateX(-50%) scale(1.3); }
  50% { transform: translateX(-50%) scale(1.1); }
  75% { transform: translateX(-50%) scale(1.2); }
}

.float-enter-active {
  transition: opacity 0.15s ease;
}
.float-leave-active {
  transition: opacity 0.3s ease;
}
.float-enter-from,
.float-leave-to {
  opacity: 0;
}
</style>
