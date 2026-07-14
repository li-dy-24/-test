/**
 * use2D3DSync — 2D/3D 双屏视角联动
 * 
 * 同步 OpenLayers 平面地图和 Cesium 三维地球的视角：
 * - 2D 移动 → 3D 飞行
 * - 3D 旋转 → 2D 更新中心
 * - 通过 mapStore.syncEnabled 控制开关
 */
import { ref } from 'vue'
import * as Cesium from 'cesium'
import { toLonLat, fromLonLat } from 'ol/proj.js'
import { useMapStore } from '@/stores/mapStore'

export function use2D3DSync() {
  const mapStore = useMapStore()
  const syncing = ref(false)

  /** 2D → 3D 同步：OL(EPSG:3857) → Cesium(WGS84) */
  function bindOL2Cesium(olMap, cesiumComposable) {
    if (!olMap) return
    olMap.on('moveend', () => {
      if (!mapStore.syncEnabled || syncing.value) return
      syncing.value = true
      const view = olMap.getView()
      // OL 返回 EPSG:3857 米制坐标，需转换为 WGS84 经纬度
      const [lon, lat] = toLonLat(view.getCenter())
      const height = z2h(view.getZoom())
      cesiumComposable?.flyTo(lon, lat, height, 0, -45, 0, 1.5)
      setTimeout(() => { syncing.value = false }, 1500)
    })
  }

  /** 3D → 2D 同步：Cesium(WGS84) → OL(EPSG:3857) */
  function bindCesium2OL(cesiumViewer, olMap) {
    if (!cesiumViewer) return
    cesiumViewer.camera.changed.addEventListener(() => {
      if (!mapStore.syncEnabled || syncing.value) return
      syncing.value = true
      const cam = cesiumViewer.camera
      const carto = Cesium.Cartographic.fromCartesian(cam.position)
      const lon = Cesium.Math.toDegrees(carto.longitude)
      const lat = Cesium.Math.toDegrees(carto.latitude)
      const zoom = h2z(carto.height)
      // WGS84 经纬度 → OL 的 EPSG:3857 米制坐标
      olMap?.getView().setCenter(fromLonLat([lon, lat]))
      olMap?.getView().setZoom(zoom)
      mapStore.updateCesiumCamera({
        longitude: lon, latitude: lat, height: carto.height,
        heading: Cesium.Math.toDegrees(cam.heading),
        pitch: Cesium.Math.toDegrees(cam.pitch),
        roll: Cesium.Math.toDegrees(cam.roll)
      })
      setTimeout(() => { syncing.value = false }, 200)
    })
  }

  function z2h(z) { return Math.max(50, 2000 * Math.pow(0.5, z - 14)) }
  function h2z(h) { return Math.max(13, Math.min(19, 19 - Math.log2(Math.max(h, 1) / 50))) }

  return { bindOL2Cesium, bindCesium2OL }
}
