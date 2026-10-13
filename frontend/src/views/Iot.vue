<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { getDevices, getTelemetry, type DeviceItem, type TelemetryOut } from "@/api/cockpit";
import { listBlocks, type Block } from "@/api/e2e";

/** 物联网设备中心：设备台账 + 指令下发（演示） + 实时遥测曲线 */

const loading = ref(false);
const devices = ref<DeviceItem[]>([]);
const online = ref(0);
const onlineRate = ref(0);
const filter = reactive({ type: "", status: "" });

const blocks = ref<Block[]>([]);
const blockId = ref<number | null>(null);
const telemetry = ref<TelemetryOut | null>(null);
const telLoading = ref(false);

// 指令队列（演示：前端内存记录）
interface CmdRecord { id: number; sn: string; command: string; issued_at: string; status: string }
const cmdRecords = ref<CmdRecord[]>([]);
const cmdDialog = ref(false);
const cmdForm = reactive({ sn: "", command: "开启灌溉 30 分钟" });
let cmdSeq = 1;

const DEVICE_TYPES = ["气象站", "土壤墒情传感器", "虫情测报灯", "视频摄像头", "智能灌溉阀", "卷帘机", "植保无人机", "巡检机器人", "物联网网关", "喂料机"];
const COMMANDS = ["开启灌溉 30 分钟", "关闭灌溉", "卷帘展开 50%", "卷帘收起", "设备重启", "立即抓拍", "返航充电"];

const statusTag = (s: string) => (s === "在线" ? "success" : s === "离线" ? "info" : "danger");

const filtered = computed(() =>
  devices.value.filter(
    (d) => (!filter.type || d.type === filter.type) && (!filter.status || d.status === filter.status)
  )
);

const offlineCount = computed(() => devices.value.filter((d) => d.status === "离线").length);
const faultCount = computed(() => devices.value.filter((d) => d.status === "故障").length);

// ---------- 遥测 SVG 折线 ----------
const chart = computed(() => {
  const h = telemetry.value?.history_24h ?? [];
  if (!h.length) return null;
  const W = 720, H = 200, PAD = 28;
  const xs = (i: number) => PAD + (i / (h.length - 1)) * (W - PAD * 2);
  const line = (key: "air_temp" | "soil_moisture", lo: number, hi: number) =>
    h.map((p, i) => `${xs(i).toFixed(1)},${(H - PAD - ((p[key] - lo) / (hi - lo)) * (H - PAD * 2)).toFixed(1)}`).join(" ");
  return {
    W, H, PAD,
    temp: line("air_temp", 10, 38),
    moisture: line("soil_moisture", 40, 90),
    labels: h.filter((_, i) => i % 6 === 0).map((p, i) => ({ x: xs(i * 6), hour: `${p.hour}:00` })),
  };
});

async function loadTelemetry() {
  if (!blockId.value) return;
  telLoading.value = true;
  telemetry.value = null;
  try {
    telemetry.value = await getTelemetry(blockId.value);
  } finally {
    telLoading.value = false;
  }
}

function openCmd(row: DeviceItem) {
  cmdForm.sn = row.sn;
  cmdForm.command = COMMANDS[0];
  cmdDialog.value = true;
}

function submitCmd() {
  cmdRecords.value.unshift({
    id: cmdSeq++,
    sn: cmdForm.sn,
    command: cmdForm.command,
    issued_at: new Date().toLocaleString(),
    status: "已下发（演示）",
  });
  cmdDialog.value = false;
  ElMessage.success(`指令已下发：${cmdForm.command} → ${cmdForm.sn}`);
}

onMounted(async () => {
  loading.value = true;
  try {
    const [d, b] = await Promise.all([getDevices(), listBlocks({ page: 1, page_size: 50 })]);
    devices.value = d.items;
    online.value = d.online;
    onlineRate.value = d.online_rate;
    blocks.value = b.items;
    if (b.items.length) {
      blockId.value = b.items[0].id;
      await loadTelemetry();
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">物联网设备中心</h2>
      <el-tag type="info" effect="plain">演示数据 · MQTT/Modbus/GB28181 接入示意</el-tag>
    </div>

    <!-- 统计 -->
    <el-row :gutter="12">
      <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ devices.length }}</div><div class="muted">设备总数</div></el-card></el-col>
      <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num ok">{{ online }}</div><div class="muted">在线设备</div></el-card></el-col>
      <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num bad">{{ offlineCount + faultCount }}</div><div class="muted">离线 / 故障（{{ offlineCount }}/{{ faultCount }}）</div></el-card></el-col>
      <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num" :class="onlineRate < 90 ? 'warn' : 'ok'">{{ onlineRate }}%</div><div class="muted">在线率（目标 ≥ 99%）</div></el-card></el-col>
    </el-row>

    <!-- 实时遥测 -->
    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="card-head">
          <span>实时遥测（时序库 SeekDB · 演示）</span>
          <el-select v-model="blockId" style="width: 220px" @change="loadTelemetry">
            <el-option v-for="b in blocks" :key="b.id" :label="`${b.name}（${b.crop}）`" :value="b.id" />
          </el-select>
        </div>
      </template>

      <template v-if="telemetry">
        <el-row :gutter="12" class="tel-cards">
          <el-col :span="4"><div class="tel-card"><div class="tel-v">{{ telemetry.latest.air_temp }}℃</div><div class="muted">空气温度</div></div></el-col>
          <el-col :span="4"><div class="tel-card"><div class="tel-v">{{ telemetry.latest.air_humidity }}%</div><div class="muted">空气湿度</div></div></el-col>
          <el-col :span="4"><div class="tel-card"><div class="tel-v">{{ telemetry.latest.soil_moisture }}%</div><div class="muted">土壤墒情</div></div></el-col>
          <el-col :span="4"><div class="tel-card"><div class="tel-v">{{ telemetry.latest.soil_ec }}</div><div class="muted">土壤 EC (mS/cm)</div></div></el-col>
          <el-col :span="4"><div class="tel-card"><div class="tel-v">{{ telemetry.latest.light }}</div><div class="muted">光照 (lx)</div></div></el-col>
          <el-col :span="4"><div class="tel-card"><div class="tel-v">{{ telemetry.latest.co2 }}</div><div class="muted">CO₂ (ppm)</div></div></el-col>
        </el-row>

        <svg v-if="chart" :viewBox="`0 0 ${chart.W} ${chart.H}`" class="chart">
          <line v-for="gy in 3" :key="gy" :x1="chart.PAD" :x2="chart.W - chart.PAD"
                :y1="chart.PAD + (gy - 1) * ((chart.H - chart.PAD * 2) / 2)" :y2="chart.PAD + (gy - 1) * ((chart.H - chart.PAD * 2) / 2)"
                stroke="#eceff1" />
          <polyline :points="chart.temp" fill="none" stroke="#ef6c00" stroke-width="2.5" />
          <polyline :points="chart.moisture" fill="none" stroke="#1e88e5" stroke-width="2.5" />
          <text v-for="l in chart.labels" :key="l.x" :x="l.x" :y="chart.H - 6" text-anchor="middle" class="chart-label">{{ l.hour }}</text>
          <text :x="chart.W - chart.PAD" y="18" text-anchor="end" class="chart-label" fill="#ef6c00">— 气温(℃)</text>
          <text :x="chart.W - chart.PAD - 90" y="18" text-anchor="end" class="chart-label" fill="#1e88e5">— 墒情(%)</text>
        </svg>
        <div class="muted" style="margin-top: 4px">24h 曲线 · 确定性演示数据 · 设备在线率 {{ telemetry.device_online_rate }}%</div>
      </template>
      <el-empty v-else-if="!telLoading" description="选择地块查看遥测" />
    </el-card>

    <!-- 设备台账 -->
    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="card-head">
          <span>设备台账</span>
          <div class="filters">
            <el-select v-model="filter.type" placeholder="全部类型" clearable style="width: 170px">
              <el-option v-for="t in DEVICE_TYPES" :key="t" :label="t" :value="t" />
            </el-select>
            <el-select v-model="filter.status" placeholder="全部状态" clearable style="width: 120px">
              <el-option label="在线" value="在线" />
              <el-option label="离线" value="离线" />
              <el-option label="故障" value="故障" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="filtered" size="small" stripe>
        <el-table-column prop="sn" label="SN" width="130" />
        <el-table-column prop="type" label="类型" width="130" />
        <el-table-column prop="vendor" label="厂商" width="120" />
        <el-table-column prop="firmware" label="固件" width="90" />
        <el-table-column prop="protocol" label="协议" width="110" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }"><el-tag size="small" :type="statusTag(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="电量" width="120">
          <template #default="{ row }">
            <el-progress v-if="row.battery < 100" :percentage="row.battery" :stroke-width="8"
                         :color="row.battery < 20 ? '#e53935' : '#66bb6a'" />
            <span v-else class="muted">市电</span>
          </template>
        </el-table-column>
        <el-table-column prop="block_name" label="所属地块" width="130" />
        <el-table-column prop="last_heartbeat" label="最近心跳" width="150" />
        <el-table-column prop="uptime_days" label="连续运行(天)" width="110" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :disabled="row.status === '离线'" @click="openCmd(row)">下发指令</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 指令记录 -->
    <el-card shadow="never" style="margin-top: 12px" v-if="cmdRecords.length">
      <template #header>指令队列（演示：断网缓存 / 互锁规则 / 操作审计在 v0.5 实现）</template>
      <el-table :data="cmdRecords" size="small">
        <el-table-column prop="issued_at" label="下发时间" width="180" />
        <el-table-column prop="sn" label="设备 SN" width="140" />
        <el-table-column prop="command" label="指令" />
        <el-table-column prop="status" label="状态" width="140" />
      </el-table>
    </el-card>

    <!-- 指令对话框 -->
    <el-dialog v-model="cmdDialog" title="下发设备指令（演示）" width="420px">
      <el-form label-width="90px">
        <el-form-item label="设备 SN"><el-input :model-value="cmdForm.sn" disabled /></el-form-item>
        <el-form-item label="指令">
          <el-select v-model="cmdForm.command">
            <el-option v-for="c in COMMANDS" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cmdDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCmd">下发</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.kpi-card { text-align: center; }
.kpi-num { font-size: 30px; font-weight: 700; }
.kpi-num.ok { color: #2e7d32; }
.kpi-num.bad { color: #e53935; }
.kpi-num.warn { color: #f57c00; }
.muted { color: #909399; font-size: 12px; }
.card-head { display: flex; align-items: center; justify-content: space-between; }
.filters { display: flex; gap: 8px; }
.tel-cards { margin-bottom: 10px; }
.tel-card { background: #f5f8f6; border-radius: 8px; padding: 10px 12px; text-align: center; }
.tel-v { font-size: 22px; font-weight: 700; color: #1b5e20; }
.chart { width: 100%; }
.chart-label { font-size: 11px; fill: #90a4ae; }
</style>
