<script setup lang="ts">
/**
 * 图鉴面板组件
 * 怪物图鉴：搜索所有怪物属性、掉落
 * 物品图鉴：搜索所有物品信息、产出来源
 */
import { ref, computed } from 'vue'
import { monsterTemplates } from '@/config/monsters'
import { getItemTemplate, itemTemplates, shopItems } from '@/config/shop'
import { getEquipmentTemplate, equipmentTemplates } from '@/config/equipment'
import { alchemyRecipes } from '@/config/alchemy'
import { forgingRecipes } from '@/config/forging'
import {
  Quality, MonsterTitle, Element, ItemType, EquipSlot,
  QUALITY_COLORS, TITLE_COLORS
} from '@/types'
import type { MonsterTemplate, DropEntry, ItemTemplate, EquipmentTemplate } from '@/types'
import { getMapMonsterTemplates, getMonsterTemplate } from '@/config/monsters'
import { getSmallMap, getArea } from '@/config/maps'

const emit = defineEmits<{ close: [] }>()

// ===== 标签页切换 =====
type Tab = 'monster' | 'item'
const activeTab = ref<Tab>('monster')

// ===== 搜索和筛选 =====
const searchText = ref('')
const filterElement = ref<Element | ''>('')
const filterQuality = ref<Quality | ''>('')
const filterItemType = ref<ItemType | ''>('')
const filterLevelMin = ref(1)
const filterLevelMax = ref(50)

/** 元素选项 */
const elementOptions = [
  { value: '', label: '全部元素' },
  { value: Element.Physical, label: '物理', icon: '⚔️' },
  { value: Element.Fire, label: '火焰', icon: '🔥' },
  { value: Element.Ice, label: '冰霜', icon: '❄️' },
  { value: Element.Poison, label: '毒素', icon: '☠️' },
  { value: Element.Lightning, label: '闪电', icon: '⚡' },
]

/** 品质选项 */
const qualityOptions = [
  { value: '', label: '全部品质' },
  { value: Quality.Common, label: '普通', color: QUALITY_COLORS[Quality.Common] },
  { value: Quality.Uncommon, label: '优秀', color: QUALITY_COLORS[Quality.Uncommon] },
  { value: Quality.Rare, label: '稀有', color: QUALITY_COLORS[Quality.Rare] },
  { value: Quality.Epic, label: '史诗', color: QUALITY_COLORS[Quality.Epic] },
  { value: Quality.Legendary, label: '传说', color: QUALITY_COLORS[Quality.Legendary] },
]

/** 物品类型选项 */
const itemTypeOptions = [
  { value: '', label: '全部类型' },
  { value: ItemType.Equipment, label: '装备', icon: '🗡️' },
  { value: ItemType.Potion, label: '药水', icon: '🧪' },
  { value: ItemType.Material, label: '材料', icon: '📦' },
]

// ===== 怪物图鉴 =====
const expandedMonsterId = ref<string | null>(null)

const filteredMonsters = computed(() => {
  return monsterTemplates.filter(m => {
    if (searchText.value && !m.name.includes(searchText.value)) return false
    if (filterElement.value && m.element !== filterElement.value) return false
    if (m.level < filterLevelMin.value || m.level > filterLevelMax.value) return false
    return true
  }).sort((a, b) => a.level - b.level)
})

function toggleMonster(id: string) {
  expandedMonsterId.value = expandedMonsterId.value === id ? null : id
}

/** 获取物品名称 */
function getItemName(itemId: string): string {
  return getItemTemplate(itemId)?.name || getEquipmentTemplate(itemId)?.name || itemId
}

/** 获取物品品质 */
function getItemQuality(itemId: string): Quality | undefined {
  return getItemTemplate(itemId)?.quality || getEquipmentTemplate(itemId)?.baseQuality
}

/** 掉率颜色 */
function dropRateColor(rate: number): string {
  if (rate >= 0.3) return '#22c55e'
  if (rate >= 0.15) return '#3b82f6'
  if (rate >= 0.05) return '#a855f7'
  return '#f59e0b'
}

function formatDropRate(rate: number): string {
  return Math.floor(rate * 100) + '%'
}

function elementIcon(el: Element): string {
  const map: Record<string, string> = {
    [Element.Physical]: '⚔️',
    [Element.Fire]: '🔥',
    [Element.Ice]: '❄️',
    [Element.Poison]: '☠️',
    [Element.Lightning]: '⚡',
  }
  return map[el] || ''
}

function elementName(el: Element): string {
  const map: Record<string, string> = {
    [Element.Physical]: '物理',
    [Element.Fire]: '火焰',
    [Element.Ice]: '冰霜',
    [Element.Poison]: '毒素',
    [Element.Lightning]: '闪电',
  }
  return map[el] || el
}

function slotName(slot: EquipSlot): string {
  const map: Record<string, string> = {
    [EquipSlot.Weapon]: '武器',
    [EquipSlot.Helmet]: '头盔',
    [EquipSlot.Armor]: '铠甲',
    [EquipSlot.Legs]: '护腿',
    [EquipSlot.Boots]: '靴子',
    [EquipSlot.Ring]: '戒指',
    [EquipSlot.Necklace]: '项链',
  }
  return map[slot] || slot
}

function qualityName(q: Quality): string {
  const map: Record<string, string> = {
    [Quality.Common]: '普通',
    [Quality.Uncommon]: '优秀',
    [Quality.Rare]: '稀有',
    [Quality.Epic]: '史诗',
    [Quality.Legendary]: '传说',
  }
  return map[q] || q
}

function itemTypeName(t: ItemType): string {
  const map: Record<string, string> = {
    [ItemType.Equipment]: '装备',
    [ItemType.Potion]: '药水',
    [ItemType.Material]: '材料',
  }
  return map[t] || t
}

/** 默认怪物形象 */
const DEFAULT_MONSTER_IMAGE = '/410b8a30918e18d94699ac150f54a10326742a586ab9a-d7WmO5.png'

/** 获取怪物形象 */
function getMonsterImage(monster: MonsterTemplate): string {
  return monster.image || DEFAULT_MONSTER_IMAGE
}

// ===== 物品图鉴 =====
const expandedItemId = ref<string | null>(null)

interface CodexItem {
  id: string
  name: string
  type: ItemType
  quality: Quality
  description: string
  sellPrice: number
  buyPrice?: number
  maxStack: number
}

/** 合并所有物品（itemTemplates + equipmentTemplates） */
const allItems = computed<CodexItem[]>(() => {
  const items: CodexItem[] = []

  for (const t of itemTemplates) {
    items.push({
      id: t.id,
      name: t.name,
      type: t.type,
      quality: t.quality,
      description: t.description,
      sellPrice: t.sellPrice,
      buyPrice: t.buyPrice,
      maxStack: t.maxStack,
    })
  }

  for (const t of equipmentTemplates) {
    items.push({
      id: t.id,
      name: t.name,
      type: ItemType.Equipment,
      quality: t.baseQuality,
      description: `${slotName(t.slot)} | 需求等级: ${t.levelRequirement || 1}`,
      sellPrice: t.sellPrice,
      maxStack: 1,
    })
  }

  return items
})

const filteredItems = computed(() => {
  return allItems.value.filter(item => {
    if (searchText.value && !item.name.includes(searchText.value)) return false
    if (filterItemType.value && item.type !== filterItemType.value) return false
    if (filterQuality.value && item.quality !== filterQuality.value) return false
    return true
  })
})

/** 查找物品的掉落来源（怪物列表） */
function getItemDropSources(itemId: string): { monster: MonsterTemplate; entry: DropEntry }[] {
  const sources: { monster: MonsterTemplate; entry: DropEntry }[] = []
  for (const mt of monsterTemplates) {
    for (const entry of mt.dropTable) {
      if (entry.itemId === itemId) {
        sources.push({ monster: mt, entry })
      }
    }
  }
  return sources
}

/** 查找物品的获取方式 */
function getItemSources(itemId: string): string[] {
  const sources: string[] = []

  // 掉落来源
  const dropSources = getItemDropSources(itemId)
  if (dropSources.length > 0) {
    for (const src of dropSources.slice(0, 5)) {
      sources.push(`击杀 ${src.monster.name} (Lv.${src.monster.level}) ${formatDropRate(src.entry.dropRate)}`)
    }
    if (dropSources.length > 5) {
      sources.push(`...等 ${dropSources.length} 个怪物`)
    }
  }

  // 炼金/锻造来源
  for (const r of alchemyRecipes) {
    if (r.resultItemId === itemId) {
      sources.push(`炼金制作: ${r.name}`)
    }
  }
  for (const r of forgingRecipes) {
    if (r.resultItemId === itemId) {
      sources.push(`锻造制作: ${r.name}`)
    }
  }

  // 商店来源
  if (shopItems.some(s => s.templateId === itemId)) {
    sources.push('商店购买')
  }

  if (sources.length === 0) {
    sources.push('暂无已知来源')
  }

  return sources
}

function toggleItem(id: string) {
  expandedItemId.value = expandedItemId.value === id ? null : id
}

/** 获取物品品质颜色 */
function getQualityColor(quality: Quality): string {
  return QUALITY_COLORS[quality] || '#fff'
}

/** 获取装备属性 */
function getEquipStats(itemId: string): Record<string, number> {
  const template = getEquipmentTemplate(itemId)
  if (!template) return {}
  return template.baseStats as Record<string, number>
}

/** 格式化属性键名 */
function formatStatKey(key: string): string {
  const map: Record<string, string> = {
    hp: '❤️ HP', mp: '🔵 MP', attack: '⚔️ 攻击',
    defense: '🛡️ 防御', magicAttack: '🔮 魔攻', magicDefense: '🛡️ 魔防',
    speed: '💨 速度', critRate: '💥 暴击率%', critDamage: '💥 暴伤',
    dodge: '🎭 闪避率%', hitRate: '🎯 命中率%',
  }
  return map[key] || key
}

/** 重置筛选条件 */
function resetFilters() {
  searchText.value = ''
  filterElement.value = ''
  filterQuality.value = ''
  filterItemType.value = ''
  filterLevelMin.value = 1
  filterLevelMax.value = 50
  expandedMonsterId.value = null
  expandedItemId.value = null
}
</script>

<template>
  <div class="codex-panel h-100 d-flex flex-column">
    <!-- 标题栏 -->
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h5 class="mb-0">图鉴</h5>
      <button class="btn btn-sm btn-outline-secondary" @click="emit('close')">
        &times;
      </button>
    </div>

    <!-- 标签切换 -->
    <div class="nav nav-tabs mb-2" style="font-size: 0.85rem;">
      <button
        class="nav-link"
        :class="{ active: activeTab === 'monster' }"
        @click="activeTab = 'monster'; resetFilters()"
      >
        👾 怪物 ({{ monsterTemplates.length }})
      </button>
      <button
        class="nav-link"
        :class="{ active: activeTab === 'item' }"
        @click="activeTab = 'item'; resetFilters()"
      >
        📦 物品 ({{ allItems.length }})
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar p-2 rounded mb-2" style="background-color: var(--bg-secondary, #f0f0f0);">
      <div class="row g-2 align-items-center">
        <!-- 搜索 -->
        <div class="col-12 col-sm-4">
          <input
            v-model="searchText"
            type="text"
            class="form-control form-control-sm"
            placeholder="搜索名称..."
          />
        </div>

        <!-- 元素筛选（怪物） -->
        <div v-if="activeTab === 'monster'" class="col-6 col-sm-3">
          <select v-model="filterElement" class="form-select form-select-sm">
            <option
              v-for="opt in elementOptions"
              :key="opt.value"
              :value="opt.value"
            >{{ opt.icon }} {{ opt.label }}</option>
          </select>
        </div>

        <!-- 物品类型筛选（物品） -->
        <div v-if="activeTab === 'item'" class="col-6 col-sm-3">
          <select v-model="filterItemType" class="form-select form-select-sm">
            <option
              v-for="opt in itemTypeOptions"
              :key="opt.value"
              :value="opt.value"
            >{{ opt.icon }} {{ opt.label }}</option>
          </select>
        </div>

        <!-- 品质筛选 -->
        <div v-if="activeTab === 'item'" class="col-6 col-sm-3">
          <select v-model="filterQuality" class="form-select form-select-sm">
            <option
              v-for="opt in qualityOptions"
              :key="opt.value"
              :value="opt.value"
            >{{ opt.label }}</option>
          </select>
        </div>

        <!-- 等级筛选（怪物） -->
        <div v-if="activeTab === 'monster'" class="col-6 col-sm-2">
          <div class="input-group input-group-sm">
            <span class="input-group-text">Lv</span>
            <input v-model.number="filterLevelMin" type="number" class="form-control" style="width: 50px;" min="1" />
            <input v-model.number="filterLevelMax" type="number" class="form-control" style="width: 50px;" min="1" />
          </div>
        </div>
      </div>
      <div class="text-muted mt-1" style="font-size: 0.7rem;">
        共 {{ activeTab === 'monster' ? filteredMonsters.length : filteredItems.length }} 条结果
      </div>
    </div>

    <!-- 列表区域 -->
    <div class="flex-grow-1 overflow-auto">
      <!-- 怪物图鉴 -->
      <div v-if="activeTab === 'monster'" class="codex-list">
        <div
          v-for="m in filteredMonsters"
          :key="m.id"
          class="codex-item mb-2"
          :class="{ expanded: expandedMonsterId === m.id }"
        >
          <!-- 怪物摘要行 -->
          <div
            class="codex-header p-2 rounded"
            style="cursor: pointer; background-color: var(--bg-card);"
            @click="toggleMonster(m.id)"
          >
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <img :src="getMonsterImage(m)" :alt="m.name" style="width: 32px; height: 32px; object-fit: contain; border-radius: var(--radius-sm); border: 1px solid var(--border-color-light);" />
                <div>
                  <span class="fw-bold">{{ m.name }}</span>
                  <span class="text-muted ms-1" style="font-size: 0.75rem;">Lv.{{ m.level }}</span>
                  <!-- <span class="ms-1" style="font-size: 0.65rem;">
                    <span class="text-warning">★精英×{{ m.eliteMultiplier }}</span>
                    <span class="text-danger ms-1">★领主×{{ m.lordMultiplier }}</span>
                  </span> -->
                </div>
              </div>
              <span style="font-size: 0.7rem;">{{ expandedMonsterId === m.id ? '▲' : '▼' }}</span>
            </div>
          </div>

          <!-- 怪物详情 -->
          <div v-if="expandedMonsterId === m.id" class="codex-detail p-2 mt-1 rounded border">
            <!-- 属性 -->
            <div class="mb-2">
              <div class="small fw-bold mb-1">基础属性</div>
              <div class="row" style="font-size: 0.75rem;">
                <div class="col-4">❤️ HP: {{ Math.floor(m.baseStats.hp) }}</div>
                <div class="col-4">🔵 MP: {{ Math.floor(m.baseStats.mp) }}</div>
                <div class="col-4">⚔️ 攻击: {{ Math.floor(m.baseStats.attack) }}</div>
                <div class="col-4">🛡️ 防御: {{ Math.floor(m.baseStats.defense) }}</div>
                <div class="col-4">🔮 魔攻: {{ Math.floor(m.baseStats.magicAttack) }}</div>
                <div class="col-4">🛡️ 魔防: {{ Math.floor(m.baseStats.magicDefense) }}</div>
                <div class="col-4">💨 速度: {{ Math.floor(m.baseStats.speed) }}</div>
                <div class="col-4">💥 暴击: {{ Math.floor(m.baseStats.critRate * 100) }}%</div>
                <div class="col-4">🎭 闪避: {{ Math.floor(m.baseStats.dodge * 100) }}%</div>
              </div>
            </div>

            <!-- 奖励 -->
            <div class="mb-2">
              <div class="small fw-bold mb-1">击杀奖励</div>
              <div class="row" style="font-size: 0.75rem;">
                <div class="col-6">EXP: {{ Math.floor(m.baseStats.expReward) }}</div>
                <div class="col-6">金币: {{ Math.floor(m.baseStats.goldReward) }}</div>
              </div>
            </div>

            <!-- 技能 -->
            <div class="mb-2">
              <div class="small fw-bold mb-1">技能</div>
              <div style="font-size: 0.75rem;">
                <div class="me-2">普通: {{ m.normalSkills.join(', ') }}</div>
                <div class="me-2 text-warning">精英: {{ m.eliteSkills.join(', ') }}</div>
                <div class="text-danger">领主: {{ m.lordSkills.join(', ') }}</div>
              </div>
            </div>

            <!-- 掉落表 -->
            <div>
              <div class="small fw-bold mb-1">掉落物品 ({{ m.dropTable.length }})</div>
              <div v-for="(drop, di) in m.dropTable" :key="di" class="d-flex align-items-center mb-1" style="font-size: 0.75rem;">
                <span
                  class="me-2 fw-bold"
                  :style="{ color: dropRateColor(drop.dropRate), minWidth: '40px', textAlign: 'right' }"
                >{{ formatDropRate(drop.dropRate) }}</span>
                <span :style="{ color: getQualityColor(getItemQuality(drop.itemId) || Quality.Common) }">
                  {{ getItemName(drop.itemId) }}
                </span>
                <span v-if="drop.minQuantity > 1 || drop.maxQuantity > 1" class="text-muted ms-1">
                  ({{ drop.minQuantity }}-{{ drop.maxQuantity }})
                </span>
                <span
                  v-if="drop.titleRestriction?.length"
                  class="ms-1 badge bg-warning text-dark"
                  style="font-size: 0.55rem;"
                >
                  {{ drop.titleRestriction.map(t => t === MonsterTitle.Elite ? '精英' : '领主').join('/') }}
                </span>
              </div>
              <div v-if="!m.dropTable.length" class="text-muted" style="font-size: 0.75rem;">无掉落</div>
            </div>
          </div>
        </div>
        <div v-if="!filteredMonsters.length" class="text-center text-muted py-4">
          未找到匹配的怪物
        </div>
      </div>

      <!-- 物品图鉴 -->
      <div v-if="activeTab === 'item'" class="codex-list">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="codex-item mb-2"
          :class="{ expanded: expandedItemId === item.id }"
        >
          <!-- 物品摘要行 -->
          <div
            class="codex-header p-2 rounded"
            style="cursor: pointer; background-color: var(--bg-card);"
            @click="toggleItem(item.id)"
          >
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <span>{{ item.type === ItemType.Equipment ? '🗡️' : item.type === ItemType.Potion ? '🧪' : '📦' }}</span>
                <span class="fw-bold" :style="{ color: getQualityColor(item.quality) }">{{ item.name }}</span>
                <span class="badge" style="font-size: 0.55rem;" :style="{ backgroundColor: getQualityColor(item.quality) + '22', color: getQualityColor(item.quality), border: '1px solid ' + getQualityColor(item.quality) }">
                  {{ qualityName(item.quality) }}
                </span>
              </div>
              <span style="font-size: 0.7rem;">{{ expandedItemId === item.id ? '▲' : '▼' }}</span>
            </div>
          </div>

          <!-- 物品详情 -->
          <div v-if="expandedItemId === item.id" class="codex-detail p-2 mt-1 rounded border">
            <div class="mb-2" style="font-size: 0.75rem;">
              <span class="text-muted">类型: {{ itemTypeName(item.type) }}</span>
              <span v-if="item.maxStack > 1" class="text-muted ms-2">堆叠: {{ item.maxStack }}</span>
            </div>
            <div class="mb-2" style="font-size: 0.75rem;">
              <span class="text-muted">描述: {{ item.description }}</span>
            </div>
            <div class="mb-2" style="font-size: 0.75rem;">
              <span class="text-muted">售价: {{ item.sellPrice }} 金币</span>
              <span v-if="item.buyPrice" class="text-muted ms-2">购买: {{ item.buyPrice }} 金币</span>
            </div>

            <!-- 装备属性 -->
            <div v-if="item.type === ItemType.Equipment" class="mb-2">
              <div class="small fw-bold mb-1">装备属性</div>
              <div style="font-size: 0.75rem;">
                <template v-for="(val, key) in getEquipStats(item.id)" :key="key">
                  <span class="me-2">{{ formatStatKey(key as string) }}: +{{ Math.floor(val as number) }}</span>
                </template>
              </div>
            </div>

            <!-- 产出来源 -->
            <div>
              <div class="small fw-bold mb-1">获取方式</div>
              <div
                v-for="(src, si) in getItemSources(item.id)"
                :key="si"
                class="mb-1"
                style="font-size: 0.75rem;"
              >
                <span class="text-muted">• {{ src }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!filteredItems.length" class="text-center text-muted py-4">
          未找到匹配的物品
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.codex-panel {
  font-size: var(--text-sm);
}

.codex-item {
  border-left: 2px solid transparent;
  transition: all var(--duration-normal) var(--easing-default);
  background-color: var(--bg-card);
  border-radius: var(--radius-md);
}

.codex-item.expanded {
  border-left-color: var(--accent-primary);
  background-color: var(--bg-secondary);
}

.codex-header:hover {
  background-color: var(--bg-hover);
}

.codex-detail {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
}

.nav-link {
  cursor: pointer;
  font-size: var(--text-sm);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 2px solid transparent;
  transition: all var(--duration-fast) var(--easing-default);
}

.nav-link:hover {
  color: var(--accent-primary);
}

.nav-link.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.filter-bar {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}
</style>
