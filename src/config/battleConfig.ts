/**
 * 战斗参数配置
 */

/** 基础攻击间隔（毫秒） */
export const BASE_ATTACK_INTERVAL = 3000

/** 伤害浮动范围 */
export const DAMAGE_VARIANCE = 0.1 // ±10%

/** 伤害计算系数 */
export const DAMAGE_COEFFICIENTS = {
  /** 物理伤害防御减伤系数 */
  physicalDefense: 0.8,
  /** 魔法伤害魔抗减伤系数 */
  magicDefense: 0.7,
  /** 最小伤害 */
  minDamage: 1
}

/** 暴击相关 */
export const CRITICAL_CONFIG = {
  /** 基础暴击伤害倍率 */
  baseCritDamage: 1.5,
  /** 暴击伤害浮动 */
  critVariance: 0.05
}

/** 命中与闪避 */
export const HIT_CONFIG = {
  /** 基础命中率 */
  baseHitRate: 0.95,
  /** 最低命中率 */
  minHitRate: 0.6,
  /** 最高命中率 */
  maxHitRate: 0.99
}

/** 领主狂暴配置 */
export const LORD_ENRAGE_CONFIG = {
  /** 狂暴血量阈值 */
  threshold: 0.5,
  /** 狂暴攻击加成 */
  attackBonus: 0.3,
  /** 狂暴速度加成 */
  speedBonus: 0.2
}

/** 领主召唤配置 */
export const LORD_SUMMON_CONFIG = {
  /** 可召唤的怪物模板ID列表 */
  templates: ['minion_1', 'minion_2'],
  /** 最大召唤数量 */
  maxSummons: 2,
  /** 同时存在的召唤物上限 */
  maxTotalSummons: 6,
  /** 召唤间隔（毫秒） */
  interval: 15000
}

/** 药水恢复配置 */
export const POTION_CONFIG = {
  smallHp: {
    id: 'potion_hp_small',
    name: '小型生命药水',
    healValue: 50,
    price: 10
  },
  mediumHp: {
    id: 'potion_hp_medium',
    name: '中型生命药水',
    healValue: 150,
    price: 30
  },
  largeHp: {
    id: 'potion_hp_large',
    name: '大型生命药水',
    healValue: 300,
    price: 80
  },
  smallMp: {
    id: 'potion_mp_small',
    name: '小型魔法药水',
    healValue: 30,
    price: 15
  },
  mediumMp: {
    id: 'potion_mp_medium',
    name: '中型魔法药水',
    healValue: 80,
    price: 40
  },
  largeMp: {
    id: 'potion_mp_large',
    name: '大型魔法药水',
    healValue: 150,
    price: 100
  }
}

/** 计算攻击间隔（基于速度属性） */
export function calculateAttackInterval(speed: number): number {
  // 速度10 = 3000ms, 速度20 = 1500ms, 速度30 = 1000ms
  const speedFactor = speed / 10
  return Math.floor(BASE_ATTACK_INTERVAL / speedFactor)
}

/** 计算实际命中率 */
export function calculateHitRate(attackerHitRate: number, defenderDodge: number): number {
  const hitRate = attackerHitRate - defenderDodge
  return Math.max(HIT_CONFIG.minHitRate, Math.min(HIT_CONFIG.maxHitRate, hitRate))
}
