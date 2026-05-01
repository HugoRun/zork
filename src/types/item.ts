import { ItemType, Quality } from './common'

/**
 * 物品相关类型定义
 */

/** 物品实例接口 */
export interface Item {
  id: string              // 实例唯一ID
  templateId: string      // 模板ID
  name: string
  type: ItemType
  quality: Quality
  quantity: number
  maxStack: number        // 最大堆叠数
  
  // 物品描述
  description: string
  
  // 使用效果（药水等）
  useEffect?: ItemUseEffect
  
  // 售价
  sellPrice: number
}

/** 物品使用效果 */
export interface ItemUseEffect {
  type: 'healHp' | 'healMp' | 'buff'
  value: number           // 恢复值或加成值
  duration?: number       // 持续时间（buff用）
}

/** 物品模板配置 */
export interface ItemTemplate {
  id: string
  name: string
  type: ItemType
  quality: Quality
  maxStack: number
  description: string
  image?: string
  useEffect?: ItemUseEffect
  sellPrice: number
  buyPrice?: number
}

/** 背包接口 */
export interface Inventory {
  items: Item[]
  capacity: number
  gold: number
}

/** 背包分类 */
export type InventoryTab = 'all' | ItemType.Equipment | ItemType.Potion | ItemType.Material

/** 药水配置 */
export interface PotionConfig {
  hpPotionId: string      // 血药ID
  mpPotionId: string      // 魔法药ID
  hpThreshold: number     // HP阈值 (0-1)
  mpThreshold: number     // MP阈值 (0-1)
  autoUseEnabled: boolean
}

/** 商店物品 */
export interface ShopItem {
  templateId: string
  stock: number           // -1表示无限
  discount?: number       // 折扣（0-1）
}

/** 回购物品 */
export interface BuybackItem extends Item {
  soldAt: number          // 出售时间戳
  expireAt: number        // 过期时间
}
