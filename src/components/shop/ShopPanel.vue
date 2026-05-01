<script setup lang="ts">
/**
 * 商店面板组件
 * 集成 ShopItem 组件、shopStore 回购功能
 */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '@/stores/playerStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useShopStore } from '@/stores/shopStore'
import { useGameStore } from '@/stores/gameStore'
import { shopItems, getItemTemplate, getShopItemPrice } from '@/config/shop'
import ShopItem from './ShopItem.vue'
import QualityBadge from '@/components/common/QualityBadge.vue'
import { ItemType } from '@/types'

const { t } = useI18n()
const playerStore = usePlayerStore()
const inventoryStore = useInventoryStore()
const shopStore = useShopStore()
const gameStore = useGameStore()

const emit = defineEmits<{
  'close': []
}>()

type ShopTab = 'buy' | 'sell' | 'buyback'
const currentTab = ref<ShopTab>('buy')

const playerGold = computed(() => playerStore.player?.gold || 0)

/** 商店出售的商品列表 */
const shopItemsList = computed(() => {
  return shopItems.map(shopItem => {
    const template = getItemTemplate(shopItem.templateId)
    if (!template) return null

    return {
      id: `shop_${Date.now()}_${shopItem.templateId}`,
      templateId: template.id,
      name: template.name,
      type: template.type,
      quality: template.quality,
      quantity: 1,
      maxStack: template.maxStack,
      description: template.description,
      useEffect: template.useEffect,
      sellPrice: template.sellPrice
    }
  }).filter(Boolean)
})

/** 购买商品 */
function handleBuy(item: any, price: number) {
  const template = getItemTemplate(item.templateId)
  if (!template) return

  if (playerStore.deductGold(price)) {
    inventoryStore.addItem({
      id: `item_${Date.now()}`,
      templateId: template.id,
      name: template.name,
      type: template.type,
      quality: template.quality,
      quantity: 1,
      maxStack: template.maxStack,
      description: template.description,
      useEffect: template.useEffect,
      sellPrice: template.sellPrice
    })
    gameStore.addLog({ type: 'system', content: `购买了 ${template.name}，花费 ${price} 金币` })
  }
}

/** 出售背包物品 */
function handleSell(itemId: string) {
  const gold = shopStore.sellItem(itemId)
  if (gold > 0) {
    gameStore.addLog({ type: 'system', content: `出售物品，获得 ${gold} 金币` })
  }
}

/** 回购物品 */
function handleBuyback(index: number) {
  if (shopStore.buyback(index)) {
    gameStore.addLog({ type: 'system', content: '成功回购物品' })
  }
}
</script>

<template>
  <div class="shop-panel h-100 d-flex flex-column">
    <!-- 标签页 -->
    <div class="btn-group mb-3">
      <button
        class="btn btn-sm"
        :class="currentTab === 'buy' ? 'btn-primary' : 'btn-outline-secondary'"
        @click="currentTab = 'buy'"
      >
        💰 {{ t('shop.buy') || '购买' }}
      </button>
      <button
        class="btn btn-sm"
        :class="currentTab === 'sell' ? 'btn-primary' : 'btn-outline-secondary'"
        @click="currentTab = 'sell'"
      >
        🔄 {{ t('shop.sell') || '出售' }}
      </button>
      <button
        class="btn btn-sm position-relative"
        :class="currentTab === 'buyback' ? 'btn-primary' : 'btn-outline-secondary'"
        @click="currentTab = 'buyback'"
      >
        📦 回购
        <span v-if="shopStore.buybackCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;">
          {{ shopStore.buybackCount }}
        </span>
      </button>
    </div>

    <!-- 金币 -->
    <div class="small text-warning mb-2">
      💰 {{ playerGold.toLocaleString() }} 金币
    </div>

    <!-- 商品列表 -->
    <div class="shop-list flex-grow-1 overflow-auto">
      <!-- 购买 -->
      <div v-if="currentTab === 'buy'">
        <div v-for="item in shopItemsList" :key="item?.templateId" class="shop-item-row">
          <ShopItem :item="item" :price="getShopItemPrice(item?.templateId || '', true)" @buy="handleBuy" />
        </div>
        <div v-if="shopItemsList.length === 0" class="text-center text-muted py-4">
          暂无商品
        </div>
      </div>

      <!-- 出售 -->
      <div v-else-if="currentTab === 'sell'">
        <div v-for="item in inventoryStore.items" :key="item.id" class="shop-item-row">
          <div class="d-flex align-items-center p-2 border-bottom">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-1">
                <QualityBadge :quality="item.quality" />
                <span class="fw-semibold small">{{ item.name }}</span>
                <span v-if="item.quantity > 1" class="text-muted small">x{{ item.quantity }}</span>
              </div>
            </div>
            <button class="btn btn-sm btn-warning ms-2" @click="handleSell(item.id)">
              {{ item.sellPrice || 0 }} G
            </button>
          </div>
        </div>
        <div v-if="inventoryStore.items.length === 0" class="text-center text-muted py-4">
          背包为空
        </div>
      </div>

      <!-- 回购 -->
      <div v-else>
        <div v-for="(item, idx) in shopStore.buybackList" :key="idx" class="shop-item-row">
          <div class="d-flex align-items-center p-2 border-bottom">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-1">
                <QualityBadge :quality="item.quality" />
                <span class="fw-semibold small">{{ item.name }}</span>
              </div>
            </div>
            <button
              class="btn btn-sm btn-info ms-2"
              :disabled="playerGold < item.buybackPrice"
              @click="handleBuyback(idx)"
            >
              {{ item.buybackPrice }} G
            </button>
          </div>
        </div>
        <div v-if="shopStore.buybackCount === 0" class="text-center text-muted py-4">
          回购列表为空
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-item-row {
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color-light);
}
</style>
