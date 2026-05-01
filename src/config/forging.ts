/**
 * 锻造配方配置
 */
import type { CraftRecipe, ForgingBlueprint } from '@/types'
import { Quality, EquipSlot } from '@/types'

/** 锻造配方列表 */
export const forgingRecipes: CraftRecipe[] = [
  // ===== 武器 =====
  {
    id: 'forge_sword_1',
    type: 'forging',
    name: '铁剑',
    description: '基础铁剑，新手必备',
    levelRequirement: 1,
    outputId: 'equip_sword_1',
    outputQuantity: 1,
    materials: [
      { templateId: 'mat_bone', quantity: 3 },
      { templateId: 'mat_slime_gel', quantity: 2 }
    ],
    goldCost: 50,
    successRate: 1.0
  },
  {
    id: 'forge_sword_2',
    type: 'forging',
    name: '精钢剑',
    description: '锋利的精钢长剑',
    levelRequirement: 10,
    outputId: 'equip_sword_2',
    outputQuantity: 1,
    outputQuality: Quality.Uncommon,
    materials: [
      { templateId: 'mat_rat_fang', quantity: 5 },
      { templateId: 'mat_bone', quantity: 8 },
      { templateId: 'mat_fire_essence', quantity: 1 }
    ],
    goldCost: 200,
    successRate: 0.85
  },
  {
    id: 'forge_staff_1',
    type: 'forging',
    name: '新手法杖',
    description: '普通木质法杖',
    levelRequirement: 1,
    outputId: 'equip_staff_1',
    outputQuantity: 1,
    materials: [
      { templateId: 'mat_bone', quantity: 2 },
      { templateId: 'mat_spider_silk', quantity: 2 }
    ],
    goldCost: 50,
    successRate: 1.0
  },
  {
    id: 'forge_bow_1',
    type: 'forging',
    name: '猎人短弓',
    description: '轻便的猎人弓',
    levelRequirement: 1,
    outputId: 'equip_bow_1',
    outputQuantity: 1,
    materials: [
      { templateId: 'mat_wolf_pelt', quantity: 3 },
      { templateId: 'mat_bone', quantity: 2 }
    ],
    goldCost: 50,
    successRate: 1.0
  },
  // ===== 防具 =====
  {
    id: 'forge_helmet_1',
    type: 'forging',
    name: '铁盔',
    description: '基础头盔',
    levelRequirement: 1,
    outputId: 'equip_helmet_1',
    outputQuantity: 1,
    materials: [
      { templateId: 'mat_bone', quantity: 4 },
      { templateId: 'mat_slime_gel', quantity: 2 }
    ],
    goldCost: 40,
    successRate: 1.0
  },
  {
    id: 'forge_armor_1',
    type: 'forging',
    name: '皮甲',
    description: '基础皮甲',
    levelRequirement: 1,
    outputId: 'equip_armor_1',
    outputQuantity: 1,
    materials: [
      { templateId: 'mat_wolf_pelt', quantity: 5 },
      { templateId: 'mat_slime_gel', quantity: 3 }
    ],
    goldCost: 60,
    successRate: 1.0
  },
  {
    id: 'forge_legs_1',
    type: 'forging',
    name: '布裤',
    description: '基础护腿',
    levelRequirement: 1,
    outputId: 'equip_legs_1',
    outputQuantity: 1,
    materials: [
      { templateId: 'mat_wolf_pelt', quantity: 3 },
      { templateId: 'mat_slime_gel', quantity: 2 }
    ],
    goldCost: 40,
    successRate: 1.0
  },
  {
    id: 'forge_boots_1',
    type: 'forging',
    name: '布靴',
    description: '基础靴子',
    levelRequirement: 1,
    outputId: 'equip_boots_1',
    outputQuantity: 1,
    materials: [
      { templateId: 'mat_wolf_pelt', quantity: 2 },
      { templateId: 'mat_rat_fang', quantity: 2 }
    ],
    goldCost: 40,
    successRate: 1.0
  },
  // ===== 高级 =====
  {
    id: 'forge_ring_attack',
    type: 'forging',
    name: '力量戒指',
    description: '提升攻击力的戒指',
    levelRequirement: 15,
    outputId: 'equip_ring_attack',
    outputQuantity: 1,
    outputQuality: Quality.Uncommon,
    materials: [
      { templateId: 'mat_rat_fang', quantity: 8 },
      { templateId: 'mat_fire_essence', quantity: 2 },
      { templateId: 'mat_bone', quantity: 5 }
    ],
    goldCost: 500,
    successRate: 0.75
  },
  {
    id: 'forge_necklace_hp',
    type: 'forging',
    name: '生命项链',
    description: '提升生命值的项链',
    levelRequirement: 15,
    outputId: 'equip_necklace_hp',
    outputQuantity: 1,
    outputQuality: Quality.Uncommon,
    materials: [
      { templateId: 'mat_slime_gel', quantity: 10 },
      { templateId: 'mat_ice_crystal', quantity: 2 },
      { templateId: 'mat_spider_silk', quantity: 5 }
    ],
    goldCost: 500,
    successRate: 0.75
  }
]

/** 锻造图纸列表 */
export const forgingBlueprints: ForgingBlueprint[] = [
  {
    id: 'bp_forge_basic',
    name: '基础锻造术',
    description: '学会制作基础武器和防具',
    levelRequirement: 1,
    recipeIds: ['forge_sword_1', 'forge_staff_1', 'forge_bow_1', 'forge_helmet_1', 'forge_armor_1', 'forge_legs_1', 'forge_boots_1'],
    source: '初始赠送'
  },
  {
    id: 'bp_forge_intermediate',
    name: '进阶锻造术',
    description: '学会制作精钢剑和饰品',
    levelRequirement: 10,
    recipeIds: ['forge_sword_2', 'forge_ring_attack', 'forge_necklace_hp'],
    source: '怪物掉落（10级以上）'
  }
]

/** 获取锻造配方 */
export function getForgingRecipe(id: string): CraftRecipe | undefined {
  return forgingRecipes.find(r => r.id === id)
}

/** 获取已解锁的锻造配方 */
export function getLearnedForgingRecipes(learnedIds: Set<string>): CraftRecipe[] {
  return forgingRecipes.filter(r => learnedIds.has(r.id))
}
