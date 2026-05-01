<script setup lang="ts">
/**
 * 技能面板组件
 * 按职业Tab展示所有技能，支持升级和查看解锁条件
 */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '@/stores/playerStore'
import { playerSkillConfigs } from '@/config/playerSkills'
import { CharacterClass, SKILL_MAX_LEVEL } from '@/types'
import type { SkillConfig } from '@/types'
import {
  getSkillLevelMultiplier,
  getSkillLevelCooldownReduction,
  getSkillLevelMpReduction,
  getSkillUpgradeCost,
} from '@/types'

const { t } = useI18n()
const playerStore = usePlayerStore()
const player = computed(() => playerStore.player)

const emit = defineEmits<{ close: [] }>()

/** Tab 定义 */
type ClassTab = 'all' | 'warrior' | 'mage' | 'ranger'

const tabs: { id: ClassTab; label: string; icon: string }[] = [
  { id: 'all', label: '全部', icon: '📋' },
  { id: 'warrior', label: '战士', icon: '⚔️' },
  { id: 'mage', label: '法师', icon: '🔮' },
  { id: 'ranger', label: '游侠', icon: '🏹' },
]

const activeTab = ref<ClassTab>('all')

const playerLevel = computed(() => player.value?.level || 1)

/** 判断技能是否属于某职业 */
function isClassOf(config: SkillConfig, cls: CharacterClass | 'common'): boolean {
  if (cls === 'common' as any) return !config.classRestriction?.length
  return config.classRestriction?.includes(cls as CharacterClass) || false
}

/** 按Tab过滤技能 */
const filteredSkills = computed(() => {
  let skills = playerSkillConfigs
  if (activeTab.value !== 'all') {
    skills = skills.filter(s => isClassOf(s, activeTab.value as CharacterClass))
  }
  return skills.sort((a, b) => a.unlockLevel - b.unlockLevel)
})

/** 获取技能当前等级 */
function getLevel(skillId: string): number {
  return playerStore.getSkillLevel(skillId)
}

/** 是否已解锁（等级达到要求且属于本职业） */
function isUnlocked(config: SkillConfig): boolean {
  if (!player.value) return false
  if (!isMyClass(config)) return false
  return playerLevel.value >= config.unlockLevel
}

/** 是否属于玩家当前职业 */
function isMyClass(config: SkillConfig): boolean {
  if (!player.value) return false
  if (!config.classRestriction?.length) return true
  return config.classRestriction.includes(player.value.class)
}

/** 能否升级 */
function canUpgrade(config: SkillConfig): boolean {
  if (!isUnlocked(config)) return false
  const level = getLevel(config.id)
  if (level >= SKILL_MAX_LEVEL) return false
  const cost = getSkillUpgradeCost(level, config.unlockLevel)
  return (player.value?.gold || 0) >= cost
}

/** 升级技能 */
function handleUpgrade(config: SkillConfig) {
  const level = getLevel(config.id)
  const cost = getSkillUpgradeCost(level, config.unlockLevel)
  playerStore.upgradeSkill(config.id, cost)
}

/** 效果类型文本 */
function effectTypeText(type: string): string {
  const map: Record<string, string> = {
    physicalDamage: '物理伤害', magicDamage: '魔法伤害',
    heal: '治疗', healPercent: '百分比治疗',
    buffSelf: '自身增益', buffAll: '群体增益', debuff: '减益', dot: '持续伤害'
  }
  return map[type] || type
}

/** 目标类型文本 */
function targetText(target: string): string {
  const map: Record<string, string> = { single: '单体', all: '群体', self: '自身' }
  return map[target] || target
}

/** 冷却文本 */
function cooldownText(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

/** 职业名称 */
function className(cls?: CharacterClass[]): string {
  if (!cls?.length) return '通用'
  return cls.map(c => ({ warrior: '战士', mage: '法师', ranger: '游侠' }[c] || c)).join('/')
}

/** 职业颜色 */
function classColor(cls?: CharacterClass[]): string {
  if (!cls?.length) return 'var(--text-secondary)'
  if (cls.includes(CharacterClass.Warrior)) return '#EF4444'
  if (cls.includes(CharacterClass.Mage)) return '#3B82F6'
  if (cls.includes(CharacterClass.Ranger)) return '#22C55E'
  return 'var(--text-secondary)'
}

/** 等级星星 */
function levelStars(level: number): string {
  return '★'.repeat(level) + '☆'.repeat(SKILL_MAX_LEVEL - level)
}

/** 下一级预览 */
function nextLevelPreview(config: SkillConfig): { dmgPct: number; cdPct: number; mpPct: number } | null {
  const cur = getLevel(config.id)
  if (cur >= SKILL_MAX_LEVEL) return null
  const next = cur + 1
  const curMul = getSkillLevelMultiplier(cur)
  const nextMul = getSkillLevelMultiplier(next)
  const curCd = 1 - getSkillLevelCooldownReduction(cur)
  const nextCd = 1 - getSkillLevelCooldownReduction(next)
  const curMp = 1 - getSkillLevelMpReduction(cur)
  const nextMp = 1 - getSkillLevelMpReduction(next)
  return {
    dmgPct: Math.round((nextMul / curMul - 1) * 100),
    cdPct: Math.round((nextCd / curCd - 1) * 100),
    mpPct: Math.round((nextMp / curMp - 1) * 100),
  }
}

// 自动选中当前职业
if (player.value) activeTab.value = player.value.class as ClassTab
</script>

<template>
  <div class="skill-panel">
    <div v-if="!player" class="text-center text-muted py-4">
      <p>暂无角色数据</p>
    </div>

    <div v-else>
      <!-- Tab 切换 -->
      <div class="skill-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="skill-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- 当前角色信息提示 -->
      <div class="player-hint">
        <span>{{ player?.name }}</span>
        <span class="hint-level">Lv.{{ playerLevel }}</span>
        <span class="hint-gold">💰 {{ player?.gold?.toLocaleString() }}</span>
      </div>

      <!-- 技能列表 -->
      <div class="skill-list">
        <div
          v-for="skill in filteredSkills"
          :key="skill.id"
          class="skill-item"
          :class="{
            unlocked: isUnlocked(skill),
            locked: !isUnlocked(skill),
            'my-class': isMyClass(skill),
          }"
        >
          <!-- 技能头部 -->
          <div class="skill-header">
            <div class="skill-icon-wrap">
              <span class="skill-icon">{{ skill.icon }}</span>
            </div>
            <div class="skill-info">
              <div class="skill-name-row">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-class-tag" :style="{ color: classColor(skill.classRestriction) }">
                  {{ className(skill.classRestriction) }}
                </span>
              </div>
              <div class="skill-desc">{{ skill.description }}</div>
            </div>
          </div>

          <!-- 技能属性 + 等级 -->
          <div class="skill-meta">
            <div class="skill-attrs">
              <span class="attr-item">{{ effectTypeText(skill.effectType) }}</span>
              <span class="attr-item">{{ targetText(skill.target) }}</span>
              <span class="attr-item">冷却 {{ cooldownText(skill.cooldown) }}</span>
              <span class="attr-item">消耗 {{ skill.mpCost }} MP</span>
              <span
                v-if="skill.value && !['heal','healPercent','buffSelf','buffAll'].includes(skill.effectType)"
                class="attr-item attr-value"
              >
                伤害 {{ (skill.value * getSkillLevelMultiplier(getLevel(skill.id)) * 100).toFixed(0) }}%
              </span>
            </div>

            <!-- 技能等级和升级 -->
            <div v-if="isUnlocked(skill)" class="skill-level-row">
              <span class="skill-stars" :title="'Lv.' + getLevel(skill.id)">
                {{ levelStars(getLevel(skill.id)) }}
              </span>
              <span class="skill-level-text">Lv.{{ getLevel(skill.id) }}</span>
              <button
                v-if="canUpgrade(skill)"
                class="upgrade-btn"
                @click="handleUpgrade(skill)"
              >
                <span class="upgrade-arrow">▲</span>
                <span>升级 {{ getSkillUpgradeCost(getLevel(skill.id), skill.unlockLevel) }}G</span>
              </button>
              <span v-else-if="getLevel(skill.id) >= SKILL_MAX_LEVEL" class="max-badge">已满级</span>
              <span v-else class="upgrade-cost-hint">
                需 {{ getSkillUpgradeCost(getLevel(skill.id), skill.unlockLevel) }}G
              </span>
            </div>

            <!-- 下一级预览 -->
            <div v-if="isUnlocked(skill) && nextLevelPreview(skill)" class="next-preview">
              <span class="preview-label">下一级:</span>
              <span v-if="nextLevelPreview(skill)!.dmgPct" class="preview-good">
                效果+{{ nextLevelPreview(skill)!.dmgPct }}%
              </span>
              <span v-if="nextLevelPreview(skill)!.cdPct" class="preview-good">
                冷却{{ nextLevelPreview(skill)!.cdPct }}%
              </span>
              <span v-if="nextLevelPreview(skill)!.mpPct" class="preview-good">
                消耗{{ nextLevelPreview(skill)!.mpPct }}%
              </span>
            </div>
          </div>

          <!-- 未解锁遮罩 -->
          <div v-if="!isUnlocked(skill)" class="lock-overlay">
            <div class="lock-icon">🔒</div>
            <div class="lock-text">
              <div>
                <template v-if="!isMyClass(skill)">
                  仅 <strong>{{ className(skill.classRestriction) }}</strong> 可使用
                </template>
                <template v-else>
                  需要 <strong>Lv.{{ skill.unlockLevel }}</strong> 解锁
                  <span v-if="playerLevel < skill.unlockLevel" class="lock-progress">
                    (当前 Lv.{{ playerLevel }})
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-panel {
  font-size: var(--text-sm);
}

/* Tab */
.skill-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: var(--space-md);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 3px;
}

.skill-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--space-sm) var(--space-xs);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-default);
}

.skill-tab:hover { color: var(--text-primary); background: var(--bg-hover); }
.skill-tab.active { background: var(--accent-primary); color: #fff; font-weight: 600; }

/* 玩家信息 */
.player-hint {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.hint-level {
  font-weight: 600;
  color: var(--accent-primary);
  background: var(--accent-muted);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.hint-gold { color: #F59E0B; font-weight: 600; }

/* 列表 */
.skill-list { display: flex; flex-direction: column; gap: var(--space-sm); }

/* 技能项 */
.skill-item {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  transition: all var(--duration-normal) var(--easing-default);
}

.skill-item:hover { border-color: var(--accent-primary); box-shadow: var(--shadow-sm); }
.skill-item.my-class { border-left: 3px solid var(--accent-primary); }
.skill-item.locked { opacity: 0.6; }

/* 头部 */
.skill-header { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-sm); }

.skill-icon-wrap {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.skill-icon { font-size: 1.25rem; }
.skill-info { flex: 1; min-width: 0; }

.skill-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.skill-name { font-weight: 600; color: var(--text-primary); font-size: var(--text-sm); }

.skill-class-tag { font-size: 0.65rem; font-weight: 600; }

.skill-desc { color: var(--text-secondary); font-size: var(--text-xs); margin-top: 2px; line-height: 1.4; }

/* 属性 */
.skill-attrs { display: flex; gap: var(--space-xs); flex-wrap: wrap; margin-bottom: var(--space-sm); }

.attr-item {
  font-size: 0.65rem; color: var(--text-muted);
  background: var(--bg-secondary); padding: 2px 8px; border-radius: var(--radius-full);
}

.attr-value { color: var(--accent-primary); font-weight: 600; }

/* 等级和升级 */
.skill-level-row {
  display: flex; align-items: center; gap: var(--space-xs);
  padding: var(--space-xs) 0;
  border-top: 1px solid var(--border-color-light);
}

.skill-stars { font-size: 0.6rem; color: #F59E0B; letter-spacing: 1px; }
.skill-level-text { font-size: var(--text-xs); font-weight: 600; color: var(--accent-primary); margin-left: 2px; }

.upgrade-btn {
  display: inline-flex; align-items: center; gap: 2px;
  margin-left: auto; padding: 2px 10px;
  border: 1px solid var(--accent-primary); border-radius: var(--radius-full);
  background: var(--accent-muted); color: var(--accent-primary);
  font-size: 0.6rem; font-weight: 600;
  cursor: pointer; transition: all var(--duration-fast) var(--easing-default);
}

.upgrade-btn:hover { background: var(--accent-primary); color: #fff; }
.upgrade-arrow { font-size: 0.55rem; }

.max-badge { font-size: 0.6rem; color: #22C55E; font-weight: 600; margin-left: auto; }
.upgrade-cost-hint { font-size: 0.6rem; color: var(--text-muted); margin-left: auto; }

/* 下一级预览 */
.next-preview {
  display: flex; align-items: center; gap: var(--space-xs);
  padding-top: var(--space-xs);
  font-size: 0.6rem;
}

.preview-label { color: var(--text-muted); }
.preview-good { color: #22C55E; font-weight: 500; }

/* 未解锁遮罩 */
.lock-overlay {
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center; gap: var(--space-sm);
  pointer-events: none;
}

.lock-icon { font-size: 1.5rem; opacity: 0.5; }
.lock-text { text-align: left; }

.lock-text div { font-size: var(--text-xs); color: var(--text-secondary); }
.lock-text strong { color: var(--accent-primary); }
.lock-progress { color: var(--text-muted); font-size: 0.6rem !important; }
</style>
