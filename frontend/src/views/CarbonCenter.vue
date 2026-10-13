<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getCarbonOverview, type CarbonOverview } from "@/api/center";

/** 碳中和计量中心：排放核算（范围1/2/3）+ 碳汇 + 减排项目 + 碳账户 */

const loading = ref(false);
const data = ref<CarbonOverview | null>(null);

const maxMonthly = computed(() => Math.max(...(data.value?.monthly.map((m) => Math.max(m.emission, m.sequestration)) ?? [1])));

const netTag = computed(() => {
  if (!data.value) return "info";
  return data.value.net_emission <= 0 ? "success" : data.value.offset_rate >= 60 ? "warning" : "danger";
});

const fmt = (n: number) => n.toLocaleString("zh-CN");

onMounted(async () => {
  loading.value = true;
  try {
    data.value = await getCarbonOverview();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">碳中和计量中心</h2>
      <el-tag type="info" effect="plain">演示数据 · IPCC 2019 / 省级清单口径</el-tag>
    </div>

    <template v-if="data">
      <!-- 总览 KPI -->
      <el-row :gutter="12">
        <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num bad">{{ fmt(data.total_emission) }}</div><div class="muted">总排放 kgCO₂e（范围 1+2+3）</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num ok">{{ fmt(data.total_sequestration) }}</div><div class="muted">总碳汇 kgCO₂e</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num" :class="{ bad: data.net_emission > 0 }">{{ fmt(data.net_emission) }}</div><div class="muted">净排放 kgCO₂e</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ data.intensity_kg_per_mu }}</div><div class="muted">排放强度 kgCO₂e/亩</div></el-card></el-col>
      </el-row>

      <el-row :gutter="12" style="margin-top: 12px">
        <!-- 排放核算 -->
        <el-col :span="9">
          <el-card shadow="never">
            <template #header>排放核算 · 三范围</template>
            <div v-for="scope in [data.scope1, data.scope2, data.scope3]" :key="scope.total" class="scope-block">
              <div class="scope-title">{{ scope === data.scope1 ? "范围 1 · 直接排放" : scope === data.scope2 ? "范围 2 · 外购能源" : "范围 3 · 价值链" }}</div>
              <div v-for="it in scope.items" :key="it.item" class="scope-row">
                <span>{{ it.item }}</span><b>{{ fmt(it.kg_co2e) }} kg</b>
              </div>
            </div>
            <div class="method-note">{{ data.methodology_note }}</div>
          </el-card>
        </el-col>

        <!-- 月度趋势 -->
        <el-col :span="15">
          <el-card shadow="never">
            <template #header>
              <div class="card-head">
                <span>12 个月排放 vs 碳汇（kgCO₂e）</span>
                <el-tag :type="netTag" effect="dark">中和率 {{ data.offset_rate }}%</el-tag>
              </div>
            </template>
            <svg viewBox="0 0 720 240" class="chart">
              <g v-for="(m, i) in data.monthly" :key="m.month">
                <rect :x="36 + i * 56" :y="200 - (m.emission / maxMonthly) * 150" width="20" :height="(m.emission / maxMonthly) * 150" rx="3" fill="#ef6c00" opacity="0.85" />
                <rect :x="58 + i * 56" :y="200 - (m.sequestration / maxMonthly) * 150" width="20" :height="(m.sequestration / maxMonthly) * 150" rx="3" fill="#2e7d32" opacity="0.85" />
                <text :x="57 + i * 56" y="216" text-anchor="middle" class="chart-label">{{ m.month }}</text>
              </g>
              <rect x="500" y="10" width="14" height="10" fill="#ef6c00" /><text x="520" y="19" class="chart-label">排放</text>
              <rect x="570" y="10" width="14" height="10" fill="#2e7d32" /><text x="590" y="19" class="chart-label">碳汇</text>
            </svg>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="12" style="margin-top: 12px">
        <!-- 碳汇计量 -->
        <el-col :span="9">
          <el-card shadow="never">
            <template #header>碳汇计量</template>
            <div v-for="s in data.sequestration" :key="s.item" class="scope-row">
              <span>{{ s.item }}</span><b>{{ fmt(s.kg_co2e) }} kg</b>
            </div>
          </el-card>
        </el-col>

        <!-- 减排项目 -->
        <el-col :span="15">
          <el-card shadow="never">
            <template #header>减排项目（CCER / Verra VCS / Gold Standard 方法学）</template>
            <el-table :data="data.projects" size="small">
              <el-table-column prop="name" label="项目" min-width="170" />
              <el-table-column prop="methodology" label="方法学" min-width="200" show-overflow-tooltip />
              <el-table-column prop="standard" label="标准" width="110" />
              <el-table-column label="状态" width="90">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.status === '已签发' ? 'success' : row.status === '审定中' ? 'warning' : 'info'">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="签发/预估 (tCO₂e)" width="140">
                <template #default="{ row }">{{ row.issued_credits || `预估 ${row.estimate_tCO2e}` }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- 碳账户：按地块 -->
      <el-card shadow="never" style="margin-top: 12px">
        <template #header>碳账户 · 按地块（对接碳交易所前内部核算）</template>
        <el-table :data="data.by_block" size="small" stripe>
          <el-table-column prop="block_name" label="地块" width="140" />
          <el-table-column prop="crop" label="作物" width="90" />
          <el-table-column prop="area_mu" label="面积(亩)" width="100" />
          <el-table-column label="排放(kgCO₂e)" width="130">
            <template #default="{ row }">{{ fmt(row.emission) }}</template>
          </el-table-column>
          <el-table-column label="碳汇(kgCO₂e)" width="130">
            <template #default="{ row }">{{ fmt(row.sequestration) }}</template>
          </el-table-column>
          <el-table-column label="净排放" width="130">
            <template #default="{ row }">
              <span :style="{ color: row.net <= 0 ? '#2e7d32' : '#e53935', fontWeight: 600 }">{{ fmt(row.net) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="中和进度">
            <template #default="{ row }">
              <el-progress :percentage="Math.min(100, Math.round((row.sequestration / row.emission) * 100))" :stroke-width="10"
                           :color="row.net <= 0 ? '#2e7d32' : '#f57c00'" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.kpi-card { text-align: center; }
.kpi-num { font-size: 28px; font-weight: 700; }
.kpi-num.ok { color: #2e7d32; }
.kpi-num.bad { color: #e53935; }
.muted { color: #909399; font-size: 12px; }
.card-head { display: flex; align-items: center; justify-content: space-between; }
.scope-block { margin-bottom: 12px; }
.scope-title { font-weight: 600; font-size: 13px; color: #37474f; margin-bottom: 6px; }
.scope-row { display: flex; justify-content: space-between; padding: 6px 4px; border-bottom: 1px dashed #eceff1; font-size: 13px; }
.method-note { margin-top: 10px; font-size: 12px; color: #90a4ae; line-height: 1.6; }
.chart { width: 100%; }
.chart-label { font-size: 11px; fill: #90a4ae; }
</style>
