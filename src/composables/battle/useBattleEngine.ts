/**
 * 战斗引擎 Composable
 * 管理战斗状态机、攻击调度
 */
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { usePetStore } from '@/stores/petStore'
import { BattleState, MonsterTitle, CharacterClass, Element, Quality, ItemType, type Monster, type BattleEntity, type DamageResult } from '@/types'
import { BuffType, STAT_NAMES, BUFF_ICONS, getSkillLevelMultiplier, getSkillLevelMpReduction } from '@/types'
import type { BuffApplyConfig } from '@/types'
import { useDamageCalc } from './useDamageCalc'
import { useSkillSystem, getSkillEffectValue, isAoeSkill, isHealSkill, isBuffSkill } from './useSkillSystem'
import { useBuffManager } from './useBuffManager'
import { useMonsterAI } from './useMonsterAI'
import { useItemDrop } from '@/composables/useItemDrop'
import { MONSTER_TITLE_SPAWN_RATES, RESPAWN_TIME, RESPAWN_HP_RATIO } from '@/config'
import { calculateAttackInterval } from '@/config/battleConfig'
import { getSkillConfig } from '@/config/skills'
import { getMonsterTemplate } from '@/config/monsters'
import { getEquipmentTemplate } from '@/config/equipment'
import { generateId, rollChance } from '@/utils/random'
import type { Pet } from '@/types'
import { PET_TEMPLATES, getPetExpForLevel } from '@/types'

/** 各职业的技能列表 */
const CLASS_SKILLS: Record<string, string[]> = {
  [CharacterClass.Warrior]: ['attack', 'warrior_slash', 'warrior_whirlwind', 'warrior_battle_cry', 'warrior_execute'],
  [CharacterClass.Mage]: ['attack', 'mage_fireball', 'mage_heal', 'mage_meteor', 'mage_frost_nova', 'mage_arcane_blast'],
  [CharacterClass.Ranger]: ['attack', 'ranger_double_shot', 'ranger_evade', 'ranger_multi_shot', 'ranger_aimed_shot', 'ranger_arrow_rain']
}

/**
 * 战斗引擎
 */
export function useBattleEngine() {
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()
  const inventoryStore = useInventoryStore()
  
  const { executeDamageCalculation } = useDamageCalc()
  const skillSystem = useSkillSystem()
  const monsterAI = useMonsterAI()
  const { handleKillDrop } = useItemDrop()
  const achievementStore = useAchievementStore()
  const buffManager = useBuffManager()
  const petStore = usePetStore()

  /** 当前地图的怪物列表 */
  const monsters = ref<Monster[]>([])

  /** 兼容旧接口：玩家Buff列表（由buffManager驱动） */
  const playerBuffs = computed(() => {
    const player = playerStore.player
    if (!player) return []
    const buffs = buffManager.getBuffs(player.id)
    return buffs
      .filter(b => b.type === BuffType.StatMod)
      .map(b => ({
        stat: b.stat || '',
        value: b.value || 0,
        isPercent: b.isPercent || false,
        expireAt: b.expireAt
      }))
  })

  /** 玩家上次攻击时间 */
  let lastPlayerAttackTime = 0
  
  /** 玩家作为战斗实体 */
  const playerEntity = computed<BattleEntity | null>(() => {
    const player = playerStore.player
    if (!player) return null
    
    // 确保响应式依赖追踪：合体宠物和出战宠物变化时触发重新计算
    const _mergeCount = petStore.mergedPetIds.length
    const _activeCount = petStore.activePetIds.length
    
    const playerId = player.id
    const buffAttack = buffManager.getStatModifier(playerId, 'attack', player.baseStats.attack)
    const buffDefense = buffManager.getStatModifier(playerId, 'defense', player.baseStats.defense)
    const buffMagicAttack = buffManager.getStatModifier(playerId, 'magicAttack', player.baseStats.magicAttack)
    const buffMagicDefense = buffManager.getStatModifier(playerId, 'magicDefense', player.baseStats.magicDefense)
    const buffSpeed = buffManager.getStatModifier(playerId, 'speed', player.baseStats.speed)
    const buffDodge = buffManager.getStatModifier(playerId, 'dodge', player.baseStats.dodge)
    const buffCritRate = buffManager.getStatModifier(playerId, 'critRate', player.baseStats.critRate)
    const buffHitRate = buffManager.getStatModifier(playerId, 'hitRate', player.baseStats.hitRate)
    
    // 合体宠物属性加成（累加所有合体宠物）
    const mergedPets = petStore.mergedPets
    let mergeAttack = 0, mergeDefense = 0, mergeMagicAttack = 0, mergeMagicDefense = 0
    let mergeSpeed = 0, mergeCritRate = 0
    for (const mp of mergedPets) {
      const template = PET_TEMPLATES.find(t => t.id === mp.templateId)
      if (template) {
        const bonus = template.mergeBonus
        mergeAttack += bonus.attack ? player.baseStats.attack * bonus.attack : 0
        mergeDefense += bonus.defense ? player.baseStats.defense * bonus.defense : 0
        mergeMagicAttack += bonus.magicAttack ? player.baseStats.magicAttack * bonus.magicAttack : 0
        mergeMagicDefense += bonus.magicDefense ? player.baseStats.magicDefense * bonus.magicDefense : 0
        mergeSpeed += bonus.speed ? player.baseStats.speed * bonus.speed : 0
        mergeCritRate += bonus.critRate || 0
      }
    }

    // 装备加成
    let equipHp = 0, equipMp = 0, equipAttack = 0, equipDefense = 0
    let equipMagicAttack = 0, equipMagicDefense = 0, equipSpeed = 0
    let equipCritRate = 0, equipCritDamage = 0, equipDodge = 0
    Object.values(player.equipment).forEach(item => {
      if (!item) return
      const s = (item as any).stats
      if (!s) return
      equipHp += s.hp || 0
      equipMp += s.mp || 0
      equipAttack += s.attack || 0
      equipDefense += s.defense || 0
      equipMagicAttack += s.magicAttack || 0
      equipMagicDefense += s.magicDefense || 0
      equipSpeed += s.speed || 0
      equipCritRate += s.critRate || 0
      equipCritDamage += s.critDamage || 0
      equipDodge += s.dodge || 0
    })
    
    return {
      id: player.id,
      name: player.name,
      currentHp: player.currentHp,
      maxHp: player.baseStats.hp + equipHp,
      currentMp: player.currentMp,
      maxMp: player.baseStats.mp + equipMp,
      attack: player.baseStats.attack + buffAttack + mergeAttack + equipAttack,
      defense: player.baseStats.defense + buffDefense + mergeDefense + equipDefense,
      magicAttack: player.baseStats.magicAttack + buffMagicAttack + mergeMagicAttack + equipMagicAttack,
      magicDefense: player.baseStats.magicDefense + buffMagicDefense + mergeMagicDefense + equipMagicDefense,
      speed: Math.max(1, player.baseStats.speed + buffSpeed + mergeSpeed + equipSpeed),
      critRate: Math.max(0, Math.min(1, player.baseStats.critRate + buffCritRate + mergeCritRate + equipCritRate)),
      critDamage: player.baseStats.critDamage + equipCritDamage,
      dodge: Math.min(0.8, player.baseStats.dodge + buffDodge + equipDodge),
      hitRate: Math.max(0.6, Math.min(0.99, player.baseStats.hitRate + buffHitRate)),
      lastAttackTime: 0
    }
  })
  
  /**
   * 进入地图
   */
  function enterMap(mapId: string, areaId: string) {
    gameStore.enterMap(mapId, areaId)
    
    // 初始化玩家技能（根据职业）
    if (playerStore.player) {
      const classKey = playerStore.player.class
      const skillIds = CLASS_SKILLS[classKey] || ['attack']
      skillSystem.initSkills(skillIds, playerStore.player.level, playerStore.player.skillLevels || {}, playerStore.player.advancementTier || 1)
    }
    
    // 清空怪物和buff
    monsters.value = []
    buffManager.clearAll()
    
    // 出战宠物进入战斗状态
    for (const ap of petStore.activePets) {
      ap.state = 'fighting'
      ap.currentHp = ap.maxHp
    }
    
    petAttackTimers.value = {}
  }
  
  /**
   * 撤退
   */
  function retreat() {
    gameStore.retreat()
    monsters.value = []
    buffManager.clearAll()
    
    // 宠物恢复
    // 宠物恢复
    for (const ap of petStore.activePets) {
      ap.state = 'idle'
      ap.currentHp = ap.maxHp
    }
    
    // 清理怪物AI
    monsters.value.forEach(m => monsterAI.cleanupMonsterAI(m.id))
  }
  
  /**
   * 添加怪物到战场
   */
  function addMonster(monster: Monster) {
    monsters.value.push(monster)
    monsterAI.initMonsterAI(monster)
  }
  
  /**
   * 移除怪物
   */
  function removeMonster(monsterId: string) {
    const index = monsters.value.findIndex(m => m.id === monsterId)
    if (index !== -1) {
      const monster = monsters.value[index]
      monsterAI.cleanupMonsterAI(monster.id)
      buffManager.clearTarget(monster.id)
      monsters.value.splice(index, 1)
    }
  }
  
  /**
   * 执行玩家攻击
   */
  function executePlayerAttack(): void {
    const player = playerEntity.value
    const aliveMonsters = monsters.value.filter(m => !m.isDead)
    if (!player || aliveMonsters.length === 0) return

    // 攻击速度限制
    const attackInterval = calculateAttackInterval(player.speed)
    const now = Date.now()
    if (now - lastPlayerAttackTime < attackInterval) return
    lastPlayerAttackTime = now

    // 选择目标（优先攻击血量最低的，排除尸体）
    const target = aliveMonsters.reduce((lowest, m) => 
      m.currentHp < lowest.currentHp ? m : lowest
    )
    
    // 尝试使用技能
    const skill = skillSystem.getNextAvailableSkill(player.currentMp)
    
    if (skill) {
      executePlayerSkill(skill.id, target)
    } else {
      // 普通攻击
      executeNormalAttack(player, target)
    }
  }
  
  /**
   * 执行普通攻击
   */
  function executeNormalAttack(attacker: BattleEntity, defender: Monster): void {
    const result = executeDamageCalculation({
      attackerId: attacker.id,
      attackerName: attacker.name,
      defenderId: defender.id,
      defenderName: defender.name,
      attackerAttack: attacker.attack,
      attackerMagicAttack: attacker.magicAttack,
      attackerCritRate: attacker.critRate,
      attackerCritDamage: attacker.critDamage,
      attackerHitRate: attacker.hitRate,
      defenderDefense: defender.stats.defense,
      defenderMagicDefense: defender.stats.magicDefense,
      defenderDodge: defender.stats.dodge,
      damageType: 'physical'
    })
    
    applyDamageResult(result, defender)
  }
  
  /**
   * 执行玩家技能
   */
  function executePlayerSkill(skillId: string, primaryTarget: Monster): void {
    const player = playerEntity.value
    const skillInstance = skillSystem.getSkillInstance(skillId)
    if (!player || !skillInstance) return
    
    const skill = skillInstance.config
    const skillLevel = skillInstance.level
    const castResult = skillSystem.castSkill(skillId)
    if (!castResult) return

    // 扣除MP（考虑技能等级缩减）
    const mpReduction = getSkillLevelMpReduction(skillLevel)
    const effectiveMpCost = Math.floor(skill.mpCost * (1 - mpReduction))
    playerStore.modifyMp(-effectiveMpCost)

    // 确定目标（AOE技能排除已死亡的怪物）
    const targets = isAoeSkill(skill)
      ? monsters.value.filter(m => !m.isDead)
      : [primaryTarget]

    // 记录技能使用日志（包含目标信息）
    const targetInfo = targets.length > 1 ? `对 ${targets.length} 个目标` : `对 ${targets[0]?.name || '目标'}`
    const levelStr = skillLevel > 1 ? ` Lv.${skillLevel}` : ''
    const mpStr = effectiveMpCost > 0 ? ` (-${effectiveMpCost}MP)` : ''
    gameStore.addLog({
      type: 'skill',
      content: `${player.name} 使用【${skill.name}${levelStr}】${targetInfo}${mpStr}`,
      data: { skillName: skill.name, skillLevel, targetIds: targets.map(t => t.id) }
    })
    
    // 应用技能效果
    targets.forEach(target => {
      if (isHealSkill(skill)) {
        // 治疗技能（应用技能等级倍率）
        const levelMultiplier = getSkillLevelMultiplier(skillLevel)
        const healValue = Math.floor(getSkillEffectValue(skill, player.maxHp) * levelMultiplier)
        playerStore.modifyHp(healValue)
        gameStore.addHeal(healValue)
        gameStore.addLog({
          type: 'heal',
          content: `${player.name} 使用 ${skill.name}，恢复 ${healValue} HP`,
          data: {
            targetId: player.id,
            value: healValue
          }
        })
      } else if (isBuffSkill(skill)) {
        // Buff技能（增益自身）
        applyPlayerBuffFromSkill(skill, player.id, player.name, skillLevel)
      } else if (skill.effectType === 'debuff') {
        // Debuff技能（减益目标）
        applyDebuffFromSkill(skill, player.id, player.name, target, skillLevel)
      } else {
        // 伤害技能（应用技能等级倍率）
        const levelMultiplier = getSkillLevelMultiplier(skillLevel)
        const result = executeDamageCalculation({
          attackerId: player.id,
          attackerName: player.name,
          defenderId: target.id,
          defenderName: target.name,
          attackerAttack: player.attack,
          attackerMagicAttack: player.magicAttack,
          attackerCritRate: player.critRate,
          attackerCritDamage: player.critDamage,
          attackerHitRate: player.hitRate,
          defenderDefense: target.stats.defense,
          defenderMagicDefense: target.stats.magicDefense,
          defenderDodge: target.stats.dodge,
          damageType: skill.effectType === 'magicDamage' ? 'magic' : 'skill',
          skillMultiplier: skill.value * levelMultiplier,
          skillName: skill.name
        })
        
        // 将技能名附加到伤害日志
        result.skillName = skill.name
        applyDamageResult(result, target)
        
        // 伤害技能附带DOT效果
        if (skill.dot) {
          const dotType = skill.element === 'fire' ? BuffType.Burn
            : skill.element === 'poison' ? BuffType.Poison
            : BuffType.Burn
          const dotName = skill.element === 'fire' ? '灼烧' : skill.element === 'poison' ? '中毒' : '持续伤害'
          const dotIcon = skill.element === 'fire' ? '🔥' : skill.element === 'poison' ? '🟢' : '💥'
          
          const dotDamage = Math.floor(skill.dot.damage * levelMultiplier)
          buffManager.applyBuff({
            type: dotType,
            name: `${dotName}(${skill.name})`,
            icon: dotIcon,
            duration: skill.dot.duration,
            isDebuff: true,
            tickDamage: dotDamage,
            tickInterval: skill.dot.interval
          }, player.id, player.name, target.id, 'monster')
          gameStore.addLog({
            type: 'system',
            content: `${target.name} 被${dotName}了！每${skill.dot.interval / 1000}秒受到${dotDamage}点伤害`
          })
        }

        // 伤害技能附带属性debuff
        if (skill.buffs) {
          for (const buffEffect of skill.buffs) {
            if (buffEffect.value < 0) {
              buffManager.applyBuff({
                type: BuffType.StatMod,
                name: skill.name,
                icon: skill.icon,
                duration: buffEffect.duration,
                isDebuff: true,
                stat: buffEffect.stat,
                value: buffEffect.value,
                isPercent: buffEffect.isPercent
              }, player.id, player.name, target.id, 'monster')
            }
          }
        }
      }
    })
  }
  
  /**
   * 应用伤害结果
   */
  function applyDamageResult(result: DamageResult, target: Monster): void {
    const attackerName = result.attackerName || '未知'
    
    if (result.isDodge) {
      gameStore.addLog({
        type: 'damage',
        content: `${target.name} 闪避了 ${attackerName} 的攻击`,
        data: { ...result, defenderId: target.id, targetId: target.id }
      })
      return
    }
    
    if (result.isMiss) {
      gameStore.addLog({
        type: 'damage',
        content: `${attackerName} 的攻击未命中 ${target.name}`,
        data: { ...result, defenderId: target.id, targetId: target.id }
      })
      return
    }
    
    let damage = result.damage
    
    // 检查怪物护盾吸收
    const absorbed = buffManager.absorbDamage(target.id, damage)
    if (absorbed > 0) {
      damage -= absorbed
      const absorbMsg = `${target.name} 的护盾吸收了 ${absorbed} 点伤害`
      if (damage === 0) {
        gameStore.addLog({
          type: 'system',
          content: absorbMsg,
          data: { targetId: target.id }
        })
        return
      }
      gameStore.addLog({
        type: 'system',
        content: absorbMsg,
        data: { targetId: target.id }
      })
    }
    
    target.currentHp -= damage
    gameStore.addDamage(damage)
    
    // 构建伤害日志内容
    const skillInfo = result.skillName ? `使用【${result.skillName}】` : ''
    const critInfo = result.isCrit ? '暴击！' : ''
    const logContent = result.skillName
      ? `${critInfo}${attackerName} 使用【${result.skillName}】对 ${target.name} 造成 ${damage} 点伤害`
      : `${critInfo}${attackerName} 对 ${target.name} 造成 ${damage} 点伤害`
    
    gameStore.addLog({
      type: 'damage',
      content: logContent,
      data: { ...result, defenderId: target.id, targetId: target.id }
    })
    
    // 检查怪物死亡
    if (target.currentHp <= 0) {
      handleMonsterDeath(target, attackerName)
    }
  }
  
  /**
   * 处理怪物死亡
   */
  function handleMonsterDeath(monster: Monster, killerName?: string): void {
    // 添加击杀统计
    gameStore.addKill()
    
    // 成就进度：击杀
    achievementStore.recordProgress('any')
    if (monster.title === 'elite') achievementStore.recordProgress('elite')
    if (monster.title === 'lord') achievementStore.recordProgress('lord')
    
    // 给予经验和金币
    playerStore.addExp(monster.stats.expReward)
    playerStore.addGold(monster.stats.goldReward)
    
    // 构建死亡日志（包含击杀者信息）
    const killer = killerName || playerStore.player?.name || '你'
    gameStore.addLog({
      type: 'death',
      content: `${killer} 击杀了 ${monster.name}，获得 ${monster.stats.expReward} 经验，${monster.stats.goldReward} 金币`,
      data: { killerName: killer, targetId: monster.id }
    })
    
    // 处理掉落
    handleKillDrop(monster)
    
    // 出战宠物获得经验
    for (const ap of petStore.activePets) {
      if (ap.state !== 'fighting') continue
      const petExpGain = Math.floor(monster.stats.expReward * 0.5)
      const leveled = petStore.addPetExp(ap.id, petExpGain)
      if (leveled) {
        gameStore.addLog({
          type: 'system',
          content: `${ap.icon}${ap.name} 升级了！当前 Lv.${ap.level}`
        })
      }
    }
    
    // 宠物掉落检查
    const droppedPet = petStore.tryDropFromMonster(monster.templateId, monster.level)
    if (droppedPet) {
      gameStore.addLog({
        type: 'pickup',
        content: `获得了宠物【${droppedPet.icon}${droppedPet.name}】！`
      })
    }
    
    // 掉落怪物穿戴的装备
    dropMonsterEquipment(monster)

    // 标记为死亡（灰色显示，下一波刷新时才清除）
    monster.isDead = true
    // 清除该怪物的所有buff（死亡后不保留任何buff）
    buffManager.clearTarget(monster.id)

    gameStore.addLog({
      type: 'system',
      content: `${monster.name} 倒下了...（将在下一波刷新时消失）`,
      data: { targetId: monster.id }
    })
  }

  /**
   * 清除所有已死亡的怪物（在下一波刷新前调用）
   */
  function clearDeadMonsters(): Monster[] {
    const dead = monsters.value.filter(m => m.isDead)
    for (const m of dead) {
      // 从怪物列表中移除（不触发死亡逻辑）
      const idx = monsters.value.findIndex(x => x.id === m.id)
      if (idx !== -1) monsters.value.splice(idx, 1)
    }
    return dead
  }
  
  /**
   * 掉落怪物穿戴的装备（概率掉落，支持自动出售过滤）
   */
  function dropMonsterEquipment(monster: Monster): void {
    if (!monster.equipment || monster.equipment.length === 0) return
    
    const template = getMonsterTemplate(monster.templateId)
    const dropRate = template?.equipDropRate || 0.3
    const sellConfig = inventoryStore.autoSellConfig
    const qualityOrder = [Quality.Common, Quality.Uncommon, Quality.Rare, Quality.Epic, Quality.Legendary]
    
    for (const eq of monster.equipment) {
      if (!rollChance(dropRate)) continue
      
      const item = eq.item
      
      // 自动出售检查
      if (sellConfig.enabled && item.type === ItemType.Equipment) {
        const itemQualityIndex = qualityOrder.indexOf(item.quality)
        const minIndex = qualityOrder.indexOf(sellConfig.minQuality)
        let autoSell = itemQualityIndex < minIndex

        // 等级差距检查
        if (!autoSell && sellConfig.levelGap > 0) {
          const equipTpl = getEquipmentTemplate(item.templateId)
          if (equipTpl && equipTpl.levelRequirement < playerStore.player!.level - sellConfig.levelGap) {
            autoSell = true
          }
        }

        if (autoSell) {
          const sellPrice = item.sellPrice || 1
          playerStore.addGold(sellPrice)
          gameStore.addLog({
            type: 'system',
            content: `自动出售 ${item.name}（+${sellPrice}💰）`
          })
          continue
        }
      }
      
      if (inventoryStore.addItem(item)) {
        gameStore.addLog({
          type: 'pickup',
          content: `获得 ${item.name}`
        })
      } else {
        gameStore.addLog({
          type: 'system',
          content: `背包已满，无法拾取 ${item.name}`
        })
      }
    }
  }
  
  /** 宠物上次攻击时间（每个宠物独立） */
  const petAttackTimers = ref<Record<string, number>>({})

  /**
   * 执行所有出战宠物攻击
   */
  function executePetAttack(): void {
    const activePets = petStore.activePets
    if (activePets.length === 0 || monsters.value.length === 0) return

    const now = Date.now()

    for (const pet of activePets) {
      if (pet.state !== 'fighting') continue

      const lastTime = petAttackTimers.value[pet.id] || 0
      const attackInterval = calculateAttackInterval(pet.baseStats.speed)
      if (now - lastTime < attackInterval) continue
      petAttackTimers.value[pet.id] = now

      if (monsters.value.length === 0) continue

      // 选择目标（优先血量最低的，排除已死亡）
      const aliveMonsters = monsters.value.filter(m => !m.isDead)
      if (aliveMonsters.length === 0) continue
      const target = aliveMonsters.reduce((lowest, m) =>
        m.currentHp < lowest.currentHp ? m : lowest
      )

      // 宠物有概率使用技能
      const useSkill = pet.skills.length > 0 && rollChance(0.3)
      if (useSkill) {
        const skillId = pet.skills[Math.floor(Math.random() * pet.skills.length)]
        const skillConfig = getSkillConfig(skillId)
        if (skillConfig) {
          const targets = skillConfig.target === 'all'
            ? monsters.value.filter(m => !m.isDead)
            : [target]
          
          const targetInfo = targets.length > 1 ? `对 ${targets.length} 个目标` : `对 ${targets[0]?.name || '目标'}`
          
          gameStore.addLog({
            type: 'skill',
            content: `${pet.icon}${pet.name} 使用【${skillConfig.name}】${targetInfo}`,
            data: { skillName: skillConfig.name, targetIds: targets.map(t => t.id) }
          })

          targets.forEach(t => {
            const result = executeDamageCalculation({
              attackerId: pet.id,
              attackerName: `${pet.icon}${pet.name}`,
              defenderId: t.id,
              defenderName: t.name,
              attackerAttack: pet.baseStats.attack,
              attackerMagicAttack: pet.baseStats.magicAttack,
              attackerCritRate: pet.baseStats.critRate,
              attackerCritDamage: pet.baseStats.critDamage,
              attackerHitRate: 0.9,
              defenderDefense: t.stats.defense,
              defenderMagicDefense: t.stats.magicDefense,
              defenderDodge: t.stats.dodge,
              damageType: skillConfig.element === Element.Physical ? 'physical' : 'magic',
              skillMultiplier: skillConfig.value,
              skillName: skillConfig.name
            })
            result.skillName = skillConfig.name
            applyDamageResult(result, t)

            if (skillConfig.dot) {
              const dotType = skillConfig.element === 'fire' ? BuffType.Burn
                : skillConfig.element === 'poison' ? BuffType.Poison : BuffType.Burn
              buffManager.applyBuff({
                type: dotType,
                name: `${skillConfig.name}`,
                icon: skillConfig.icon,
                duration: skillConfig.dot.duration,
                isDebuff: true,
                tickDamage: skillConfig.dot.damage,
                tickInterval: skillConfig.dot.interval
              }, pet.id, pet.name, t.id, 'monster')
            }
            if (skillConfig.buffs) {
              for (const buffEffect of skillConfig.buffs) {
                if (buffEffect.value < 0) {
                  buffManager.applyBuff({
                    type: BuffType.StatMod,
                    name: skillConfig.name,
                    icon: skillConfig.icon,
                    duration: buffEffect.duration,
                    isDebuff: true,
                    stat: buffEffect.stat,
                    value: buffEffect.value,
                    isPercent: buffEffect.isPercent
                  }, pet.id, pet.name, t.id, 'monster')
                }
              }
            }
          })
          continue
        }
      }

      // 普通攻击
      const result = executeDamageCalculation({
        attackerId: pet.id,
        attackerName: `${pet.icon}${pet.name}`,
        defenderId: target.id,
        defenderName: target.name,
        attackerAttack: pet.baseStats.attack,
        attackerMagicAttack: pet.baseStats.magicAttack,
        attackerCritRate: pet.baseStats.critRate,
        attackerCritDamage: pet.baseStats.critDamage,
        attackerHitRate: 0.9,
        defenderDefense: target.stats.defense,
        defenderMagicDefense: target.stats.magicDefense,
        defenderDodge: target.stats.dodge,
        damageType: 'physical'
      })
      applyDamageResult(result, target)
    }
  }

  /**
   * 执行怪物攻击
   */
  function executeMonsterAttack(monster: Monster): void {
    // 死亡怪物不攻击
    if (monster.isDead) return

    const player = playerEntity.value
    if (!player) return
    
    // 检查是否被冻结/眩晕（无法行动）
    if (buffManager.isControlled(monster.id)) return
    
    // 检查是否可以攻击
    if (!monsterAI.canAttack(monster)) return
    
    // 选择技能
    const skillId = monsterAI.selectSkill(monster)
    
    // 更新攻击时间
    monster.lastAttackTime = Date.now()
    
    // 记录怪物技能使用日志
    if (skillId && skillId !== 'attack') {
      const skillConfig = getSkillConfig(skillId)
      if (skillConfig) {
        const targetInfo = skillConfig.target === 'all' ? '对所有敌人' : '对你'
        gameStore.addLog({
          type: 'skill',
          content: `${monster.name} 使用【${skillConfig.name}】${targetInfo}`,
          data: { skillName: skillConfig.name, targetId: player.id }
        })
      }
    }
    
    // Buff技能（如狼嚎提升攻击）- 通过buffManager管理
    if (skillId && skillId !== 'attack') {
      const skillConfig = getSkillConfig(skillId)
      if (skillConfig && skillConfig.buffs) {
        for (const buffEffect of skillConfig.buffs) {
          buffManager.applyBuff({
            type: BuffType.StatMod,
            name: skillConfig.name,
            icon: skillConfig.icon,
            duration: buffEffect.duration,
            isDebuff: buffEffect.value < 0,
            stat: buffEffect.stat,
            value: buffEffect.value,
            isPercent: buffEffect.isPercent
          }, monster.id, monster.name, monster.id, 'monster')
        }
        const buffDesc = skillConfig.buffs.map((b: any) => {
          const name = STAT_NAMES[b.stat] || b.stat
          return `${name}${b.value > 0 ? '+' : ''}${b.isPercent ? Math.floor(b.value * 100) : b.value}%`
        }).join('，')
        gameStore.addLog({
          type: 'system',
          content: `${monster.name} ${buffDesc}，持续${Math.floor(skillConfig.buffs![0].duration / 1000)}秒`
        })
        return
      }

      // DOT技能（如毒蜘蛛的毒咬）- 施加DOT给玩家
      if (skillConfig?.dot) {
        const dotType = skillConfig.element === 'fire' ? BuffType.Burn
          : skillConfig.element === 'poison' ? BuffType.Poison
          : BuffType.Poison
        const dotName = skillConfig.element === 'fire' ? '灼烧' : '中毒'
        const dotIcon = skillConfig.element === 'fire' ? '🔥' : '🟢'
        
        buffManager.applyBuff({
          type: dotType,
          name: `${dotName}(${skillConfig.name})`,
          icon: dotIcon,
          duration: skillConfig.dot.duration,
          isDebuff: true,
          tickDamage: skillConfig.dot.damage,
          tickInterval: skillConfig.dot.interval
        }, monster.id, monster.name, player.id, 'player')
        gameStore.addLog({
          type: 'system',
          content: `${monster.name} 的 ${skillConfig.name} 使你${dotName}了！每${skillConfig.dot.interval / 1000}秒受到${skillConfig.dot.damage}点伤害`
        })
      }

      // 控制类技能
      if (skillConfig?.effectType === 'debuff' && skillConfig.buffs) {
        // 已在上面处理
      }
    }

    // 计算伤害
    const result = executeDamageCalculation({
      attackerId: monster.id,
      attackerName: monster.name,
      defenderId: player.id,
      defenderName: player.name,
      attackerAttack: monster.stats.attack,
      attackerMagicAttack: monster.stats.magicAttack,
      attackerCritRate: monster.stats.critRate,
      attackerCritDamage: monster.stats.critDamage,
      attackerHitRate: monster.stats.hitRate,
      defenderDefense: player.defense,
      defenderMagicDefense: player.magicDefense,
      defenderDodge: player.dodge,
      damageType: skillId && skillId !== 'attack' ? 'skill' : 'physical',
      skillName: skillId && skillId !== 'attack' ? skillId : undefined
    })
    
    // 应用伤害到玩家（检查护盾吸收）
    if (!result.isDodge && !result.isMiss) {
      let damage = result.damage
      
      // 检查玩家护盾吸收
      const absorbed = buffManager.absorbDamage(player.id, damage)
      if (absorbed > 0) {
        damage -= absorbed
        gameStore.addLog({
          type: 'system',
          content: `你的护盾吸收了 ${absorbed} 点伤害`,
          data: { targetId: player.id }
        })
        if (damage === 0) return
      }
      
      playerStore.modifyHp(-damage)
      
      // 构建伤害日志（包含技能信息）
      const skillInfo = result.skillName ? `使用【${result.skillName}】` : ''
      const logContent = `${monster.name} ${skillInfo}对你造成 ${damage} 点伤害`
      
      gameStore.addLog({
        type: 'damage',
        content: logContent,
        data: { ...result, defenderId: player.id, targetId: player.id }
      })
      
      // 检查玩家死亡
      if (playerStore.player!.currentHp <= 0) {
        handlePlayerDeath(monster.name)
      }
    } else if (result.isDodge) {
      gameStore.addLog({
        type: 'damage',
        content: `你闪避了 ${monster.name} 的攻击`,
        data: { defenderId: player.id, targetId: player.id }
      })
    } else if (result.isMiss) {
      gameStore.addLog({
        type: 'damage',
        content: `${monster.name} 的攻击未命中你`,
        data: { attackerId: monster.id, targetId: player.id }
      })
    }
    
    // 检查领主狂暴
    if (monsterAI.checkEnrage(monster)) {
      monsterAI.applyEnrage(monster)
      gameStore.addLog({
        type: 'system',
        content: `${monster.name} 进入狂暴状态！`
      })
    }
  }
  
  /**
   * 处理玩家死亡
   */
  function handlePlayerDeath(killerName?: string): void {
    gameStore.setRespawnTimer(RESPAWN_TIME)
    gameStore.addLog({
      type: 'system',
      content: `你被 ${killer} 击杀了，将在3秒后复活`,
      data: { killerName: killer, targetId: playerStore.player?.id }
    })
  }
  
  /**
   * 玩家复活
   */
  function respawn(): void {
    const player = playerStore.player
    if (!player) return
    
    // 恢复50%血量
    const respawnHp = Math.floor(player.baseStats.hp * RESPAWN_HP_RATIO)
    playerStore.modifyHp(respawnHp - player.currentHp)
    playerStore.modifyMp(player.baseStats.mp - player.currentMp) // 满蓝复活
    
    // 复活时清除负面buff
    buffManager.clearDebuffs(player.id)
    
    gameStore.setBattleState(BattleState.Fighting)
    gameStore.addLog({
      type: 'system',
      content: '你已复活，负面效果已清除'
    })
  }

  /**
   * 从技能配置给玩家施加Buff（通过buffManager）
   */
  function applyPlayerBuffFromSkill(skill: any, playerId: string, playerName: string, skillLevel: number): void {
    if (!skill.buffs) return
    
    const levelMultiplier = getSkillLevelMultiplier(skillLevel)
    
    for (const buffEffect of skill.buffs) {
      const duration = Math.floor(buffEffect.duration * (1 + (skillLevel - 1) * 0.1))
      buffManager.applyBuff({
        type: BuffType.StatMod,
        name: skill.name,
        icon: skill.icon,
        duration,
        isDebuff: buffEffect.value < 0,
        stat: buffEffect.stat,
        value: buffEffect.value,
        isPercent: buffEffect.isPercent
      }, playerId, playerName, playerId, 'player')
    }
    
    const buffDesc = skill.buffs.map((b: any) => {
      const name = STAT_NAMES[b.stat] || b.stat
      return `${name}${b.value > 0 ? '+' : ''}${b.isPercent ? Math.floor(b.value * 100) : b.value}%`
    }).join('，')
    
    gameStore.addLog({
      type: 'system',
      content: `${playerName} ${buffDesc}，持续${Math.floor(skill.buffs![0].duration / 1000)}秒`
    })
  }
  
  /**
   * 从技能配置对怪物施加Debuff（通过buffManager）
   */
  function applyDebuffFromSkill(skill: any, casterId: string, casterName: string, target: Monster, skillLevel: number): void {
    if (!skill.buffs) return
    
    const levelMultiplier = getSkillLevelMultiplier(skillLevel)
    
    for (const buffEffect of skill.buffs) {
      // 判断是否为控制效果
      let buffType = BuffType.StatMod
      if (skill.dot) {
        buffType = skill.element === 'poison' ? BuffType.Poison
          : skill.element === 'fire' ? BuffType.Burn
          : BuffType.StatMod
      }
      
      buffManager.applyBuff({
        type: buffType,
        name: skill.name,
        icon: skill.icon,
        duration: buffEffect.duration,
        isDebuff: true,
        stat: buffEffect.stat,
        value: buffEffect.value,
        isPercent: buffEffect.isPercent,
        tickDamage: skill.dot ? Math.floor(skill.dot.damage * levelMultiplier) : undefined,
        tickInterval: skill.dot?.interval
      }, casterId, casterName, target.id, 'monster')
    }
    
    const buff = skill.buffs[0]
    const statName = STAT_NAMES[buff.stat] || buff.stat
    
    gameStore.addLog({
      type: 'system',
      content: `${target.name} 被施加 ${skill.name}，${statName}降低${Math.abs(Math.floor(buff.value * 100))}%`
    })
  }

  /**
   * 处理所有Buff的每tick效果
   * 在游戏循环中调用
   */
  function processBuffTick(delta: number): void {
    const results = buffManager.tick(delta)
    const player = playerStore.player
    
    for (const result of results) {
      if (result.expired) {
        // Buff过期日志
        const buff = buffManager.activeBuffs.value.find(b => b.id === result.buffId)
        // 已被清理，跳过详细日志
        continue
      }
      
      // 查找目标名称
      const targetMonster = monsters.value.find(m => m.id === result.targetId)
      const targetName = targetMonster?.name || (result.targetId === player?.id ? player.name : '未知')
      
      // DOT伤害处理
      if (result.damage && result.damage > 0) {
        if (targetMonster) {
          targetMonster.currentHp -= result.damage
          const dotName = result.type === BuffType.Burn ? '灼烧' : result.type === BuffType.Poison ? '中毒' : '持续伤害'
          gameStore.addLog({
            type: 'damage',
            content: `${dotName}！对 ${targetName} 造成 ${result.damage} 点伤害`,
            data: {
              defenderId: targetMonster!.id,
              damage: result.damage,
              isCrit: false,
              isDodge: false,
              isMiss: false
            }
          })
          
          // 检查怪物死亡
          if (targetMonster.currentHp <= 0) {
            handleMonsterDeath(targetMonster)
          }
        } else if (result.targetId === player?.id) {
          playerStore.modifyHp(-result.damage)
          const dotName = result.type === BuffType.Burn ? '灼烧' : result.type === BuffType.Poison ? '中毒' : '持续伤害'
          gameStore.addLog({
            type: 'damage',
            content: `${dotName}！受到 ${result.damage} 点伤害`,
            data: {
              defenderId: player!.id,
              damage: result.damage,
              isCrit: false,
              isDodge: false,
              isMiss: false
            }
          })
          
          // 检查玩家死亡
          if (player.currentHp <= 0) {
            handlePlayerDeath()
          }
        }
      }
      
      // HOT治疗处理
      if (result.heal && result.heal > 0 && result.targetId === player?.id) {
        const actualHeal = Math.min(result.heal, player.baseStats.hp - player.currentHp)
        if (actualHeal > 0) {
          playerStore.modifyHp(actualHeal)
          gameStore.addLog({
            type: 'heal',
            content: `恢复 ${actualHeal} HP`,
            data: {
              targetId: player!.id,
              value: actualHeal
            }
          })
        }
      }
    }
  }
  
  /**
   * 清理过期Buff（兼容旧接口）
   */
  function cleanExpiredBuffs(): void {
    // buffManager.tick 已自动清理过期buff
  }
  
  return {
    monsters,
    playerBuffs,
    playerEntity,
    skillSystem,
    monsterAI,
    buffManager,
    enterMap,
    retreat,
    addMonster,
    removeMonster,
    clearDeadMonsters,
    executePlayerAttack,
    executePetAttack,
    executeMonsterAttack,
    processBuffTick,
    respawn,
    cleanExpiredBuffs
  }
}
