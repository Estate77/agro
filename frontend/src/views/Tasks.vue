<script setup lang="ts">
import { onMounted, ref } from "vue";
import http, { type Resp, unwrap, type PageOut } from "@/api/client";
import type { FarmworkTask } from "@/api/e2e";
import { ElMessage } from "element-plus";

const items = ref<FarmworkTask[]>([]);
const total = ref(0);
const loading = ref(false);
const page = ref(1);

async function load() {
  loading.value = true;
  try {
    const r = await unwrap<PageOut<FarmworkTask>>(
      http.get<Resp<PageOut<FarmworkTask>>>("/v1/farmwork", {
        params: { page: page.value, page_size: 10 },
      })
    );
    items.value = r.items;
    total.value = r.total;
  } finally {
    loading.value = false;
  }
}

async function complete(row: FarmworkTask) {
  await unwrap(
    http.put<Resp<{ id: number }>>(`/v1/farmwork/${row.id}`, {
      status: "已完成",
    })
  );
  ElMessage.success(`任务 #${row.id} 已完结`);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">农事任务</h2>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-card>
      <el-table :data="items" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="planting_id" label="种植季" width="100" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="plan_date" label="计划日期" width="120" />
        <el-table-column prop="assignee" label="执行人" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已完成' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              text
              type="primary"
              :disabled="row.status === '已完成'"
              @click="complete(row)"
            >
              标记完成
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top: 12px"
        :total="total"
        :page-size="10"
        :current-page="page"
        @current-change="(p: number) => ((page = p), load())"
        layout="prev, pager, next, total"
      />
    </el-card>
  </div>
</template>