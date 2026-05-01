import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import i18n from './i18n'
import App from './App.vue'

// 导入Bootstrap样式
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 导入主题样式
import './styles/variables.scss'

// ============ 数据迁移：清除旧版本未隔离的数据 ============
(function migrateOldData() {
  const OLD_KEYS = ['player', 'pets', 'inventory', 'game', 'achievement', 'crafting', 'warehouse', 'shop', 'map']
  const hasAccounts = localStorage.getItem('darklegend_accounts')

  if (!hasAccounts) {
    // 新用户或没有账号数据：清除所有旧 key
    let cleared = 0
    for (const key of OLD_KEYS) {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        cleared++
      }
    }
    if (cleared > 0) {
      console.log(`[迁移] 清除了 ${cleared} 个旧版本数据key`)
    }
  } else {
    // 已有账号：检查是否有孤立的旧 key（不属于任何账号）
    // 这些旧数据可能是其他账号的，为了安全，暂不自动清除
    // 用户可以通过"清除缓存"功能手动清理
    console.log('[迁移] 检测到已有账号数据，跳过自动清除')
  }
})()

// 创建Vue应用实例
const app = createApp(App)

// 创建Pinia状态管理
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册插件
app.use(pinia)
app.use(router)
app.use(i18n)

// 挂载应用
app.mount('#app')
