<!--
  CampusViewer — 数字校园主页面

  架构：
  - 顶部导航栏
  - 左右分屏（2D OpenLayers + 3D Cesium）
  - 左侧工具栏面板
  - 底部状态栏
  
  composable 实例在此顶层创建，通过 provide 分发给子组件。
-->
<template>
  <div class="campus-viewer">
    <!-- 顶栏 -->
    <header class="top-bar">
      <h1>🏛️ 河南大学·数字校园三维展示</h1>
      <span class="badge">Vue3 + Cesium + OpenLayers</span>
    </header>

    <!-- 主体：左右分屏 -->
    <main class="main-area">
      <SplitPane :default-ratio="0.35">
        <template #left>
          <OLMap ref="olMapRef" />
        </template>
        <template #right>
          <CesiumViewer ref="cesiumRef" />
          <SidePanel />
        </template>
      </SplitPane>
    </main>

    <!-- 底部状态栏 -->
    <StatusBar />
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, provide } from 'vue'
import SplitPane from '@/components/layout/SplitPane.vue'
import SidePanel from '@/components/layout/SidePanel.vue'
import StatusBar from '@/components/layout/StatusBar.vue'
import OLMap from '@/components/ol/OLMap.vue'
import CesiumViewer from '@/components/cesium/CesiumViewer.vue'
import { useFlight } from '@/composables/useFlight'
import { useMeasure } from '@/composables/useMeasure'
import { useViewshed } from '@/composables/useViewshed'
import { use2D3DSync } from '@/composables/use2D3DSync'

const olMapRef = ref(null)
const cesiumRef = ref(null)

// ===== 工具 composable =====
const getViewer = () => cesiumRef.value?.cesium?.getViewer?.()
const flight = useFlight(getViewer)
const measure = useMeasure(getViewer)
const viewshed = useViewshed(getViewer)

// provide 工具
const providedViewer = ref(null)
provide('cesiumViewer', providedViewer)
provide('flight', flight)
provide('measure', measure)
provide('viewshed', viewshed)

// ===== 2D/3D 联动同步 =====
const sync = use2D3DSync()

// 等 Cesium Viewer 就绪后，绑定双向同步
watch(() => cesiumRef.value?.cesium?.getViewer?.(), (v) => {
  if (!v) return
  window.__cesiumViewer = v
  providedViewer.value = v

  // 绑定 2D → 3D
  const olMap = olMapRef.value?.getMap?.()
  if (olMap) {
    sync.bindOL2Cesium(olMap, cesiumRef.value?.cesium)
    sync.bindCesium2OL(v, olMap)
    console.log('[Sync] 2D ↔ 3D 联动已启用')
  }
})

// OLMap 就绪后也尝试绑定
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
.campus-viewer { width:100%; height:100vh; display:flex; flex-direction:column; overflow:hidden; }

.top-bar { height:44px; background:linear-gradient(135deg,#036,#04d); color:#fff;
  display:flex; justify-content:space-between; align-items:center; padding:0 16px;
  z-index:500; flex-shrink:0; }
.top-bar h1 { font-size:15px; font-weight:600; margin:0; }
.badge { background:rgba(255,255,255,.15); padding:2px 8px; border-radius:4px; font-size:10px; }

.main-area { flex:1; overflow:hidden; }
</style>
