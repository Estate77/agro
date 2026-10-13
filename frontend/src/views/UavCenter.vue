<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getUavOverview, type UavOverview } from "@/api/center";

/** 无人机与机器人调度中心：远程监控 / 任务派发 / 航线规划 / 维护工单 */

const loading = ref(false);
const data = ref<UavOverview | null>(null);
const activeTab = ref("missions");

const statusType = (s: string) =>
  s === "作业中" || s === "巡检中" ? "success" : s === "待起飞" || s === "待处理" ? "warning" : s === "处理中" ? "primary" : "info";

const batteryColor = (b: number) => (b <= 20 ? "#f56c6c" : b <= 50 ? "#e6a23c" : "#67c23a");

// 派发任务（演示：本地模拟）
const dispatchVisible = ref(false);
const dispatchForm = ref({ name: "", block_name: "", type: "喷洒", area_mu: 20, agent: "SN-UAV-0502" });
const openDispatch = () => {
  dispatchForm.value = { name: "", block_name: data.value?.missions[0]?.block_name ?? "", type: "喷洒", area_mu: 20, agent: "SN-UAV-0502" };
  dispatchVisible.value = true;
};
const submitDispatch = () => {
  if (!dispatchForm.value.name) {
    ElMessage.warning("请填写任务名称");
    return;
  }
  dispatchVisible.value = false;
  ElMessage.success(`任务已派发至 ${dispatchForm.value.agent}：${dispatchForm.value.name}（演示）`);
};

onMounted(async () => {
  loading.value = true;
  try {
    data.value = await getUavOverview();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">无人机与机器人调度</h2>
      <el-tag type="info" effect="plain">演示数据 · 与物联网设备台账联动</el-tag>
    </div>

    <template v-if="data">
      <el-row :gutter="12">
        <el-col :span="8"><el-card shadow="never" class="kpi-card"><div class="kpi-num ok">{{ data.stats.active_missions }}</div><div class="muted">作业中任务</div></el-card></el-col>
        <el-col :span="8"><el-card shadow="never" class="kpi-card"><div class="kpi-num warn">{{ data.stats.pending_missions }}</div><div class="muted">待起飞任务</div></el-card></el-col>
        <el-col :span="8"><el-card shadow="never" class="kpi-card"><div class="kpi-num">{{ data.stats.area_today_mu }}</div><div class="muted">今日作业面积（亩）</div></el-card></el-col>
      </el-row>

      <el-tabs v-model="activeTab" style="margin-top: 12px">
        <!-- 任务派发 -->
        <el-tab-pane label="任务派发" name="missions">
          <div style="margin-bottom: 10px">
            <el-button type="primary" @click="openDispatch">派发新任务</el-button>
          </div>
          <el-table :data="data.missions" border stripe>
            <el-table-column prop="id" label="任务号" width="80" />
            <el-table-column prop="name" label="任务名称" min-width="220" show-overflow-tooltip />
            <el-table-column prop="block_name" label="地块" min-width="120" />
            <el-table-column prop="type" label="类型" width="80" />
            <el-table-column prop="area_mu" label="面积(亩)" width="90" />
            <el-table-column prop="agent" label="执行设备" width="130" />
            <el-table-column prop="pilot" label="飞手" width="90" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 远程监控 -->
        <el-tab-pane label="远程监控" name="fleet">
          <el-row :gutter="12">
            <el-col :span="8" v-for="d in data.fleet" :key="d.sn">
              <el-card shadow="never" class="agent-card">
                <div class="agent-head">
                  <span class="agent-kind">{{ d.kind }}</span>
                  <el-tag :type="statusType(d.status)" effect="dark" size="small">{{ d.status }}</el-tag>
                </div>
                <div class="agent-model">{{ d.model }}</div>
                <div class="agent-sn">{{ d.sn }}</div>
                <div class="battery-row">
                  <span>电量</span>
                  <el-progress :percentage="d.battery" :color="batteryColor(d.battery)" :stroke-width="10" style="flex: 1" />
                </div>
                <div class="agent-grid">
                  <div><span class="muted">载重/药箱</span><b>{{ d.payload_l ? d.payload_l + " L" : "—" }}</b></div>
                  <div><span class="muted">速度</span><b>{{ d.speed }}</b></div>
                  <div><span class="muted">位置</span><b class="mono">{{ d.pos }}</b></div>
                </div>
                <div class="agent-task">当前任务：{{ d.task }}</div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 航线规划 -->
        <el-tab-pane label="航线规划" name="routes">
          <el-table :data="data.routes" border stripe>
            <el-table-column prop="id" label="航线号" width="80" />
            <el-table-column prop="name" label="航线名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="block_name" label="地块" min-width="120" />
            <el-table-column prop="waypoints" label="航点数" width="80" />
            <el-table-column label="航程" width="90">
              <template #default="{ row }">{{ (row.length_m / 1000).toFixed(2) }} km</template>
            </el-table-column>
            <el-table-column label="亩均喷量" width="100">
              <template #default="{ row }">{{ row.spray_l_per_mu ? row.spray_l_per_mu + " L/亩" : "—" }}</template>
            </el-table-column>
            <el-table-column prop="obstacles" label="障碍物标注" min-width="140" />
          </el-table>
        </el-tab-pane>

        <!-- 维护工单 -->
        <el-tab-pane label="维护工单" name="maintenance">
          <el-table :data="data.maintenance" border stripe>
            <el-table-column prop="id" label="工单号" width="90" />
            <el-table-column prop="sn" label="设备 SN" width="140" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="desc" label="内容" min-width="260" show-overflow-tooltip />
            <el-table-column label="累计工时" width="100">
              <template #default="{ row }">{{ row.hours ? row.hours + " h" : "—" }}</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>

  <!-- 派发任务弹窗 -->
  <el-dialog v-model="dispatchVisible" title="派发作业任务（演示）" width="480">
    <el-form label-width="90">
      <el-form-item label="任务名称"><el-input v-model="dispatchForm.name" placeholder="如：东区番茄棚 蚜虫防治" /></el-form-item>
      <el-form-item label="目标地块"><el-input v-model="dispatchForm.block_name" /></el-form-item>
      <el-form-item label="作业类型">
        <el-radio-group v-model="dispatchForm.type">
          <el-radio-button value="喷洒">喷洒</el-radio-button>
          <el-radio-button value="播撒">播撒</el-radio-button>
          <el-radio-button value="巡检">巡检</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="面积(亩)"><el-input-number v-model="dispatchForm.area_mu" :min="1" :max="2000" /></el-form-item>
      <el-form-item label="执行设备">
        <el-select v-model="dispatchForm.agent" style="width: 100%">
          <el-option v-for="d in data?.fleet ?? []" :key="d.sn" :value="d.sn" :label="`${d.sn}（${d.model}·${d.status}）`" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dispatchVisible = false">取消</el-button>
      <el-button type="primary" @click="submitDispatch">确认派发</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.kpi-num { font-size: 28px; font-weight: 700; }
.kpi-num.ok { color: #67c23a; }
.kpi-num.warn { color: #e6a23c; }
.muted { color: #909399; font-size: 12px; }
.agent-card { margin-bottom: 12px; }
.agent-head { display: flex; justify-content: space-between; align-items: center; }
.agent-kind { color: #909399; font-size: 12px; }
.agent-model { font-size: 17px; font-weight: 700; margin-top: 4px; }
.agent-sn { font-family: monospace; color: #909399; font-size: 12px; margin: 2px 0 8px; }
.battery-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #909399; }
.agent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; margin: 10px 0; font-size: 13px; }
.agent-grid span { margin-right: 6px; }
.mono { font-family: monospace; }
.agent-task { font-size: 12px; color: #606266; background: #f5f7fa; border-radius: 4px; padding: 6px 8px; }
</style>
