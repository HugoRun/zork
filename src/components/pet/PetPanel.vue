<script setup lang="ts">
/**
 * 宠物面板 - 管理宠物仓库、出战、合体、一键放生
 */
import { computed, ref, reactive } from 'vue'
import { usePetStore } from '@/stores/petStore'
import { usePlayerStore } from '@/stores/playerStore'
import { PET_QUALITY_COLORS, PET_QUALITY_NAMES, PET_GROWTH_COLORS, PET_GROWTH_NAMES, PetQuality, PetGrowth, PET_TEMPLATES, PET_MAX_LEVEL, getPetExpForLevel } from '@/types'
import type { Pet } from '@/types'
import { formatStatValue } from '@/utils/formatter'

const emit = defineEmits<{ 'close': [] }>()
const petStore = usePetStore()
const playerStore = usePlayerStore()

const pets = computed(() => petStore.pets)
const activePets = computed(() => petStore.activePets)
const mergedPets = computed(() => petStore.mergedPets)

// 槽位信息
const slotsInfo = computed(() => ({
  total: petStore.totalSlots,
  used: petStore.usedSlots,
  free: petStore.hasFreeSlot
}))

/** 根据玩家等级计算可用槽位数 */
function getMaxSlots(playerLevel: number): number {
  if (playerLevel >= 30) return 4
  if (playerLevel >= 20) return 3
  if (playerLevel >= 10) return 2
  return 1
}

const playerLevel = computed(() => playerStore.player?.level || 1)

// 更新槽位数
const maxSlots = computed(() => getMaxSlots(playerLevel.value))
function updateSlots() {
  petStore.totalSlots = maxSlots.value
}
// 自动更新
import { watch } from 'vue'
watch(playerLevel, () => updateSlots(), { immediate: true })

const nextSlotLevel = computed(() => {
  if (playerLevel.value < 10) return 10
  if (playerLevel.value < 20) return 20
  if (playerLevel.value < 30) return 30
  return null
})

// ==================== 一键放生 ====================
const batchFilter = reactive({
  quality: 'all' as string,
  growth: 'all' as string,
  maxLevel: PET_MAX_LEVEL,
  excludeActive: true
})

const batchPreview = computed(() => {
  return pets.value.filter(p => {
    if (batchFilter.excludeActive && p.state !== 'idle' && p.state !== 'dead') return false
    if (batchFilter.quality !== 'all' && p.quality !== batchFilter.quality) return false
    if (batchFilter.growth !== 'all' && p.growth !== batchFilter.growth) return false
    if (p.level > batchFilter.maxLevel) return false
    return true
  })
})

function executeBatchRelease() {
  if (batchPreview.value.length === 0) return
  const names = batchPreview.value.map(p => `${p.icon}${p.name}`)
  if (!confirm(`确定要放生以下 ${batchPreview.value.length} 只宠物吗？\n${names.join('、')}`)) return
  petStore.batchRemovePet(batchPreview.value.map(p => p.id))
}

// ==================== 普通操作 ====================
function setActive(petId: string) {
  petStore.setActivePet(petId)
}

function doMerge(petId: string) {
  petStore.mergePet(petId)
}

function unmerge() {
  petStore.unmergePet()
}

function recall() {
  petStore.recallPet()
}

function removePet(petId: string) {
  if (confirm('确定要放生这只宠物吗？')) {
    petStore.removePet(petId)
  }
}

function selectPet(petId: string) {
  petStore.selectPet(petId)
}

function getExpPercent(pet: Pet): number {
  if (pet.level >= PET_MAX_LEVEL) return 100
  return Math.floor((pet.exp / getPetExpForLevel(pet.level)) * 100)
}

function getExpLabel(pet: Pet): string {
  if (pet.level >= PET_MAX_LEVEL) return 'MAX'
  return `${pet.exp}/${getPetExpForLevel(pet.level)}`
}

const MERGE_STAT_NAMES: Record<string, string> = {
  attack: '攻击', defense: '防御', magicAttack: '魔攻',
  magicDefense: '魔防', speed: '速度', critRate: '暴击率', critDamage: '暴击伤害'
}

const qualityOptions = [
  { value: 'all', label: '全部品质' },
  { value: String(PetQuality.Common), label: PET_QUALITY_NAMES[PetQuality.Common] },
  { value: String(PetQuality.Uncommon), label: PET_QUALITY_NAMES[PetQuality.Uncommon] },
  { value: String(PetQuality.Rare), label: PET_QUALITY_NAMES[PetQuality.Rare] },
  { value: String(PetQuality.Epic), label: PET_QUALITY_NAMES[PetQuality.Epic] },
  { value: String(PetQuality.Legendary), label: PET_QUALITY_NAMES[PetQuality.Legendary] },
]
const growthOptions = [
  { value: 'all', label: '全部成长' },
  { value: PetGrowth.Poor, label: PET_GROWTH_NAMES[PetGrowth.Poor] },
  { value: PetGrowth.Normal, label: PET_GROWTH_NAMES[PetGrowth.Normal] },
  { value: PetGrowth.Good, label: PET_GROWTH_NAMES[PetGrowth.Good] },
  { value: PetGrowth.Excellent, label: PET_GROWTH_NAMES[PetGrowth.Excellent] },
  { value: PetGrowth.Perfect, label: PET_GROWTH_NAMES[PetGrowth.Perfect] },
]

function formatAptitude(aptitude: number): string {
  return Math.floor(aptitude * 100) + '%'
}
</script>

<template>
  <div class="pet-panel">
    <!-- 槽位信息 -->
    <div class="slots-bar">
      <span class="slots-label">出战/合体槽位</span>
      <div class="slots-dots">
        <span
          v-for="i in maxSlots"
          :key="i"
          class="slot-dot"
          :class="{ 'slot-active': i <= slotsInfo.used }"
        >{{ i <= slotsInfo.used ? '●' : '○' }}</span>
      </div>
      <span class="slots-text">{{ slotsInfo.used }}/{{ slotsInfo.total }}</span>
      <span v-if="nextSlotLevel" class="slots-next">
        (Lv.{{ nextSlotLevel }} 解锁下一槽)
      </span>
    </div>

    <!-- 合体宠物状态 -->
    <div v-if="mergedPets.length > 0" class="merge-status">
      <div v-for="mp in mergedPets" :key="mp.id" class="merge-item">
        <div class="merge-header">
          <span class="merge-icon">{{ mp.icon }}</span>
          <span class="merge-name">{{ mp.name }}</span>
          <span class="merge-label">已合体</span>
          <button class="btn-unmerge" @click="petStore.unmergeSinglePet(mp.id)">解除</button>
        </div>
        <div class="merge-bonus">
          <template v-for="(val, stat) in PET_TEMPLATES.find(t => t.id === mp.templateId)?.mergeBonus" :key="stat">
            <span v-if="val" class="bonus-tag">+{{ Math.floor((val as number) * 100) }}% {{ MERGE_STAT_NAMES[stat as string] || stat }}</span>
          </template>
        </div>
      </div>
    </div>

    <!-- 出战宠物状态 -->
    <div v-if="activePets.length > 0" class="active-status">
      <div v-for="ap in activePets" :key="ap.id" class="active-item">
        <div class="active-header">
          <span class="active-icon">{{ ap.icon }}</span>
          <span class="active-name" :style="{ color: PET_QUALITY_COLORS[ap.quality] }">{{ ap.name }}</span>
          <span class="active-label">出战中</span>
          <button class="btn-recall" @click="petStore.recallSinglePet(ap.id)">收回</button>
        </div>
        <div class="active-hp">HP: {{ Math.floor(ap.currentHp) }}/{{ ap.maxHp }}</div>
      </div>
    </div>

    <!-- 一键放生 -->
    <div class="batch-section">
      <div class="batch-header" @click="batchFilter._expanded = !batchFilter._expanded">
        <span>一键放生</span>
        <span class="batch-count" v-if="batchPreview.length > 0">({{ batchPreview.length }}只)</span>
      </div>
      <div class="batch-filters">
        <select v-model="batchFilter.quality" class="batch-select">
          <option v-for="opt in qualityOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="batchFilter.growth" class="batch-select">
          <option v-for="opt in growthOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <div class="batch-level-filter">
          <span class="filter-label">≤Lv.</span>
          <input
            v-model.number="batchFilter.maxLevel"
            type="number"
            min="1"
            :max="PET_MAX_LEVEL"
            class="batch-input"
          />
        </div>
        <label class="batch-checkbox">
          <input type="checkbox" v-model="batchFilter.excludeActive" />
          <span>仅休息/死亡</span>
        </label>
        <button
          class="btn-batch-release"
          :disabled="batchPreview.length === 0"
          @click="executeBatchRelease"
        >
          放生({{ batchPreview.length }})
        </button>
      </div>
    </div>

    <!-- 宠物列表 -->
    <div class="pet-list-header">
      <span>宠物仓库 ({{ pets.length }})</span>
    </div>

    <div v-if="pets.length === 0" class="empty-tip">
      <p>还没有宠物</p>
      <p class="sub">击杀怪物有概率掉落宠物蛋</p>
    </div>

    <div v-else class="pet-list">
      <div
        v-for="pet in pets"
        :key="pet.id"
        class="pet-card"
        :class="{ 'is-active': pet.state === 'fighting', 'is-merged': pet.state === 'merged', 'is-dead': pet.state === 'dead' }"
        :style="{ borderColor: PET_QUALITY_COLORS[pet.quality] }"
        @click="selectPet(pet.id)"
      >
        <div class="pet-card-header">
          <span class="pet-icon">{{ pet.icon }}</span>
          <div class="pet-info">
            <div class="pet-name" :style="{ color: PET_QUALITY_COLORS[pet.quality] }">
              {{ pet.name }}
            </div>
            <div class="pet-meta">
              <span class="pet-quality" :style="{ color: PET_QUALITY_COLORS[pet.quality] }">
                {{ PET_QUALITY_NAMES[pet.quality] }}
              </span>
              <span class="pet-growth" :style="{ color: PET_GROWTH_COLORS[pet.growth] }">
                {{ PET_GROWTH_NAMES[pet.growth] }}成长
              </span>
              <span class="pet-level">Lv.{{ pet.level }}</span>
            </div>
          </div>
          <div class="pet-state-tag">
            <span v-if="pet.state === 'fighting'" class="state-tag fighting">出战</span>
            <span v-else-if="pet.state === 'merged'" class="state-tag merged">合体</span>
            <span v-else-if="pet.state === 'dead'" class="state-tag dead">死亡</span>
            <span v-else class="state-tag idle">休息</span>
          </div>
        </div>

        <!-- 属性 -->
        <div class="pet-stats-grid">
          <div class="stat"><span class="stat-label">HP</span><span class="stat-val">{{ Math.floor(pet.baseStats.hp) }}</span></div>
          <div class="stat"><span class="stat-label">攻击</span><span class="stat-val">{{ formatStatValue(pet.baseStats.attack) }}</span></div>
          <div class="stat"><span class="stat-label">防御</span><span class="stat-val">{{ formatStatValue(pet.baseStats.defense) }}</span></div>
          <div class="stat"><span class="stat-label">魔攻</span><span class="stat-val">{{ formatStatValue(pet.baseStats.magicAttack) }}</span></div>
          <div class="stat"><span class="stat-label">速度</span><span class="stat-val">{{ formatStatValue(pet.baseStats.speed) }}</span></div>
          <div class="stat"><span class="stat-label">暴击</span><span class="stat-val">{{ formatStatValue(pet.baseStats.critRate, true) }}</span></div>
        </div>

        <!-- 资质 -->
        <div class="aptitude-row">
          <span class="aptitude-label">资质</span>
          <span class="aptitude-bar-track">
            <span class="aptitude-bar-fill" :style="{ width: (pet.aptitude * 100) + '%', background: PET_GROWTH_COLORS[pet.growth] }"></span>
          </span>
          <span class="aptitude-val" :style="{ color: PET_GROWTH_COLORS[pet.growth] }">{{ formatAptitude(pet.aptitude) }}</span>
        </div>

        <!-- 经验条 -->
        <div class="exp-bar-row">
          <div class="exp-bar-track">
            <div class="exp-bar-fill" :style="{ width: getExpPercent(pet) + '%' }"></div>
          </div>
          <span class="exp-text">{{ getExpLabel(pet) }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="pet-actions">
          <button
            v-if="pet.state === 'idle' && slotsInfo.free"
            class="btn-action btn-fight"
            @click.stop="setActive(pet.id)"
          >
            出战
          </button>
          <button
            v-if="pet.state === 'idle' && slotsInfo.free"
            class="btn-action btn-merge"
            @click.stop="doMerge(pet.id)"
          >
            合体
          </button>
          <button
            v-if="pet.state === 'dead'"
            class="btn-action btn-heal"
            @click.stop="petStore.healActivePet()"
          >
            复活
          </button>
          <button
            v-if="pet.state === 'idle'"
            class="btn-action btn-release"
            @click.stop="removePet(pet.id)"
          >
            放生
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pet-panel {
  padding: var(--space-md);
}

/* 槽位信息 */
.slots-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
  font-size: var(--text-xs);
}
.slots-label { color: var(--text-secondary); font-weight: 600; }
.slots-dots { display: flex; gap: 4px; }
.slot-dot { font-size: 0.8rem; color: var(--text-muted); }
.slot-active { color: var(--accent-primary); }
.slots-text { color: var(--text-primary); font-weight: 600; }
.slots-next { color: var(--text-muted); font-size: 0.6rem; }

/* 合体状态 */
.merge-status {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(245, 158, 11, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
}
.merge-item + .merge-item { margin-top: var(--space-xs); }
.merge-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.merge-icon { font-size: 1.3rem; }
.merge-name { font-weight: 600; color: #8B5CF6; font-size: var(--text-sm); }
.merge-label { font-size: 0.65rem; background: rgba(139,92,246,0.2); padding: 1px 5px; border-radius: var(--radius-full); color: #A78BFA; }
.btn-unmerge {
  margin-left: auto;
  font-size: 0.7rem;
  padding: 2px 6px;
  border: 1px solid rgba(139,92,246,0.3);
  border-radius: var(--radius-sm);
  background: transparent;
  color: #A78BFA;
  cursor: pointer;
}
.btn-unmerge:hover { background: rgba(139,92,246,0.15); }
.merge-bonus { display: flex; gap: 4px; flex-wrap: wrap; padding-left: calc(1.3rem + var(--space-sm)); }
.bonus-tag {
  font-size: 0.65rem;
  padding: 1px 5px;
  border-radius: var(--radius-full);
  background: rgba(245, 158, 11, 0.12);
  color: #F59E0B;
}

/* 出战状态 */
.active-status {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
}
.active-item + .active-item { margin-top: var(--space-xs); }
.active-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.active-icon { font-size: 1.2rem; }
.active-name { font-weight: 600; font-size: var(--text-sm); }
.active-label { font-size: 0.65rem; background: rgba(16,185,129,0.2); padding: 1px 5px; border-radius: var(--radius-full); color: #10B981; }
.btn-recall {
  margin-left: auto;
  font-size: 0.7rem;
  padding: 2px 6px;
  border: 1px solid rgba(16,185,129,0.3);
  border-radius: var(--radius-sm);
  background: transparent;
  color: #10B981;
  cursor: pointer;
}
.btn-recall:hover { background: rgba(16,185,129,0.15); }
.active-hp {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  padding-left: calc(1.2rem + var(--space-sm));
}

/* 一键放生 */
.batch-section {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
  overflow: hidden;
}
.batch-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  cursor: default;
}
.batch-count {
  font-size: 0.65rem;
  color: #EF4444;
  font-weight: 400;
}
.batch-filters {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  flex-wrap: wrap;
}
.batch-select, .batch-input {
  font-size: 0.7rem;
  padding: 3px 6px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-primary);
}
.batch-select { width: auto; }
.batch-input { width: 50px; }
.batch-level-filter {
  display: flex;
  align-items: center;
  gap: 4px;
}
.filter-label { font-size: 0.65rem; color: var(--text-muted); }
.batch-checkbox {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  color: var(--text-secondary);
  cursor: pointer;
}
.batch-checkbox input { margin: 0; }
.btn-batch-release {
  margin-left: auto;
  font-size: 0.7rem;
  padding: 3px 10px;
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: var(--radius-sm);
  background: rgba(239,68,68,0.08);
  color: #EF4444;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s;
}
.btn-batch-release:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-batch-release:not(:disabled):hover { background: rgba(239,68,68,0.15); }

/* 列表头 */
.pet-list-header {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--border-color-light);
}

/* 空提示 */
.empty-tip {
  text-align: center;
  padding: 2rem var(--space-md);
  color: var(--text-muted);
}
.empty-tip .sub { font-size: var(--text-xs); margin-top: var(--space-xs); }

/* 宠物列表 */
.pet-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 55vh;
  overflow-y: auto;
}

/* 宠物卡片 */
.pet-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left-width: 3px;
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  cursor: pointer;
  transition: all 0.15s;
}
.pet-card:hover { background-color: var(--bg-tertiary); }
.pet-card.is-active { border-color: #10B981 !important; background: rgba(16,185,129,0.05); }
.pet-card.is-merged { border-color: #8B5CF6 !important; background: rgba(139,92,246,0.05); }
.pet-card.is-dead { opacity: 0.6; }

.pet-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}
.pet-icon { font-size: 1.4rem; flex-shrink: 0; }
.pet-info { flex: 1; min-width: 0; }
.pet-name { font-size: var(--text-sm); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pet-meta { display: flex; gap: 6px; font-size: 0.65rem; margin-top: 1px; }
.pet-state-tag { flex-shrink: 0; }
.state-tag {
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-weight: 600;
}
.state-tag.fighting { background: rgba(16,185,129,0.15); color: #10B981; }
.state-tag.merged { background: rgba(139,92,246,0.15); color: #8B5CF6; }
.state-tag.dead { background: rgba(239,68,68,0.15); color: #EF4444; }
.state-tag.idle { background: rgba(156,163,175,0.1); color: #9CA3AF; }

/* 属性网格 */
.pet-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  margin-bottom: 6px;
}
.stat {
  display: flex;
  justify-content: space-between;
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  font-size: 0.65rem;
}
.stat-label { color: var(--text-muted); }
.stat-val { color: var(--text-primary); font-weight: 500; }

/* 资质条 */
.aptitude-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.aptitude-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  width: 26px;
  flex-shrink: 0;
}
.aptitude-bar-track {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}
.aptitude-bar-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s;
}
.aptitude-val {
  font-size: 0.6rem;
  font-weight: 600;
  min-width: 28px;
  text-align: right;
  flex-shrink: 0;
}

/* 经验条 */
.exp-bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.exp-bar-track {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}
.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #8B5CF6);
  border-radius: 2px;
  transition: width 0.3s;
}
.exp-text { font-size: 0.6rem; color: var(--text-muted); min-width: 50px; text-align: right; }

/* 操作按钮 */
.pet-actions {
  display: flex;
  gap: 4px;
}
.btn-action {
  flex: 1;
  font-size: 0.7rem;
  padding: 4px 8px;
  border: 1px solid;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s;
}
.btn-fight {
  border-color: rgba(16,185,129,0.3);
  background: rgba(16,185,129,0.1);
  color: #10B981;
}
.btn-fight:hover { background: rgba(16,185,129,0.2); }
.btn-merge {
  border-color: rgba(139,92,246,0.3);
  background: rgba(139,92,246,0.1);
  color: #8B5CF6;
}
.btn-merge:hover { background: rgba(139,92,246,0.2); }
.btn-heal {
  border-color: rgba(59,130,246,0.3);
  background: rgba(59,130,246,0.1);
  color: #3B82F6;
}
.btn-heal:hover { background: rgba(59,130,246,0.2); }
.btn-release {
  border-color: rgba(239,68,68,0.2);
  background: transparent;
  color: #EF4444;
}
.btn-release:hover { background: rgba(239,68,68,0.1); }
</style>
