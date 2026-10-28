<!-- FlightTool — 飞行漫游面板 -->
<template>
  <div class="flight-panel">
    <p class="desc">选择预设航线，沿关键视点自动巡航校园。</p>

    <div class="section-label">航线</div>
    <div class="route-list">
      <div
        v-for="(r, i) in flight.routes.value"
        :key="r.id"
        class="route-card"
        :class="{ active: flight.currentRoute.value?.id === r.id && flight.isFlying.value }"
        @click="flight.startFlight(r.id)"
      >
        <div class="route-idx">{{ String(i + 1).padStart(2, '0') }}</div>
        <div class="route-body">
          <div class="route-head">
            <b>{{ r.name }}</b>
            <span class="dur">{{ r.duration }}s</span>
          </div>
          <p class="route-desc">{{ r.description }}</p>
          <div class="route-meta">
            <span>{{ r.waypoints?.length || 0 }} 个视点</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制台 -->
    <div v-if="flight.currentRoute.value && flight.isFlying.value" class="console">
      <div class="console-head">
        <span class="tech-label">RUNNING</span>
        <span class="console-time">{{ flight.flightProgress.value }}%</span>
      </div>

      <div class="progress">
        <div class="fill" :style="{ width: flight.flightProgress.value + '%' }"></div>
        <div class="knob" :style="{ left: flight.flightProgress.value + '%' }"></div>
      </div>

      <div class="waypoint">
        视点 <b>{{ flight.currentWaypointIndex.value + 1 }}</b>
        <i>/ {{ flight.currentRoute.value.waypoints.length }}</i>
      </div>

      <div class="btns">
        <button
          class="ctrl"
          :disabled="flight.currentWaypointIndex.value <= 0"
          title="上一视点"
          @click="flight.skipWaypoint('prev')"
        >
          <TechIcon name="prev" :size="15" />
        </button>

        <button class="ctrl primary" :title="flight.isPaused.value ? '继续' : '暂停'" @click="flight.pauseFlight()">
          <TechIcon :name="flight.isPaused.value ? 'play' : 'pause'" :size="15" />
        </button>

        <button
          class="ctrl"
          :disabled="flight.currentWaypointIndex.value >= flight.currentRoute.value.waypoints.length - 1"
          title="下一视点"
          @click="flight.skipWaypoint('next')"
        >
          <TechIcon name="next" :size="15" />
        </button>

        <button class="ctrl stop" title="结束漫游" @click="flight.stopFlight()">
          <TechIcon name="stop" :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import TechIcon from '@/components/ui/TechIcon.vue'

const flight = inject('flight')
</script>

<style scoped>
.flight-panel { display: flex; flex-direction: column; gap: 11px; }

.desc { font-size: 11px; line-height: 1.7; color: var(--text-dim); }

.section-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--text-mute);
  font-family: var(--mono);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-label::after { content: ''; flex: 1; height: 1px; background: var(--line); }

/* 航线卡片 */
.route-list { display: flex; flex-direction: column; gap: 7px; }

.route-card {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: rgba(14, 27, 44, 0.45);
  cursor: pointer;
  transition: all 0.16s;
}
.route-card:hover {
  border-color: var(--line-strong);
  background: rgba(53, 224, 255, 0.06);
  transform: translateX(2px);
}
.route-card.active {
  border-color: rgba(53, 224, 255, 0.5);
  background: linear-gradient(90deg, rgba(53, 224, 255, 0.15), rgba(53, 224, 255, 0.02));
  box-shadow: 0 0 16px rgba(53, 224, 255, 0.1);
}

.route-idx {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--cyan);
  opacity: 0.85;
  padding-top: 1px;
}
.route-body { flex: 1; min-width: 0; }
.route-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.route-head b {
  font-size: 12.5px;
  font-weight: 500;
  color: #e2eefb;
  letter-spacing: 0.02em;
}
.dur {
  font-family: var(--mono);
  font-size: 9.5px;
  color: var(--text-mute);
}
.route-desc {
  font-size: 10.5px;
  color: var(--text-mute);
  line-height: 1.5;
  margin-top: 4px;
}
.route-meta {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(80, 100, 120, 0.9);
  margin-top: 5px;
}

/* 控制台 */
.console {
  padding: 11px;
  border: 1px solid rgba(53, 224, 255, 0.22);
  border-radius: 7px;
  background:
    linear-gradient(160deg, rgba(53, 224, 255, 0.09), rgba(10, 20, 34, 0.6));
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.console-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.console-time {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--cyan);
}

.progress {
  position: relative;
  height: 4px;
  border-radius: 2px;
  background: rgba(70, 190, 255, 0.12);
  overflow: visible;
}
.progress .fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--cyan), var(--blue));
  box-shadow: 0 0 10px rgba(53, 224, 255, 0.55);
  transition: width 0.3s;
}
.progress .knob {
  position: absolute;
  top: 50%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #04121c;
  border: 1.5px solid var(--cyan);
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px rgba(53, 224, 255, 0.8);
  transition: left 0.3s;
}

.waypoint {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-mute);
  text-align: center;
}
.waypoint b { color: var(--cyan); font-size: 11.5px; }
.waypoint i { font-style: normal; }

.btns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.ctrl {
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: rgba(6, 14, 24, 0.7);
  color: var(--text-dim);
  transition: all 0.18s;
}
.ctrl:hover:not(:disabled) { color: var(--cyan); border-color: var(--line-strong); background: rgba(53, 224, 255, 0.1); }
.ctrl:disabled { opacity: 0.28; cursor: not-allowed; }
.ctrl.primary {
  color: #04121c;
  background: linear-gradient(135deg, var(--cyan), #1fc4e8);
  border-color: transparent;
  box-shadow: 0 0 14px rgba(53, 224, 255, 0.3);
}
.ctrl.stop:hover { color: var(--red); border-color: rgba(255, 95, 112, 0.4); background: rgba(255, 95, 112, 0.1); }
</style>
