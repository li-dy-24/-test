/**
 * useBuildings — 建筑数据加载与管理
 *
 * 职责：
 * 1. 将 GeoJSON 建筑数据渲染为 Cesium 挤出多边形实体
 * 2. 建筑点击高亮 / 取消高亮
 * 3. 建筑信息查询
 */
import { ref } from 'vue'
import * as Cesium from 'cesium'
import { BUILDING_STYLE } from '@/utils/cesium-config'

export function useBuildings() {
  const buildingEntities = ref([])    // 所有建筑实体引用
  const highlightedEntity = ref(null) // 当前高亮的建筑

  /**
   * 加载 GeoJSON 建筑数据并渲染为 3D 挤出多边形
   * @param {Object} geojson — GeoJSON FeatureCollection
   * @param {Cesium.Viewer} viewer — Cesium Viewer 实例
   * @returns {Array} 建筑实体列表
   */
  function loadBuildings(geojson, viewer) {
    if (!viewer || !geojson?.features) {
      console.warn('[Buildings] Viewer 未就绪或无建筑数据')
      return []
    }

    clearBuildings(viewer)
    const entities = []
    console.log(`[Buildings] 加载 ${geojson.features.length} 栋建筑...`)

    geojson.features.forEach(feature => {
      const props = feature.properties
      const geom = feature.geometry
      if (geom.type !== 'Polygon') return

      // 多边形坐标展平: [[lon,lat],...] → [lon,lat,lon,lat,...]
      const coords = geom.coordinates[0]
      const positions = []
      coords.forEach(([lon, lat]) => positions.push(lon, lat))

      // 建筑高度: 楼层 × 3.5m + 额外高度 × 0.3
      const buildingHeight = (props.floors || 3) * 3.5 + (props.height || 0) * 0.3

      // 按建筑类型着色
      const style = BUILDING_STYLE[props.type?.toUpperCase()] || BUILDING_STYLE.DEFAULT
      const color = Cesium.Color.fromCssColorString(style.color).withAlpha(style.opacity)

      // 创建挤出多边形实体（height:0 贴地, extrudedHeight 向上挤出）
      const entity = viewer.entities.add({
        id: feature.id,
        name: props.name,
        description: formatBuildingHTML(props),
        properties: props,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
          // 直接设置挤出高度（从椭球面向上），不用 heightReference 避免地形依赖
          extrudedHeight: buildingHeight,
          material: color,
          outline: true,
          outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
          outlineWidth: 1,
          closeTop: true,
          closeBottom: true
        }
      })

      // 建筑顶部标签
      const [cx, cy] = getCentroid(coords)
      viewer.entities.add({
        id: `${feature.id}-label`,
        parent: entity,
        position: Cesium.Cartesian3.fromDegrees(cx, cy, buildingHeight + 2),
        label: {
          text: props.name,
          font: '11px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -5),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      })

      entities.push(entity)
    })

    buildingEntities.value = entities
    console.log(`[Buildings] ✅ 渲染完成: ${entities.length} 栋`)
    return entities
  }

  /** 生成建筑详情 HTML（用于弹窗展示） */
  function formatBuildingHTML(props) {
    const typeLabels = {
      teaching: '🏫 教学楼', dormitory: '🏠 宿舍', admin: '🏢 行政',
      library: '📚 图书馆', landmark: '🏛️ 地标', cafeteria: '🍽️ 食堂', sports: '⚽ 体育'
    }
    const t = typeLabels[props.type] || props.type
    return `<div style="font:14px sans-serif;padding:8px;max-width:320px">
      <h3 style="margin:0 0 8px;color:#036;font-size:16px">${props.name}</h3>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <span style="background:#E8F0FE;padding:2px 8px;border-radius:4px;font-size:12px">${t}</span>
        <span style="background:#E8F0FE;padding:2px 8px;border-radius:4px;font-size:12px">${props.floors}层</span>
        <span style="background:#E8F0FE;padding:2px 8px;border-radius:4px;font-size:12px">${props.area}</span>
      </div>
      <p style="font-size:13px;color:#444;line-height:1.6;margin:0 0 8px">${props.description}</p>
      <div style="font-size:11px;color:#888">
        建成:${props.built}  |  风格:${props.style || '现代'}
      </div></div>`
  }

  /** 高亮指定建筑 */
  function highlightBuilding(entityId, viewer) {
    if (!viewer) return
    if (highlightedEntity.value) resetBuildingStyle(highlightedEntity.value)
    const entity = viewer.entities.getById(entityId)
    if (!entity?.polygon) return
    const s = BUILDING_STYLE.HIGHLIGHT
    entity.polygon.material = Cesium.Color.fromCssColorString(s.color).withAlpha(s.opacity)
    entity.polygon.outlineColor = Cesium.Color.WHITE
    entity.polygon.outlineWidth = 3
    highlightedEntity.value = entity
  }

  /** 恢复建筑原样式 */
  function resetBuildingStyle(entity) {
    if (!entity?.properties) return
    const type = entity.properties.type?.getValue()
    const s = BUILDING_STYLE[type?.toUpperCase()] || BUILDING_STYLE.DEFAULT
    entity.polygon.material = Cesium.Color.fromCssColorString(s.color).withAlpha(s.opacity)
    entity.polygon.outlineColor = Cesium.Color.WHITE.withAlpha(0.3)
    entity.polygon.outlineWidth = 1
  }

  /** 查询建筑属性 */
  function getBuildingInfo(entityId, viewer) {
    if (!viewer) return null
    const e = viewer.entities.getById(entityId)
    if (!e?.properties) return null
    return {
      id: entityId, name: e.name,
      type: e.properties.type?.getValue(),
      floors: e.properties.floors?.getValue(),
      height: e.properties.height?.getValue(),
      area: e.properties.area?.getValue(),
      built: e.properties.built?.getValue(),
      style: e.properties.style?.getValue(),
      description: e.properties.description?.getValue()
    }
  }

  /** 清除所有建筑 */
  function clearBuildings(viewer) {
    if (!viewer) return
    buildingEntities.value.forEach(e => {
      viewer.entities.remove(e)
      const lab = viewer.entities.getById(`${e.id}-label`)
      if (lab) viewer.entities.remove(lab)
    })
    buildingEntities.value = []
    highlightedEntity.value = null
  }

  /** 多边形质心 */
  function getCentroid(coords) {
    let sx = 0, sy = 0
    coords.forEach(([x, y]) => { sx += x; sy += y })
    return [sx / coords.length, sy / coords.length]
  }

  return {
    buildingEntities, highlightedEntity,
    loadBuildings, highlightBuilding, resetBuildingStyle,
    getBuildingInfo, clearBuildings
  }
}
