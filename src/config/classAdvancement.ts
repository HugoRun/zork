/**
 * 职业进阶系统配置
 * 每个职业有9个进阶阶段，每次进阶增加属性和解锁新技能
 */
import { CharacterClass } from '@/types'
import type { BaseStats } from '@/types'

/** 进阶阶段配置 */
export interface AdvancementTier {
  tier: number              // 阶段 1-9
  name: string              // 阶段名称
  requiredLevel: number     // 所需最低等级
  goldCost: number          // 进阶费用
  statBonus: Partial<BaseStats> // 进阶属性加成（一次性加到基础属性上）
  unlockSkills: string[]    // 解锁的技能ID
  passiveBonus?: string     // 被动效果描述
}

/** 职业进阶配置 */
export interface ClassAdvancement {
  class: CharacterClass
  tiers: AdvancementTier[]
}

/** 所有职业进阶配置 */
export const CLASS_ADVANCEMENTS: ClassAdvancement[] = [
  // ===== 战士 =====
  {
    class: CharacterClass.Warrior,
    tiers: [
      {
        tier: 1,
        name: '见习战士',
        requiredLevel: 1,
        goldCost: 0,
        statBonus: {},
        unlockSkills: ['warrior_slash'],
        passiveBonus: '无'
      },
      {
        tier: 2,
        name: '正式战士',
        requiredLevel: 10,
        goldCost: 500,
        statBonus: { hp: 100, attack: 10, defense: 8 },
        unlockSkills: ['warrior_whirlwind'],
        passiveBonus: '物理伤害+5%'
      },
      {
        tier: 3,
        name: '精锐战士',
        requiredLevel: 20,
        goldCost: 2000,
        statBonus: { hp: 200, attack: 20, defense: 15, critRate: 0.02 },
        unlockSkills: ['warrior_battle_cry'],
        passiveBonus: '生命值低于30%时，攻击力+15%'
      },
      {
        tier: 4,
        name: '大剑师',
        requiredLevel: 30,
        goldCost: 8000,
        statBonus: { hp: 350, attack: 35, defense: 25, critDamage: 0.1, hitRate: 0.02 },
        unlockSkills: ['warrior_execute'],
        passiveBonus: '攻击时有10%概率触发额外一次攻击'
      },
      {
        tier: 5,
        name: '圣骑士',
        requiredLevel: 40,
        goldCost: 30000,
        statBonus: { hp: 600, attack: 60, defense: 40, critRate: 0.03, critDamage: 0.15, dodge: 0.02 },
        unlockSkills: ['warrior_heroic_strike'],
        passiveBonus: '所有技能伤害+20%，暴击时额外造成目标最大生命值5%伤害'
      },
      {
        tier: 6,
        name: '龙骑士',
        requiredLevel: 50,
        goldCost: 80000,
        statBonus: { hp: 900, attack: 90, defense: 60, critRate: 0.04, speed: 3 },
        unlockSkills: ['warrior_dragon_charge'],
        passiveBonus: '攻击附带目标最大生命值3%的真实伤害'
      },
      {
        tier: 7,
        name: '剑圣',
        requiredLevel: 60,
        goldCost: 200000,
        statBonus: { hp: 1300, attack: 130, defense: 85, critRate: 0.05, critDamage: 0.1, hitRate: 0.03 },
        unlockSkills: ['warrior_sword_aura'],
        passiveBonus: '普通攻击有30%概率转化为范围伤害，伤害为目标的150%'
      },
      {
        tier: 8,
        name: '神武将军',
        requiredLevel: 70,
        goldCost: 500000,
        statBonus: { hp: 1800, attack: 180, defense: 120, speed: 5, dodge: 0.03 },
        unlockSkills: ['warrior_war_god_mode'],
        passiveBonus: '受到致命伤害时保留1点生命值，3秒内攻击力翻倍（冷却60秒）'
      },
      {
        tier: 9,
        name: '战神',
        requiredLevel: 80,
        goldCost: 1000000,
        statBonus: { hp: 2500, attack: 250, defense: 160, critRate: 0.06, critDamage: 0.2, dodge: 0.04, hitRate: 0.04 },
        unlockSkills: ['warrior_ultimate_slash'],
        passiveBonus: '永恒战意：所有伤害+40%，每次击杀恢复5%最大生命值，免疫控制效果'
      }
    ]
  },

  // ===== 法师 =====
  {
    class: CharacterClass.Mage,
    tiers: [
      {
        tier: 1,
        name: '法师学徒',
        requiredLevel: 1,
        goldCost: 0,
        statBonus: {},
        unlockSkills: ['mage_fireball'],
        passiveBonus: '无'
      },
      {
        tier: 2,
        name: '初级法师',
        requiredLevel: 10,
        goldCost: 500,
        statBonus: { mp: 60, magicAttack: 15, magicDefense: 10 },
        unlockSkills: ['mage_heal'],
        passiveBonus: '魔法伤害+5%'
      },
      {
        tier: 3,
        name: '大魔法师',
        requiredLevel: 20,
        goldCost: 2000,
        statBonus: { mp: 120, magicAttack: 30, magicDefense: 20, hp: 80 },
        unlockSkills: ['mage_meteor'],
        passiveBonus: '技能暴击时MP消耗减少30%'
      },
      {
        tier: 4,
        name: '魔导士',
        requiredLevel: 30,
        goldCost: 8000,
        statBonus: { mp: 200, magicAttack: 50, magicDefense: 35, critRate: 0.03, speed: 2 },
        unlockSkills: ['mage_frost_nova'],
        passiveBonus: '魔法伤害无视目标15%魔法抗性'
      },
      {
        tier: 5,
        name: '大魔导师',
        requiredLevel: 40,
        goldCost: 30000,
        statBonus: { mp: 350, magicAttack: 80, magicDefense: 55, critRate: 0.04, critDamage: 0.2 },
        unlockSkills: ['mage_arcane_blast'],
        passiveBonus: '所有魔法伤害+25%，施法速度+15%'
      },
      {
        tier: 6,
        name: '元素使',
        requiredLevel: 50,
        goldCost: 80000,
        statBonus: { mp: 500, magicAttack: 120, magicDefense: 75, critDamage: 0.15, speed: 3 },
        unlockSkills: ['mage_elemental_storm'],
        passiveBonus: '元素伤害+30%，所有元素技能效果范围扩大50%'
      },
      {
        tier: 7,
        name: '贤者',
        requiredLevel: 60,
        goldCost: 200000,
        statBonus: { mp: 700, magicAttack: 170, magicDefense: 100, hp: 300, critRate: 0.03 },
        unlockSkills: ['mage_absolute_barrier'],
        passiveBonus: '获得伤害吸收护盾（每30秒生成，可吸收最大生命值15%的伤害）'
      },
      {
        tier: 8,
        name: '大贤者',
        requiredLevel: 70,
        goldCost: 500000,
        statBonus: { mp: 950, magicAttack: 230, magicDefense: 130, speed: 5, critDamage: 0.1 },
        unlockSkills: ['mage_time_stop'],
        passiveBonus: '时空掌控：技能冷却时间减少20%，所有控制效果持续时间延长30%'
      },
      {
        tier: 9,
        name: '法神',
        requiredLevel: 80,
        goldCost: 1000000,
        statBonus: { mp: 1300, magicAttack: 320, magicDefense: 180, hp: 500, critRate: 0.05, critDamage: 0.25, speed: 5 },
        unlockSkills: ['mage_omniscience'],
        passiveBonus: '全知全能：所有魔法伤害+50%，MP消耗减少40%，法术必定暴击时额外造成200%伤害'
      }
    ]
  },

  // ===== 游侠 =====
  {
    class: CharacterClass.Ranger,
    tiers: [
      {
        tier: 1,
        name: '见习游侠',
        requiredLevel: 1,
        goldCost: 0,
        statBonus: {},
        unlockSkills: ['ranger_double_shot'],
        passiveBonus: '无'
      },
      {
        tier: 2,
        name: '正式游侠',
        requiredLevel: 10,
        goldCost: 500,
        statBonus: { hp: 60, attack: 8, speed: 3, dodge: 0.02 },
        unlockSkills: ['ranger_evade'],
        passiveBonus: '闪避后下次攻击暴击率+20%'
      },
      {
        tier: 3,
        name: '精英猎手',
        requiredLevel: 20,
        goldCost: 2000,
        statBonus: { hp: 120, attack: 18, speed: 5, critRate: 0.03, dodge: 0.03 },
        unlockSkills: ['ranger_multi_shot'],
        passiveBonus: '攻击速度+10%'
      },
      {
        tier: 4,
        name: '神射手',
        requiredLevel: 30,
        goldCost: 8000,
        statBonus: { hp: 200, attack: 30, speed: 8, critRate: 0.04, critDamage: 0.15, hitRate: 0.03 },
        unlockSkills: ['ranger_aimed_shot'],
        passiveBonus: '暴击伤害额外+目标已损生命值3%'
      },
      {
        tier: 5,
        name: '箭神',
        requiredLevel: 40,
        goldCost: 30000,
        statBonus: { hp: 350, attack: 50, speed: 12, critRate: 0.05, critDamage: 0.25, dodge: 0.04 },
        unlockSkills: ['ranger_arrow_rain'],
        passiveBonus: '所有物理伤害+20%，攻击必定命中'
      },
      {
        tier: 6,
        name: '暗影游侠',
        requiredLevel: 50,
        goldCost: 80000,
        statBonus: { hp: 500, attack: 75, speed: 18, critRate: 0.06, dodge: 0.05, critDamage: 0.15 },
        unlockSkills: ['ranger_shadow_strike'],
        passiveBonus: '隐匿之影：攻击时有25%概率进入隐身状态，下次攻击必定暴击'
      },
      {
        tier: 7,
        name: '风行者',
        requiredLevel: 60,
        goldCost: 200000,
        statBonus: { hp: 700, attack: 105, speed: 25, critRate: 0.05, hitRate: 0.05, dodge: 0.04 },
        unlockSkills: ['ranger_wind_walk'],
        passiveBonus: '疾风步：速度额外+30%，连续攻击每次伤害递增5%（上限50%）'
      },
      {
        tier: 8,
        name: '猎魔大师',
        requiredLevel: 70,
        goldCost: 500000,
        statBonus: { hp: 1000, attack: 150, speed: 30, critDamage: 0.2, dodge: 0.05, hitRate: 0.04 },
        unlockSkills: ['ranger_hunters_mark'],
        passiveBonus: '猎魔标记：攻击精英/领主怪物伤害+35%，对标记目标暴击伤害额外+50%'
      },
      {
        tier: 9,
        name: '游侠宗师',
        requiredLevel: 80,
        goldCost: 1000000,
        statBonus: { hp: 1400, attack: 210, speed: 40, critRate: 0.08, critDamage: 0.3, dodge: 0.06, hitRate: 0.06 },
        unlockSkills: ['ranger_phantom_arrow'],
        passiveBonus: '幻影穿云：攻击速度+50%，每次攻击同时发射3支幻影箭（各造成30%伤害），暴击率硬性+20%'
      }
    ]
  }
]

/** 获取职业进阶配置 */
export function getClassAdvancement(charClass: CharacterClass): ClassAdvancement {
  return CLASS_ADVANCEMENTS.find(a => a.class === charClass) || CLASS_ADVANCEMENTS[0]
}

/** 获取当前进阶阶段配置 */
export function getCurrentTierConfig(charClass: CharacterClass, currentTier: number): AdvancementTier {
  const adv = getClassAdvancement(charClass)
  return adv.tiers[currentTier - 1] || adv.tiers[0]
}

/** 获取下一进阶阶段配置 */
export function getNextTierConfig(charClass: CharacterClass, currentTier: number): AdvancementTier | null {
  const adv = getClassAdvancement(charClass)
  return adv.tiers[currentTier] || null
}

/** 进阶阶级总数 */
export const MAX_ADVANCEMENT_TIER = 9

/** 进阶阶级名称 */
export const TIER_NAMES = ['一阶', '二阶', '三阶', '四阶', '五阶', '六阶', '七阶', '八阶', '九阶'] as const
