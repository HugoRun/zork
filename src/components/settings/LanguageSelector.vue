<script setup lang="ts">
/**
 * 语言选择器组件
 */
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settingsStore'

const { locale } = useI18n()
const settingsStore = useSettingsStore()

const languages = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
]

function setLanguage(lang: string) {
  locale.value = lang
  settingsStore.setLanguage(lang)
}
</script>

<template>
  <div class="language-selector">
    <h6 class="mb-3">语言</h6>
    <div class="d-flex gap-2">
      <button
        v-for="lang in languages"
        :key="lang.value"
        class="btn btn-sm"
        :class="settingsStore.language === lang.value ? 'btn-primary' : 'btn-outline-secondary'"
        @click="setLanguage(lang.value)"
      >
        {{ lang.label }}
      </button>
    </div>
  </div>
</template>
