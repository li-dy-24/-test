<template>
  <div class="split-pane">
    <div class="pane pane-left" :style="{ width: `${leftRatio * 100}%` }">
      <slot name="left" />
    </div>

    <div class="pane-divider" @mousedown="startResize">
      <div class="divider-grip">
        <i></i><i></i><i></i>
      </div>
    </div>

    <div class="pane pane-right" :style="{ width: `${(1 - leftRatio) * 100}%` }">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  defaultRatio: { type: Number, default: 0.35 }
})

const leftRatio = ref(props.defaultRatio)

function startResize(e) {
  e.preventDefault()
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  const startX = e.clientX
  const startRatio = leftRatio.value
  const totalWidth = window.innerWidth

  function onMouseMove(ev) {
    const dx = ev.clientX - startX
    const newRatio = startRatio + dx / totalWidth
    leftRatio.value = Math.max(0.18, Math.min(0.62, newRatio))
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
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
  background: var(--bg-0);
}

.pane {
  height: 100%;
  overflow: hidden;
  position: relative;
  min-width: 0;
}

.pane-left { background: #05090f; }
.pane-right { background: #03070d; }

/* 分隔条：暗底 + 青色发光 */
.pane-divider {
  width: 7px;
  height: 100%;
  flex-shrink: 0;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(6, 13, 23, 1), rgba(9, 19, 33, 1), rgba(6, 13, 23, 1));
  border-left: 1px solid rgba(70, 190, 255, 0.08);
  border-right: 1px solid rgba(70, 190, 255, 0.08);
  position: relative;
  z-index: 60;
  transition: background 0.2s;
}
.pane-divider::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, transparent, rgba(53, 224, 255, 0.35), transparent);
  opacity: 0.5;
  transition: opacity 0.2s;
}
.pane-divider:hover::before { opacity: 1; box-shadow: 0 0 12px rgba(53, 224, 255, 0.6); }

.divider-grip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 0;
  z-index: 1;
}
.divider-grip i {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(53, 224, 255, 0.4);
  transition: all 0.2s;
}
.pane-divider:hover .divider-grip i {
  background: var(--cyan);
  box-shadow: 0 0 6px var(--cyan);
}
</style>
