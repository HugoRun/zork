<script setup lang="ts">
/**
 * 左侧菜单栏组件
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '@/stores/playerStore'
import { useStatsCalculator } from '@/composables/useStatsCalculator'
import ProgressBar from '@/components/common/ProgressBar.vue'
import { formatStatValue } from '@/utils/formatter'
import {
  Map, ShoppingBag, Swords, Trophy, Package, Hammer, BookOpen,
  Shield, Zap, Wind, Flame, User, PawPrint, Warehouse
} from 'lucide-vue-next'

const { t } = useI18n()
const playerStore = usePlayerStore()
const { totalStats } = useStatsCalculator()

const player = computed(() => playerStore.player)

const DEFAULT_AVATAR = '/410b8a30918e18d94699ac150f54a10326742a586ab9a-d7WmO5.png'

const emit = defineEmits<{
  'open-panel': [panel: string]
}>()

const menuItems = [
  { id: 'character', icon: User, label: 'title.character' },
  { id: 'inventory', icon: Package, label: 'title.inventory' },
  { id: 'warehouse', icon: Warehouse, label: 'title.warehouse' },
  { id: 'skills', icon: Swords, label: 'title.skills' },
  { id: 'map', icon: Map, label: 'title.selectMap' },
  { id: 'shop', icon: ShoppingBag, label: 'title.shop' },
  { id: 'crafting', icon: Hammer, label: 'title.crafting' },
  { id: 'codex', icon: BookOpen, label: 'title.codex' },
  { id: 'pets', icon: PawPrint, label: 'title.pets' },
  { id: 'achievements', icon: Trophy, label: 'title.achievements' },
]

function classIcon(cls?: string) {
  if (cls === 'warrior') return '⚔️'
  if (cls === 'mage') return '🔮'
  return '🏹'
}

function openPanel(panelId: string) {
  emit('open-panel', panelId)
}
</script>

<template>
  <aside class="side-menu">
    <!-- 角色卡片 -->
    <div class="player-card">
      <div class="player-card-header">
        <img :src="player?.avatar || DEFAULT_AVATAR" :alt="player?.name" class="player-avatar" />
        <div class="player-card-info">
          <div class="player-card-name">{{ player?.name }}</div>
          <div class="player-card-class">
            <span>{{ classIcon(player?.class) }}</span>
            <span class="player-level">Lv.{{ player?.level }}</span>
          </div>
        </div>
      </div>

      <!-- HP/MP -->
      <div class="player-bars">
        <div class="bar-row">
          <span class="bar-label hp-label">HP</span>
          <div class="bar-track">
            <ProgressBar
              :current="player?.currentHp || 0"
              :max="Math.floor(totalStats.hp) || 1"
              variant="hp"
              :height="6"
              :show-text="false"
            />
          </div>
          <span class="bar-text">{{ Math.floor(player?.currentHp || 0) }}/{{ Math.floor(totalStats.hp) }}</span>
        </div>
        <div class="bar-row">
          <span class="bar-label mp-label">MP</span>
          <div class="bar-track">
            <ProgressBar
              :current="player?.currentMp || 0"
              :max="Math.floor(totalStats.mp) || 1"
              variant="mp"
              :height="6"
              :show-text="false"
            />
          </div>
          <span class="bar-text">{{ Math.floor(player?.currentMp || 0) }}/{{ Math.floor(totalStats.mp) }}</span>
        </div>
      </div>

      <!-- 属性（含装备加成） -->
      <div class="stats-grid">
        <div class="stat-item">
          <Swords :size="13" class="stat-icon" />
          <span class="stat-label">攻击</span>
          <span class="stat-value">{{ formatStatValue(totalStats.attack) }}</span>
        </div>
        <div class="stat-item">
          <Shield :size="13" class="stat-icon" />
          <span class="stat-label">防御</span>
          <span class="stat-value">{{ formatStatValue(totalStats.defense) }}</span>
        </div>
        <div class="stat-item">
          <Wind :size="13" class="stat-icon" />
          <span class="stat-label">速度</span>
          <span class="stat-value">{{ formatStatValue(totalStats.speed) }}</span>
        </div>
        <div class="stat-item">
          <Zap :size="13" class="stat-icon" />
          <span class="stat-label">暴击</span>
          <span class="stat-value">{{ formatStatValue(totalStats.critRate, true) }}</span>
        </div>
        <div class="stat-item">
          <Flame :size="13" class="stat-icon" />
          <span class="stat-label">暴伤</span>
          <span class="stat-value">{{ formatStatValue(totalStats.critDamage, true) }}</span>
        </div>
        <div class="stat-item">
          <Wind :size="13" class="stat-icon" />
          <span class="stat-label">闪避</span>
          <span class="stat-value">{{ formatStatValue(totalStats.dodge, true) }}</span>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-section-title">功能菜单</div>
      <div class="menu-list">
        <button
          v-for="item in menuItems"
          :key="item.id"
          class="menu-item"
          @click="openPanel(item.id)"
        >
          <component :is="item.icon" :size="17" class="menu-item-icon" />
          <span class="menu-item-label">{{ t(item.label) }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.side-menu {
  width: 260px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* 角色卡片 */
.player-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.player-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.player-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  border: 2px solid var(--accent-primary);
  flex-shrink: 0;
}

.player-card-info {
  min-width: 0;
}

.player-card-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-card-class {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.player-level {
  font-weight: 600;
  color: var(--accent-primary);
  background-color: var(--accent-muted);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

/* HP/MP 条 */
.player-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-color-light);
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bar-label {
  font-size: var(--text-xs);
  font-weight: 600;
  width: 20px;
  flex-shrink: 0;
  text-align: center;
}

.hp-label { color: var(--progress-hp); }
.mp-label { color: var(--progress-mp); }

.bar-track {
  flex: 1;
  min-width: 0;
}

.bar-text {
  font-size: 0.65rem;
  color: var(--text-muted);
  flex-shrink: 0;
  min-width: 60px;
  text-align: right;
}

/* 属性网格 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.stat-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.stat-label {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 600;
  margin-left: auto;
}

/* 菜单 */
.menu-section {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.menu-section-title {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color-light);
}

.menu-list {
  padding: var(--space-xs);
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-sm);
  border: none;
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-default);
  text-align: left;
  width: 100%;
}

.menu-item:hover {
  background-color: var(--accent-muted);
  color: var(--accent-primary);
}

.menu-item-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: color var(--duration-fast) var(--easing-default);
}

.menu-item:hover .menu-item-icon {
  color: var(--accent-primary);
}

.menu-item-label {
  font-weight: 500;
}
</style>
