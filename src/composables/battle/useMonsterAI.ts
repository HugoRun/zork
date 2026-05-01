/**
 * 怪物AI Composable
 * 管理怪物行为逻辑
 */
import { ref } from 'vue'
import type { Monster, MonsterAIBehavior } from '@/types'
import { MonsterTitle } from '@/types'
import { getSkillConfig } from '@/config/skills'
import { LORD_ENRAGE_CONFIG, LORD_SUMMON_CONFIG } from '@/config/battleConfig'
import { calculateAttackInterval } from '@/config/battleConfig'
import { generateId } from '@/utils/random'

/**
 * 怪物AI管理
 */
export function useMonsterAI() {
  /** 怪物行为状态 */
  const behaviors = ref<Map<string, MonsterAIBehavior>>(new Map())
  
  /**
   * 初始化怪物AI
   */
  function initMonsterAI(monster: Monster): MonsterAIBehavior {
    const behavior: MonsterAIBehavior = {
      type: monster.title === MonsterTitle.Lord ? 'lord' : 
            monster.title === MonsterTitle.Elite ? 'elite' : 'normal',
      attackInterval: calculateAttackInterval(monster.stats.speed),
      skillCooldowns: {},
      specialMechanics: undefined
    }
    
    // 初始化技能冷却
    monster.skills.forEach(skillId => {
      const skill = getSkillConfig(skillId)
      if (skill && skill.cooldown > 0) {
        behavior.skillCooldowns[skillId] = 0
      }
    })
    
    // 领主特殊机制
    if (monster.title === MonsterTitle.Lord) {
      behavior.specialMechanics = {
        enrageThreshold: LORD_ENRAGE_CONFIG.threshold,
        summonAbility: true,
        maxSummons: LORD_SUMMON_CONFIG.maxSummons
      }
    }
    
    behaviors.value.set(monster.id, behavior)
    return behavior
  }
  
  /**
   * 更新怪物AI冷却
   */
  function updateCooldowns(monsterId: string, deltaMs: number) {
    const behavior = behaviors.value.get(monsterId)
    if (!behavior) return
    
    Object.keys(behavior.skillCooldowns).forEach(skillId => {
      if (behavior.skillCooldowns[skillId] > 0) {
        behavior.skillCooldowns[skillId] = Math.max(0, behavior.skillCooldowns[skillId] - deltaMs)
      }
    })
  }
  
  /**
   * 检查怪物是否可以攻击
   */
  function canAttack(monster: Monster): boolean {
    const behavior = behaviors.value.get(monster.id)
    if (!behavior) return false
    
    const now = Date.now()
    return now - monster.lastAttackTime >= behavior.attackInterval
  }
  
  /**
   * 选择怪物要使用的技能
   */
  function selectSkill(monster: Monster): string | null {
    const behavior = behaviors.value.get(monster.id)
    if (!behavior) return null
    
    // 遍历技能列表
    for (const skillId of monster.skills) {
      // 跳过普攻
      if (skillId === 'attack') continue
      
      // 检查冷却
      if (behavior.skillCooldowns[skillId] !== undefined && 
          behavior.skillCooldowns[skillId] > 0) {
        continue
      }
      
      const skill = getSkillConfig(skillId)
      if (!skill) continue
      
      // 精英和领主：30%几率使用技能
      // 普通怪物：15%几率使用技能
      const skillChance = behavior.type === 'normal' ? 0.15 : 0.3
      if (Math.random() < skillChance) {
        // 设置冷却
        behavior.skillCooldowns[skillId] = skill.cooldown
        return skillId
      }
    }
    
    return 'attack'
  }
  
  /**
   * 检查领主是否应该狂暴
   */
  function checkEnrage(monster: Monster): boolean {
    if (monster.title !== MonsterTitle.Lord || monster.isEnraged) return false
    
    const behavior = behaviors.value.get(monster.id)
    if (!behavior?.specialMechanics) return false
    
    const hpPercent = monster.currentHp / monster.maxHp
    if (hpPercent <= behavior.specialMechanics.enrageThreshold) {
      monster.isEnraged = true
      return true
    }
    
    return false
  }
  
  /**
   * 应用狂暴效果
   */
  function applyEnrage(monster: Monster): void {
    if (!monster.isEnraged) return
    
    monster.stats.attack *= (1 + LORD_ENRAGE_CONFIG.attackBonus)
    monster.stats.speed *= (1 + LORD_ENRAGE_CONFIG.speedBonus)
  }
  
  /**
   * 检查领主是否可以召唤
   */
  function canSummon(monster: Monster, currentSummonCount: number): boolean {
    if (monster.title !== MonsterTitle.Lord) return false
    
    const behavior = behaviors.value.get(monster.id)
    if (!behavior?.specialMechanics?.summonAbility) return false
    
    return currentSummonCount < behavior.specialMechanics.maxSummons
  }
  
  /**
   * 生成召唤物
   */
  function generateSummon(monster: Monster): Monster | null {
    if (!canSummon(monster, monster.summonCount || 0)) return null
    
    // 随机选择召唤物模板
    const templateId = LORD_SUMMON_CONFIG.templates[
      Math.floor(Math.random() * LORD_SUMMON_CONFIG.templates.length)
    ]
    
    const summonId = generateId()
    const summon: Monster = {
      id: summonId,
      templateId,
      name: '召唤物',
      title: MonsterTitle.Normal,
      level: Math.max(1, monster.level - 5),
      currentHp: 50,
      maxHp: 50,
      stats: {
        hp: 50,
        mp: 0,
        attack: 10,
        defense: 5,
        magicAttack: 0,
        magicDefense: 3,
        speed: 10,
        critRate: 0.05,
        critDamage: 1.5,
        dodge: 0.05,
        hitRate: 0.9,
        expReward: 10,
        goldReward: 5
      },
      element: monster.element,
      skills: ['attack'],
      lastAttackTime: 0
    }
    
    monster.summonCount = (monster.summonCount || 0) + 1
    
    return summon
  }
  
  /**
   * 清理怪物AI
   */
  function cleanupMonsterAI(monsterId: string): void {
    behaviors.value.delete(monsterId)
  }
  
  /**
   * 获取怪物行为
   */
  function getBehavior(monsterId: string): MonsterAIBehavior | undefined {
    return behaviors.value.get(monsterId)
  }
  
  return {
    initMonsterAI,
    updateCooldowns,
    canAttack,
    selectSkill,
    checkEnrage,
    applyEnrage,
    canSummon,
    generateSummon,
    cleanupMonsterAI,
    getBehavior
  }
}
