<script setup lang="ts">
/**
 * 存档管理组件
 */
import { ref } from 'vue'
import { useSave } from '@/composables/useSave'
import { usePlayerStore } from '@/stores/playerStore'

const { exportSave, importSave, resetAllData, getSaveInfo, hasSaveData } = useSave()
const playerStore = usePlayerStore()

const importResult = ref<string | null>(null)

/** 导出存档 */
function handleExport() {
  exportSave()
}

/** 导入存档 */
async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const success = await importSave(file)
  importResult.value = success ? '存档导入成功！' : '存档导入失败，请检查文件格式。'

  setTimeout(() => {
    importResult.value = null
  }, 3000)

  // 重置文件输入
  target.value = ''
}

/** 重置数据 */
function handleReset() {
  if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
    resetAllData()
    window.location.reload()
  }
}

/** 存档信息 */
const saveInfo = getSaveInfo()
</script>

<template>
  <div class="save-manager">
    <h6 class="mb-3">存档管理</h6>

    <!-- 存档信息 -->
    <div v-if="hasSaveData() && saveInfo" class="card mb-3 p-2 small">
      <div class="d-flex justify-content-between">
        <span>角色: {{ saveInfo.playerName }}</span>
        <span>等级: {{ saveInfo.level }}</span>
      </div>
      <div class="text-muted mt-1">版本: {{ saveInfo.version }} · {{ saveInfo.lastSave }}</div>
    </div>

    <!-- 操作按钮 -->
    <div class="d-grid gap-2">
      <button class="btn btn-sm btn-outline-primary" @click="handleExport">
        导出存档
      </button>

      <label class="btn btn-sm btn-outline-secondary mb-0">
        导入存档
        <input type="file" accept=".json" class="d-none" @change="handleImport" />
      </label>

      <button class="btn btn-sm btn-outline-danger" @click="handleReset">
        重置数据
      </button>
    </div>

    <!-- 导入结果提示 -->
    <div v-if="importResult" class="alert mt-2 py-1 px-2 small" :class="importResult.includes('成功') ? 'alert-success' : 'alert-danger'">
      {{ importResult }}
    </div>
  </div>
</template>
