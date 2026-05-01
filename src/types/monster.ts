import type { BaseStats } from './common'
import type { Item } from './item'
import { MonsterTitle, Element } from './common'

/**
 * 怪物相关类型定义
 */

/** 怪物穿戴的装备 */
export interface MonsterEquipment {
  slot: string          // 槽位名（weapon/helmet/armor 等）
  item: Item            // 装备物品实例
}

/** 怪物实例接口（战斗中的怪物） */
export interface Monster {
  id: string              // 实例唯一ID
  templateId: string      // 模板ID
  name: string
  title: MonsterTitle
  level: number
  
  // 当前状态
  currentHp: number
  maxHp: number
  
  // 属性
  stats: MonsterStats
  
  // 怪物特性
  element: Element
  skills: string[]        // 技能ID列表
  
  // 怪物装备（精英/领主才有）
  equipment?: MonsterEquipment[]
  
  // 领主特殊状态
  isEnraged?: boolean     // 是否狂暴（领主专用）
  summonCount?: number    // 已召唤数量
  
  // 战斗状态
  lastAttackTime: number

  // 死亡状态（死亡后灰色显示，下一波刷新时才清除）
  isDead?: boolean
}

/** 怪物属性 */
export interface MonsterStats extends BaseStats {
  expReward: number       // 击杀经验奖励
  goldReward: number      // 击杀金币奖励
}

/** 怪物模板配置 */
export interface MonsterTemplate {
  id: string
  name: string
  level: number
  element: Element
  image?: string          // 怪物形象图片

  // 基础属性（普通怪物的属性）
  baseStats: MonsterStats

  // 头衔加成倍率
  eliteMultiplier: number // 精英属性倍率
  lordMultiplier: number  // 领主属性倍率

  // 刷新权重
  spawnWeight: number     // 在地图中的刷新权重

  // 技能
  normalSkills: string[]  // 普通怪物技能
  eliteSkills: string[]   // 精英怪物技能
  lordSkills: string[]    // 领主怪物技能

  // 怪物装备配置
  equippableSlots?: string[]  // 可穿戴装备的槽位（如 weapon, armor 等）
  equipDropRate?: number      // 装备掉落率 (0-1)，默认 0.3

  // 掉落表
  dropTable: DropEntry[]
}

/** 掉落条目 */
export interface DropEntry {
  itemId: string          // 物品ID
  dropRate: number        // 掉落率 (0-1)
  minQuantity: number     // 最小数量
  maxQuantity: number     // 最大数量
  
  // 头衔限制（空表示所有头衔都可掉落）
  titleRestriction?: MonsterTitle[]
  
  // 等级限制
  minLevel?: number
  maxLevel?: number
}

/** 怪物生成参数 */
export interface SpawnParams {
  templateId: string
  title: MonsterTitle
  mapId: string
}

/** 怪物AI行为 */
export interface MonsterAIBehavior {
  type: 'normal' | 'elite' | 'lord'
  attackInterval: number  // 攻击间隔（毫秒）
  skillCooldowns: Record<string, number> // 技能冷却
  specialMechanics?: {
    enrageThreshold?: number // 狂暴血量阈值（领主）
    summonAbility?: boolean  // 是否能召唤（领主）
    maxSummons?: number      // 最大召唤数量
  }
}
