<template>
  <div class="cesium-toolbar">
    <button
      class="tool-btn"
      :class="{ active: activeTool === 'measure' }"
      title="测量工具"
      @click="$emit('selectTool', 'measure')"
    >📏</button>
    <button
      class="tool-btn"
      :class="{ active: activeTool === 'viewshed' }"
      title="视域分析"
      @click="$emit('selectTool', 'viewshed')"
    >👁️</button>
    <button
      class="tool-btn"
      :class="{ active: activeTool === 'flight' }"
      title="飞行漫游"
      @click="$emit('selectTool', 'flight')"
    >✈️</button>

    <div class="toolbar-divider"></div>

    <button class="tool-btn home-btn" title="回到校园" @click="goHome">
      🏠
    </button>
  </div>
</template>

<script setup>
import { CAMPUS_CENTER } from '@/utils/cesium-config'

defineProps({ activeTool: String })
defineEmits(['selectTool'])

function goHome() {
  window.dispatchEvent(new CustomEvent('fly-home', {
    detail: CAMPUS_CENTER
  }))
}
</script>

<style scoped>
.cesium-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 100;
}

.tool-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #fff;
  transform: scale(1.05);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
}

.tool-btn.active {
  background: #003366;
  color: #fff;
  box-shadow: 0 0 0 2px rgba(0, 51, 102, 0.4);
}

.toolbar-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 8px;
}
</style>
