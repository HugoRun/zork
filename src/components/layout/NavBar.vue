<script setup lang="ts">
/**
 * 顶部导航栏组件
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '@/stores/playerStore'
import { useAccountStore } from '@/stores/accountStore'
import { useSave } from '@/composables/useSave'
import ProgressBar from '@/components/common/ProgressBar.vue'
import AccountSelectModal from '@/components/account/AccountSelectModal.vue'
import { Settings, Download, Upload, Coins, Users } from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const playerStore = usePlayerStore()
const accountStore = useAccountStore()
const { exportSave, importSave } = useSave()

const player = computed(() => playerStore.player)

/** 账号切换弹窗 */
const showAccountModal = ref(false)

/** 切换账号 */
function handleSwitchAccount(accountId: string) {
  const playerData = accountStore.switchAccount(accountId)
  if (playerData) {
    playerStore.player = playerData
    // 刷新页面以重新初始化所有store
    window.location.reload()
  }
}

const DEFAULT_AVATAR = '/410b8a30918e18d94699ac150f54a10326742a586ab9a-d7WmO5.png'

const emit = defineEmits<{
  'open-settings': []
}>()

/** 导出存档 */
function handleExport() {
  exportSave()
}

/** 导入存档 */
async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const success = await importSave(file)
    if (success) {
      alert(t('settings.importSuccess'))
    } else {
      alert(t('settings.importError'))
    }
  }
  input.value = ''
}

/** 返回首页 */
function goHome() {
  router.push('/')
}
</script>

<template>
  <header class="navbar-header">
    <!-- 左侧：Logo + 角色 -->
    <div class="navbar-left">
      <img src="/697c62c742e2b345c8374a7bMYBca2ZM07.png" alt="Logo" class="nav-logo" />
      <div class="game-name">神魔纪元</div>
      <div class="navbar-divider"></div>
      <div class="player-section" @click="goHome">
        <img :src="player?.avatar || DEFAULT_AVATAR" :alt="player?.name" class="player-avatar" />
        <div class="player-meta">
          <div class="player-name-row">
            <span class="player-name">{{ player?.name }}</span>
            <span class="player-level">Lv.{{ player?.level }}</span>
          </div>
          <div class="exp-bar" :title="`经验: ${player?.exp || 0} / ${playerStore.getExpForLevel(player?.level || 1)}`">
            <ProgressBar
              :current="player?.exp || 0"
              :max="playerStore.getExpForLevel(player?.level || 1)"
              variant="exp"
              :height="4"
              :show-text="false"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：金币 + 操作 -->
    <div class="navbar-right">
      <div class="gold-badge">
        <Coins :size="16" />
        <span>{{ player?.gold?.toLocaleString() || 0 }}</span>
      </div>
      <div class="navbar-divider"></div>
      <div class="quick-actions">
        <button class="action-btn" @click="showAccountModal = true" :title="'切换角色 (' + accountStore.accountCount + ')'">
          <Users :size="16" />
          <span class="account-count-badge">{{ accountStore.accountCount }}</span>
        </button>
        <button class="action-btn" @click="handleExport" title="导出存档">
          <Download :size="16" />
        </button>
        <label class="action-btn" title="导入存档">
          <Upload :size="16" />
          <input
            type="file"
            accept=".json"
            @change="handleImport"
            style="display: none"
          />
        </label>
        <button class="action-btn" :title="t('title.settings')" @click="emit('open-settings')">
          <Settings :size="16" />
        </button>
      </div>
    </div>
  </header>

  <!-- 账号切换弹窗 -->
  <AccountSelectModal
    v-model="showAccountModal"
    @select="handleSwitchAccount"
    @create-new="showAccountModal = false"
  />
</template>

<style scoped>
.navbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 var(--space-lg);
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

/* 左侧 */
.navbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.navbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border-color);
}

.nav-logo {
  height: 28px;
  width: auto;
  object-fit: contain;
}

.player-section {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) var(--easing-default);
}

.player-section:hover {
  background-color: var(--bg-hover);
}

.player-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--accent-primary);
  flex-shrink: 0;
}

.player-meta {
  min-width: 0;
}

.player-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.player-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.player-level {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--accent-primary);
  background-color: var(--accent-muted);
  padding: 1px 6px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  flex-shrink: 0;
}

.exp-bar {
  width: 100px;
  margin-top: 2px;
}

/* 右侧 */
.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.gold-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background-color: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--radius-full);
  color: #F59E0B;
  font-size: var(--text-sm);
  font-weight: 600;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-default);
}

.action-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.account-count-badge {
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  background-color: var(--accent-primary);
  padding: 0 4px;
  border-radius: 8px;
  margin-left: -2px;
  line-height: 1.2;
}
</style>
