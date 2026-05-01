import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ThemeName } from '@/themes'

/**
 * 设置状态管理
 */
export const useSettingsStore = defineStore('settings', () => {
  // ==================== 状态 ====================
  
  /** 当前主题 */
  const theme = ref<ThemeName>('light')
  
  /** 当前语言 */
  const language = ref<string>('zh-CN')
  
  /** 音效开关 */
  const soundEnabled = ref<boolean>(true)
  
  /** 音乐开关 */
  const musicEnabled = ref<boolean>(true)
  
  /** 音量 */
  const volume = ref<number>(0.5)
  
  /** 自动战斗速度倍率 */
  const battleSpeed = ref<number>(1)
  
  // ==================== 方法 ====================
  
  /**
   * 设置主题
   */
  function setTheme(newTheme: ThemeName): void {
    theme.value = newTheme
  }
  
  /**
   * 设置语言
   */
  function setLanguage(lang: string): void {
    language.value = lang
  }
  
  /**
   * 切换音效
   */
  function toggleSound(): void {
    soundEnabled.value = !soundEnabled.value
  }
  
  /**
   * 切换音乐
   */
  function toggleMusic(): void {
    musicEnabled.value = !musicEnabled.value
  }
  
  /**
   * 设置音量
   */
  function setVolume(value: number): void {
    volume.value = Math.max(0, Math.min(1, value))
  }
  
  /**
   * 设置战斗速度
   */
  function setBattleSpeed(speed: number): void {
    battleSpeed.value = Math.max(1, Math.min(3, speed))
  }
  
  /**
   * 重置设置
   */
  function resetSettings(): void {
    theme.value = 'light'
    language.value = 'zh-CN'
    soundEnabled.value = true
    musicEnabled.value = true
    volume.value = 0.5
    battleSpeed.value = 1
  }
  
  return {
    // 状态
    theme,
    language,
    soundEnabled,
    musicEnabled,
    volume,
    battleSpeed,
    
    // 方法
    setTheme,
    setLanguage,
    toggleSound,
    toggleMusic,
    setVolume,
    setBattleSpeed,
    resetSettings
  }
}, {
  persist: true
})
