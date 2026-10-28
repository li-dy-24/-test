<!-- ViewshedTool — 视域分析面板 -->
<template>
  <div class="viewshed-panel">
    <p class="desc">
      选定观察点后，系统按 360° 射线投射计算可见范围，绿色为可见、红色为遮挡。
    </p>

    <!-- 观察点 -->
    <div class="section-label">观察点</div>
    <button class="tech-btn pick-btn" :class="{ picked: !!observer }" @click="pickPoint">
      <TechIcon name="target" :size="14" />
      {{ observer ? '重新选取观察点' : '在三维场景中选点' }}
    </button>

    <div v-if="observer" class="coord-box">
      <div class="coord-row"><em>经度</em><b>{{ observer.longitude.toFixed(6) }}</b></div>
      <div class="coord-row"><em>纬度</em><b>{{ observer.latitude.toFixed(6) }}</b></div>
      <div class="coord-row"><em>视高</em><b>{{ observer.height.toFixed(1) }}<i>m</i></b></div>
    </div>

    <!-- 参数 -->
    <div class="section-label">分析半径</div>
    <div class="param-box">
      <div class="param-head">
        <span>RADIUS</span>
        <b>{{ radius }} <i>m</i></b>
      </div>
      <input type="range" v-model.number="radius" min="100" max="1000" step="50" />
    </div>

    <button
      class="tech-btn run-btn"
      :disabled="!observer || viewshed.isAnalyzing.value"
      @click="doAnalyze"
    >
      <TechIcon name="scan" :size="14" />
      {{ viewshed.isAnalyzing.value ? '射线计算中…' : '开始视域分析' }}
    </button>

    <button v-if="viewshed.viewshedResult.value" class="tech-btn clear-btn" @click="viewshed.clear()">
      清除结果
    </button>

    <!-- 结果 -->
    <div v-if="viewshed.viewshedResult.value" class="result-box">
      <div class="section-label">分析结果</div>
      <div class="result-grid">
        <div class="result-cell ok">
          <span class="cell-bar"></span>
          <em>可见</em>
          <b>{{ viewshed.viewshedResult.value.visible?.length || 0 }}</b>
        </div>
        <div class="result-cell bad">
          <span class="cell-bar"></span>
          <em>遮挡</em>
          <b>{{ viewshed.viewshedResult.value.hidden?.length || 0 }}</b>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import * as Cesium from 'cesium'
import { VIEWSHED_CONFIG } from '@/utils/cesium-config'
import TechIcon from '@/components/ui/TechIcon.vue'

const viewshed = inject('viewshed')
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
.viewshed-panel { display: flex; flex-direction: column; gap: 11px; }

.desc { font-size: 11px; line-height: 1.7; color: var(--text-dim); }

.section-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--text-mute);
  font-family: var(--mono);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-label::after { content: ''; flex: 1; height: 1px; background: var(--line); }

.pick-btn {
  width: 100%;
  padding: 10px;
  border-style: dashed;
  border-color: rgba(70, 190, 255, 0.3);
}
.pick-btn.picked {
  border-style: solid;
  color: var(--cyan);
  border-color: rgba(53, 224, 255, 0.42);
  background: rgba(53, 224, 255, 0.08);
}

.coord-box {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 5px;
  overflow: hidden;
}
.coord-row {
  background: rgba(6, 14, 24, 0.85);
  padding: 7px 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.coord-row em { font-style: normal; font-size: 9px; color: var(--text-mute); }
.coord-row b {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  color: #d6ecff;
}
.coord-row b i { font-style: normal; font-size: 8.5px; color: var(--text-mute); margin-left: 1px; }

.param-box {
  padding: 10px 11px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: rgba(10, 20, 34, 0.5);
}
.param-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.param-head span {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--text-mute);
}
.param-head b {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--cyan);
  font-weight: 500;
}
.param-head b i { font-style: normal; font-size: 9px; color: var(--text-mute); }

.run-btn { width: 100%; padding: 10px; }
.run-btn:not(:disabled):hover {
  color: var(--cyan);
  border-color: var(--line-strong);
}
.clear-btn { width: 100%; }
.clear-btn:hover { color: var(--red); border-color: rgba(255, 95, 112, 0.4); }

.result-box { display: flex; flex-direction: column; gap: 8px; }
.result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.result-cell {
  position: relative;
  padding: 10px 11px;
  border-radius: 6px;
  background: rgba(10, 20, 34, 0.6);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}
.result-cell em { font-style: normal; font-size: 9.5px; color: var(--text-mute); letter-spacing: 0.08em; }
.result-cell b {
  font-family: var(--mono);
  font-size: 18px;
  font-weight: 600;
}
.result-cell .cell-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
}
.result-cell.ok b { color: var(--green); }
.result-cell.ok .cell-bar { background: var(--green); box-shadow: 0 0 10px var(--green); }
.result-cell.bad b { color: var(--red); }
.result-cell.bad .cell-bar { background: var(--red); box-shadow: 0 0 10px var(--red); }
</style>
