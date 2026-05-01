/**
 * 成就配置
 */
import type { Achievement } from '@/types'

/** 成就列表 */
export const achievements: Achievement[] = [
  // ===== 击杀成就 =====
  {
    id: 'ach_kill_10',
    name: '初出茅庐',
    description: '击杀10只怪物',
    icon: '⚔️',
    type: 'kill',
    requirement: { target: 'any', count: 10 },
    rewards: { gold: 50, exp: 100 },
    unlocked: false
  },
  {
    id: 'ach_kill_100',
    name: '小有名气',
    description: '击杀100只怪物',
    icon: '🗡️',
    type: 'kill',
    requirement: { target: 'any', count: 100 },
    rewards: { gold: 200, exp: 500 },
    unlocked: false
  },
  {
    id: 'ach_kill_1000',
    name: '杀戮机器',
    description: '击杀1000只怪物',
    icon: '💀',
    type: 'kill',
    requirement: { target: 'any', count: 1000 },
    rewards: { gold: 1000, exp: 2000 },
    unlocked: false
  },
  {
    id: 'ach_kill_5000',
    name: '万夫莫敌',
    description: '击杀5000只怪物',
    icon: '☠️',
    type: 'kill',
    requirement: { target: 'any', count: 5000 },
    rewards: { gold: 5000, exp: 10000 },
    unlocked: false
  },
  {
    id: 'ach_kill_elite_10',
    name: '精英猎手',
    description: '击杀10只精英怪物',
    icon: '⭐',
    type: 'kill',
    requirement: { target: 'elite', count: 10 },
    rewards: { gold: 300, exp: 800 },
    unlocked: false
  },
  {
    id: 'ach_kill_elite_50',
    name: '精英克星',
    description: '击杀50只精英怪物',
    icon: '🌟',
    type: 'kill',
    requirement: { target: 'elite', count: 50 },
    rewards: { gold: 800, exp: 2000 },
    unlocked: false
  },
  {
    id: 'ach_kill_lord_1',
    name: '领主终结者',
    description: '击杀1只领主怪物',
    icon: '👑',
    type: 'kill',
    requirement: { target: 'lord', count: 1 },
    rewards: { gold: 500, exp: 1500 },
    unlocked: false
  },
  {
    id: 'ach_kill_lord_10',
    name: '传奇猎人',
    description: '击杀10只领主怪物',
    icon: '🏆',
    type: 'kill',
    requirement: { target: 'lord', count: 10 },
    rewards: { gold: 2000, exp: 5000 },
    unlocked: false
  },
  {
    id: 'ach_kill_lord_50',
    name: '领主收割者',
    description: '击杀50只领主怪物',
    icon: '👑',
    type: 'kill',
    requirement: { target: 'lord', count: 50 },
    rewards: { gold: 10000, exp: 25000 },
    unlocked: false
  },

  // ===== 等级成就 =====
  {
    id: 'ach_level_5',
    name: '初窥门径',
    description: '达到5级',
    icon: '🌱',
    type: 'level',
    requirement: { target: 'level', count: 5 },
    rewards: { gold: 50 },
    unlocked: false
  },
  {
    id: 'ach_level_10',
    name: '成长之路',
    description: '达到10级',
    icon: '📈',
    type: 'level',
    requirement: { target: 'level', count: 10 },
    rewards: { gold: 100 },
    unlocked: false
  },
  {
    id: 'ach_level_15',
    name: '崭露头角',
    description: '达到15级',
    icon: '🌿',
    type: 'level',
    requirement: { target: 'level', count: 15 },
    rewards: { gold: 200 },
    unlocked: false
  },
  {
    id: 'ach_level_25',
    name: '中坚力量',
    description: '达到25级',
    icon: '🎖️',
    type: 'level',
    requirement: { target: 'level', count: 25 },
    rewards: { gold: 500 },
    unlocked: false
  },
  {
    id: 'ach_level_30',
    name: '百战之师',
    description: '达到30级',
    icon: '⚔️',
    type: 'level',
    requirement: { target: 'level', count: 30 },
    rewards: { gold: 1000 },
    unlocked: false
  },
  {
    id: 'ach_level_40',
    name: '英雄无双',
    description: '达到40级',
    icon: '🔰',
    type: 'level',
    requirement: { target: 'level', count: 40 },
    rewards: { gold: 3000 },
    unlocked: false
  },
  {
    id: 'ach_level_50',
    name: '满级英雄',
    description: '达到50级满级',
    icon: '🌟',
    type: 'level',
    requirement: { target: 'level', count: 50 },
    rewards: { gold: 5000 },
    unlocked: false
  },

  // ===== 收集成就 =====
  {
    id: 'ach_collect_100',
    name: '拾荒者',
    description: '拾取100件物品',
    icon: '🎒',
    type: 'collect',
    requirement: { target: 'pickup', count: 100 },
    rewards: { gold: 100, exp: 200 },
    unlocked: false
  },
  {
    id: 'ach_collect_1000',
    name: '拾荒大师',
    description: '拾取1000件物品',
    icon: '💎',
    type: 'collect',
    requirement: { target: 'pickup', count: 1000 },
    rewards: { gold: 500, exp: 1500 },
    unlocked: false
  },
  {
    id: 'ach_equipment_legendary',
    name: '传说收藏家',
    description: '获得1件传说品质装备',
    icon: '🏆',
    type: 'collect',
    requirement: { target: 'legendary', count: 1 },
    rewards: { gold: 1000, exp: 3000 },
    unlocked: false
  },

  // ===== 金币成就 =====
  {
    id: 'ach_gold_10000',
    name: '小富即安',
    description: '累计获得10000金币',
    icon: '💰',
    type: 'collect',
    requirement: { target: 'gold_total', count: 10000 },
    rewards: { exp: 500 },
    unlocked: false
  },
  {
    id: 'ach_gold_100000',
    name: '富可敌国',
    description: '累计获得100000金币',
    icon: '🏦',
    type: 'collect',
    requirement: { target: 'gold_total', count: 100000 },
    rewards: { exp: 3000 },
    unlocked: false
  },

  // ===== 探索成就 =====
  {
    id: 'ach_explore_village',
    name: '村庄漫步',
    description: '探索新手村所有地图',
    icon: '🏘️',
    type: 'explore',
    requirement: { target: 'area_village', count: 3 },
    rewards: { gold: 200, exp: 300 },
    unlocked: false
  },
  {
    id: 'ach_explore_forest',
    name: '森林探险',
    description: '探索暗影森林所有地图',
    icon: '🌲',
    type: 'explore',
    requirement: { target: 'area_forest', count: 3 },
    rewards: { gold: 500, exp: 800 },
    unlocked: false
  },
  {
    id: 'ach_explore_all',
    name: '探险家',
    description: '解锁所有15张地图',
    icon: '🗺️',
    type: 'explore',
    requirement: { target: 'maps', count: 15 },
    rewards: { gold: 1000, exp: 2000 },
    unlocked: false
  },

  // ===== 战斗成就 =====
  {
    id: 'ach_damage_10000',
    name: '重击',
    description: '单次造成10000点伤害',
    icon: '💥',
    type: 'combat',
    requirement: { target: 'single_damage', count: 10000 },
    rewards: { gold: 500, exp: 1000 },
    unlocked: false
  },
  {
    id: 'ach_dps_1000',
    name: '输出机器',
    description: 'DPS达到1000',
    icon: '⚡',
    type: 'combat',
    requirement: { target: 'dps', count: 1000 },
    rewards: { gold: 300, exp: 800 },
    unlocked: false
  },
  {
    id: 'ach_survival_300',
    name: '浴血奋战',
    description: '单次战斗存活300秒',
    icon: '⏱️',
    type: 'combat',
    requirement: { target: 'survival_time', count: 300 },
    rewards: { gold: 300, exp: 800 },
    unlocked: false
  },
  {
    id: 'ach_survival_600',
    name: '不死之身',
    description: '单次战斗存活600秒',
    icon: '🛡️',
    type: 'combat',
    requirement: { target: 'survival_time', count: 600 },
    rewards: { gold: 800, exp: 2000 },
    unlocked: false
  }
]

/** 获取所有成就 */
export function getAllAchievements(): Achievement[] {
  return achievements
}

/** 获取成就 */
export function getAchievement(achievementId: string): Achievement | undefined {
  return achievements.find(a => a.id === achievementId)
}

/** 获取指定类型的成就 */
export function getAchievementsByType(type: Achievement['type']): Achievement[] {
  return achievements.filter(a => a.type === type)
}
