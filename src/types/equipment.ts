import { Quality, EquipSlot, Element } from './common'

/**
 * 装备相关类型定义
 */

/** 装备实例接口 */
export interface Equipment {
  id: string              // 实例唯一ID
  templateId: string      // 模板ID
  name: string
  quality: Quality
  slot: EquipSlot
  level: number           // 装备需求等级
  element?: Element       // 元素属性（可选）
  
  // 属性加成
  stats: EquipmentStats
  
  // 分解产出
  decomposeRewards: { itemId: string; quantity: number }[]
}

/** 装备属性 */
export interface EquipmentStats {
  hp?: number
  mp?: number
  attack?: number
  defense?: number
  magicAttack?: number
  magicDefense?: number
  speed?: number
  critRate?: number       // 百分比加成 (0.05 = 5%)
  critDamage?: number
  dodge?: number
}

/** 装备模板配置 */
export interface EquipmentTemplate {
  id: string
  name: string
  slot: EquipSlot
  baseQuality: Quality    // 基础品质
  levelRequirement: number
  image?: string

  // 基础属性
  baseStats: EquipmentStats
  
  // 品质加成倍率
  qualityMultipliers: Record<Quality, number>
  
  // 掉落来源
  dropSources: {
    monsterId?: string    // 可从指定怪物掉落
    minMonsterLevel?: number
    titleRestriction?: string[] // 头衔限制
  }
  
  // 售价
  sellPrice: number
  buyPrice?: number       // 可购买的话
}

/** 装备对比结果 */
export interface EquipCompareResult {
  current: Equipment | null
  newEquip: Equipment
  statChanges: {
    stat: string
    current: number
    new: number
    diff: number
    isPositive: boolean
  }[]
}

/** 自动拾取配置 */
export interface AutoPickupConfig {
  enabled: boolean
  minQuality: Quality      // 最低拾取品质
  maxQuality: Quality      // 最高拾取品质
  slots: EquipSlot[]       // 指定槽位（空表示全部）
}

/** 自动分解配置 */
export interface AutoDecomposeConfig {
  enabled: boolean
  minQuality: Quality      // 最低分解品质
  maxQuality: Quality      // 最高分解品质
  keepHigherQuality: boolean // 是否保留更高品质
}

/** 自动出售配置 */
export interface AutoSellConfig {
  enabled: boolean
  minQuality: Quality      // 低于此品质的装备自动出售
  maxLevel: number         // 等级低于此值的装备自动出售（相对于玩家等级的差距，如10表示低于玩家10级的装备自动出售）
  levelGap: number         // 装备等级与玩家等级差距阈值（装备等级 < 玩家等级 - levelGap 时自动出售）
}
