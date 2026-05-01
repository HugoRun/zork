/**
 * 全局游戏配置
 */

/** 等级上限 */
export const MAX_LEVEL = 50

/** 背包默认容量 */
export const DEFAULT_INVENTORY_CAPACITY = 40

/** 背包最大容量 */
export const MAX_INVENTORY_CAPACITY = 100

/** 默认金币初始值 */
export const INITIAL_GOLD = 100

/** 游戏版本 */
export const GAME_VERSION = '1.0.0'

/** 游戏名称 */
export const GAME_NAME = '暗黑传奇'

/** 等级经验表（每级所需经验） */
export const EXP_TABLE: number[] = Array.from({ length: MAX_LEVEL }, (_, i) => {
  return Math.floor(100 * Math.pow(1.2, i))
})

/** 品质权重（用于随机生成） */
export const QUALITY_WEIGHTS = {
  common: 60,      // 60%
  uncommon: 25,    // 25%
  rare: 10,        // 10%
  epic: 4,         // 4%
  legendary: 1     // 1%
}

/** 怪物头衔刷新率 */
export const MONSTER_TITLE_SPAWN_RATES = {
  normal: 0.88,    // 88%
  elite: 0.10,     // 10%
  lord: 0.02       // 2%
}

/** 战斗日志最大保留条数 */
export const MAX_BATTLE_LOGS = 200

/** 地图最大怪物数 */
export const MAX_MONSTERS_PER_MAP = 8

/** 怪物刷新间隔（毫秒） */
export const MONSTER_SPAWN_INTERVAL = 5000

/** 每波刷新怪物数量（批量刷新） */
export const BATCH_MONSTER_COUNT = 3

/** 怪物全灭后下一波的延迟时间（毫秒） */
export const NEXT_WAVE_DELAY = 2000

/** 自动保存间隔（毫秒） */
export const AUTO_SAVE_INTERVAL = 30000

/** 复活时间（秒） */
export const RESPAWN_TIME = 3

/** 复活后恢复HP比例 */
export const RESPAWN_HP_RATIO = 0.5

/** 游戏循环tick间隔（毫秒） */
export const GAME_TICK_INTERVAL = 1000

/** DPS计算窗口（毫秒） */
export const DPS_WINDOW_SIZE = 5000

/** 获取升级所需经验 */
export function getExpForLevel(level: number): number {
  if (level < 1 || level > MAX_LEVEL) return 0
  return EXP_TABLE[level - 1]
}

/** 获取累计经验（从1级升到目标等级所需的总经验） */
export function getTotalExpForLevel(level: number): number {
  if (level < 1) return 0
  return EXP_TABLE.slice(0, level - 1).reduce((sum, exp) => sum + exp, 0)
}
