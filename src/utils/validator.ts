/**
 * 数据校验工具函数
 */

import type { Player } from '@/types'

/** 存档数据版本 */
const SAVE_VERSION = '1.0.0'

/**
 * 存档数据接口
 */
interface SaveData {
  version: string
  timestamp: number
  player: any
  game: any
  inventory: any
  settings: any
  map: any
}

/**
 * 校验存档数据结构
 */
export function validateSaveData(data: unknown): data is SaveData {
  if (!data || typeof data !== 'object') {
    return false
  }
  
  const save = data as Record<string, any>
  
  // 检查必要字段
  if (!save.version || typeof save.version !== 'string') {
    return false
  }
  
  if (!save.timestamp || typeof save.timestamp !== 'number') {
    return false
  }
  
  // 检查玩家数据
  if (save.player && !validatePlayerData(save.player)) {
    return false
  }
  
  return true
}

/**
 * 校验玩家数据
 */
export function validatePlayerData(player: unknown): player is Player {
  if (!player || typeof player !== 'object') {
    return false
  }
  
  const p = player as Record<string, any>
  
  // 检查必要字段
  const requiredFields = ['id', 'name', 'class', 'level', 'exp', 'gold', 'currentHp', 'currentMp']
  for (const field of requiredFields) {
    if (!(field in p)) {
      return false
    }
  }
  
  // 检查类型
  if (typeof p.id !== 'string') return false
  if (typeof p.name !== 'string') return false
  if (typeof p.level !== 'number') return false
  if (typeof p.exp !== 'number') return false
  if (typeof p.gold !== 'number') return false
  
  return true
}

/**
 * 校验物品数据
 */
export function validateItemData(item: unknown): boolean {
  if (!item || typeof item !== 'object') {
    return false
  }
  
  const i = item as Record<string, any>
  
  const requiredFields = ['id', 'templateId', 'name', 'type', 'quantity']
  for (const field of requiredFields) {
    if (!(field in i)) {
      return false
    }
  }
  
  return true
}

/**
 * 创建存档数据
 */
export function createSaveData(stores: {
  player: any
  game: any
  inventory: any
  settings: any
  map: any
}): SaveData {
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    ...stores
  }
}

/**
 * 检查存档版本兼容性
 */
export function checkVersion(saveVersion: string): boolean {
  const [major] = saveVersion.split('.')
  const [currentMajor] = SAVE_VERSION.split('.')
  
  // 主版本号一致即可
  return major === currentMajor
}

/**
 * 清理无效数据
 */
export function sanitizeSaveData(data: SaveData): SaveData {
  return {
    version: data.version,
    timestamp: data.timestamp,
    player: data.player ? sanitizePlayerData(data.player) : null,
    game: data.game || {},
    inventory: data.inventory || {},
    settings: data.settings || {},
    map: data.map || {}
  }
}

/**
 * 清理玩家数据
 */
function sanitizePlayerData(player: any): any {
  return {
    ...player,
    // 确保数值字段为有效值
    level: Math.max(1, Math.min(50, player.level || 1)),
    exp: Math.max(0, player.exp || 0),
    gold: Math.max(0, player.gold || 0),
    currentHp: Math.max(0, player.currentHp || 0),
    currentMp: Math.max(0, player.currentMp || 0)
  }
}
