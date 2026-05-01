/**
 * 存档系统 Composable
 * 管理存档导入导出
 */
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useMapStore } from '@/stores/mapStore'
import { createSaveData, validateSaveData, sanitizeSaveData, checkVersion } from '@/utils/validator'
import { GAME_VERSION } from '@/config'

/**
 * 存档管理
 */
export function useSave() {
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()
  const inventoryStore = useInventoryStore()
  const settingsStore = useSettingsStore()
  const mapStore = useMapStore()
  
  /**
   * 导出存档为JSON文件
   */
  function exportSave(): void {
    const saveData = createSaveData({
      player: playerStore.$state,
      game: gameStore.$state,
      inventory: inventoryStore.$state,
      settings: settingsStore.$state,
      map: mapStore.$state
    })
    
    // 创建Blob
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `darklegend_save_${Date.now()}.json`
    
    // 触发下载
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    // 释放URL
    URL.revokeObjectURL(url)
  }
  
  /**
   * 从JSON文件导入存档
   */
  async function importSave(file: File): Promise<boolean> {
    try {
      // 读取文件
      const text = await file.text()
      const data = JSON.parse(text)
      
      // 校验数据
      if (!validateSaveData(data)) {
        throw new Error('无效的存档文件')
      }
      
      // 检查版本兼容性
      if (!checkVersion(data.version)) {
        throw new Error('存档版本不兼容')
      }
      
      // 清理数据
      const sanitized = sanitizeSaveData(data)
      
      // 恢复状态
      if (sanitized.player) {
        playerStore.$patch(sanitized.player)
      }
      
      if (sanitized.game) {
        gameStore.$patch(sanitized.game)
      }
      
      if (sanitized.inventory) {
        inventoryStore.$patch(sanitized.inventory)
      }
      
      if (sanitized.settings) {
        settingsStore.$patch(sanitized.settings)
      }
      
      if (sanitized.map) {
        mapStore.$patch(sanitized.map)
      }
      
      return true
    } catch (error) {
      console.error('导入存档失败:', error)
      return false
    }
  }
  
  /**
   * 重置所有数据
   */
  function resetAllData(): void {
    playerStore.resetPlayer()
    gameStore.resetGame()
    inventoryStore.clearInventory()
    settingsStore.resetSettings()
    
    // 清空localStorage
    localStorage.clear()
  }
  
  /**
   * 检查是否有存档
   */
  function hasSaveData(): boolean {
    return playerStore.hasPlayer
  }
  
  /**
   * 获取存档信息
   */
  function getSaveInfo(): { version: string; playerName: string; level: number; lastSave: string } | null {
    const player = playerStore.player
    if (!player) return null
    
    return {
      version: GAME_VERSION,
      playerName: player.name,
      level: player.level,
      lastSave: new Date(player.lastOnlineAt).toLocaleString('zh-CN')
    }
  }
  
  /**
   * 手动触发保存（Pinia persist已自动保存，此方法仅用于显式调用）
   */
  function save(): void {
    // Pinia persist插件会自动保存，这里只需要通知用户
    console.log('游戏已自动保存')
  }
  
  return {
    exportSave,
    importSave,
    resetAllData,
    hasSaveData,
    getSaveInfo,
    save
  }
}
