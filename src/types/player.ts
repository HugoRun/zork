import type { BaseStats } from './common'
import { CharacterClass, EquipSlot } from './common'
import type { Item } from './item'

/**
 * 玩家角色相关类型定义
 */

/** 角色接口 */
export interface Player {
  id: string
  name: string
  class: CharacterClass
  level: number
  exp: number
  gold: number
  avatar?: string       // 玩家头像图片

  // 当前状态
  currentHp: number
  currentMp: number
  
  // 基础属性
  baseStats: BaseStats
  
  // 装备槽（存完整物品数据）
  equipment: Partial<Record<EquipSlot, Item>>
  
  // 技能配置
  skillPriority: string[] // 技能ID优先级列表
  skillLevels: Record<string, number> // 技能等级 { skillId: level }

  // 进阶
  advancementTier: number // 进阶阶段 1-5
  
  // 时间戳
  createdAt: number
  lastOnlineAt: number
}

/** 角色创建参数 */
export interface CreatePlayerParams {
  name: string
  class: CharacterClass
}

/** 职业基础属性配置 */
export interface ClassBaseStats {
  hp: number
  mp: number
  attack: number
  defense: number
  magicAttack: number
  magicDefense: number
  speed: number
  critRate: number
  critDamage: number
  dodge: number
  hitRate: number
}

/** 职业属性成长配置 */
export interface ClassGrowth {
  hp: number        // 每级HP成长
  mp: number        // 每级MP成长
  attack: number    // 每级攻击成长
  defense: number   // 每级防御成长
  magicAttack: number
  magicDefense: number
  speed: number
  critRate: number  // 每级暴击率成长
  critDamage: number
  dodge: number
}

/** 职业配置 */
export interface ClassConfig {
  name: string
  description: string
  icon: string
  baseStats: ClassBaseStats
  growth: ClassGrowth
  skillIds: string[] // 该职业可用的技能ID列表
}
