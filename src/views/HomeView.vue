<script setup lang="ts">
/**
 * 首页 - 角色选择/创建页面
 * 支持多账号：显示已有角色列表，支持切换和新建
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { useAccountStore } from '@/stores/accountStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { CharacterClass } from '@/types'
import { useI18n } from 'vue-i18n'
import { initTheme } from '@/themes'
import AccountSelectModal from '@/components/account/AccountSelectModal.vue'

const router = useRouter()
const playerStore = usePlayerStore()
const accountStore = useAccountStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

// 初始化主题
initTheme()

/** 是否显示账号选择弹窗 */
const showAccountModal = ref(false)

onMounted(() => {
  // 如果已有当前账号且玩家数据存在，直接进入游戏
  if (accountStore.currentAccountId && accountStore.currentPlayerData) {
    // 恢复玩家数据到playerStore
    restorePlayerData(accountStore.currentPlayerData)
    router.push('/game')
    return
  }

  // 如果有账号列表但没有选中的，或者没有玩家数据，显示选择界面
  if (accountStore.accounts.length > 0) {
    // 延迟一帧确保DOM就绪
    setTimeout(() => {
      showAccountModal.value = true
    }, 100)
  } else {
    // 没有任何角色，直接显示创建表单
    setTimeout(() => {
      showAccountModal.value = true
    }, 100)
  }
})

/** 恢复玩家数据到playerStore */
function restorePlayerData(playerData: any) {
  playerStore.player = playerData
}

/** 选择/切换账号 */
function handleSelectAccount(accountId: string) {
  const playerData = accountStore.switchAccount(accountId)
  if (playerData) {
    restorePlayerData(playerData)
    // 刷新页面以重新初始化所有store（确保数据隔离）
    window.location.reload()
  }
}

/** 创建新角色 */
function handleCreateNew() {
  showAccountModal.value = false
  // 弹窗内部会处理创建并触发select事件
}
</script>

<template>
  <div class="home-view min-vh-100 d-flex flex-column">
    <!-- 顶部 -->
    <header class="header py-3 px-4 d-flex justify-content-between align-items-center">
      <div class="game-title d-flex align-items-center gap-3">
        <img src="/697c62c742e2b345c8374a7bMYBca2ZM07.png" alt="Logo" class="game-logo" />
        <div>
          <h1 class="mb-0">{{ t('title.game') }}</h1>
          <small class="text-muted">{{ t('title.subtitle') }}</small>
        </div>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <button
          v-if="accountStore.accountCount > 0"
          class="btn btn-sm btn-outline-secondary"
          @click="showAccountModal = true"
        >
          🔄 切换角色 ({{ accountStore.accountCount }})
        </button>
        <select 
          class="form-select form-select-sm" 
          style="width: auto"
          v-model="settingsStore.language"
        >
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </select>
        <select 
          class="form-select form-select-sm" 
          style="width: auto"
          v-model="settingsStore.theme"
        >
          <option value="light">{{ t('settings.themeLight') }}</option>
          <option value="dark">{{ t('settings.themeDark') }}</option>
          <option value="forest">{{ t('settings.themeForest') }}</option>
        </select>
      </div>
    </header>
    
    <!-- 主内容 -->
    <main class="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
      <div class="welcome-panel card p-5" style="max-width: 600px; width: 100%; text-align: center;">
        <h2 class="mb-3">{{ t('title.game') }}</h2>
        <p class="text-muted mb-4">{{ t('title.subtitle') }}</p>
        <button class="btn btn-primary btn-lg" @click="showAccountModal = true" style="padding: 12px 48px; font-size: 1.1rem;">
          {{ accountStore.accountCount > 0 ? '选择角色 / 开始游戏' : t('character.startGame') }}
        </button>
        <p v-if="accountStore.accountCount > 0" class="text-muted small mt-3">
          当前共有 {{ accountStore.accountCount }} 个角色
        </p>
      </div>
    </main>

    <!-- 账号选择/创建弹窗 -->
    <AccountSelectModal
      v-model="showAccountModal"
      @select="handleSelectAccount"
      @create-new="handleCreateNew"
    />
  </div>
</template>

<style scoped>
.home-view {
  background-color: var(--bg-primary);
}

.header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.game-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.game-title h1 {
  color: var(--accent-primary);
}

.welcome-panel {
  background-color: var(--bg-card);
  border-color: var(--border-color);
}
</style>
