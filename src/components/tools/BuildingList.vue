<!-- BuildingList — 建筑资产检索与统计 -->
<template>
  <div class="building-list">
    <!-- 检索 -->
    <div class="search-bar">
      <div class="input-wrap">
        <TechIcon name="search" :size="13" />
        <input
          v-model="campusStore.searchQuery"
          type="text"
          placeholder="检索建筑名称…"
          class="tech-input"
        />
      </div>
      <select v-model="campusStore.typeFilter" class="tech-input type-select">
        <option value="all">全部类型</option>
        <option v-for="t in campusStore.buildingTypes" :key="t" :value="t">
          {{ typeLabelMap[t] || t }}
        </option>
      </select>
    </div>

    <div class="list-head">
      <span class="tech-label">结果</span>
      <span class="count">{{ campusStore.filteredBuildings.length }} <i>/ {{ campusStore.buildings.length }}</i></span>
    </div>

    <!-- 列表 -->
    <div class="building-items">
      <div
        v-for="b in campusStore.filteredBuildings"
        :key="b.id"
        class="building-item"
        :class="{ selected: b.id === selectedId }"
        @click="selectBuilding(b)"
      >
        <div class="item-main">
          <span class="item-name">{{ b.name }}</span>
          <span class="item-type">{{ typeLabelMap[b.type] || b.type }}</span>
        </div>
        <div class="item-detail">
          <span><i>层数</i>{{ b.floors }}</span>
          <span><i>面积</i>{{ b.area }}</span>
          <span><i>年代</i>{{ b.built }}</span>
        </div>
      </div>

      <div v-if="!campusStore.filteredBuildings.length" class="empty">
        未匹配到建筑
      </div>
    </div>

    <!-- 统计 -->
    <div class="stats-panel">
      <div class="stats-head">
        <span class="tech-label">类型分布</span>
        <span class="tech-label">COUNT</span>
      </div>
      <div v-for="(stat, type) in campusStore.statsByType" :key="type" class="stat-row">
        <span class="stat-type">{{ typeLabelMap[type] || type }}</span>
        <span class="stat-track">
          <i :style="{ width: barWidth(stat.count) }"></i>
        </span>
        <span class="stat-count">{{ stat.count }}</span>
      </div>
      <div class="stat-total">
        <span>总计</span>
        <b>{{ campusStore.buildings.length }}<i>栋</i></b>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCampusStore } from '@/stores/campusStore'
import TechIcon from '@/components/ui/TechIcon.vue'
import buildingData from '@/data/buildings.json'

const campusStore = useCampusStore()
const selectedId = ref(null)

const typeLabelMap = {
  teaching: '教学楼',
  dormitory: '宿舍',
  admin: '行政',
  library: '图书馆',
  landmark: '地标',
  cafeteria: '食堂',
  sports: '体育'
}

const maxCount = computed(() => {
  const nums = Object.values(campusStore.statsByType).map(s => s.count)
  return nums.length ? Math.max(...nums) : 1
})

function barWidth(count) {
  return `${Math.max(8, (count / maxCount.value) * 100)}%`
}

onMounted(() => {
  campusStore.setBuildings(
    buildingData.features.map(f => ({
      id: f.id,
      name: f.properties.name,
      type: f.properties.type,
      floors: f.properties.floors,
      area: f.properties.area,
      built: f.properties.built,
      style: f.properties.style,
      description: f.properties.description
    }))
  )
})

function selectBuilding(building) {
  selectedId.value = building.id
  window.dispatchEvent(new CustomEvent('highlight-building', {
    detail: { id: building.id, fly: true }
  }))
}
</script>

<style scoped>
.building-list { display: flex; flex-direction: column; gap: 10px; }

/* 检索 */
.search-bar { display: flex; flex-direction: column; gap: 6px; }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap :deep(svg) {
  position: absolute;
  left: 9px;
  color: var(--text-mute);
  pointer-events: none;
}
.input-wrap .tech-input { padding-left: 28px; }
.type-select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--text-mute) 50%),
    linear-gradient(135deg, var(--text-mute) 50%, transparent 50%);
  background-position: calc(100% - 14px) 50%, calc(100% - 9px) 50%;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  cursor: pointer;
}
.type-select option { background: #0a1422; color: var(--text); }

/* 列表头 */
.list-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 2px;
}
.count {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--cyan);
}
.count i { font-style: normal; color: var(--text-mute); font-size: 10px; }

/* 列表 */
.building-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 254px;
  overflow-y: auto;
  padding-right: 2px;
}

.building-item {
  padding: 9px 10px;
  border: 1px solid var(--line);
  border-left: 2px solid rgba(70, 190, 255, 0.22);
  border-radius: 5px;
  background: rgba(14, 27, 44, 0.5);
  cursor: pointer;
  transition: all 0.16s;
}
.building-item:hover {
  border-color: var(--line-strong);
  border-left-color: var(--cyan);
  background: rgba(53, 224, 255, 0.07);
  transform: translateX(2px);
}
.building-item.selected {
  border-color: rgba(53, 224, 255, 0.5);
  border-left-color: var(--cyan);
  background: linear-gradient(90deg, rgba(53, 224, 255, 0.16), rgba(53, 224, 255, 0.03));
  box-shadow: inset 0 0 0 1px rgba(53, 224, 255, 0.12), 0 0 14px rgba(53, 224, 255, 0.08);
}

.item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
}
.item-name {
  font-size: 12.5px;
  font-weight: 500;
  color: #e2eefb;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-type {
  flex-shrink: 0;
  font-size: 9.5px;
  color: var(--cyan);
  background: rgba(53, 224, 255, 0.1);
  border: 1px solid rgba(53, 224, 255, 0.22);
  border-radius: 3px;
  padding: 1px 6px;
  letter-spacing: 0.04em;
}

.item-detail {
  display: flex;
  gap: 12px;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-dim);
}
.item-detail span { display: flex; align-items: baseline; gap: 4px; }
.item-detail i {
  font-style: normal;
  font-size: 9px;
  color: var(--text-mute);
}

.empty {
  padding: 22px 0;
  text-align: center;
  font-size: 11px;
  color: var(--text-mute);
  border: 1px dashed var(--line);
  border-radius: 6px;
}

/* 统计 */
.stats-panel {
  border-top: 1px solid var(--line);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stats-head { display: flex; justify-content: space-between; margin-bottom: 2px; }

.stat-row {
  display: grid;
  grid-template-columns: 52px 1fr 22px;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  color: var(--text-dim);
}
.stat-track {
  height: 3px;
  border-radius: 2px;
  background: rgba(70, 190, 255, 0.1);
  overflow: hidden;
}
.stat-track i {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(53, 224, 255, 0.55), var(--cyan));
  box-shadow: 0 0 8px rgba(53, 224, 255, 0.5);
  transition: width 0.3s;
}
.stat-count {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--cyan);
  text-align: right;
}

.stat-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--line);
  font-size: 10.5px;
  color: var(--text-mute);
  letter-spacing: 0.06em;
}
.stat-total b {
  font-family: var(--mono);
  font-size: 16px;
  color: var(--gold);
  font-weight: 600;
  text-shadow: 0 0 14px rgba(255, 201, 74, 0.35);
}
.stat-total b i {
  font-style: normal;
  font-size: 9.5px;
  color: var(--text-mute);
  margin-left: 3px;
}
</style>
