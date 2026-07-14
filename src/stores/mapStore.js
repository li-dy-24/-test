import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 2D/3D 联动状态管理
 * 管理双屏的相机位置同步、选中要素、联动开关
 */
export const useMapStore = defineStore('map', () => {
  // 2D 地图当前范围
  const olCenter = ref([114.362, 34.810])
  const olZoom = ref(16)
  const olRotation = ref(0)

  // 3D 相机当前状态
  const cesiumCamera = ref({
    longitude: 114.362,
    latitude: 34.810,
    height: 800,
    heading: 0,
    pitch: -45,
    roll: 0
  })

  // 当前选中的建筑要素
  const selectedBuilding = ref(null)

  // 联动开关（2D → 3D, 3D → 2D）
  const syncEnabled = ref(true)

  // 当前激活的工具 (null | 'measure' | 'viewshed' | 'flight')
  const activeTool = ref(null)

  // 工具参数
  const toolParams = ref({})

  function updateOLView(center, zoom, rotation = 0) {
    olCenter.value = center
    olZoom.value = zoom
    olRotation.value = rotation
  }

  function updateCesiumCamera(camera) {
    cesiumCamera.value = { ...camera }
    if (syncEnabled.value) {
      olCenter.value = [camera.longitude, camera.latitude]
      // 粗略映射 3D 高度到 2D zoom
      const approxZoom = Math.max(13, Math.min(19, 19 - Math.log2(camera.height / 50)))
      olZoom.value = Math.round(approxZoom)
    }
  }

  function selectBuilding(building) {
    selectedBuilding.value = building
  }

  function clearSelection() {
    selectedBuilding.value = null
  }

  function setActiveTool(tool, params = {}) {
    if (activeTool.value === tool) {
      activeTool.value = null
      toolParams.value = {}
    } else {
      activeTool.value = tool
      toolParams.value = params
    }
  }

  function clearTool() {
    activeTool.value = null
    toolParams.value = {}
  }

  return {
    olCenter,
    olZoom,
    olRotation,
    cesiumCamera,
    selectedBuilding,
    syncEnabled,
    activeTool,
    toolParams,
    updateOLView,
    updateCesiumCamera,
    selectBuilding,
    clearSelection,
    setActiveTool,
    clearTool
  }
})
