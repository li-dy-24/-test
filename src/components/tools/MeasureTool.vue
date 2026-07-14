<!-- 测量工具面板 — 通过 inject 获取 useMeasure 实例 -->
<template>
  <div class="measure-panel">
    <h4>📏 空间测量</h4>
    <div class="mode-btns">
      <button :class="{ active: measure.mode.value === 'distance' }" @click="measure.start('distance')">📏 距离</button>
      <button :class="{ active: measure.mode.value === 'area' }" @click="measure.start('area')">📐 面积</button>
      <button :class="{ active: measure.mode.value === 'height' }" @click="measure.start('height')">↑↓ 高差</button>
    </div>

    <div v-if="measure.mode.value" class="hint">
      <template v-if="measure.mode.value === 'distance'">🖱️ 左键添加测量点 · 双击结束</template>
      <template v-else-if="measure.mode.value === 'area'">🖱️ 左键添加多边形顶点 · 双击闭合</template>
      <template v-else>🖱️ 点击起点（地面）→ 再点终点（建筑顶）</template>
    </div>

    <button v-if="measure.mode.value" class="clear-btn" @click="measure.stop()">清除测量</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'
const measure = inject('measure')
</script>

<style scoped>
h4 { margin:0 0 8px; font-size:13px; color:#036; }
.mode-btns { display:flex; gap:4px; margin-bottom:10px; }
.mode-btns button { flex:1; padding:6px 4px; border:1px solid #ddd; border-radius:4px;
  background:#f8f8f8; font-size:11px; cursor:pointer; transition:.15s; }
.mode-btns button.active { background:#036; color:#fff; border-color:#036; }
.hint { font-size:11px; color:#888; background:#f8f8f8; padding:8px; border-radius:4px; margin-bottom:8px; line-height:1.5; }
.clear-btn { width:100%; padding:6px; border:1px solid #ddd; border-radius:4px;
  background:#fff; font-size:11px; cursor:pointer; color:#999; }
.clear-btn:hover { background:#f0f0f0; }
</style>
