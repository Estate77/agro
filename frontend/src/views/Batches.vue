<script setup lang="ts">
import { onMounted, ref } from "vue";
import { listBatches } from "@/api/e2e";
import type { Batch } from "@/api/e2e";

const items = ref<Batch[]>([]);
const loading = ref(false);
const page = ref(1);
const total = ref(0);

async function load() {
  loading.value = true;
  try {
    const r = await listBatches({ page: page.value, page_size: 10 });
    items.value = r.items;
    total.value = r.total;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">溯源批次</h2>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-card>
      <el-table :data="items" v-loading="loading" stripe>
        <el-table-column prop="code" label="批次码" width="280" />
        <el-table-column prop="product_name" label="产品" />
        <el-table-column prop="variety" label="品种" width="120" />
        <el-table-column prop="origin" label="产地" width="160" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="chain_tx" label="链上凭证">
          <template #default="{ row }">
            <code style="font-size: 12px; color: #999">
              {{ row.chain_tx || "未上链（v0.5 接入）" }}
            </code>
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