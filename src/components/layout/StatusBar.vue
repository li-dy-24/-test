<!-- StatusBar — 底部状态条：三维相机读数 / 指针坐标 / 系统参数 -->
<template>
  <footer class="status-bar">
    <!-- 左侧：相机读数 -->
    <div class="group">
      <span class="tag">CAM</span>
      <span class="cell"><em>经度</em><b>{{ lon }}</b></span>
      <span class="cell"><em>纬度</em><b>{{ lat }}</b></span>
      <span class="cell"><em>视高</em><b>{{ height }}<i>m</i></b></span>
      <span class="cell"><em>俯仰</em><b>{{ pitch }}<i>°</i></b></span>
    </div>

    <span class="sep"></span>

    <!-- 中部：二维指针 -->
    <div class="group hover-group">
      <span class="tag">指针</span>
      <span v-if="hover" class="mono-value">{{ hover }}</span>
      <span v-else class="mono-value muted">在二维地图上移动鼠标</span>
    </div>

    <!-- 右侧：系统参数 -->
    <div class="group right">
      <span class="meta">WGS84</span>
      <span class="sep"></span>
      <span class="meta">CESIUM 1.123</span>
      <span class="sep"></span>
      <span class="online"><i class="pulse-dot"></i>在线</span>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()

const lon = computed(() => mapStore.cameraReadout.longitude.toFixed(6))
const lat = computed(() => mapStore.cameraReadout.latitude.toFixed(6))
const height = computed(() => Math.round(mapStore.cameraReadout.height))
const pitch = computed(() => Math.round(mapStore.cameraReadout.pitch))

const hover = computed(() => {
  const c = mapStore.hoverCoord
  if (!c) return ''
  return `${c.lon}, ${c.lat}`
})
</script>

<style scoped>
.status-bar {
  height: var(--h-bottom);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  background: linear-gradient(180deg, rgba(6, 13, 23, 0.96), rgba(4, 9, 16, 0.99));
  border-top: 1px solid var(--line);
  font-size: 11px;
  color: var(--text-dim);
  position: relative;
  z-index: 500;
  overflow: hidden;
}
.status-bar::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 220px;
  height: 1px;
  background: linear-gradient(90deg, var(--cyan), transparent);
  opacity: 0.8;
}

.group { display: flex; align-items: center; gap: 10px; }
.group.right { margin-left: auto; }

.tag {
  font-family: var(--mono);
  font-size: 8.5px;
  letter-spacing: 0.16em;
  color: var(--cyan);
  background: rgba(53, 224, 255, 0.1);
  border: 1px solid rgba(53, 224, 255, 0.22);
  border-radius: 3px;
  padding: 1px 5px;
}

.cell { display: inline-flex; align-items: baseline; gap: 5px; }
.cell em {
  font-style: normal;
  font-size: 10px;
  color: var(--text-mute);
}
.cell b {
  font-family: var(--mono);
  font-weight: 500;
  font-size: 11.5px;
  color: #d6ecff;
  letter-spacing: 0.02em;
}
.cell b i {
  font-style: normal;
  font-size: 9px;
  color: var(--text-mute);
  margin-left: 1px;
}

.mono-value {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--cyan);
  letter-spacing: 0.02em;
}
.mono-value.muted { color: var(--text-mute); font-size: 10.5px; }

.meta {
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  color: var(--text-mute);
}

.sep {
  width: 1px;
  height: 12px;
  background: var(--line);
}

.online {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  color: var(--green);
  letter-spacing: 0.06em;
}

@media (max-width: 1180px) {
  .hover-group, .group.right .meta:nth-of-type(n + 2) { display: none; }
}
</style>
