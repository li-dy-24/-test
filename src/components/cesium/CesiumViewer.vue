<!-- CesiumViewer — 3D 地球场景：卫星底图 + 点击显示坐标 -->
<template>
  <div class="cesium-viewer">
    <div id="cesiumContainer" ref="containerEl" class="cesium-container"></div>

    <!-- 右下角坐标面板：鼠标移动实时显示 -->
    <div class="coord-panel">
      <div class="coord-line">经度 <span>{{ coords.lon }}</span></div>
      <div class="coord-line">纬度 <span>{{ coords.lat }}</span></div>
      <div class="coord-line">高度 <span>{{ coords.h }}</span></div>
      <div class="coord-crs">WGS84 · EPSG:4326</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import { useCesium } from '@/composables/useCesium'

const cesium = useCesium()
const coords = ref({ lon: '--', lat: '--', h: '--' })

onMounted(async () => {
  const v = await cesium.initViewer('cesiumContainer')
  if (!v) return

  // 鼠标移动实时拾取坐标
  v.screenSpaceEventHandler.setInputAction(move => {
    const cartesian = v.scene.pickPosition(move.endPosition)
    if (Cesium.defined(cartesian) && (cartesian.x || cartesian.y || cartesian.z)) {
      const carto = Cesium.Cartographic.fromCartesian(cartesian)
      coords.value = {
        lon: Cesium.Math.toDegrees(carto.longitude).toFixed(6),
        lat: Cesium.Math.toDegrees(carto.latitude).toFixed(6),
        h: Math.round(carto.height) + 'm'
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  // 校园标签
  cesium.addLabel('campus', 114.362, 34.810, '河南大学·明伦校区', {
    fontSize: '20px', color: '#FFD700', bgColor: 'rgba(0,51,102,0.85)', yOffset: -36
  })
})

defineExpose({ cesium })
</script>

<style scoped>
.cesium-viewer { position:relative; width:100%; height:100%; overflow:hidden; }
.cesium-container { width:100%; height:100%; }

/* 右下角坐标面板 */
.coord-panel {
  position: absolute; bottom: 8px; right: 8px; z-index: 1000;
  background: rgba(0,0,0,.82); color: #0f0; font-family: 'Courier New', monospace;
  padding: 12px 16px; border-radius: 8px; min-width: 240px;
  border: 1px solid rgba(0,255,0,.3);
  pointer-events: none;
  animation: fadeIn .15s;
}
@keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

.coord-line { font-size: 14px; margin-bottom: 4px; display: flex; justify-content: space-between; }
.coord-line span { color: #fff; font-weight: bold; }
.coord-crs { font-size: 10px; color: rgba(0,255,0,.6); margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(0,255,0,.2); }
</style>
