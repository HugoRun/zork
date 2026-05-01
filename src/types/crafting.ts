import { Quality } from './common'

/**
 * 制作系统类型定义（炼金、锻造、附魔）
 */

/** 配方类型 */
export type CraftType = 'alchemy' | 'forging'

/** 配方材料需求 */
export interface RecipeMaterial {
  templateId: string
  quantity: number
}

/** 制作配方 */
export interface CraftRecipe {
  id: string
  type: CraftType
  name: string
  description: string
  /** 需求等级 */
  levelRequirement: number
  /** 制作产出模板ID */
  outputId: string
  /** 产出数量 */
  outputQuantity: number
  /** 产出品质（锻造用） */
  outputQuality?: Quality
  /** 所需材料 */
  materials: RecipeMaterial[]
  /** 所需金币 */
  goldCost: number
  /** 制作成功率（0-1） */
  successRate: number
  /** 是否已学习 */
  isLearned?: boolean
}

/** 炼金图纸 */
export interface AlchemyBlueprint {
  id: string
  name: string
  description: string
  levelRequirement: number
  /** 解锁的配方ID列表 */
  recipeIds: string[]
  /** 获取来源描述 */
  source: string
}

/** 锻造图纸 */
export interface ForgingBlueprint {
  id: string
  name: string
  description: string
  levelRequirement: number
  /** 解锁的配方ID列表 */
  recipeIds: string[]
  /** 获取来源描述 */
  source: string
}

/** 附魔词条 */
export interface EnchantAffix {
  id: string
  name: string
  /** 词条类型（prefix前缀/suffix后缀） */
  type: 'prefix' | 'suffix'
  /** 词条品级 */
  tier: number
  /** 属性加成 */
  stats: {
    hp?: number
    mp?: number
    attack?: number
    defense?: number
    magicAttack?: number
    magicDefense?: number
    speed?: number
    critRate?: number
    critDamage?: number
    dodge?: number
  }
  /** 适用槽位（空=全部） */
  validSlots?: string[]
  /** 适用品质范围 */
  minQuality?: Quality
  maxQuality?: Quality
  /** 权重（随机附魔时用） */
  weight: number
}

/** 装备附魔记录（存在装备实例上） */
export interface EquipmentEnchant {
  /** 附魔词条ID */
  affixId: string
  /** 附魔等级（每次成功强化+1） */
  level: number
  /** 当前强化次数 */
  enchantCount: number
  /** 最大强化次数 */
  maxEnchantCount: number
}

/** 附魔结果 */
export interface EnchantResult {
  success: boolean
  affix?: EnchantAffix
  newLevel?: number
  message: string
}

/** 品质对应最大附魔次数 */
export const QUALITY_MAX_ENCHANTS: Record<Quality, number> = {
  [Quality.Common]: 2,
  [Quality.Uncommon]: 3,
  [Quality.Rare]: 4,
  [Quality.Epic]: 5,
  [Quality.Legendary]: 6
}
