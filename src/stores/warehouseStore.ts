import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item } from '@/types'
import { ItemType, Quality } from '@/types'
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
 * 仓库状态管理
 */
export const useWarehouseStore = defineStore('warehouse', () => {
  // ==================== 状态 ====================

  /** 仓库物品列表 */
  const items = ref<Item[]>([])

  /** 仓库容量 */
  const capacity = ref<number>(100)

  // ==================== 计算属性 ====================

  /** 物品数量 */
  const itemCount = computed(() => items.value.length)

  /** 是否已满 */
  const isFull = computed(() => items.value.length >= capacity.value)

  /** 按类型过滤 */
  const filteredItems = computed(() => {
    return (type?: string) => {
      if (!type || type === 'all') return items.value
      return items.value.filter(item => item.type === type)
    }
  })

  // ==================== 物品操作 ====================

  /**
   * 添加物品到仓库
   */
  function addItem(item: Item): boolean {
    if (isFull.value) return false

    // 检查可堆叠
    const existing = items.value.find(
      i => i.templateId === item.templateId && i.quantity < i.maxStack
    )

    if (existing && existing.maxStack > 1) {
      const canAdd = Math.min(
        item.quantity,
        existing.maxStack - existing.quantity
      )
      existing.quantity += canAdd

      if (item.quantity > canAdd) {
        item.quantity -= canAdd
        items.value.push(item)
      }
    } else {
      items.value.push(item)
    }

    return true
  }

  /**
   * 从仓库取出物品
   */
  function removeItem(itemId: string): Item | null {
    const index = items.value.findIndex(i => i.id === itemId)
    if (index === -1) return null
    return items.value.splice(index, 1)[0]
  }

  /**
   * 减少物品数量
   */
  function decreaseItemQuantity(itemId: string, amount: number = 1): boolean {
    const item = items.value.find(i => i.id === itemId)
    if (!item || item.quantity < amount) return false

    item.quantity -= amount
    if (item.quantity <= 0) {
      removeItem(itemId)
    }
    return true
  }

  /**
   * 获取物品
   */
  function getItem(itemId: string): Item | undefined {
    return items.value.find(i => i.id === itemId)
  }

  /**
   * 扩展容量
   */
  function expandCapacity(amount: number): void {
    capacity.value += amount
  }

  return {
    items,
    capacity,
    itemCount,
    isFull,
    addItem,
    removeItem,
    decreaseItemQuantity,
    getItem,
    expandCapacity
  }
}, {
  persist: {
    key: 'warehouse',
    storage: createAccountStorage()
  }
})
