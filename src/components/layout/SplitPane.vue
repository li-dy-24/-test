<template>
  <div class="split-pane" :style="{ '--left-ratio': leftRatio }">
    <div class="pane pane-left" :style="{ width: `${leftRatio * 100}%` }">
      <slot name="left" />
    </div>
    <div class="pane-divider" @mousedown="startResize">
      <div class="divider-handle">
        <span>⋮</span>
      </div>
    </div>
    <div class="pane pane-right" :style="{ width: `${(1 - leftRatio) * 100}%` }">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
  defaultRatio: { type: Number, default: 0.35 }
})

const leftRatio = ref(props.defaultRatio)

function startResize(e) {
  e.preventDefault()
  const startX = e.clientX
  const startRatio = leftRatio.value

  function onMouseMove(ev) {
    const dx = ev.clientX - startX
    const newRatio = startRatio + dx / window.innerWidth
    leftRatio.value = Math.max(0.2, Math.min(0.6, newRatio))
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.split-pane {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.pane {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.pane-left {
  background: #f5f5f5;
}

.pane-right {
  background: #000;
}

.pane-divider {
  width: 6px;
  height: 100%;
  background: #ddd;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
  z-index: 50;
}

.pane-divider:hover {
  background: #003366;
}

.divider-handle {
  width: 20px;
  height: 40px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #999;
}
</style>
