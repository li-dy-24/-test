/**
 * Cesium 全局配置常量
 */

// Cesium ion Token
export const CESIUM_TOKEN = import.meta.env.VITE_CESIUM_TOKEN || ''

// 河南大学明伦校区中心坐标
export const CAMPUS_CENTER = {
  longitude: Number(import.meta.env.VITE_CAMPUS_LON) || 114.348,
  latitude: Number(import.meta.env.VITE_CAMPUS_LAT) || 34.789,
  height: Number(import.meta.env.VITE_CAMPUS_HEIGHT) || 800
}

// 地形服务
export const TERRAIN_PROVIDER_URL = 'https://assets.ion.cesium.com/asset_depot/1/CesiumWorldTerrain/v1.2/'

// 默认影像源
export const IMAGERY_PROVIDER_URL = 'https://assets.ion.cesium.com/asset_depot/2/BingMapsAerial/'

// 建筑默认样式
export const BUILDING_STYLE = {
  DEFAULT: { color: '#4A90D9', opacity: 0.85 },
  TEACHING: { color: '#E67E22', opacity: 0.85 },
  DORMITORY: { color: '#27AE60', opacity: 0.85 },
  ADMIN: { color: '#8E44AD', opacity: 0.85 },
  LIBRARY: { color: '#F39C12', opacity: 0.85 },
  CAFETERIA: { color: '#E74C3C', opacity: 0.85 },
  SPORTS: { color: '#1ABC9C', opacity: 0.85 },
  HIGHLIGHT: { color: '#FFD700', opacity: 1.0 },
  MEASURE: { color: '#00FFFF', opacity: 1.0 },
  VIEWSHED_VISIBLE: { color: '#00FF00', opacity: 0.6 },
  VIEWSHED_HIDDEN: { color: '#FF0000', opacity: 0.4 }
}

// 视域分析参数
export const VIEWSHED_CONFIG = {
  maxDistance: 500,       // 最大分析距离（米）
  rayCount: 360,          // 射线数量（角度精度）
  stepDistance: 5,        // 采样步长（米）
  observerHeight: 1.7     // 观察者高度（米）
}

// 飞行漫游参数
export const FLIGHT_CONFIG = {
  defaultDuration: 8,     // 默认飞行时长（秒）
  pauseDuration: 3,       // 悬停时长（秒）
  maxPitch: -60           // 最大俯仰角
}
