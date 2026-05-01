/**
 * 游戏主循环 Composable
 * 驱动游戏tick调度
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import { useBattleEngine } from './battle/useBattleEngine'
import { useSharedBattleEngine } from './useSharedBattleEngine'
import { useMonsterSpawner } from './useMonsterSpawner'
import { usePotion } from './usePotion'
import { GAME_TICK_INTERVAL, MAX_MONSTERS_PER_MAP, BATCH_MONSTER_COUNT, NEXT_WAVE_DELAY } from '@/config'
import { BattleState, CharacterClass } from '@/types'

/** 各职业的技能列表 */
const CLASS_SKILLS: Record<string, string[]> = {
  [CharacterClass.Warrior]: ['attack', 'warrior_slash', 'warrior_whirlwind', 'warrior_battle_cry', 'warrior_execute'],
  [CharacterClass.Mage]: ['attack', 'mage_fireball', 'mage_heal', 'mage_meteor', 'mage_frost_nova', 'mage_arcane_blast'],
  [CharacterClass.Ranger]: ['attack', 'ranger_double_shot', 'ranger_evade', 'ranger_multi_shot', 'ranger_aimed_shot', 'ranger_arrow_rain']
}

/** 技能是否已初始化 */
let skillsInitialized = false

/**
 * 确保技能系统已初始化
 */
function ensureSkillsInitialized() {
  if (skillsInitialized) return
  const playerStore = usePlayerStore()
  if (!playerStore.player) return

  const classKey = playerStore.player.class
  const skillIds = CLASS_SKILLS[classKey] || ['attack']
  const battleEngine = useSharedBattleEngine()
  battleEngine.skillSystem.initSkills(skillIds, playerStore.player.level, playerStore.player.skillLevels || {}, playerStore.player.advancementTier || 1)
  skillsInitialized = true
}

/**
 * 游戏主循环
 */
export function useGameLoop() {
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()

  const battleEngine = useSharedBattleEngine()
  const { spawnBatch, canSpawn } = useMonsterSpawner()
  const { checkAndUsePotion } = usePotion()

  /** 是否运行中 */
  const isRunning = ref(false)

  /** 游戏循环定时器 */
  let gameInterval: ReturnType<typeof setInterval> | null = null

  /** 上次tick时间 */
  let lastTickTime = 0

  /** 上一次战斗状态（用于检测状态转换） */
  let lastBattleState: BattleState | null = null

  /** 下一波刷新计时器（毫秒） */
  let nextWaveTimer = 0

  /** 是否等待下一波（怪物全灭后） */
  let waitingForNextWave = false

  /** 是否已执行过初始刷怪（用于区分首次进入和怪物全灭） */
  let initialSpawnDone = false

  /** 初始进入地图：批量生成第一波怪 */
  function initialSpawn() {
    const count = Math.min(BATCH_MONSTER_COUNT, MAX_MONSTERS_PER_MAP)
    const monsters = spawnBatch(gameStore.currentMapId || '', count)
    for (const monster of monsters) {
      battleEngine.addMonster(monster)
    }
    if (monsters.length > 0) {
      gameStore.addLog({ type: 'system', content: `${monsters.length} 只怪物出现了！` })
    }
    waitingForNextWave = false
    nextWaveTimer = 0
    initialSpawnDone = true
  }

  /** 批量生成新一波怪物（只在存活怪物为0时触发） */
  function spawnNextWave() {
    const aliveCount = battleEngine.monsters.value.filter(m => !m.isDead).length
    if (aliveCount > 0) return
    // 先清除所有已死亡的怪物尸体
    const dead = battleEngine.clearDeadMonsters()
    if (dead.length > 0) {
      gameStore.addLog({ type: 'system', content: `${dead.length} 具尸体被清除了` })
    }
    // 批量生成新一波
    const count = Math.min(BATCH_MONSTER_COUNT, MAX_MONSTERS_PER_MAP)
    const monsters = spawnBatch(gameStore.currentMapId || '', count)
    for (const monster of monsters) {
      battleEngine.addMonster(monster)
    }
    if (monsters.length > 0) {
      gameStore.addLog({ type: 'system', content: `新的一波来了！${monsters.length} 只怪物出现。` })
    }
    waitingForNextWave = false
    nextWaveTimer = 0
  }

  /**
   * 游戏tick
   */
  function tick() {
    const now = Date.now()
    const delta = now - lastTickTime
    lastTickTime = now

    // 检查游戏状态
    if (!playerStore.hasPlayer) return

    const battleState = gameStore.battleState

    // 检测状态转换：进入新的战斗 -> 重置初始刷怪标记
    if (lastBattleState !== null && lastBattleState !== BattleState.Fighting && battleState === BattleState.Fighting) {
      initialSpawnDone = false
      waitingForNextWave = false
      nextWaveTimer = 0
    }
    lastBattleState = battleState

    // 处理复活倒计时 + 复活后批量刷怪
    if (battleState === BattleState.PlayerDead) {
      gameStore.decreaseRespawnTimer()
      if (gameStore.respawnTimer <= 0) {
        battleEngine.respawn()
        // 复活后延迟一波新怪
        nextWaveTimer = NEXT_WAVE_DELAY
        waitingForNextWave = true
      }
      return
    }

    // 只有战斗中才处理战斗逻辑
    if (battleState !== BattleState.Fighting) return

    // 复活后的波次计时
    if (waitingForNextWave) {
      nextWaveTimer -= GAME_TICK_INTERVAL
      if (nextWaveTimer <= 0) {
        spawnNextWave()
      }
      return
    }

    // 1. 首次进入地图 -> 初始批量刷怪
    if (!initialSpawnDone && battleEngine.monsters.value.length === 0) {
      initialSpawn()
      return // 下一tick继续正常处理
    }

    // 2. 检查存活怪物是否全灭 -> 触发下一波计时
    const aliveNow = battleEngine.monsters.value.filter(m => !m.isDead).length
    if (aliveNow === 0) {
      if (!waitingForNextWave) {
        waitingForNextWave = true
        nextWaveTimer = NEXT_WAVE_DELAY
        gameStore.addLog({ type: 'system', content: '所有怪物已消灭，下一波即将到来...' })
      } else {
        nextWaveTimer -= GAME_TICK_INTERVAL
        if (nextWaveTimer <= 0) {
          spawnNextWave()
        }
      }
      // 怪物全灭期间仍然处理其他逻辑
    } else {
      // 有怪物时，如果数量不足上限，补充到BATCH数量（可选的增量补怪）
      // 这里保持简单：不自动补，等全灭后再批量刷新
    }
    
    // 2. 更新技能冷却
    battleEngine.skillSystem.updateCooldowns(delta)
    
    // 3. 处理Buff tick（DOT/HOT效果、控制效果）
    battleEngine.processBuffTick(delta)
    
    // 4. 玩家攻击
    battleEngine.executePlayerAttack()
    
    // 5. 宠物攻击
    battleEngine.executePetAttack()
    
    // 6. 怪物攻击
    battleEngine.monsters.value.forEach(monster => {
      // 更新怪物技能冷却
      battleEngine.monsterAI.updateCooldowns(monster.id, delta)
      battleEngine.executeMonsterAttack(monster)
    })
    
    // 7. 药水使用检查
    if (playerStore.player) {
      checkAndUsePotion(
        playerStore.player.currentHp,
        playerStore.player.baseStats.hp,
        playerStore.player.currentMp,
        playerStore.player.baseStats.mp
      )
    }
    
    // 8. 确保技能系统已初始化（不影响核心战斗逻辑）
    try { ensureSkillsInitialized() } catch (_) { /* ignore */ }
  }
  
  /**
   * 启动游戏循环
   */
  function start() {
    if (isRunning.value) return
    
    isRunning.value = true
    lastTickTime = Date.now()
    
    gameInterval = setInterval(tick, GAME_TICK_INTERVAL)
  }
  
  /**
   * 停止游戏循环
   */
  function stop() {
    if (!isRunning.value) return
    
    isRunning.value = false
    
    if (gameInterval) {
      clearInterval(gameInterval)
      gameInterval = null
    }
  }
  
  /**
   * 暂停游戏循环
   */
  function pause() {
    stop()
  }
  
  /**
   * 恢复游戏循环
   */
  function resume() {
    start()
  }
  
  // 自动在组件挂载时启动，卸载时停止
  onMounted(() => {
    // 只在有角色时启动
    if (playerStore.hasPlayer) {
      start()
    }
  })
  
  onUnmounted(() => {
    stop()
  })
  
  return {
    isRunning,
    start,
    stop,
    pause,
    resume,
    tick
  }
}
