<!-- OLMap — 2D OpenStreetMap：点击显示坐标 -->
<template>
  <div class="ol-map">
    <div ref="mapContainer" class="ol-container"></div>

    <!-- 左下角坐标面板：鼠标移动实时显示 -->
    <div class="coord-panel-2d">
      <div class="coord-line">经度 <span>{{ coords.lon }}</span></div>
      <div class="coord-line">纬度 <span>{{ coords.lat }}</span></div>
      <div class="coord-crs">EPSG:3857 / EPSG:4326</div>
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
const coords = ref({ lon: '--', lat: '--' })
const center = ref([114.348, 34.789])

onMounted(() => {
  const map = new Map({
    target: mapContainer.value,
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({
      center: fromLonLat([114.348, 34.789]),
      zoom: 16,
      maxZoom: 20,
      minZoom: 12
    })
  })

  // 鼠标移动实时显示坐标
  map.on('pointermove', evt => {
    const [lon, lat] = toLonLat(evt.coordinate)
    coords.value = { lon: lon.toFixed(6), lat: lat.toFixed(6) }
  })

  // 移动时更新中心
  map.on('moveend', () => {
    const [lon, lat] = toLonLat(map.getView().getCenter())
    center.value = [lon, lat]
    mapStore.updateOLView([lon, lat], map.getView().getZoom())
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
  if (olMap.value) { olMap.value.setTarget(undefined); olMap.value = null }
})
</script>

<style scoped>
.ol-map { position:relative; width:100%; height:100%; overflow:hidden; }
.ol-container { width:100%; height:100%; }

/* 左下角坐标面板（浅色背景） */
.coord-panel-2d {
  position: absolute; bottom: 8px; left: 8px; z-index: 1000;
  background: rgba(0,0,0,.78); color: #0ff; font-family: 'Courier New', monospace;
  padding: 10px 14px; border-radius: 8px; min-width: 260px;
  border: 1px solid rgba(0,255,255,.3);
  pointer-events: none;
}
.coord-panel-2d .coord-line { font-size: 13px; margin-bottom: 3px; display: flex; justify-content: space-between; }
.coord-panel-2d .coord-line span { color: #fff; }
.coord-panel-2d .coord-crs { font-size: 10px; color: rgba(0,255,255,.5); margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(0,255,255,.2); }
</style>
