/**
 * 商店配置
 */
import type { ShopItem, ItemTemplate, BuybackItem } from '@/types'
import { ItemType, Quality } from '@/types'

/** 商店物品列表 */
export const shopItems: ShopItem[] = [
  // 药水
  { templateId: 'potion_hp_small', stock: -1 },
  { templateId: 'potion_hp_medium', stock: -1 },
  { templateId: 'potion_hp_large', stock: -1 },
  { templateId: 'potion_mp_small', stock: -1 },
  { templateId: 'potion_mp_medium', stock: -1 },
  { templateId: 'potion_mp_large', stock: -1 },
  
  // 基础装备
  { templateId: 'equip_sword_1', stock: -1 },
  { templateId: 'equip_staff_1', stock: -1 },
  { templateId: 'equip_bow_1', stock: -1 },
  { templateId: 'equip_helmet_1', stock: -1 },
  { templateId: 'equip_armor_1', stock: -1 },
  { templateId: 'equip_legs_1', stock: -1 },
  { templateId: 'equip_boots_1', stock: -1 }
]

/** 物品模板（药水和材料） */
export const itemTemplates: ItemTemplate[] = [
  // 药水
  {
    id: 'potion_hp_small',
    name: '小型生命药水',
    type: ItemType.Potion,
    quality: Quality.Common,
    maxStack: 999,
    description: '恢复50点生命值',
    useEffect: { type: 'healHp', value: 50 },
    sellPrice: 10,
    buyPrice: 20
  },
  {
    id: 'potion_hp_medium',
    name: '中型生命药水',
    type: ItemType.Potion,
    quality: Quality.Uncommon,
    maxStack: 999,
    description: '恢复150点生命值',
    useEffect: { type: 'healHp', value: 150 },
    sellPrice: 30,
    buyPrice: 60
  },
  {
    id: 'potion_hp_large',
    name: '大型生命药水',
    type: ItemType.Potion,
    quality: Quality.Rare,
    maxStack: 999,
    description: '恢复300点生命值',
    useEffect: { type: 'healHp', value: 300 },
    sellPrice: 80,
    buyPrice: 160
  },
  {
    id: 'potion_mp_small',
    name: '小型魔法药水',
    type: ItemType.Potion,
    quality: Quality.Common,
    maxStack: 999,
    description: '恢复30点魔法值',
    useEffect: { type: 'healMp', value: 30 },
    sellPrice: 15,
    buyPrice: 30
  },
  {
    id: 'potion_mp_medium',
    name: '中型魔法药水',
    type: ItemType.Potion,
    quality: Quality.Uncommon,
    maxStack: 999,
    description: '恢复80点魔法值',
    useEffect: { type: 'healMp', value: 80 },
    sellPrice: 40,
    buyPrice: 80
  },
  {
    id: 'potion_mp_large',
    name: '大型魔法药水',
    type: ItemType.Potion,
    quality: Quality.Rare,
    maxStack: 999,
    description: '恢复150点魔法值',
    useEffect: { type: 'healMp', value: 150 },
    sellPrice: 100,
    buyPrice: 200
  },
  
  // 材料
  {
    id: 'mat_slime_gel',
    name: '史莱姆凝胶',
    type: ItemType.Material,
    quality: Quality.Common,
    maxStack: 999,
    description: '史莱姆身上的粘液，可用于制作',
    sellPrice: 5
  },
  {
    id: 'mat_rat_fang',
    name: '巨鼠尖牙',
    type: ItemType.Material,
    quality: Quality.Common,
    maxStack: 999,
    description: '巨鼠锋利的牙齿',
    sellPrice: 6
  },
  {
    id: 'mat_wolf_pelt',
    name: '狼皮',
    type: ItemType.Material,
    quality: Quality.Common,
    maxStack: 999,
    description: '灰狼的毛皮',
    sellPrice: 10
  },
  {
    id: 'mat_bone',
    name: '骨头',
    type: ItemType.Material,
    quality: Quality.Common,
    maxStack: 999,
    description: '骷髅兵的骨头',
    sellPrice: 8
  },
  {
    id: 'mat_goblin_ear',
    name: '哥布林耳朵',
    type: ItemType.Material,
    quality: Quality.Common,
    maxStack: 999,
    description: '哥布林的耳朵',
    sellPrice: 12
  },
  {
    id: 'mat_spider_silk',
    name: '蜘蛛丝',
    type: ItemType.Material,
    quality: Quality.Uncommon,
    maxStack: 999,
    description: '毒蜘蛛的丝',
    sellPrice: 20
  },
  {
    id: 'mat_fire_essence',
    name: '火焰精华',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '火焰元素凝聚的精华',
    sellPrice: 50
  },
  {
    id: 'mat_ice_crystal',
    name: '冰晶',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '永恒寒冰的结晶',
    sellPrice: 60
  },
  {
    id: 'mat_dragon_scale',
    name: '龙鳞',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '魔龙坚硬的鳞片',
    sellPrice: 200
  },

  // 新增材料
  {
    id: 'mat_boar_tusk',
    name: '野猪獠牙',
    type: ItemType.Material,
    quality: Quality.Common,
    maxStack: 999,
    description: '野猪锋利的獠牙',
    sellPrice: 8
  },
  {
    id: 'mat_zombie_flesh',
    name: '腐肉',
    type: ItemType.Material,
    quality: Quality.Common,
    maxStack: 999,
    description: '僵尸身上腐烂的组织',
    sellPrice: 6
  },
  {
    id: 'mat_wood_core',
    name: '树木核心',
    type: ItemType.Material,
    quality: Quality.Uncommon,
    maxStack: 999,
    description: '古树体内凝聚的魔力核心',
    sellPrice: 25
  },
  {
    id: 'mat_wisp_dust',
    name: '灵光粉尘',
    type: ItemType.Material,
    quality: Quality.Uncommon,
    maxStack: 999,
    description: '灵体飘散后残留的光尘',
    sellPrice: 28
  },
  {
    id: 'mat_dark_crystal',
    name: '暗影水晶',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '暗影精灵使用的魔力水晶',
    sellPrice: 40
  },
  {
    id: 'mat_shadow_essence',
    name: '暗影精华',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '暗影凝聚的精华',
    sellPrice: 45
  },
  {
    id: 'mat_lava_stone',
    name: '熔岩石',
    type: ItemType.Material,
    quality: Quality.Uncommon,
    maxStack: 999,
    description: '熔岩中凝结的坚硬岩石',
    sellPrice: 35
  },
  {
    id: 'mat_phoenix_feather',
    name: '凤凰羽毛',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '凤凰脱落的华丽羽毛',
    sellPrice: 120
  },
  {
    id: 'mat_demon_horn',
    name: '恶魔之角',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '恶魔头上的弯角',
    sellPrice: 55
  },
  {
    id: 'mat_hellfire_soul',
    name: '地狱火魂',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '地狱犬体内燃烧的灵魂火焰',
    sellPrice: 60
  },
  {
    id: 'mat_frost_fang',
    name: '寒霜獠牙',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '冰霜巨人的巨大獠牙',
    sellPrice: 70
  },
  {
    id: 'mat_wraith_cloth',
    name: '幽灵布',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '幽灵身上的幽冥之布',
    sellPrice: 75
  },
  {
    id: 'mat_wyrm_scale',
    name: '冰龙鳞',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '冰龙坚硬的鳞片',
    sellPrice: 100
  },
  {
    id: 'mat_lich_staff',
    name: '巫妖法杖碎片',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '巫妖法杖的碎片，蕴含强大魔力',
    sellPrice: 130
  },
  {
    id: 'mat_titan_heart',
    name: '泰坦之心',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '冰霜泰坦的心脏，永远冰冷',
    sellPrice: 180
  },
  {
    id: 'mat_drake_bone',
    name: '龙骨',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '幼龙的坚硬骨骼',
    sellPrice: 80
  },
  {
    id: 'mat_wyvern_venom',
    name: '双足龙毒液',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '双足龙的剧毒液体',
    sellPrice: 90
  },
  {
    id: 'mat_dragon_blood',
    name: '龙血',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '龙族之血，蕴含远古力量',
    sellPrice: 250
  },
  {
    id: 'mat_dragonlord_gem',
    name: '龙王宝珠',
    type: ItemType.Material,
    quality: Quality.Legendary,
    maxStack: 999,
    description: '龙王额头上镶嵌的宝珠',
    sellPrice: 500
  },

  // 特殊药水（炼金产出）
  {
    id: 'potion_atk_buff',
    name: '力量药剂',
    type: ItemType.Potion,
    quality: Quality.Uncommon,
    maxStack: 99,
    description: '战斗中提升10%攻击力，持续30秒',
    useEffect: { type: 'buff', value: 0.1, duration: 30000 },
    sellPrice: 60
  },
  {
    id: 'potion_def_buff',
    name: '坚韧药剂',
    type: ItemType.Potion,
    quality: Quality.Uncommon,
    maxStack: 99,
    description: '战斗中提升10%防御力，持续30秒',
    useEffect: { type: 'buff', value: 0.1, duration: 30000 },
    sellPrice: 60
  },

  // ===== 深渊材料 =====
  {
    id: 'mat_abyssal_shard',
    name: '深渊碎片',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '深渊领域中凝结的暗物质碎片',
    sellPrice: 90
  },
  {
    id: 'mat_void_essence',
    name: '虚空精华',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '虚空生物体内提炼的纯净精华',
    sellPrice: 180
  },
  {
    id: 'mat_shadow_blade',
    name: '暗影之刃',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '暗影猎手使用的锋利短刃',
    sellPrice: 200
  },
  {
    id: 'mat_abyssal_core',
    name: '深渊核心',
    type: ItemType.Material,
    quality: Quality.Legendary,
    maxStack: 999,
    description: '深渊领主体内的能量核心',
    sellPrice: 600
  },

  // ===== 神界材料 =====
  {
    id: 'mat_holy_shard',
    name: '神圣碎片',
    type: ItemType.Material,
    quality: Quality.Rare,
    maxStack: 999,
    description: '神殿中散落的神圣结晶',
    sellPrice: 100
  },
  {
    id: 'mat_celestial_dust',
    name: '星辰之尘',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '天界神灵掉落的星尘',
    sellPrice: 220
  },
  {
    id: 'mat_angel_feather',
    name: '天使之羽',
    type: ItemType.Material,
    quality: Quality.Epic,
    maxStack: 999,
    description: '天使脱落的金色羽毛',
    sellPrice: 250
  },
  {
    id: 'mat_god_core',
    name: '神格碎片',
    type: ItemType.Material,
    quality: Quality.Legendary,
    maxStack: 999,
    description: '神祇力量凝结的碎片',
    sellPrice: 800
  }
]

/** 获取物品模板 */
export function getItemTemplate(templateId: string) {
  return itemTemplates.find(i => i.id === templateId)
}

/** 获取商店物品价格 */
export function getShopItemPrice(templateId: string, isBuying: boolean): number {
  const item = getItemTemplate(templateId)
  if (!item) return 0
  return isBuying ? (item.buyPrice || item.sellPrice * 2) : item.sellPrice
}
