/**
 * Buff 管理器
 * 管理战斗中所有单位（玩家和怪物）的 buff/debuff
 * 处理每 tick 的 DOT/HOT 效果、控制效果检查、过期清理
 */
import { ref } from 'vue'
import { generateId } from '@/utils/random'
import type { ActiveBuff, BuffApplyConfig, BuffTickResult } from '@/types'
import { BuffType } from '@/types'

/**
 * Buff 管理器（单例式 composable）
 */
export function useBuffManager() {
  /** 所有激活的 buff 列表 */
  const activeBuffs = ref<ActiveBuff[]>([])

  /**
   * 施加 buff 到目标
   */
  function applyBuff(
    config: BuffApplyConfig,
    sourceId: string,
    sourceName: string,
    targetId: string,
    targetType: 'player' | 'monster'
  ): ActiveBuff {
    const now = Date.now()

    // 检查同类 buff 是否已存在，存在则刷新持续时间
    const existing = activeBuffs.value.find(
      b => b.targetId === targetId && b.type === config.type && b.sourceId === sourceId
    )

    if (existing) {
      // 刷新持续时间
      existing.expireAt = now + config.duration
      // 刷新护盾值
      if (config.type === BuffType.Shield && config.shieldAmount) {
        existing.shieldAmount = config.shieldAmount
        existing.maxShieldAmount = config.shieldAmount
      }
      return existing
    }

    const buff: ActiveBuff = {
      id: generateId(),
      type: config.type,
      name: config.name,
      icon: config.icon,
      sourceId,
      sourceName,
      isDebuff: config.isDebuff,
      targetId,
      targetType,
      appliedAt: now,
      expireAt: now + config.duration
    }

    // 属性加成
    if (config.stat !== undefined) {
      buff.stat = config.stat
      buff.value = config.value
      buff.isPercent = config.isPercent ?? false
    }

    // DOT/HOT
    if (config.tickDamage !== undefined && config.tickInterval !== undefined) {
      buff.tickDamage = config.tickDamage
      buff.tickInterval = config.tickInterval
      buff.lastTickTime = now
    }

    // 护盾
    if (config.type === BuffType.Shield && config.shieldAmount !== undefined) {
      buff.shieldAmount = config.shieldAmount
      buff.maxShieldAmount = config.shieldAmount
    }

    activeBuffs.value.push(buff)
    return buff
  }

  /**
   * 每 tick 处理所有 buff 效果
   * @param delta 距离上次 tick 的毫秒数
   * @returns 需要处理的 tick 结果列表
   */
  function tick(delta: number): BuffTickResult[] {
    const now = Date.now()
    const results: BuffTickResult[] = []
    const expiredIds: string[] = []

    for (const buff of activeBuffs.value) {
      // 检查过期
      if (now >= buff.expireAt) {
        expiredIds.push(buff.id)
        results.push({
          buffId: buff.id,
          buffName: buff.name,
          targetId: buff.targetId,
          targetName: '',
          type: buff.type,
          expired: true
        })
        continue
      }

      // DOT/HOT tick 处理
      if (buff.tickDamage !== undefined && buff.tickInterval !== undefined && buff.lastTickTime !== undefined) {
        if (now - buff.lastTickTime >= buff.tickInterval) {
          buff.lastTickTime = now
          results.push({
            buffId: buff.id,
            buffName: buff.name,
            targetId: buff.targetId,
            targetName: '',
            type: buff.type,
            damage: buff.isDebuff ? buff.tickDamage : undefined,
            heal: !buff.isDebuff ? buff.tickDamage : undefined,
            expired: false
          })
        }
      }
    }

    // 移除过期的 buff
    if (expiredIds.length > 0) {
      activeBuffs.value = activeBuffs.value.filter(b => !expiredIds.includes(b.id))
    }

    return results
  }

  /**
   * 获取目标身上的所有激活 buff
   */
  function getBuffs(targetId: string): ActiveBuff[] {
    const now = Date.now()
    return activeBuffs.value.filter(b => b.targetId === targetId && b.expireAt > now)
  }

  /**
   * 获取目标身上的减益 buff
   */
  function getDebuffs(targetId: string): ActiveBuff[] {
    return getBuffs(targetId).filter(b => b.isDebuff)
  }

  /**
   * 检查目标是否被冻结/眩晕（无法行动）
   */
  function isControlled(targetId: string): boolean {
    const now = Date.now()
    return activeBuffs.value.some(
      b => b.targetId === targetId && b.expireAt > now &&
        (b.type === BuffType.Freeze || b.type === BuffType.Stun)
    )
  }

  /**
   * 检查目标是否被束缚（无法攻击）
   */
  function isBound(targetId: string): boolean {
    const now = Date.now()
    return activeBuffs.value.some(
      b => b.targetId === targetId && b.expireAt > now && b.type === BuffType.Bind
    )
  }

  /**
   * 计算目标身上的属性加成总和
   * @param stat 属性名
   * @param targetId 目标ID
   * @param baseValue 基础属性值（用于计算百分比加成）
   */
  function getStatModifier(targetId: string, stat: string, baseValue: number): number {
    const now = Date.now()
    const statBuffs = activeBuffs.value.filter(
      b => b.targetId === targetId && b.type === BuffType.StatMod &&
        b.stat === stat && b.expireAt > now && b.value !== undefined
    )

    let modifier = 0
    for (const buff of statBuffs) {
      if (buff.isPercent) {
        modifier += baseValue * buff.value
      } else {
        modifier += buff.value!
      }
    }
    return modifier
  }

  /**
   * 获取目标身上的护盾值
   */
  function getShield(targetId: string): number {
    const now = Date.now()
    return activeBuffs.value
      .filter(b => b.targetId === targetId && b.type === BuffType.Shield && b.expireAt > now)
      .reduce((sum, b) => sum + (b.shieldAmount || 0), 0)
  }

  /**
   * 从目标护盾中吸收伤害
   * @returns 被护盾吸收的伤害量
   */
  function absorbDamage(targetId: string, damage: number): number {
    let remaining = damage
    for (const buff of activeBuffs.value) {
      if (remaining <= 0) break
      if (buff.targetId !== targetId || buff.type !== BuffType.Shield) continue
      if (buff.expireAt <= Date.now() || !buff.shieldAmount) continue

      const absorbed = Math.min(buff.shieldAmount, remaining)
      buff.shieldAmount -= absorbed
      remaining -= absorbed
    }
    return damage - remaining
  }

  /**
   * 移除目标身上所有 buff（目标死亡时调用）
   */
  function clearTarget(targetId: string): void {
    activeBuffs.value = activeBuffs.value.filter(b => b.targetId !== targetId)
  }

  /**
   * 移除目标身上所有减益效果
   */
  function clearDebuffs(targetId: string): ActiveBuff[] {
    const removed = activeBuffs.value.filter(b => b.targetId === targetId && b.isDebuff)
    activeBuffs.value = activeBuffs.value.filter(b => !(b.targetId === targetId && b.isDebuff))
    return removed
  }

  /**
   * 移除指定类型的 buff
   */
  function removeBuffByType(targetId: string, type: BuffType): void {
    activeBuffs.value = activeBuffs.value.filter(
      b => !(b.targetId === targetId && b.type === type)
    )
  }

  /**
   * 清空所有 buff
   */
  function clearAll(): void {
    activeBuffs.value = []
  }

  return {
    activeBuffs,
    applyBuff,
    tick,
    getBuffs,
    getDebuffs,
    isControlled,
    isBound,
    getStatModifier,
    getShield,
    absorbDamage,
    clearTarget,
    clearDebuffs,
    removeBuffByType,
    clearAll
  }
}
