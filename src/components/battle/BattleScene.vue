<script setup lang="ts">
/**
 * 战斗场景组件
 * 显示玩家卡片、怪物卡片、伤害飘字、战斗日志和战斗统计
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { usePetStore } from '@/stores/petStore'
import { useSharedBattleEngine } from '@/composables/useSharedBattleEngine'
import { getSmallMap } from '@/config/maps'
import { CharacterClass } from '@/types'
import type { DamageFloat as DamageFloatType } from '@/types'
import MonsterCard from './MonsterCard.vue'
import BattleLog from './BattleLog.vue'
import BattleStats from './BattleStats.vue'
import DamageFloat from './DamageFloat.vue'
import BuffIcon from './BuffIcon.vue'
import PetBattleCard from '@/components/pet/PetBattleCard.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import { BattleState } from '@/types'
import { generateId } from '@/utils/random'

const { t } = useI18n()
const gameStore = useGameStore()
const playerStore = usePlayerStore()

const DEFAULT_AVATAR = '/410b8a30918e18d94699ac150f54a10326742a586ab9a-d7WmO5.png'

// 获取共享战斗引擎实例
const battleEngine = useSharedBattleEngine()
const petStore = usePetStore()
const mergedPets = computed(() => petStore.mergedPets)

// 真实怪物列表（从战斗引擎获取）
const monsters = computed(() => battleEngine.monsters.value)

const isDead = computed(() => gameStore.isDead)
const isFighting = computed(() => gameStore.isFighting)
const respawnTimer = computed(() => gameStore.respawnTimer)

// ==================== 伤害飘字系统 ====================
const damageFloats = ref<DamageFloatType[]>([])

/** 添加伤害飘字 */
function addDamageFloat(data: Omit<DamageFloatType, 'id' | 'timestamp'>): string {
  const id = generateId()
  damageFloats.value.push({
    ...data,
    id,
    timestamp: Date.now()
  })
  // 1.2秒后清理
  setTimeout(() => {
    const idx = damageFloats.value.findIndex(f => f.id === id)
    if (idx !== -1) damageFloats.value.splice(idx, 1)
  }, 1200)
  return id
}

// 监听战斗日志中的伤害事件，自动生成飘字
watch(
  () => gameStore.battleLogs,
  (newLogs, oldLogs) => {
    if (!newLogs || newLogs.length === 0) return
    
    // 只处理新增的日志
    const oldLength = oldLogs ? oldLogs.length : 0
    const newLength = newLogs.length
    if (newLength <= oldLength) return
    
    // 处理所有新增的日志
    for (let i = oldLength; i < newLength; i++) {
      const log = newLogs[i]
      
      if (log.type === 'damage' && log.data) {
        const result = log.data as any
        const targetId = result.defenderId
        if (result.damage > 0) {
          addDamageFloat({
            value: result.damage,
            type: result.isCrit ? 'critical' : 'damage',
            isCrit: result.isCrit,
            targetId
          })
        } else if (result.isDodge || result.isMiss) {
          addDamageFloat({
            value: 0,
            type: 'dodge',
            targetId: result.defenderId
          })
        }
      }

      if (log.type === 'heal') {
        // 优先从 data 字段读取治疗数值
        if (log.data && log.data.value != null) {
          addDamageFloat({
            value: log.data.value,
            type: 'heal',
            targetId: log.data.targetId || playerStore.player?.id || ''
          })
        } else {
          // 兼容旧格式：从日志内容提取治疗数值
          const match = log.content.match(/恢复 (\d+)/)
          if (match) {
            addDamageFloat({
              value: parseInt(match[1]),
              type: 'heal',
              targetId: playerStore.player?.id || ''
            })
          }
        }
      }
    }
  },
  { deep: true }
)

// 玩家受到怪物攻击时也生成飘字（监听HP变化）
const processedLogIds = ref<Set<string>>(new Set())
watch(() => playerStore.player?.currentHp, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== undefined && newVal < oldVal) {
    // 找到最近的怪物攻击日志来确认来源
    const logs = gameStore.battleLogs
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].type === 'damage' && logs[i].content.includes('对你造成')) {
        if (processedLogIds.value.has(logs[i].id)) break
        processedLogIds.value.add(logs[i].id)
        const match = logs[i].content.match(/(\d+) 点伤害/)
        if (match) {
          addDamageFloat({
            value: parseInt(match[1]),
            type: 'damage',
            isCrit: false,
            targetId: playerStore.player?.id || ''
          })
        }
        break
      }
    }
  }
})

// 玩家卡片受击动画
const playerHit = ref(false)
watch(() => playerStore.player?.currentHp, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== undefined && newVal < oldVal) {
    playerHit.value = true
    setTimeout(() => { playerHit.value = false }, 300)
  }
})

// 玩家飘字（怪物攻击造成的伤害在玩家卡片上显示）
const playerFloats = computed(() =>
  damageFloats.value.filter(f => f.targetId === playerStore.player?.id)
)

// 职业图标
const classIcon = computed(() => {
  if (!playerStore.player) return '⚔️'
  const icons: Record<string, string> = {
    [CharacterClass.Warrior]: '⚔️',
    [CharacterClass.Mage]: '🧙',
    [CharacterClass.Ranger]: '🏹'
  }
  return icons[playerStore.player.class] || '⚔️'
})

// Buff列表（使用buffManager获取完整buff信息）
const activeBuffs = computed(() => {
  if (!playerStore.player) return []
  return battleEngine.buffManager.getBuffs(playerStore.player.id)
})

// 日志面板状态
const logHeight = ref(150)
const logCollapsed = ref(false)
const isResizing = ref(false)

/** 开始拉伸日志面板 */
function startResize(event: MouseEvent) {
  isResizing.value = true
  const startY = event.clientY
  const startHeight = logHeight.value

  function onMouseMove(e: MouseEvent) {
    const delta = startY - e.clientY
    logHeight.value = Math.max(60, Math.min(400, startHeight + delta))
  }

  function onMouseUp() {
    isResizing.value = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// 当前地图信息
const currentMapName = computed(() => {
  if (!gameStore.currentMapId) return ''
  const map = getSmallMap(gameStore.currentMapId)
  return map ? map.name : gameStore.currentMapId
})

// 组件挂载时自动进入第一个地图
onMounted(() => {
  if (playerStore.hasPlayer && gameStore.battleState === BattleState.Idle) {
    battleEngine.enterMap('village_1', 'village')
  }
})

// 监听玩家复活后继续战斗
watch(isDead, (dead) => {
  if (!dead && gameStore.respawnTimer <= 0) {
    battleEngine.respawn()
  }
})

// 玩家属性（取自 playerEntity，包含合体宠物加成和buff加成）
const playerStats = computed(() => {
  const entity = battleEngine.playerEntity.value
  if (!entity) return null
  return {
    hp: Math.floor(entity.currentHp),
    maxHp: Math.floor(entity.maxHp),
    mp: Math.floor(entity.currentMp),
    maxMp: Math.floor(entity.maxMp),
    attack: Math.floor(entity.attack),
    defense: Math.floor(entity.defense),
    speed: Math.floor(entity.speed),
    critRate: Math.floor(entity.critRate * 100),
    dodge: Math.floor(entity.dodge * 100)
  }
})
</script>

<template>
  <div class="battle-scene h-100 d-flex flex-column">
    <!-- 地图信息栏 -->
    <div v-if="isFighting" class="map-info-bar d-flex align-items-center px-3 py-2 border-bottom">
      <span class="badge bg-success me-2">{{ t('battle.fighting') }}</span>
      <span class="text-secondary">
        {{ currentMapName }} - {{ t('battle.monsterCount', { count: monsters.length }) }}
      </span>
    </div>

    <!-- 空闲状态提示 -->
    <div v-else-if="!isDead" class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="text-center text-muted">
        <p>{{ t('battle.idle') }}</p>
      </div>
    </div>

    <!-- 战斗统计（右上角） -->
    <BattleStats v-if="isFighting" class="battle-stats-overlay" />

    <!-- 战斗区域：玩家 + 怪物 -->
    <div class="battle-area flex-grow-1 p-3">
      <div v-if="isFighting && playerStats" class="battle-grid">
        <!-- 玩家卡片（居中上方） -->
        <div class="player-card-area">
          <div 
            class="player-card card"
            :class="{ 'hit-shake': playerHit }"
          >
            <!-- 玩家伤害飘字层 -->
            <div class="float-layer">
              <DamageFloat
                v-for="float in playerFloats"
                :key="float.id"
                :data="float"
              />
            </div>

            <div class="card-body p-1">
              <div class="player-header mb-1">
                <img :src="playerStore.player?.avatar || DEFAULT_AVATAR" :alt="playerStore.player?.name" class="player-avatar" />
                <!-- <div class="player-icon">{{ classIcon }}</div> -->
                <div class="player-info">
                  <div class="d-flex align-items-center gap-2">
                    <span class="player-name">{{ playerStore.player?.name }}</span>
                    <span class="badge bg-primary">Lv.{{ playerStore.player?.level }}</span>
                  </div>
                  <small class="text-muted">{{ playerStore.player?.class }}</small>
                </div>
              </div>

              <!-- HP -->
              <div class="bar-row">
                <span class="bar-label">HP</span>
                <ProgressBar 
                  :current="playerStats.hp"
                  :max="playerStats.maxHp"
                  variant="hp"
                  :height="10"
                />
              </div>

              <!-- MP -->
              <div class="bar-row">
                <span class="bar-label">MP</span>
                <ProgressBar 
                  :current="playerStats.mp"
                  :max="playerStats.maxMp"
                  variant="mp"
                  :height="10"
                />
              </div>

              <!-- 属性摘要 -->
              <div class="player-stats-summary">
                <span title="攻击">⚔️{{ playerStats.attack }}</span>
                <span title="防御">🛡️{{ playerStats.defense }}</span>
                <span title="速度">💨{{ playerStats.speed }}</span>
                <span title="暴击率">💥{{ playerStats.critRate }}%</span>
                <span title="闪避率">🏃{{ playerStats.dodge }}%</span>
              </div>

      <!-- Buff图标列表（始终保留一行占位，防止buff出现/消失时卡片高度跳动） -->
      <div class="buff-icons-row">
        <template v-if="activeBuffs.length > 0">
          <BuffIcon
            v-for="buff in activeBuffs"
            :key="buff.id"
            :buff="buff"
            :size="28"
          />
        </template>
        <span v-else class="buff-placeholder">&nbsp;</span>
      </div>

              <!-- 合体宠物列表 -->
              <div v-if="mergedPets.length > 0" class="merged-pet-bar">
                <div v-for="mp in mergedPets" :key="mp.id" class="merged-pet-item">
                  <span class="merged-pet-icon">{{ mp.icon }}</span>
                  <span class="merged-pet-name">{{ mp.name }}</span>
                  <button class="merged-pet-cancel" @click="petStore.unmergeSinglePet(mp.id)">取消</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 出战宠物卡片 -->
        <PetBattleCard />

        <!-- VS -->
        <div class="vs-divider">VS</div>

        <!-- 怪物网格 -->
        <div class="monsters-area">
          <div v-if="monsters.length > 0" class="monsters-grid">
            <MonsterCard
              v-for="monster in monsters"
              :key="monster.id"
              :monster="monster"
              :damage-floats="damageFloats"
            />
          </div>
          <div v-else class="text-center text-muted mt-4">
            <p>{{ t('battle.waitingMonsters') }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="isFighting" class="text-center text-muted mt-5">
        <p>{{ t('battle.waitingMonsters') }}</p>
      </div>
    </div>

    <!-- 死亡遮罩 -->
    <div v-if="isDead" class="death-overlay">
      <div class="death-content text-center">
        <h2 class="text-danger mb-3">{{ t('battle.dead') }}</h2>
        <p class="text-muted">{{ t('battle.respawnIn') }} {{ respawnTimer }} {{ t('common.second') }}</p>
      </div>
    </div>

    <!-- 战斗日志（底部，可拉伸、可隐藏） -->
    <template v-if="!logCollapsed">
      <div
        class="log-resize-handle"
        :class="{ active: isResizing }"
        @mousedown="startResize"
      >
        <div class="resize-bar"></div>
      </div>
      <div class="battle-log-area" :style="{ height: logHeight + 'px' }">
        <BattleLog />
      </div>
    </template>

    <!-- 日志切换按钮 -->
    <div
      class="log-toggle text-center py-1 border-top"
      @click="logCollapsed = !logCollapsed"
    >
      <small class="text-muted" style="cursor: pointer; user-select: none;">
        {{ logCollapsed ? '▲ 显示日志' : '▼ 隐藏日志' }}
      </small>
    </div>
  </div>
</template>

<style scoped>
.battle-scene {
  position: relative;
  background-color: var(--bg-primary);
}

.battle-stats-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.map-info-bar {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
}

/* 战斗网格：玩家在上，怪物在下 */
.battle-area {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
}

.battle-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 1000px;
  width: 100%;
}

/* 玩家卡片 */
.player-card-area {
  width: 100%;
  max-width: 360px;
}

.player-card {
  background-color: var(--bg-card);
  border: 1px solid var(--accent-primary);
  transition: all var(--duration-normal) var(--easing-default);
  position: relative;
  overflow: hidden;
}

.player-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  object-fit: cover;
  border: 2px solid var(--accent-primary);
  flex-shrink: 0;
}


/* 玩家受击抖动 */
.player-card.hit-shake {
  animation: hitShake 0.3s ease-out;
}

@keyframes hitShake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-4px); box-shadow: 0 0 15px rgba(239, 68, 68, 0.5); }
  30% { transform: translateX(4px); }
  45% { transform: translateX(-3px); }
  60% { transform: translateX(3px); }
  75% { transform: translateX(-1px); }
}

.float-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-icon {
  font-size: 1.75rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: 600;
  color: var(--accent-primary);
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
}

.bar-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  width: 22px;
  flex-shrink: 0;
}

.player-stats-summary {
  display: flex;
  gap: 3px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.player-stats-summary span {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
}

.buff-icons-row {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  flex-wrap: wrap;
  align-items: center;
  min-height: 28px;
}

.buff-placeholder {
  visibility: hidden;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

/* 合体宠物条 */
.merged-pet-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
}

.merged-pet-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(245, 158, 11, 0.08));
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: var(--radius-sm);
}

.merged-pet-icon { font-size: 1.1rem; }

.merged-pet-name {
  font-size: var(--text-xs);
  font-weight: 600;
  color: #A78BFA;
}

.merged-pet-label {
  font-size: 0.6rem;
  padding: 1px 5px;
  border-radius: var(--radius-full);
  background: rgba(139, 92, 246, 0.15);
  color: #8B5CF6;
}

.merged-pet-cancel {
  margin-left: auto;
  font-size: 0.6rem;
  padding: 1px 6px;
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: var(--radius-sm);
  background: transparent;
  color: #A78BFA;
  cursor: pointer;
  transition: all 0.15s;
}
.merged-pet-cancel:hover { background: rgba(139, 92, 246, 0.15); }

/* VS 分隔线 */
.vs-divider {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-secondary);
  opacity: 0.3;
  padding: 4px 0;
  letter-spacing: 8px;
}

/* 怪物区域 */
.monsters-area {
  width: 100%;
}

.monsters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.death-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.death-content {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.battle-log-area {
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  flex-shrink: 0;
}

.log-resize-handle {
  height: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.log-resize-handle:hover,
.log-resize-handle.active {
  background-color: var(--accent-primary);
}

.resize-bar {
  width: 40px;
  height: 3px;
  border-radius: 2px;
  background-color: var(--text-secondary);
  opacity: 0.5;
}

.log-toggle {
  background-color: var(--bg-secondary);
  flex-shrink: 0;
}
</style>
