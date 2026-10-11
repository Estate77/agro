<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { listAssets } from "@/api/data_assets";
import type { DataAsset } from "@/api/data_assets";

const router = useRouter();
const loading = ref(false);
const items = ref<DataAsset[]>([]);
const total = ref(0);

const query = reactive({
  keyword: "",
  domain: "",
  page: 1,
  page_size: 10,
});

const domains = [
  "地块",
  "种植",
  "农事",
  "采收",
  "设备",
  "溯源",
  "碳中和",
  "AI",
  "政务",
  "财务",
];

async function load() {
  loading.value = true;
  try {
    const r = await listAssets({
      keyword: query.keyword || undefined,
      domain: query.domain || undefined,
      page: query.page,
      page_size: query.page_size,
    });
    items.value = r.items;
    total.value = r.total;
  } finally {
    loading.value = false;
  }
}

function goDetail(row: DataAsset) {
  router.push(`/data-assets/${row.id}`);
}

function onPageChange(p: number) {
  query.page = p;
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">数据资产管理 ★</h2>
      <el-tag type="info">v0.1 基线 · 首批 10 个数据集已入目录</el-tag>
    </div>

    <el-card>
      <el-form inline>
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="名称/编码" clearable />
        </el-form-item>
        <el-form-item label="业务域">
          <el-select v-model="query.domain" clearable placeholder="全部" style="width: 140px">
            <el-option v-for="d in domains" :key="d" :value="d" :label="d" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="(query.page = 1), load()">查询</el-button>
          <el-button @click="load">刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 12px">
      <el-table :data="items" v-loading="loading" stripe @row-click="goDetail">
        <el-table-column prop="code" label="编码" width="160" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="domain" label="业务域" width="100" />
        <el-table-column prop="refresh_freq" label="刷新频率" width="100" />
        <el-table-column prop="share_scope" label="共享范围" width="100" />
        <el-table-column prop="value_score" label="价值评分" width="100" sortable />
        <el-table-column prop="quality_score" label="质量评分" width="100" sortable />
        <el-table-column label="认证" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.is_certified" type="success">已认证</el-tag>
            <el-tag v-else type="info">未认证</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button text type="primary" @click.stop="goDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 12px"
        :total="total"
        :page-size="query.page_size"
        :current-page="query.page"
        @current-change="onPageChange"
        layout="prev, pager, next, total"
      />
    </el-card>
  </div>
</template>