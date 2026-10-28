<!-- CesiumViewer — 三维实景场景：Bing 影像 + World Terrain -->
<template>
  <div class="cesium-scene">
    <div id="cesiumContainer" ref="containerEl" class="cesium-container"></div>

    <!-- 场景标识 -->
    <div class="scene-tag">
      <i class="dot"></i>
      <b>三维实景</b>
      <i>SCENE · 03</i>
    </div>

    <!-- 四角定位括号 -->
    <div class="hud-frame">
      <span></span><span></span><span></span><span></span>
    </div>

    <!-- 左下角：视图模式切换（替代 Cesium 原生控件） -->
    <div class="mode-switch" v-if="ready">
      <button
        v-for="m in MODES"
        :key="m.key"
        :class="{ active: mode === m.key }"
        @click="switchMode(m.key)"
      >{{ m.label }}</button>
    </div>

    <!-- 加载遮罩 -->
    <transition name="fade">
      <div v-if="!ready" class="loader">
        <div class="loader-ring"></div>
        <p>正在装载三维场景</p>
        <span>INITIALIZING CESIUM · WORLD TERRAIN</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import { useCesium } from '@/composables/useCesium'
import { CESIUM_TOKEN, CAMPUS_CENTER } from '@/utils/cesium-config'

const cesium = useCesium()
const containerEl = ref(null)
const ready = ref(false)
const mode = ref('3d')
let viewerRef = null

const MODES = [
  { key: '3d', label: '三维' },
  { key: '2d', label: '平面' },
  { key: 'cv', label: '哥伦布' }
]

onMounted(async () => {
  if (!CESIUM_TOKEN) {
    console.error('[Cesium] 未配置 VITE_CESIUM_TOKEN')
    ready.value = false
    return
  }

  const v = await cesium.initViewer('cesiumContainer')
  if (!v) return

  viewerRef = v

  // 关闭 Cesium 原生工具栏（改用自定义模式切换）
  const toolbar = v.container?.querySelector('.cesium-viewer-toolbar')
  if (toolbar) toolbar.style.display = 'none'

  v.scene.morphComplete.addEventListener(() => {
    const m = v.scene.mode
    mode.value = m === Cesium.SceneMode.SCENE2D
      ? '2d'
      : m === Cesium.SceneMode.COLUMBUS_VIEW ? 'cv' : '3d'
  })

  // 校园标签（统一取 CAMPUS_CENTER，避免与 .env 坐标不一致）
  cesium.addLabel('campus', CAMPUS_CENTER.longitude, CAMPUS_CENTER.latitude, '河南大学 · 明伦校区', {
    fontSize: '15px',
    color: '#eaf4ff',
    bgColor: 'rgba(6,16,28,0.82)',
    yOffset: -34
  })

  ready.value = true
})

function switchMode(key) {
  if (!viewerRef) return
  mode.value = key
  const dur = 1.1
  if (key === '2d') viewerRef.scene.morphTo2D(dur)
  else if (key === 'cv') viewerRef.scene.morphToColumbusView(dur)
  else viewerRef.scene.morphTo3D(dur)
}

onUnmounted(() => { viewerRef = null })

defineExpose({ cesium })
</script>

<style scoped>
.cesium-scene {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(circle at 50% 40%, #0a1729, #03070d 70%);
}

.cesium-container {
  width: 100%;
  height: 100%;
}

.scene-tag .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
  animation: pulse 2.2s ease-in-out infinite;
}

/* ---------- 视图模式切换 ---------- */
.mode-switch {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 30;
  display: flex;
  padding: 3px;
  gap: 2px;
  background: rgba(4, 10, 18, 0.78);
  border: 1px solid var(--line);
  border-radius: 7px;
  backdrop-filter: blur(10px);
}
.mode-switch button {
  padding: 5px 11px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--text-dim);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  transition: all 0.18s;
}
.mode-switch button:hover { color: var(--cyan); background: rgba(53, 224, 255, 0.1); }
.mode-switch button.active {
  color: #04121c;
  background: linear-gradient(135deg, var(--cyan), #1fc4e8);
  font-weight: 600;
  box-shadow: 0 0 12px rgba(53, 224, 255, 0.35);
}

/* ---------- 加载遮罩 ---------- */
.loader {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: radial-gradient(circle at 50% 45%, rgba(10, 23, 41, 0.94), rgba(3, 7, 13, 0.98));
}
.loader p {
  font-size: 12.5px;
  letter-spacing: 0.14em;
  color: var(--text);
}
.loader span {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.22em;
  color: var(--text-mute);
}
.loader-ring {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(53, 224, 255, 0.18);
  border-top-color: var(--cyan);
  border-right-color: rgba(53, 224, 255, 0.5);
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-leave-active { transition: opacity 0.45s ease; }
.fade-leave-to { opacity: 0; }
</style>

<style>
/* 非 scoped：Cesium 生成节点在组件内部动态插入，需全局覆盖 */
.cesium-viewer-toolbar,
.cesium-viewer-animationContainer,
.cesium-viewer-timelineContainer,
.cesium-viewer-bottom,
.cesium-widget-credits { display: none !important; }
</style>
