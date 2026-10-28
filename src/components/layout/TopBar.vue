<!--
  TopBar — 顶部菜单栏
  左：品牌标识 ｜ 中：模块导航 ｜ 右：实时时钟 / 联动态 / 全屏
-->
<template>
  <header class="top-bar">
    <!-- 品牌 -->
    <div class="brand">
      <div class="brand-mark">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M16 3.2 27.4 9.6v12.8L16 28.8 4.6 22.4V9.6L16 3.2Z"
            stroke="url(#bg1)" stroke-width="1.5" />
          <path d="M16 3.2v9.4l11.4 6.4M16 12.6 4.6 19" stroke="rgba(53,224,255,.45)" stroke-width="1" />
          <circle cx="16" cy="16" r="2.4" fill="#35e0ff" />
          <defs>
            <linearGradient id="bg1" x1="4" y1="3" x2="28" y2="29">
              <stop stop-color="#35e0ff" />
              <stop offset="1" stop-color="#2f7cff" stop-opacity=".25" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="brand-text">
        <h1>河南大学<span>·</span>数字校园</h1>
        <p>DIGITAL CAMPUS 3D</p>
      </div>
    </div>

    <!-- 模块导航 -->
    <nav class="nav">
      <button
        v-for="m in MODULES"
        :key="m.key"
        class="nav-item"
        :class="{ active: active === m.key }"
        @click="$emit('update:active', m.key)"
      >
        <span class="nav-code">{{ m.code }}</span>
        <span class="nav-label">{{ m.label }}</span>
      </button>
    </nav>

    <!-- 状态区 -->
    <div class="utils">
      <div class="clock">
        <b>{{ clock.time }}</b>
        <span>{{ clock.date }}</span>
      </div>

      <button class="chip" :class="{ on: syncEnabled }" @click="$emit('toggle-sync')">
        <i class="dot"></i>
        <span>{{ syncEnabled ? '二三维联动' : '联动已关闭' }}</span>
      </button>

      <button class="icon-btn" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round">
          <path v-if="!isFullscreen" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          <path v-else d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { MODULES } from '@/config/modules'

defineProps({
  active: { type: String, default: 'buildings' },
  syncEnabled: { type: Boolean, default: true }
})
defineEmits(['update:active', 'toggle-sync'])

// ===== 实时时钟 =====
const clock = reactive({ time: '--:--:--', date: '' })
let timer = null

function tick() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  clock.time = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  clock.date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})
onUnmounted(() => clearInterval(timer))

// ===== 全屏 =====
const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

function onFsChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => document.addEventListener('fullscreenchange', onFsChange))
onUnmounted(() => document.removeEventListener('fullscreenchange', onFsChange))
</script>

<style scoped>
.top-bar {
  height: var(--h-top);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 16px 0 14px;
  background:
    linear-gradient(180deg, rgba(8, 17, 30, 0.98), rgba(5, 11, 20, 0.94));
  border-bottom: 1px solid var(--line);
  position: relative;
  z-index: 600;
}
/* 底边扫描光 */
.top-bar::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(53, 224, 255, 0.85) 18%, rgba(47, 124, 255, 0.5) 55%, transparent);
  opacity: 0.75;
}

/* ---------- 品牌 ---------- */
.brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.brand-mark {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  filter: drop-shadow(0 0 8px rgba(53, 224, 255, 0.35));
}
.brand-mark svg { width: 32px; height: 32px; }
.brand-text h1 {
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #eaf4ff;
  line-height: 1.2;
  white-space: nowrap;
}
.brand-text h1 span { color: var(--cyan); margin: 0 3px; }
.brand-text p {
  font-family: var(--mono);
  font-size: 8.5px;
  letter-spacing: 0.2em;
  color: var(--text-mute);
  margin-top: 2px;
  white-space: nowrap;
}

/* ---------- 导航 ---------- */
.nav {
  display: flex;
  align-items: stretch;
  gap: 2px;
  height: 100%;
  margin-left: 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  position: relative;
  transition: color 0.18s, background 0.18s;
}
.nav-item .nav-code {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--text-mute);
  transition: color 0.18s;
}
.nav-item .nav-label {
  font-size: 12.5px;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.nav-item .nav-en {
  font-family: var(--mono);
  font-size: 8px;
  letter-spacing: 0.14em;
  color: rgba(80, 100, 120, 0.75);
  margin-left: 1px;
  white-space: nowrap;
}
.nav-item:hover { color: var(--text); background: rgba(53, 224, 255, 0.05); }
.nav-item:hover .nav-code { color: var(--cyan); }
.nav-item.active {
  color: #fff;
  background: linear-gradient(180deg, rgba(53, 224, 255, 0.14), rgba(53, 224, 255, 0));
}
.nav-item.active .nav-code { color: var(--cyan); }
.nav-item.active .nav-label { font-weight: 600; }
.nav-item.active::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 0;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(90deg, transparent, var(--cyan), transparent);
  box-shadow: 0 0 12px rgba(53, 224, 255, 0.8);
}

/* ---------- 右侧状态 ---------- */
.utils {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.clock {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.15;
  padding-right: 10px;
  border-right: 1px solid var(--line);
}
.clock b {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 500;
  color: #eaf4ff;
  letter-spacing: 0.06em;
}
.clock span {
  font-family: var(--mono);
  font-size: 8.5px;
  color: var(--text-mute);
  letter-spacing: 0.1em;
}

.chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 11px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(20, 36, 56, 0.5);
  color: var(--text-dim);
  font-size: 11px;
  transition: all 0.18s;
  white-space: nowrap;
}
.chip .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-mute);
  transition: all 0.2s;
}
.chip.on {
  color: var(--cyan);
  border-color: rgba(53, 224, 255, 0.35);
  background: rgba(53, 224, 255, 0.09);
}
.chip.on .dot {
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
  animation: pulse 2s ease-in-out infinite;
}
.chip:hover { border-color: var(--line-strong); }

.icon-btn {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: rgba(20, 36, 56, 0.5);
  color: var(--text-dim);
  transition: all 0.18s;
}
.icon-btn svg { width: 15px; height: 15px; }
.icon-btn:hover { color: var(--cyan); border-color: var(--line-strong); background: rgba(53, 224, 255, 0.08); }

@media (max-width: 1280px) {
  .nav-item .nav-en { display: none; }
  .brand-text p { display: none; }
}
@media (max-width: 1080px) {
  .nav-item .nav-code { display: none; }
  .nav-item { padding: 0 10px; }
}
</style>
