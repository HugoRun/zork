/**
 * 技能配置（统一入口）
 * 合并玩家技能和怪物技能
 */
import type { SkillConfig } from '@/types'
import { CharacterClass } from '@/types'
import { playerSkillConfigs } from './playerSkills'
import { monsterSkillConfigs } from './monsterSkills'
import { petSkillConfigs } from './petSkills'

/** 所有技能配置 */
export const skillConfigs: SkillConfig[] = [
  ...playerSkillConfigs,
  ...monsterSkillConfigs,
  ...petSkillConfigs
]

/** 获取技能配置 */
export function getSkillConfig(skillId: string): SkillConfig | undefined {
  return skillConfigs.find(s => s.id === skillId)
}

/** 获取职业可用技能 */
export function getClassSkills(classType: CharacterClass): SkillConfig[] {
  return skillConfigs.filter(s =>
    !s.classRestriction || s.classRestriction.includes(classType)
  )
}

/** 获取怪物技能 */
export function getMonsterSkills(skillIds: string[]): SkillConfig[] {
  return skillConfigs.filter(s => skillIds.includes(s.id))
}

/** 获取指定职业的技能ID列表 */
export function getClassSkillIds(classType: CharacterClass): string[] {
  return getClassSkills(classType).map(s => s.id)
}
