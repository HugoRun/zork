/**
 * 成就相关类型定义
 */

/** 成就类型 */
export type AchievementType = 'kill' | 'level' | 'collect' | 'explore' | 'combat'

/** 成就需求 */
export interface AchievementRequirement {
  target: string | number
  count: number
}

/** 成就奖励 */
export interface AchievementRewards {
  gold?: number
  exp?: number
  itemId?: string
}

/** 成就配置接口 */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  type: AchievementType
  requirement: AchievementRequirement
  rewards: AchievementRewards
  unlocked: boolean
}
