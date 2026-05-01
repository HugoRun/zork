import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player, CreatePlayerParams } from '@/types'
import type { Item } from '@/types'
import { CharacterClass, EquipSlot } from '@/types'
import { getClassAdvancement, getNextTierConfig, MAX_ADVANCEMENT_TIER } from '@/config/classAdvancement'
import { useAccountStore } from './accountStore'

/**
 * 按账号隔离的 localStorage 适配器
 */
function createAccountStorage() {
  return {
    getItem: (key: string): string | null => {
      const prefix = useAccountStore().getAccountStoragePrefix()
      return localStorage.getItem(prefix + key)
    },
    setItem: (key: string, value: string): void => {
      const prefix = useAccountStore().getAccountStoragePrefix()
      localStorage.setItem(prefix + key, value)
    },
    removeItem: (key: string): void => {
      const prefix = useAccountStore().getAccountStoragePrefix()
      localStorage.removeItem(prefix + key)
    }
  }
}

/**
 * 玩家状态管理（按账号隔离）
 */
export const usePlayerStore = defineStore('player', () => {
  // ==================== 状态 ====================
  
  /** 当前角色 */
  const player = ref<Player | null>(null)
  
  /** 是否已创建角色 */
  const hasPlayer = computed(() => player.value !== null)
  
  // ==================== 角色创建 ====================
  
  /**
   * 创建新角色
   */
  function createPlayer(params: CreatePlayerParams): void {
    const now = Date.now()
    
    player.value = {
      id: `player_${now}`,
      name: params.name,
      class: params.class,
      level: 1,
      exp: 0,
      gold: 100, // 初始金币
      
      currentHp: 100,
      currentMp: 50,
      
      baseStats: getClassBaseStats(params.class),
      
      equipment: {},
      skillPriority: [],
      skillLevels: {}, // 所有技能默认Lv.1

      advancementTier: 1, // 进阶阶段初始为1
      
      createdAt: now,
      lastOnlineAt: now
    }
  }
  
  /**
   * 获取职业基础属性
   */
  function getClassBaseStats(charClass: CharacterClass) {
    const statsMap = {
      [CharacterClass.Warrior]: {
        hp: 200,
        mp: 40,
        attack: 15,
        defense: 14,
        magicAttack: 5,
        magicDefense: 8,
        speed: 8,
        critRate: 0.05,
        critDamage: 1.5,
        dodge: 0.03,
        hitRate: 0.95
      },
      [CharacterClass.Mage]: {
        hp: 120,
        mp: 120,
        attack: 5,
        defense: 6,
        magicAttack: 22,
        magicDefense: 14,
        speed: 10,
        critRate: 0.08,
        critDamage: 1.8,
        dodge: 0.05,
        hitRate: 0.92
      },
      [CharacterClass.Ranger]: {
        hp: 140,
        mp: 70,
        attack: 12,
        defense: 10,
        magicAttack: 8,
        magicDefense: 10,
        speed: 15,
        critRate: 0.12,
        critDamage: 2.0,
        dodge: 0.1,
        hitRate: 0.97
      }
    }
    return statsMap[charClass]
  }
  
  // ==================== 属性与经验 ====================
  
  /**
   * 获取升级所需经验
   */
  function getExpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.2, level - 1))
  }
  
  /**
   * 增加经验值
   */
  function addExp(amount: number): boolean {
    if (!player.value) return false
    
    player.value.exp += amount
    player.value.lastOnlineAt = Date.now()
    
    // 检查升级
    const expNeeded = getExpForLevel(player.value.level)
    if (player.value.exp >= expNeeded && player.value.level < 50) {
      levelUp()
      return true
    }
    return false
  }
  
  /**
   * 升级
   */
  function levelUp(): void {
    if (!player.value || player.value.level >= 50) return
    
    const expNeeded = getExpForLevel(player.value.level)
    player.value.exp -= expNeeded
    player.value.level++
    
    // 增加属性
    applyLevelGrowth()
    
    // 恢复满状态
    player.value.currentHp = player.value.baseStats.hp
    player.value.currentMp = player.value.baseStats.mp
  }
  
  /**
   * 应用等级成长
   */
  function applyLevelGrowth(): void {
    if (!player.value) return
    
    const growthMap = {
      [CharacterClass.Warrior]: {
        hp: 28, mp: 4, attack: 3.5, defense: 3.5,
        magicAttack: 0.5, magicDefense: 1.5, speed: 0.3,
        critRate: 0.002, critDamage: 0.01, dodge: 0.001
      },
      [CharacterClass.Mage]: {
        hp: 16, mp: 14, attack: 0.5, defense: 1.5,
        magicAttack: 4.5, magicDefense: 3, speed: 0.3,
        critRate: 0.003, critDamage: 0.02, dodge: 0.002
      },
      [CharacterClass.Ranger]: {
        hp: 20, mp: 7, attack: 3, defense: 2,
        magicAttack: 1, magicDefense: 1.5, speed: 0.6,
        critRate: 0.004, critDamage: 0.025, dodge: 0.003
      }
    }
    
    const growth = growthMap[player.value.class]
    const stats = player.value.baseStats
    
    stats.hp += growth.hp
    stats.mp += growth.mp
    stats.attack += growth.attack
    stats.defense += growth.defense
    stats.magicAttack += growth.magicAttack
    stats.magicDefense += growth.magicDefense
    stats.speed += growth.speed
    stats.critRate += growth.critRate
    stats.critDamage += growth.critDamage
    stats.dodge += growth.dodge
  }
  
  // ==================== 金币 ====================
  
  /**
   * 增加金币
   */
  function addGold(amount: number): void {
    if (!player.value) return
    player.value.gold += amount
    player.value.lastOnlineAt = Date.now()
  }
  
  /**
   * 扣除金币
   */
  function deductGold(amount: number): boolean {
    if (!player.value || player.value.gold < amount) return false
    player.value.gold -= amount
    player.value.lastOnlineAt = Date.now()
    return true
  }
  
  // ==================== HP/MP ====================
  
  /**
   * 修改当前HP
   */
  function modifyHp(amount: number): void {
    if (!player.value) return
    player.value.currentHp = Math.max(0, Math.min(
      player.value.baseStats.hp,
      player.value.currentHp + amount
    ))
  }
  
  /**
   * 修改当前MP
   */
  function modifyMp(amount: number): void {
    if (!player.value) return
    player.value.currentMp = Math.max(0, Math.min(
      player.value.baseStats.mp,
      player.value.currentMp + amount
    ))
  }
  
  // ==================== 装备 ====================
  
  /**
   * 穿戴装备
   * @returns 被替换的旧装备（Item），如果没有则返回 null
   */
  function equipItem(slot: EquipSlot, item: Item): Item | null {
    if (!player.value) return null

    const oldItem = player.value.equipment[slot] || null
    player.value.equipment[slot] = item
    return oldItem
  }

  /**
   * 卸下装备
   * @returns 卸下的装备（Item），如果没有则返回 null
   */
  function unequipItem(slot: EquipSlot): Item | null {
    if (!player.value) return null

    const item = player.value.equipment[slot] || null
    delete player.value.equipment[slot]
    return item
  }
  
  // ==================== 其他 ====================

  /**
   * 获取技能等级
   */
  function getSkillLevel(skillId: string): number {
    return player.value?.skillLevels?.[skillId] || 1
  }

  /**
   * 升级技能
   * @returns true=升级成功, false=失败
   */
  function upgradeSkill(skillId: string, cost: number): boolean {
    if (!player.value) return false
    if ((player.value.gold || 0) < cost) return false

    const currentLevel = player.value.skillLevels?.[skillId] || 1
    if (currentLevel >= 5) return false

    if (!player.value.skillLevels) player.value.skillLevels = {}
    player.value.skillLevels[skillId] = currentLevel + 1
    player.value.gold -= cost
    return true
  }

  /**
   * 获取当前进阶阶段
   */
  const currentTier = computed(() => player.value?.advancementTier || 1)

  /**
   * 获取当前进阶配置
   */
  const currentTierConfig = computed(() => {
    if (!player.value) return null
    const tier = player.value.advancementTier || 1
    return getClassAdvancement(player.value.class).tiers[tier - 1] || null
  })

  /**
   * 获取下一进阶配置
   */
  const nextTierConfig = computed(() => {
    if (!player.value) return null
    const tier = player.value.advancementTier || 1
    return getNextTierConfig(player.value.class, tier)
  })

  /**
   * 进阶
   */
  function advanceClass(): boolean {
    if (!player.value) return false
    const current = player.value.advancementTier || 1
    if (current >= MAX_ADVANCEMENT_TIER) return false

    const next = getNextTierConfig(player.value.class, current)
    if (!next) return false

    if (player.value.level < next.requiredLevel) return false
    if (player.value.gold < next.goldCost) return false

    // 扣除金币
    player.value.gold -= next.goldCost

    // 提升进阶阶段
    player.value.advancementTier = current + 1

    // 应用属性加成
    const stats = player.value.baseStats
    const bonus = next.statBonus
    if (bonus.hp) stats.hp += bonus.hp
    if (bonus.mp) stats.mp += bonus.mp
    if (bonus.attack) stats.attack += bonus.attack
    if (bonus.defense) stats.defense += bonus.defense
    if (bonus.magicAttack) stats.magicAttack += bonus.magicAttack
    if (bonus.magicDefense) stats.magicDefense += bonus.magicDefense
    if (bonus.speed) stats.speed += bonus.speed
    if (bonus.critRate) stats.critRate += bonus.critRate
    if (bonus.critDamage) stats.critDamage += bonus.critDamage
    if (bonus.dodge) stats.dodge += bonus.dodge

    // 恢复满状态
    player.value.currentHp = stats.hp
    player.value.currentMp = stats.mp

    return true
  }

  /**
   * 重置角色
   */
  function resetPlayer(): void {
    player.value = null
  }
  
  return {
    // 状态
    player,
    hasPlayer,
    
    // 方法
    createPlayer,
    getExpForLevel,
    addExp,
    levelUp,
    addGold,
    deductGold,
    getSkillLevel,
    upgradeSkill,
    modifyHp,
    modifyMp,
    equipItem,
    unequipItem,
    currentTier,
    currentTierConfig,
    nextTierConfig,
    advanceClass,
    resetPlayer
  }
}, {
  persist: {
    key: 'player',
    storage: createAccountStorage()
  }
})
