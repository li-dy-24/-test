import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 校园数据管理
 * 管理建筑 GeoJSON、分类统计、搜索过滤
 */
export const useCampusStore = defineStore('campus', () => {
  const buildings = ref([])
  const isLoading = ref(false)
  const searchQuery = ref('')
  const typeFilter = ref('all')

  // 建筑类型列表
  const buildingTypes = computed(() => {
    const types = new Set(buildings.value.map(b => b.type))
    return Array.from(types).sort()
  })

  // 根据搜索和类型过滤后的建筑
  const filteredBuildings = computed(() => {
    let result = buildings.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q)
      )
    }
    if (typeFilter.value !== 'all') {
      result = result.filter(b => b.type === typeFilter.value)
    }
    return result
  })

  // 按类型分组统计
  const statsByType = computed(() => {
    const stats = {}
    buildings.value.forEach(b => {
      if (!stats[b.type]) {
        stats[b.type] = { count: 0, totalFloors: 0 }
      }
      stats[b.type].count++
      stats[b.type].totalFloors += b.floors || 0
    })
    return stats
  })

  function setBuildings(data) {
    buildings.value = data
  }

  function getBuildingByName(name) {
    return buildings.value.find(b => b.name === name) || null
  }

  function getBuildingById(id) {
    return buildings.value.find(b => b.id === id) || null
  }

  return {
    buildings,
    isLoading,
    searchQuery,
    typeFilter,
    buildingTypes,
    filteredBuildings,
    statsByType,
    setBuildings,
    getBuildingByName,
    getBuildingById
  }
})
