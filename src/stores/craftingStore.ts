/**
 * 制作系统 Store
 * 管理炼金、锻造、附魔
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CraftRecipe, CraftType, EnchantResult, EquipmentEnchant } from '@/types'
import { Quality, QUALITY_MAX_ENCHANTS } from '@/types'
import { useInventoryStore } from '@/stores/inventoryStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import { useItemDrop } from '@/composables/useItemDrop'
import { alchemyRecipes, alchemyBlueprints } from '@/config/alchemy'
import { forgingRecipes, forgingBlueprints } from '@/config/forging'
import {
  getAvailableAffixes, getEnchantAffix, getEnchantSuccessRate,
  ENCHANT_COSTS
} from '@/config/enchantments'
import { getItemTemplate } from '@/config/shop'
import { getEquipmentTemplate } from '@/config/equipment'
import { generateId, rollChance, weightedChoice } from '@/utils/random'
import { useAccountStore } from './accountStore'

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

export const useCraftingStore = defineStore('crafting', () => {
  // ==================== 状态 ====================

  /** 已学习的配方ID集合 */
  const learnedRecipeIds = ref<string[]>([])

  /** 已学习的图纸ID集合 */
  const learnedBlueprintIds = ref<string[]>([])

  /** 确保值是数组（兼容持久化恢复的异常类型） */
  function ensureArray(val: any): string[] {
    if (Array.isArray(val)) return val
    if (val instanceof Set) return [...val]
    if (val && typeof val === 'object') return Object.values(val)
    return []
  }

  /** 装备附魔记录（key=物品实例ID） */
  const equipmentEnchants = ref<Record<string, EquipmentEnchant>>({})

  // ==================== 计算属性 ====================

  /** 已学习的炼金配方 */
  const learnedAlchemyRecipes = computed(() =>
    alchemyRecipes.filter(r => ensureArray(learnedRecipeIds.value).includes(r.id))
  )

  /** 已学习的锻造配方 */
  const learnedForgingRecipes = computed(() =>
    forgingRecipes.filter(r => ensureArray(learnedRecipeIds.value).includes(r.id))
  )

  /** 可学习的炼金图纸 */
  const availableAlchemyBlueprints = computed(() =>
    alchemyBlueprints.filter(bp => !ensureArray(learnedBlueprintIds.value).includes(bp.id))
  )

  /** 可学习的锻造图纸 */
  const availableForgingBlueprints = computed(() =>
    forgingBlueprints.filter(bp => !ensureArray(learnedBlueprintIds.value).includes(bp.id))
  )

  // ==================== 图纸学习 ====================

  /**
   * 学习图纸（解锁对应配方）
   */
  function learnBlueprint(blueprintId: string): { success: boolean; message: string } {
    const allBps = [...alchemyBlueprints, ...forgingBlueprints]
    const bp = allBps.find(b => b.id === blueprintId)
    if (!bp) return { success: false, message: '图纸不存在' }

    if (ensureArray(learnedBlueprintIds.value).includes(blueprintId)) {
      return { success: false, message: '已学习过该图纸' }
    }

    const player = usePlayerStore().player
    if (player && player.level < bp.levelRequirement) {
      return { success: false, message: `需要等级 ${bp.levelRequirement}` }
    }

    learnedBlueprintIds.value = ensureArray(learnedBlueprintIds.value)
    learnedBlueprintIds.value.push(blueprintId)
    learnedRecipeIds.value = ensureArray(learnedRecipeIds.value)
    bp.recipeIds.forEach(rid => {
      if (!learnedRecipeIds.value.includes(rid)) {
        learnedRecipeIds.value.push(rid)
      }
    })

    return { success: true, message: `学会了「${bp.name}」，解锁 ${bp.recipeIds.length} 个配方` }
  }

  // ==================== 炼金/锻造制作 ====================

  /**
   * 检查是否可以制作
   */
  function canCraft(recipe: CraftRecipe): { can: boolean; reason: string } {
    const player = usePlayerStore().player
    if (!player) return { can: false, reason: '无角色' }
    if (player.level < recipe.levelRequirement) {
      return { can: false, reason: `需要等级 ${recipe.levelRequirement}` }
    }
    if (!ensureArray(learnedRecipeIds.value).includes(recipe.id)) {
      return { can: false, reason: '未学习该配方' }
    }
    if (player.gold < recipe.goldCost) {
      return { can: false, reason: `金币不足（需要 ${recipe.goldCost}）` }
    }

    const inventory = useInventoryStore()
    for (const mat of recipe.materials) {
      const count = inventory.getItemCount(mat.templateId)
      if (count < mat.quantity) {
        const tpl = getItemTemplate(mat.templateId)
        return { can: false, reason: `${tpl?.name || mat.templateId} 不足（需要 ${mat.quantity}，拥有 ${count}）` }
      }
    }

    return { can: true, reason: '' }
  }

  /**
   * 执行制作
   */
  function craft(recipe: CraftRecipe): { success: boolean; message: string } {
    const check = canCraft(recipe)
    if (!check.can) return { success: false, message: check.reason }

    // 扣除金币
    const playerStore = usePlayerStore()
    playerStore.deductGold(recipe.goldCost)

    // 扣除材料
    const inventory = useInventoryStore()
    for (const mat of recipe.materials) {
      inventory.decreaseItemByTemplateId(mat.templateId, mat.quantity)
    }

    // 判断成功率
    if (!rollChance(recipe.successRate)) {
      const gameStore = useGameStore()
      gameStore.addLog({ type: 'system', content: `制作「${recipe.name}」失败！材料已消耗。` })
      return { success: false, message: '制作失败，材料已消耗' }
    }

    // 创建产出
    const { createItem } = useItemDrop()

    if (recipe.type === 'forging') {
      // 锻造：创建装备
      const item = createItem(recipe.outputId, recipe.outputQuantity)
      if (item) {
        inventory.addItem(item)
        const gameStore = useGameStore()
        gameStore.addLog({ type: 'system', content: `锻造成功！获得 ${item.name}` })
        return { success: true, message: `锻造成功，获得 ${item.name}` }
      }
    } else {
      // 炼金：创建药水/道具
      for (let i = 0; i < recipe.outputQuantity; i++) {
        const item = createItem(recipe.outputId, 1)
        if (item) inventory.addItem(item)
      }
      const gameStore = useGameStore()
      gameStore.addLog({ type: 'system', content: `炼金成功！获得 ${recipe.name} x${recipe.outputQuantity}` })
      return { success: true, message: `炼金成功，获得 ${recipe.name} x${recipe.outputQuantity}` }
    }

    return { success: false, message: '制作失败' }
  }

  // ==================== 附魔系统 ====================

  /**
   * 获取装备的附魔信息
   */
  function getEquipmentEnchant(itemId: string): EquipmentEnchant | undefined {
    return equipmentEnchants.value[itemId]
  }

  /**
   * 检查是否可以附魔
   */
  function canEnchant(itemId: string): { can: boolean; reason: string } {
    const inventory = useInventoryStore()
    const item = inventory.getItem(itemId)
    if (!item) return { can: false, reason: '物品不存在' }

    const equipTpl = getEquipmentTemplate(item.templateId)
    if (!equipTpl) return { can: false, reason: '非装备物品' }

    const quality = item.quality
    const maxCount = QUALITY_MAX_ENCHANTS[quality]
    const current = equipmentEnchants.value[itemId]

    if (current && current.enchantCount >= current.maxEnchantCount) {
      return { can: false, reason: `已达最大强化次数（${current.maxEnchantCount}）` }
    }

    const cost = ENCHANT_COSTS[quality]
    if (!cost) return { can: false, reason: '该品质不可附魔' }

    const player = usePlayerStore().player
    if (!player || player.gold < cost.gold) {
      return { can: false, reason: `金币不足（需要 ${cost.gold}）` }
    }

    for (const mat of cost.materials) {
      const count = inventory.getItemCount(mat.templateId)
      if (count < mat.quantity) {
        const tpl = getItemTemplate(mat.templateId)
        return { can: false, reason: `${tpl?.name || mat.templateId} 不足` }
      }
    }

    return { can: true, reason: '' }
  }

  /**
   * 执行附魔
   */
  function enchant(itemId: string): EnchantResult {
    const check = canEnchant(itemId)
    if (!check.can) {
      return { success: false, message: check.reason }
    }

    const inventory = useInventoryStore()
    const item = inventory.getItem(itemId)
    if (!item) return { success: false, message: '物品不存在' }

    const quality = item.quality
    const cost = ENCHANT_COSTS[quality]
    const current = equipmentEnchants.value[itemId]
    const currentCount = current ? current.enchantCount : 0
    const maxCount = QUALITY_MAX_ENCHANTS[quality]

    // 扣除消耗
    const playerStore = usePlayerStore()
    playerStore.deductGold(cost.gold)
    for (const mat of cost.materials) {
      inventory.decreaseItemByTemplateId(mat.templateId, mat.quantity)
    }

    // 成功率判定
    const successRate = getEnchantSuccessRate(quality, currentCount)
    if (!rollChance(successRate)) {
      // 失败：已有词条的降级处理
      if (current && current.level > 1) {
        current.level = Math.max(1, current.level - 1)
      }
      const gameStore = useGameStore()
      gameStore.addLog({ type: 'system', content: `附魔失败！${current && current.level > 1 ? '词条等级下降。' : ''}` })
      return { success: false, message: `附魔失败！${current && current.level > 1 ? '词条等级 -1' : ''}` }
    }

    // 成功：随机选择词条
    const equipTpl = getEquipmentTemplate(item.templateId)
    const available = getAvailableAffixes(quality, equipTpl?.slot)

    if (available.length === 0) {
      return { success: false, message: '没有可用的词条' }
    }

    // 加权随机选择
    const weights = available.map(a => a.weight)
    const affix = weightedChoice(available, weights)!


    // 更新附魔记录
    const newLevel = current ? current.level + 1 : 1
    equipmentEnchants.value[itemId] = {
      affixId: affix.id,
      level: newLevel,
      enchantCount: currentCount + 1,
      maxEnchantCount: maxCount
    }

    // 更新物品描述
    if (equipTpl) {
      item.description = `${equipTpl.name} [${affix.name}${item.name}]`
    }

    const gameStore = useGameStore()
    gameStore.addLog({
      type: 'system',
      content: `附魔成功！${item.name} 获得「${affix.name}」(Lv.${newLevel})`
    })

    return {
      success: true,
      affix,
      newLevel,
      message: `附魔成功！获得「${affix.name}」词条 Lv.${newLevel}`
    }
  }

  /**
   * 获取装备附魔提供的属性加成
   */
  function getEnchantStats(itemId: string) {
    const enchant = equipmentEnchants.value[itemId]
    if (!enchant) return null

    const affix = getEnchantAffix(enchant.affixId)
    if (!affix) return null

    const stats: Record<string, number> = {}
    for (const [key, val] of Object.entries(affix.stats)) {
      if (val !== undefined) {
        stats[key] = Math.floor((val as number) * enchant.level)
      }
    }
    return stats
  }

  // ==================== 初始化 ====================

  /**
   * 初始学习基础图纸
   */
  function initBlueprints() {
    // 基础炼金术
    learnBlueprint('bp_alc_basic')
    // 基础锻造术
    learnBlueprint('bp_forge_basic')
  }

  return {
    // 状态
    learnedRecipeIds,
    learnedBlueprintIds,
    equipmentEnchants,

    // 计算属性
    learnedAlchemyRecipes,
    learnedForgingRecipes,
    availableAlchemyBlueprints,
    availableForgingBlueprints,

    // 方法
    learnBlueprint,
    canCraft,
    craft,
    getEquipmentEnchant,
    canEnchant,
    enchant,
    getEnchantStats,
    initBlueprints
  }
}, {
  persist: {
    key: 'crafting',
    storage: createAccountStorage(),
    paths: ['learnedRecipeIds', 'learnedBlueprintIds', 'equipmentEnchants']
  }
})
