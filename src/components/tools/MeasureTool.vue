<!-- MeasureTool — 空间测量面板 -->
<template>
  <div class="measure-panel">
    <p class="desc">
      在三维场景中拾取点位，实时计算距离、投影面积与高差。
    </p>

    <div class="section-label">测量模式</div>
    <div class="mode-grid">
      <button
        v-for="m in MODES"
        :key="m.key"
        class="tech-btn mode-btn"
        :class="{ active: measure.mode.value === m.key }"
        @click="measure.start(m.key)"
      >
        <TechIcon :name="m.icon" :size="15" />
        <span>{{ m.label }}</span>
      </button>
    </div>

    <transition name="slide">
      <div v-if="measure.mode.value" class="hint">
        <span class="hint-dot"></span>
        <p v-if="measure.mode.value === 'distance'">左键添加测量点，双击结束并输出总距离</p>
        <p v-else-if="measure.mode.value === 'area'">左键添加多边形顶点，双击闭合计算面积</p>
        <p v-else>点击起点（地面）→ 再点终点（建筑顶）计算高差</p>
      </div>
    </transition>

    <button v-if="measure.mode.value" class="tech-btn danger clear-btn" @click="measure.stop()">
      <TechIcon name="close" :size="13" />
      清除测量
    </button>

    <div class="tip-card">
      <span class="tech-label">操作提示</span>
      <ul>
        <li>测量结果直接绘制在三维场景中</li>
        <li>切换模式会自动结束上一次测量</li>
        <li>距离单位自动在 m / km 之间换算</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import TechIcon from '@/components/ui/TechIcon.vue'

const measure = inject('measure')

const MODES = [
  { key: 'distance', label: '距离', icon: 'ruler' },
  { key: 'area', label: '面积', icon: 'layers' },
  { key: 'height', label: '高差', icon: 'target' }
]
</script>

<style scoped>
.measure-panel { display: flex; flex-direction: column; gap: 12px; }

.desc {
  font-size: 11px;
  line-height: 1.7;
  color: var(--text-dim);
}

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
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.mode-btn {
  flex-direction: column;
  gap: 5px;
  padding: 11px 4px;
  font-size: 11px;
}

.hint {
  display: flex;
  gap: 9px;
  padding: 10px;
  border-radius: 6px;
  background: rgba(53, 224, 255, 0.06);
  border: 1px solid rgba(53, 224, 255, 0.2);
  border-left: 2px solid var(--cyan);
}
.hint p {
  font-size: 10.5px;
  line-height: 1.6;
  color: var(--text-dim);
}
.hint-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
  margin-top: 5px;
  flex-shrink: 0;
  animation: pulse 1.6s ease-in-out infinite;
}

.clear-btn { width: 100%; }
.clear-btn:hover { color: var(--red); border-color: rgba(255, 95, 112, 0.45); background: rgba(255, 95, 112, 0.08); }

.tip-card {
  margin-top: 2px;
  padding: 11px;
  border: 1px dashed var(--line);
  border-radius: 6px;
  background: rgba(10, 20, 34, 0.4);
}
.tip-card ul {
  list-style: none;
  margin-top: 7px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.tip-card li {
  font-size: 10.5px;
  color: var(--text-mute);
  line-height: 1.5;
  padding-left: 11px;
  position: relative;
}
.tip-card li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 4px;
  height: 4px;
  border-radius: 1px;
  background: rgba(53, 224, 255, 0.5);
  transform: rotate(45deg);
}

.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
