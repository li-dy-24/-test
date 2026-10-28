<!-- TechIcon — 线性科技风图标集（内联 SVG，继承 currentColor） -->
<template>
  <svg
    class="tech-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- 建筑资产 -->
    <g v-if="name === 'building'">
      <path d="M3 21h18" />
      <path d="M5.5 21V8.2L12 4l6.5 4.2V21" />
      <path d="M9.5 21v-4.6h5V21" />
      <path d="M9.5 10.4h.01M14.5 10.4h.01M9.5 13.4h.01M14.5 13.4h.01" />
    </g>

    <!-- 空间测量 -->
    <g v-else-if="name === 'ruler'">
      <path d="M15.8 3.6 20.4 8.2a1 1 0 0 1 0 1.4L9.6 20.4a1 1 0 0 1-1.4 0L3.6 15.8a1 1 0 0 1 0-1.4L14.4 3.6a1 1 0 0 1 1.4 0Z" />
      <path d="M8.4 9.3l2 2M11.2 6.5l2 2M5.6 12.1l2 2M12.6 15.7l2 2" />
    </g>

    <!-- 视域分析 -->
    <g v-else-if="name === 'eye'">
      <path d="M2.2 12S5.6 5.6 12 5.6 21.8 12 21.8 12 18.4 18.4 12 18.4 2.2 12 2.2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
      <path d="M12 2.2v2M12 19.8v2" />
    </g>

    <!-- 飞行漫游 -->
    <g v-else-if="name === 'plane'">
      <path d="M21.4 2.6 2.9 9.9l7.1 2.6 2.6 7.1 8.8-17Z" />
      <path d="M10 12.5 21.4 2.6" />
    </g>

    <!-- 回到校园 -->
    <g v-else-if="name === 'home'">
      <path d="M3.5 10.6 12 3.6l8.5 7" />
      <path d="M5.6 12.2V20.4h12.8v-8.2" />
      <path d="M10 20.4v-5.2h4v5.2" />
    </g>

    <!-- 图层 -->
    <g v-else-if="name === 'layers'">
      <path d="m12 3.2 8.6 4.6-8.6 4.6L3.4 7.8 12 3.2Z" />
      <path d="m3.4 12.2 8.6 4.6 8.6-4.6" />
      <path d="m3.4 16.4 8.6 4.6 8.6-4.6" />
    </g>

    <!-- 定位 -->
    <g v-else-if="name === 'target'">
      <circle cx="12" cy="12" r="7.4" />
      <path d="M12 2.4v3.2M12 18.4v3.2M2.4 12h3.2M18.4 12h3.2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </g>

    <!-- 关闭 -->
    <g v-else-if="name === 'close'">
      <path d="M6 6l12 12M18 6 6 18" />
    </g>

    <!-- 折叠箭头 -->
    <g v-else-if="name === 'chevron-right'">
      <path d="m9 5 7 7-7 7" />
    </g>

    <!-- 播放 / 暂停 / 步进 / 停止 -->
    <g v-else-if="name === 'play'">
      <path d="M7 4.8v14.4L19 12 7 4.8Z" />
    </g>
    <g v-else-if="name === 'pause'">
      <path d="M8.6 4.8v14.4M15.4 4.8v14.4" />
    </g>
    <g v-else-if="name === 'prev'">
      <path d="M18 5.4v13.2L8.4 12 18 5.4Z" />
      <path d="M5.4 5.4v13.2" />
    </g>
    <g v-else-if="name === 'next'">
      <path d="M6 5.4v13.2L15.6 12 6 5.4Z" />
      <path d="M18.6 5.4v13.2" />
    </g>
    <g v-else-if="name === 'stop'">
      <rect x="6.4" y="6.4" width="11.2" height="11.2" rx="1.4" />
    </g>

    <!-- 搜索 -->
    <g v-else-if="name === 'search'">
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m15.6 15.6 4.2 4.2" />
    </g>

    <!-- 扫描 -->
    <g v-else-if="name === 'scan'">
      <path d="M3.4 8.4V4.6a1.2 1.2 0 0 1 1.2-1.2h3.8M15.6 3.4h3.8a1.2 1.2 0 0 1 1.2 1.2v3.8M20.6 15.6v3.8a1.2 1.2 0 0 1-1.2 1.2h-3.8M8.4 20.6H4.6a1.2 1.2 0 0 1-1.2-1.2v-3.8" />
      <path d="M6.8 12h10.4" />
    </g>

    <!-- 默认：圆点 -->
    <g v-else>
      <circle cx="12" cy="12" r="4" />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, default: 'dot' },
  size: { type: [Number, String], default: 18 },
  strokeWidth: { type: [Number, String], default: 1.6 }
})
</script>

<style scoped>
.tech-icon { display: block; flex-shrink: 0; }
</style>
