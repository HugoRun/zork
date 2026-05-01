import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item, BuybackItem } from '@/types'
import { useInventoryStore } from '@/stores/inventoryStore'
import { usePlayerStore } from '@/stores/playerStore'
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
 * 商店状态管理
 */
export const useShopStore = defineStore('shop', () => {
  // ==================== 状态 ====================

  /** 回购列表 */
  const buybackList = ref<BuybackItem[]>([])

  /** 最大回购条目数 */
  const MAX_BUYBACK = 20

  // ==================== 计算属性 ====================

  /** 回购列表长度 */
  const buybackCount = computed(() => buybackList.value.length)

  // ==================== 商店操作 ====================

  /**
   * 购买物品
   */
  function buyItem(item: Item, price: number): boolean {
    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()

    if (playerStore.player!.gold < price) return false
    if (inventoryStore.isFull) return false

    playerStore.deductGold(price)
    inventoryStore.addItem({ ...item })

    return true
  }

  /**
   * 卖出物品
   */
  function sellItem(itemId: string): number {
    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()

    const item = inventoryStore.getItem(itemId)
    if (!item) return 0

    const sellPrice = item.sellPrice || 1

    // 添加到回购列表
    const buybackItem: BuybackItem = {
      ...item,
      buybackPrice: Math.floor(sellPrice * 2)
    }

    buybackList.value.unshift(buybackItem)

    // 限制回购列表长度
    if (buybackList.value.length > MAX_BUYBACK) {
      buybackList.value = buybackList.value.slice(0, MAX_BUYBACK)
    }

    // 从背包移除并给钱
    inventoryStore.removeItem(itemId)
    playerStore.addGold(sellPrice)

    return sellPrice
  }

  /**
   * 回购物品
   */
  function buyback(buybackIndex: number): boolean {
    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()

    const item = buybackList.value[buybackIndex]
    if (!item) return false
    if (playerStore.player!.gold < item.buybackPrice) return false
    if (inventoryStore.isFull) return false

    playerStore.deductGold(item.buybackPrice)
    inventoryStore.addItem({ ...item })

    // 从回购列表移除
    buybackList.value.splice(buybackIndex, 1)

    return true
  }

  /**
   * 清空回购列表
   */
  function clearBuybackList(): void {
    buybackList.value = []
  }

  /**
   * 批量出售物品
   * @returns 获得的总金币
   */
  function batchSell(itemIds: string[]): number {
    let totalGold = 0
    // 先收集所有物品（避免迭代中修改数组）
    const itemsToSell = itemIds.map(id => inventoryStore.getItem(id)).filter(Boolean) as Item[]
    for (const item of itemsToSell) {
      const sellPrice = item.sellPrice || 1
      const buybackItem: BuybackItem = { ...item, buybackPrice: Math.floor(sellPrice * 2) }
      buybackList.value.unshift(buybackItem)
      if (buybackList.value.length > MAX_BUYBACK) {
        buybackList.value = buybackList.value.slice(0, MAX_BUYBACK)
      }
      inventoryStore.removeItem(item.id)
      totalGold += sellPrice
    }
    if (totalGold > 0) {
      playerStore.addGold(totalGold)
    }
    return totalGold
  }

  return {
    buybackList,
    buybackCount,
    buyItem,
    sellItem,
    batchSell,
    buyback,
    clearBuybackList
  }
}, {
  persist: {
    key: 'shop',
    storage: createAccountStorage()
  }
})
