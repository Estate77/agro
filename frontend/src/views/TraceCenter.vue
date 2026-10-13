<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getTraceEvents, getTraceStats, getTraceTemplates, type TraceEvent, type TraceStats, type TraceTemplate } from "@/api/center";
import { listBatches, type Batch } from "@/api/e2e";

/** 区块链溯源中心：批次管理（事件时间线）+ 溯源模板 + 上链策略 + 查询统计 */

const activeTab = ref("batches");
const loading = ref(false);

// 批次管理
const batches = ref<Batch[]>([]);
const selected = ref<Batch | null>(null);
const events = ref<TraceEvent[]>([]);
const eventsLoading = ref(false);

async function pickBatch(b: Batch) {
  selected.value = b;
  events.value = [];
  eventsLoading.value = true;
  try {
    const r = await getTraceEvents(b.code);
    events.value = r.items;
  } finally {
    eventsLoading.value = false;
  }
}

const statusTag = (s: string) => (s === "已上架" ? "success" : s === "在途" ? "warning" : "info");

// 溯源模板
const templates = ref<TraceTemplate[]>([]);

// 上链策略（从模板聚合）
const chainRules = computed(() => {
  const t = templates.value[0];
  if (!t) return [];
  return t.nodes.map((n) => ({
    node_type: n.node_type,
    node_name: n.name,
    on_chain: n.on_chain,
    required: n.required,
    strategy: n.on_chain ? "节点哈希实时上链 · 原文件存 IPFS" : "平台留档 · 按日批量锚定",
  }));
});

// 查询统计
const stats = ref<TraceStats | null>(null);
const maxScan = computed(() => Math.max(...(stats.value?.scans_7d.map((s) => s.count) ?? [1])));
const maxRegion = computed(() => Math.max(...(stats.value?.regions_top.map((s) => s.count) ?? [1])));

const shortHash = (h: string | null) => (h ? `${h.slice(0, 10)}…${h.slice(-6)}` : "—");

onMounted(async () => {
  loading.value = true;
  try {
    const [b, t, s] = await Promise.all([listBatches({ page: 1, page_size: 20 }), getTraceTemplates(), getTraceStats()]);
    batches.value = b.items;
    templates.value = t;
    stats.value = s;
    if (b.items.length) await pickBatch(b.items[0]);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">区块链溯源中心</h2>
      <el-tag type="info" effect="plain">演示：长安链/BSN 适配层预留 · 哈希与 tx 为确定性 mock</el-tag>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 批次管理 -->
      <el-tab-pane label="批次管理" name="batches">
        <el-row :gutter="12">
          <el-col :span="10">
            <el-card shadow="never">
              <template #header>批次列表（{{ batches.length }}）</template>
              <el-table :data="batches" size="small" highlight-current-row @row-click="pickBatch">
                <el-table-column prop="code" label="批次码" min-width="180" />
                <el-table-column prop="product_name" label="品名" width="80" />
                <el-table-column prop="variety" label="品种" width="110" />
                <el-table-column label="状态" width="90">
                  <template #default="{ row }"><el-tag size="small" :type="statusTag(row.status)">{{ row.status }}</el-tag></template>
                </el-table-column>
                <el-table-column label="链上凭证" width="110">
                  <template #default="{ row }"><span class="mono">{{ shortHash(row.chain_tx) }}</span></template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <el-col :span="14">
            <el-card shadow="never">
              <template #header>
                <span v-if="selected">溯源链路 · {{ selected.code }}</span>
                <span v-else>选择左侧批次查看链路</span>
              </template>
              <el-timeline v-if="events.length" v-loading="eventsLoading">
                <el-timeline-item
                  v-for="(e, i) in events"
                  :key="i"
                  :type="e.status === '已上链' ? 'success' : e.status === '进行中' ? 'primary' : 'warning'"
                  :timestamp="e.ts"
                >
                  <div class="ev">
                    <div class="ev-head">
                      <el-tag size="small">{{ e.node_type }}</el-tag>
                      <b>{{ e.node_name }}</b>
                      <el-tag size="small" :type="e.status === '已上链' ? 'success' : 'warning'" effect="plain">{{ e.status }}</el-tag>
                    </div>
                    <div class="ev-hash mono">payload {{ shortHash(e.payload_hash) }}</div>
                    <div class="ev-hash mono">ipfs {{ e.ipfs_cid.slice(0, 14) }}…</div>
                    <div v-if="e.chain_tx" class="ev-hash mono">tx {{ shortHash(e.chain_tx) }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="该批次暂无溯源事件" />
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 溯源模板 -->
      <el-tab-pane label="溯源模板" name="templates">
        <el-row :gutter="12">
          <el-col v-for="t in templates" :key="t.id" :span="12">
            <el-card shadow="never">
              <template #header>
                <div class="card-head"><b>{{ t.name }}</b><el-tag size="small" type="info">{{ t.applied_to }}</el-tag></div>
              </template>
              <div class="tpl-flow">
                <div v-for="n in t.nodes" :key="n.seq" class="tpl-node" :class="{ 'on-chain': n.on_chain }">
                  <div class="tpl-seq">{{ n.seq }}</div>
                  <div>
                    <div><b>{{ n.node_type }}</b> · {{ n.name }}</div>
                    <div class="muted">
                      <el-tag v-if="n.on_chain" size="small" type="success" effect="plain">哈希上链</el-tag>
                      <el-tag v-else size="small" effect="plain">平台留档</el-tag>
                      <el-tag v-if="n.required" size="small" type="warning" effect="plain">必填</el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 上链策略 -->
      <el-tab-pane label="上链策略" name="chain">
        <el-card shadow="never">
          <el-alert type="info" :closable="false" show-icon
                    title="关键节点（地块/投入品/采收/检测）哈希实时上链，原文件存 IPFS/OSS；非关键节点按日批量锚定 Merkle 根。" />
          <el-table :data="chainRules" size="small" style="margin-top: 12px">
            <el-table-column prop="node_type" label="节点类型" width="110" />
            <el-table-column prop="node_name" label="节点名称" min-width="200" />
            <el-table-column label="是否上链" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="row.on_chain ? 'success' : 'info'">{{ row.on_chain ? "上链" : "留档" }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="必填" width="80">
              <template #default="{ row }">{{ row.required ? "是" : "否" }}</template>
            </el-table-column>
            <el-table-column prop="strategy" label="存证策略" min-width="240" />
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 查询统计 -->
      <el-tab-pane label="查询统计" name="stats">
        <template v-if="stats">
          <el-row :gutter="12">
            <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ stats.batches_total }}</div><div class="muted">在管批次</div></el-card></el-col>
            <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num ok">{{ stats.on_chain_rate }}%</div><div class="muted">批次上链率（目标 ≥95%）</div></el-card></el-col>
            <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ stats.scans_7d.reduce((a, b) => a + b.count, 0) }}</div><div class="muted">近 7 天扫码次数</div></el-card></el-col>
            <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num" :class="stats.recalls ? 'bad' : 'ok'">{{ stats.recalls }}</div><div class="muted">问题批次召回</div></el-card></el-col>
          </el-row>

          <el-row :gutter="12" style="margin-top: 12px">
            <el-col :span="14">
              <el-card shadow="never">
                <template #header>近 7 天扫码趋势</template>
                <svg viewBox="0 0 560 200" class="chart">
                  <g v-for="(s, i) in stats.scans_7d" :key="s.date">
                    <rect :x="40 + i * 74" :y="180 - (s.count / maxScan) * 140" width="46" :height="(s.count / maxScan) * 140" rx="5" fill="#2e7d32" opacity="0.85" />
                    <text :x="63 + i * 74" y="176 - (s.count / maxScan) * 140" text-anchor="middle" class="chart-label">{{ s.count }}</text>
                    <text :x="63 + i * 74" y="196" text-anchor="middle" class="chart-label">周{{ s.weekday }}</text>
                  </g>
                </svg>
              </el-card>
            </el-col>
            <el-col :span="10">
              <el-card shadow="never">
                <template #header>扫码地域分布 TOP5</template>
                <div v-for="r in stats.regions_top" :key="r.region" class="region-row">
                  <span class="region-name">{{ r.region }}</span>
                  <div class="region-bar"><div :style="{ width: (r.count / maxRegion) * 100 + '%' }" /></div>
                  <span class="region-count">{{ r.count }}</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.muted { color: #909399; font-size: 12px; }
.mono { font-family: Consolas, Monaco, monospace; font-size: 12px; color: #546e7a; }
.card-head { display: flex; align-items: center; justify-content: space-between; }
.ev-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.ev-hash { line-height: 1.7; }
.tpl-flow { display: flex; flex-direction: column; gap: 10px; }
.tpl-node { display: flex; gap: 12px; align-items: flex-start; padding: 8px 10px; border-radius: 8px; background: #f6f8f7; }
.tpl-node.on-chain { background: #eef7ee; }
.tpl-seq { width: 26px; height: 26px; border-radius: 50%; background: #2e7d32; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
.kpi-card { text-align: center; }
.kpi-num { font-size: 30px; font-weight: 700; }
.kpi-num.ok { color: #2e7d32; }
.kpi-num.bad { color: #e53935; }
.chart { width: 100%; }
.chart-label { font-size: 11px; fill: #90a4ae; }
.region-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.region-name { width: 48px; font-size: 13px; }
.region-bar { flex: 1; height: 12px; background: #eceff1; border-radius: 6px; overflow: hidden; }
.region-bar div { height: 100%; background: linear-gradient(90deg, #66bb6a, #2e7d32); border-radius: 6px; }
.region-count { width: 40px; text-align: right; font-size: 12px; color: #607d8b; }
</style>
