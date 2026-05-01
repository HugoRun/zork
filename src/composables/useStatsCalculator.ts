/**
 * 属性计算 Composable
 * 计算角色总属性（基础 + 装备 + 技能加成）
 */
import { computed } from 'vue'
import type { BaseStats } from '@/types'
import { usePlayerStore } from '@/stores/playerStore'
import { usePetStore } from '@/stores/petStore'
import { PET_TEMPLATES } from '@/types'

/**
 * 属性计算器
 */
export function useStatsCalculator() {
  const playerStore = usePlayerStore()
  const petStore = usePetStore()
  
  /**
   * 计算总属性
   */
  const totalStats = computed<BaseStats>(() => {
    const player = playerStore.player
    if (!player) {
      return {
        hp: 0, mp: 0, attack: 0, defense: 0,
        magicAttack: 0, magicDefense: 0, speed: 0,
        critRate: 0, critDamage: 0, dodge: 0, hitRate: 0
      }
    }
    
    // 基础属性
    const base = { ...player.baseStats }
    
    // 装备加成
    const equipmentBonus = calculateEquipmentBonus()

    // 合体宠物加成
    const mergeBonus = calculateMergeBonus()

    // 合并属性
    return {
      hp: base.hp + equipmentBonus.hp + mergeBonus.hp,
      mp: base.mp + equipmentBonus.mp + mergeBonus.mp,
      attack: base.attack + equipmentBonus.attack + mergeBonus.attack,
      defense: base.defense + equipmentBonus.defense + mergeBonus.defense,
      magicAttack: base.magicAttack + equipmentBonus.magicAttack + mergeBonus.magicAttack,
      magicDefense: base.magicDefense + equipmentBonus.magicDefense + mergeBonus.magicDefense,
      speed: base.speed + equipmentBonus.speed + mergeBonus.speed,
      critRate: base.critRate + equipmentBonus.critRate + mergeBonus.critRate,
      critDamage: base.critDamage + equipmentBonus.critDamage + mergeBonus.critDamage,
      dodge: base.dodge + equipmentBonus.dodge + mergeBonus.dodge,
      hitRate: base.hitRate + equipmentBonus.hitRate + mergeBonus.hitRate
    }
  })
  
  /**
   * 计算装备加成
   */
  function calculateEquipmentBonus(): BaseStats {
    const player = playerStore.player
    if (!player) {
      return {
        hp: 0, mp: 0, attack: 0, defense: 0,
        magicAttack: 0, magicDefense: 0, speed: 0,
        critRate: 0, critDamage: 0, dodge: 0, hitRate: 0
      }
    }
    
    const bonus: BaseStats = {
      hp: 0, mp: 0, attack: 0, defense: 0,
      magicAttack: 0, magicDefense: 0, speed: 0,
      critRate: 0, critDamage: 0, dodge: 0, hitRate: 0
    }
    
    // 遍历所有装备槽位
    Object.values(player.equipment).forEach(item => {
      if (!item) return

      // 装备的 stats 字段直接存储了随机品质后的属性
      const stats = (item as any).stats
      if (!stats) return

      if (stats.hp) bonus.hp += stats.hp
      if (stats.mp) bonus.mp += stats.mp
      if (stats.attack) bonus.attack += stats.attack
      if (stats.defense) bonus.defense += stats.defense
      if (stats.magicAttack) bonus.magicAttack += stats.magicAttack
      if (stats.magicDefense) bonus.magicDefense += stats.magicDefense
      if (stats.speed) bonus.speed += stats.speed
      if (stats.critRate) bonus.critRate += stats.critRate
      if (stats.critDamage) bonus.critDamage += stats.critDamage
      if (stats.dodge) bonus.dodge += stats.dodge
    })
    
    return bonus
  }
  
  /**
   * 计算合体宠物属性加成
   */
  function calculateMergeBonus(): BaseStats {
    const bonus: BaseStats = {
      hp: 0, mp: 0, attack: 0, defense: 0,
      magicAttack: 0, magicDefense: 0, speed: 0,
      critRate: 0, critDamage: 0, dodge: 0, hitRate: 0
    }
    const mergedPets = petStore.mergedPets
    if (mergedPets.length === 0) return bonus

    for (const pet of mergedPets) {
      const template = PET_TEMPLATES.find(t => t.id === pet.templateId)
      if (!template?.mergeBonus) continue
      const mb = template.mergeBonus
      if (mb.attack) bonus.attack += pet.baseStats.attack * mb.attack
      if (mb.defense) bonus.defense += pet.baseStats.defense * mb.defense
      if (mb.magicAttack) bonus.magicAttack += pet.baseStats.magicAttack * mb.magicAttack
      if (mb.magicDefense) bonus.magicDefense += pet.baseStats.magicDefense * mb.magicDefense
      if (mb.speed) bonus.speed += pet.baseStats.speed * mb.speed
      if (mb.critRate) bonus.critRate += mb.critRate
      if (mb.critDamage) bonus.critDamage += mb.critDamage
    }
    return bonus
  }

  /**
   * 计算战斗力（用于排名等）
   */
  const combatPower = computed(() => {
    const stats = totalStats.value
    return Math.floor(
      stats.hp * 0.5 +
      stats.mp * 0.3 +
      stats.attack * 2 +
      stats.defense * 1.5 +
      stats.magicAttack * 2 +
      stats.magicDefense * 1.5 +
      stats.speed * 3 +
      stats.critRate * 100 +
      stats.critDamage * 50 +
      stats.dodge * 100
    )
  })
  
  return {
    totalStats,
    combatPower,
    calculateEquipmentBonus
  }
}
