<template>
  <div class="building-list">
    <div class="search-bar">
      <input
        v-model="campusStore.searchQuery"
        type="text"
        placeholder="搜索建筑..."
        class="search-input"
      />
      <select v-model="campusStore.typeFilter" class="type-select">
        <option value="all">全部类型</option>
        <option v-for="t in campusStore.buildingTypes" :key="t" :value="t">{{ typeLabelMap[t] || t }}</option>
      </select>
    </div>

    <div class="list-stats">
      共 {{ campusStore.filteredBuildings.length }} 栋建筑
    </div>

    <div class="building-items">
      <div
        v-for="b in campusStore.filteredBuildings"
        :key="b.id"
        class="building-item"
        :class="{ selected: b.id === selectedId }"
        @click="selectBuilding(b)"
      >
        <div class="item-header">
          <span class="item-name">{{ b.name }}</span>
          <span class="item-type">{{ typeLabelMap[b.type] || b.type }}</span>
        </div>
        <div class="item-detail">
          <span>{{ b.floors }}层</span>
          <span>{{ b.area }}</span>
          <span>{{ b.built }}</span>
        </div>
      </div>
    </div>

    <!-- 统计面板 -->
    <div class="stats-panel">
      <h5>校园统计</h5>
      <div v-for="(stat, type) in campusStore.statsByType" :key="type" class="stat-row">
        <span class="stat-type">{{ typeLabelMap[type] || type }}</span>
        <span class="stat-count">{{ stat.count }} 栋</span>
      </div>
      <div class="stat-total">
        <strong>总计: {{ campusStore.buildings.length }} 栋建筑</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCampusStore } from '@/stores/campusStore'
import buildingData from '@/data/buildings.json'
import { onMounted } from 'vue'

const campusStore = useCampusStore()
const selectedId = ref(null)

const typeLabelMap = {
  teaching: '🏫 教学楼',
  dormitory: '🏠 宿舍',
  admin: '🏢 行政',
  library: '📚 图书馆',
  landmark: '🏛️ 地标',
  cafeteria: '🍽️ 食堂',
  sports: '⚽ 体育'
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
  // 通知 3D 场景高亮 + 飞行
  window.dispatchEvent(new CustomEvent('highlight-building', {
    detail: { id: building.id, fly: true }
  }))
}
</script>

<style scoped>
.building-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-bar {
  display: flex;
  gap: 4px;
}

.search-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 11px;
}

.type-select {
  padding: 6px 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 11px;
  background: #fff;
}

.list-stats {
  font-size: 10px;
  color: #888;
}

.building-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 280px;
  overflow-y: auto;
}

.building-item {
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.building-item:hover {
  background: #f0f6ff;
  border-color: #c0d8ff;
}

.building-item.selected {
  background: #e0ecff;
  border-color: #003366;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.item-name {
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.item-type {
  font-size: 10px;
  color: #888;
  background: #f0f0f0;
  padding: 1px 6px;
  border-radius: 3px;
}

.item-detail {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: #aaa;
}

.stats-panel {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
}

.stats-panel h5 {
  margin: 0 0 6px;
  font-size: 12px;
  color: #003366;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #888;
  padding: 2px 0;
}

.stat-total {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #eee;
  font-size: 11px;
  color: #003366;
}
</style>
