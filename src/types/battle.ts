import { MonsterTitle } from './common'

/**
 * 战斗相关类型定义
 */

/** 战斗状态枚举 */
export enum BattleState {
  Idle = 'idle',               // 待机（未进入地图）
  Fighting = 'fighting',       // 战斗中
  PlayerDead = 'playerDead',   // 玩家死亡（复活倒计时）
  Victory = 'victory',         // 战斗胜利
  Retreated = 'retreated'      // 已撤退
}

/** 伤害类型 */
export type DamageType = 'physical' | 'magic' | 'skill'

/** 伤害结算结果 */
export interface DamageResult {
  attackerId: string
  attackerName: string
  defenderId: string
  defenderName: string
  damage: number
  isCrit: boolean
  isDodge: boolean
  isMiss: boolean
  damageType: DamageType
  skillName?: string
  element?: string
  timestamp: number
}

/** 治疗结果 */
export interface HealResult {
  healerId: string
  healerName: string
  targetId: string
  targetName: string
  value: number
  source: string // 来源：技能名或药水名
  timestamp: number
}

/** 战斗统计 */
export interface BattleStats {
  totalDamage: number
  totalHeal: number
  totalKills: number
  startTime: number
  dps: number             // 每秒伤害（滑动窗口计算）
  dpsWindow: number[]     // DPS滑动窗口数据
  lastDpsUpdate: number
}

/** 战斗日志条目 */
export interface BattleLogEntry {
  id: string
  type: 'damage' | 'heal' | 'death' | 'pickup' | 'levelup' | 'skill' | 'system'
  content: string
  timestamp: number
  data?: any              // 额外数据
}

/** 战斗日志过滤器 */
export type BattleLogFilter = 'all' | 'battle' | 'pickup' | 'system'

/** 击杀奖励 */
export interface KillReward {
  exp: number
  gold: number
  items: {
    itemId: string
    quantity: number
    quality: string
  }[]
}

/** 战斗实体接口 */
export interface BattleEntity {
  id: string
  name: string
  currentHp: number
  maxHp: number
  currentMp: number
  maxMp: number
  attack: number
  defense: number
  magicAttack: number
  magicDefense: number
  speed: number
  critRate: number
  critDamage: number
  dodge: number
  hitRate: number
  lastAttackTime: number
}

/** 战斗上下文 */
export interface BattleContext {
  state: BattleState
  monsters: BattleEntity[]
  player: BattleEntity | null
  logs: BattleLogEntry[]
  stats: BattleStats
  respawnTimer: number    // 复活倒计时（秒）
  currentMapId: string | null
}

/** 伤害飘字数据 */
export interface DamageFloat {
  id: string
  value: number
  type: 'damage' | 'critical' | 'heal' | 'dodge'
  isCrit?: boolean
  targetId: string // 目标实体ID
  timestamp: number
}

/** 怪物击杀信息 */
export interface MonsterKillInfo {
  monsterId: string
  monsterName: string
  title: MonsterTitle
  level: number
}
