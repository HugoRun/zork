import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pet } from '@/types'
import { PetQuality, PetGrowth, PET_TEMPLATES, PET_MAX_LEVEL, getPetExpForLevel, calculatePetGrowth } from '@/types'
import { generateId, rollChance } from '@/utils/random'
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
 * 宠物仓库状态管理（按账号隔离）
 */
export const usePetStore = defineStore('pets', () => {
  // ==================== 状态 ====================

  /** 宠物列表 */
  const pets = ref<Pet[]>([])

  /** 出战宠物ID列表 */
  const activePetIds = ref<string[]>([])

  /** 合体宠物ID列表 */
  const mergedPetIds = ref<string[]>([])

  /** 当前选择的宠物ID（面板展示用） */
  const selectedPetId = ref<string | null>(null)

  /** 出战+合体总槽位数 */
  const totalSlots = ref(1)

  /** 兼容旧存档迁移 */
  function _migrate() {
    const any = pets.value as any[]
    for (const p of any) {
      if (p.state === 'merged' && !mergedPetIds.value.includes(p.id)) {
        mergedPetIds.value.push(p.id)
      }
      if (p.state === 'fighting' && !activePetIds.value.includes(p.id)) {
        activePetIds.value.push(p.id)
      }
    }
  }
  setTimeout(_migrate, 0)

  // ==================== 计算属性 ====================

  /** 当前占用的总槽位 */
  const usedSlots = computed(() => activePetIds.value.length + mergedPetIds.value.length)

  /** 是否还有空槽 */
  const hasFreeSlot = computed(() => usedSlots.value < totalSlots.value)

  /** 出战宠物列表 */
  const activePets = computed(() =>
    pets.value.filter(p => activePetIds.value.includes(p.id) && p.state === 'fighting')
  )

  /** 出战宠物（兼容旧接口） */
  const activePet = computed(() => activePets.value[0] || null)

  /** 所有合体宠物 */
  const mergedPets = computed(() =>
    pets.value.filter(p => mergedPetIds.value.includes(p.id) && p.state === 'merged')
  )

  /** 合体宠物（兼容旧接口） */
  const mergedPet = computed(() => mergedPets.value[0] || null)

  /** 当前选中宠物 */
  const selectedPet = computed(() =>
    pets.value.find(p => p.id === selectedPetId.value) || null
  )

  /** 可出战的宠物列表 */
  const availablePets = computed(() =>
    pets.value.filter(p => p.state === 'idle')
  )

  /** 是否有宠物仓库 */
  const hasPets = computed(() => pets.value.length > 0)

  // ==================== 宠物获取 ====================

  function tryDropFromMonster(monsterTemplateId: string, monsterLevel: number): Pet | null {
    for (const template of PET_TEMPLATES) {
      if (template.obtainFrom.type !== 'monster_drop') continue
      if (!template.obtainFrom.monsterIds?.includes(monsterTemplateId)) continue
      if (template.obtainFrom.minMonsterLevel && monsterLevel < template.obtainFrom.minMonsterLevel) continue
      if (!rollChance(template.obtainFrom.dropRate)) continue

      const pet = createPet(template)
      pets.value.push(pet)
      return pet
    }
    return null
  }

  function createPet(template: typeof PET_TEMPLATES[0]): Pet {
    const aptitude = 0.5 + Math.random() * 0.5
    const growth = rollGrowthFromAptitude(aptitude)
    return {
      id: `pet_${generateId()}`,
      templateId: template.id,
      name: template.name,
      icon: template.icon,
      element: template.element,
      quality: template.quality,
      growth,
      level: 1,
      exp: 0,
      baseStats: { ...template.baseStats },
      currentHp: template.baseStats.hp,
      maxHp: template.baseStats.hp,
      skills: [...template.skills],
      state: 'idle',
      obtainedAt: Date.now(),
      aptitude
    }
  }

  function rollGrowthFromAptitude(aptitude: number): PetGrowth {
    if (aptitude >= 0.95) return PetGrowth.Perfect
    if (aptitude >= 0.8) return PetGrowth.Excellent
    if (aptitude >= 0.65) return PetGrowth.Good
    if (aptitude >= 0.45) return PetGrowth.Normal
    return PetGrowth.Poor
  }

  // ==================== 宠物管理 ====================

  /** 出战宠物 */
  function setActivePet(petId: string): boolean {
    if (!hasFreeSlot.value) return false

    const pet = pets.value.find(p => p.id === petId)
    if (!pet || pet.state !== 'idle') return false

    pet.state = 'fighting'
    pet.currentHp = pet.maxHp
    activePetIds.value.push(petId)
    return true
  }

  /** 收回单个出战宠物 */
  function recallSinglePet(petId: string): void {
    const pet = pets.value.find(p => p.id === petId)
    if (pet && pet.state === 'fighting') {
      pet.state = 'idle'
    }
    activePetIds.value = activePetIds.value.filter(id => id !== petId)
  }

  /** 收回所有出战宠物 */
  function recallPet(): void {
    for (const id of activePetIds.value) {
      const pet = pets.value.find(p => p.id === id)
      if (pet) pet.state = 'idle'
    }
    activePetIds.value = []
  }

  /** 合体宠物 */
  function mergePet(petId: string): boolean {
    if (!hasFreeSlot.value) return false

    const pet = pets.value.find(p => p.id === petId)
    if (!pet || pet.state !== 'idle') return false

    pet.state = 'merged'
    if (!mergedPetIds.value.includes(petId)) {
      mergedPetIds.value.push(petId)
    }
    return true
  }

  /** 解除所有合体 */
  function unmergePet(): void {
    for (const id of mergedPetIds.value) {
      const pet = pets.value.find(p => p.id === id)
      if (pet) pet.state = 'idle'
    }
    mergedPetIds.value = []
  }

  /** 解除指定宠物合体 */
  function unmergeSinglePet(petId: string): void {
    const pet = pets.value.find(p => p.id === petId)
    if (pet && pet.state === 'merged') pet.state = 'idle'
    mergedPetIds.value = mergedPetIds.value.filter(id => id !== petId)
  }

  /** 删除宠物 */
  function removePet(petId: string): void {
    const index = pets.value.findIndex(p => p.id === petId)
    if (index === -1) return
    activePetIds.value = activePetIds.value.filter(id => id !== petId)
    mergedPetIds.value = mergedPetIds.value.filter(id => id !== petId)
    if (selectedPetId.value === petId) selectedPetId.value = null
    pets.value.splice(index, 1)
  }

  /** 批量删除宠物 */
  function batchRemovePet(petIds: string[]): void {
    for (const id of petIds) {
      const index = pets.value.findIndex(p => p.id === id)
      if (index === -1) continue
      activePetIds.value = activePetIds.value.filter(aid => aid !== id)
      mergedPetIds.value = mergedPetIds.value.filter(mid => mid !== id)
      if (selectedPetId.value === id) selectedPetId.value = null
      pets.value.splice(index, 1)
    }
  }

  /** 选择宠物 */
  function selectPet(petId: string | null): void {
    selectedPetId.value = petId
  }

  // ==================== 升级与进化 ====================

  function addPetExp(petId: string, amount: number): boolean {
    const pet = pets.value.find(p => p.id === petId)
    if (!pet || pet.level >= PET_MAX_LEVEL) return false

    pet.exp += amount
    const expNeeded = getPetExpForLevel(pet.level)
    if (pet.exp >= expNeeded && pet.level < PET_MAX_LEVEL) {
      petLevelUp(pet)
      return true
    }
    return false
  }

  function petLevelUp(pet: Pet): void {
    const expNeeded = getPetExpForLevel(pet.level)
    pet.exp -= expNeeded
    pet.level++

    const growth = calculatePetGrowth(pet)
    const stats = pet.baseStats
    if (growth.hp) stats.hp += growth.hp
    if (growth.mp) stats.mp += growth.mp
    if (growth.attack) stats.attack += growth.attack
    if (growth.defense) stats.defense += growth.defense
    if (growth.magicAttack) stats.magicAttack += growth.magicAttack
    if (growth.magicDefense) stats.magicDefense += growth.magicDefense
    if (growth.speed) stats.speed += growth.speed
    if (growth.critRate) stats.critRate += growth.critRate
    if (growth.critDamage) stats.critDamage += growth.critDamage
    if (growth.dodge) stats.dodge += growth.dodge

    pet.maxHp = stats.hp
    pet.currentHp = stats.hp

    const template = PET_TEMPLATES.find(t => t.id === pet.templateId)
    if (template?.evolution && pet.level >= template.evolution.level) {
      evolvePet(pet, template.evolution.to)
    }
  }

  function evolvePet(pet: Pet, targetTemplateId: string): boolean {
    const targetTemplate = PET_TEMPLATES.find(t => t.id === targetTemplateId)
    if (!targetTemplate) return false

    const oldLevel = pet.level
    const oldExp = pet.exp

    pet.templateId = targetTemplate.id
    pet.name = targetTemplate.name
    pet.icon = targetTemplate.icon
    pet.element = targetTemplate.element
    pet.quality = targetTemplate.quality
    pet.skills = [...targetTemplate.skills]

    pet.baseStats = { ...targetTemplate.baseStats }
    pet.level = 1
    pet.exp = 0

    for (let i = 1; i < oldLevel; i++) petLevelUp(pet)

    pet.level = oldLevel
    pet.exp = oldExp
    pet.maxHp = pet.baseStats.hp
    pet.currentHp = pet.maxHp
    return true
  }

  function healActivePet(): void {
    for (const id of activePetIds.value) {
      const pet = pets.value.find(p => p.id === id)
      if (pet) {
        pet.currentHp = pet.maxHp
        pet.state = 'fighting'
      }
    }
  }

  function modifyActivePetHp(petId: string, amount: number): void {
    const pet = pets.value.find(p => p.id === petId)
    if (!pet) return
    pet.currentHp = Math.max(0, Math.min(pet.maxHp, pet.currentHp + amount))
    if (pet.currentHp <= 0) pet.state = 'dead'
  }

  return {
    pets,
    activePetIds,
    mergedPetIds,
    selectedPetId,
    totalSlots,
    activePets,
    activePet,
    mergedPets,
    mergedPet,
    selectedPet,
    availablePets,
    hasPets,
    usedSlots,
    hasFreeSlot,
    tryDropFromMonster,
    setActivePet,
    recallSinglePet,
    recallPet,
    mergePet,
    unmergePet,
    unmergeSinglePet,
    removePet,
    batchRemovePet,
    selectPet,
    addPetExp,
    healActivePet,
    modifyActivePetHp,
    createPet
  }
}, {
  persist: {
    key: 'pets',
    storage: createAccountStorage()
  }
})
