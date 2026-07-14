<template>
  <div class="status-bar">
    <div class="status-left">
      <span class="status-item">📍 河南大学 · 明伦校区</span>
      <span class="status-divider">|</span>
      <span class="status-item">经度: {{ lon }}</span>
      <span class="status-item">纬度: {{ lat }}</span>
      <span class="status-item">高度: {{ height }}m</span>
    </div>
    <div class="status-right">
      <span class="status-item" :class="{ synced: syncEnabled }" @click="toggleSync">
        {{ syncEnabled ? '🔄 联动中' : '⏸ 联动关闭' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()

const lon = computed(() => mapStore.cesiumCamera.longitude.toFixed(5))
const lat = computed(() => mapStore.cesiumCamera.latitude.toFixed(5))
const height = computed(() => Math.round(mapStore.cesiumCamera.height))
const syncEnabled = computed(() => mapStore.syncEnabled)

function toggleSync() {
  mapStore.syncEnabled = !mapStore.syncEnabled
}
</script>

<style scoped>
.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: rgba(0, 0, 0, 0.75);
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  font-size: 11px;
  z-index: 300;
}

.status-left, .status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-item {
  font-family: monospace;
  font-size: 10px;
}

.status-divider {
  color: rgba(255, 255, 255, 0.3);
}

.status-right .status-item {
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  transition: background 0.15s;
}

.status-right .status-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.synced {
  color: #5f5;
}
</style>
