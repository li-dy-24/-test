<!--
  SidePanel — 左侧工具面板
  
  Tab 切换显示：建筑列表 / 测量 / 视域 / 飞行漫游
  通过 inject 从 CampusViewer 获取工具 composable 实例
-->
<template>
  <div class="side-panel" :class="{ collapsed }">
    <button class="toggle-btn" @click="collapsed = !collapsed">
      {{ collapsed ? '▶' : '◀' }}
    </button>

    <div v-if="!collapsed" class="panel-body">
      <div class="tabs">
        <button v-for="t in tabs" :key="t.key" class="tab"
          :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </div>

      <div class="tab-content">
        <BuildingList v-if="tab === 'buildings'" />
        <MeasureTool v-else-if="tab === 'measure'" />
        <ViewshedTool v-else-if="tab === 'viewshed'" />
        <FlightTool v-else-if="tab === 'flight'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BuildingList from '@/components/tools/BuildingList.vue'
import MeasureTool from '@/components/tools/MeasureTool.vue'
import ViewshedTool from '@/components/tools/ViewshedTool.vue'
import FlightTool from '@/components/tools/FlightTool.vue'

const collapsed = ref(false)
const tab = ref('buildings')

const tabs = [
  { key: 'buildings', label: '🏛️ 建筑' },
  { key: 'measure', label: '📏 测量' },
  { key: 'viewshed', label: '👁️ 视域' },
  { key: 'flight', label: '✈️ 漫游' }
]
</script>

<style scoped>
.side-panel { position:absolute; top:12px; left:12px; z-index:200;
  background:rgba(255,255,255,.96); border-radius:8px;
  box-shadow:0 4px 20px rgba(0,0,0,.15); max-height:calc(100vh - 80px); overflow:hidden; }
.side-panel.collapsed { width:36px; height:36px; }
.toggle-btn { position:absolute; top:6px; right:6px; width:24px; height:24px;
  border:none; background:none; cursor:pointer; font-size:12px; color:#999; z-index:10; }
.panel-body { width:300px; max-height:calc(100vh - 80px); display:flex; flex-direction:column; }
.tabs { display:flex; border-bottom:1px solid #eee; }
.tab { flex:1; padding:10px 4px; border:none; background:none; cursor:pointer;
  font-size:11px; color:#888; border-bottom:2px solid transparent; transition:.2s; }
.tab.active { color:#036; border-bottom-color:#036; font-weight:bold; }
.tab-content { padding:10px 12px; overflow-y:auto; flex:1; }
</style>
