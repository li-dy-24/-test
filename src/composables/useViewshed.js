/**
 * useViewshed — 视域分析
 * 
 * 从观察点发射 360° 射线，检测地形+建筑遮挡，输出可见/不可见区域。
 * 通过闭包捕获 getViewer，延迟获取 Viewer 实例。
 */
import { ref } from 'vue'
import * as Cesium from 'cesium'
import { VIEWSHED_CONFIG } from '@/utils/cesium-config'

export function useViewshed(getViewer) {
  const isAnalyzing = ref(false)
  const observerPoint = ref(null)
  const viewshedResult = ref(null)
  const viewshedEntities = ref([])

  function viewer() { return getViewer?.() }

  /**
   * 执行视域分析
   * @param {Object} obs — { longitude, latitude, height }
   */
  async function run(obs) {
    const v = viewer()
    if (!v || isAnalyzing.value) return

    isAnalyzing.value = true
    clear()

    observerPoint.value = obs

    // 标记观察点
    const obsE = v.entities.add({
      id: 'vs-obs',
      position: Cesium.Cartesian3.fromDegrees(obs.longitude, obs.latitude, obs.height),
      point: { pixelSize: 12, color: Cesium.Color.LIME },
      label: {
        text: '观察点', font: '14px sans-serif',
        fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2, pixelOffset: new Cesium.Cartesian2(15, -10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
    viewshedEntities.value.push(obsE)

    const { maxDistance, rayCount, stepDistance } = VIEWSHED_CONFIG
    const visible = [], hidden = []

    // 360° 射线扫描
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2
      const dx = Math.cos(angle), dy = Math.sin(angle)
      let lastVisible = true
      const steps = Math.floor(maxDistance / stepDistance)

      for (let s = 1; s <= steps; s++) {
        const dist = s * stepDistance
        const mPerDeg = 111320 * Math.cos(obs.latitude * Math.PI / 180)
        const dLon = (dx * dist) / mPerDeg
        const dLat = (dy * dist) / 111320
        const targetLon = obs.longitude + dLon
        const targetLat = obs.latitude + dLat

        // 采样点高度（地形 + 建筑）
        const sampleCarto = Cesium.Cartographic.fromDegrees(targetLon, targetLat)
        const terrainH = v.scene.globe.getHeight(sampleCarto) || 0
        const buildingH = sampleBuildingHeight(targetLon, targetLat, v)
        const effectiveH = Math.max(terrainH, buildingH)

        // 视线在该距离处的预期高度（简单线性插值）
        const losH = obs.height + (effectiveH - obs.height) * (dist / maxDistance)
        const isVisible = effectiveH <= losH + 2 // 2m 容差

        if (isVisible && !lastVisible) {
          visible.push([targetLon, targetLat])
        } else if (!isVisible && lastVisible) {
          hidden.push([targetLon, targetLat])
        }
        lastVisible = isVisible
      }
    }

    // 渲染结果
    if (visible.length > 2) {
      const e = v.entities.add({
        id: 'vs-visible', polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(visible.flat()),
          material: Cesium.Color.LIME.withAlpha(0.25),
          outline: true, outlineColor: Cesium.Color.LIME.withAlpha(0.5),
          clampToGround: true
        }
      })
      viewshedEntities.value.push(e)
    }
    if (hidden.length > 2) {
      const e = v.entities.add({
        id: 'vs-hidden', polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(hidden.flat()),
          material: Cesium.Color.RED.withAlpha(0.2),
          clampToGround: true
        }
      })
      viewshedEntities.value.push(e)
    }

    viewshedResult.value = { visible, hidden }
    isAnalyzing.value = false
  }

  /** 射线检测建筑高度 */
  function sampleBuildingHeight(lon, lat, v) {
    const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, 1000)
    const ray = new Cesium.Ray(
      cartesian,
      Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3())
    )
    const result = v.scene.pickFromRay(ray, ['polyline', 'polygon', 'model', '3DTiles'])
    if (result?.id?.polygon?.extrudedHeight) {
      return result.id.polygon.extrudedHeight.getValue()
    }
    return 0
  }

  function clear() {
    const v = viewer()
    if (!v) return
    viewshedEntities.value.forEach(e => v.entities.remove(e))
    viewshedEntities.value = []
    observerPoint.value = null
    viewshedResult.value = null
  }

  return { isAnalyzing, observerPoint, viewshedResult, run, clear }
}
