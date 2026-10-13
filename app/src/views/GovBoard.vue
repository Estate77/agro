<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getGovBoard, type GovBoard as Board } from "@/api/ext";

const board = ref<Board | null>(null);
const loading = ref(true);
const maxWeek = computed(() => Math.max(1, ...(board.value?.week_scale || [1])));

onMounted(async () => {
  try {
    board.value = await getGovBoard();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <header class="navbar g-navbar">
      <div class="title">监管看板</div>
      <span class="tag" style="background: rgba(255,255,255,0.2); color: #fff">只读 · 驾驶舱镜像</span>
    </header>

    <div class="page">
      <div v-if="loading" class="empty">加载中…</div>
      <template v-else-if="board">
        <!-- KPI -->
        <div class="kpi-grid">
          <div class="kpi">
            <div class="k-num">{{ board.kpi.subjects }}</div>
            <div class="k-label">监管主体</div>
          </div>
          <div class="kpi">
            <div class="k-num">{{ board.kpi.blocks }}</div>
            <div class="k-label">地块数</div>
          </div>
          <div class="kpi">
            <div class="k-num">{{ board.kpi.area_mu }}</div>
            <div class="k-label">面积(亩)</div>
          </div>
          <div class="kpi">
            <div class="k-num">{{ board.kpi.task_done_rate }}%</div>
            <div class="k-label">任务完成率</div>
          </div>
          <div class="kpi">
            <div class="k-num">{{ board.kpi.certified_batches }}</div>
            <div class="k-label">已认证批次</div>
          </div>
          <div class="kpi" :class="{ warn: board.kpi.complaints_open > 0 }">
            <div class="k-num">{{ board.kpi.complaints_open }}</div>
            <div class="k-label">未结投诉</div>
          </div>
        </div>

        <!-- 近 7 日核查量 -->
        <div class="card">
          <b style="font-size: 17px">近 7 日核查 / 抽检量</b>
          <div class="bars mt8">
            <div v-for="(v, i) in board.week_scale" :key="i" class="bar-col">
              <div class="bar" :style="{ height: (v / maxWeek) * 90 + 'px' }">{{ v }}</div>
              <div class="muted" style="font-size: 11px">D-{{ 6 - i }}</div>
            </div>
          </div>
        </div>

        <!-- 告警趋势 -->
        <div class="card">
          <b style="font-size: 17px">告警趋势（本月）</b>
          <div class="alarm-row mt8">
            <div class="alarm red">🔴 高危 {{ board.alarm_trend.high }}</div>
            <div class="alarm yellow">🟡 中危 {{ board.alarm_trend.mid }}</div>
            <div class="alarm green">🟢 提示 {{ board.alarm_trend.low }}</div>
          </div>
          <p class="muted" style="font-size: 13px; margin-bottom: 0">
            高危告警已同步至应急待办，点击「待办」查看处置进度
          </p>
        </div>

        <p class="muted center" style="font-size: 12px">
          数据与 PC 端驾驶舱同源镜像 · 每 5 分钟刷新（演示）
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.g-navbar {
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
.kpi {
  background: #fff;
  border-radius: 14px;
  padding: 14px 8px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(31, 45, 61, 0.06);
}
.k-num {
  font-size: 24px;
  font-weight: 800;
  color: #1d4ed8;
}
.kpi.warn .k-num {
  color: var(--zy-danger);
}
.k-label {
  font-size: 13px;
  color: var(--zy-text-2);
  margin-top: 2px;
}
.bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
  height: 120px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 100%;
}
.bar {
  width: 70%;
  background: linear-gradient(180deg, #3b82f6, #1d4ed8);
  border-radius: 6px 6px 2px 2px;
  color: #fff;
  font-size: 11px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 3px;
}
.alarm-row {
  display: flex;
  gap: 10px;
}
.alarm {
  flex: 1;
  text-align: center;
  padding: 12px 4px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
}
.alarm.red {
  background: #fdeceb;
  color: var(--zy-danger);
}
.alarm.yellow {
  background: #fdf3e3;
  color: #b26a0b;
}
.alarm.green {
  background: var(--zy-primary-soft);
  color: var(--zy-primary);
}
</style>
