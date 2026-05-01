<script setup lang="ts">
/**
 * 账号选择/创建弹窗组件
 * 显示已有角色列表，支持切换/新建/删除
 */
import { ref, computed } from 'vue'
import { useAccountStore } from '@/stores/accountStore'
import { CharacterClass } from '@/types'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'select': [accountId: string]
  'create-new': []
}>()

const accountStore = useAccountStore()

/** 新角色名称 */
const newCharName = ref('')
/** 新角色职业 */
const newCharClass = ref<CharacterClass | null>(null)
/** 是否显示创建表单 */
const showCreateForm = ref(false)

const classes = [
  { id: CharacterClass.Warrior, name: '战士', desc: '高生命高防御', icon: '⚔️' },
  { id: CharacterClass.Mage, name: '法师', desc: '高魔攻多技能', icon: '🔮' },
  { id: CharacterClass.Ranger, name: '游侠', desc: '高暴击高闪避', icon: '🏹' }
]

function classIcon(cls?: string) {
  if (cls === 'warrior') return '⚔️'
  if (cls === 'mage') return '🔮'
  return '🏹'
}

function className(cls?: string) {
  const map: Record<string, string> = { warrior: '战士', mage: '法师', ranger: '游侠' }
  return map[cls || ''] || '未知'
}

/** 选择账号 */
function handleSelect(accountId: string) {
  emit('select', accountId)
  emit('update:modelValue', false)
}

/** 开始创建新角色 */
function startCreate() {
  newCharName.value = ''
  newCharClass.value = null
  showCreateForm.value = true
}

/** 取消创建 */
function cancelCreate() {
  showCreateForm.value = false
  newCharName.value = ''
  newCharClass.value = null
}

/** 确认创建 */
function handleCreate() {
  if (!newCharName.value.trim() || !newCharClass.value) return
  const account = accountStore.createAccount({
    name: newCharName.value.trim(),
    class: newCharClass.value
  })
  emit('select', account.id)
  emit('update:modelValue', false)
  showCreateForm.value = false
}

/** 删除账号 */
function handleDelete(accountId: string, event: Event) {
  event.stopPropagation()
  const acc = accountStore.accounts.find(a => a.id === accountId)
  if (!acc) return
  if (confirm(`确定要删除角色「${acc.name}」吗？此操作不可恢复！`)) {
    accountStore.deleteAccount(accountId)
  }
}

const canCreate = computed(() => {
  return newCharName.value.trim().length > 0 && newCharClass.value !== null
})

/** 格式化时间 */
function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="account-modal-overlay" @click.self="emit('update:modelValue', false)">
      <div class="account-modal">
        <!-- 头部 -->
        <div class="modal-header">
          <h5 v-if="!showCreateForm">选择角色</h5>
          <h5 v-else>创建新角色</h5>
          <button class="btn-close" @click="showCreateForm ? cancelCreate() : emit('update:modelValue', false)"></button>
        </div>

        <!-- 角色列表 -->
        <div v-if="!showCreateForm" class="modal-body">
          <!-- 已有账号列表 -->
          <div v-if="accountStore.accounts.length > 0" class="account-list">
            <div
              v-for="acc in accountStore.accounts"
              :key="acc.id"
              class="account-card"
              :class="{ active: acc.id === accountStore.currentAccountId }"
              @click="handleSelect(acc.id)"
            >
              <div class="account-avatar">{{ classIcon(acc.characterClass) }}</div>
              <div class="account-info">
                <div class="account-name-row">
                  <span class="account-name">{{ acc.name }}</span>
                  <span class="account-badge">Lv.{{ acc.level }}</span>
                  <span v-if="acc.id === accountStore.currentAccountId" class="current-tag">当前</span>
                </div>
                <div class="account-meta">
                  {{ className(acc.characterClass) }} · 最后游玩 {{ formatTime(acc.lastPlayedAt) }}
                </div>
              </div>
              <button class="btn-delete" @click="handleDelete(acc.id, $event)" title="删除角色">×</button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <p class="text-muted">还没有角色，快来创建一个吧！</p>
          </div>

          <!-- 创建按钮 -->
          <button class="btn-create-new" @click="startCreate">
            + 创建新角色
          </button>
        </div>

        <!-- 创建表单 -->
        <div v-else class="modal-body create-form">
          <div class="form-group mb-3">
            <label class="form-label">角色名称</label>
            <input
              type="text"
              class="form-control"
              v-model="newCharName"
              maxlength="12"
              placeholder="输入角色名称"
              @keyup.enter="canCreate && handleCreate()"
            />
          </div>

          <div class="form-group mb-3">
            <label class="form-label">选择职业</label>
            <div class="class-cards">
              <div
                v-for="cls in classes"
                :key="cls.id"
                class="class-card-item"
                :class="{ selected: newCharClass === cls.id }"
                @click="newCharClass = cls.id"
              >
                <span class="class-icon-lg">{{ cls.icon }}</span>
                <span class="class-name">{{ cls.name }}</span>
                <span class="class-desc">{{ cls.desc }}</span>
              </div>
            </div>
          </div>

          <div class="create-actions">
            <button class="btn btn-outline-secondary btn-sm me-2" @click="cancelCreate">取消</button>
            <button class="btn btn-primary btn-sm" :disabled="!canCreate" @click="handleCreate">
              开始游戏
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.account-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.account-modal {
  background-color: var(--bg-card, #1a1a2e);
  border: 1px solid var(--border-color, rgba(255,255,255,0.1));
  border-radius: 16px;
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
}

.modal-header h5 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary, #fff);
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

/* 账号卡片 */
.account-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.account-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--bg-secondary, rgba(255,255,255,0.04));
  border: 1px solid var(--border-color, rgba(255,255,255,0.08));
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.account-card:hover {
  background-color: rgba(139, 92, 246, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
}

.account-card.active {
  background-color: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.15);
}

.account-avatar {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: var(--bg-tertiary, rgba(255,255,255,0.06));
  border-radius: 10px;
  flex-shrink: 0;
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.account-name {
  font-weight: 600;
  color: var(--text-primary, #fff);
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent-primary, #A78BFA);
  background-color: rgba(139, 92, 246, 0.15);
  padding: 1px 6px;
  border-radius: 8px;
  flex-shrink: 0;
}

.current-tag {
  font-size: 0.65rem;
  font-weight: 600;
  color: #22C55E;
  background-color: rgba(34, 197, 94, 0.15);
  padding: 1px 6px;
  border-radius: 8px;
  flex-shrink: 0;
}

.account-meta {
  font-size: 0.75rem;
  color: var(--text-muted, #888);
  margin-top: 2px;
}

.btn-delete {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: var(--text-muted, #888);
  font-size: 1.1rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.btn-delete:hover {
  background-color: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.empty-state {
  text-align: center;
  padding: 32px 0;
  margin-bottom: 16px;
}

.btn-create-new {
  width: 100%;
  padding: 10px;
  border: 2px dashed var(--border-color, rgba(255,255,255,0.15));
  border-radius: 10px;
  background-color: transparent;
  color: var(--accent-primary, #A78BFA);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-new:hover {
  border-color: var(--accent-primary, #A78BFA);
  background-color: rgba(139, 92, 246, 0.08);
}

/* 创建表单 */
.create-form .form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary, #ccc);
  margin-bottom: 6px;
}

.create-form .form-control {
  background-color: var(--bg-secondary, rgba(255,255,255,0.04));
  border: 1px solid var(--border-color, rgba(255,255,255,0.1));
  color: var(--text-primary, #fff);
  border-radius: 8px;
}

.create-form .form-control:focus {
  border-color: var(--accent-primary, #A78BFA);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}

.class-cards {
  display: flex;
  gap: 8px;
}

.class-card-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid var(--border-color, rgba(255,255,255,0.08));
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--bg-secondary, rgba(255,255,255,0.03));
}

.class-card-item:hover {
  border-color: rgba(139, 92, 246, 0.4);
  background-color: rgba(139, 92, 246, 0.06);
}

.class-card-item.selected {
  border-color: var(--accent-primary, #A78BFA);
  background-color: rgba(139, 92, 246, 0.12);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.15);
}

.class-icon-lg {
  font-size: 1.8rem;
}

.class-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary, #fff);
}

.class-desc {
  font-size: 0.65rem;
  color: var(--text-muted, #888);
}

.create-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, rgba(255,255,255,0.08));
}
</style>
