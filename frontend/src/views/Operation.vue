<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getOperation, type OperationData } from "@/api/center";

/** C 端运营后台：用户分析（DAU/扫码）/ 营销活动 / 订单履约 */

const loading = ref(false);
const data = ref<OperationData | null>(null);
const activeTab = ref("users");

const fmt = (n: number) => n.toLocaleString("zh-CN");

const maxTrend = computed(() => Math.max(...(data.value?.users.trend_7d.map((t) => Math.max(t.dau, t.scans)) ?? [1])));

const campaignStatusType = (s: string) => (s === "进行中" ? "success" : "info");
const orderStatusType = (s: string) => (s === "已签收" ? "success" : s === "配送中" ? "primary" : "warning");

onMounted(async () => {
  loading.value = true;
  try {
    data.value = await getOperation();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">C 端运营</h2>
      <el-tag type="info" effect="plain">演示数据 · 小程序 / APP 消费端</el-tag>
    </div>

    <template v-if="data">
      <el-row :gutter="12">
        <el-col :span="4"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ fmt(data.users.dau) }}</div><div class="muted">日活 DAU</div></el-card></el-col>
        <el-col :span="4"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ fmt(data.users.mau) }}</div><div class="muted">月活 MAU</div></el-card></el-col>
        <el-col :span="4"><el-card shadow="never" class="kpi-card"><div class="kpi-num ok">{{ fmt(data.users.scan_users_total) }}</div><div class="muted">累计扫码用户</div></el-card></el-col>
        <el-col :span="4"><el-card shadow="never" class="kpi-card"><div class="kpi-num ok">{{ data.users.repurchase_rate }}%</div><div class="muted">复购率</div></el-card></el-col>
        <el-col :span="4"><el-card shadow="never" class="kpi-card"><div class="kpi-num warn">+{{ data.users.new_today }}</div><div class="muted">今日新增</div></el-card></el-col>
        <el-col :span="4"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ data.campaigns.filter((c) => c.status === "进行中").length }}</div><div class="muted">进行中活动</div></el-card></el-col>
      </el-row>

      <el-tabs v-model="activeTab" style="margin-top: 12px">
        <!-- 用户分析 -->
        <el-tab-pane label="用户分析" name="users">
          <el-card shadow="never">
            <template #header>近 7 天活跃与扫码趋势（人次）</template>
            <svg viewBox="0 0 700 220" class="chart">
              <g v-for="(t, i) in data.users.trend_7d" :key="t.date">
                <rect :x="50 + i * 92" :y="175 - t.dau / maxTrend * 140" width="26" :height="t.dau / maxTrend * 140" fill="#409eff" rx="3" />
                <rect :x="80 + i * 92" :y="175 - t.scans / maxTrend * 140" width="26" :height="t.scans / maxTrend * 140" fill="#67c23a" rx="3" />
                <text :x="78 + i * 92" y="193" text-anchor="middle" class="axis-text">{{ t.weekday }}</text>
                <text :x="63 + i * 92" :y="167 - t.dau / maxTrend * 140" text-anchor="middle" class="val-text">{{ t.dau }}</text>
                <text :x="93 + i * 92" :y="167 - t.scans / maxTrend * 140" text-anchor="middle" class="val-text ok-text">{{ t.scans }}</text>
              </g>
              <line x1="30" y1="175" x2="680" y2="175" stroke="#dcdfe6" />
            </svg>
            <div class="legend">
              <span><i class="dot" style="background: #409eff" />DAU</span>
              <span><i class="dot" style="background: #67c23a" />扫码溯源人次</span>
            </div>
          </el-card>
        </el-tab-pane>

        <!-- 营销活动 -->
        <el-tab-pane label="营销活动" name="campaigns">
          <el-table :data="data.campaigns" border stripe>
            <el-table-column prop="name" label="活动名称" min-width="220" />
            <el-table-column prop="type" label="类型" width="110" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }"><el-tag :type="campaignStatusType(row.status)" effect="light">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column label="参与人数" width="110"><template #default="{ row }">{{ fmt(row.participants) }}</template></el-table-column>
            <el-table-column label="转化率" width="110">
              <template #default="{ row }">
                <el-tag v-if="row.conversion > 0" :type="row.conversion >= 15 ? 'success' : 'warning'" effect="light">{{ row.conversion }}%</el-tag>
                <span v-else class="muted">—</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 订单履约 -->
        <el-tab-pane label="订单履约" name="orders">
          <el-table :data="data.orders" border stripe>
            <el-table-column prop="id" label="订单号" width="110" />
            <el-table-column prop="user" label="买家" width="150" />
            <el-table-column prop="product" label="商品" min-width="190" show-overflow-tooltip />
            <el-table-column label="金额" width="90"><template #default="{ row }">¥{{ row.amount.toFixed(2) }}</template></el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }"><el-tag :type="orderStatusType(row.status)" effect="light">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="channel" label="渠道" width="90" />
            <el-table-column prop="date" label="下单日期" width="110" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<style scoped>
.kpi-num { font-size: 24px; font-weight: 700; }
.kpi-num.ok { color: #67c23a; }
.kpi-num.warn { color: #e6a23c; }
.muted { color: #909399; font-size: 12px; }
.chart { width: 100%; height: auto; }
.axis-text { font-size: 12px; fill: #909399; }
.val-text { font-size: 11px; fill: #606266; }
.ok-text { fill: #67c23a; }
.legend { display: flex; gap: 16px; justify-content: center; font-size: 12px; color: #606266; margin-top: 4px; }
.legend .dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; }
</style>
