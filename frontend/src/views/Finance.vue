<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getFinance, type FinanceData } from "@/api/center";

/** 经营管理：按地块投入产出 / 成本构成 / 订单合同 / 发票回款 */

const loading = ref(false);
const data = ref<FinanceData | null>(null);
const activeTab = ref("pnl");

const fmt = (n: number) => n.toLocaleString("zh-CN");
const fmtWan = (n: number) => n.toLocaleString("zh-CN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const maxMonthly = computed(() => Math.max(...(data.value?.monthly.map((m) => Math.max(m.revenue, m.cost)) ?? [1])));
const maxCost = computed(() => Math.max(...(data.value?.cost_items.map((c) => c.amount_wan) ?? [1])));
const marginAvg = computed(() => {
  const rows = data.value?.by_block ?? [];
  if (!rows.length) return 0;
  return Math.round(rows.reduce((s, r) => s + r.margin, 0) / rows.length * 10) / 10;
});

const orderStatusType = (s: string) =>
  s === "已结算" ? "success" : s === "已签收" ? "primary" : s === "配送中" ? "warning" : "info";

onMounted(async () => {
  loading.value = true;
  try {
    data.value = await getFinance();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">经营管理</h2>
      <el-tag type="info" effect="plain">演示数据 · 本季投入产出核算</el-tag>
    </div>

    <template v-if="data">
      <el-row :gutter="12">
        <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num ok">{{ fmtWan(data.summary.revenue_total_wan) }} 万</div><div class="muted">本季总收入</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num warn">{{ fmtWan(data.summary.cost_total_wan) }} 万</div><div class="muted">本季总成本</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ marginAvg }}%</div><div class="muted">平均利润率</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="kpi-card"><div class="kpi-num" :class="{ warn: data.summary.receivable > 0 }">{{ fmt(data.summary.receivable) }}</div><div class="muted">应收未回款（元）</div></el-card></el-col>
      </el-row>

      <el-tabs v-model="activeTab" style="margin-top: 12px">
        <!-- 投入产出 -->
        <el-tab-pane label="投入产出" name="pnl">
          <el-row :gutter="12">
            <el-col :span="16">
              <el-card shadow="never">
                <template #header>按地块投入产出（元）</template>
                <el-table :data="data.by_block" border stripe size="small">
                  <el-table-column prop="block_name" label="地块" min-width="110" />
                  <el-table-column prop="crop" label="作物" width="80" />
                  <el-table-column prop="area_mu" label="面积(亩)" width="80" />
                  <el-table-column label="收入" width="100"><template #default="{ row }">{{ fmt(row.revenue) }}</template></el-table-column>
                  <el-table-column label="成本" width="100"><template #default="{ row }">{{ fmt(row.cost) }}</template></el-table-column>
                  <el-table-column label="利润" width="100">
                    <template #default="{ row }"><b :style="{ color: row.profit >= 0 ? '#67c23a' : '#f56c6c' }">{{ fmt(row.profit) }}</b></template>
                  </el-table-column>
                  <el-table-column label="亩均收入" width="90"><template #default="{ row }">{{ fmt(row.per_mu_revenue) }}</template></el-table-column>
                  <el-table-column label="利润率" width="90">
                    <template #default="{ row }"><el-tag :type="row.margin >= 40 ? 'success' : row.margin >= 20 ? 'warning' : 'danger'" effect="light">{{ row.margin }}%</el-tag></template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="never">
                <template #header>成本构成（万元）</template>
                <div v-for="c in data.cost_items" :key="c.item" class="cost-row">
                  <span class="cost-item">{{ c.item }}</span>
                  <div class="cost-bar-wrap"><div class="cost-bar" :style="{ width: (c.amount_wan / maxCost * 100) + '%' }" /></div>
                  <b class="cost-val">{{ fmtWan(c.amount_wan) }}</b>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-card shadow="never" style="margin-top: 12px">
            <template #header>月度收入 vs 成本（万元）</template>
            <svg viewBox="0 0 640 200" class="chart">
              <g v-for="(m, i) in data.monthly" :key="m.month">
                <rect :x="60 + i * 115" :y="170 - m.revenue / maxMonthly * 130" width="30" :height="m.revenue / maxMonthly * 130" fill="#67c23a" rx="3" />
                <rect :x="94 + i * 115" :y="170 - m.cost / maxMonthly * 130" width="30" :height="m.cost / maxMonthly * 130" fill="#e6a23c" rx="3" />
                <text :x="92 + i * 115" y="188" text-anchor="middle" class="axis-text">{{ m.month }}</text>
                <text :x="75 + i * 115" :y="162 - m.revenue / maxMonthly * 130" text-anchor="middle" class="val-text">{{ fmtWan(m.revenue) }}</text>
                <text :x="109 + i * 115" :y="162 - m.cost / maxMonthly * 130" text-anchor="middle" class="val-text warn-text">{{ fmtWan(m.cost) }}</text>
              </g>
              <line x1="40" y1="170" x2="620" y2="170" stroke="#dcdfe6" />
            </svg>
            <div class="legend">
              <span><i class="dot" style="background: #67c23a" />收入</span>
              <span><i class="dot" style="background: #e6a23c" />成本</span>
            </div>
          </el-card>
        </el-tab-pane>

        <!-- 订单与合同 -->
        <el-tab-pane label="订单与合同" name="orders">
          <el-table :data="data.orders" border stripe>
            <el-table-column prop="id" label="订单号" width="140" />
            <el-table-column prop="buyer" label="采购方" min-width="160" />
            <el-table-column prop="product" label="产品" width="110" />
            <el-table-column label="数量" width="90"><template #default="{ row }">{{ fmt(row.qty_kg) }} kg</template></el-table-column>
            <el-table-column label="金额" width="100"><template #default="{ row }"><b>{{ fmt(row.amount) }}</b> 元</template></el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }"><el-tag :type="orderStatusType(row.status)" effect="light">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="date" label="日期" width="110" />
          </el-table>
        </el-tab-pane>

        <!-- 发票与回款 -->
        <el-tab-pane label="发票与回款" name="invoices">
          <el-table :data="data.invoices" border stripe>
            <el-table-column prop="id" label="发票号" width="110" />
            <el-table-column prop="order_id" label="关联订单" width="140" />
            <el-table-column label="金额" width="110"><template #default="{ row }"><b>{{ fmt(row.amount) }}</b> 元</template></el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已回款' ? 'success' : row.status === '已开票' ? 'warning' : 'info'" effect="light">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="开票日期" width="120"><template #default="{ row }">{{ row.issued_at ?? "—" }}</template></el-table-column>
            <el-table-column label="回款日期" width="120"><template #default="{ row }">{{ row.paid_at ?? "—" }}</template></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<style scoped>
.kpi-num { font-size: 26px; font-weight: 700; }
.kpi-num.ok { color: #67c23a; }
.kpi-num.warn { color: #e6a23c; }
.muted { color: #909399; font-size: 12px; }
.chart { width: 100%; height: auto; }
.axis-text { font-size: 12px; fill: #909399; }
.val-text { font-size: 11px; fill: #606266; }
.warn-text { fill: #e6a23c; }
.legend { display: flex; gap: 16px; justify-content: center; font-size: 12px; color: #606266; margin-top: 4px; }
.legend .dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; }
.cost-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.cost-item { width: 110px; font-size: 13px; flex-shrink: 0; }
.cost-bar-wrap { flex: 1; background: #f5f7fa; border-radius: 4px; height: 14px; overflow: hidden; }
.cost-bar { height: 100%; background: linear-gradient(90deg, #409eff, #79bbff); border-radius: 4px; }
.cost-val { width: 44px; text-align: right; font-size: 13px; }
</style>
