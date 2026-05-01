/**
 * 通用类型定义
 * 包含枚举、基础接口等
 */

/** 物品品质枚举 */
export enum Quality {
  Common = 'common',      // 普通（白色）
  Uncommon = 'uncommon',  // 优秀（绿色）
  Rare = 'rare',          // 稀有（蓝色）
  Epic = 'epic',          // 史诗（紫色）
  Legendary = 'legendary' // 传说（橙色）
}

/** 怪物头衔枚举 */
export enum MonsterTitle {
  Normal = 'normal', // 普通
  Elite = 'elite',   // 精英
  Lord = 'lord'      // 领主
}

/** 装备栏位枚举 */
export enum EquipSlot {
  Weapon = 'weapon',   // 武器
  Helmet = 'helmet',   // 头盔
  Armor = 'armor',     // 铠甲
  Legs = 'legs',       // 护腿
  Boots = 'boots',     // 靴子
  Ring = 'ring',       // 戒指
  Necklace = 'necklace' // 项链
}

/** 职业枚举 */
export enum CharacterClass {
  Warrior = 'warrior', // 战士
  Mage = 'mage',       // 法师
  Ranger = 'ranger'    // 游侠
}

/** 元素属性枚举 */
export enum Element {
  Physical = 'physical', // 物理
  Fire = 'fire',         // 火焰
  Ice = 'ice',           // 冰霜
  Lightning = 'lightning', // 闪电
  Poison = 'poison'      // 毒素
}

/** 物品类型枚举 */
export enum ItemType {
  Equipment = 'equipment', // 装备
  Potion = 'potion',       // 药水
  Material = 'material'    // 材料
}

/** 品质颜色映射 */
export const QUALITY_COLORS: Record<Quality, string> = {
  [Quality.Common]: '#9CA3AF',
  [Quality.Uncommon]: '#10B981',
  [Quality.Rare]: '#3B82F6',
  [Quality.Epic]: '#8B5CF6',
  [Quality.Legendary]: '#F59E0B'
}

/** 头衔颜色映射 */
export const TITLE_COLORS: Record<MonsterTitle, string> = {
  [MonsterTitle.Normal]: '#FFFFFF',
  [MonsterTitle.Elite]: '#F59E0B',
  [MonsterTitle.Lord]: '#EF4444'
}

/** 基础属性接口 */
export interface BaseStats {
  hp: number        // 生命值上限
  mp: number        // 魔法值上限
  attack: number    // 物理攻击
  defense: number   // 物理防御
  magicAttack: number // 魔法攻击
  magicDefense: number // 魔法防御
  speed: number     // 速度
  critRate: number  // 暴击率 (0-1)
  critDamage: number // 暴击伤害倍率 (1.5 = 150%)
  dodge: number     // 闪避率 (0-1)
  hitRate: number   // 命中率 (0-1)
}
