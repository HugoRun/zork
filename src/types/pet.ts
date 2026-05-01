import type { BaseStats } from './common'
import { Quality, Element } from './common'

/**
 * 宠物/幻兽类型定义（参考魔域幻兽系统）
 */

/** 宠物状态 */
export type PetState = 'idle' | 'fighting' | 'merged' | 'dead'

/** 宠物品质枚举 */
export enum PetQuality {
  Common = 'common',       // 普通
  Uncommon = 'uncommon',   // 优秀
  Rare = 'rare',           // 稀有
  Epic = 'epic',           // 史诗
  Legendary = 'legendary', // 传说
  Mythic = 'mythic'        // 神话
}

/** 宠物品质颜色 */
export const PET_QUALITY_COLORS: Record<PetQuality, string> = {
  [PetQuality.Common]: '#9CA3AF',
  [PetQuality.Uncommon]: '#10B981',
  [PetQuality.Rare]: '#3B82F6',
  [PetQuality.Epic]: '#8B5CF6',
  [PetQuality.Legendary]: '#F59E0B',
  [PetQuality.Mythic]: '#EF4444'
}

/** 宠物品质中文名 */
export const PET_QUALITY_NAMES: Record<PetQuality, string> = {
  [PetQuality.Common]: '普通',
  [PetQuality.Uncommon]: '优秀',
  [PetQuality.Rare]: '稀有',
  [PetQuality.Epic]: '史诗',
  [PetQuality.Legendary]: '传说',
  [PetQuality.Mythic]: '神话'
}

/** 宠物成长评级 */
export enum PetGrowth {
  Poor = 'poor',
  Normal = 'normal',
  Good = 'good',
  Excellent = 'excellent',
  Perfect = 'perfect'
}

/** 宠物成长倍率 */
export const PET_GROWTH_MULTIPLIER: Record<PetGrowth, number> = {
  [PetGrowth.Poor]: 0.8,
  [PetGrowth.Normal]: 1.0,
  [PetGrowth.Good]: 1.2,
  [PetGrowth.Excellent]: 1.4,
  [PetGrowth.Perfect]: 1.6
}

/** 宠物成长评级名 */
export const PET_GROWTH_NAMES: Record<PetGrowth, string> = {
  [PetGrowth.Poor]: '普通',
  [PetGrowth.Normal]: '良好',
  [PetGrowth.Good]: '优秀',
  [PetGrowth.Excellent]: '卓越',
  [PetGrowth.Perfect]: '完美'
}

/** 宠物成长评级颜色 */
export const PET_GROWTH_COLORS: Record<PetGrowth, string> = {
  [PetGrowth.Poor]: '#9CA3AF',
  [PetGrowth.Normal]: '#6B7280',
  [PetGrowth.Good]: '#10B981',
  [PetGrowth.Excellent]: '#3B82F6',
  [PetGrowth.Perfect]: '#F59E0B'
}

/** 宠物模板配置 */
export interface PetTemplate {
  id: string
  name: string
  description: string
  icon: string             // emoji 图标
  element: Element
  quality: PetQuality

  // 基础属性（1级）
  baseStats: BaseStats

  // 每级成长
  growth: {
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
  }

  // 技能
  skills: string[]         // 宠物可用的技能ID列表

  // 合体加成（百分比）
  mergeBonus: Partial<BaseStats>

  // 获取途径
  obtainFrom: {
    type: 'monster_drop' | 'quest' | 'shop'
    monsterIds?: string[]  // 从哪些怪物掉落
    dropRate: number       // 掉落率
    minMonsterLevel?: number
  }

  // 进化链
  evolution?: {
    to: string             // 进化目标模板ID
    level: number          // 所需等级
    materialId?: string    // 进化材料ID
    materialCount?: number
  }
}

/** 宠物实例 */
export interface Pet {
  id: string               // 实例唯一ID
  templateId: string       // 模板ID
  name: string
  icon: string
  element: Element
  quality: PetQuality
  growth: PetGrowth

  level: number
  exp: number

  // 属性
  baseStats: BaseStats

  // 当前战斗状态
  currentHp: number
  maxHp: number

  // 技能
  skills: string[]

  // 状态
  state: PetState          // idle=休息, fighting=出战, merged=合体, dead=死亡

  // 时间戳
  obtainedAt: number

  // 成长资质（影响每次升级的随机浮动，0-1之间）
  aptitude: number         // 0.5=正常, 1.0=完美
}

/** 宠物升级所需经验 */
export function getPetExpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(1.15, level - 1))
}

/** 宠物属性成长（受成长评级影响） */
export function calculatePetGrowth(pet: Pet): Partial<BaseStats> {
  const template = PET_TEMPLATES.find(t => t.id === pet.templateId)
  if (!template) return {}

  const mult = PET_GROWTH_MULTIPLIER[pet.growth] * pet.aptitude
  const g = template.growth

  return {
    hp: Math.floor(g.hp * mult),
    mp: Math.floor(g.mp * mult),
    attack: +(g.attack * mult).toFixed(1),
    defense: +(g.defense * mult).toFixed(1),
    magicAttack: +(g.magicAttack * mult).toFixed(1),
    magicDefense: +(g.magicDefense * mult).toFixed(1),
    speed: +(g.speed * mult).toFixed(1),
    critRate: +(g.critRate * mult).toFixed(4),
    critDamage: +(g.critDamage * mult).toFixed(2),
    dodge: +(g.dodge * mult).toFixed(4),
  }
}

/** 宠物最大等级 */
export const PET_MAX_LEVEL = 50

/** 宠物出战数量上限 */
export const PET_MAX_ACTIVE = 1

// ============================================================
// 以下是宠物模板数据
// ============================================================

/** 所有宠物模板 */
export const PET_TEMPLATES: PetTemplate[] = [
  // ===== 新手村区域 =====
  {
    id: 'pet_fire_cat',
    name: '火炎猫',
    description: '尾巴上燃烧着火焰的可爱猫咪，性格暴躁但忠诚',
    icon: '🐱',
    element: Element.Fire,
    quality: PetQuality.Common,
    baseStats: {
      hp: 60, mp: 10, attack: 8, defense: 3,
      magicAttack: 6, magicDefense: 2, speed: 10,
      critRate: 0.05, critDamage: 1.4, dodge: 0.05, hitRate: 0.95
    },
    growth: {
      hp: 12, mp: 2, attack: 2, defense: 0.8,
      magicAttack: 1.2, magicDefense: 0.5, speed: 0.3,
      critRate: 0.002, critDamage: 0.01, dodge: 0.001
    },
    skills: ['pet_fire_bite'],
    mergeBonus: { attack: 0.05, speed: 0.03 },
    obtainFrom: {
      type: 'monster_drop',
      monsterIds: ['slime', 'rat', 'fireimp'],
      dropRate: 0.25,
      minMonsterLevel: 1
    },
    evolution: { to: 'pet_fire_lion', level: 20 }
  },
  {
    id: 'pet_ice_fox',
    name: '冰晶狐',
    description: '浑身覆盖着冰晶的灵狐，擅长冰系法术',
    icon: '🦊',
    element: Element.Ice,
    quality: PetQuality.Uncommon,
    baseStats: {
      hp: 50, mp: 25, attack: 5, defense: 4,
      magicAttack: 12, magicDefense: 6, speed: 12,
      critRate: 0.06, critDamage: 1.5, dodge: 0.08, hitRate: 0.94
    },
    growth: {
      hp: 10, mp: 5, attack: 1.2, defense: 1,
      magicAttack: 2.5, magicDefense: 1.2, speed: 0.4,
      critRate: 0.003, critDamage: 0.015, dodge: 0.002
    },
    skills: ['pet_ice_breath'],
    mergeBonus: { magicAttack: 0.08, magicDefense: 0.04 },
    obtainFrom: {
      type: 'monster_drop',
      monsterIds: ['fireimp', 'wolf'],
      dropRate: 0.2,
      minMonsterLevel: 3
    },
    evolution: { to: 'pet_frost_spirit', level: 25 }
  },
  {
    id: 'pet_thunder_eagle',
    name: '雷鹰',
    description: '翅膀上缠绕着闪电的猛禽，攻击极快',
    icon: '🦅',
    element: Element.Lightning,
    quality: PetQuality.Rare,
    baseStats: {
      hp: 55, mp: 15, attack: 10, defense: 3,
      magicAttack: 8, magicDefense: 3, speed: 16,
      critRate: 0.10, critDamage: 1.6, dodge: 0.10, hitRate: 0.96
    },
    growth: {
      hp: 11, mp: 3, attack: 2.2, defense: 0.8,
      magicAttack: 1.8, magicDefense: 0.7, speed: 0.5,
      critRate: 0.004, critDamage: 0.02, dodge: 0.003
    },
    skills: ['pet_thunder_strike'],
    mergeBonus: { speed: 0.08, critRate: 0.02 },
    obtainFrom: {
      type: 'monster_drop',
      monsterIds: ['wolf', 'icewolf'],
      dropRate: 0.15,
      minMonsterLevel: 5
    }
  },

  // ===== 进化形态 =====
  {
    id: 'pet_fire_lion',
    name: '烈焰狮',
    description: '火炎猫的进化形态，威严的火焰之王',
    icon: '🦁',
    element: Element.Fire,
    quality: PetQuality.Rare,
    baseStats: {
      hp: 120, mp: 20, attack: 18, defense: 8,
      magicAttack: 12, magicDefense: 5, speed: 14,
      critRate: 0.08, critDamage: 1.6, dodge: 0.06, hitRate: 0.96
    },
    growth: {
      hp: 20, mp: 3, attack: 3.5, defense: 1.5,
      magicAttack: 2, magicDefense: 1, speed: 0.4,
      critRate: 0.003, critDamage: 0.015, dodge: 0.002
    },
    skills: ['pet_fire_bite', 'pet_fire_roar'],
    mergeBonus: { attack: 0.10, critDamage: 0.05 },
    obtainFrom: { type: 'monster_drop', dropRate: 0 },
  },
  {
    id: 'pet_frost_spirit',
    name: '霜灵',
    description: '冰晶狐的进化形态，纯粹的冰之精灵',
    icon: '❄️',
    element: Element.Ice,
    quality: PetQuality.Epic,
    baseStats: {
      hp: 100, mp: 50, attack: 8, defense: 10,
      magicAttack: 25, magicDefense: 15, speed: 14,
      critRate: 0.07, critDamage: 1.5, dodge: 0.08, hitRate: 0.95
    },
    growth: {
      hp: 18, mp: 8, attack: 1.5, defense: 2,
      magicAttack: 4, magicDefense: 2.5, speed: 0.4,
      critRate: 0.003, critDamage: 0.015, dodge: 0.002
    },
    skills: ['pet_ice_breath', 'pet_blizzard'],
    mergeBonus: { magicAttack: 0.15, magicDefense: 0.08 },
    obtainFrom: { type: 'monster_drop', dropRate: 0 },
  },
]
