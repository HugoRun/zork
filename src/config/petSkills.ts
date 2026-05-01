/**
 * 宠物技能配置
 */
import type { SkillConfig } from '@/types'
import { SkillEffectType, Element } from '@/types'

/** 宠物技能配置 */
export const petSkillConfigs: SkillConfig[] = [
  // ===== 火系 =====
  {
    id: 'pet_fire_bite',
    name: '烈焰撕咬',
    description: '宠物撕咬目标，造成130%伤害并灼烧',
    icon: '🔥',
    effectType: SkillEffectType.PhysicalDamage,
    target: 'single',
    element: Element.Fire,
    value: 1.3,
    cooldown: 3000,
    mpCost: 0,
    unlockLevel: 1,
    priority: 2,
    dot: { damage: 4, interval: 2000, duration: 6000 }
  },
  {
    id: 'pet_fire_roar',
    name: '火焰怒吼',
    description: '发出火焰怒吼，攻击所有敌人',
    icon: '🔥',
    effectType: SkillEffectType.MagicDamage,
    target: 'all',
    element: Element.Fire,
    value: 1.2,
    cooldown: 8000,
    mpCost: 0,
    unlockLevel: 1,
    priority: 3,
    dot: { damage: 6, interval: 2000, duration: 6000 }
  },

  // ===== 冰系 =====
  {
    id: 'pet_ice_breath',
    name: '寒冰吐息',
    description: '喷出寒冰吐息，造成120%伤害并减速',
    icon: '❄️',
    effectType: SkillEffectType.MagicDamage,
    target: 'single',
    element: Element.Ice,
    value: 1.2,
    cooldown: 4000,
    mpCost: 0,
    unlockLevel: 1,
    priority: 2,
    buffs: [{ stat: 'speed', value: -0.2, isPercent: true, duration: 3000 }]
  },
  {
    id: 'pet_blizzard',
    name: '暴风雪',
    description: '召唤暴风雪攻击所有敌人并减速',
    icon: '🌨️',
    effectType: SkillEffectType.MagicDamage,
    target: 'all',
    element: Element.Ice,
    value: 1.0,
    cooldown: 10000,
    mpCost: 0,
    unlockLevel: 1,
    priority: 3,
    buffs: [{ stat: 'speed', value: -0.3, isPercent: true, duration: 4000 }]
  },

  // ===== 雷系 =====
  {
    id: 'pet_thunder_strike',
    name: '雷电一击',
    description: '快速雷电攻击，造成150%伤害',
    icon: '⚡',
    effectType: SkillEffectType.MagicDamage,
    target: 'single',
    element: Element.Lightning,
    value: 1.5,
    cooldown: 5000,
    mpCost: 0,
    unlockLevel: 1,
    priority: 2
  },
]
