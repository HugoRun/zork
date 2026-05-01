import { Element, CharacterClass } from './common'

/**
 * 技能相关类型定义
 */

/** 技能效果类型 */
export enum SkillEffectType {
  PhysicalDamage = 'physicalDamage',   // 物理伤害
  MagicDamage = 'magicDamage',         // 魔法伤害
  Heal = 'heal',                       // 治疗
  HealPercent = 'healPercent',         // 百分比治疗
  BuffSelf = 'buffSelf',               // 自身增益
  BuffAll = 'buffAll',                 // 全体增益
  Debuff = 'debuff',                   // 减益
  DOT = 'dot'                          // 持续伤害
}

/** 技能目标类型 */
export type SkillTarget = 'single' | 'all' | 'self'

/** Buff/Debuff类型 */
export interface BuffEffect {
  stat: string          // 属性名
  value: number         // 加成值或百分比
  isPercent: boolean    // 是否百分比加成
  duration: number      // 持续时间（毫秒）
}

/** 技能配置接口 */
export interface SkillConfig {
  id: string
  name: string
  description: string
  icon: string
  
  // 效果
  effectType: SkillEffectType
  target: SkillTarget
  element: Element
  
  // 数值
  value: number         // 效果值（伤害系数或治疗量）
  baseDamage?: number   // 基础伤害（用于技能伤害计算）
  
  // 消耗与冷却
  cooldown: number      // 冷却时间（毫秒）
  mpCost: number        // 魔法消耗
  
  // 解锁
  unlockLevel: number   // 解锁等级
  classRestriction?: CharacterClass[] // 职业限制
  advanceRestriction?: number // 进阶阶段限制（需要达到该进阶阶段才能使用）
  
  // 优先级
  priority: number      // 释放优先级（数值越大越优先）
  
  // 特殊效果
  buffs?: BuffEffect[]  // 施加的增益/减益
  dot?: {
    damage: number
    interval: number    // 触发间隔（毫秒）
    duration: number    // 总持续时间（毫秒）
  }
}

/** 技能实例（战斗中） */
export interface SkillInstance {
  id: string
  config: SkillConfig
  level: number              // 技能等级 (1-5)
  currentCooldown: number // 当前冷却剩余时间（毫秒）
  lastCastTime: number    // 上次释放时间
  isAvailable: boolean    // 是否可用（MP足够且冷却完毕）
}

/** 技能升级配置 */
export const SKILL_MAX_LEVEL = 5

/** 技能等级倍率 */
export function getSkillLevelMultiplier(level: number): number {
  // Lv1: 100%, Lv2: 120%, Lv3: 140%, Lv4: 165%, Lv5: 200%
  const multipliers = [1.0, 1.0, 1.2, 1.4, 1.65, 2.0]
  return multipliers[Math.min(level, SKILL_MAX_LEVEL)] || 1.0
}

/** 技能等级冷却缩减 */
export function getSkillLevelCooldownReduction(level: number): number {
  // Lv1: 0%, Lv2: -5%, Lv3: -10%, Lv4: -15%, Lv5: -20%
  const reductions = [0, 0, 0.05, 0.10, 0.15, 0.20]
  return reductions[Math.min(level, SKILL_MAX_LEVEL)] || 0
}

/** 技能等级MP缩减 */
export function getSkillLevelMpReduction(level: number): number {
  // Lv1: 0%, Lv2: 0%, Lv3: -5%, Lv4: -10%, Lv5: -15%
  const reductions = [0, 0, 0, 0.05, 0.10, 0.15]
  return reductions[Math.min(level, SKILL_MAX_LEVEL)] || 0
}

/** 技能升级费用 */
export function getSkillUpgradeCost(skillLevel: number, unlockLevel: number): number {
  // 基础费用随解锁等级增长，再乘以当前技能等级
  const baseCost = unlockLevel <= 5 ? 100 : unlockLevel <= 15 ? 200 : unlockLevel <= 25 ? 400 : 600
  return baseCost * skillLevel
}

/** 技能释放结果 */
export interface SkillCastResult {
  skillId: string
  skillName: string
  casterId: string
  casterName: string
  targets: string[]
  damage?: number
  heal?: number
  buffs?: BuffEffect[]
  timestamp: number
}

/** 技能状态管理 */
export interface SkillState {
  skills: SkillInstance[]
  priority: string[]     // 技能ID优先级列表
}
