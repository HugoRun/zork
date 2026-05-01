/**
 * 技能系统 Composable
 * 管理技能冷却、释放判定、效果应用
 */
import { ref, computed } from 'vue'
import type { SkillConfig, SkillInstance, SkillCastResult } from '@/types'
import { SkillEffectType } from '@/types'
import { getSkillConfig } from '@/config/skills'
import { getSkillLevelMultiplier, getSkillLevelCooldownReduction, getSkillLevelMpReduction } from '@/types'

/**
 * 技能系统管理
 */
export function useSkillSystem() {
  /** 技能实例列表 */
  const skills = ref<SkillInstance[]>([])
  
  /** 技能优先级列表 */
  const priority = ref<string[]>([])
  
  /** 初始化技能列表 */
  function initSkills(skillIds: string[], unlockedLevel: number = 1, skillLevels?: Record<string, number>, advancementTier: number = 1) {
    skills.value = skillIds
      .map(id => {
        const config = getSkillConfig(id)
        if (!config) return null

        const level = skillLevels?.[id] || 1

        // 检查进阶阶段限制
        const meetsAdvance = !config.advanceRestriction || advancementTier >= config.advanceRestriction

        return {
          id,
          config,
          level,
          currentCooldown: 0,
          lastCastTime: 0,
          isAvailable: config.unlockLevel <= unlockedLevel && meetsAdvance
        }
      })
      .filter((s): s is SkillInstance => s !== null)
    
    // 设置默认优先级
    priority.value = skills.value
      .sort((a, b) => b.config.priority - a.config.priority)
      .map(s => s.id)
  }
  
  /** 更新技能冷却 */
  function updateCooldowns(deltaMs: number) {
    skills.value.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaMs)
      }
    })
  }
  
  /** 检查技能是否可用 */
  function checkSkillAvailable(skillId: string, currentMp: number): boolean {
    const skill = skills.value.find(s => s.id === skillId)
    if (!skill || !skill.isAvailable) return false

    // 检查冷却
    if (skill.currentCooldown > 0) return false

    // 检查MP（考虑技能等级缩减）
    const mpReduction = getSkillLevelMpReduction(skill.level)
    const effectiveMpCost = skill.config.mpCost * (1 - mpReduction)
    if (effectiveMpCost > currentMp) return false

    return true
  }
  
  /** 获取下一个可用技能（跳过普通攻击） */
  function getNextAvailableSkill(currentMp: number): SkillInstance | null {
    for (const skillId of priority.value) {
      // 跳过普通攻击，由 executeNormalAttack 处理
      if (skillId === 'attack') continue
      if (checkSkillAvailable(skillId, currentMp)) {
        return skills.value.find(s => s.id === skillId) || null
      }
    }
    return null
  }
  
  /** 释放技能 */
  function castSkill(skillId: string): SkillCastResult | null {
    const skill = skills.value.find(s => s.id === skillId)
    if (!skill) return null

    const now = Date.now()
    const cdReduction = getSkillLevelCooldownReduction(skill.level)
    const effectiveCooldown = skill.config.cooldown * (1 - cdReduction)

    // 设置冷却
    skill.currentCooldown = effectiveCooldown
    skill.lastCastTime = now

    return {
      skillId: skill.id,
      skillName: skill.config.name,
      casterId: '', // 由调用者设置
      casterName: '', // 由调用者设置
      targets: [], // 由调用者设置
      timestamp: now
    }
  }
  
  /** 解锁技能（等级提升时调用） */
  function unlockSkillsForLevel(level: number) {
    skills.value.forEach(skill => {
      if (!skill.isAvailable && skill.config.unlockLevel <= level) {
        skill.isAvailable = true
      }
    })
  }
  
  /** 设置技能优先级 */
  function setPriority(newPriority: string[]) {
    priority.value = newPriority
  }
  
  /** 获取技能实例 */
  function getSkillInstance(skillId: string): SkillInstance | undefined {
    return skills.value.find(s => s.id === skillId)
  }
  
  /** 获取所有可用技能 */
  const availableSkills = computed(() => {
    return skills.value.filter(s => s.isAvailable)
  })
  
  return {
    skills,
    priority,
    availableSkills,
    initSkills,
    updateCooldowns,
    checkSkillAvailable,
    getNextAvailableSkill,
    castSkill,
    unlockSkillsForLevel,
    setPriority,
    getSkillInstance
  }
}

/**
 * 获取技能效果值
 */
export function getSkillEffectValue(skill: SkillConfig, baseStat: number): number {
  switch (skill.effectType) {
    case SkillEffectType.PhysicalDamage:
    case SkillEffectType.MagicDamage:
      return Math.floor(baseStat * skill.value)
    
    case SkillEffectType.Heal:
      return skill.value
    
    case SkillEffectType.HealPercent:
      return Math.floor(baseStat * skill.value)
    
    default:
      return skill.value
  }
}

/**
 * 判断技能是否为AOE
 */
export function isAoeSkill(skill: SkillConfig): boolean {
  return skill.target === 'all'
}

/**
 * 判断技能是否为治疗
 */
export function isHealSkill(skill: SkillConfig): boolean {
  return skill.effectType === SkillEffectType.Heal || 
         skill.effectType === SkillEffectType.HealPercent
}

/**
 * 判断技能是否为Buff
 */
export function isBuffSkill(skill: SkillConfig): boolean {
  return skill.effectType === SkillEffectType.BuffSelf || 
         skill.effectType === SkillEffectType.BuffAll
}
