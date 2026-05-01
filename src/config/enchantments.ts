/**
 * 附魔配置
 */
import type { EnchantAffix } from '@/types'
import { Quality, EquipSlot } from '@/types'

/** 附魔词条列表 */
export const enchantAffixes: EnchantAffix[] = [
  // ===== 前缀词条（主属性） =====
  // 攻击系
  {
    id: 'afx_fierce_1',
    name: '锋锐的',
    type: 'prefix',
    tier: 1,
    stats: { attack: 3 },
    validSlots: [EquipSlot.Weapon],
    minQuality: Quality.Common,
    weight: 20
  },
  {
    id: 'afx_fierce_2',
    name: '烈火的',
    type: 'prefix',
    tier: 2,
    stats: { attack: 8, critRate: 0.02 },
    validSlots: [EquipSlot.Weapon],
    minQuality: Quality.Uncommon,
    weight: 15
  },
  {
    id: 'afx_fierce_3',
    name: '毁灭的',
    type: 'prefix',
    tier: 3,
    stats: { attack: 15, critRate: 0.04, critDamage: 0.15 },
    validSlots: [EquipSlot.Weapon],
    minQuality: Quality.Rare,
    weight: 8
  },
  // 防御系
  {
    id: 'afx_guard_1',
    name: '坚固的',
    type: 'prefix',
    tier: 1,
    stats: { defense: 3 },
    validSlots: [EquipSlot.Helmet, EquipSlot.Armor, EquipSlot.Legs, EquipSlot.Boots],
    minQuality: Quality.Common,
    weight: 20
  },
  {
    id: 'afx_guard_2',
    name: '铁壁的',
    type: 'prefix',
    tier: 2,
    stats: { defense: 8, hp: 30 },
    validSlots: [EquipSlot.Helmet, EquipSlot.Armor, EquipSlot.Legs, EquipSlot.Boots],
    minQuality: Quality.Uncommon,
    weight: 15
  },
  {
    id: 'afx_guard_3',
    name: '不屈的',
    type: 'prefix',
    tier: 3,
    stats: { defense: 15, hp: 80, dodge: 0.02 },
    validSlots: [EquipSlot.Helmet, EquipSlot.Armor, EquipSlot.Legs, EquipSlot.Boots],
    minQuality: Quality.Rare,
    weight: 8
  },
  // 魔法系
  {
    id: 'afx_arcane_1',
    name: '奥术的',
    type: 'prefix',
    tier: 1,
    stats: { magicAttack: 4 },
    validSlots: [EquipSlot.Weapon],
    minQuality: Quality.Common,
    weight: 18
  },
  {
    id: 'afx_arcane_2',
    name: '秘魔的',
    type: 'prefix',
    tier: 2,
    stats: { magicAttack: 10, magicDefense: 5 },
    validSlots: [EquipSlot.Weapon],
    minQuality: Quality.Uncommon,
    weight: 12
  },
  {
    id: 'afx_arcane_3',
    name: '混沌的',
    type: 'prefix',
    tier: 3,
    stats: { magicAttack: 18, magicDefense: 10, mp: 30 },
    validSlots: [EquipSlot.Weapon],
    minQuality: Quality.Rare,
    weight: 6
  },

  // ===== 后缀词条（副属性） =====
  // 生命系
  {
    id: 'afx_vit_1',
    name: '生命',
    type: 'suffix',
    tier: 1,
    stats: { hp: 20 },
    minQuality: Quality.Common,
    weight: 25
  },
  {
    id: 'afx_vit_2',
    name: '活力',
    type: 'suffix',
    tier: 2,
    stats: { hp: 50, mp: 15 },
    minQuality: Quality.Uncommon,
    weight: 15
  },
  {
    id: 'afx_vit_3',
    name: '不灭',
    type: 'suffix',
    tier: 3,
    stats: { hp: 120, mp: 40 },
    minQuality: Quality.Rare,
    weight: 6
  },
  // 速度系
  {
    id: 'afx_swift_1',
    name: '迅捷',
    type: 'suffix',
    tier: 1,
    stats: { speed: 2 },
    minQuality: Quality.Common,
    weight: 18
  },
  {
    id: 'afx_swift_2',
    name: '疾风',
    type: 'suffix',
    tier: 2,
    stats: { speed: 5, dodge: 0.02 },
    minQuality: Quality.Uncommon,
    weight: 12
  },
  {
    id: 'afx_swift_3',
    name: '闪电',
    type: 'suffix',
    tier: 3,
    stats: { speed: 10, dodge: 0.05, critRate: 0.02 },
    minQuality: Quality.Rare,
    weight: 5
  },
  // 暴击系
  {
    id: 'afx_crit_1',
    name: '精准',
    type: 'suffix',
    tier: 1,
    stats: { critRate: 0.02 },
    minQuality: Quality.Common,
    weight: 15
  },
  {
    id: 'afx_crit_2',
    name: '致命',
    type: 'suffix',
    tier: 2,
    stats: { critRate: 0.04, critDamage: 0.1 },
    minQuality: Quality.Uncommon,
    weight: 10
  },
  // 饰品专用
  {
    id: 'afx_allstat_1',
    name: '全属性',
    type: 'suffix',
    tier: 1,
    stats: { attack: 2, defense: 2, magicAttack: 2 },
    validSlots: [EquipSlot.Ring, EquipSlot.Necklace],
    minQuality: Quality.Uncommon,
    weight: 12
  },
  {
    id: 'afx_allstat_2',
    name: '王者',
    type: 'suffix',
    tier: 2,
    stats: { attack: 5, defense: 5, magicAttack: 5, speed: 3 },
    validSlots: [EquipSlot.Ring, EquipSlot.Necklace],
    minQuality: Quality.Rare,
    weight: 6
  }
]

/** 附魔消耗材料配置 */
export interface EnchantCost {
  materials: { templateId: string; quantity: number }[]
  gold: number
}

/** 各品质强化费用 */
export const ENCHANT_COSTS: Record<Quality, EnchantCost> = {
  [Quality.Common]: {
    materials: [{ templateId: 'mat_bone', quantity: 3 }],
    gold: 100
  },
  [Quality.Uncommon]: {
    materials: [{ templateId: 'mat_rat_fang', quantity: 3 }, { templateId: 'mat_spider_silk', quantity: 2 }],
    gold: 300
  },
  [Quality.Rare]: {
    materials: [{ templateId: 'mat_fire_essence', quantity: 2 }, { templateId: 'mat_ice_crystal', quantity: 2 }],
    gold: 800
  },
  [Quality.Epic]: {
    materials: [{ templateId: 'mat_dragon_scale', quantity: 1 }, { templateId: 'mat_fire_essence', quantity: 3 }],
    gold: 2000
  },
  [Quality.Legendary]: {
    materials: [{ templateId: 'mat_dragon_scale', quantity: 3 }, { templateId: 'mat_fire_essence', quantity: 5 }],
    gold: 5000
  }
}

/** 强化成功率（按品质和当前次数） */
export function getEnchantSuccessRate(quality: Quality, currentEnchantCount: number): number {
  const baseRates: Record<Quality, number[]> = {
    [Quality.Common]: [1.0, 0.9],
    [Quality.Uncommon]: [1.0, 0.9, 0.75],
    [Quality.Rare]: [1.0, 0.9, 0.75, 0.55],
    [Quality.Epic]: [1.0, 0.9, 0.75, 0.55, 0.35],
    [Quality.Legendary]: [1.0, 0.9, 0.75, 0.55, 0.35, 0.2]
  }
  const rates = baseRates[quality]
  return rates[currentEnchantCount] ?? 0.1
}

/** 获取适合装备的随机词条 */
export function getAvailableAffixes(
  quality: Quality,
  slot?: string
): EnchantAffix[] {
  return enchantAffixes.filter(a => {
    // 品质限制
    if (a.minQuality) {
      const qualityOrder = [Quality.Common, Quality.Uncommon, Quality.Rare, Quality.Epic, Quality.Legendary]
      const itemIdx = qualityOrder.indexOf(quality)
      const minIdx = qualityOrder.indexOf(a.minQuality)
      if (itemIdx < minIdx) return false
    }
    // 槽位限制
    if (a.validSlots && slot && !a.validSlots.includes(slot)) return false
    return true
  })
}

/** 获取词条 */
export function getEnchantAffix(id: string): EnchantAffix | undefined {
  return enchantAffixes.find(a => a.id === id)
}
