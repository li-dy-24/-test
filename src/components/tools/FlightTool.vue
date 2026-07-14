<!-- 飞行漫游面板 — 通过 inject 获取 useFlight 实例 -->
<template>
  <div class="flight-panel">
    <h4>✈️ 飞行漫游</h4>

    <div class="route-list">
      <div v-for="r in flight.routes.value" :key="r.id" class="route-card"
        :class="{ active: flight.currentRoute.value?.id === r.id && flight.isFlying.value }"
        @click="flight.startFlight(r.id)">
        <div class="route-head">
          <b>{{ r.name }}</b>
          <span class="dur">{{ r.duration }}s</span>
        </div>
        <p class="route-desc">{{ r.description }}</p>
      </div>
    </div>

    <!-- 飞行控制条 -->
    <div v-if="flight.currentRoute.value && flight.isFlying.value" class="controls">
      <div class="progress"><div class="fill" :style="{ width: flight.flightProgress.value + '%' }"></div></div>
      <small>{{ flight.flightProgress.value }}% · {{ flight.currentWaypointIndex.value + 1 }}/{{ flight.currentRoute.value.waypoints.length }}</small>
      <div class="btns">
        <button @click="flight.skipWaypoint('prev')" :disabled="flight.currentWaypointIndex.value <= 0">⏮</button>
        <button class="primary" @click="flight.pauseFlight()">{{ flight.isPaused.value ? '▶' : '⏸' }}</button>
        <button @click="flight.skipWaypoint('next')" :disabled="flight.currentWaypointIndex.value >= flight.currentRoute.value.waypoints.length - 1">⏭</button>
        <button class="stop" @click="flight.stopFlight()">⏹</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
const flight = inject('flight')
</script>

<style scoped>
h4 { margin:0 0 8px; font-size:13px; color:#036; }
.route-list { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.route-card { padding:8px 10px; border:1px solid #eee; border-radius:6px; cursor:pointer; transition:.15s; }
.route-card:hover { border-color:#036; background:#f0f6ff; }
.route-card.active { border-color:#036; background:#e0ecff; }
.route-head { display:flex; justify-content:space-between; font-size:12px; }
.dur { font-size:10px; color:#999; }
.route-desc { font-size:10px; color:#888; margin:2px 0 0; }
.controls { margin-top:8px; }
.progress { height:4px; background:#eee; border-radius:2px; overflow:hidden; margin-bottom:4px; }
.fill { height:100%; background:linear-gradient(90deg,#036,#06c); transition:.3s; }
.controls small { display:block; text-align:center; color:#888; margin-bottom:6px; }
.btns { display:flex; gap:4px; justify-content:center; }
.btns button { width:36px; height:36px; border:1px solid #ddd; border-radius:4px; background:#fff; font-size:14px; cursor:pointer; }
.btns button:disabled { opacity:.3; }
.btns .primary { background:#036; color:#fff; border-color:#036; }
.btns .stop { color:#e74c3c; }
</style>
