<!--
  RightSidebar — 右侧菜单栏
  结构：最右侧图标导航条（rail） + 向左展开的功能抽屉（drawer）
  取代原先浮在 3D 场景上的左侧工具面板
-->
<template>
  <aside class="right-bar">
    <!-- 抽屉 -->
    <section class="drawer" v-show="open">
      <header class="d-head">
        <div class="d-title">
          <span class="d-code">{{ current.code }}</span>
          <div>
            <h2>{{ current.label }}</h2>
            <p>{{ current.en }}</p>
          </div>
        </div>
        <button class="d-close" title="收起面板" @click="$emit('update:open', false)">
          <TechIcon name="close" :size="14" />
        </button>
      </header>

      <div class="d-body">
        <BuildingList v-if="modelValue === 'buildings'" />
        <MeasureTool v-else-if="modelValue === 'measure'" />
        <ViewshedTool v-else-if="modelValue === 'viewshed'" />
        <FlightTool v-else-if="modelValue === 'flight'" />
      </div>

      <footer class="d-foot">
        <span class="tech-label">{{ current.en }} MODULE</span>
        <span class="d-foot-line"></span>
        <span class="tech-label">HENU · GIS</span>
      </footer>
    </section>

    <!-- 图标导航条 -->
    <div class="rail">
      <div class="rail-top">
        <span class="rail-brand">工具</span>
      </div>

      <button
        v-for="m in MODULES"
        :key="m.key"
        class="rail-item"
        :class="{ active: open && modelValue === m.key }"
        @click="select(m.key)"
      >
        <i class="rail-bar"></i>
        <TechIcon :name="m.icon" :size="19" />
        <span class="rail-tip">{{ m.label }}</span>
      </button>

      <div class="rail-spacer"></div>

      <button class="rail-item home" @click="$emit('home')">
        <TechIcon name="home" :size="18" />
        <span class="rail-tip">回到校园</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import TechIcon from '@/components/ui/TechIcon.vue'
import BuildingList from '@/components/tools/BuildingList.vue'
import MeasureTool from '@/components/tools/MeasureTool.vue'
import ViewshedTool from '@/components/tools/ViewshedTool.vue'
import FlightTool from '@/components/tools/FlightTool.vue'
import { MODULES } from '@/config/modules'

const props = defineProps({
  modelValue: { type: String, default: 'buildings' },
  open: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue', 'update:open', 'home'])

const current = computed(
  () => MODULES.find(m => m.key === props.modelValue) || MODULES[0]
)

/** 点击当前已展开的模块 → 收起抽屉；否则切换并展开 */
function select(key) {
  if (props.modelValue === key && props.open) {
    emit('update:open', false)
    return
  }
  emit('update:modelValue', key)
  emit('update:open', true)
}
</script>

<style scoped>
.right-bar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: stretch;
  z-index: 400;
  pointer-events: none;
}
.right-bar > * { pointer-events: auto; }

/* ---------- 抽屉 ---------- */
.drawer {
  width: var(--w-drawer);
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(9, 19, 33, 0.94), rgba(5, 11, 20, 0.96));
  border-left: 1px solid var(--line);
  box-shadow: -18px 0 44px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  animation: drawerIn 0.22s cubic-bezier(0.22, 0.8, 0.3, 1);
}
@keyframes drawerIn {
  from { opacity: 0; transform: translateX(14px); }
  to { opacity: 1; transform: translateX(0); }
}

.d-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px 12px 16px;
  border-bottom: 1px solid var(--line);
  position: relative;
}
.d-head::after {
  content: '';
  position: absolute;
  left: 16px;
  bottom: -1px;
  width: 42px;
  height: 1px;
  background: var(--cyan);
  box-shadow: 0 0 10px var(--cyan);
}
.d-title { display: flex; align-items: center; gap: 10px; }
.d-code {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--cyan);
  border: 1px solid rgba(53, 224, 255, 0.35);
  border-radius: 3px;
  padding: 2px 5px;
  background: rgba(53, 224, 255, 0.08);
}
.d-title h2 {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #eaf4ff;
  line-height: 1.2;
}
.d-title p {
  font-family: var(--mono);
  font-size: 8.5px;
  letter-spacing: 0.2em;
  color: var(--text-mute);
  margin-top: 2px;
}
.d-close {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--text-mute);
  transition: all 0.18s;
}
.d-close:hover {
  color: var(--cyan);
  border-color: var(--line);
  background: rgba(53, 224, 255, 0.08);
}

.d-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px 14px 18px;
}

.d-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-top: 1px solid var(--line);
  background: rgba(4, 10, 18, 0.5);
}
.d-foot-line { flex: 1; height: 1px; background: var(--line); }

/* ---------- 图标导航条 ---------- */
.rail {
  width: var(--w-rail);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  gap: 4px;
  background: linear-gradient(180deg, rgba(7, 15, 26, 0.97), rgba(4, 9, 16, 0.97));
  border-left: 1px solid var(--line);
  backdrop-filter: blur(16px);
}
.rail-top {
  padding-bottom: 9px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--line);
  width: 34px;
  display: grid;
  place-items: center;
}
.rail-brand {
  font-size: 9px;
  letter-spacing: 0.24em;
  color: var(--text-mute);
}
.rail-spacer { flex: 1; }

.rail-item {
  position: relative;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-dim);
  transition: all 0.18s;
}
.rail-item:hover {
  color: var(--cyan);
  background: rgba(53, 224, 255, 0.08);
  border-color: var(--line);
}
.rail-item.active {
  color: var(--cyan);
  background: linear-gradient(135deg, rgba(53, 224, 255, 0.18), rgba(47, 124, 255, 0.06));
  border-color: rgba(53, 224, 255, 0.32);
  box-shadow: inset 0 0 14px rgba(53, 224, 255, 0.12);
}
.rail-bar {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 2px;
  height: 20px;
  border-radius: 2px;
  background: var(--cyan);
  box-shadow: 0 0 10px var(--cyan);
  transition: transform 0.2s;
}
.rail-item.active .rail-bar { transform: translateY(-50%) scaleY(1); }

.rail-item.home { color: var(--text-mute); }
.rail-item.home:hover { color: var(--gold); background: rgba(255, 201, 74, 0.08); border-color: rgba(255, 201, 74, 0.3); }

/* 悬浮提示 */
.rail-tip {
  position: absolute;
  right: 46px;
  top: 50%;
  transform: translateY(-50%) translateX(6px);
  padding: 4px 9px;
  font-size: 10.5px;
  letter-spacing: 0.06em;
  white-space: nowrap;
  color: var(--text);
  background: rgba(4, 10, 18, 0.95);
  border: 1px solid var(--line-strong);
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.16s;
  z-index: 10;
}
.rail-item:hover .rail-tip { opacity: 1; transform: translateY(-50%) translateX(0); }
</style>
