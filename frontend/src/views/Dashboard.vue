<script setup lang="ts">
import { onMounted, ref } from "vue";
import { dashboardKpi } from "@/api/e2e";

const kpi = ref<Record<string, number>>({});
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    kpi.value = await dashboardKpi();
  } finally {
    loading.value = false;
  }
}
onMounted(load);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">工作台</h2>
      <el-button @click="load" :loading="loading">刷新</el-button>
    </div>

    <el-row :gutter="12" v-if="kpi">
      <el-col :span="6">
        <div class="kpi-card">
          <div class="label">地块数</div>
          <div class="value">{{ kpi.blocks ?? 0 }}</div>
          <div class="sub">本租户</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card">
          <div class="label">农事任务完成率</div>
          <div class="value">{{ kpi.task_done_rate ?? 0 }}%</div>
          <div class="sub">{{ kpi.tasks_done ?? 0 }} / {{ kpi.tasks_total ?? 0 }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card">
          <div class="label">溯源批次</div>
          <div class="value">{{ kpi.batches ?? 0 }}</div>
          <div class="sub">采收 {{ kpi.harvests ?? 0 }} 笔</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card" style="background: #fff8e1">
          <div class="label">数据资产入存率 ★</div>
          <div class="value">{{ kpi.asset_certified_rate ?? 0 }}%</div>
          <div class="sub">{{ kpi.data_assets_certified ?? 0 }} / {{ kpi.data_assets ?? 0 }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card style="margin-top: 16px">
      <template #header>快速入口</template>
      <div class="kpi-grid">
        <el-button type="primary" plain @click="$router.push('/data-assets')">
          数据资产管理 ★
        </el-button>
        <el-button type="success" plain @click="$router.push('/blocks')">地块管理</el-button>
        <el-button type="warning" plain @click="$router.push('/tasks')">农事任务</el-button>
        <el-button type="info" plain @click="$router.push('/batches')">溯源批次</el-button>
        <el-button plain @click="$router.push('/e2e')">端到端示例</el-button>
      </div>
    </el-card>
  </div>
</template>