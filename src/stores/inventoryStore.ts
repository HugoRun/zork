import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item, InventoryTab, AutoPickupConfig, AutoDecomposeConfig, AutoSellConfig, PotionConfig } from '@/types'
import { ItemType, Quality } from '@/types'
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
 * 背包状态管理（按账号隔离）
 */
export const useInventoryStore = defineStore('inventory', () => {
  // ==================== 状态 ====================
  
  /** 物品列表 */
  const items = ref<Item[]>([])
  
  /** 背包容量 */
  const capacity = ref<number>(40)
  
  /** 当前选中的标签页 */
  const currentTab = ref<InventoryTab>('all')
  
  /** 自动拾取配置 */
  const autoPickupConfig = ref<AutoPickupConfig>({
    enabled: true,
    minQuality: Quality.Uncommon,
    maxQuality: Quality.Legendary,
    slots: []
  })
  
  /** 自动分解配置 */
  const autoDecomposeConfig = ref<AutoDecomposeConfig>({
    enabled: false,
    minQuality: Quality.Common,
    maxQuality: Quality.Rare,
    keepHigherQuality: true
  })

  /** 自动出售配置 */
  const autoSellConfig = ref<AutoSellConfig>({
    enabled: false,
    minQuality: Quality.Common,
    maxLevel: 0,
    levelGap: 10
  })
  
  /** 药水配置 */
  const potionConfig = ref<PotionConfig>({
    hpPotionId: 'potion_hp_small',
    mpPotionId: 'potion_mp_small',
    hpThreshold: 0.3,
    mpThreshold: 0.2,
    autoUseEnabled: true
  })
  
  // ==================== 计算属性 ====================
  
  /** 当前物品数量 */
  const itemCount = computed(() => items.value.length)
  
  /** 背包是否已满 */
  const isFull = computed(() => items.value.length >= capacity.value)
  
  /** 过滤后的物品 */
  const filteredItems = computed(() => {
    if (currentTab.value === 'all') return items.value
    
    const typeMap: Record<string, ItemType> = {
      equipment: ItemType.Equipment,
      potion: ItemType.Potion,
      material: ItemType.Material
    }
    
    return items.value.filter(item => 
      item.type === typeMap[currentTab.value]
    )
  })
  
  // ==================== 物品操作 ====================
  
  /**
   * 添加物品
   */
  function addItem(item: Item): boolean {
    if (isFull.value) return false
    
    // 检查是否可堆叠
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
   * 移除物品
   */
  function removeItem(itemId: string): Item | null {
    const index = items.value.findIndex(i => i.id === itemId)
    if (index === -1) return null
    
    const item = items.value.splice(index, 1)[0]
    return item
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
   * 按模板ID减少物品数量（支持跨堆叠实例）
   */
  function decreaseItemByTemplateId(templateId: string, amount: number): boolean {
    const matching = items.value.filter(i => i.templateId === templateId && i.quantity > 0)
    let remaining = amount

    for (const item of matching) {
      if (remaining <= 0) break
      const deduct = Math.min(item.quantity, remaining)
      item.quantity -= deduct
      remaining -= deduct
      if (item.quantity <= 0) {
        removeItem(item.id)
      }
    }

    return remaining <= 0
  }
  
  /**
   * 获取物品
   */
  function getItem(itemId: string): Item | undefined {
    return items.value.find(i => i.id === itemId)
  }
  
  /**
   * 获取物品数量（按模板ID）
   */
  function getItemCount(templateId: string): number {
    return items.value
      .filter(i => i.templateId === templateId)
      .reduce((sum, i) => sum + i.quantity, 0)
  }
  
  // ==================== 配置 ====================
  
  /**
   * 设置当前标签页
   */
  function setCurrentTab(tab: InventoryTab): void {
    currentTab.value = tab
  }
  
  /**
   * 更新自动拾取配置
   */
  function updateAutoPickupConfig(config: Partial<AutoPickupConfig>): void {
    autoPickupConfig.value = { ...autoPickupConfig.value, ...config }
  }
  
  /**
   * 更新自动分解配置
   */
  function updateAutoDecomposeConfig(config: Partial<AutoDecomposeConfig>): void {
    autoDecomposeConfig.value = { ...autoDecomposeConfig.value, ...config }
  }

  /**
   * 更新自动出售配置
   */
  function updateAutoSellConfig(config: Partial<AutoSellConfig>): void {
    autoSellConfig.value = { ...autoSellConfig.value, ...config }
  }
  
  /**
   * 更新药水配置
   */
  function updatePotionConfig(config: Partial<PotionConfig>): void {
    potionConfig.value = { ...potionConfig.value, ...config }
  }
  
  // ==================== 其他 ====================
  
  /**
   * 清空背包
   */
  function clearInventory(): void {
    items.value = []
  }
  
  /**
   * 扩展背包容量
   */
  function expandCapacity(amount: number): void {
    capacity.value += amount
  }
  
  return {
    // 状态
    items,
    capacity,
    currentTab,
    autoPickupConfig,
    autoDecomposeConfig,
    autoSellConfig,
    potionConfig,
    
    // 计算属性
    itemCount,
    isFull,
    filteredItems,
    
    // 方法
    addItem,
    removeItem,
    decreaseItemQuantity,
    decreaseItemByTemplateId,
    getItem,
    getItemCount,
    setCurrentTab,
    updateAutoPickupConfig,
    updateAutoDecomposeConfig,
    updateAutoSellConfig,
    updatePotionConfig,
    clearInventory,
    expandCapacity
  }
}, {
  persist: {
    key: 'inventory',
    storage: createAccountStorage()
  }
})
