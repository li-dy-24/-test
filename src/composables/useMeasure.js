/**
 * useMeasure — 空间测量工具
 * 
 * 支持三种模式：
 * - distance: 折线距离
 * - area:     多边形面积
 * - height:   两点高差
 * 
 * 通过闭包捕获 getViewer，每次操作时懒获取 Viewer 实例。
 */
import { ref } from 'vue'
import * as Cesium from 'cesium'

export function useMeasure(getViewer) {
  const mode = ref(null)         // 'distance' | 'area' | 'height' | null
  const points = ref([])         // 已采集的测量点
  const isMeasuring = ref(false)
  const tempEntities = ref([])   // 临时绘制的图形实体

  let handler = null

  function viewer() { return getViewer?.() }

  /** 开始测量 */
  function start(m) {
    const v = viewer()
    if (!v) return
    stop()

    mode.value = m
    points.value = []
    isMeasuring.value = true
    handler = new Cesium.ScreenSpaceEventHandler(v.scene.canvas)

    // 左键添加点
    handler.setInputAction(click => {
      const pos = pickPos(click.position)
      if (!pos) return
      points.value.push(pos)
      redraw()
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 鼠标移动预览线
    handler.setInputAction(move => {
      if (points.value.length === 0) return
      drawPreview(move)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 双击结束
    handler.setInputAction(dbl => {
      finish()
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
  }

  /** 停止测量，清理 */
  function stop() {
    finish()
    mode.value = null
    points.value = []
    clearTemp()
  }

  function finish() {
    isMeasuring.value = false
    if (handler) { handler.destroy(); handler = null }
  }

  /** 从屏幕坐标拾取地面坐标 */
  function pickPos(screenPos) {
    const v = viewer()
    if (!v) return null
    if (!screenPos) return null
    const cartesian = v.scene.pickPosition(screenPos)
    // pickPosition 可能返回 (0,0,0) 或 null 分量，视为无效
    if (!Cesium.defined(cartesian)) return null
    if (!cartesian.x && !cartesian.y && !cartesian.z) return null
    const carto = Cesium.Cartographic.fromCartesian(cartesian)
    return {
      longitude: Cesium.Math.toDegrees(carto.longitude),
      latitude: Cesium.Math.toDegrees(carto.latitude),
      height: carto.height,
      cartesian
    }
  }

  /** 重绘所有测量图形 */
  function redraw() {
    clearTemp()
    const v = viewer()
    if (!v) return
    const pts = points.value
    const m = mode.value

    // 绘制点标记
    pts.forEach((pt, i) => {
      const label = m === 'distance' && i > 0
        ? `${calcDist(pts.slice(0, i + 1)).toFixed(1)}m` : ''
      const e = v.entities.add({
        id: `mp-${i}`,
        position: pt.cartesian,
        point: { pixelSize: 8, color: Cesium.Color.CYAN },
        label: label ? {
          text: label, font: '12px sans-serif',
          fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1, pixelOffset: new Cesium.Cartesian2(10, -10),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        } : undefined
      })
      tempEntities.value.push(e)
    })

    // 连线
    if (pts.length >= 2) {
      for (let i = 0; i < pts.length - 1; i++) {
        const e = v.entities.add({
          id: `ml-${i}`, polyline: {
            positions: [pts[i].cartesian, pts[i + 1].cartesian],
            width: 2, material: Cesium.Color.CYAN,
            clampToGround: m !== 'height'
          }
        })
        tempEntities.value.push(e)
      }

      // 距离: 显示总长
      if (m === 'distance') {
        const last = pts[pts.length - 1]
        const total = calcDist(pts)
        const e = v.entities.add({
          id: 'mt', position: last.cartesian, label: {
            text: `总长: ${total.toFixed(2)}m`, font: 'bold 14px sans-serif',
            fillColor: Cesium.Color.YELLOW, outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2, pixelOffset: new Cesium.Cartesian2(20, -20),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        })
        tempEntities.value.push(e)
      }

      // 面积: 多边形 + 面积值
      if (m === 'area' && pts.length >= 3) {
        const e = v.entities.add({
          id: 'ma', polygon: {
            hierarchy: pts.map(p => p.cartesian),
            material: Cesium.Color.CYAN.withAlpha(0.3),
            outline: true, outlineColor: Cesium.Color.CYAN, outlineWidth: 2
          }
        })
        tempEntities.value.push(e)

        const area = calcArea(pts)
        const c = centroid3D(pts)
        const el = v.entities.add({
          id: 'mal', position: c, label: {
            text: `面积: ${formatArea(area)}`, font: 'bold 16px sans-serif',
            fillColor: Cesium.Color.YELLOW, outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2, disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        })
        tempEntities.value.push(el)
      }

      // 高差
      if (m === 'height' && pts.length >= 2) {
        const diff = Math.abs(pts[1].height - pts[0].height)
        const mid = Cesium.Cartesian3.midpoint(pts[0].cartesian, pts[1].cartesian, new Cesium.Cartesian3())
        const e = v.entities.add({
          id: 'mh', position: mid, label: {
            text: `高差: ${diff.toFixed(2)}m`, font: 'bold 14px sans-serif',
            fillColor: Cesium.Color.YELLOW, outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2, disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        })
        tempEntities.value.push(e)
      }
    }
  }

  /** 鼠标移动时画虚线预览 */
  function drawPreview(move) {
    const v = viewer()
    if (!v) return
    const prev = v.entities.getById('mpreview')
    if (prev) v.entities.remove(prev)

    const last = points.value[points.value.length - 1]
    if (!last) return

    const cur = pickPos(move.endPosition || move.position)
    if (!cur) return

    const e = v.entities.add({
      id: 'mpreview', polyline: {
        positions: [last.cartesian, cur.cartesian],
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.YELLOW }),
        clampToGround: mode.value !== 'height'
      }
    })
    tempEntities.value.push(e)
  }

  function clearTemp() {
    const v = viewer()
    if (!v) return
    tempEntities.value.forEach(e => v.entities.remove(e))
    tempEntities.value = []
  }

  // ===== 计算工具 =====

  function calcDist(pts) {
    let d = 0
    for (let i = 1; i < pts.length; i++) d += Cesium.Cartesian3.distance(pts[i].cartesian, pts[i - 1].cartesian)
    return d
  }

  function calcArea(pts) {
    // Shoelace 公式近似球面
    const p = pts.map(p => [p.longitude, p.latitude])
    const n = p.length
    const mPerDeg = 111320
    let a = 0
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      a += p[i][0] * p[j][1] * mPerDeg * mPerDeg * Math.cos(p[i][1] * Math.PI / 180)
      a -= p[j][0] * p[i][1] * mPerDeg * mPerDeg * Math.cos(p[j][1] * Math.PI / 180)
    }
    return Math.abs(a / 2)
  }

  function formatArea(m2) {
    if (m2 < 1) return `${(m2 * 10000).toFixed(1)} cm²`
    if (m2 >= 1e6) return `${(m2 / 1e6).toFixed(2)} km²`
    if (m2 >= 10000) return `${(m2 / 10000).toFixed(2)} 公顷`
    return `${m2.toFixed(2)} m²`
  }

  function centroid3D(pts) {
    const n = pts.length
    return new Cesium.Cartesian3(
      pts.reduce((s, p) => s + p.cartesian.x, 0) / n,
      pts.reduce((s, p) => s + p.cartesian.y, 0) / n,
      pts.reduce((s, p) => s + p.cartesian.z, 0) / n
    )
  }

  return { mode, points, isMeasuring, start, stop }
}
