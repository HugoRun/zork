<script setup lang="ts">
/**
 * 设置面板组件
 * 整合主题、语言、药水配置、存档管理
 */
import ThemeSelector from './ThemeSelector.vue'
import LanguageSelector from './LanguageSelector.vue'
import PotionSettings from '@/components/common/PotionSettings.vue'
import SaveManager from './SaveManager.vue'

const emit = defineEmits<{
  'close': []
}>()
</script>

<template>
  <div class="settings-panel d-flex flex-column gap-3">
    <ThemeSelector />
    <LanguageSelector />
    <PotionSettings />
    <SaveManager />
  </div>
</template>
