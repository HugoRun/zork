import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

/**
 * 获取浏览器默认语言
 */
function getBrowserLocale(): string {
  const navigatorLocale = navigator.language || (navigator as any).userLanguage
  if (!navigatorLocale) return 'zh-CN'
  
  // 标准化语言代码
  const locale = navigatorLocale.split('-')[0]
  return locale === 'zh' ? 'zh-CN' : 'en-US'
}

/**
 * 从localStorage获取存储的语言或使用浏览器语言
 */
function getDefaultLocale(): string {
  const stored = localStorage.getItem('game-settings')
  if (stored) {
    try {
      const settings = JSON.parse(stored)
      if (settings.language) return settings.language
    } catch (e) {
      // 解析失败，使用浏览器语言
    }
  }
  return getBrowserLocale()
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n
