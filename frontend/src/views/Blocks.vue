<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { createBlock, listBlocks } from "@/api/e2e";
import type { Block } from "@/api/e2e";

const loading = ref(false);
const items = ref<Block[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const form = reactive({
  code: "",
  name: "",
  crop: "",
  variety: "",
  area_mu: 0,
  owner_org: "",
});

const q = reactive({ keyword: "", page: 1, page_size: 10 });

async function load() {
  loading.value = true;
  try {
    const r = await listBlocks({ keyword: q.keyword || undefined, page: q.page, page_size: q.page_size });
    items.value = r.items;
    total.value = r.total;
  } finally {
    loading.value = false;
  }
}

function onCreate() {
  Object.assign(form, {
    code: "",
    name: "",
    crop: "",
    variety: "",
    area_mu: 0,
    owner_org: "",
  });
  dialogVisible.value = true;
}

async function onSubmit() {
  await createBlock(form);
  ElMessage.success("已创建");
  dialogVisible.value = false;
  await load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">地块管理</h2>
      <el-button type="primary" @click="onCreate">新建地块</el-button>
    </div>

    <el-card>
      <el-form inline>
        <el-form-item label="关键词">
          <el-input v-model="q.keyword" placeholder="编码/名称/作物" clearable @keyup.enter="load" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="(q.page = 1), load()">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 12px">
      <el-table :data="items" v-loading="loading" stripe>
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="crop" label="作物" width="120" />
        <el-table-column prop="variety" label="品种" width="120" />
        <el-table-column prop="area_mu" label="面积(亩)" width="100" />
        <el-table-column prop="owner_org" label="所属组织" />
        <el-table-column label="当前种植季" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.current_planting_id" type="success">#{{ row.current_planting_id }}</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top: 12px"
        :total="total"
        :page-size="q.page_size"
        :current-page="q.page"
        @current-change="(p: number) => ((q.page = p), load())"
        layout="prev, pager, next, total"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="新建地块" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="编码"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="作物"><el-input v-model="form.crop" /></el-form-item>
        <el-form-item label="品种"><el-input v-model="form.variety" /></el-form-item>
        <el-form-item label="面积(亩)">
          <el-input-number v-model="form.area_mu" :min="0" />
        </el-form-item>
        <el-form-item label="所属组织"><el-input v-model="form.owner_org" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>