/**
 * 药水自动使用 Composable
 */
import { usePlayerStore } from '@/stores/playerStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useGameStore } from '@/stores/gameStore'

/**
 * 药水自动使用逻辑
 */
export function usePotion() {
  const playerStore = usePlayerStore()
  const inventoryStore = useInventoryStore()
  const gameStore = useGameStore()
  
  /**
   * 检查并自动使用药水
   */
  function checkAndUsePotion(
    currentHp: number,
    maxHp: number,
    currentMp: number,
    maxMp: number
  ): void {
    const config = inventoryStore.potionConfig
    
    if (!config.autoUseEnabled) return
    
    // 检查HP药水
    const hpPercent = currentHp / maxHp
    if (hpPercent <= config.hpThreshold) {
      usePotion(config.hpPotionId, 'hp')
    }
    
    // 检查MP药水
    const mpPercent = currentMp / maxMp
    if (mpPercent <= config.mpThreshold) {
      usePotion(config.mpPotionId, 'mp')
    }
  }
  
  /**
   * 使用药水
   */
  function usePotion(potionId: string, type: 'hp' | 'mp'): boolean {
    // 查找背包中的药水
    const potion = inventoryStore.items.find(
      item => item.templateId === potionId && item.quantity > 0
    )
    
    if (!potion || !potion.useEffect) return false
    
    // 应用效果
    if (potion.useEffect.type === 'healHp') {
      playerStore.modifyHp(potion.useEffect.value)
      gameStore.addLog({
        type: 'system',
        content: `使用 ${potion.name}，恢复 ${potion.useEffect.value} HP`
      })
    } else if (potion.useEffect.type === 'healMp') {
      playerStore.modifyMp(potion.useEffect.value)
      gameStore.addLog({
        type: 'system',
        content: `使用 ${potion.name}，恢复 ${potion.useEffect.value} MP`
      })
    }
    
    // 减少数量
    inventoryStore.decreaseItemQuantity(potion.id, 1)
    
    return true
  }
  
  /**
   * 手动使用药水
   */
  function manualUsePotion(itemId: string): boolean {
    const potion = inventoryStore.getItem(itemId)
    if (!potion || !potion.useEffect) return false
    
    if (potion.useEffect.type === 'healHp') {
      playerStore.modifyHp(potion.useEffect.value)
      gameStore.addLog({
        type: 'system',
        content: `使用 ${potion.name}，恢复 ${potion.useEffect.value} HP`
      })
    } else if (potion.useEffect.type === 'healMp') {
      playerStore.modifyMp(potion.useEffect.value)
      gameStore.addLog({
        type: 'system',
        content: `使用 ${potion.name}，恢复 ${potion.useEffect.value} MP`
      })
    }
    
    inventoryStore.decreaseItemQuantity(itemId, 1)
    return true
  }
  
  return {
    checkAndUsePotion,
    usePotion,
    manualUsePotion
  }
}
