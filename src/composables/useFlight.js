/**
 * useFlight — 飞行漫游
 * 
 * 管理预设飞行路线的播放、暂停、跳转。
 * 通过闭包捕获 getViewer 函数，每次操作时才获取 Viewer，不依赖组件 setup 时序。
 */
import { ref, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import flightRoutesData from '@/data/flightRoutes.json'

export function useFlight(getViewer) {
  const routes = ref(flightRoutesData.routes || [])
  const currentRoute = ref(null)
  const currentWaypointIndex = ref(0)
  const isFlying = ref(false)
  const isPaused = ref(false)
  const flightProgress = ref(0)

  let timeoutId = null

  /** 获取 Viewer（延迟调用，不依赖 setup 时的状态） */
  function viewer() { return getViewer?.() }

  /** 开始飞行 */
  function startFlight(routeId) {
    if (isFlying.value) stopFlight()
    const route = routes.value.find(r => r.id === routeId)
    if (!route?.waypoints?.length) return

    currentRoute.value = route
    currentWaypointIndex.value = 0
    isFlying.value = true
    isPaused.value = false
    flyToNext()
  }

  /** 飞到下一个航点 */
  function flyToNext() {
    const v = viewer()
    if (!v || !currentRoute.value) return
    const wps = currentRoute.value.waypoints
    if (currentWaypointIndex.value >= wps.length) { stopFlight(); return }

    const wp = wps[currentWaypointIndex.value]
    flightProgress.value = Math.round((currentWaypointIndex.value / wps.length) * 100)

    v.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(wp.longitude, wp.latitude, wp.height),
      orientation: {
        heading: Cesium.Math.toRadians(wp.heading || 0),
        pitch: Cesium.Math.toRadians(wp.pitch || -45),
        roll: Cesium.Math.toRadians(wp.roll || 0)
      },
      duration: wp.duration || 3,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      complete: () => {
        if (!isFlying.value || isPaused.value) return
        currentWaypointIndex.value++
        timeoutId = setTimeout(() => { if (isFlying.value && !isPaused.value) flyToNext() }, 500)
      }
    })
  }

  /** 暂停 / 恢复 */
  function pauseFlight() {
    if (!isFlying.value) return
    isPaused.value = !isPaused.value
    const v = viewer()
    if (isPaused.value) {
      v?.camera.cancelFlight()
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null }
    } else {
      flyToNext()
    }
  }

  /** 停止飞行 */
  function stopFlight() {
    viewer()?.camera.cancelFlight()
    if (timeoutId) { clearTimeout(timeoutId); timeoutId = null }
    isFlying.value = false
    isPaused.value = false
    currentRoute.value = null
    currentWaypointIndex.value = 0
    flightProgress.value = 0
  }

  /** 跳转航点 */
  function skipWaypoint(dir = 'next') {
    if (!isFlying.value || !currentRoute.value) return
    viewer()?.camera.cancelFlight()
    if (timeoutId) clearTimeout(timeoutId)
    const idx = currentWaypointIndex.value + (dir === 'next' ? 1 : -1)
    currentWaypointIndex.value = Math.max(0, Math.min(idx, currentRoute.value.waypoints.length - 1))
    flyToNext()
  }

  onUnmounted(() => stopFlight())

  return {
    routes, currentRoute, currentWaypointIndex,
    isFlying, isPaused, flightProgress,
    startFlight, pauseFlight, stopFlight, skipWaypoint
  }
}
