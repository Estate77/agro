<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  getGovBoard, getGovEntities, getGovEntity, getSubsidies, listEmergency, reportEmergency,
  type EmergencyRecord, type GovBoard, type GovEntity, type GovEntityDetail, type SubsidyItem,
} from "@/api/center";

/** 政务监管平台（G 端）：领导看板 + 主体名录 + 补贴监管 + 应急指挥 */

const activeTab = ref("board");
const loading = ref(false);

// ---------- 领导看板 ----------
const board = ref<GovBoard | null>(null);
const maxWeek = computed(() => Math.max(...(board.value?.week_scale ?? [1])));

// ---------- 主体名录 ----------
const entities = ref<GovEntity[]>([]);
const entityDetail = ref<GovEntityDetail | null>(null);
const detailVisible = ref(false);

const riskTag = (lv: string) => (lv === "绿" ? "success" : lv === "黄" ? "warning" : "danger");

async function openEntity(row: GovEntity) {
  detailVisible.value = true;
  entityDetail.value = null;
  entityDetail.value = await getGovEntity(row.id);
}

// ---------- 补贴监管 ----------
const subsidies = ref<SubsidyItem[]>([]);
const subsidySummary = ref({ budget: 0, paid: 0, check: "" });
const PROGRESS_STEPS = ["立项", "申报", "公示", "验收", "兑付"];

// ---------- 应急指挥 ----------
const emergencies = ref<EmergencyRecord[]>([]);
const reportVisible = ref(false);
const reportForm = reactive({ type: "农产品质量安全", desc: "" });
const REPORT_TYPES = ["农产品质量安全", "自然灾害（旱/涝/冻）", "病虫害暴发", "农资事故", "环境污染"];

async function submitReport() {
  if (!reportForm.desc.trim()) {
    ElMessage.warning("请填写事件描述");
    return;
  }
  const r = await reportEmergency({ type: reportForm.type, desc: reportForm.desc, geo: "116.405,39.905" });
  reportVisible.value = false;
  reportForm.desc = "";
  ElMessage.success(`已派单 ${r.id} → ${r.dispatch_to}（SLA ${r.sla_min} 分钟）`);
  await loadEmergency();
}

async function loadEmergency() {
  const r = await listEmergency();
  emergencies.value = r.items;
}

onMounted(async () => {
  loading.value = true;
  try {
    const [b, e, s, em] = await Promise.all([getGovBoard(), getGovEntities(), getSubsidies(), listEmergency()]);
    board.value = b;
    entities.value = e.items;
    subsidies.value = s.items;
    subsidySummary.value = { budget: s.total_budget_wan, paid: s.total_paid_wan, check: s.on_chain_check };
    emergencies.value = em.items;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">政务监管平台</h2>
      <el-tag type="info" effect="plain">G 端演示 · 主体/补贴/应急数据含 mock</el-tag>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 领导看板 -->
      <el-tab-pane label="领导看板" name="board">
        <template v-if="board">
          <el-row :gutter="12">
            <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ board.kpi.area_mu }}</div><div class="muted">监管种植面积（亩）</div></el-card></el-col>
            <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ board.kpi.subjects }}</div><div class="muted">在册主体（家）</div></el-card></el-col>
            <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num ok">{{ board.kpi.task_done_rate }}%</div><div class="muted">农事任务完成率</div></el-card></el-col>
            <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ board.kpi.certified_batches }}</div><div class="muted">认证溯源批次</div></el-card></el-col>
          </el-row>

          <el-row :gutter="12" style="margin-top: 12px">
            <el-col :span="14">
              <el-card shadow="never">
                <template #header>本周生产规模指数（吞吐/作业量）</template>
                <svg viewBox="0 0 560 190" class="chart">
                  <g v-for="(v, i) in board.week_scale" :key="i">
                    <rect :x="50 + i * 70" :y="160 - (v / maxWeek) * 120" width="42" :height="(v / maxWeek) * 120" rx="5" fill="#1565c0" opacity="0.85" />
                    <text :x="71 + i * 70" y="156 - (v / maxWeek) * 120" text-anchor="middle" class="chart-label">{{ v }}</text>
                    <text :x="71 + i * 70" y="178" text-anchor="middle" class="chart-label">周{{ "一二三四五六日"[i] }}</text>
                  </g>
                </svg>
              </el-card>
            </el-col>
            <el-col :span="10">
              <el-card shadow="never">
                <template #header>告警趋势（近 7 日按等级）</template>
                <div class="alarm-row">
                  <el-tag type="danger">高危 {{ board.alarm_trend.high }}</el-tag>
                  <el-tag type="warning">中危 {{ board.alarm_trend.mid }}</el-tag>
                  <el-tag type="info">低危 {{ board.alarm_trend.low }}</el-tag>
                  <el-tag v-if="board.kpi.complaints_open" type="danger" effect="plain">待处理投诉 {{ board.kpi.complaints_open }}</el-tag>
                </div>
                <el-alert class="board-tip" type="info" :closable="false"
                          title="数据来源：辖区主体实时上报 + 物联网设备 + 溯源链存证（演示数据）" />
              </el-card>
            </el-col>
          </el-row>
        </template>
      </el-tab-pane>

      <!-- 主体名录 -->
      <el-tab-pane label="主体名录" name="entities">
        <el-card shadow="never">
          <el-table :data="entities" size="small" @row-click="openEntity" highlight-current-row>
            <el-table-column prop="name" label="主体名称" min-width="180" />
            <el-table-column prop="kind" label="类型" width="110" />
            <el-table-column prop="legal" label="负责人" width="100" />
            <el-table-column prop="blocks" label="地块数" width="80" />
            <el-table-column prop="area_mu" label="面积(亩)" width="100" />
            <el-table-column label="风险评级" width="150">
              <template #default="{ row }">
                <el-tag size="small" :type="riskTag(row.risk_level)">{{ row.risk_level }} · {{ row.risk_score }} 分</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="未闭环告警" width="100">
              <template #default="{ row }">{{ row.alerts_total }}</template>
            </el-table-column>
            <el-table-column label="数据来源" width="110">
              <template #default="{ row }">
                <el-tag size="small" :type="row.is_mock ? 'info' : 'success'" effect="plain">{{ row.is_mock ? "模拟主体" : "平台注册" }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" fixed="right">
              <template #default="{ row }"><el-button link type="primary" size="small" @click.stop="openEntity(row)">档案核查</el-button></template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-dialog v-model="detailVisible" :title="`主体档案 · ${entityDetail?.name || ''}`" width="640px">
          <template v-if="entityDetail">
            <el-descriptions :column="2" size="small" border>
              <el-descriptions-item v-for="(v, k) in entityDetail.ledger" :key="k" :label="String(k)">{{ v }}</el-descriptions-item>
            </el-descriptions>
            <div class="dlg-section">
              <b>链上存证</b>
              <div class="mono chain-line">{{ entityDetail.blockchain.chain }} · 高度 {{ entityDetail.blockchain.last_block_height }} · 最近锚定 {{ entityDetail.blockchain.last_anchor_at }}</div>
              <div class="mono">cert_hash: {{ entityDetail.blockchain.cert_hash }}</div>
            </div>
            <div class="dlg-section" v-if="entityDetail.alerts.length">
              <b>未闭环告警（{{ entityDetail.alerts.length }}）</b>
              <div v-for="(a, i) in entityDetail.alerts" :key="i" class="alert-line">
                <el-tag size="small" :type="a.level === '高' ? 'danger' : a.level === '中' ? 'warning' : 'info'">{{ a.level }}</el-tag>
                <span class="alert-date">{{ a.date }}</span> {{ a.type }} · {{ a.msg }}
              </div>
            </div>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 补贴监管 -->
      <el-tab-pane label="补贴监管" name="subsidy">
        <el-row :gutter="12" style="margin-bottom: 12px">
          <el-col :span="8"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ subsidySummary.budget }}</div><div class="muted">在管项目预算（万元）</div></el-card></el-col>
          <el-col :span="8"><el-card shadow="never" class="kpi-card"><div class="kpi-num ok">{{ subsidySummary.paid }}</div><div class="muted">累计兑付（万元）</div></el-card></el-col>
          <el-col :span="8"><el-card shadow="never" class="kpi-card"><div class="kpi-sub">{{ subsidySummary.check }}</div><div class="muted">资金流 × 作业流 × 数据流 三流合一审计</div></el-card></el-col>
        </el-row>

        <el-card shadow="never">
          <el-table :data="subsidies" size="small">
            <el-table-column prop="name" label="项目" min-width="200" />
            <el-table-column prop="level" label="层级" width="90" />
            <el-table-column prop="budget_wan" label="预算(万)" width="90" />
            <el-table-column prop="applicants" label="申报主体" width="90" />
            <el-table-column label="流程进度" min-width="240">
              <template #default="{ row }">
                <el-steps :active="row.progress" size="small" :align-center="false" style="max-width: 260px">
                  <el-step v-for="s in PROGRESS_STEPS" :key="s" :title="s" />
                </el-steps>
              </template>
            </el-table-column>
            <el-table-column label="存证哈希" width="130">
              <template #default="{ row }"><span class="mono">{{ row.evidence_hash || "—" }}</span></template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 应急指挥 -->
      <el-tab-pane label="应急指挥" name="emergency">
        <el-card shadow="never">
          <template #header>
            <div class="card-head">
              <span>应急事件（{{ emergencies.length }}）</span>
              <el-button type="danger" @click="reportVisible = true">上报事件</el-button>
            </div>
          </template>
          <el-table :data="emergencies" size="small">
            <el-table-column prop="id" label="事件编号" width="200" />
            <el-table-column prop="type" label="类型" width="140" />
            <el-table-column prop="desc" label="描述" min-width="220" show-overflow-tooltip />
            <el-table-column prop="reporter" label="上报人" width="110" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }"><el-tag size="small" type="warning">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="dispatch_to" label="派单至" min-width="180" />
            <el-table-column label="SLA" width="100">
              <template #default="{ row }">{{ row.sla_min }} 分钟</template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-dialog v-model="reportVisible" title="上报应急事件" width="480px">
          <el-form label-width="80px">
            <el-form-item label="类型">
              <el-select v-model="reportForm.type">
                <el-option v-for="t in REPORT_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="reportForm.desc" type="textarea" :rows="3" placeholder="事件时间/地点/影响范围/已采取措施" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="reportVisible = false">取消</el-button>
            <el-button type="primary" @click="submitReport">提交并派单</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.kpi-card { text-align: center; }
.kpi-num { font-size: 28px; font-weight: 700; color: #1565c0; }
.kpi-num.ok { color: #2e7d32; }
.muted { color: #909399; font-size: 12px; }
.kpi-sub { font-size: 15px; font-weight: 600; color: #1565c0; }
.card-head { display: flex; align-items: center; justify-content: space-between; }
.chart { width: 100%; }
.chart-label { font-size: 11px; fill: #90a4ae; }
.alarm-row { display: flex; gap: 10px; margin-bottom: 14px; }
.board-tip { margin-top: 6px; }
.mono { font-family: Consolas, Monaco, monospace; font-size: 12px; color: #546e7a; word-break: break-all; }
.dlg-section { margin-top: 12px; }
.chain-line { margin: 6px 0; }
.alert-line { font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #eceff1; }
.alert-date { color: #90a4ae; margin: 0 8px; }
</style>
