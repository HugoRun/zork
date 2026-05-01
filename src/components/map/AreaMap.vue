<script setup lang="ts">
/**
 * 区域地图组件
 * 展示某区域下的小地图列表，含怪物和掉落详情
 */
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import { useSharedBattleEngine } from '@/composables/useSharedBattleEngine'
import { getArea } from '@/config/maps'
import { getMapMonsterTemplates } from '@/config/monsters'
import { getItemTemplate } from '@/config/shop'
import { getEquipmentTemplate } from '@/config/equipment'
import { MonsterTitle, Quality, Element } from '@/types'
import type { MonsterTemplate, DropEntry } from '@/types'

const props = defineProps<{ areaId: string }>()

const emit = defineEmits<{ 'go-back': [] }>()

const playerStore = usePlayerStore()
const gameStore = useGameStore()
const battleEngine = useSharedBattleEngine()

const playerLevel = computed(() => playerStore.player?.level || 1)
const area = computed(() => getArea(props.areaId))

const expandedMapId = ref<string | null>(null)
const selectedMonster = ref<MonsterTemplate | null>(null)

function toggleMap(mapId: string) {
  if (expandedMapId.value === mapId) {
    expandedMapId.value = null
    selectedMonster.value = null
  } else {
    expandedMapId.value = mapId
    selectedMonster.value = null
  }
}

function isCurrentMap(mapId: string): boolean {
  return gameStore.currentMapId === mapId
}

function enterMap(mapId: string) {
  battleEngine.enterMap(mapId, props.areaId)
}

function isUnlocked(map: any): boolean {
  return playerLevel.value >= map.unlockLevel
}

function isLevelAppropriate(map: any): boolean {
  return playerLevel.value >= map.levelRange[0] && playerLevel.value <= map.levelRange[1] + 5
}

function getItemName(itemId: string): string {
  return getItemTemplate(itemId)?.name || getEquipmentTemplate(itemId)?.name || itemId
}

function getItemQuality(itemId: string): Quality | undefined {
  return getItemTemplate(itemId)?.quality || getEquipmentTemplate(itemId)?.baseQuality
}

function qualityColor(quality?: Quality): string {
  if (!quality) return ''
  const c: Record<string, string> = {
    [Quality.Common]: '#9ca3af', [Quality.Uncommon]: '#22c55e',
    [Quality.Rare]: '#3b82f6', [Quality.Epic]: '#a855f7', [Quality.Legendary]: '#f59e0b'
  }
  return c[quality] || ''
}

function formatDropRate(rate: number): string {
  return Math.floor(rate * 100) + '%'
}

function dropRateColor(rate: number): string {
  if (rate >= 0.3) return '#22c55e'
  if (rate >= 0.15) return '#3b82f6'
  if (rate >= 0.05) return '#a855f7'
  return '#f59e0b'
}

function elementIcon(el: Element): string {
  const m: Record<string, string> = {
    [Element.Physical]: '⚔️', [Element.Fire]: '🔥',
    [Element.Ice]: '❄️', [Element.Poison]: '☠️', [Element.Lightning]: '⚡',
  }
  return m[el] || ''
}

/** 默认怪物形象 */
const DEFAULT_MONSTER_IMAGE = '/410b8a30918e18d94699ac150f54a10326742a586ab9a-d7WmO5.png'

/** 获取怪物形象 */
function getMonsterImage(monster: MonsterTemplate): string {
  return monster.image || DEFAULT_MONSTER_IMAGE
}

const areaGradients: Record<string, string> = {
  village: 'linear-gradient(135deg, #4a7c59, #6b8f71)',
  forest: 'linear-gradient(135deg, #2d5a27, #3d7a37)',
  canyon: 'linear-gradient(135deg, #8b2500, #cd6600)',
  fortress: 'linear-gradient(135deg, #1a3a5c, #2e5a8a)',
  dragon: 'linear-gradient(135deg, #4a0080, #8b0000)',
}
</script>

<template>
  <div v-if="area" class="area-map">
    <!-- 区域头部 -->
    <div class="area-header" :style="{ background: areaGradients[area.id] || areaGradients.village }">
      <button class="back-btn" @click="emit('go-back')">
        &#8592; 返回
      </button>
      <div class="area-header-content">
        <h4 class="mb-1">{{ area.name }}</h4>
        <div class="area-meta">
          <span class="meta-tag">Lv.{{ area.levelRange[0] }}-{{ area.levelRange[1] }}</span>
          <span class="meta-divider">|</span>
          <span>{{ area.maps.length }} 个地图</span>
          <span class="meta-divider">|</span>
          <span>{{ area.description }}</span>
        </div>
      </div>
    </div>

    <!-- 地图列表 -->
    <div class="maps-list">
      <div
        v-for="(map, idx) in area.maps"
        :key="map.id"
        class="map-card"
        :class="{
          'current': isCurrentMap(map.id),
          'locked': !isUnlocked(map),
          'appropriate': isUnlocked(map) && isLevelAppropriate(map),
          'expanded': expandedMapId === map.id
        }"
        :style="{ animationDelay: idx * 0.08 + 's' }"
      >
        <!-- 卡片头部 -->
        <div class="map-card-header" @click="isUnlocked(map) && toggleMap(map.id)">
          <div class="map-index">{{ idx + 1 }}</div>
          <div class="map-info">
            <div class="map-title">
              {{ map.name }}
              <span v-if="isCurrentMap(map.id)" class="current-tag">当前</span>
              <span v-if="isLevelAppropriate(map) && isUnlocked(map)" class="recommend-tag">推荐</span>
            </div>
            <div class="map-subtitle">
              <span>Lv.{{ map.levelRange[0] }}-{{ map.levelRange[1] }}</span>
              <span v-if="!isUnlocked(map)" class="lock-hint">&#128274; Lv.{{ map.unlockLevel }} 解锁</span>
            </div>
          </div>
          <div class="map-chevron">
            {{ expandedMapId === map.id ? '&#9650;' : '&#9660;' }}
          </div>
        </div>

        <!-- 怪物预览 -->
        <div
          v-if="expandedMapId === map.id"
          class="map-card-body"
        >
          <!-- 怪物列表 -->
          <div class="monster-list">
            <div
              v-for="(mt, mi) in getMapMonsterTemplates(map.monsterIds)"
              :key="mt.id"
              class="monster-item"
              :class="{ 'monster-selected': selectedMonster?.id === mt.id }"
            >
              <!-- 怪物头部 -->
              <div class="monster-header" @click="selectedMonster = selectedMonster?.id === mt.id ? null : mt">
                  <img :src="getMonsterImage(mt)" :alt="mt.name" class="monster-icon" />
                  <div class="monster-name-row">
                  <span class="monster-name">{{ mt.name }}</span>
                  <span class="monster-lv">Lv.{{ mt.level }}</span>
                </div>
                <div class="monster-multipliers">
                  <span class="multi elite-multi">精英 &#215;{{ mt.eliteMultiplier }}</span>
                  <span class="multi lord-multi">领主 &#215;{{ mt.lordMultiplier }}</span>
                </div>
                <span class="expand-arrow">{{ selectedMonster?.id === mt.id ? '&#9650;' : '&#9660;' }}</span>
              </div>

              <!-- 怪物属性 -->
              <div class="monster-stats">
                <span>&#10084; {{ Math.floor(mt.baseStats.hp) }}</span>
                <span>&#9876; {{ Math.floor(mt.baseStats.attack) }}</span>
                <span>&#128737; {{ Math.floor(mt.baseStats.defense) }}</span>
                <span>&#128168; {{ Math.floor(mt.baseStats.speed) }}</span>
                <span class="stat-exp">&#9733; {{ Math.floor(mt.baseStats.expReward) }}</span>
              </div>

              <!-- 掉落详情 -->
              <div v-if="selectedMonster?.id === mt.id" class="drop-panel">
                <div class="drop-title">掉落物品</div>
                <div v-for="(drop, di) in mt.dropTable" :key="di" class="drop-row">
                  <span class="drop-rate" :style="{ color: dropRateColor(drop.dropRate) }">
                    {{ formatDropRate(drop.dropRate) }}
                  </span>
                  <span class="drop-name" :style="{ color: qualityColor(getItemQuality(drop.itemId)) }">
                    {{ getItemName(drop.itemId) }}
                  </span>
                  <span v-if="drop.minQuantity > 1 || drop.maxQuantity > 1" class="drop-qty">
                    &times;{{ drop.minQuantity }}-{{ drop.maxQuantity }}
                  </span>
                  <span v-if="drop.titleRestriction?.length" class="drop-restriction">
                    {{ drop.titleRestriction.map(t => t === MonsterTitle.Elite ? '精英' : '领主').join('/') }}
                  </span>
                </div>
                <div v-if="!mt.dropTable.length" class="no-drop">无掉落</div>
              </div>
            </div>
          </div>

          <!-- 进入按钮 -->
          <button
            class="enter-btn"
            :class="{ 'entering': isCurrentMap(map.id) }"
            :disabled="!isUnlocked(map)"
            @click="enterMap(map.id)"
          >
            {{ isCurrentMap(map.id) ? '&#9679; 当前地图' : '&#9654; 进入探索' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 掉率图例 -->
    <div class="drop-legend">
      <span class="legend-title">掉率：</span>
      <span class="legend-item" style="color: #22c55e;">&#9679; 常见 &#8805;30%</span>
      <span class="legend-item" style="color: #3b82f6;">&#9679; 普通 15-29%</span>
      <span class="legend-item" style="color: #a855f7;">&#9679; 稀有 5-14%</span>
      <span class="legend-item" style="color: #f59e0b;">&#9679; 极稀有 &lt;5%</span>
    </div>
  </div>
</template>

<style scoped>
.area-map {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 区域头部 */
.area-header {
  border-radius: 12px;
  padding: 16px;
  color: white;
  position: relative;
  overflow: hidden;
}

.area-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.2);
}

.area-header > * {
  position: relative;
  z-index: 1;
}

.back-btn {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  margin-bottom: 8px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255,255,255,0.25);
}

.area-header-content h4 {
  font-weight: 700;
  margin-bottom: 2px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.area-meta {
  font-size: 0.72rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-tag {
  background: rgba(255,255,255,0.2);
  padding: 1px 8px;
  border-radius: 8px;
  font-weight: 600;
}

.meta-divider {
  opacity: 0.5;
}

/* 地图列表 */
.maps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.25s;
  animation: slideUp 0.4s ease-out both;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.map-card.current {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 1px var(--accent-primary), 0 2px 8px rgba(0,0,0,0.1);
}

.map-card.locked {
  opacity: 0.5;
}

.map-card.appropriate:not(.locked) {
  border-left: 3px solid #22c55e;
}

.map-card-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.map-card-header:hover {
  background: var(--bg-secondary, rgba(0,0,0,0.03));
}

.map-index {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--bg-secondary, #f0f0f0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
  margin-right: 10px;
}

.map-card.current .map-index {
  background: var(--accent-primary);
  color: white;
}

.map-info {
  flex: 1;
  min-width: 0;
}

.map-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.current-tag {
  font-size: 0.55rem;
  padding: 0px 6px;
  border-radius: 8px;
  background: var(--accent-primary);
  color: white;
  font-weight: 600;
}

.recommend-tag {
  font-size: 0.55rem;
  padding: 0px 6px;
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  font-weight: 600;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.map-subtitle {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 1px;
}

.lock-hint {
  color: var(--text-secondary);
  margin-left: 6px;
}

.map-chevron {
  font-size: 0.65rem;
  color: var(--text-secondary);
  margin-left: 8px;
}

/* 展开区域 */
.map-card-body {
  padding: 0 12px 12px;
  border-top: 1px solid var(--border-color);
  animation: expandIn 0.2s ease-out;
}

@keyframes expandIn {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 600px; }
}

/* 怪物列表 */
.monster-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.monster-item {
  background: var(--bg-secondary, rgba(0,0,0,0.02));
  border: 1px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.monster-selected {
  border-color: var(--accent-primary);
}

.monster-header {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  gap: 8px;
}

.monster-header:hover {
  background: rgba(0,0,0,0.03);
}

.monster-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color-light);
}

.monster-name-row {
  flex: 1;
  min-width: 0;
}

.monster-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.monster-lv {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-left: 6px;
}

.monster-multipliers {
  display: flex;
  gap: 4px;
}

.multi {
  font-size: 0.58rem;
  padding: 0px 5px;
  border-radius: 6px;
  font-weight: 600;
}

.elite-multi {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.lord-multi {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.expand-arrow {
  font-size: 0.55rem;
  color: var(--text-secondary);
}

.monster-stats {
  display: flex;
  gap: 8px;
  padding: 2px 8px 6px;
  font-size: 0.65rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.stat-exp {
  color: var(--accent-primary);
  font-weight: 600;
}

/* 掉落面板 */
.drop-panel {
  background: rgba(0,0,0,0.02);
  border-top: 1px solid var(--border-color);
  padding: 8px;
  margin-top: 2px;
  animation: dropFadeIn 0.2s ease-out;
}

@keyframes dropFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.drop-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px dashed var(--border-color);
}

.drop-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  font-size: 0.72rem;
}

.drop-rate {
  font-weight: 700;
  min-width: 32px;
  text-align: right;
  font-size: 0.68rem;
}

.drop-name {
  font-weight: 500;
}

.drop-qty {
  color: var(--text-secondary);
  font-size: 0.65rem;
}

.drop-restriction {
  font-size: 0.55rem;
  padding: 0px 5px;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  font-weight: 600;
}

.no-drop {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 4px;
}

/* 进入按钮 */
.enter-btn {
  margin-top: 10px;
  width: 100%;
  padding: 7px;
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.08);
  color: #22c55e;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.enter-btn:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.15);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
}

.enter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.enter-btn.entering {
  border-color: var(--border-color);
  background: var(--bg-secondary, rgba(0,0,0,0.05));
  color: var(--text-secondary);
}

/* 掉率图例 */
.drop-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary, rgba(0,0,0,0.02));
  border-radius: 8px;
  font-size: 0.65rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.legend-title {
  font-weight: 600;
  color: var(--text-primary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 2px;
}
</style>
