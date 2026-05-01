<script setup lang="ts">
/**
 * 怪物卡片组件
 * 支持受击动画、伤害飘字和掉落信息查看
 * 怪物死亡后灰色显示，直到下一波刷新
 */
import { ref, watch, computed } from 'vue'
import type { Monster } from '@/types'
import type { DamageFloat as DamageFloatType } from '@/types'
import { MonsterTitle, Quality } from '@/types'
import { getMonsterTemplate } from '@/config/monsters'
import { getItemTemplate } from '@/config/shop'
import { getEquipmentTemplate } from '@/config/equipment'
import QualityBadge from '@/components/common/QualityBadge.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import BuffIcon from './BuffIcon.vue'
import { useSharedBattleEngine } from '@/composables/useSharedBattleEngine'

interface Props {
  monster: Monster
  damageFloats?: DamageFloatType[]
}

const props = withDefaults(defineProps<Props>(), {
  damageFloats: () => []
})

const isHit = ref(false)
const showDrops = ref(false)

const hpPercent = computed(() => {
  if (props.monster.maxHp <= 0) return 0
  return Math.min(100, Math.max(0, (props.monster.currentHp / props.monster.maxHp) * 100))
})

const isElite = computed(() => props.monster.title === MonsterTitle.Elite)
const isLord = computed(() => props.monster.title === MonsterTitle.Lord)

/** 是否已死亡（引擎标记的灰色显示状态） */
const isDead = computed(() => !!props.monster.isDead)

const isLowHp = computed(() => hpPercent.value > 0 && hpPercent.value <= 30 && !isDead.value)

/** 怪物模板（用于掉落表） */
const template = computed(() => getMonsterTemplate(props.monster.templateId))

/** 默认怪物形象 */
const DEFAULT_MONSTER_IMAGE = '/410b8a30918e18d94699ac150f54a10326742a586ab9a-d7WmO5.png'

/** 获取怪物形象 */
const monsterImage = computed(() => {
  return template.value?.image || DEFAULT_MONSTER_IMAGE
})

/** 获取物品名称 */
function getItemName(itemId: string): string {
  const item = getItemTemplate(itemId) || getEquipmentTemplate(itemId)
  return item?.name || itemId
}

/** 获取物品品质 */
function getItemQuality(itemId: string): Quality | undefined {
  const item = getItemTemplate(itemId) || getEquipmentTemplate(itemId)
  return item?.quality
}

/** 品质颜色 */
function qualityColor(quality?: Quality): string {
  if (!quality) return ''
  const colors: Record<string, string> = {
    [Quality.Common]: '#9ca3af',
    [Quality.Uncommon]: '#22c55e',
    [Quality.Rare]: '#3b82f6',
    [Quality.Epic]: '#a855f7',
    [Quality.Legendary]: '#f59e0b'
  }
  return colors[quality] || ''
}

/** 格式化掉率 */
function formatDropRate(rate: number): string {
  return Math.floor(rate * 100) + '%'
}

/** 掉率颜色 */
function dropRateColor(rate: number): string {
  if (rate >= 0.3) return '#22c55e'
  if (rate >= 0.15) return '#3b82f6'
  if (rate >= 0.05) return '#a855f7'
  return '#f59e0b'
}

// 监听血量变化触发受击动画（只对未死亡的怪物）)
watch(() => props.monster.currentHp, (newVal, oldVal) => {
  if (props.monster.isDead) return
  if (oldVal !== undefined && newVal < oldVal) {
    isHit.value = true
    setTimeout(() => { isHit.value = false }, 300)
  }
})

/** 当前卡片的伤害飘字 */
const cardFloats = computed(() =>
  props.damageFloats.filter(f => f.targetId === props.monster.id)
)

/** 怪物身上的buff列表（死亡后不显示buff） */
const battleEngine = useSharedBattleEngine()
const monsterBuffs = computed(() =>
  props.monster.isDead ? [] : battleEngine.buffManager.getBuffs(props.monster.id)
)
</script>

<template>
    <div 
    class="monster-card card"
    :class="{ 
      'elite-border': isElite && !isDead,
      'lord-glow': isLord && !isDead,
      'hit-shake': isHit && !isDead,
      'monster-dead': isDead
    }"
  >
      <!-- 死亡灰色遮罩 -->
      <div v-if="isDead" class="dead-overlay">
        <div class="dead-text">💀 已击杀</div>
      </div>
    <!-- 伤害飘字层 -->
    <div class="float-layer">
      <DamageFloat
        v-for="float in cardFloats"
        :key="float.id"
        :data="float"
      />
    </div>

    <div class="card-body p-1">
      <!-- 怪物图标和名称 -->
      <div class="monster-header mb-1">
        <img :src="monsterImage" :alt="monster.name" class="monster-icon" />
        <div class="monster-info">
          <div class="d-flex align-items-center gap-2">
            <span class="monster-name">{{ monster.name }}</span>
            <QualityBadge :title="monster.title" :glow="isLord" />
          </div>
          <div class="monster-meta">
            <small class="text-muted">Lv.{{ monster.level }}</small>
          </div>
        </div>
      </div>
      
      <!-- 血条 -->
      <div class="bar-row">
        <span class="bar-label hp-label">HP</span>
        <ProgressBar 
          :current="Math.max(0, Math.floor(monster.currentHp))"
          :max="Math.floor(monster.maxHp)"
          variant="hp"
          :height="10"
        />
      </div>

    <!-- Buff图标列表（始终保留一行占位，防止buff出现/消失时卡片高度跳动） -->
    <div class="buff-icons-row">
      <template v-if="monsterBuffs.length > 0">
        <BuffIcon
          v-for="buff in monsterBuffs"
          :key="buff.id"
          :buff="buff"
          :size="24"
        />
      </template>
      <span v-else class="buff-placeholder">&nbsp;</span>
    </div>

      <!-- 掉落信息 -->
      <div v-if="template?.dropTable?.length" class="drop-toggle mt-1 text-end">
        <button
          class="drop-btn"
          @click.stop="showDrops = !showDrops"
        >
          {{ showDrops ? '▲ 收起掉落' : '▼ 查看掉落' }}
        </button>
      </div>

      <!-- 掉落列表弹窗 -->
      <div
        v-if="showDrops && template?.dropTable?.length"
        class="drop-popup mt-1 p-2 rounded border"
        style="background-color: var(--bg-secondary, #f8f9fa); z-index: 20;"
        @click.stop
      >
        <div class="small fw-bold mb-1" style="font-size: 0.7rem;">掉落物品：</div>
        <div
          v-for="(drop, di) in template.dropTable"
          :key="di"
          class="d-flex align-items-center mb-1"
          style="font-size: 0.7rem;"
        >
          <span
            class="me-2"
            :style="{
              color: dropRateColor(drop.dropRate),
              fontWeight: 'bold',
              minWidth: '36px',
              textAlign: 'right'
            }"
          >{{ formatDropRate(drop.dropRate) }}</span>
          <span :style="{ color: qualityColor(getItemQuality(drop.itemId)) }">
            {{ getItemName(drop.itemId) }}
          </span>
          <span v-if="drop.minQuantity > 1 || drop.maxQuantity > 1" class="text-muted ms-1">
            ({{ drop.minQuantity }}-{{ drop.maxQuantity }})
          </span>
          <span
            v-if="drop.titleRestriction?.length"
            class="ms-1 badge bg-warning text-dark"
            style="font-size: 0.55rem;"
          >
            {{ drop.titleRestriction.map(t => t === MonsterTitle.Elite ? '精英' : '领主').join('/') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DamageFloat from './DamageFloat.vue'
</script>

<style scoped>
.monster-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--easing-default);
  position: relative;
  overflow: hidden;
}

.monster-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 受击抖动动画 */
.hit-shake {
  animation: hitShake 0.3s ease-out;
}

@keyframes hitShake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-4px); background-color: rgba(239, 68, 68, 0.15); }
  30% { transform: translateX(4px); }
  45% { transform: translateX(-3px); }
  60% { transform: translateX(3px); }
  75% { transform: translateX(-1px); }
}

/* 死亡灰色遮罩 */
.monster-dead {
  filter: grayscale(40%) brightness(0.8);
  pointer-events: none;
  position: relative;
  border:  1px solid #3b3535ce;
  box-sizing: border-box;
  border-radius: 10px;
}

.dead-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  z-index: 5;
  pointer-events: none;
}

.dead-text {
  background: rgba(0, 0, 0, 0.4);
  color: #FFF;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 1px;
}

/* 伤害飘字层 */
.float-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.monster-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.monster-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
  flex-shrink: 0;
}

.monster-info {
  flex: 1;
}

.monster-name {
  font-weight: 600;
  color: var(--text-primary);
}

.elite-border {
  border: 2px solid var(--title-elite, #F59E0B);
}

.lord-glow {
  box-shadow: 0 0 0 2px var(--title-lord, #EF4444);
}

.buff-icons-row {
  display: flex;
  gap: 3px;
  margin-top: 4px;
  flex-wrap: wrap;
  align-items: center;
  min-height: 24px;
}

.buff-placeholder {
  visibility: hidden;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
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

.hp-label {
  color: #EF4444;
}

.monster-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 1px;
}

.drop-btn {
  font-size: 0.65rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  text-decoration: none;
  transition: color 0.15s;
}
.drop-btn:hover {
  color: var(--accent-primary);
}
</style>
