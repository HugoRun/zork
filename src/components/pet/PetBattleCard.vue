<script setup lang="ts">
/**
 * 战斗场景中的宠物卡片 - 显示所有出战宠物的状态
 * UI 风格与角色卡/怪物卡保持一致
 */
import { computed, ref, watch } from 'vue'
import { usePetStore } from '@/stores/petStore'
import { useSharedBattleEngine } from '@/composables/useSharedBattleEngine'
import { PET_QUALITY_COLORS, PET_QUALITY_NAMES, PET_GROWTH_NAMES, PET_GROWTH_COLORS } from '@/types'
import ProgressBar from '@/components/common/ProgressBar.vue'
import BuffIcon from '@/components/battle/BuffIcon.vue'

const petStore = usePetStore()
const battleEngine = useSharedBattleEngine()

const activePets = computed(() => petStore.activePets)

function getPetBuffs(petId: string) {
  return battleEngine.buffManager.getBuffs(petId)
}

function recallPet(petId: string) {
  petStore.recallSinglePet(petId)
}

function mergePet(petId: string) {
  petStore.recallSinglePet(petId)
  petStore.mergePet(petId)
}

// 受击动画状态（per pet）
const hitMap = ref<Record<string, boolean>>({})

watch(() => activePets.value.map(p => p.currentHp).join(','), () => {
  for (const pet of activePets.value) {
    const key = pet.id
    const currentHp = pet.currentHp
    if (!hitMap._prevHp) hitMap._prevHp = {} as any
    const prev = (hitMap._prevHp as any)[key]
    if (prev !== undefined && currentHp < prev) {
      hitMap.value[key] = true
      setTimeout(() => { hitMap.value[key] = false }, 300)
    }
    ;(hitMap._prevHp as any)[key] = currentHp
  }
})

const isPetHit = (petId: string) => computed(() => !!hitMap.value[petId])
</script>

<template>
  <div v-if="activePets.length > 0" class="pets-battle-area">
    <div
      v-for="pet in activePets"
      :key="pet.id"
      class="pet-card card"
      :class="{ 'hit-shake': isPetHit(pet.id).value, 'is-dead': pet.state === 'dead' }"
      :style="{ borderColor: PET_QUALITY_COLORS[pet.quality] }"
    >
      <div class="card-body p-1">
        <!-- 宠物头部 -->
        <div class="pet-header">
          <div class="pet-avatar">{{ pet.icon }}</div>
          <div class="pet-info">
            <div class="d-flex align-items-center gap-2">
              <span class="pet-name" :style="{ color: PET_QUALITY_COLORS[pet.quality] }">{{ pet.name }}</span>
              <span class="badge" :style="{ background: PET_QUALITY_COLORS[pet.quality] + '22', color: PET_QUALITY_COLORS[pet.quality], border: '1px solid ' + PET_QUALITY_COLORS[pet.quality] + '44' }">
                Lv.{{ pet.level }}
              </span>
            </div>
            <div class="pet-meta">
              <span :style="{ color: PET_QUALITY_COLORS[pet.quality] }">{{ PET_QUALITY_NAMES[pet.quality] }}</span>
              <span class="meta-sep">·</span>
              <span :style="{ color: PET_GROWTH_COLORS[pet.growth] }">{{ PET_GROWTH_NAMES[pet.growth] }}成长</span>
            </div>
          </div>
        </div>

        <!-- HP条 -->
        <div class="bar-row">
          <span class="bar-label">HP</span>
          <ProgressBar
            :current="Math.max(0, Math.floor(pet.currentHp))"
            :max="pet.maxHp"
            variant="hp"
            :height="10"
          />
        </div>

        <!-- Buff图标 -->
        <div v-if="getPetBuffs(pet.id).length > 0" class="buff-icons-row">
          <BuffIcon
            v-for="buff in getPetBuffs(pet.id)"
            :key="buff.id"
            :buff="buff"
            :size="24"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="pet-actions">
          <button class="pet-btn btn-merge" @click="mergePet(pet.id)">合体</button>
          <button class="pet-btn btn-recall" @click="recallPet(pet.id)">收回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pets-battle-area {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.pet-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--easing-default);
  position: relative;
  overflow: hidden;
}

.pet-card.is-dead {
  opacity: 0.5;
}

/* 受击抖动动画 */
.hit-shake {
  animation: hitShake 0.3s ease-out;
}

@keyframes hitShake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-3px); background-color: rgba(239, 68, 68, 0.1); }
  30% { transform: translateX(3px); }
  45% { transform: translateX(-2px); }
  60% { transform: translateX(2px); }
  75% { transform: translateX(-1px); }
}

.pet-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.pet-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
  flex-shrink: 0;
}

.pet-info {
  flex: 1;
  min-width: 0;
}

.pet-name {
  font-weight: 600;
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pet-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  margin-top: 1px;
}

.meta-sep {
  color: var(--text-muted);
}

.pet-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.pet-btn {
  flex: 1;
  font-size: 0.65rem;
  padding: 3px 6px;
  border: 1px solid;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s;
  background: transparent;
}

.btn-merge {
  border-color: rgba(139, 92, 246, 0.3);
  color: #8B5CF6;
}
.btn-merge:hover {
  background: rgba(139, 92, 246, 0.15);
}

.btn-recall {
  border-color: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}
.btn-recall:hover {
  background: rgba(239, 68, 68, 0.1);
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
}

.bar-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #10B981;
  width: 22px;
  flex-shrink: 0;
}

.buff-icons-row {
  display: flex;
  gap: 3px;
  margin-top: 4px;
  flex-wrap: wrap;
  align-items: center;
}
</style>
