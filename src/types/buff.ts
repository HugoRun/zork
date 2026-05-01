/**
 * Buff/Debuff 类型定义
 * 支持属性加成、持续伤害(DOT)、持续治疗(HOT)、控制效果
 */

/** Buff效果类型 */
export enum BuffType {
  /** 属性加成/减益 */
  StatMod = 'statMod',
  /** 中毒DOT */
  Poison = 'poison',
  /** 灼烧DOT */
  Burn = 'burn',
  /** 持续回血HOT */
  Regen = 'regen',
  /** 冰冻（无法行动） */
  Freeze = 'freeze',
  /** 束缚（无法攻击） */
  Bind = 'bind',
  /** 眩晕（无法行动） */
  Stun = 'stun',
  /** 护盾（吸收伤害） */
  Shield = 'shield'
}

/** Buff来源类型 */
export type BuffTargetType = 'player' | 'monster'

/** 激活的Buff实例 */
export interface ActiveBuff {
  id: string
  type: BuffType
  name: string
  icon: string

  /** 施加者 */
  sourceId: string
  sourceName: string

  /** 是否为减益 */
  isDebuff: boolean

  /** 目标 */
  targetId: string
  targetType: BuffTargetType

  // === 属性加成（StatMod用） ===
  stat?: string
  value?: number
  isPercent?: boolean

  // === DOT/HOT（Poison/Burn/Regen用） ===
  tickDamage?: number       // 每tick伤害/治疗值
  tickInterval?: number     // tick间隔（毫秒）
  lastTickTime?: number     // 上次tick时间

  // === 护盾（Shield用） ===
  shieldAmount?: number     // 护盾剩余值
  maxShieldAmount?: number  // 护盾最大值

  // === 时间 ===
  appliedAt: number
  expireAt: number
}

/** Buff施加配置（从技能/物品中定义） */
export interface BuffApplyConfig {
  type: BuffType
  name: string
  icon: string
  duration: number           // 持续时间（毫秒）
  isDebuff: boolean

  // 属性加成
  stat?: string
  value?: number
  isPercent?: boolean

  // DOT/HOT
  tickDamage?: number
  tickInterval?: number

  // 护盾
  shieldAmount?: number
}

/** Buff tick处理结果 */
export interface BuffTickResult {
  buffId: string
  buffName: string
  targetId: string
  targetName: string
  type: BuffType

  /** DOT造成的伤害 */
  damage?: number
  /** HOT恢复的血量 */
  heal?: number
  /** 是否因为冰冻/眩晕而无法行动 */
  isFrozen?: boolean
  /** 护盾吸收了伤害 */
  shieldAbsorbed?: number
  /** buff是否过期 */
  expired: boolean
}

/** 属性名中文映射 */
export const STAT_NAMES: Record<string, string> = {
  attack: '攻击力',
  defense: '防御力',
  magicAttack: '魔法攻击',
  magicDefense: '魔法防御',
  speed: '速度',
  critRate: '暴击率',
  critDamage: '暴击伤害',
  dodge: '闪避率',
  hitRate: '命中率'
}

/** Buff类型对应的默认图标 */
export const BUFF_ICONS: Record<BuffType, string> = {
  [BuffType.StatMod]: '✨',
  [BuffType.Poison]: '🟢',
  [BuffType.Burn]: '🔥',
  [BuffType.Regen]: '💚',
  [BuffType.Freeze]: '❄️',
  [BuffType.Bind]: '🕸️',
  [BuffType.Stun]: '💫',
  [BuffType.Shield]: '🛡️'
}
