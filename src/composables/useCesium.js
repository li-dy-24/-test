/**
 * useCesium — Cesium 3D 场景核心封装
 * 
 * 职责：
 * 1. 初始化 Cesium.Viewer（地形、影像、相机）
 * 2. 提供 geospatial 工具：flyTo / pickPosition / screenToWorld
 * 3. 管理自定义 Entity（点/线/面/标签）的增删
 */
import { ref, reactive, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import { CESIUM_TOKEN, CAMPUS_CENTER } from '@/utils/cesium-config'

export function useCesium() {
  // ===== 响应式状态 =====
  const viewer = ref(null)         // Cesium.Viewer 实例
  const isReady = ref(false)       // Viewer 是否初始化完毕
  const entities = reactive({})    // 自定义实体注册表 { id: Entity }
  const dataSources = reactive({}) // 数据源注册表（预留）

  // 相机实时状态，供状态栏显示
  const cameraState = reactive({
    longitude: CAMPUS_CENTER.longitude,
    latitude: CAMPUS_CENTER.latitude,
    height: CAMPUS_CENTER.height,
    heading: 0,
    pitch: -45,
    roll: 0
  })

  // ===== Viewer 初始化 =====

  /** 异步创建 Cesium.Viewer，加载影像并定位到校园 */
  async function initViewer(containerId = 'cesiumContainer') {
    if (!CESIUM_TOKEN) {
      console.error('[Cesium] ❌ Token 未配置！请在 .env 文件中设置 VITE_CESIUM_TOKEN')
      return null
    }

    Cesium.Ion.defaultAccessToken = CESIUM_TOKEN

    // 加载地形（try-catch 保护，失败降级椭球体）
    let terrain
    try {
      terrain = await Cesium.createWorldTerrainAsync({
        requestVertexNormals: true,
        requestWaterMask: true
      })
      console.log('[Cesium] ✅ 地形加载成功')
    } catch (e) {
      console.warn('[Cesium] ⚠️ 地形加载失败，使用默认椭球体:', e.message)
    }

    // 创建 Viewer
    const v = new Cesium.Viewer(containerId, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      infoBox: false,
      selectionIndicator: false,
      terrainProvider: terrain,
      camera: {
        destination: Cesium.Cartesian3.fromDegrees(
          CAMPUS_CENTER.longitude,
          CAMPUS_CENTER.latitude,
          10000                // 初始 10km 高度俯瞰校园
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-60),
          roll: 0
        }
      }
    })

    // 自定义 Home 按钮行为
    v.homeButton.viewModel.command.beforeExecute.addEventListener(e => {
      e.cancel = true
      flyTo(CAMPUS_CENTER.longitude, CAMPUS_CENTER.latitude, 10000, 0, -60, 0, 2)
    })

    // 相机变化 → 更新 cameraState（供状态栏和 2D/3D 同步使用）
    v.camera.changed.addEventListener(() => updateCameraState())

    viewer.value = v
    isReady.value = true
    console.log('[Cesium] ✅ Viewer 就绪，初始高度 10000m')
    return v
  }

  // ===== 相机 =====

  /** 将当前相机位置同步到 cameraState */
  function updateCameraState() {
    if (!viewer.value) return
    const cam = viewer.value.camera
    const carto = Cesium.Cartographic.fromCartesian(cam.position)
    cameraState.longitude = Cesium.Math.toDegrees(carto.longitude)
    cameraState.latitude = Cesium.Math.toDegrees(carto.latitude)
    cameraState.height = carto.height
    cameraState.heading = Cesium.Math.toDegrees(cam.heading)
    cameraState.pitch = Cesium.Math.toDegrees(cam.pitch)
    cameraState.roll = Cesium.Math.toDegrees(cam.roll)
  }

  /** 飞行到指定经纬度位置（带缓动） */
  function flyTo(lng, lat, height, heading = 0, pitch = -45, roll = 0, duration = 2) {
    if (!viewer.value) return
    viewer.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
      orientation: {
        heading: Cesium.Math.toRadians(heading),
        pitch: Cesium.Math.toRadians(pitch),
        roll: Cesium.Math.toRadians(roll)
      },
      duration,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
    })
  }

  // ===== Entity 管理 =====

  /** 添加点标记 */
  function addPoint(id, lng, lat, opts = {}) {
    if (!viewer.value) return
    const { color = '#FFD700', pixelSize = 10 } = opts
    const e = viewer.value.entities.add({
      id, position: Cesium.Cartesian3.fromDegrees(lng, lat),
      point: { pixelSize, color: Cesium.Color.fromCssColorString(color) }
    })
    entities[id] = e
    return e
  }

  /** 添加线段（测量工具会用到） */
  function addPolyline(id, coords, opts = {}) {
    if (!viewer.value) return
    const { color = '#00FFFF', width = 3, clampToGround = true } = opts
    const e = viewer.value.entities.add({
      id, polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(coords),
        width, material: Cesium.Color.fromCssColorString(color), clampToGround
      }
    })
    entities[id] = e
    return e
  }

  /** 添加多边形（视域分析结果渲染用） */
  function addPolygon(id, hierarchy, opts = {}) {
    if (!viewer.value) return
    const { color = '#00FF00', opacity = 0.4, outline = false, outlineColor = '#000' } = opts
    const e = viewer.value.entities.add({
      id, polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(hierarchy),
        material: Cesium.Color.fromCssColorString(color).withAlpha(opacity),
        outline, outlineColor: outline ? Cesium.Color.fromCssColorString(outlineColor) : undefined
      }
    })
    entities[id] = e
    return e
  }

  /** 添加文本标签 */
  function addLabel(id, lng, lat, text, opts = {}) {
    if (!viewer.value) return
    const { fontSize = '14px', color = '#FFF', bgColor = 'rgba(0,51,102,0.8)', yOffset = -20 } = opts
    const e = viewer.value.entities.add({
      id, position: Cesium.Cartesian3.fromDegrees(lng, lat),
      label: {
        text, font: `${fontSize} sans-serif`,
        fillColor: Cesium.Color.fromCssColorString(color),
        backgroundColor: Cesium.Color.fromCssColorString(bgColor),
        showBackground: true,
        pixelOffset: new Cesium.Cartesian2(0, yOffset),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
    entities[id] = e
    return e
  }

  /** 删除单个实体 */
  function removeEntity(id) {
    if (!viewer.value || !entities[id]) return
    viewer.value.entities.remove(entities[id])
    delete entities[id]
  }

  /** 清空所有自定义实体 */
  function clearAllEntities() {
    if (!viewer.value) return
    Object.keys(entities).forEach(id => removeEntity(id))
  }

  // ===== 空间拾取 =====

  /** 从鼠标事件中拾取地形/模型上的三维坐标 */
  function pickPosition(movement) {
    if (!viewer.value) return null
    const pos = movement.endPosition || movement
    const cartesian = viewer.value.scene.pickPosition(pos)
    if (!Cesium.defined(cartesian)) return null
    const carto = Cesium.Cartographic.fromCartesian(cartesian)
    return {
      longitude: Cesium.Math.toDegrees(carto.longitude),
      latitude: Cesium.Math.toDegrees(carto.latitude),
      height: carto.height,
      cartesian
    }
  }

  /** 屏幕坐标 → 地球表面的地理坐标（射线与椭球/地形交点） */
  function screenToWorld(windowPos) {
    if (!viewer.value) return null
    const scene = viewer.value.scene
    const cartesian = scene.globe.pick(scene.camera.getPickRay(windowPos), scene)
    if (!Cesium.defined(cartesian)) return null
    const carto = Cesium.Cartographic.fromCartesian(cartesian)
    return {
      longitude: Cesium.Math.toDegrees(carto.longitude),
      latitude: Cesium.Math.toDegrees(carto.latitude),
      height: carto.height,
      cartesian
    }
  }

  /** 安全获取 Viewer（子组件通过 inject 调用） */
  function getViewer() {
    return viewer.value
  }

  // ===== 生命周期 =====

  function destroyViewer() {
    if (viewer.value) {
      viewer.value.destroy()
      viewer.value = null
      isReady.value = false
    }
  }

  onUnmounted(() => destroyViewer())

  return {
    viewer, isReady, entities, dataSources, cameraState,
    initViewer, destroyViewer, getViewer, flyTo,
    addPoint, addPolyline, addPolygon, addLabel,
    removeEntity, clearAllEntities,
    pickPosition, screenToWorld, updateCameraState
  }
}
