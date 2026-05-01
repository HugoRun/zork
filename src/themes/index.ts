import { ref, watch } from 'vue'

/**
 * 主题类型定义
 */
export type ThemeName = 'light' | 'dark' | 'forest'

/**
 * 极简风格主题配置
 */
const themeConfigs = {
  light: {
    name: 'light',
    label: '浅色',
    vars: {
      '--bg-primary': '#FFFFFF',
      '--bg-secondary': '#F8F9FA',
      '--bg-tertiary': '#F1F3F5',
      '--bg-hover': '#E9ECEF',
      '--bg-card': '#FFFFFF',
      '--text-primary': '#212529',
      '--text-secondary': '#6C757D',
      '--text-muted': '#ADB5BD',
      '--accent-primary': '#2563EB',
      '--accent-hover': '#1D4ED8',
      '--accent-muted': 'rgba(37, 99, 235, 0.1)',
      '--border-color': '#DEE2E6',
      '--border-color-light': '#E9ECEF',
      '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
      '--shadow-md': '0 2px 4px rgba(0, 0, 0, 0.06)',
      '--shadow-lg': '0 4px 6px rgba(0, 0, 0, 0.07)'
    }
  },
  dark: {
    name: 'dark',
    label: '深色',
    vars: {
      '--bg-primary': '#1A1A1A',
      '--bg-secondary': '#242424',
      '--bg-tertiary': '#2D2D2D',
      '--bg-hover': '#333333',
      '--bg-card': '#242424',
      '--text-primary': '#E5E5E5',
      '--text-secondary': '#A3A3A3',
      '--text-muted': '#737373',
      '--accent-primary': '#3B82F6',
      '--accent-hover': '#2563EB',
      '--accent-muted': 'rgba(59, 130, 246, 0.1)',
      '--border-color': '#404040',
      '--border-color-light': '#333333',
      '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
      '--shadow-md': '0 2px 4px rgba(0, 0, 0, 0.4)',
      '--shadow-lg': '0 4px 6px rgba(0, 0, 0, 0.5)'
    }
  },
  forest: {
    name: 'forest',
    label: '森林',
    vars: {
      '--bg-primary': '#1A2F1A',
      '--bg-secondary': '#2D4A2D',
      '--bg-tertiary': '#3D5A3D',
      '--bg-hover': '#4A6A4A',
      '--bg-card': '#2D4A2D',
      '--text-primary': '#E0E8D0',
      '--text-secondary': '#A8B898',
      '--text-muted': '#788868',
      '--accent-primary': '#8BC34A',
      '--accent-hover': '#7CB342',
      '--accent-muted': 'rgba(139, 195, 74, 0.1)',
      '--border-color': '#4A6A4A',
      '--border-color-light': '#3D5A3D',
      '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.2)',
      '--shadow-md': '0 2px 4px rgba(0, 0, 0, 0.25)',
      '--shadow-lg': '0 4px 6px rgba(0, 0, 0, 0.3)'
    }
  }
}

// 当前主题
const currentTheme = ref<ThemeName>('light')

/**
 * 应用主题到DOM
 */
function applyTheme(theme: ThemeName): void {
  const config = themeConfigs[theme]
  const root = document.documentElement
  
  Object.entries(config.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  
  // 更新body的class用于全局样式
  document.body.className = `theme-${theme}`
}

/**
 * 初始化主题（从localStorage恢复）
 */
export function initTheme(): void {
  const stored = localStorage.getItem('game-settings')
  if (stored) {
    try {
      const settings = JSON.parse(stored)
      if (settings.theme && themeConfigs[settings.theme as ThemeName]) {
        currentTheme.value = settings.theme
      }
    } catch (e) {
      // 解析失败，使用默认主题
    }
  }
  applyTheme(currentTheme.value)
}

/**
 * 切换主题
 */
export function setTheme(theme: ThemeName): void {
  currentTheme.value = theme
  applyTheme(theme)
}

/**
 * 获取当前主题
 */
export function getCurrentTheme(): ThemeName {
  return currentTheme.value
}

/**
 * 获取所有主题列表
 */
export function getThemeList() {
  return Object.entries(themeConfigs).map(([key, config]) => ({
    name: key as ThemeName,
    label: config.label
  }))
}

// 监听主题变化，自动保存到settingsStore
watch(currentTheme, () => {
  applyTheme(currentTheme.value)
})

export default {
  initTheme,
  setTheme,
  getCurrentTheme,
  getThemeList
}
