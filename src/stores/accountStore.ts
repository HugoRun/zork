/**
 * 账号管理系统 Store
 * 支持多角色切换，每个角色独立存储数据
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player, CreatePlayerParams } from '@/types'
import { CharacterClass } from '@/types'

export interface Account {
  id: string
  name: string
  characterClass: CharacterClass
  level: number
  avatar?: string
  createdAt: number
  lastPlayedAt: number
  /** 序列化的玩家数据快照 */
  playerData: Player | null
}

const ACCOUNTS_KEY = 'darklegend_accounts'
const CURRENT_ACCOUNT_KEY = 'darklegend_current_account'

/**
 * 从localStorage读取账号列表
 */
function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * 保存账号列表到localStorage
 */
function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

/**
 * 获取当前账号ID
 */
function getCurrentAccountId(): string | null {
  return localStorage.getItem(CURRENT_ACCOUNT_KEY) || null
}

/**
 * 设置当前账号ID
 */
function setCurrentAccountId(id: string | null): void {
  if (id) {
    localStorage.setItem(CURRENT_ACCOUNT_KEY, id)
  } else {
    localStorage.removeItem(CURRENT_ACCOUNT_KEY)
  }
}

export const useAccountStore = defineStore('account', () => {
  /** 所有账号列表 */
  const accounts = ref<Account[]>(loadAccounts())

  /** 当前选中的账号ID */
  const currentAccountId = ref<string | null>(getCurrentAccountId())

  // ==================== 计算属性 ====================

  /** 当前账号 */
  const currentAccount = computed(() => {
    if (!currentAccountId.value) return null
    return accounts.value.find(a => a.id === currentAccountId.value) || null
  })

  /** 是否有账号 */
  const hasAccounts = computed(() => accounts.value.length > 0)

  /** 当前账号的玩家数据 */
  const currentPlayerData = computed(() => currentAccount.value?.playerData || null)

  /** 账号数量 */
  const accountCount = computed(() => accounts.value.length)

  // ==================== 账号管理 ====================

  /**
   * 创建新账号（同时创建角色）
   */
  function createAccount(params: CreatePlayerParams & { avatar?: string }): Account {
    const now = Date.now()
    const accountId = `account_${now}`

    const playerData: Player = {
      id: `player_${now}`,
      name: params.name,
      class: params.class,
      level: 1,
      exp: 0,
      gold: 100,
      currentHp: 100,
      currentMp: 50,
      baseStats: getClassBaseStats(params.class),
      equipment: {},
      skillPriority: [],
      skillLevels: {},
      advancementTier: 1,
      createdAt: now,
      lastOnlineAt: now
    }

    const account: Account = {
      id: accountId,
      name: params.name,
      characterClass: params.class,
      level: 1,
      avatar: params.avatar,
      createdAt: now,
      lastPlayedAt: now,
      playerData
    }

    accounts.value.push(account)
    saveAccounts(accounts.value)
    currentAccountId.value = accountId
    setCurrentAccountId(accountId)

    return account
  }

  /**
   * 切换账号
   * 返回需要恢复的玩家数据，由调用方负责patch到playerStore
   */
  function switchAccount(accountId: string): Player | null {
    const target = accounts.value.find(a => a.id === accountId)
    if (!target) return null

    // 保存当前账号的玩家数据（由调用方提供）
    currentAccountId.value = accountId
    setCurrentAccountId(accountId)

    // 更新最后游玩时间
    target.lastPlayedAt = Date.now()
    saveAccounts(accounts.value)

    return target.playerData || null
  }

  /**
   * 删除账号
   */
  function deleteAccount(accountId: string): boolean {
    const index = accounts.value.findIndex(a => a.id === accountId)
    if (index === -1) return false

    accounts.value.splice(index, 1)
    saveAccounts(accounts.value)

    // 如果删除的是当前账号，切到第一个或清空
    if (currentAccountId.value === accountId) {
      if (accounts.value.length > 0) {
        currentAccountId.value = accounts.value[0].id
        setCurrentAccountId(currentAccountId.value)
      } else {
        currentAccountId.value = null
        localStorage.removeItem(CURRENT_ACCOUNT_KEY)
      }
    }

    return true
  }

  /**
   * 更新当前账号的玩家数据快照（在玩家数据变化时调用）
   */
  function updatePlayerSnapshot(player: Player): void {
    const account = accounts.value.find(a => a.id === currentAccountId.value)
    if (account) {
      account.playerData = player
      account.level = player.level
      account.name = player.name
      account.characterClass = player.class
      account.lastPlayedAt = Date.now()
      saveAccounts(accounts.value)
    }
  }

  /**
   * 获取指定账号的数据键前缀（用于其他store区分数据）
   */
  function getAccountStoragePrefix(): string {
    return currentAccountId.value ? `${currentAccountId}_` : ''
  }

  return {
    accounts,
    currentAccountId,
    currentAccount,
    hasAccounts,
    currentPlayerData,
    accountCount,
    createAccount,
    switchAccount,
    deleteAccount,
    updatePlayerSnapshot,
    getAccountStoragePrefix
  }
})

/**
 * 获取职业基础属性（从playerStore复制，避免循环依赖）
 */
function getClassBaseStats(charClass: CharacterClass) {
  const statsMap = {
    [CharacterClass.Warrior]: {
      hp: 200, mp: 40, attack: 15, defense: 14,
      magicAttack: 5, magicDefense: 8, speed: 8,
      critRate: 0.05, critDamage: 1.5, dodge: 0.03, hitRate: 0.95
    },
    [CharacterClass.Mage]: {
      hp: 120, mp: 120, attack: 5, defense: 6,
      magicAttack: 22, magicDefense: 14, speed: 10,
      critRate: 0.08, critDamage: 1.8, dodge: 0.05, hitRate: 0.92
    },
    [CharacterClass.Ranger]: {
      hp: 140, mp: 70, attack: 12, defense: 10,
      magicAttack: 8, magicDefense: 10, speed: 15,
      critRate: 0.12, critDamage: 2.0, dodge: 0.1, hitRate: 0.97
    }
  }
  return statsMap[charClass]
}
