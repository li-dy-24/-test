# webgis数字校园三维展示系统

Vue3 + Cesium 1.143 + OpenLayers 构建的 WebGIS 数字校园平台。

## 功能

- 🗺️ **2D/3D 双屏联动** — 左侧 OpenLayers 平面地图，右侧 Cesium 三维地球，视角实时同步
- 📍 **实时坐标拾取** — 鼠标在地图上移动时，底部坐标面板实时显示经纬度和海拔高度
- 👁️ **视域分析** — 360° 射线投射算法，计算观察点的可见/不可见区域
- 📏 **空间测量** — 距离、面积、高差三种测量模式
- ✈️ **飞行漫游** — 三条预设校园飞行路线，可暂停/跳转

## 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 (Composition API) | 前端框架 |
| Vite 6 | 构建工具 |
| CesiumJS 1.143 | 3D 地球 + 地形 + 卫星影像 |
| OpenLayers 10 | 2D 平面地图 |
| Pinia | 状态管理 |
| Vue Router | 路由 |

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置 Cesium ion Token
cp .env.example .env
# 编辑 .env，将 VITE_CESIUM_TOKEN 替换为你的 Token

# 3. 启动开发服务器
npm run dev

# 4. 浏览器打开 http://localhost:3000
```

## 项目结构

```
src/
├── views/CampusViewer.vue          # 主页面：左右分屏布局
├── components/
│   ├── cesium/CesiumViewer.vue     # 3D Cesium 场景 + 坐标面板
│   ├── ol/OLMap.vue                # 2D OpenLayers 地图 + 坐标面板
│   ├── tools/
│   │   ├── MeasureTool.vue         # 距离/面积/高差测量
│   │   ├── ViewshedTool.vue        # 视域分析
│   │   └── FlightTool.vue          # 飞行漫游
│   └── layout/
│       ├── SplitPane.vue           # 可拖拽分屏容器
│       ├── SidePanel.vue           # 左侧工具面板
│       └── StatusBar.vue           # 底部状态栏
├── composables/                    # 核心业务逻辑（纯逻辑，无 UI）
│   ├── useCesium.js                # Viewer 初始化 + 空间工具
│   ├── useMeasure.js               # 测量算法
│   ├── useViewshed.js              # 视域分析算法
│   ├── useFlight.js                # 飞行漫游控制
│   └── use2D3DSync.js              # 2D↔3D 视角联动
├── stores/
│   ├── mapStore.js                 # 地图状态 + 联动控制
│   └── campusStore.js              # 校园数据管理
└── utils/
    └── cesium-config.js            # Cesium 全局配置常量
```

## License

MIT
