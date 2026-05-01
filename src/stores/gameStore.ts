import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BattleState, type BattleStats, type BattleLogEntry, type BattleLogFilter } from '@/types'
import { useAccountStore } from './accountStore'

/**
 * 按账号隔离的 localStorage 适配器
 */
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
 * 游戏全局状态管理（按账号隔离）
 */
export const useGameStore = defineStore('game', () => {
  // ==================== 战斗状态 ====================
  
  /** 当前战斗状态 */
  const battleState = ref<BattleState>(BattleState.Idle)
  
  /** 当前地图ID */
  const currentMapId = ref<string | null>(null)
  
  /** 当前区域ID */
  const currentAreaId = ref<string | null>(null)
  
  /** 战斗统计 */
  const battleStats = ref<BattleStats>({
    totalDamage: 0,
    totalHeal: 0,
    totalKills: 0,
    startTime: 0,
    dps: 0,
    dpsWindow: [],
    lastDpsUpdate: 0
  })
  
  /** 战斗日志 */
  const battleLogs = ref<BattleLogEntry[]>([])
  
  /** 日志过滤器 */
  const logFilter = ref<BattleLogFilter>('all')
  
  /** 复活倒计时 */
  const respawnTimer = ref<number>(0)
  
  // ==================== 计算属性 ====================
  
  /** 是否正在战斗 */
  const isFighting = computed(() => battleState.value === BattleState.Fighting)
  
  /** 是否已死亡 */
  const isDead = computed(() => battleState.value === BattleState.PlayerDead)
  
  /** 过滤后的日志 */
  const filteredLogs = computed(() => {
    if (logFilter.value === 'all') return battleLogs.value
    
    const filterMap: Record<BattleLogFilter, string[]> = {
      all: [],
      battle: ['damage', 'heal', 'death', 'skill'],
      pickup: ['pickup'],
      system: ['levelup', 'system']
    }
    
    return battleLogs.value.filter(log => 
      filterMap[logFilter.value].includes(log.type)
    )
  })
  
  // ==================== 战斗控制 ====================
  
  /**
   * 进入地图
   */
  function enterMap(mapId: string, areaId: string): void {
    currentMapId.value = mapId
    currentAreaId.value = areaId
    battleState.value = BattleState.Fighting
    
    // 重置战斗统计
    battleStats.value = {
      totalDamage: 0,
      totalHeal: 0,
      totalKills: 0,
      startTime: Date.now(),
      dps: 0,
      dpsWindow: [],
      lastDpsUpdate: Date.now()
    }
    
    // 清空日志
    battleLogs.value = []
  }
  
  /**
   * 撤退（离开地图）
   */
  function retreat(): void {
    battleState.value = BattleState.Retreated
    currentMapId.value = null
    currentAreaId.value = null
  }
  
  /**
   * 设置战斗状态
   */
  function setBattleState(state: BattleState): void {
    battleState.value = state
  }
  
  /**
   * 设置复活倒计时
   */
  function setRespawnTimer(seconds: number): void {
    respawnTimer.value = seconds
    battleState.value = BattleState.PlayerDead
  }
  
  /**
   * 减少复活倒计时
   */
  function decreaseRespawnTimer(): void {
    if (respawnTimer.value > 0) {
      respawnTimer.value--
      if (respawnTimer.value === 0) {
        battleState.value = BattleState.Fighting
      }
    }
  }
  
  // ==================== 战斗统计 ====================
  
  /**
   * 增加伤害统计
   */
  function addDamage(damage: number): void {
    battleStats.value.totalDamage += damage
    
    // 更新DPS
    updateDps(damage)
  }
  
  /**
   * 增加治疗统计
   */
  function addHeal(heal: number): void {
    battleStats.value.totalHeal += heal
  }
  
  /**
   * 增加击杀数
   */
  function addKill(): void {
    battleStats.value.totalKills++
  }
  
  /**
   * 更新DPS（滑动窗口）
   */
  function updateDps(damage: number): void {
    const now = Date.now()
    const windowSize = 5000 // 5秒窗口
    
    // 添加新数据
    battleStats.value.dpsWindow.push(damage)
    
    // 移除过期数据
    while (
      battleStats.value.dpsWindow.length > 0 &&
      now - battleStats.value.lastDpsUpdate > windowSize
    ) {
      battleStats.value.dpsWindow.shift()
    }
    
    // 计算DPS
    const totalWindowDamage = battleStats.value.dpsWindow.reduce((a, b) => a + b, 0)
    battleStats.value.dps = Math.floor(totalWindowDamage / (windowSize / 1000))
    battleStats.value.lastDpsUpdate = now
  }
  
  // ==================== 战斗日志 ====================
  
  /**
   * 添加战斗日志
   */
  function addLog(entry: Omit<BattleLogEntry, 'id' | 'timestamp'>): void {
    battleLogs.value.push({
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    })
    
    // 限制日志数量（保留最近200条）
    if (battleLogs.value.length > 200) {
      battleLogs.value = battleLogs.value.slice(-200)
    }
  }
  
  /**
   * 设置日志过滤器
   */
  function setLogFilter(filter: BattleLogFilter): void {
    logFilter.value = filter
  }
  
  /**
   * 清空日志
   */
  function clearLogs(): void {
    battleLogs.value = []
  }
  
  // ==================== 其他 ====================
  
  /**
   * 重置游戏状态
   */
  function resetGame(): void {
    battleState.value = BattleState.Idle
    currentMapId.value = null
    currentAreaId.value = null
    battleStats.value = {
      totalDamage: 0,
      totalHeal: 0,
      totalKills: 0,
      startTime: 0,
      dps: 0,
      dpsWindow: [],
      lastDpsUpdate: 0
    }
    battleLogs.value = []
    respawnTimer.value = 0
  }
  
  return {
    // 状态
    battleState,
    currentMapId,
    currentAreaId,
    battleStats,
    battleLogs,
    logFilter,
    respawnTimer,
    
    // 计算属性
    isFighting,
    isDead,
    filteredLogs,
    
    // 方法
    enterMap,
    retreat,
    setBattleState,
    setRespawnTimer,
    decreaseRespawnTimer,
    addDamage,
    addHeal,
    addKill,
    addLog,
    setLogFilter,
    clearLogs,
    resetGame
  }
}, {
  persist: {
    key: 'game',
    storage: createAccountStorage()
  }
})
