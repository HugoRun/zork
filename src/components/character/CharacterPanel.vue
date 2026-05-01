<script setup lang="ts">
/**
 * 角色信息面板组件
 * 展示角色基础信息、HP/MP、装备栏
 */
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useStatsCalculator } from '@/composables/useStatsCalculator'
import { formatStatValue, formatNumber } from '@/utils/formatter'
import { getClassAdvancement, getNextTierConfig, MAX_ADVANCEMENT_TIER } from '@/config/classAdvancement'
import { getSkillConfig } from '@/config/skills'
import AttributeList from './AttributeList.vue'
import EquipmentSlots from './EquipmentSlots.vue'

const playerStore = usePlayerStore()
const { totalStats, combatPower } = useStatsCalculator()

const player = computed(() => playerStore.player)

const playerTier = computed(() => player.value?.advancementTier || 1)

/** 职业进阶配置 */
const advancement = computed(() => {
  if (!player.value) return null
  return getClassAdvancement(player.value.class)
})

/** 下一阶信息 */
const nextTier = computed(() => playerStore.nextTierConfig)

/** 当前选中的进阶层（用于预览），null表示默认显示下一阶 */
const selectedTierNum = ref<number | null>(null)

/** 当前要显示预览的目标阶：优先显示选中的阶，否则显示下一阶 */
const previewTier = computed(() => {
  if (selectedTierNum.value !== null && advancement.value) {
    return advancement.value.tiers[selectedTierNum.value - 1] || null
  }
  return nextTier.value
})

/** 是否可以进阶 */
const canAdvance = computed(() => {
  if (!player.value || !nextTier.value) return false
  return player.value.level >= nextTier.value.requiredLevel && player.value.gold >= nextTier.value.goldCost
})

/** 进阶提示文本 */
const advanceHint = computed(() => {
  if (!player.value || !nextTier.value) return ''
  const parts: string[] = []
  if (player.value.level < nextTier.value.requiredLevel) {
    parts.push(`需要 Lv.${nextTier.value.requiredLevel}`)
  }
  if (player.value.gold < nextTier.value.goldCost) {
    parts.push(`需要 ${nextTier.value.goldCost} 金币`)
  }
  return parts.join('，')
})

/** 属性名称映射 */
const STAT_NAMES: Record<string, string> = {
  hp: '生命', mp: '法力', attack: '攻击', defense: '防御',
  magicAttack: '魔攻', magicDefense: '魔防', speed: '速度',
  critRate: '暴击率', critDamage: '暴击伤害', dodge: '闪避'
}

/** 点击进阶节点 */
function handleTierClick(tierNum: number) {
  if (tierNum <= playerTier) {
    // 已解锁的阶，点击预览该阶
    selectedTierNum.value = selectedTierNum.value === tierNum ? null : tierNum
  } else if (tierNum === playerTier + 1) {
    // 下一阶，点击预览
    selectedTierNum.value = selectedTierNum.value === tierNum ? null : tierNum
  }
  // 未解锁的更高阶不可点击
}

function handleAdvance() {
  playerStore.advanceClass()
}

/** 经验进度百分比 */
const expPercent = computed(() => {
  if (!player.value) return 0
  const needed = playerStore.getExpForLevel(player.value.level)
  return Math.floor((player.value.exp / needed) * 100)
})

/** 职业名称 */
const className = computed(() => {
  const map: Record<string, string> = {
    warrior: '战士',
    mage: '法师',
    ranger: '游侠'
  }
  return map[player.value?.class || ''] || '未知'
})

/** 职业图标 */
const classIcon = computed(() => {
  const map: Record<string, string> = {
    warrior: '⚔️',
    mage: '🔮',
    ranger: '🏹'
  }
  return map[player.value?.class || ''] || '❓'
})
</script>

<template>
  <div v-if="player" class="character-panel">
    <!-- 角色头像与基本信息 -->
    <div class="d-flex align-items-center mb-3">
      <span class="character-avatar me-3">{{ classIcon }}</span>
      <div>
        <h6 class="mb-0">{{ player.name }}</h6>
        <small class="text-muted">{{ className }} · Lv.{{ player.level }}</small>
      </div>
    </div>

    <!-- 进阶系统 -->
    <div v-if="advancement" class="advancement-section mb-3">
      <!-- 当前阶 -->
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="tier-badge" :class="'tier-' + playerTier">
          {{ playerStore.currentTierConfig?.name || className }}
        </span>
        <span class="tier-stage text-muted">进阶 {{ playerTier }}/{{ MAX_ADVANCEMENT_TIER }}</span>
      </div>

      <!-- 进阶路线 -->
      <div class="tier-road">
        <div
          v-for="t in advancement.tiers"
          :key="t.tier"
          class="tier-node"
          :class="{
            active: t.tier <= playerTier,
            current: t.tier === playerTier,
            locked: t.tier > playerTier,
            selected: selectedTierNum === t.tier
          }"
          :title="t.name + (t.tier <= playerTier ? ' ✓' : ` (需要Lv.${t.requiredLevel})`)"
          @click="handleTierClick(t.tier)"
        >
          <div class="tier-dot"></div>
          <span class="tier-node-label">{{ t.name }}</span>
        </div>
      </div>

      <!-- 选中阶/下一阶预览 -->
      <div v-if="previewTier" class="next-tier-info mt-2">
        <div class="next-tier-header">
          <span v-if="selectedTierNum" class="text-muted">第 {{ selectedTierNum }} 阶：</span>
          <span v-else class="text-muted">下一阶：</span>
          <span class="next-tier-name">{{ previewTier.name }}</span>
          <button
            v-if="selectedTierNum"
            class="btn-clear-preview"
            @click="selectedTierNum = null"
            title="恢复默认预览"
          >×</button>
        </div>
        <div class="next-tier-attrs">
          <span v-for="(val, key) in previewTier.statBonus" :key="key" class="tier-attr-tag">
            +{{ typeof val === 'number' && (key === 'critRate' || key === 'dodge') ? (val * 100).toFixed(1) + '%' : val }} {{ STAT_NAMES[key] || key }}
          </span>
          <span v-if="Object.keys(previewTier.statBonus).length === 0" class="text-muted small">无属性加成</span>
        </div>
        <div v-if="previewTier.unlockSkills.length > 0" class="next-tier-skills">
          <span class="text-muted">{{ previewTier.tier <= playerTier ? '已解锁技能' : '解锁技能' }}：</span>
          <span v-for="sid in previewTier.unlockSkills" :key="sid" class="tier-skill-tag">
            {{ getSkillConfig(sid)?.icon || '' }}{{ getSkillConfig(sid)?.name || sid }}
          </span>
        </div>
        <div v-if="previewTier.passiveBonus && previewTier.passiveBonus !== '无'" class="next-tier-passive">
          <span class="text-muted">被动效果：</span>{{ previewTier.passiveBonus }}
        </div>
      </div>

      <!-- 进阶按钮 -->
      <div v-if="nextTier" class="mt-2">
        <button
          v-if="playerTier < MAX_ADVANCEMENT_TIER"
          class="btn-advance"
          :class="{ disabled: !canAdvance }"
          :disabled="!canAdvance"
          @click="handleAdvance"
        >
          {{ canAdvance ? `进阶为 ${nextTier.name}（消耗 ${nextTier.goldCost} 💰）` : advanceHint }}
        </button>
        <span v-else class="text-muted small">已达最高阶</span>
      </div>
    </div>

    <!-- 经验条 -->
    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1">
        <small class="text-muted">EXP</small>
        <small>{{ player.exp }} / {{ playerStore.getExpForLevel(player.level) }}</small>
      </div>
      <div class="progress" style="height: 8px;">
        <div class="progress-bar bg-info" :style="{ width: expPercent + '%' }"></div>
      </div>
    </div>

    <!-- HP/MP -->
    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1">
        <small>HP</small>
        <small>{{ Math.floor(player.currentHp) }}/{{ Math.floor(totalStats.hp) }}</small>
      </div>
      <div class="progress" style="height: 10px;">
        <div
          class="progress-bar bg-danger"
          :style="{ width: Math.max(0, (player.currentHp / totalStats.hp) * 100) + '%' }"
        ></div>
      </div>
    </div>

    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1">
        <small>MP</small>
        <small>{{ player.currentMp }}/{{ totalStats.mp }}</small>
      </div>
      <div class="progress" style="height: 10px;">
        <div
          class="progress-bar bg-primary"
          :style="{ width: Math.max(0, (player.currentMp / totalStats.mp) * 100) + '%' }"
        ></div>
      </div>
    </div>

    <!-- 金币 -->
    <div class="mb-3 small">
      <span class="text-warning">💰 {{ formatNumber(player.gold) }}</span>
      <span class="text-muted ms-3">⚡ 战斗力: {{ combatPower }}</span>
    </div>

    <!-- 装备栏 -->
    <EquipmentSlots />

    <!-- 属性列表 -->
    <AttributeList />
  </div>
</template>

<style scoped>
/* 进阶系统 */
.advancement-section {
  padding: 8px;
  background: var(--bg-tertiary, rgba(255,255,255,0.03));
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--border-color, rgba(255,255,255,0.08));
}

.tier-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-sm, 4px);
  color: #fff;
}
.tier-badge.tier-1 { background: #6B7280; }
.tier-badge.tier-2 { background: #3B82F6; }
.tier-badge.tier-3 { background: #8B5CF6; }
.tier-badge.tier-4 { background: #F59E0B; color: #000; }
.tier-badge.tier-5 { background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; }
.tier-badge.tier-6 { background: linear-gradient(135deg, #EF4444, #EC4899); color: #fff; }
.tier-badge.tier-7 { background: linear-gradient(135deg, #EC4899, #8B5CF6); color: #fff; }
.tier-badge.tier-8 { background: linear-gradient(135deg, #8B5CF6, #06B6D4); color: #fff; }
.tier-badge.tier-9 { background: linear-gradient(135deg, #F59E0B, #F59E0B, #fff); color: #000; box-shadow: 0 0 10px rgba(245,158,11,0.5); }

.tier-stage {
  font-size: 0.7rem;
}

/* 进阶路线 */
.tier-road {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 6px 0;
}
.tier-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  min-width: 0;
}
.tier-node:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color, rgba(255,255,255,0.12));
}
.tier-node.active:not(:last-child)::after {
  background: #8B5CF6;
}
.tier-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg-secondary, rgba(255,255,255,0.08));
  border: 2px solid var(--border-color, rgba(255,255,255,0.15));
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}
.tier-node.active .tier-dot {
  background: #8B5CF6;
  border-color: #A78BFA;
  box-shadow: 0 0 6px rgba(139, 92, 246, 0.4);
}
.tier-node.current .tier-dot {
  width: 12px;
  height: 12px;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
}
.tier-node-label {
  font-size: 0.48rem;
  color: var(--text-muted, #888);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
}
.tier-node.active .tier-node-label {
  color: var(--text-secondary, #ccc);
}
.tier-node.current .tier-node-label {
  color: #A78BFA;
  font-weight: 600;
}

.tier-node.selected .tier-dot {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.4);
  animation: tierPulse 1.5s ease-in-out infinite;
}

@keyframes tierPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(139, 92, 246, 0.6); }
  50% { box-shadow: 0 0 16px rgba(139, 92, 246, 0.9); }
}

/* 可点击提示 */
.tier-node:not(.locked) {
  cursor: pointer;
}

.btn-clear-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background-color: var(--bg-tertiary, rgba(255,255,255,0.06));
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  margin-left: 6px;
  line-height: 1;
  padding: 0;
  transition: all 0.15s;
}

.btn-clear-preview:hover {
  background-color: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* 下一阶信息 */
.next-tier-info {
  padding: 6px 8px;
  background: rgba(139, 92, 246, 0.06);
  border-radius: var(--radius-sm, 4px);
  border: 1px solid rgba(139, 92, 246, 0.15);
  font-size: 0.7rem;
}
.next-tier-header {
  margin-bottom: 4px;
}
.next-tier-name {
  font-weight: 600;
  color: #A78BFA;
}
.next-tier-attrs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 3px;
}
.tier-attr-tag {
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.6rem;
  font-weight: 500;
}
.next-tier-skills {
  margin-bottom: 3px;
  color: var(--text-secondary);
}
.tier-skill-tag {
  display: inline-block;
  background: rgba(59, 130, 246, 0.12);
  color: #60A5FA;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.6rem;
  margin-left: 3px;
}
.next-tier-passive {
  color: var(--text-muted);
  font-size: 0.65rem;
}

/* 进阶按钮 */
.btn-advance {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: var(--radius-sm, 4px);
  background: rgba(139, 92, 246, 0.15);
  color: #A78BFA;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-advance:hover:not(.disabled) {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
}
.btn-advance.disabled,
.btn-advance:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255,255,255,0.04);
  border-color: var(--border-color, rgba(255,255,255,0.1));
  color: var(--text-muted, #666);
}
</style>
