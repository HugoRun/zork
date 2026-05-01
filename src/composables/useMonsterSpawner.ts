/**
 * 怪物生成 Composable
 * 管理怪物刷新逻辑
 */
import { ref } from 'vue'
import type { Monster, MonsterEquipment } from '@/types'
import { MonsterTitle, ItemType, Quality } from '@/types'
import { getMonsterTemplate, getMapMonsterTemplates } from '@/config/monsters'
import { getEquipmentTemplate } from '@/config/equipment'
import { getSmallMap } from '@/config/maps'
import { MONSTER_TITLE_SPAWN_RATES, MONSTER_SPAWN_INTERVAL, QUALITY_WEIGHTS } from '@/config'
import { generateId, weightedChoice } from '@/utils/random'

/**
 * 怪物生成器
 */
export function useMonsterSpawner() {
  /** 上次刷新时间 */
  const lastSpawnTime = ref(0)
  
  /** 已生成的怪物数量 */
  const spawnedCount = ref(0)
  
  /**
   * 检查是否可以刷新怪物
   */
  function canSpawn(): boolean {
    const now = Date.now()
    return now - lastSpawnTime.value >= MONSTER_SPAWN_INTERVAL
  }
  
  /**
   * 生成怪物
   */
  function spawnMonster(mapId: string): Monster | null {
    try {
      const mapConfig = getSmallMap(mapId)
      if (!mapConfig) return null
      
      // 获取该地图可刷新的怪物模板
      const templates = getMapMonsterTemplates(mapConfig.monsterIds)
      if (templates.length === 0) return null
      
      // 根据刷新权重选择怪物模板
      const template = weightedChoice(
        templates,
        templates.map(t => t.spawnWeight)
      )
      
      if (!template) return null
      
      // 随机决定头衔
      const title = rollMonsterTitle()
      
      // 生成怪物实例
      const monster = createMonsterInstance(template, title)
      
      lastSpawnTime.value = Date.now()
      spawnedCount.value++
      
      return monster
    } catch (e) {
      console.error('[MonsterSpawner] spawnMonster error:', e)
      return null
    }
  }
  
  /**
   * 批量生成怪物（一波刷新N个）
   */
  function spawnBatch(mapId: string, count: number): Monster[] {
    const monsters: Monster[] = []
    for (let i = 0; i < count; i++) {
      const monster = spawnMonster(mapId)
      if (monster) {
        monsters.push(monster)
      }
    }
    return monsters
  }
  function rollMonsterTitle(): MonsterTitle {
    const roll = Math.random()
    
    if (roll < MONSTER_TITLE_SPAWN_RATES.lord) {
      return MonsterTitle.Lord
    }
    
    if (roll < MONSTER_TITLE_SPAWN_RATES.lord + MONSTER_TITLE_SPAWN_RATES.elite) {
      return MonsterTitle.Elite
    }
    
    return MonsterTitle.Normal
  }
  
  /**
   * 随机品质
   */
  function rollMonsterEquipQuality(): Quality {
    const roll = Math.random() * 100
    let cumulative = 0
    const entries: [Quality, number][] = [
      [Quality.Legendary, QUALITY_WEIGHTS.legendary],
      [Quality.Epic, QUALITY_WEIGHTS.epic],
      [Quality.Rare, QUALITY_WEIGHTS.rare],
      [Quality.Uncommon, QUALITY_WEIGHTS.uncommon],
      [Quality.Common, QUALITY_WEIGHTS.common]
    ]
    for (const [quality, weight] of entries) {
      cumulative += weight
      if (roll <= cumulative) return quality
    }
    return Quality.Common
  }

  /**
   * 为怪物生成装备（从掉落表中选取装备类物品）
   */
  function generateMonsterEquipment(
    template: ReturnType<typeof getMonsterTemplate>,
    title: MonsterTitle
  ): MonsterEquipment[] {
    const equipment: MonsterEquipment[] = []
    
    // 只有精英和领主穿戴装备
    if (title === MonsterTitle.Normal) return equipment
    
    // 从掉落表中找装备类物品
    const equipDrops = template.dropTable.filter(e => e.itemId.startsWith('equip_'))
    if (equipDrops.length === 0) return equipment
    
    // 精英最多穿戴1件，领主最多穿戴2件
    const maxEquip = title === MonsterTitle.Lord ? Math.min(2, equipDrops.length) : 1
    const chosen = equipDrops.sort(() => Math.random() - 0.5).slice(0, maxEquip)
    
    for (const equipDrop of chosen) {
      const equipTemplate = getEquipmentTemplate(equipDrop.itemId)
      if (!equipTemplate) continue
      
      const quality = rollMonsterEquipQuality()
      const qualityMultiplier = equipTemplate.qualityMultipliers[quality] || 1
      
      const stats: Record<string, number | undefined> = {}
      if (equipTemplate.baseStats.attack) stats.attack = Math.floor(equipTemplate.baseStats.attack * qualityMultiplier)
      if (equipTemplate.baseStats.defense) stats.defense = Math.floor(equipTemplate.baseStats.defense * qualityMultiplier)
      if (equipTemplate.baseStats.magicAttack) stats.magicAttack = Math.floor(equipTemplate.baseStats.magicAttack * qualityMultiplier)
      if (equipTemplate.baseStats.magicDefense) stats.magicDefense = Math.floor(equipTemplate.baseStats.magicDefense * qualityMultiplier)
      if (equipTemplate.baseStats.hp) stats.hp = Math.floor(equipTemplate.baseStats.hp * qualityMultiplier)
      if (equipTemplate.baseStats.speed) stats.speed = Math.floor(equipTemplate.baseStats.speed * qualityMultiplier)
      if (equipTemplate.baseStats.critRate) stats.critRate = equipTemplate.baseStats.critRate
      
      const qualityNameMap: Record<string, string> = {
        [Quality.Common]: '普通', [Quality.Uncommon]: '优秀', [Quality.Rare]: '稀有',
        [Quality.Epic]: '史诗', [Quality.Legendary]: '传说'
      }
      
      const item: any = {
        id: generateId(),
        templateId: equipTemplate.id,
        name: `${equipTemplate.name}`,
        type: ItemType.Equipment,
        quality,
        quantity: 1,
        maxStack: 1,
        description: `${equipTemplate.name}（${qualityNameMap[quality]}）`,
        sellPrice: Math.floor(equipTemplate.sellPrice * qualityMultiplier),
        stats,
        slot: equipTemplate.slot
      }
      
      equipment.push({ slot: equipTemplate.slot, item })
    }
    
    return equipment
  }
  
  /**
   * 创建怪物实例
   */
  function createMonsterInstance(
    template: ReturnType<typeof getMonsterTemplate>,
    title: MonsterTitle
  ): Monster | null {
    if (!template) return null
    
    // 根据头衔计算属性倍率
    const multiplier = title === MonsterTitle.Lord ? template.lordMultiplier :
                       title === MonsterTitle.Elite ? template.eliteMultiplier : 1
    
    // 计算最终属性
    const stats = {
      hp: Math.floor(template.baseStats.hp * multiplier),
      mp: Math.floor(template.baseStats.mp * multiplier),
      attack: Math.floor(template.baseStats.attack * multiplier),
      defense: Math.floor(template.baseStats.defense * multiplier),
      magicAttack: Math.floor(template.baseStats.magicAttack * multiplier),
      magicDefense: Math.floor(template.baseStats.magicDefense * multiplier),
      speed: Math.floor(template.baseStats.speed * multiplier),
      critRate: template.baseStats.critRate,
      critDamage: template.baseStats.critDamage,
      dodge: template.baseStats.dodge,
      hitRate: template.baseStats.hitRate,
      expReward: Math.floor(template.baseStats.expReward * multiplier),
      goldReward: Math.floor(template.baseStats.goldReward * multiplier)
    }
    
    // 选择技能列表
    const skills = title === MonsterTitle.Lord ? template.lordSkills :
                   title === MonsterTitle.Elite ? template.eliteSkills :
                   template.normalSkills
    
    // 为精英/领主生成装备
    const monsterEquipment = generateMonsterEquipment(template, title)
    
    // 装备加成到属性
    for (const eq of monsterEquipment) {
      const eqStats = (eq.item as any).stats
      if (!eqStats) continue
      if (eqStats.attack) stats.attack += eqStats.attack
      if (eqStats.defense) stats.defense += eqStats.defense
      if (eqStats.magicAttack) stats.magicAttack += eqStats.magicAttack
      if (eqStats.magicDefense) stats.magicDefense += eqStats.magicDefense
      if (eqStats.hp) stats.hp += eqStats.hp
      if (eqStats.speed) stats.speed += eqStats.speed
      if (eqStats.critRate) stats.critRate += eqStats.critRate
    }
    
    const maxHp = stats.hp
    
    return {
      id: generateId(),
      templateId: template.id,
      name: template.name,
      title,
      level: template.level,
      currentHp: maxHp,
      maxHp,
      stats,
      element: template.element,
      skills,
      equipment: monsterEquipment.length > 0 ? monsterEquipment : undefined,
      isEnraged: false,
      summonCount: 0,
      lastAttackTime: 0
    }
  }
  
  /**
   * 重置生成器
   */
  function reset() {
    lastSpawnTime.value = 0
    spawnedCount.value = 0
  }
  
  return {
    lastSpawnTime,
    spawnedCount,
    canSpawn,
    spawnMonster,
    spawnBatch,
    reset
  }
}
