/**
 * 怪物配置
 */
import type { MonsterTemplate } from '@/types'
import { Element, MonsterTitle } from '@/types'

/** 怪物模板配置 */
export const monsterTemplates: MonsterTemplate[] = [
  // ===== 新手村怪物 =====
  {
    id: 'slime',
    name: '史莱姆',
    level: 1,
    element: Element.Physical,
    baseStats: {
      hp: 30, mp: 0, attack: 5, defense: 2,
      magicAttack: 0, magicDefense: 1, speed: 5,
      critRate: 0.02, critDamage: 1.3, dodge: 0.02, hitRate: 0.95,
      expReward: 10, goldReward: 5
    },
    eliteMultiplier: 1.5,
    lordMultiplier: 2.5,
    spawnWeight: 30,
    normalSkills: ['attack'],
    eliteSkills: ['attack', 'slime_jump'],
    lordSkills: ['attack', 'slime_jump', 'slime_split'],
    dropTable: [
      { itemId: 'potion_hp_small', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_slime_gel', dropRate: 0.5, minQuantity: 1, maxQuantity: 3 }
    ]
  },
  {
    id: 'rat',
    name: '巨鼠',
    level: 2,
    element: Element.Physical,
    baseStats: {
      hp: 25, mp: 0, attack: 8, defense: 1,
      magicAttack: 0, magicDefense: 0, speed: 12,
      critRate: 0.05, critDamage: 1.4, dodge: 0.08, hitRate: 0.92,
      expReward: 12, goldReward: 6
    },
    eliteMultiplier: 1.6,
    lordMultiplier: 2.8,
    spawnWeight: 25,
    normalSkills: ['attack'],
    eliteSkills: ['attack', 'rat_bite'],
    lordSkills: ['attack', 'rat_bite', 'rat_swarm'],
    dropTable: [
      { itemId: 'potion_hp_small', dropRate: 0.25, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mat_rat_fang', dropRate: 0.4, minQuantity: 1, maxQuantity: 2 }
    ]
  },
  {
    id: 'wolf',
    name: '灰狼',
    level: 4,
    element: Element.Physical,
    baseStats: {
      hp: 50, mp: 0, attack: 12, defense: 4,
      magicAttack: 0, magicDefense: 2, speed: 14,
      critRate: 0.08, critDamage: 1.5, dodge: 0.06, hitRate: 0.94,
      expReward: 20, goldReward: 12
    },
    eliteMultiplier: 1.6,
    lordMultiplier: 2.8,
    spawnWeight: 20,
    normalSkills: ['attack'],
    eliteSkills: ['attack', 'wolf_howl'],
    lordSkills: ['attack', 'wolf_howl', 'wolf_pack'],
    dropTable: [
      { itemId: 'potion_hp_small', dropRate: 0.35, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_wolf_pelt', dropRate: 0.45, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_sword_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  {
    id: 'skeleton',
    name: '骷髅兵',
    level: 6,
    element: Element.Physical,
    baseStats: {
      hp: 60, mp: 10, attack: 15, defense: 8,
      magicAttack: 0, magicDefense: 3, speed: 10,
      critRate: 0.06, critDamage: 1.4, dodge: 0.03, hitRate: 0.95,
      expReward: 30, goldReward: 18
    },
    eliteMultiplier: 1.7,
    lordMultiplier: 3.0,
    spawnWeight: 18,
    normalSkills: ['attack'],
    eliteSkills: ['attack', 'bone_strike'],
    lordSkills: ['attack', 'bone_strike', 'skeleton_army'],
    dropTable: [
      { itemId: 'potion_hp_small', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_bone', dropRate: 0.5, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'equip_helmet_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  
  // ===== 暗影森林怪物 =====
  {
    id: 'goblin',
    name: '哥布林',
    level: 8,
    element: Element.Physical,
    baseStats: {
      hp: 70, mp: 20, attack: 18, defense: 6,
      magicAttack: 5, magicDefense: 4, speed: 15,
      critRate: 0.07, critDamage: 1.5, dodge: 0.08, hitRate: 0.93,
      expReward: 40, goldReward: 25
    },
    eliteMultiplier: 1.7,
    lordMultiplier: 3.0,
    spawnWeight: 20,
    normalSkills: ['attack'],
    eliteSkills: ['attack', 'goblin_throw'],
    lordSkills: ['attack', 'goblin_throw', 'goblin_swarm'],
    dropTable: [
      { itemId: 'potion_hp_small', dropRate: 0.35, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'potion_mp_small', dropRate: 0.25, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mat_goblin_ear', dropRate: 0.45, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_boots_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_staff_1', dropRate: 0.03, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  {
    id: 'spider',
    name: '毒蜘蛛',
    level: 10,
    element: Element.Poison,
    baseStats: {
      hp: 55, mp: 30, attack: 14, defense: 4,
      magicAttack: 12, magicDefense: 6, speed: 16,
      critRate: 0.1, critDamage: 1.6, dodge: 0.1, hitRate: 0.9,
      expReward: 50, goldReward: 30
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.2,
    spawnWeight: 18,
    normalSkills: ['attack', 'poison_bite'],
    eliteSkills: ['attack', 'poison_bite', 'web'],
    lordSkills: ['attack', 'poison_bite', 'web', 'spider_swarm'],
    dropTable: [
      { itemId: 'potion_hp_medium', dropRate: 0.2, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mat_spider_silk', dropRate: 0.4, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_ring_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_1', dropRate: 0.03, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  
  // ===== 熔岩峡谷怪物 =====
  {
    id: 'fireimp',
    name: '火焰小鬼',
    level: 18,
    element: Element.Fire,
    baseStats: {
      hp: 90, mp: 60, attack: 10, defense: 5,
      magicAttack: 25, magicDefense: 12, speed: 18,
      critRate: 0.1, critDamage: 1.6, dodge: 0.08, hitRate: 0.92,
      expReward: 80, goldReward: 50
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.2,
    spawnWeight: 20,
    normalSkills: ['attack', 'fireball'],
    eliteSkills: ['attack', 'fireball', 'fire_shield'],
    lordSkills: ['attack', 'fireball', 'fire_shield', 'inferno'],
    dropTable: [
      { itemId: 'potion_hp_medium', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'potion_mp_medium', dropRate: 0.25, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mat_fire_essence', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_sword_2', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  
  // ===== 冰霜要塞怪物 =====
  {
    id: 'icewolf',
    name: '冰狼',
    level: 28,
    element: Element.Ice,
    baseStats: {
      hp: 150, mp: 40, attack: 35, defense: 20,
      magicAttack: 15, magicDefense: 18, speed: 20,
      critRate: 0.12, critDamage: 1.7, dodge: 0.08, hitRate: 0.94,
      expReward: 150, goldReward: 100
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.2,
    spawnWeight: 20,
    normalSkills: ['attack', 'ice_bite'],
    eliteSkills: ['attack', 'ice_bite', 'frost_howl'],
    lordSkills: ['attack', 'ice_bite', 'frost_howl', 'blizzard'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.25, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'potion_mp_large', dropRate: 0.2, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mat_ice_crystal', dropRate: 0.35, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_helmet_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_legs_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_bow_1', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  
  // ===== 新手村补充怪物 =====
  {
    id: 'boar',
    name: '野猪',
    level: 3,
    element: Element.Physical,
    baseStats: {
      hp: 55, mp: 0, attack: 10, defense: 6,
      magicAttack: 0, magicDefense: 2, speed: 8,
      critRate: 0.04, critDamage: 1.3, dodge: 0.03, hitRate: 0.95,
      expReward: 18, goldReward: 10
    },
    eliteMultiplier: 1.5,
    lordMultiplier: 2.5,
    spawnWeight: 25,
    normalSkills: ['attack'],
    eliteSkills: ['attack', 'charge'],
    lordSkills: ['attack', 'charge', 'trample'],
    dropTable: [
      { itemId: 'potion_hp_small', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_boar_tusk', dropRate: 0.45, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_boots_1', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  {
    id: 'zombie',
    name: '僵尸',
    level: 5,
    element: Element.Physical,
    baseStats: {
      hp: 80, mp: 0, attack: 12, defense: 5,
      magicAttack: 0, magicDefense: 1, speed: 4,
      critRate: 0.03, critDamage: 1.3, dodge: 0.01, hitRate: 0.96,
      expReward: 25, goldReward: 15
    },
    eliteMultiplier: 1.6,
    lordMultiplier: 2.8,
    spawnWeight: 22,
    normalSkills: ['attack'],
    eliteSkills: ['attack', 'infect'],
    lordSkills: ['attack', 'infect', 'corpse_explosion'],
    dropTable: [
      { itemId: 'potion_hp_small', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_zombie_flesh', dropRate: 0.5, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'equip_armor_1', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },

  // ===== 暗影森林补充怪物 =====
  {
    id: 'treant',
    name: '古树精',
    level: 11,
    element: Element.Physical,
    baseStats: {
      hp: 120, mp: 30, attack: 16, defense: 18,
      magicAttack: 8, magicDefense: 10, speed: 6,
      critRate: 0.04, critDamage: 1.4, dodge: 0.02, hitRate: 0.95,
      expReward: 60, goldReward: 35
    },
    eliteMultiplier: 1.7,
    lordMultiplier: 3.0,
    spawnWeight: 18,
    normalSkills: ['attack', 'root_bind'],
    eliteSkills: ['attack', 'root_bind', 'nature_wrath'],
    lordSkills: ['attack', 'root_bind', 'nature_wrath', 'forest_surge'],
    dropTable: [
      { itemId: 'potion_hp_medium', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_wood_core', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_helmet_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_1', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'wisp',
    name: '灵光',
    level: 12,
    element: Element.Ice,
    baseStats: {
      hp: 45, mp: 80, attack: 5, defense: 3,
      magicAttack: 22, magicDefense: 15, speed: 22,
      critRate: 0.12, critDamage: 1.5, dodge: 0.15, hitRate: 0.88,
      expReward: 65, goldReward: 40
    },
    eliteMultiplier: 1.7,
    lordMultiplier: 3.0,
    spawnWeight: 16,
    normalSkills: ['attack', 'frost_ray'],
    eliteSkills: ['attack', 'frost_ray', 'blinding_light'],
    lordSkills: ['attack', 'frost_ray', 'blinding_light', 'prismatic_burst'],
    dropTable: [
      { itemId: 'potion_mp_medium', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_wisp_dust', dropRate: 0.4, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_staff_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  {
    id: 'darkelf',
    name: '暗影精灵',
    level: 14,
    element: Element.Physical,
    baseStats: {
      hp: 90, mp: 60, attack: 22, defense: 10,
      magicAttack: 18, magicDefense: 12, speed: 20,
      critRate: 0.15, critDamage: 1.7, dodge: 0.12, hitRate: 0.93,
      expReward: 80, goldReward: 50
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.2,
    spawnWeight: 16,
    normalSkills: ['attack', 'shadow_strike'],
    eliteSkills: ['attack', 'shadow_strike', 'poison_arrow'],
    lordSkills: ['attack', 'shadow_strike', 'poison_arrow', 'shadow_dance'],
    dropTable: [
      { itemId: 'potion_hp_medium', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_dark_crystal', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_bow_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_ring_1', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'shadow',
    name: '暗影魔',
    level: 15,
    element: Element.Physical,
    baseStats: {
      hp: 70, mp: 50, attack: 20, defense: 8,
      magicAttack: 25, magicDefense: 8, speed: 24,
      critRate: 0.18, critDamage: 1.8, dodge: 0.18, hitRate: 0.9,
      expReward: 85, goldReward: 55
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.2,
    spawnWeight: 14,
    normalSkills: ['attack', 'dark_pulse'],
    eliteSkills: ['attack', 'dark_pulse', 'life_drain'],
    lordSkills: ['attack', 'dark_pulse', 'life_drain', 'void_zone'],
    dropTable: [
      { itemId: 'potion_mp_medium', dropRate: 0.2, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_shadow_essence', dropRate: 0.35, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_sword_2', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_legs_1', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },

  // ===== 熔岩峡谷补充怪物 =====
  {
    id: 'lavagoyle',
    name: '熔岩石像鬼',
    level: 17,
    element: Element.Fire,
    baseStats: {
      hp: 120, mp: 30, attack: 22, defense: 25,
      magicAttack: 10, magicDefense: 15, speed: 8,
      critRate: 0.06, critDamage: 1.5, dodge: 0.02, hitRate: 0.96,
      expReward: 90, goldReward: 55
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.2,
    spawnWeight: 18,
    normalSkills: ['attack', 'stone_throw'],
    eliteSkills: ['attack', 'stone_throw', 'lava_spit'],
    lordSkills: ['attack', 'stone_throw', 'lava_spit', 'stone_form'],
    dropTable: [
      { itemId: 'potion_hp_medium', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_lava_stone', dropRate: 0.35, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_helmet_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_1', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'fireelemental',
    name: '火焰元素',
    level: 21,
    element: Element.Fire,
    baseStats: {
      hp: 100, mp: 100, attack: 8, defense: 8,
      magicAttack: 35, magicDefense: 20, speed: 16,
      critRate: 0.1, critDamage: 1.7, dodge: 0.1, hitRate: 0.92,
      expReward: 120, goldReward: 70
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.2,
    spawnWeight: 16,
    normalSkills: ['attack', 'fireball', 'flame_wave'],
    eliteSkills: ['attack', 'fireball', 'flame_wave', 'fire_shield'],
    lordSkills: ['attack', 'fireball', 'flame_wave', 'fire_shield', 'inferno'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.2, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'potion_mp_medium', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_fire_essence', dropRate: 0.4, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'equip_staff_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_sword_2', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'phoenix',
    name: '凤凰',
    level: 23,
    element: Element.Fire,
    baseStats: {
      hp: 130, mp: 120, attack: 28, defense: 15,
      magicAttack: 32, magicDefense: 22, speed: 26,
      critRate: 0.14, critDamage: 1.8, dodge: 0.14, hitRate: 0.94,
      expReward: 150, goldReward: 90
    },
    eliteMultiplier: 1.9,
    lordMultiplier: 3.5,
    spawnWeight: 12,
    normalSkills: ['attack', 'fireball', 'wing_slash'],
    eliteSkills: ['attack', 'fireball', 'wing_slash', 'rebirth_flame'],
    lordSkills: ['attack', 'fireball', 'wing_slash', 'rebirth_flame', 'supernova'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_phoenix_feather', dropRate: 0.15, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mat_fire_essence', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_bow_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  {
    id: 'demon',
    name: '恶魔',
    level: 25,
    element: Element.Physical,
    baseStats: {
      hp: 180, mp: 80, attack: 35, defense: 20,
      magicAttack: 25, magicDefense: 18, speed: 18,
      critRate: 0.12, critDamage: 1.8, dodge: 0.08, hitRate: 0.94,
      expReward: 170, goldReward: 100
    },
    eliteMultiplier: 1.9,
    lordMultiplier: 3.5,
    spawnWeight: 14,
    normalSkills: ['attack', 'dark_slash'],
    eliteSkills: ['attack', 'dark_slash', 'demon_roar'],
    lordSkills: ['attack', 'dark_slash', 'demon_roar', 'chaos_strike'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_demon_horn', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_sword_2', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'hellhound',
    name: '地狱犬',
    level: 26,
    element: Element.Fire,
    baseStats: {
      hp: 140, mp: 40, attack: 38, defense: 14,
      magicAttack: 15, magicDefense: 10, speed: 28,
      critRate: 0.16, critDamage: 1.9, dodge: 0.1, hitRate: 0.93,
      expReward: 180, goldReward: 110
    },
    eliteMultiplier: 1.9,
    lordMultiplier: 3.5,
    spawnWeight: 14,
    normalSkills: ['attack', 'fire_bite'],
    eliteSkills: ['attack', 'fire_bite', 'hellfire_breath'],
    lordSkills: ['attack', 'fire_bite', 'hellfire_breath', 'cerberus_fury'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.2, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_hellfire_soul', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_boots_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_legs_1', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },

  // ===== 冰霜要塞补充怪物 =====
  {
    id: 'frostgiant',
    name: '冰霜巨人',
    level: 27,
    element: Element.Ice,
    baseStats: {
      hp: 220, mp: 50, attack: 40, defense: 30,
      magicAttack: 20, magicDefense: 25, speed: 10,
      critRate: 0.08, critDamage: 1.7, dodge: 0.03, hitRate: 0.96,
      expReward: 200, goldReward: 130
    },
    eliteMultiplier: 1.9,
    lordMultiplier: 3.5,
    spawnWeight: 16,
    normalSkills: ['attack', 'ice_slam'],
    eliteSkills: ['attack', 'ice_slam', 'frost_roar'],
    lordSkills: ['attack', 'ice_slam', 'frost_roar', 'avalanche'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_frost_fang', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_armor_1', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_helmet_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'wraith',
    name: '幽灵',
    level: 31,
    element: Element.Ice,
    baseStats: {
      hp: 100, mp: 100, attack: 15, defense: 8,
      magicAttack: 40, magicDefense: 25, speed: 24,
      critRate: 0.14, critDamage: 1.8, dodge: 0.2, hitRate: 0.88,
      expReward: 220, goldReward: 140
    },
    eliteMultiplier: 1.9,
    lordMultiplier: 3.5,
    spawnWeight: 16,
    normalSkills: ['attack', 'soul_drain'],
    eliteSkills: ['attack', 'soul_drain', 'phantom_strike'],
    lordSkills: ['attack', 'soul_drain', 'phantom_strike', 'death_wail'],
    dropTable: [
      { itemId: 'potion_mp_large', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_wraith_cloth', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_staff_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_ring_1', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'icewyrm',
    name: '冰龙',
    level: 33,
    element: Element.Ice,
    baseStats: {
      hp: 280, mp: 150, attack: 45, defense: 35,
      magicAttack: 38, magicDefense: 30, speed: 18,
      critRate: 0.12, critDamage: 1.9, dodge: 0.06, hitRate: 0.95,
      expReward: 280, goldReward: 170
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 3.5,
    spawnWeight: 12,
    normalSkills: ['attack', 'ice_breath', 'tail_sweep'],
    eliteSkills: ['attack', 'ice_breath', 'tail_sweep', 'frost_armor'],
    lordSkills: ['attack', 'ice_breath', 'tail_sweep', 'frost_armor', 'absolute_zero'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.3, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'mat_wyrm_scale', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_ice_crystal', dropRate: 0.35, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'equip_sword_2', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'frostlich',
    name: '霜之巫妖',
    level: 35,
    element: Element.Ice,
    baseStats: {
      hp: 200, mp: 200, attack: 20, defense: 20,
      magicAttack: 50, magicDefense: 40, speed: 16,
      critRate: 0.1, critDamage: 2.0, dodge: 0.08, hitRate: 0.94,
      expReward: 320, goldReward: 200
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 4.0,
    spawnWeight: 10,
    normalSkills: ['attack', 'frost_nova', 'dark_bolt'],
    eliteSkills: ['attack', 'frost_nova', 'dark_bolt', 'summon_skeletons'],
    lordSkills: ['attack', 'frost_nova', 'dark_bolt', 'summon_skeletons', 'apocalypse'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.3, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'potion_mp_large', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_lich_staff', dropRate: 0.15, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'equip_staff_1', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_ring_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'icetitan',
    name: '冰霜泰坦',
    level: 36,
    element: Element.Ice,
    baseStats: {
      hp: 400, mp: 80, attack: 55, defense: 45,
      magicAttack: 20, magicDefense: 35, speed: 12,
      critRate: 0.08, critDamage: 2.0, dodge: 0.02, hitRate: 0.98,
      expReward: 350, goldReward: 220
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 4.0,
    spawnWeight: 8,
    normalSkills: ['attack', 'ground_slam'],
    eliteSkills: ['attack', 'ground_slam', 'frost_quake'],
    lordSkills: ['attack', 'ground_slam', 'frost_quake', 'titan_rage'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.35, minQuantity: 2, maxQuantity: 3 },
      { itemId: 'mat_titan_heart', dropRate: 0.12, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mat_ice_crystal', dropRate: 0.4, minQuantity: 2, maxQuantity: 3 },
      { itemId: 'equip_helmet_1', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },

  // ===== 魔龙巢穴补充怪物 =====
  {
    id: 'drake',
    name: '幼龙',
    level: 37,
    element: Element.Fire,
    baseStats: {
      hp: 250, mp: 80, attack: 50, defense: 30,
      magicAttack: 30, magicDefense: 25, speed: 18,
      critRate: 0.1, critDamage: 1.8, dodge: 0.06, hitRate: 0.95,
      expReward: 350, goldReward: 200
    },
    eliteMultiplier: 1.9,
    lordMultiplier: 3.5,
    spawnWeight: 18,
    normalSkills: ['attack', 'fire_breath'],
    eliteSkills: ['attack', 'fire_breath', 'wing_slash'],
    lordSkills: ['attack', 'fire_breath', 'wing_slash', 'dragon_rage'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.3, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'mat_drake_bone', dropRate: 0.35, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_sword_2', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'wyvern',
    name: '双足飞龙',
    level: 38,
    element: Element.Poison,
    baseStats: {
      hp: 200, mp: 60, attack: 45, defense: 22,
      magicAttack: 35, magicDefense: 18, speed: 28,
      critRate: 0.16, critDamage: 1.9, dodge: 0.12, hitRate: 0.93,
      expReward: 380, goldReward: 220
    },
    eliteMultiplier: 1.9,
    lordMultiplier: 3.5,
    spawnWeight: 16,
    normalSkills: ['attack', 'poison_spit'],
    eliteSkills: ['attack', 'poison_spit', 'dive_attack'],
    lordSkills: ['attack', 'poison_spit', 'dive_attack', 'tail_venom'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_wyvern_venom', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_bow_1', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_boots_1', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'dragonegg',
    name: '龙蛋守卫',
    level: 42,
    element: Element.Fire,
    baseStats: {
      hp: 350, mp: 100, attack: 55, defense: 40,
      magicAttack: 40, magicDefense: 35, speed: 14,
      critRate: 0.1, critDamage: 1.9, dodge: 0.05, hitRate: 0.96,
      expReward: 450, goldReward: 280
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 4.0,
    spawnWeight: 14,
    normalSkills: ['attack', 'fire_breath', 'stone_skin'],
    eliteSkills: ['attack', 'fire_breath', 'stone_skin', 'egg_shield'],
    lordSkills: ['attack', 'fire_breath', 'stone_skin', 'egg_shield', 'inferno'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.3, minQuantity: 2, maxQuantity: 3 },
      { itemId: 'mat_dragon_blood', dropRate: 0.15, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mat_dragon_scale', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_sword_2', dropRate: 0.07, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_1', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'elderdake',
    name: '远古幼龙',
    level: 43,
    element: Element.Fire,
    baseStats: {
      hp: 400, mp: 150, attack: 65, defense: 45,
      magicAttack: 50, magicDefense: 40, speed: 20,
      critRate: 0.12, critDamage: 2.0, dodge: 0.06, hitRate: 0.96,
      expReward: 500, goldReward: 320
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 4.0,
    spawnWeight: 10,
    normalSkills: ['attack', 'dragon_breath', 'wing_slash'],
    eliteSkills: ['attack', 'dragon_breath', 'wing_slash', 'fire_shield'],
    lordSkills: ['attack', 'dragon_breath', 'wing_slash', 'fire_shield', 'elder_rage'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.35, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_dragon_blood', dropRate: 0.2, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_dragon_scale', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_sword_2', dropRate: 0.08, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_helmet_1', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },
  {
    id: 'dragonlord',
    name: '龙王',
    level: 50,
    element: Element.Fire,
    baseStats: {
      hp: 800, mp: 300, attack: 100, defense: 65,
      magicAttack: 80, magicDefense: 60, speed: 22,
      critRate: 0.18, critDamage: 2.2, dodge: 0.06, hitRate: 0.98,
      expReward: 1000, goldReward: 600
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 4.0,
    spawnWeight: 5,
    normalSkills: ['attack', 'dragon_breath', 'tail_sweep'],
    eliteSkills: ['attack', 'dragon_breath', 'tail_sweep', 'dragon_rage'],
    lordSkills: ['attack', 'dragon_breath', 'tail_sweep', 'dragon_rage', 'apocalypse'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.5, minQuantity: 3, maxQuantity: 5 },
      { itemId: 'potion_mp_large', dropRate: 0.4, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_dragonlord_gem', dropRate: 0.08, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] },
      { itemId: 'mat_dragon_blood', dropRate: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_dragon_scale', dropRate: 0.35, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'equip_weapon_legendary', dropRate: 0.02, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },

  // ===== 魔龙巢穴（已有） =====
  {
    id: 'dragon',
    name: '魔龙',
    level: 48,
    element: Element.Fire,
    baseStats: {
      hp: 500, mp: 200, attack: 80, defense: 50,
      magicAttack: 60, magicDefense: 45, speed: 25,
      critRate: 0.15, critDamage: 2.0, dodge: 0.05, hitRate: 0.98,
      expReward: 500, goldReward: 300
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.5,
    spawnWeight: 10,
    normalSkills: ['attack', 'dragon_breath'],
    eliteSkills: ['attack', 'dragon_breath', 'tail_sweep'],
    lordSkills: ['attack', 'dragon_breath', 'tail_sweep', 'dragon_rage'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'potion_mp_large', dropRate: 0.4, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'equip_weapon_legendary', dropRate: 0.01, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] },
      { itemId: 'mat_dragon_scale', dropRate: 0.3, minQuantity: 1, maxQuantity: 3 }
    ]
  },

  // ===== 深渊领域怪物 =====
  {
    id: 'shadow_wraith',
    name: '暗影幽魂',
    level: 45,
    element: Element.Dark,
    baseStats: {
      hp: 400, mp: 150, attack: 65, defense: 40,
      magicAttack: 55, magicDefense: 35, speed: 30,
      critRate: 0.12, critDamage: 1.8, dodge: 0.08, hitRate: 0.96,
      expReward: 450, goldReward: 250
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.0,
    spawnWeight: 20,
    normalSkills: ['attack', 'shadow_strike'],
    eliteSkills: ['attack', 'shadow_strike', 'dark_nova'],
    lordSkills: ['attack', 'shadow_strike', 'dark_nova', 'abyss_drain'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.4, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'potion_mp_large', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_abyssal_shard', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_ring_2', dropRate: 0.05, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'equip_necklace_2', dropRate: 0.05, minQuantity: 1, maxQuantity: 1 }
    ]
  },
  {
    id: 'void_stalker',
    name: '虚空行者',
    level: 48,
    element: Element.Dark,
    baseStats: {
      hp: 350, mp: 200, attack: 75, defense: 35,
      magicAttack: 70, magicDefense: 30, speed: 35,
      critRate: 0.15, critDamage: 2.0, dodge: 0.12, hitRate: 0.97,
      expReward: 550, goldReward: 300
    },
    eliteMultiplier: 1.8,
    lordMultiplier: 3.2,
    spawnWeight: 15,
    normalSkills: ['attack', 'void_bolt'],
    eliteSkills: ['attack', 'void_bolt', 'shadow_strike', 'shadow_clones'],
    lordSkills: ['attack', 'void_bolt', 'shadow_strike', 'dark_nova', 'void_rift'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_abyssal_shard', dropRate: 0.4, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'mat_shadow_blade', dropRate: 0.08, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'mat_void_essence', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_sword_4', dropRate: 0.03, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_bow_2', dropRate: 0.06, minQuantity: 1, maxQuantity: 1 }
    ]
  },
  {
    id: 'abyssal_golem',
    name: '深渊魔像',
    level: 50,
    element: Element.Dark,
    baseStats: {
      hp: 700, mp: 100, attack: 55, defense: 70,
      magicAttack: 40, magicDefense: 55, speed: 10,
      critRate: 0.08, critDamage: 1.6, dodge: 0.02, hitRate: 0.98,
      expReward: 600, goldReward: 350
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 3.5,
    spawnWeight: 10,
    normalSkills: ['attack', 'abyss_drain'],
    eliteSkills: ['attack', 'abyss_drain', 'dark_nova', 'shadow_clones'],
    lordSkills: ['attack', 'abyss_drain', 'dark_nova', 'void_rift'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.6, minQuantity: 2, maxQuantity: 5 },
      { itemId: 'potion_mp_large', dropRate: 0.4, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'mat_abyssal_shard', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_void_essence', dropRate: 0.1, minQuantity: 1, maxQuantity: 2, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_4', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_helmet_4', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_3', dropRate: 0.06, minQuantity: 1, maxQuantity: 1 }
    ]
  },
  {
    id: 'shadow_hunter',
    name: '暗影猎手',
    level: 52,
    element: Element.Dark,
    baseStats: {
      hp: 450, mp: 180, attack: 85, defense: 45,
      magicAttack: 60, magicDefense: 40, speed: 38,
      critRate: 0.18, critDamage: 2.2, dodge: 0.15, hitRate: 0.98,
      expReward: 700, goldReward: 400
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 3.8,
    spawnWeight: 12,
    normalSkills: ['attack', 'shadow_strike', 'void_bolt'],
    eliteSkills: ['attack', 'shadow_strike', 'void_bolt', 'shadow_clones', 'abyss_drain'],
    lordSkills: ['attack', 'shadow_strike', 'void_bolt', 'dark_nova', 'void_rift', 'abyss_drain'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_abyssal_shard', dropRate: 0.4, minQuantity: 2, maxQuantity: 3 },
      { itemId: 'mat_shadow_blade', dropRate: 0.15, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mat_void_essence', dropRate: 0.08, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'equip_sword_4', dropRate: 0.05, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'equip_boots_2', dropRate: 0.06, minQuantity: 1, maxQuantity: 1 }
    ]
  },
  {
    id: 'void_titan',
    name: '虚空泰坦',
    level: 55,
    element: Element.Dark,
    baseStats: {
      hp: 900, mp: 200, attack: 80, defense: 75,
      magicAttack: 70, magicDefense: 60, speed: 18,
      critRate: 0.1, critDamage: 1.8, dodge: 0.04, hitRate: 0.99,
      expReward: 900, goldReward: 500
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 4.0,
    spawnWeight: 8,
    normalSkills: ['attack', 'abyss_drain', 'dark_nova'],
    eliteSkills: ['attack', 'abyss_drain', 'dark_nova', 'void_rift', 'shadow_clones'],
    lordSkills: ['attack', 'abyss_drain', 'dark_nova', 'void_rift', 'shadow_clones'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.6, minQuantity: 3, maxQuantity: 5 },
      { itemId: 'potion_mp_large', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_abyssal_shard', dropRate: 0.6, minQuantity: 2, maxQuantity: 5 },
      { itemId: 'mat_void_essence', dropRate: 0.15, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_shadow_blade', dropRate: 0.1, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'equip_armor_4', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_helmet_4', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_sword_4', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  {
    id: 'abyss_lord',
    name: '深渊领主',
    level: 58,
    element: Element.Dark,
    baseStats: {
      hp: 1200, mp: 300, attack: 95, defense: 80,
      magicAttack: 90, magicDefense: 70, speed: 25,
      critRate: 0.15, critDamage: 2.2, dodge: 0.08, hitRate: 0.99,
      expReward: 1200, goldReward: 700
    },
    eliteMultiplier: 2.2,
    lordMultiplier: 5.0,
    spawnWeight: 5,
    normalSkills: ['attack', 'shadow_strike', 'void_bolt', 'dark_nova'],
    eliteSkills: ['attack', 'shadow_strike', 'void_bolt', 'dark_nova', 'abyss_drain', 'shadow_clones'],
    lordSkills: ['attack', 'shadow_strike', 'void_bolt', 'dark_nova', 'void_rift', 'abyss_drain', 'shadow_clones'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.7, minQuantity: 3, maxQuantity: 6 },
      { itemId: 'potion_mp_large', dropRate: 0.6, minQuantity: 2, maxQuantity: 5 },
      { itemId: 'mat_abyssal_shard', dropRate: 0.7, minQuantity: 3, maxQuantity: 6 },
      { itemId: 'mat_void_essence', dropRate: 0.2, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'mat_shadow_blade', dropRate: 0.12, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_abyssal_core', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] },
      { itemId: 'equip_sword_4', dropRate: 0.08, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_4', dropRate: 0.08, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_staff_legendary', dropRate: 0.02, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  },

  // ===== 神界圣域怪物 =====
  {
    id: 'holy_knight',
    name: '圣殿骑士',
    level: 55,
    element: Element.Holy,
    baseStats: {
      hp: 600, mp: 150, attack: 80, defense: 70,
      magicAttack: 50, magicDefense: 65, speed: 20,
      critRate: 0.1, critDamage: 1.8, dodge: 0.05, hitRate: 0.98,
      expReward: 800, goldReward: 450
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 3.5,
    spawnWeight: 18,
    normalSkills: ['attack', 'holy_slash'],
    eliteSkills: ['attack', 'holy_slash', 'angelic_barrier', 'divine_judgment'],
    lordSkills: ['attack', 'holy_slash', 'divine_judgment', 'celestial_storm', 'holy_resurrection'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'potion_mp_large', dropRate: 0.4, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'mat_holy_shard', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_helmet_3', dropRate: 0.06, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'equip_armor_3', dropRate: 0.06, minQuantity: 1, maxQuantity: 1 }
    ]
  },
  {
    id: 'seraph',
    name: '炽天使',
    level: 58,
    element: Element.Holy,
    baseStats: {
      hp: 500, mp: 250, attack: 60, defense: 50,
      magicAttack: 85, magicDefense: 55, speed: 28,
      critRate: 0.14, critDamage: 2.0, dodge: 0.1, hitRate: 0.98,
      expReward: 900, goldReward: 500
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 3.8,
    spawnWeight: 14,
    normalSkills: ['attack', 'holy_slash', 'divine_judgment'],
    eliteSkills: ['attack', 'holy_slash', 'divine_judgment', 'celestial_storm', 'angelic_barrier'],
    lordSkills: ['attack', 'holy_slash', 'divine_judgment', 'celestial_storm', 'holy_resurrection', 'wrath_of_god'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'potion_mp_large', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_holy_shard', dropRate: 0.4, minQuantity: 2, maxQuantity: 3 },
      { itemId: 'mat_angel_feather', dropRate: 0.08, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'mat_celestial_dust', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_staff_2', dropRate: 0.06, minQuantity: 1, maxQuantity: 1 }
    ]
  },
  {
    id: 'star_guardian',
    name: '星辰守卫',
    level: 60,
    element: Element.Holy,
    baseStats: {
      hp: 800, mp: 200, attack: 70, defense: 80,
      magicAttack: 75, magicDefense: 70, speed: 22,
      critRate: 0.1, critDamage: 1.8, dodge: 0.06, hitRate: 0.99,
      expReward: 1000, goldReward: 550
    },
    eliteMultiplier: 2.0,
    lordMultiplier: 4.0,
    spawnWeight: 10,
    normalSkills: ['attack', 'holy_slash', 'angelic_barrier'],
    eliteSkills: ['attack', 'holy_slash', 'divine_judgment', 'celestial_storm', 'angelic_barrier'],
    lordSkills: ['attack', 'divine_judgment', 'celestial_storm', 'holy_resurrection', 'wrath_of_god'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.6, minQuantity: 3, maxQuantity: 5 },
      { itemId: 'potion_mp_large', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_holy_shard', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_celestial_dust', dropRate: 0.1, minQuantity: 1, maxQuantity: 2, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'mat_angel_feather', dropRate: 0.06, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'equip_helmet_4', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_armor_4', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  {
    id: 'archangel',
    name: '大天使',
    level: 62,
    element: Element.Holy,
    baseStats: {
      hp: 650, mp: 300, attack: 90, defense: 60,
      magicAttack: 95, magicDefense: 65, speed: 32,
      critRate: 0.15, critDamage: 2.2, dodge: 0.12, hitRate: 0.99,
      expReward: 1100, goldReward: 600
    },
    eliteMultiplier: 2.2,
    lordMultiplier: 4.2,
    spawnWeight: 12,
    normalSkills: ['attack', 'holy_slash', 'divine_judgment'],
    eliteSkills: ['attack', 'holy_slash', 'divine_judgment', 'celestial_storm', 'holy_resurrection'],
    lordSkills: ['attack', 'divine_judgment', 'celestial_storm', 'holy_resurrection', 'wrath_of_god'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.6, minQuantity: 3, maxQuantity: 5 },
      { itemId: 'mat_holy_shard', dropRate: 0.5, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'mat_angel_feather', dropRate: 0.15, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_celestial_dust', dropRate: 0.1, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'equip_bow_legendary', dropRate: 0.03, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] },
      { itemId: 'equip_sword_4', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  {
    id: 'divine_beast',
    name: '神兽麒麟',
    level: 65,
    element: Element.Holy,
    baseStats: {
      hp: 1000, mp: 250, attack: 85, defense: 85,
      magicAttack: 80, magicDefense: 75, speed: 26,
      critRate: 0.12, critDamage: 2.0, dodge: 0.08, hitRate: 0.99,
      expReward: 1300, goldReward: 700
    },
    eliteMultiplier: 2.2,
    lordMultiplier: 4.5,
    spawnWeight: 8,
    normalSkills: ['attack', 'holy_slash', 'celestial_storm', 'angelic_barrier'],
    eliteSkills: ['attack', 'holy_slash', 'divine_judgment', 'celestial_storm', 'holy_resurrection', 'angelic_barrier'],
    lordSkills: ['attack', 'divine_judgment', 'celestial_storm', 'holy_resurrection', 'wrath_of_god', 'angelic_barrier'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.7, minQuantity: 3, maxQuantity: 6 },
      { itemId: 'potion_mp_large', dropRate: 0.6, minQuantity: 2, maxQuantity: 5 },
      { itemId: 'mat_holy_shard', dropRate: 0.6, minQuantity: 3, maxQuantity: 5 },
      { itemId: 'mat_celestial_dust', dropRate: 0.15, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_angel_feather', dropRate: 0.12, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'mat_god_core', dropRate: 0.03, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] },
      { itemId: 'equip_armor_4', dropRate: 0.07, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] },
      { itemId: 'equip_helmet_4', dropRate: 0.07, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Elite, MonsterTitle.Lord] }
    ]
  },
  {
    id: 'god_emperor',
    name: '神皇',
    level: 70,
    element: Element.Holy,
    baseStats: {
      hp: 1500, mp: 400, attack: 110, defense: 90,
      magicAttack: 100, magicDefense: 85, speed: 30,
      critRate: 0.18, critDamage: 2.5, dodge: 0.1, hitRate: 1.0,
      expReward: 2000, goldReward: 1000
    },
    eliteMultiplier: 2.5,
    lordMultiplier: 6.0,
    spawnWeight: 4,
    normalSkills: ['attack', 'holy_slash', 'divine_judgment', 'celestial_storm'],
    eliteSkills: ['attack', 'holy_slash', 'divine_judgment', 'celestial_storm', 'holy_resurrection', 'angelic_barrier'],
    lordSkills: ['attack', 'divine_judgment', 'celestial_storm', 'holy_resurrection', 'wrath_of_god', 'angelic_barrier'],
    dropTable: [
      { itemId: 'potion_hp_large', dropRate: 0.8, minQuantity: 4, maxQuantity: 8 },
      { itemId: 'potion_mp_large', dropRate: 0.7, minQuantity: 3, maxQuantity: 6 },
      { itemId: 'mat_holy_shard', dropRate: 0.7, minQuantity: 3, maxQuantity: 6 },
      { itemId: 'mat_celestial_dust', dropRate: 0.25, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'mat_angel_feather', dropRate: 0.18, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'mat_god_core', dropRate: 0.06, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] },
      { itemId: 'equip_weapon_legendary', dropRate: 0.05, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] },
      { itemId: 'equip_staff_legendary', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] },
      { itemId: 'equip_bow_legendary', dropRate: 0.04, minQuantity: 1, maxQuantity: 1, titleRestriction: [MonsterTitle.Lord] }
    ]
  }
]

/** 获取怪物模板 */
export function getMonsterTemplate(templateId: string) {
  return monsterTemplates.find(m => m.id === templateId)
}

/** 获取指定地图的怪物模板列表 */
export function getMapMonsterTemplates(mapMonsterIds: string[]) {
  return monsterTemplates.filter(m => mapMonsterIds.includes(m.id))
}
