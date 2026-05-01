/**
 * 伤害计算 Composable
 * 纯函数伤害计算，与状态无关
 */
import { rollChance, randomFloat } from '@/utils/random'
import { DAMAGE_COEFFICIENTS, DAMAGE_VARIANCE, CRITICAL_CONFIG, HIT_CONFIG } from '@/config/battleConfig'
import type { DamageResult, DamageType } from '@/types'

/**
 * 计算物理伤害
 */
export function calculatePhysicalDamage(
  attack: number,
  defense: number
): number {
  // 基础伤害 = 攻击 * (1 + 随机浮动) - 防御 * 减伤系数
  const variance = randomFloat(-DAMAGE_VARIANCE, DAMAGE_VARIANCE)
  const baseDamage = attack * (1 + variance) - defense * DAMAGE_COEFFICIENTS.physicalDefense
  
  return Math.max(DAMAGE_COEFFICIENTS.minDamage, Math.floor(baseDamage))
}

/**
 * 计算魔法伤害
 */
export function calculateMagicDamage(
  magicAttack: number,
  magicDefense: number
): number {
  const variance = randomFloat(-DAMAGE_VARIANCE, DAMAGE_VARIANCE)
  const baseDamage = magicAttack * (1 + variance) - magicDefense * DAMAGE_COEFFICIENTS.magicDefense
  
  return Math.max(DAMAGE_COEFFICIENTS.minDamage, Math.floor(baseDamage))
}

/**
 * 计算技能伤害
 */
export function calculateSkillDamage(
  baseDamage: number,
  skillMultiplier: number,
  defense: number,
  isPhysical: boolean = true
): number {
  const variance = randomFloat(-DAMAGE_VARIANCE, DAMAGE_VARIANCE)
  const damage = baseDamage * skillMultiplier * (1 + variance)
  const reduction = defense * (isPhysical ? DAMAGE_COEFFICIENTS.physicalDefense : DAMAGE_COEFFICIENTS.magicDefense)
  
  return Math.max(DAMAGE_COEFFICIENTS.minDamage, Math.floor(damage - reduction))
}

/**
 * 检查是否命中
 */
export function checkHit(
  attackerHitRate: number,
  defenderDodge: number
): { hit: boolean; isDodge: boolean; isMiss: boolean } {
  // 计算实际命中率
  const actualHitRate = Math.max(
    HIT_CONFIG.minHitRate,
    Math.min(HIT_CONFIG.maxHitRate, attackerHitRate - defenderDodge)
  )
  
  if (!rollChance(actualHitRate)) {
    // 判断是闪避还是未命中
    if (rollChance(defenderDodge)) {
      return { hit: false, isDodge: true, isMiss: false }
    }
    return { hit: false, isDodge: false, isMiss: true }
  }
  
  return { hit: true, isDodge: false, isMiss: false }
}

/**
 * 检查是否暴击
 */
export function checkCritical(critRate: number): boolean {
  return rollChance(critRate)
}

/**
 * 计算暴击伤害
 */
export function calculateCriticalDamage(baseDamage: number, critDamage: number): number {
  const variance = randomFloat(-0.05, 0.05)
  return Math.floor(baseDamage * (critDamage + variance))
}

/**
 * 执行完整的伤害计算流程
 */
export function executeDamageCalculation(params: {
  attackerId: string
  attackerName: string
  defenderId: string
  defenderName: string
  attackerAttack: number
  attackerMagicAttack: number
  attackerCritRate: number
  attackerCritDamage: number
  attackerHitRate: number
  defenderDefense: number
  defenderMagicDefense: number
  defenderDodge: number
  damageType: DamageType
  skillMultiplier?: number
  skillName?: string
}): DamageResult {
  const timestamp = Date.now()
  
  // 检查命中
  const hitResult = checkHit(params.attackerHitRate, params.defenderDodge)
  
  if (!hitResult.hit) {
    return {
      attackerId: params.attackerId,
      attackerName: params.attackerName,
      defenderId: params.defenderId,
      defenderName: params.defenderName,
      damage: 0,
      isCrit: false,
      isDodge: hitResult.isDodge,
      isMiss: hitResult.isMiss,
      damageType: params.damageType,
      skillName: params.skillName,
      timestamp
    }
  }
  
  // 计算基础伤害
  let baseDamage: number
  
  if (params.damageType === 'magic') {
    baseDamage = calculateMagicDamage(params.attackerMagicAttack, params.defenderMagicDefense)
  } else if (params.skillMultiplier) {
    baseDamage = calculateSkillDamage(
      params.damageType === 'magic' ? params.attackerMagicAttack : params.attackerAttack,
      params.skillMultiplier,
      params.damageType === 'magic' ? params.defenderMagicDefense : params.defenderDefense,
      params.damageType === 'physical'
    )
  } else {
    baseDamage = calculatePhysicalDamage(params.attackerAttack, params.defenderDefense)
  }
  
  // 检查暴击
  const isCrit = checkCritical(params.attackerCritRate)
  
  if (isCrit) {
    baseDamage = calculateCriticalDamage(baseDamage, params.attackerCritDamage)
  }
  
  return {
    attackerId: params.attackerId,
    attackerName: params.attackerName,
    defenderId: params.defenderId,
    defenderName: params.defenderName,
    damage: baseDamage,
    isCrit,
    isDodge: false,
    isMiss: false,
    damageType: params.damageType,
    skillName: params.skillName,
    timestamp
  }
}

/**
 * 计算治疗量
 */
export function calculateHeal(baseHeal: number, multiplier: number = 1): number {
  return Math.floor(baseHeal * multiplier)
}

/**
 * 计算DPS
 */
export function calculateDps(totalDamage: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  return Math.floor(totalDamage / (durationMs / 1000))
}

/**
 * 伤害计算 Composable
 * 统一暴露伤害计算函数供其他模块使用
 */
export function useDamageCalc() {
  return {
    calculatePhysicalDamage,
    calculateMagicDamage,
    calculateSkillDamage,
    checkHit,
    checkCritical,
    calculateCriticalDamage,
    executeDamageCalculation,
    calculateHeal,
    calculateDps
  }
}
