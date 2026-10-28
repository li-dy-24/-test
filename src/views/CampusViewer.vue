<!--
  CampusViewer — 数字校园主页面

  布局：
  - TopBar        顶部菜单栏（品牌 / 模块导航 / 实时状态）
  - stage         主舞台：左侧 2D OpenLayers + 右侧 3D Cesium 分屏
  - RightSidebar  右侧菜单栏（图标导航条 + 功能抽屉）
  - StatusBar     底部状态条（坐标读数 / 联动 / 投影）
-->
<template>
  <div class="campus-viewer">
    <TopBar
      :active="active"
      :sync-enabled="mapStore.syncEnabled"
      @toggle-sync="mapStore.syncEnabled = !mapStore.syncEnabled"
      @update:active="selectModule"
    />

    <main class="stage">
      <SplitPane :default-ratio="0.34">
        <template #left>
          <OLMap ref="olMapRef" />
        </template>

        <template #right>
          <CesiumViewer ref="cesiumRef" />
        </template>
      </SplitPane>

      <RightSidebar
        v-model="active"
        v-model:open="drawerOpen"
        @home="goHome"
      />
    </main>

    <StatusBar />
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, provide } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { HOME_VIEW } from '@/utils/cesium-config'
import TopBar from '@/components/layout/TopBar.vue'
import SplitPane from '@/components/layout/SplitPane.vue'
import RightSidebar from '@/components/layout/RightSidebar.vue'
import StatusBar from '@/components/layout/StatusBar.vue'
import OLMap from '@/components/ol/OLMap.vue'
import CesiumViewer from '@/components/cesium/CesiumViewer.vue'
import { useFlight } from '@/composables/useFlight'
import { useMeasure } from '@/composables/useMeasure'
import { useViewshed } from '@/composables/useViewshed'
import { use2D3DSync } from '@/composables/use2D3DSync'

const mapStore = useMapStore()

const olMapRef = ref(null)
const cesiumRef = ref(null)

// 右侧菜单栏状态
const active = ref('buildings')
const drawerOpen = ref(true)

// ===== 工具 composable =====
const getViewer = () => cesiumRef.value?.cesium?.getViewer?.()
const flight = useFlight(getViewer)
const measure = useMeasure(getViewer)
const viewshed = useViewshed(getViewer)

provide('cesiumViewer', ref(null))
provide('flight', flight)
provide('measure', measure)
provide('viewshed', viewshed)

// ===== 顶部导航 → 切换右侧模块 =====
function selectModule(key) {
  if (active.value === key && drawerOpen.value) {
    drawerOpen.value = false // 再次点击当前模块 → 收起抽屉
    return
  }
  active.value = key
  drawerOpen.value = true
}

// ===== 回到校园 =====
function goHome() {
  const c = cesiumRef.value?.cesium
  if (!c) return
  c.flyTo(
    HOME_VIEW.longitude,
    HOME_VIEW.latitude,
    HOME_VIEW.height,
    HOME_VIEW.heading,
    HOME_VIEW.pitch,
    0,
    1.8
  )
}

// ===== 2D/3D 联动同步 =====
const sync = use2D3DSync()

watch(() => cesiumRef.value?.cesium?.getViewer?.(), (v) => {
  if (!v) return
  window.__cesiumViewer = v
  const olMap = olMapRef.value?.getMap?.()
  if (olMap) {
    sync.bindOL2Cesium(olMap, cesiumRef.value?.cesium)
    sync.bindCesium2OL(v, olMap)
    console.log('[Sync] 2D ↔ 3D 联动已启用')
  }
})

watch(() => olMapRef.value?.getMap?.(), (olMap) => {
  const v = cesiumRef.value?.cesium?.getViewer?.()
  if (!olMap || !v) return
  sync.bindOL2Cesium(olMap, cesiumRef.value?.cesium)
  sync.bindCesium2OL(v, olMap)
  console.log('[Sync] 2D ↔ 3D 联动已启用（OL就绪）')
})

onUnmounted(() => { window.__cesiumViewer = null })
</script>

<style scoped>
.campus-viewer {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-0);
}

.stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}
</style>
