<!-- 视域分析面板 — 通过 inject 获取 useViewshed 实例 -->
<template>
  <div class="viewshed-panel">
    <h4>👁️ 视域分析</h4>
    <p class="desc">点击地图选择一个观察点，分析从该点出发的可见范围。<br>🟢 绿色 = 可见  |  🔴 红色 = 被遮挡</p>

    <button class="pick-btn" @click="pickPoint">
      {{ observer ? '✅ 已选点（点击重选）' : '🖱️ 点击地图选点' }}
    </button>

    <div v-if="observer" class="coords">
      经度:{{ observer.longitude.toFixed(5) }}  纬度:{{ observer.latitude.toFixed(5) }}
    </div>

    <div class="param">
      分析半径: <b>{{ radius }}m</b>
      <input type="range" v-model.number="radius" min="100" max="1000" step="50">
    </div>

    <button class="run-btn" :disabled="!observer || viewshed.isAnalyzing.value" @click="doAnalyze">
      {{ viewshed.isAnalyzing.value ? '分析中...' : '🔍 开始分析' }}
    </button>

    <button v-if="viewshed.viewshedResult.value" class="clear-btn" @click="viewshed.clear()">清除结果</button>

    <div v-if="viewshed.viewshedResult.value" class="summary">
      <span class="s s-g">🟢 可见点: {{ viewshed.viewshedResult.value.visible?.length || 0 }}</span>
      <span class="s s-r">🔴 遮挡点: {{ viewshed.viewshedResult.value.hidden?.length || 0 }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import * as Cesium from 'cesium'
import { VIEWSHED_CONFIG } from '@/utils/cesium-config'

const viewshed = inject('viewshed')
const getViewer = () => {
  // 从根组件通过 window 或其他方式获取 viewer
  // 我们通过 inject 获取 viewer 的 getter
  return window.__cesiumViewer
}

const observer = ref(null)
const radius = ref(VIEWSHED_CONFIG.maxDistance)

/** 点击地图选观察点 */
function pickPoint() {
  const v = window.__cesiumViewer
  if (!v) return

  const handler = new Cesium.ScreenSpaceEventHandler(v.scene.canvas)
  handler.setInputAction(click => {
    const cartesian = v.scene.pickPosition(click.position)
    if (!Cesium.defined(cartesian)) return
    if (!cartesian.x && !cartesian.y && !cartesian.z) return
    const carto = Cesium.Cartographic.fromCartesian(cartesian)
    observer.value = {
      longitude: Cesium.Math.toDegrees(carto.longitude),
      latitude: Cesium.Math.toDegrees(carto.latitude),
      height: carto.height + VIEWSHED_CONFIG.observerHeight
    }
    handler.destroy()
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

function doAnalyze() {
  if (!observer.value) return
  viewshed.clear()
  viewshed.run(observer.value)
}
</script>

<style scoped>
h4 { margin:0 0 6px; font-size:13px; color:#036; }
.desc { font-size:11px; color:#888; margin:0 0 10px; line-height:1.5; }
.pick-btn { width:100%; padding:8px; border:1px dashed #ccc; border-radius:4px;
  background:#f8f8f8; font-size:11px; cursor:pointer; margin-bottom:8px; }
.pick-btn:hover { border-color:#036; color:#036; }
.coords { font-size:10px; color:#666; font-family:monospace; background:#f8f8f8;
  padding:4px 8px; border-radius:3px; margin-bottom:8px; }
.param { margin-bottom:10px; font-size:11px; color:#555; }
.param input { width:100%; }
.run-btn { width:100%; padding:8px; border:none; border-radius:4px;
  background:#036; color:#fff; font-size:12px; cursor:pointer; margin-bottom:4px; }
.run-btn:disabled { background:#ccc; cursor:not-allowed; }
.clear-btn { width:100%; padding:6px; border:1px solid #ddd; border-radius:4px;
  background:#fff; font-size:11px; cursor:pointer; color:#999; margin-bottom:8px; }
.summary { display:flex; gap:12px; font-size:11px; }
.s { display:flex; align-items:center; gap:4px; }
</style>
