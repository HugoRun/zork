<script setup lang="ts">
/**
 * 制作系统面板
 * 整合炼金、锻造、附魔三个子系统
 */
import { ref, computed, onMounted } from 'vue'
import { useCraftingStore } from '@/stores/craftingStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { usePlayerStore } from '@/stores/playerStore'
import { getItemTemplate } from '@/config/shop'
import { getEquipmentTemplate } from '@/config/equipment'
import type { CraftRecipe } from '@/types'
import { Quality, QUALITY_MAX_ENCHANTS } from '@/types'

const emit = defineEmits<{ 'close': [] }>()

const craftingStore = useCraftingStore()
const inventoryStore = useInventoryStore()
const playerStore = usePlayerStore()

// 初始化基础图纸
onMounted(() => {
  craftingStore.initBlueprints()
})

/** 当前子标签 */
const subTab = ref<'alchemy' | 'forging' | 'enchant'>('alchemy')

/** 制作结果消息 */
const craftMessage = ref<{ success: boolean; text: string } | null>(null)

/** ===== 炼金/锻造通用逻辑 ===== */

const currentCraftTab = computed(() =>
  subTab.value === 'alchemy' ? craftingStore.learnedAlchemyRecipes : craftingStore.learnedForgingRecipes
)

/** 获取材料名称 */
function getMatName(templateId: string): string {
  return getItemTemplate(templateId)?.name || templateId
}

/** 获取材料拥有数量 */
function getMatCount(templateId: string): number {
  return inventoryStore.getItemCount(templateId)
}

/** 材料是否足够 */
function hasEnough(recipe: CraftRecipe): boolean {
  return recipe.materials.every(m => getMatCount(m.templateId) >= m.quantity)
}

/** 执行制作 */
function doCraft(recipe: CraftRecipe) {
  const result = craftingStore.craft(recipe)
  craftMessage.value = { success: result.success, text: result.message }
  setTimeout(() => { craftMessage.value = null }, 3000)
}

/** ===== 图纸学习 ===== */

function doLearnBlueprint(bpId: string) {
  const result = craftingStore.learnBlueprint(bpId)
  craftMessage.value = { success: result.success, text: result.message }
  setTimeout(() => { craftMessage.value = null }, 3000)
}

/** ===== 附魔逻辑 ===== */

/** 背包中可附魔的装备列表 */
const enchantableItems = computed(() =>
  (inventoryStore.items || []).filter(item => {
    const tpl = getEquipmentTemplate(item.templateId)
    return tpl && item.quality !== Quality.Common || getEquipmentTemplate(item.templateId)
  }).filter(item => {
    const tpl = getEquipmentTemplate(item.templateId)
    if (!tpl) return false
    const ench = craftingStore.getEquipmentEnchant(item.id)
    const max = QUALITY_MAX_ENCHANTS[item.quality as Quality]
    return !ench || ench.enchantCount < max
  })
)

/** 选中的附魔装备 */
const selectedEnchantItem = ref<string | null>(null)

const enchantCheck = computed(() => {
  if (!selectedEnchantItem.value) return null
  const check = craftingStore.canEnchant(selectedEnchantItem.value)
  return check
})

function doEnchant() {
  if (!selectedEnchantItem.value) return
  const result = craftingStore.enchant(selectedEnchantItem.value)
  craftMessage.value = { success: result.success, text: result.message }
  setTimeout(() => { craftMessage.value = null }, 3000)
}
</script>

<template>
  <div class="crafting-panel">
    <!-- 子标签 -->
    <div class="d-flex gap-2 mb-3">
      <button
        class="btn btn-sm flex-grow-1"
        :class="subTab === 'alchemy' ? 'btn-success' : 'btn-outline-secondary'"
        @click="subTab = 'alchemy'"
      >🧪 炼金</button>
      <button
        class="btn btn-sm flex-grow-1"
        :class="subTab === 'forging' ? 'btn-warning' : 'btn-outline-secondary'"
        @click="subTab = 'forging'"
      >🔨 锻造</button>
      <button
        class="btn btn-sm flex-grow-1"
        :class="subTab === 'enchant' ? 'btn-primary' : 'btn-outline-secondary'"
        @click="subTab = 'enchant'"
      >✨ 附魔</button>
    </div>

    <!-- 消息提示 -->
    <div v-if="craftMessage" class="alert mb-3 py-2" :class="craftMessage.success ? 'alert-success' : 'alert-danger'" style="font-size: 0.8rem;">
      {{ craftMessage.text }}
    </div>

    <!-- ===== 炼金/锻造 ===== -->
    <template v-if="subTab === 'alchemy' || subTab === 'forging'">
      <!-- 图纸学习 -->
      <div v-if="(subTab === 'alchemy' ? craftingStore.availableAlchemyBlueprints : craftingStore.availableForgingBlueprints).length > 0" class="mb-3">
        <h6 class="small fw-bold mb-2">📚 可学习图纸</h6>
        <div
          v-for="bp in (subTab === 'alchemy' ? craftingStore.availableAlchemyBlueprints : craftingStore.availableForgingBlueprints)"
          :key="bp.id"
          class="card mb-2"
          style="font-size: 0.8rem;"
        >
          <div class="card-body p-2 d-flex justify-content-between align-items-center">
            <div>
              <span class="fw-bold">{{ bp.name }}</span>
              <small class="text-muted ms-1">（Lv.{{ bp.levelRequirement }}）</small>
              <div class="text-muted" style="font-size: 0.7rem;">{{ bp.description }} · {{ bp.source }}</div>
            </div>
            <button
              class="btn btn-sm btn-outline-primary"
              :disabled="!playerStore.player || playerStore.player.level < bp.levelRequirement"
              style="font-size: 0.7rem; white-space: nowrap;"
              @click="doLearnBlueprint(bp.id)"
            >
              学习
            </button>
          </div>
        </div>
      </div>

      <!-- 配方列表 -->
      <h6 class="small fw-bold mb-2">
        {{ subTab === 'alchemy' ? '🧪 炼金配方' : '🔨 锻造配方' }}
        <span class="text-muted">（{{ currentCraftTab.length }}）</span>
      </h6>

      <div v-if="currentCraftTab.length === 0" class="text-center text-muted py-3 small">
        暂无可用配方，请先学习图纸
      </div>

      <div
        v-for="recipe in currentCraftTab"
        :key="recipe.id"
        class="card mb-2"
        style="font-size: 0.8rem;"
      >
        <div class="card-body p-2">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <div>
              <span class="fw-bold">{{ recipe.name }}</span>
              <small class="text-muted ms-1">（Lv.{{ recipe.levelRequirement }}）</small>
              <div class="text-muted" style="font-size: 0.7rem;">{{ recipe.description }}</div>
              <div v-if="recipe.successRate < 1" class="text-warning" style="font-size: 0.7rem;">
                成功率: {{ Math.floor(recipe.successRate * 100) }}%
              </div>
            </div>
            <span class="badge bg-secondary">{{ recipe.outputQuantity }}x</span>
          </div>

          <!-- 材料列表 -->
          <div class="small mb-2">
            <div
              v-for="mat in recipe.materials"
              :key="mat.templateId"
              class="d-flex justify-content-between"
              :class="{ 'text-danger': getMatCount(mat.templateId) < mat.quantity }"
            >
              <span>{{ getMatName(mat.templateId) }}</span>
              <span>{{ getMatCount(mat.templateId) }}/{{ mat.quantity }}</span>
            </div>
            <div class="d-flex justify-content-between text-warning">
              <span>💰 金币</span>
              <span>{{ (playerStore.player?.gold || 0) }}/{{ recipe.goldCost }}</span>
            </div>
          </div>

          <!-- 制作按钮 -->
          <button
            class="btn btn-sm w-100"
            :class="hasEnough(recipe) && (playerStore.player?.gold || 0) >= recipe.goldCost
              ? (subTab === 'alchemy' ? 'btn-success' : 'btn-warning')
              : 'btn-outline-secondary disabled'"
            @click="doCraft(recipe)"
          >
            {{ subTab === 'alchemy' ? '🧪 炼制' : '🔨 锻造' }}
          </button>
        </div>
      </div>
    </template>

    <!-- ===== 附魔 ===== -->
    <template v-if="subTab === 'enchant'">
      <div class="mb-3">
        <h6 class="small fw-bold mb-2">📊 选择要附魔的装备</h6>

        <div v-if="enchantableItems.length === 0" class="text-center text-muted py-3 small">
          背包中没有可附魔的装备
        </div>

        <div
          v-for="item in enchantableItems"
          :key="item.id"
          class="card mb-1"
          :class="{ 'border-primary': selectedEnchantItem === item.id }"
          style="font-size: 0.8rem; cursor: pointer;"
          @click="selectedEnchantItem = item.id"
        >
          <div class="card-body p-2 d-flex justify-content-between align-items-center">
            <div>
              <span class="fw-bold">{{ item.name }}</span>
              <div class="text-muted" style="font-size: 0.7rem;">
                {{ item.description }}
              </div>
            </div>
            <div>
              <span
                v-if="craftingStore.getEquipmentEnchant(item.id)"
                class="badge bg-info"
              >
                +{{ craftingStore.getEquipmentEnchant(item.id)!.enchantCount }}/{{ QUALITY_MAX_ENCHANTS[item.quality as Quality] }}
              </span>
              <span v-else class="badge bg-secondary">未附魔</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 附魔详情 -->
      <div v-if="selectedEnchantItem" class="card">
        <div class="card-body p-2">
          <h6 class="small fw-bold mb-2">✨ 强化信息</h6>

          <div v-if="enchantCheck && !enchantCheck.can" class="text-danger small mb-2">
            {{ enchantCheck.reason }}
          </div>

          <div v-if="enchantCheck && enchantCheck.can" class="mb-2 small">
            <div class="text-muted">强化将随机获得一条属性词条</div>
            <div class="text-success" style="font-size: 0.7rem;">
              成功率: {{ Math.floor(craftingStore.canEnchant(selectedEnchantItem).can ? 100 : 0) }}%
            </div>
          </div>

          <button
            class="btn btn-sm btn-primary w-100"
            :disabled="!enchantCheck || !enchantCheck.can"
            @click="doEnchant"
          >
            ✨ 附魔强化
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.crafting-panel {
  max-height: 70vh;
  overflow-y: auto;
}

.crafting-panel .card {
  margin-bottom: var(--space-sm);
}
</style>
