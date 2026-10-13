<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getAlerts, getDevices, getTelemetry, getWeather, type AlertItem, type DeviceItem, type TelemetryOut, type WeatherOut } from "@/api/cockpit";
import { listBlocks, type Block } from "@/api/e2e";

/** 智慧农场驾驶舱：园区总览（示意 GIS）+ 地块总览 + 告警总览 + 天气 */

const loading = ref(false);
const blocks = ref<Block[]>([]);
const devices = ref<DeviceItem[]>([]);
const alerts = ref<AlertItem[]>([]);
const weather = ref<WeatherOut | null>(null);
const onlineRate = ref(0);

const selectedBlockId = ref<number | null>(null);
const telemetry = ref<TelemetryOut | null>(null);

const CROP_COLORS: Record<string, string> = {
  水稻: "#69b96d",
  番茄: "#ef6b6b",
  黄瓜: "#4caf7d",
  小麦: "#d9a53a",
  玉米: "#f0a03c",
};

const totalArea = computed(() => blocks.value.reduce((s, b) => s + b.area_mu, 0));
const plantingCount = computed(() => blocks.value.filter((b) => b.current_planting_id).length);
const highAlerts = computed(() => alerts.value.filter((a) => a.level === "高").length);

/** 园区示意 GIS：按面积比例横向排布地块色块 */
const mapBlocks = computed(() => {
  const total = totalArea.value || 1;
  let x = 8;
  return blocks.value.map((b) => {
    const w = Math.max(72, (b.area_mu / total) * 700);
    const rect = { x, w: w - 6 };
    x += w;
    return { ...b, rect, color: CROP_COLORS[b.crop || ""] || "#90a4ae" };
  });
});

function devicesOfBlock(blockId: number): DeviceItem[] {
  return devices.value.filter((d) => d.block_id === blockId);
}

const alertBlockIds = computed(() => {
  const ids = new Set<number>();
  for (const a of alerts.value) {
    const m = a.target.match(/^block:(\d+)$/);
    if (m) ids.add(Number(m[1]));
  }
  return ids;
});

async function selectBlock(id: number) {
  selectedBlockId.value = id;
  telemetry.value = null;
  try {
    telemetry.value = await getTelemetry(id);
  } catch {
    /* 演示数据加载失败静默 */
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    const [b, d, a, w] = await Promise.all([
      listBlocks({ page: 1, page_size: 50 }),
      getDevices(),
      getAlerts(),
      getWeather(),
    ]);
    blocks.value = b.items;
    devices.value = d.items;
    onlineRate.value = d.online_rate;
    alerts.value = a.items;
    weather.value = w;
    if (b.items.length) await selectBlock(b.items[0].id);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">智慧农场驾驶舱</h2>
      <el-tag type="info" effect="plain">演示数据 · 确定性 mock</el-tag>
    </div>

    <!-- KPI + 天气 -->
    <el-row :gutter="12">
      <el-col :span="7">
        <el-card v-if="weather" shadow="never" class="kpi-card weather-card">
          <div class="weather-top">
            <span class="weather-icon">{{ weather.today.icon }}</span>
            <div>
              <div class="weather-temp">{{ weather.today.temp_hi }}℃ / {{ weather.today.temp_lo }}℃</div>
              <div class="muted">{{ weather.today.condition }} · 湿度 {{ weather.today.humidity }}% · 风力 {{ weather.today.wind }}</div>
            </div>
          </div>
          <div class="weather-advice">{{ weather.today.advice }}</div>
        </el-card>
      </el-col>
      <el-col :span="17">
        <el-row :gutter="12">
          <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ blocks.length }}</div><div class="muted">地块总数</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ totalArea.toFixed(1) }}</div><div class="muted">总面积（亩）</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num" :class="onlineRate < 90 ? 'warn' : 'ok'">{{ onlineRate }}%</div><div class="muted">设备在线率</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num" :class="highAlerts ? 'bad' : 'ok'">{{ alerts.length }}</div><div class="muted">未处理告警（高 {{ highAlerts }}）</div></el-card></el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- 园区总览（示意 GIS）+ 告警 -->
    <el-row :gutter="12" style="margin-top: 12px">
      <el-col :span="15">
        <el-card shadow="never">
          <template #header>园区总览 · 点击地块查看实时墒情</template>
          <svg viewBox="0 0 760 220" class="gis">
            <template v-for="mb in mapBlocks" :key="mb.id">
              <rect
                :x="mb.rect.x" y="14" :width="mb.rect.w" height="160" rx="8"
                :fill="mb.color" :opacity="selectedBlockId === mb.id ? 0.95 : 0.62"
                :stroke="alertBlockIds.has(mb.id) ? '#e53935' : 'transparent'"
                stroke-width="3" class="gis-block"
                :class="{ 'gis-alarm': alertBlockIds.has(mb.id), 'gis-active': selectedBlockId === mb.id }"
                @click="selectBlock(mb.id)"
              />
              <text :x="mb.rect.x + 10" y="44" class="gis-text gis-name">{{ mb.name }}</text>
              <text :x="mb.rect.x + 10" y="66" class="gis-text">{{ mb.crop }} · {{ mb.variety }}</text>
              <text :x="mb.rect.x + 10" y="86" class="gis-text">{{ mb.area_mu }} 亩</text>
              <circle
                v-for="(d, i) in devicesOfBlock(mb.id).slice(0, 6)" :key="d.id"
                :cx="mb.rect.x + 14 + i * 18" cy="150" r="5"
                :fill="d.status === '在线' ? '#1b5e20' : '#e53935'"
              />
            </template>
            <text x="8" y="205" class="gis-text muted">● 设备点（绿=在线 / 红=离线或故障）· 红框=有告警地块 · 色块宽度≈面积占比</text>
          </svg>

          <!-- 选中地块遥测摘要 -->
          <el-descriptions v-if="telemetry" :column="6" size="small" border style="margin-top: 8px">
            <el-descriptions-item label="地块">{{ telemetry.block.name }}</el-descriptions-item>
            <el-descriptions-item label="气温">{{ telemetry.latest.air_temp }}℃</el-descriptions-item>
            <el-descriptions-item label="湿度">{{ telemetry.latest.air_humidity }}%</el-descriptions-item>
            <el-descriptions-item label="墒情">{{ telemetry.latest.soil_moisture }}%</el-descriptions-item>
            <el-descriptions-item label="光照">{{ telemetry.latest.light }} lx</el-descriptions-item>
            <el-descriptions-item label="CO₂">{{ telemetry.latest.co2 }} ppm</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="9">
        <el-card shadow="never">
          <template #header>
            <div class="card-head">
              <span>告警总览</span>
              <el-tag size="small" type="danger" v-if="highAlerts">{{ highAlerts }} 条高危</el-tag>
            </div>
          </template>
          <el-table :data="alerts" size="small" max-height="360">
            <el-table-column label="等级" width="70">
              <template #default="{ row }">
                <el-tag size="small" :type="row.level === '高' ? 'danger' : row.level === '中' ? 'warning' : 'info'">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="90" />
            <el-table-column prop="msg" label="内容" min-width="180" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 地块总览 -->
    <el-card shadow="never" style="margin-top: 12px">
      <template #header>地块总览（{{ blocks.length }} 块 · 种植中 {{ plantingCount }}）</template>
      <el-table :data="blocks" size="small" stripe>
        <el-table-column prop="code" label="编码" width="110" />
        <el-table-column prop="name" label="名称" width="140" />
        <el-table-column prop="crop" label="作物" width="90" />
        <el-table-column prop="variety" label="品种" width="130" />
        <el-table-column prop="area_mu" label="面积(亩)" width="100" />
        <el-table-column label="种植季" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.current_planting_id" size="small" type="success">种植中</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="设备(在线/总)" width="120">
          <template #default="{ row }">
            {{ devicesOfBlock(row.id).filter((d) => d.status === "在线").length }} / {{ devicesOfBlock(row.id).length }}
          </template>
        </el-table-column>
        <el-table-column prop="owner_org" label="所属组织" min-width="140" />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="selectBlock(row.id)">看墒情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 7 天预报 -->
    <el-card shadow="never" style="margin-top: 12px" v-if="weather">
      <template #header>未来 7 天农事气象</template>
      <div class="forecast">
        <div v-for="f in weather.forecast" :key="f.date" class="forecast-day">
          <div class="muted">{{ f.weekday }}</div>
          <div class="forecast-icon">{{ f.icon }}</div>
          <div>{{ f.temp_hi }}° / {{ f.temp_lo }}°</div>
          <el-tag size="small" :type="f.suitable_for_spray ? 'success' : 'info'">{{ f.suitable_for_spray ? "宜喷施" : "忌喷施" }}</el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.kpi-card { text-align: center; }
.kpi-num { font-size: 30px; font-weight: 700; }
.kpi-num.ok { color: #2e7d32; }
.kpi-num.warn { color: #f57c00; }
.kpi-num.bad { color: #e53935; }
.muted { color: #909399; font-size: 12px; }
.weather-card { text-align: left; }
.weather-top { display: flex; align-items: center; gap: 14px; }
.weather-icon { font-size: 40px; }
.weather-temp { font-size: 22px; font-weight: 700; }
.weather-advice { margin-top: 8px; font-size: 13px; color: #556; }
.card-head { display: flex; align-items: center; justify-content: space-between; }
.gis { width: 100%; }
.gis-block { cursor: pointer; }
.gis-alarm { animation: blink 1.2s ease-in-out infinite; }
.gis-active { filter: brightness(1.06); }
@keyframes blink { 50% { stroke-opacity: 0.25; } }
.gis-text { font-size: 13px; fill: #263238; pointer-events: none; }
.gis-name { font-weight: 700; font-size: 14px; }
.forecast { display: flex; justify-content: space-between; text-align: center; }
.forecast-day { display: flex; flex-direction: column; gap: 6px; align-items: center; }
.forecast-icon { font-size: 26px; }
</style>
