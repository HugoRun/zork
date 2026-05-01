/**
 * 炼金配方配置
 */
import type { CraftRecipe, AlchemyBlueprint } from '@/types'
import { ItemType, Quality } from '@/types'

/** 炼金配方列表 */
export const alchemyRecipes: CraftRecipe[] = [
  // ===== 生命药水 =====
  {
    id: 'alc_hp_small',
    type: 'alchemy',
    name: '小型生命药水',
    description: '恢复50点生命值',
    levelRequirement: 1,
    outputId: 'potion_hp_small',
    outputQuantity: 3,
    materials: [
      { templateId: 'mat_slime_gel', quantity: 2 },
      { templateId: 'mat_bone', quantity: 1 }
    ],
    goldCost: 20,
    successRate: 1.0
  },
  {
    id: 'alc_hp_medium',
    type: 'alchemy',
    name: '中型生命药水',
    description: '恢复150点生命值',
    levelRequirement: 10,
    outputId: 'potion_hp_medium',
    outputQuantity: 2,
    materials: [
      { templateId: 'mat_slime_gel', quantity: 5 },
      { templateId: 'mat_rat_fang', quantity: 3 },
      { templateId: 'mat_bone', quantity: 2 }
    ],
    goldCost: 80,
    successRate: 0.9
  },
  {
    id: 'alc_hp_large',
    type: 'alchemy',
    name: '大型生命药水',
    description: '恢复300点生命值',
    levelRequirement: 25,
    outputId: 'potion_hp_large',
    outputQuantity: 2,
    materials: [
      { templateId: 'mat_spider_silk', quantity: 3 },
      { templateId: 'mat_fire_essence', quantity: 1 },
      { templateId: 'mat_wolf_pelt', quantity: 5 }
    ],
    goldCost: 200,
    successRate: 0.85
  },
  // ===== 魔法药水 =====
  {
    id: 'alc_mp_small',
    type: 'alchemy',
    name: '小型魔法药水',
    description: '恢复30点魔法值',
    levelRequirement: 1,
    outputId: 'potion_mp_small',
    outputQuantity: 3,
    materials: [
      { templateId: 'mat_spider_silk', quantity: 1 },
      { templateId: 'mat_slime_gel', quantity: 2 }
    ],
    goldCost: 25,
    successRate: 1.0
  },
  {
    id: 'alc_mp_medium',
    type: 'alchemy',
    name: '中型魔法药水',
    description: '恢复80点魔法值',
    levelRequirement: 10,
    outputId: 'potion_mp_medium',
    outputQuantity: 2,
    materials: [
      { templateId: 'mat_spider_silk', quantity: 4 },
      { templateId: 'mat_ice_crystal', quantity: 1 },
      { templateId: 'mat_goblin_ear', quantity: 3 }
    ],
    goldCost: 100,
    successRate: 0.9
  },
  {
    id: 'alc_mp_large',
    type: 'alchemy',
    name: '大型魔法药水',
    description: '恢复150点魔法值',
    levelRequirement: 25,
    outputId: 'potion_mp_large',
    outputQuantity: 2,
    materials: [
      { templateId: 'mat_ice_crystal', quantity: 3 },
      { templateId: 'mat_spider_silk', quantity: 5 },
      { templateId: 'mat_fire_essence', quantity: 1 }
    ],
    goldCost: 250,
    successRate: 0.85
  },
  // ===== 特殊道具 =====
  {
    id: 'alc_atk_pot',
    type: 'alchemy',
    name: '力量药剂',
    description: '战斗中提升10%攻击力，持续30秒',
    levelRequirement: 15,
    outputId: 'potion_atk_buff',
    outputQuantity: 1,
    materials: [
      { templateId: 'mat_rat_fang', quantity: 5 },
      { templateId: 'mat_goblin_ear', quantity: 3 },
      { templateId: 'mat_fire_essence', quantity: 1 }
    ],
    goldCost: 150,
    successRate: 0.8
  },
  {
    id: 'alc_def_pot',
    type: 'alchemy',
    name: '坚韧药剂',
    description: '战斗中提升10%防御力，持续30秒',
    levelRequirement: 15,
    outputId: 'potion_def_buff',
    outputQuantity: 1,
    materials: [
      { templateId: 'mat_wolf_pelt', quantity: 5 },
      { templateId: 'mat_bone', quantity: 5 },
      { templateId: 'mat_ice_crystal', quantity: 1 }
    ],
    goldCost: 150,
    successRate: 0.8
  }
]

/** 炼金图纸列表 */
export const alchemyBlueprints: AlchemyBlueprint[] = [
  {
    id: 'bp_alc_basic',
    name: '基础炼金术',
    description: '学会制作小型药水',
    levelRequirement: 1,
    recipeIds: ['alc_hp_small', 'alc_mp_small'],
    source: '初始赠送'
  },
  {
    id: 'bp_alc_intermediate',
    name: '进阶炼金术',
    description: '学会制作中型药水',
    levelRequirement: 10,
    recipeIds: ['alc_hp_medium', 'alc_mp_medium', 'alc_atk_pot', 'alc_def_pot'],
    source: '怪物掉落（10级以上）'
  },
  {
    id: 'bp_alc_advanced',
    name: '高级炼金术',
    description: '学会制作大型药水',
    levelRequirement: 25,
    recipeIds: ['alc_hp_large', 'alc_mp_large'],
    source: '精英怪物掉落'
  }
]

/** 获取炼金配方 */
export function getAlchemyRecipe(id: string): CraftRecipe | undefined {
  return alchemyRecipes.find(r => r.id === id)
}

/** 获取已解锁的炼金配方 */
export function getLearnedAlchemyRecipes(learnedIds: Set<string>): CraftRecipe[] {
  return alchemyRecipes.filter(r => learnedIds.has(r.id))
}
