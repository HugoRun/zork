/**
 * 物品掉落 Composable
 */
import { useInventoryStore } from '@/stores/inventoryStore'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import type { Monster, DropEntry, Item } from '@/types'
import { ItemType, Quality, MonsterTitle } from '@/types'
import { getMonsterTemplate } from '@/config/monsters'
import { getEquipmentTemplate } from '@/config/equipment'
import { getItemTemplate } from '@/config/shop'
import { generateId, rollChance, randomInt } from '@/utils/random'
import { QUALITY_WEIGHTS } from '@/config'

/**
 * 物品掉落管理
 */
export function useItemDrop() {
  const inventoryStore = useInventoryStore()
  const gameStore = useGameStore()
  
  /**
   * 处理怪物掉落
   */
  function processDrop(monster: Monster): Item[] {
    const template = getMonsterTemplate(monster.templateId)
    if (!template) return []
    
    const droppedItems: Item[] = []
    
    // 遍历掉落表
    template.dropTable.forEach(entry => {
      // 检查头衔限制
      if (entry.titleRestriction && !entry.titleRestriction.includes(monster.title)) {
        return
      }
      
      // 检查掉落概率
      if (!rollChance(entry.dropRate)) return
      
      // 计算掉落数量
      const quantity = randomInt(entry.minQuantity, entry.maxQuantity)
      
      // 创建物品
      const item = createItem(entry.itemId, quantity)
      if (item) {
        droppedItems.push(item)
      }
    })
    
    return droppedItems
  }
  
  /**
   * 创建物品实例
   */
  function createItem(templateId: string, quantity: number = 1): Item | null {
    // 尝试从装备模板获取
    const equipTemplate = getEquipmentTemplate(templateId)
    if (equipTemplate) {
      return createEquipment(equipTemplate.id, quantity)
    }
    
    // 尝试从物品模板获取
    const itemTemplate = getItemTemplate(templateId)
    if (itemTemplate) {
      return {
        id: generateId(),
        templateId: itemTemplate.id,
        name: itemTemplate.name,
        type: itemTemplate.type,
        quality: itemTemplate.quality,
        quantity,
        maxStack: itemTemplate.maxStack,
        description: itemTemplate.description,
        useEffect: itemTemplate.useEffect,
        sellPrice: itemTemplate.sellPrice
      }
    }
    
    return null
  }
  
  /**
   * 创建装备实例
   */
  function createEquipment(templateId: string, quantity: number = 1): Item | null {
    const template = getEquipmentTemplate(templateId)
    if (!template) return null
    
    // 随机生成品质
    const quality = rollQuality()
    
    // 获取品质倍率
    const qualityMultiplier = template.qualityMultipliers[quality] || 1
    
    // 计算属性
    const stats = {
      hp: template.baseStats.hp ? Math.floor(template.baseStats.hp * qualityMultiplier) : undefined,
      mp: template.baseStats.mp ? Math.floor(template.baseStats.mp * qualityMultiplier) : undefined,
      attack: template.baseStats.attack ? Math.floor(template.baseStats.attack * qualityMultiplier) : undefined,
      defense: template.baseStats.defense ? Math.floor(template.baseStats.defense * qualityMultiplier) : undefined,
      magicAttack: template.baseStats.magicAttack ? Math.floor(template.baseStats.magicAttack * qualityMultiplier) : undefined,
      magicDefense: template.baseStats.magicDefense ? Math.floor(template.baseStats.magicDefense * qualityMultiplier) : undefined,
      speed: template.baseStats.speed ? Math.floor(template.baseStats.speed * qualityMultiplier) : undefined,
      critRate: template.baseStats.critRate,
      critDamage: template.baseStats.critDamage,
      dodge: template.baseStats.dodge
    }
    
    return {
      id: generateId(),
      templateId: template.id,
      name: template.name,
      type: ItemType.Equipment,
      quality,
      quantity,
      maxStack: 1,
      description: `${template.name} (${quality})`,
      sellPrice: Math.floor(template.sellPrice * qualityMultiplier),
      // 装备特殊属性
      stats
    } as any // TODO: 完善Equipment类型
  }
  
  /**
   * 随机品质
   */
  function rollQuality(): Quality {
    const roll = Math.random() * 100
    let cumulative = 0
    
    const qualityEntries: [Quality, number][] = [
      [Quality.Legendary, QUALITY_WEIGHTS.legendary],
      [Quality.Epic, QUALITY_WEIGHTS.epic],
      [Quality.Rare, QUALITY_WEIGHTS.rare],
      [Quality.Uncommon, QUALITY_WEIGHTS.uncommon],
      [Quality.Common, QUALITY_WEIGHTS.common]
    ]
    
    for (const [quality, weight] of qualityEntries) {
      cumulative += weight
      if (roll <= cumulative) {
        return quality
      }
    }
    
    return Quality.Common
  }
  
  /**
   * 检查装备是否应自动出售
   */
  function shouldAutoSell(item: Item): boolean {
    const config = inventoryStore.autoSellConfig
    if (!config.enabled) return false
    if (item.type !== ItemType.Equipment) return false

    const qualityOrder = [Quality.Common, Quality.Uncommon, Quality.Rare, Quality.Epic, Quality.Legendary]
    const itemQualityIndex = qualityOrder.indexOf(item.quality)
    const minIndex = qualityOrder.indexOf(config.minQuality)

    // 品质低于阈值
    if (itemQualityIndex < minIndex) return true

    // 等级差距检查
    const player = usePlayerStore().player
    if (player && config.levelGap > 0) {
      const equipTemplate = getEquipmentTemplate(item.templateId)
      if (equipTemplate && equipTemplate.levelRequirement < player.level - config.levelGap) {
        return true
      }
    }

    return false
  }

  /**
   * 自动拾取物品（含自动出售逻辑）
   */
  function autoPickup(items: Item[]): void {
    const playerStore = usePlayerStore()
    items.forEach(item => {
      // 检查是否应自动出售
      if (shouldAutoSell(item)) {
        const sellPrice = item.sellPrice || 1
        playerStore.addGold(sellPrice)
        gameStore.addLog({
          type: 'system',
          content: `自动出售 ${item.name}（+${sellPrice}💰）`
        })
        return
      }

      // 尝试添加到背包
      if (inventoryStore.addItem(item)) {
        gameStore.addLog({
          type: 'pickup',
          content: `获得 ${item.name}${item.quantity > 1 ? ' x' + item.quantity : ''}`
        })
      } else {
        gameStore.addLog({
          type: 'system',
          content: `背包已满，无法拾取 ${item.name}`
        })
      }
    })
  }
  
  /**
   * 处理击杀掉落
   */
  function handleKillDrop(monster: Monster): void {
    const items = processDrop(monster)
    autoPickup(items)
  }
  
  return {
    processDrop,
    createItem,
    createEquipment,
    rollQuality,
    autoPickup,
    handleKillDrop
  }
}
