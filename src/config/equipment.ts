/**
 * 装备配置
 */
import type { EquipmentTemplate } from '@/types'
import { Quality, EquipSlot } from '@/types'

/** 装备模板配置 */
export const equipmentTemplates: EquipmentTemplate[] = [
  // ===== 武器 =====
  {
    id: 'equip_sword_1',
    name: '铁剑',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Common,
    levelRequirement: 1,
    baseStats: { attack: 5 },
    qualityMultipliers: {
      [Quality.Common]: 1.0,
      [Quality.Uncommon]: 1.2,
      [Quality.Rare]: 1.5,
      [Quality.Epic]: 2.0,
      [Quality.Legendary]: 3.0
    },
    dropSources: { minMonsterLevel: 1 },
    sellPrice: 10
  },
  {
    id: 'equip_sword_2',
    name: '精钢剑',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Uncommon,
    levelRequirement: 10,
    baseStats: { attack: 15, critRate: 0.02 },
    qualityMultipliers: {
      [Quality.Common]: 0.8,
      [Quality.Uncommon]: 1.0,
      [Quality.Rare]: 1.3,
      [Quality.Epic]: 1.8,
      [Quality.Legendary]: 2.5
    },
    dropSources: { minMonsterLevel: 10 },
    sellPrice: 50
  },
  {
    id: 'equip_staff_1',
    name: '新手法杖',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Common,
    levelRequirement: 1,
    baseStats: { magicAttack: 8, mp: 10 },
    qualityMultipliers: {
      [Quality.Common]: 1.0,
      [Quality.Uncommon]: 1.2,
      [Quality.Rare]: 1.5,
      [Quality.Epic]: 2.0,
      [Quality.Legendary]: 3.0
    },
    dropSources: { minMonsterLevel: 1 },
    sellPrice: 12
  },
  {
    id: 'equip_bow_1',
    name: '短弓',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Common,
    levelRequirement: 1,
    baseStats: { attack: 4, critRate: 0.03, speed: 2 },
    qualityMultipliers: {
      [Quality.Common]: 1.0,
      [Quality.Uncommon]: 1.2,
      [Quality.Rare]: 1.5,
      [Quality.Epic]: 2.0,
      [Quality.Legendary]: 3.0
    },
    dropSources: { minMonsterLevel: 1 },
    sellPrice: 10
  },
  
  // ===== 头盔 =====
  {
    id: 'equip_helmet_1',
    name: '铁头盔',
    slot: EquipSlot.Helmet,
    baseQuality: Quality.Common,
    levelRequirement: 1,
    baseStats: { hp: 20, defense: 3 },
    qualityMultipliers: {
      [Quality.Common]: 1.0,
      [Quality.Uncommon]: 1.2,
      [Quality.Rare]: 1.5,
      [Quality.Epic]: 2.0,
      [Quality.Legendary]: 3.0
    },
    dropSources: { minMonsterLevel: 1 },
    sellPrice: 15
  },
  {
    id: 'equip_helmet_2',
    name: '钢盔',
    slot: EquipSlot.Helmet,
    baseQuality: Quality.Uncommon,
    levelRequirement: 10,
    baseStats: { hp: 50, defense: 8, magicDefense: 3 },
    qualityMultipliers: {
      [Quality.Common]: 0.8,
      [Quality.Uncommon]: 1.0,
      [Quality.Rare]: 1.3,
      [Quality.Epic]: 1.8,
      [Quality.Legendary]: 2.5
    },
    dropSources: { minMonsterLevel: 10 },
    sellPrice: 60
  },
  
  // ===== 铠甲 =====
  {
    id: 'equip_armor_1',
    name: '布甲',
    slot: EquipSlot.Armor,
    baseQuality: Quality.Common,
    levelRequirement: 1,
    baseStats: { hp: 30, defense: 2, magicDefense: 5 },
    qualityMultipliers: {
      [Quality.Common]: 1.0,
      [Quality.Uncommon]: 1.2,
      [Quality.Rare]: 1.5,
      [Quality.Epic]: 2.0,
      [Quality.Legendary]: 3.0
    },
    dropSources: { minMonsterLevel: 1 },
    sellPrice: 20
  },
  {
    id: 'equip_armor_2',
    name: '锁子甲',
    slot: EquipSlot.Armor,
    baseQuality: Quality.Uncommon,
    levelRequirement: 10,
    baseStats: { hp: 80, defense: 12, dodge: -0.02 },
    qualityMultipliers: {
      [Quality.Common]: 0.8,
      [Quality.Uncommon]: 1.0,
      [Quality.Rare]: 1.3,
      [Quality.Epic]: 1.8,
      [Quality.Legendary]: 2.5
    },
    dropSources: { minMonsterLevel: 10 },
    sellPrice: 80
  },
  
  // ===== 护腿 =====
  {
    id: 'equip_legs_1',
    name: '布裤',
    slot: EquipSlot.Legs,
    baseQuality: Quality.Common,
    levelRequirement: 1,
    baseStats: { hp: 15, defense: 1 },
    qualityMultipliers: {
      [Quality.Common]: 1.0,
      [Quality.Uncommon]: 1.2,
      [Quality.Rare]: 1.5,
      [Quality.Epic]: 2.0,
      [Quality.Legendary]: 3.0
    },
    dropSources: { minMonsterLevel: 1 },
    sellPrice: 10
  },
  
  // ===== 靴子 =====
  {
    id: 'equip_boots_1',
    name: '皮靴',
    slot: EquipSlot.Boots,
    baseQuality: Quality.Common,
    levelRequirement: 1,
    baseStats: { speed: 3, dodge: 0.02 },
    qualityMultipliers: {
      [Quality.Common]: 1.0,
      [Quality.Uncommon]: 1.2,
      [Quality.Rare]: 1.5,
      [Quality.Epic]: 2.0,
      [Quality.Legendary]: 3.0
    },
    dropSources: { minMonsterLevel: 1 },
    sellPrice: 12
  },
  
  // ===== 戒指 =====
  {
    id: 'equip_ring_1',
    name: '铜戒指',
    slot: EquipSlot.Ring,
    baseQuality: Quality.Common,
    levelRequirement: 5,
    baseStats: { attack: 2, magicAttack: 2 },
    qualityMultipliers: {
      [Quality.Common]: 1.0,
      [Quality.Uncommon]: 1.2,
      [Quality.Rare]: 1.5,
      [Quality.Epic]: 2.0,
      [Quality.Legendary]: 3.0
    },
    dropSources: { minMonsterLevel: 5 },
    sellPrice: 25
  },
  
  // ===== 项链 =====
  {
    id: 'equip_necklace_1',
    name: '铜项链',
    slot: EquipSlot.Necklace,
    baseQuality: Quality.Common,
    levelRequirement: 5,
    baseStats: { hp: 20, mp: 10 },
    qualityMultipliers: {
      [Quality.Common]: 1.0,
      [Quality.Uncommon]: 1.2,
      [Quality.Rare]: 1.5,
      [Quality.Epic]: 2.0,
      [Quality.Legendary]: 3.0
    },
    dropSources: { minMonsterLevel: 5 },
    sellPrice: 30
  },
  
  // ===== 锻造饰品 =====
  {
    id: 'equip_ring_attack',
    name: '力量戒指',
    slot: EquipSlot.Ring,
    baseQuality: Quality.Uncommon,
    levelRequirement: 15,
    baseStats: { attack: 8, critRate: 0.02 },
    qualityMultipliers: {
      [Quality.Common]: 0.8,
      [Quality.Uncommon]: 1.0,
      [Quality.Rare]: 1.3,
      [Quality.Epic]: 1.8,
      [Quality.Legendary]: 2.5
    },
    dropSources: {},
    sellPrice: 200
  },
  {
    id: 'equip_necklace_hp',
    name: '生命项链',
    slot: EquipSlot.Necklace,
    baseQuality: Quality.Uncommon,
    levelRequirement: 15,
    baseStats: { hp: 60, defense: 5 },
    qualityMultipliers: {
      [Quality.Common]: 0.8,
      [Quality.Uncommon]: 1.0,
      [Quality.Rare]: 1.3,
      [Quality.Epic]: 1.8,
      [Quality.Legendary]: 2.5
    },
    dropSources: {},
    sellPrice: 200
  },
  
  // ===== 中级武器 =====
  {
    id: 'equip_sword_3',
    name: '秘银长剑',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Rare,
    levelRequirement: 20,
    baseStats: { attack: 28, critRate: 0.03 },
    qualityMultipliers: {
      [Quality.Common]: 0.7, [Quality.Uncommon]: 0.85,
      [Quality.Rare]: 1.0, [Quality.Epic]: 1.4, [Quality.Legendary]: 2.0
    },
    dropSources: { minMonsterLevel: 18 },
    sellPrice: 150
  },
  {
    id: 'equip_staff_2',
    name: '秘银法杖',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Rare,
    levelRequirement: 20,
    baseStats: { magicAttack: 25, mp: 30, critDamage: 0.15 },
    qualityMultipliers: {
      [Quality.Common]: 0.7, [Quality.Uncommon]: 0.85,
      [Quality.Rare]: 1.0, [Quality.Epic]: 1.4, [Quality.Legendary]: 2.0
    },
    dropSources: { minMonsterLevel: 18 },
    sellPrice: 160
  },
  {
    id: 'equip_bow_2',
    name: '精灵长弓',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Rare,
    levelRequirement: 20,
    baseStats: { attack: 18, critRate: 0.05, speed: 4 },
    qualityMultipliers: {
      [Quality.Common]: 0.7, [Quality.Uncommon]: 0.85,
      [Quality.Rare]: 1.0, [Quality.Epic]: 1.4, [Quality.Legendary]: 2.0
    },
    dropSources: { minMonsterLevel: 18 },
    sellPrice: 150
  },
  {
    id: 'equip_sword_4',
    name: '暗金大剑',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Epic,
    levelRequirement: 35,
    baseStats: { attack: 55, critRate: 0.04, critDamage: 0.2 },
    qualityMultipliers: {
      [Quality.Common]: 0.5, [Quality.Uncommon]: 0.7,
      [Quality.Rare]: 0.9, [Quality.Epic]: 1.0, [Quality.Legendary]: 1.6
    },
    dropSources: { minMonsterLevel: 32, titleRestriction: ['elite', 'lord'] },
    sellPrice: 500
  },

  // ===== 中级防具 =====
  {
    id: 'equip_helmet_3',
    name: '秘银头盔',
    slot: EquipSlot.Helmet,
    baseQuality: Quality.Rare,
    levelRequirement: 20,
    baseStats: { hp: 80, defense: 14, magicDefense: 8 },
    qualityMultipliers: {
      [Quality.Common]: 0.7, [Quality.Uncommon]: 0.85,
      [Quality.Rare]: 1.0, [Quality.Epic]: 1.4, [Quality.Legendary]: 2.0
    },
    dropSources: { minMonsterLevel: 18 },
    sellPrice: 120
  },
  {
    id: 'equip_armor_3',
    name: '秘银铠甲',
    slot: EquipSlot.Armor,
    baseQuality: Quality.Rare,
    levelRequirement: 20,
    baseStats: { hp: 120, defense: 18, magicDefense: 12 },
    qualityMultipliers: {
      [Quality.Common]: 0.7, [Quality.Uncommon]: 0.85,
      [Quality.Rare]: 1.0, [Quality.Epic]: 1.4, [Quality.Legendary]: 2.0
    },
    dropSources: { minMonsterLevel: 18 },
    sellPrice: 140
  },
  {
    id: 'equip_legs_2',
    name: '秘银护腿',
    slot: EquipSlot.Legs,
    baseQuality: Quality.Rare,
    levelRequirement: 20,
    baseStats: { hp: 50, defense: 8, speed: 2 },
    qualityMultipliers: {
      [Quality.Common]: 0.7, [Quality.Uncommon]: 0.85,
      [Quality.Rare]: 1.0, [Quality.Epic]: 1.4, [Quality.Legendary]: 2.0
    },
    dropSources: { minMonsterLevel: 18 },
    sellPrice: 100
  },
  {
    id: 'equip_boots_2',
    name: '飞行靴',
    slot: EquipSlot.Boots,
    baseQuality: Quality.Rare,
    levelRequirement: 20,
    baseStats: { speed: 6, dodge: 0.04 },
    qualityMultipliers: {
      [Quality.Common]: 0.7, [Quality.Uncommon]: 0.85,
      [Quality.Rare]: 1.0, [Quality.Epic]: 1.4, [Quality.Legendary]: 2.0
    },
    dropSources: { minMonsterLevel: 18 },
    sellPrice: 120
  },
  {
    id: 'equip_ring_2',
    name: '秘银戒指',
    slot: EquipSlot.Ring,
    baseQuality: Quality.Rare,
    levelRequirement: 20,
    baseStats: { attack: 6, magicAttack: 6, critRate: 0.02 },
    qualityMultipliers: {
      [Quality.Common]: 0.7, [Quality.Uncommon]: 0.85,
      [Quality.Rare]: 1.0, [Quality.Epic]: 1.4, [Quality.Legendary]: 2.0
    },
    dropSources: { minMonsterLevel: 18 },
    sellPrice: 150
  },
  {
    id: 'equip_necklace_2',
    name: '守护项链',
    slot: EquipSlot.Necklace,
    baseQuality: Quality.Rare,
    levelRequirement: 20,
    baseStats: { hp: 60, mp: 30, defense: 5 },
    qualityMultipliers: {
      [Quality.Common]: 0.7, [Quality.Uncommon]: 0.85,
      [Quality.Rare]: 1.0, [Quality.Epic]: 1.4, [Quality.Legendary]: 2.0
    },
    dropSources: { minMonsterLevel: 18 },
    sellPrice: 140
  },

  // ===== 高级防具 =====
  {
    id: 'equip_armor_4',
    name: '暗金铠甲',
    slot: EquipSlot.Armor,
    baseQuality: Quality.Epic,
    levelRequirement: 35,
    baseStats: { hp: 200, defense: 30, magicDefense: 20, dodge: 0.03 },
    qualityMultipliers: {
      [Quality.Common]: 0.5, [Quality.Uncommon]: 0.7,
      [Quality.Rare]: 0.9, [Quality.Epic]: 1.0, [Quality.Legendary]: 1.6
    },
    dropSources: { minMonsterLevel: 32, titleRestriction: ['elite', 'lord'] },
    sellPrice: 450
  },
  {
    id: 'equip_helmet_4',
    name: '暗金头盔',
    slot: EquipSlot.Helmet,
    baseQuality: Quality.Epic,
    levelRequirement: 35,
    baseStats: { hp: 120, defense: 22, magicDefense: 12 },
    qualityMultipliers: {
      [Quality.Common]: 0.5, [Quality.Uncommon]: 0.7,
      [Quality.Rare]: 0.9, [Quality.Epic]: 1.0, [Quality.Legendary]: 1.6
    },
    dropSources: { minMonsterLevel: 32, titleRestriction: ['elite', 'lord'] },
    sellPrice: 400
  },

  // ===== 传说装备 =====
  {
    id: 'equip_weapon_legendary',
    name: '龙息巨剑',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Legendary,
    levelRequirement: 40,
    baseStats: { 
      attack: 100, 
      critRate: 0.15, 
      critDamage: 0.5,
      fireDamage: 20
    },
    qualityMultipliers: {
      [Quality.Common]: 0.5,
      [Quality.Uncommon]: 0.7,
      [Quality.Rare]: 0.9,
      [Quality.Epic]: 1.0,
      [Quality.Legendary]: 1.0
    },
    dropSources: { 
      minMonsterLevel: 40,
      titleRestriction: ['lord']
    },
    sellPrice: 5000
  },
  {
    id: 'equip_staff_legendary',
    name: '大魔导师之杖',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Legendary,
    levelRequirement: 45,
    baseStats: {
      magicAttack: 90, mp: 50, critDamage: 0.3
    },
    qualityMultipliers: {
      [Quality.Common]: 0.5,
      [Quality.Uncommon]: 0.7,
      [Quality.Rare]: 0.9,
      [Quality.Epic]: 1.0,
      [Quality.Legendary]: 1.0
    },
    dropSources: { minMonsterLevel: 42, titleRestriction: ['lord'] },
    sellPrice: 4500
  },
  {
    id: 'equip_bow_legendary',
    name: '陨星长弓',
    slot: EquipSlot.Weapon,
    baseQuality: Quality.Legendary,
    levelRequirement: 45,
    baseStats: {
      attack: 60, critRate: 0.2, critDamage: 0.4, speed: 8
    },
    qualityMultipliers: {
      [Quality.Common]: 0.5,
      [Quality.Uncommon]: 0.7,
      [Quality.Rare]: 0.9,
      [Quality.Epic]: 1.0,
      [Quality.Legendary]: 1.0
    },
    dropSources: { minMonsterLevel: 42, titleRestriction: ['lord'] },
    sellPrice: 4500
  }
]

/** 获取装备模板 */
export function getEquipmentTemplate(templateId: string) {
  return equipmentTemplates.find(e => e.id === templateId)
}

/** 根据槽位获取装备模板列表 */
export function getEquipmentBySlot(slot: EquipSlot) {
  return equipmentTemplates.filter(e => e.slot === slot)
}

/** 根据等级获取可掉落的装备模板 */
export function getDroppableEquipmentTemplates(monsterLevel: number, monsterTitle?: string) {
  return equipmentTemplates.filter(e => {
    const sources = e.dropSources
    if (sources.minMonsterLevel && monsterLevel < sources.minMonsterLevel) return false
    if (sources.titleRestriction && monsterTitle && !sources.titleRestriction.includes(monsterTitle)) return false
    return true
  })
}
