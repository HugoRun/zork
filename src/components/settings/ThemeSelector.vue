<script setup lang="ts">
/**
 * 主题选择器组件
 */
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import type { ThemeName } from '@/themes'

const settingsStore = useSettingsStore()

const themes: Array<{ value: ThemeName; label: string; icon: string }> = [
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'dark', label: '暗黑', icon: '🌙' },
  { value: 'forest', label: '森林', icon: '🌲' }
]

function setTheme(theme: ThemeName) {
  settingsStore.setTheme(theme)
  // 触发主题应用
  document.documentElement.setAttribute('data-theme', theme)
}
</script>

<template>
  <div class="theme-selector">
    <h6 class="mb-3">主题选择</h6>
    <div class="d-flex gap-2">
      <button
        v-for="theme in themes"
        :key="theme.value"
        class="btn btn-sm"
        :class="settingsStore.theme === theme.value ? 'btn-primary' : 'btn-outline-secondary'"
        @click="setTheme(theme.value)"
      >
        {{ theme.icon }} {{ theme.label }}
      </button>
    </div>
  </div>
</template>
