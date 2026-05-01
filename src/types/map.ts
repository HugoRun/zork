/**
 * 地图相关类型定义
 */

/** 小地图接口 */
export interface SmallMap {
  id: string
  name: string
  areaId: string          // 所属区域ID
  level: number           // 推荐等级
  levelRange: [number, number] // 等级范围
  
  // 解锁条件
  unlockLevel: number     // 解锁所需等级
  unlockMapId?: string    // 需要先通关的前置地图
  
  // 怪物配置
  monsterIds: string[]    // 可刷新的怪物模板ID列表
  maxMonsters: number     // 同时存在怪物上限（默认8）
  spawnInterval: number   // 刷新间隔（毫秒，默认5000）
  
  // 背景图
  backgroundImage?: string
}

/** 区域接口 */
export interface Area {
  id: string
  name: string
  description: string
  levelRange: [number, number]
  maps: SmallMap[]
  backgroundImage?: string
}

/** 地图解锁状态 */
export interface MapUnlockState {
  mapId: string
  unlocked: boolean
  cleared: boolean        // 是否通关过
  clearCount: number      // 通关次数
  bestTime?: number       // 最佳通关时间
}

/** 地图状态 */
export interface MapState {
  currentMapId: string | null
  currentAreaId: string | null
  unlockStates: Record<string, MapUnlockState>
}

/** 世界地图配置 */
export interface WorldMap {
  areas: Area[]
}
