<!-- OLMap — 二维平面场景（OpenLayers + OSM 暗色化） -->
<template>
  <div class="ol-map">
    <div ref="mapContainer" class="ol-container"></div>

    <!-- 暗色化 + 青色扫描网底纹 -->
    <div class="map-tint"></div>

    <!-- 场景标识 -->
    <div class="scene-tag">
      <i class="dot"></i>
      <b>二维平面</b>
      <i>MAP · 02</i>
    </div>

    <!-- 四角定位括号 -->
    <div class="hud-frame">
      <span></span><span></span><span></span><span></span>
    </div>

    <!-- 右下角比例尺化刻度（纯装饰，科技感） -->
    <div class="map-scale">
      <span class="scale-label">ZOOM {{ zoomLevel.toFixed(1) }}</span>
      <div class="scale-bar"><i></i></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import TileLayer from 'ol/layer/Tile.js'
import OSM from 'ol/source/OSM.js'
import { fromLonLat, toLonLat } from 'ol/proj.js'
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()
const mapContainer = ref(null)
const olMap = ref(null)
const zoomLevel = ref(16)

let hoverThrottle = 0

onMounted(() => {
  const map = new Map({
    target: mapContainer.value,
    // 关闭默认控件：缩放按钮 / 版权水印 / 旋转罗盘
    controls: [],
    layers: [
      new TileLayer({
        source: new OSM({ crossOrigin: 'anonymous' })
      })
    ],
    view: new View({
      center: fromLonLat([114.348, 34.789]),
      zoom: 16,
      maxZoom: 20,
      minZoom: 12
    })
  })

  // 指针移动 → 写入全局 store（底部状态条显示）
  map.on('pointermove', evt => {
    const now = performance.now()
    if (now - hoverThrottle < 60) return
    hoverThrottle = now
    const [lon, lat] = toLonLat(evt.coordinate)
    mapStore.setHoverCoord({ lon: lon.toFixed(6), lat: lat.toFixed(6) })
  })

  map.getViewport().addEventListener('mouseleave', () => {
    mapStore.setHoverCoord(null)
  })

  // 视图变化 → 同步 store
  map.on('moveend', () => {
    const view = map.getView()
    const [lon, lat] = toLonLat(view.getCenter())
    zoomLevel.value = view.getZoom()
    mapStore.updateOLView([lon, lat], view.getZoom())
  })

  olMap.value = map
})

// 3D → 2D 同步
watch(() => mapStore.olCenter, ([lon, lat]) => {
  if (!olMap.value || !mapStore.syncEnabled) return
  const view = olMap.value.getView()
  const [clon, clat] = toLonLat(view.getCenter())
  if (Math.hypot(lon - clon, lat - clat) < 0.0003) return
  view.setCenter(fromLonLat([lon, lat]))
  view.setZoom(mapStore.olZoom)
}, { deep: true })

defineExpose({ getMap: () => olMap.value })

onUnmounted(() => {
  if (olMap.value) {
    olMap.value.setTarget(undefined)
    olMap.value = null
  }
})
</script>

<style scoped>
.ol-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #05090f;
}

/* OSM 亮度反相 → 暗色底图 */
.ol-container {
  width: 100%;
  height: 100%;
  filter: invert(1) hue-rotate(185deg) brightness(0.95) contrast(1.05) saturate(0.35);
}

/* 青色叠色 + 中心暗角 */
.map-tint {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 45%, rgba(53, 224, 255, 0.06), transparent 62%),
    linear-gradient(180deg, rgba(4, 10, 18, 0.42), rgba(4, 10, 18, 0.18) 45%, rgba(4, 10, 18, 0.55));
  z-index: 3;
}

.scene-tag .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
  animation: pulse 2.4s ease-in-out infinite;
}

/* 比例尺装饰 */
.map-scale {
  position: absolute;
  right: 16px;
  bottom: 14px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  pointer-events: none;
}
.scale-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--cyan);
  opacity: 0.75;
}
.scale-bar {
  width: 72px;
  height: 5px;
  border-left: 1px solid rgba(53, 224, 255, 0.6);
  border-right: 1px solid rgba(53, 224, 255, 0.6);
  border-bottom: 1px solid rgba(53, 224, 255, 0.6);
  position: relative;
}
.scale-bar i {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(53, 224, 255, 0.4);
}
</style>
