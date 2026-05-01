import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Area, SmallMap, MapUnlockState } from '@/types'
import { useAccountStore } from './accountStore'

function createAccountStorage() {
  return {
    getItem: (key: string): string | null => {
      const prefix = useAccountStore().getAccountStoragePrefix()
      return localStorage.getItem(prefix + key)
    },
    setItem: (key: string, value: string): void => {
      const prefix = useAccountStore().getAccountStoragePrefix()
      localStorage.setItem(prefix + key, value)
    },
    removeItem: (key: string): void => {
      const prefix = useAccountStore().getAccountStoragePrefix()
      localStorage.removeItem(prefix + key)
    }
  }
}

/**
 * 地图状态管理
 */
export const useMapStore = defineStore('map', () => {
  // ==================== 状态 ====================
  
  /** 当前地图ID */
  const currentMapId = ref<string | null>(null)
  
  /** 当前区域ID */
  const currentAreaId = ref<string | null>(null)
  
  /** 解锁状态 */
  const unlockStates = ref<Record<string, MapUnlockState>>({})
  
  // ==================== 计算属性 ====================
  
  /** 是否在地图中 */
  const isInMap = computed(() => currentMapId.value !== null)
  
  // ==================== 方法 ====================
  
  /**
   * 进入地图
   */
  function enterMap(mapId: string, areaId: string): void {
    currentMapId.value = mapId
    currentAreaId.value = areaId
    
    // 初始化解锁状态
    if (!unlockStates.value[mapId]) {
      unlockStates.value[mapId] = {
        mapId,
        unlocked: true,
        cleared: false,
        clearCount: 0
      }
    }
  }
  
  /**
   * 离开地图
   */
  function leaveMap(): void {
    currentMapId.value = null
    currentAreaId.value = null
  }
  
  /**
   * 解锁地图
   */
  function unlockMap(mapId: string): void {
    unlockStates.value[mapId] = {
      mapId,
      unlocked: true,
      cleared: false,
      clearCount: 0
    }
  }
  
  /**
   * 标记地图已通关
   */
  function markMapCleared(mapId: string, time?: number): void {
    const state = unlockStates.value[mapId]
    if (state) {
      state.cleared = true
      state.clearCount++
      if (time && (!state.bestTime || time < state.bestTime)) {
        state.bestTime = time
      }
    }
  }
  
  /**
   * 检查地图是否解锁
   */
  function isMapUnlocked(mapId: string): boolean {
    return unlockStates.value[mapId]?.unlocked ?? false
  }
  
  /**
   * 获取地图状态
   */
  function getMapState(mapId: string): MapUnlockState | undefined {
    return unlockStates.value[mapId]
  }
  
  return {
    // 状态
    currentMapId,
    currentAreaId,
    unlockStates,
    
    // 计算属性
    isInMap,
    
    // 方法
    enterMap,
    leaveMap,
    unlockMap,
    markMapCleared,
    isMapUnlocked,
    getMapState
  }
}, {
  persist: {
    key: 'map',
    storage: createAccountStorage()
  }
})
