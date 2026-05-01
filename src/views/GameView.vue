<script setup lang="ts">
/**
 * 游戏主界面
 * 整合所有组件
 */
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGameLoop } from '@/composables/useGameLoop'
import { initTheme } from '@/themes'

import NavBar from '@/components/layout/NavBar.vue'
import SideMenu from '@/components/layout/SideMenu.vue'
import BattleScene from '@/components/battle/BattleScene.vue'
import InventoryPanel from '@/components/inventory/InventoryPanel.vue'
import ShopPanel from '@/components/shop/ShopPanel.vue'
import SkillPanel from '@/components/skill/SkillPanel.vue'
import AchievementPanel from '@/components/achievement/AchievementPanel.vue'
import CharacterPanel from '@/components/character/CharacterPanel.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import MapPanel from '@/components/map/MapPanel.vue'
import CraftingPanel from '@/components/crafting/CraftingPanel.vue'
import CodexPanel from '@/components/codex/CodexPanel.vue'
import PetPanel from '@/components/pet/PetPanel.vue'
import WarehousePanel from '@/components/warehouse/WarehousePanel.vue'
import ModalDrawer from '@/components/common/ModalDrawer.vue'

const { t } = useI18n()
const router = useRouter()
const playerStore = usePlayerStore()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

// 初始化主题
initTheme()

// 启动游戏循环
const { isRunning, start, stop } = useGameLoop()

// 当前打开的面板
const currentPanel = ref<string | null>(null)

// 抽屉显示状态（带setter的computed，支持v-model双向绑定）
const showInventory = computed({
  get: () => currentPanel.value === 'inventory',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showShop = computed({
  get: () => currentPanel.value === 'shop',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showSkills = computed({
  get: () => currentPanel.value === 'skills',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showAchievements = computed({
  get: () => currentPanel.value === 'achievements',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showSettings = computed({
  get: () => currentPanel.value === 'settings',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showMap = computed({
  get: () => currentPanel.value === 'map',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showCrafting = computed({
  get: () => currentPanel.value === 'crafting',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showCodex = computed({
  get: () => currentPanel.value === 'codex',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showCharacter = computed({
  get: () => currentPanel.value === 'character',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showPets = computed({
  get: () => currentPanel.value === 'pets',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})
const showWarehouse = computed({
  get: () => currentPanel.value === 'warehouse',
  set: (val: boolean) => { if (!val) currentPanel.value = null }
})

// 打开面板
function openPanel(panelId: string) {
  currentPanel.value = panelId
}

// 关闭面板
function closePanel() {
  currentPanel.value = null
}

// 检查是否有角色
onMounted(() => {
  if (!playerStore.hasPlayer) {
    router.push('/')
  } else {
    // 启动游戏循环
    start()
  }
})
</script>

<template>
  <div class="game-view min-vh-100 d-flex flex-column">
    <!-- 顶部导航栏 -->
    <NavBar @open-settings="openPanel('settings')" />
    
    <!-- 主内容区域 -->
    <div class="main-content flex-grow-1 d-flex">
      <!-- 左侧面板 -->
      <SideMenu @open-panel="openPanel" />
      
      <!-- 右侧主区域 -->
      <main class="content-area flex-grow-1">
        <BattleScene />
      </main>
    </div>
    
    <!-- 背包抽屉 -->
    <ModalDrawer
      v-model="showCharacter"
      title="角色"
      type="drawer"
      placement="end"
      size="md"
    >
      <CharacterPanel />
    </ModalDrawer>

    <!-- 背包抽屉 -->
    <ModalDrawer
      v-model="showInventory"
      :title="t('title.inventory')"
      type="drawer"
      placement="end"
      size="lg"
    >
      <InventoryPanel @close="closePanel" />
    </ModalDrawer>
    
    <!-- 商店抽屉 -->
    <ModalDrawer
      v-model="showShop"
      :title="t('title.shop')"
      type="drawer"
      placement="end"
      size="md"
    >
      <ShopPanel @close="closePanel" />
    </ModalDrawer>
    
    <!-- 技能抽屉 -->
    <ModalDrawer
      v-model="showSkills"
      :title="t('title.skills')"
      type="drawer"
      placement="end"
      size="md"
    >
      <SkillPanel @close="closePanel" />
    </ModalDrawer>
    
    <!-- 成就抽屉 -->
    <ModalDrawer
      v-model="showAchievements"
      :title="t('title.achievements')"
      type="drawer"
      placement="end"
      size="md"
    >
      <AchievementPanel @close="closePanel" />
    </ModalDrawer>

    <!-- 地图抽屉 -->
    <ModalDrawer
      v-model="showMap"
      :title="t('title.selectMap')"
      type="drawer"
      placement="end"
      size="lg"
    >
      <MapPanel @close="closePanel" />
    </ModalDrawer>

    <!-- 制作系统抽屉 -->
    <ModalDrawer
      v-model="showCrafting"
      title="制作"
      type="drawer"
      placement="end"
      size="lg"
    >
      <CraftingPanel @close="closePanel" />
    </ModalDrawer>

    <!-- 图鉴抽屉 -->
    <ModalDrawer
      v-model="showCodex"
      title="图鉴"
      type="drawer"
      placement="end"
      size="lg"
    >
      <CodexPanel @close="closePanel" />
    </ModalDrawer>

    <!-- 宠物抽屉 -->
    <ModalDrawer
      v-model="showPets"
      title="幻兽"
      type="drawer"
      placement="end"
      size="md"
    >
      <PetPanel @close="closePanel" />
    </ModalDrawer>

    <!-- 仓库抽屉 -->
    <ModalDrawer
      v-model="showWarehouse"
      title="仓库"
      type="drawer"
      placement="end"
      size="md"
    >
      <WarehousePanel @close="closePanel" />
    </ModalDrawer>

    <!-- 设置抽屉 -->
    <ModalDrawer
      v-model="showSettings"
      :title="t('title.settings')"
      type="drawer"
      placement="end"
      size="md"
    >
      <SettingsPanel @close="closePanel" />
    </ModalDrawer>
  </div>
</template>

<style scoped>
.game-view {
  background-color: var(--bg-primary);
  overflow: hidden;
}

.main-content {
  height: calc(100vh - 60px);
}

.content-area {
  background-color: var(--bg-primary);
  overflow: hidden;
}
</style>
