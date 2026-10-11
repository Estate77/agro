<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getTelemetry, listBlocks, type Block, type Telemetry } from "@/api/app";

const router = useRouter();
const blocks = ref<Block[]>([]);
const blockId = ref<number | null>(null);
const data = ref<Telemetry | null>(null);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    if (blocks.value.length === 0) {
      const r = await listBlocks({ page: 1, page_size: 50 });
      blocks.value = r.items;
      if (r.items.length) blockId.value = r.items[0].id;
    }
    if (blockId.value) {
      data.value = await getTelemetry(blockId.value);
    }
  } finally {
    loading.value = false;
  }
}

function pick(id: number) {
  blockId.value = id;
  load();
}

/** 传感器卡片配置 */
const sensors = (t: Telemetry) => [
  { icon: "🌡️", label: "空气温度", value: `${t.latest.air_temp} ℃`, ok: t.latest.air_temp < 32 },
  { icon: "💧", label: "空气湿度", value: `${t.latest.air_humidity} %`, ok: t.latest.air_humidity > 40 },
  { icon: "🌱", label: "土壤墒情", value: `${t.latest.soil_moisture} %`, ok: t.latest.soil_moisture > 50 },
  { icon: "⚡", label: "土壤 EC", value: `${t.latest.soil_ec} mS/cm`, ok: t.latest.soil_ec > 0.5 },
  { icon: "☀️", label: "光照强度", value: `${Math.round(t.latest.light)} lx`, ok: t.latest.light > 0 },
  { icon: "🫧", label: "CO₂ 浓度", value: `${t.latest.co2} ppm`, ok: t.latest.co2 < 800 },
];

/** 24h 迷你曲线（纯 SVG，无图表库依赖） */
function sparkline(points: number[]): string {
  if (!points.length) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  return points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 30 - ((v - min) / span) * 28;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const tempPath = ref("");
const moistPath = ref("");

function renderSpark() {
  if (!data.value) return;
  tempPath.value = sparkline(data.value.history_24h.map((h) => h.air_temp));
  moistPath.value = sparkline(data.value.history_24h.map((h) => h.soil_moisture));
}

async function reload() {
  await load();
  renderSpark();
}

onMounted(async () => {
  await load();
  renderSpark();
});

function back() {
  router.back();
}
</script>

<template>
  <div>
    <header class="navbar">
      <button class="back" @click="back">‹</button>
      <div class="title">设备数据</div>
      <span class="tag" style="background: rgba(255, 255, 255, 0.2); color: #fff">
        在线率 {{ data?.device_online_rate ?? "--" }}%
      </span>
    </header>

    <div class="page">
      <!-- 地块选择 -->
      <div class="row" style="overflow-x: auto; padding-bottom: 4px">
        <button
          v-for="b in blocks"
          :key="b.id"
          class="btn"
          :class="blockId === b.id ? 'btn-primary' : 'btn-ghost'"
          style="min-height: 42px; font-size: 15px; padding: 0 14px; white-space: nowrap"
          @click="pick(b.id)"
        >
          {{ b.name }}
        </button>
      </div>

      <div v-if="loading" class="empty">加载中…</div>

      <template v-if="data">
        <!-- 传感器六宫格 -->
        <div class="grid6">
          <div v-for="s in sensors(data)" :key="s.label" class="sen card">
            <div style="font-size: 26px">{{ s.icon }}</div>
            <div class="muted" style="font-size: 13px">{{ s.label }}</div>
            <b style="font-size: 18px">{{ s.value }}</b>
          </div>
        </div>

        <!-- 24h 曲线 -->
        <div class="card mt16">
          <b style="font-size: 17px">24 小时趋势</b>
          <div class="chart">
            <div>
              <div class="muted" style="font-size: 13px">气温（℃）</div>
              <svg viewBox="0 0 100 32" preserveAspectRatio="none" class="spark">
                <path :d="tempPath" fill="none" stroke="#2f7d4f" stroke-width="1.6" />
              </svg>
            </div>
            <div>
              <div class="muted" style="font-size: 13px">土壤墒情（%）</div>
              <svg viewBox="0 0 100 32" preserveAspectRatio="none" class="spark">
                <path :d="moistPath" fill="none" stroke="#3d8fd6" stroke-width="1.6" />
              </svg>
            </div>
          </div>
          <p class="muted" style="font-size: 12px; margin: 6px 0 0">
            演示数据：确定性模拟，v0.5 接入 EMQX/InfluxDB 真实遥测
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.grid6 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}
.sen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 6px;
  margin-bottom: 0;
}
.chart {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}
.spark {
  width: 100%;
  height: 64px;
  background: #f6f8f9;
  border-radius: 8px;
}
</style>