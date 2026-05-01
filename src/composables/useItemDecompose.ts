/**
 * 装备分解 Composable
 */
import { useInventoryStore } from '@/stores/inventoryStore'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import type { Item } from '@/types'
import { ItemType, Quality } from '@/types'
import { generateId } from '@/utils/random'

/**
 * 装备分解管理
 */
export function useItemDecompose() {
  const inventoryStore = useInventoryStore()
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  
  /**
   * 分解装备
   */
  function decompose(itemId: string): boolean {
    const item = inventoryStore.getItem(itemId)
    if (!item || item.type !== ItemType.Equipment) return false
    
    // 计算分解产出
    const materials = calculateDecomposeReward(item)
    
    // 移除装备
    inventoryStore.removeItem(itemId)
    
    // 添加材料
    materials.forEach(mat => {
      inventoryStore.addItem(mat)
    })
    
    gameStore.addLog({
      type: 'system',
      content: `分解了 ${item.name}，获得 ${materials.map(m => m.name).join(', ')}`
    })
    
    return true
  }
  
  /**
   * 计算分解产出
   */
  function calculateDecomposeReward(item: Item): Item[] {
    const materials: Item[] = []
    
    // 根据品质决定产出
    const qualityRewards: Record<Quality, { materialId: string; quantity: number }> = {
      [Quality.Common]: { materialId: 'mat_dust_common', quantity: randomInt(1, 3) },
      [Quality.Uncommon]: { materialId: 'mat_dust_uncommon', quantity: randomInt(2, 5) },
      [Quality.Rare]: { materialId: 'mat_dust_rare', quantity: randomInt(3, 7) },
      [Quality.Epic]: { materialId: 'mat_dust_epic', quantity: randomInt(5, 10) },
      [Quality.Legendary]: { materialId: 'mat_dust_legendary', quantity: randomInt(10, 20) }
    }
    
    const reward = qualityRewards[item.quality]
    
    // 创建材料物品
    materials.push({
      id: generateId(),
      templateId: reward.materialId,
      name: getMaterialName(reward.materialId),
      type: ItemType.Material,
      quality: item.quality,
      quantity: reward.quantity,
      maxStack: 999,
      description: '分解装备获得的材料',
      sellPrice: getMaterialPrice(item.quality)
    })
    
    return materials
  }
  
  /**
   * 获取材料名称
   */
  function getMaterialName(materialId: string): string {
    const names: Record<string, string> = {
      mat_dust_common: '普通精华',
      mat_dust_uncommon: '优秀精华',
      mat_dust_rare: '稀有精华',
      mat_dust_epic: '史诗精华',
      mat_dust_legendary: '传说精华'
    }
    return names[materialId] || '未知材料'
  }
  
  /**
   * 获取材料价格
   */
  function getMaterialPrice(quality: Quality): number {
    const prices: Record<Quality, number> = {
      [Quality.Common]: 5,
      [Quality.Uncommon]: 15,
      [Quality.Rare]: 40,
      [Quality.Epic]: 100,
      [Quality.Legendary]: 300
    }
    return prices[quality]
  }
  
  /**
   * 批量分解
   */
  function batchDecompose(itemIds: string[]): number {
    let successCount = 0
    
    itemIds.forEach(id => {
      if (decompose(id)) {
        successCount++
      }
    })
    
    return successCount
  }
  
  /**
   * 自动分解检查
   */
  function checkAutoDecompose(item: Item): boolean {
    const config = inventoryStore.autoDecomposeConfig
    
    if (!config.enabled) return false
    
    // 只分解装备
    if (item.type !== ItemType.Equipment) return false
    
    // 检查品质范围
    const qualityOrder = [Quality.Common, Quality.Uncommon, Quality.Rare, Quality.Epic, Quality.Legendary]
    const itemQualityIndex = qualityOrder.indexOf(item.quality)
    const minIndex = qualityOrder.indexOf(config.minQuality)
    const maxIndex = qualityOrder.indexOf(config.maxQuality)
    
    return itemQualityIndex >= minIndex && itemQualityIndex <= maxIndex
  }
  
  return {
    decompose,
    calculateDecomposeReward,
    batchDecompose,
    checkAutoDecompose
  }
}

/**
 * 随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
