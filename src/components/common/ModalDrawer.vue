<script setup lang="ts">
/**
 * 通用弹窗/抽屉组件
 * 支持modal弹窗和offcanvas抽屉两种模式
 * 抽屉支持左右拖拽调整宽度
 */
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  /** 是否显示 */
  modelValue: boolean
  /** 标题 */
  title?: string
  /** 类型：modal（居中弹窗）或 drawer（侧边抽屉） */
  type?: 'modal' | 'drawer'
  /** 抽屉位置（仅type=drawer时有效） */
  placement?: 'start' | 'end'
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 点击背景是否关闭 */
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'modal',
  placement: 'end',
  size: 'md',
  showClose: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

/** 是否显示 */
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/** 抽屉 ref */
const drawerRef = ref<HTMLElement | null>(null)

/** 抽屉默认宽度（px） */
const defaultWidths: Record<string, number> = {
  sm: Math.round(window.innerWidth * 0.25),
  md: Math.round(window.innerWidth * 0.5),
  lg: Math.round(window.innerWidth * 0.75),
  xl: Math.round(window.innerWidth * 1)
}

/** 抽屉实际宽度（px），用于拖拽调整 */
const drawerPixelWidth = ref(0)
/** 是否正在拖拽 */
const isResizing = ref(false)

/** Modal 尺寸类名 */
const modalSizeClass = computed(() => {
  const map: Record<string, string> = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl'
  }
  return map[props.size]
})

/** 实际渲染宽度 */
const actualDrawerWidth = computed(() => {
  if (drawerPixelWidth.value > 0) {
    return drawerPixelWidth.value + 'px'
  }
  return '50%'
})

/** 关闭 */
function close() {
  visible.value = false
  emit('close')
}

/** 点击背景 */
function onBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}

/**
 * 开始拖拽调整抽屉宽度
 */
function startResize(event: MouseEvent) {
  event.preventDefault()
  isResizing.value = true

  const startX = event.clientX
  const currentWidth = drawerRef.value ? drawerRef.value.offsetWidth : 400

  function onMouseMove(e: MouseEvent) {
    const delta = props.placement === 'end'
      ? startX - e.clientX
      : e.clientX - startX

    const newWidth = Math.max(280, Math.min(window.innerWidth * 0.9, currentWidth + delta))
    drawerPixelWidth.value = newWidth
  }

  function onMouseUp() {
    isResizing.value = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

/** 手柄定位样式（紧贴抽屉边缘） */
const handleStyle = computed(() => {
  if (props.placement === 'end') {
    // end 侧：手柄在抽屉左边缘，即 right: 抽屉宽度
    return { right: actualDrawerWidth.value }
  } else {
    // start 侧：手柄在抽屉右边缘，即 left: 抽屉宽度
    return { left: actualDrawerWidth.value }
  }
})

/** 打开时初始化默认宽度 */
watch(visible, (val) => {
  if (val && drawerPixelWidth.value === 0) {
    nextTick(() => {
      if (drawerRef.value) {
        drawerPixelWidth.value = drawerRef.value.offsetWidth
      }
    })
  }
})
</script>

<template>
  <!-- Modal弹窗模式 -->
  <Teleport to="body">
    <div
      v-if="type === 'modal' && visible"
      class="modal d-block"
      tabindex="-1"
      style="z-index: 1060;"
      @click.self="onBackdropClick"
    >
      <div class="modal-backdrop fade show" style="z-index: -1;"></div>
      <div class="modal-dialog modal-dialog-centered" :class="modalSizeClass">
        <div class="modal-content">
          <div v-if="title || showClose" class="modal-header">
            <h5 v-if="title" class="modal-title">{{ title }}</h5>
            <button
              v-if="showClose"
              type="button"
              class="btn-close"
              @click="close"
            ></button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Drawer抽屉模式 -->
  <Teleport to="body">
    <template v-if="type === 'drawer' && visible">
      <!-- 遮罩 -->
      <div
        class="modal-backdrop fade show"
        style="z-index: 1055;"
        @click="onBackdropClick"
      ></div>
      <!-- 抽屉面板 -->
      <div
        ref="drawerRef"
        class="drawer-panel position-fixed top-0 bottom-0 overflow-auto"
        :class="{
          'end-0': placement === 'end',
          'start-0': placement === 'start',
          'border-end': placement === 'start',
          'border-start': placement === 'end',
          'bg-body': true
        }"
        :style="{ zIndex: 1060, width: actualDrawerWidth }"
      >
        <div v-if="title || showClose" class="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 v-if="title" class="mb-0">{{ title }}</h5>
          <div>
            <button
              v-if="showClose"
              type="button"
              class="btn-close"
              @click="close"
            ></button>
          </div>
        </div>
        <div class="p-3">
          <slot></slot>
        </div>
      </div>
      <!-- 拖拽手柄 -->
      <div
        class="drawer-resize-handle"
        :class="{ active: isResizing }"
        :style="handleStyle"
        @mousedown="startResize"
      ></div>
    </template>
  </Teleport>
</template>

<style scoped>
/* 拖拽手柄 */
.drawer-resize-handle {
  position: fixed;
  top: 0;
  width: 6px;
  height: 100%;
  z-index: 1061;
  cursor: ew-resize;
  background-color: transparent;
  transition: background-color 0.15s;
}

.drawer-resize-handle:hover,
.drawer-resize-handle.active {
  background-color: var(--accent-primary, #0d6efd);
  opacity: 0.8;
}
</style>
