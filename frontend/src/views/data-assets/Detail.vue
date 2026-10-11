<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { addQuality, certifyAsset, getAsset } from "@/api/data_assets";
import type { DataAsset } from "@/api/data_assets";

const route = useRoute();
const router = useRouter();
const asset = ref<DataAsset | null>(null);
const loading = ref(false);

const newQuality = ref({
  completeness: 98,
  accuracy: 95,
  timeliness: 99,
  consistency: 96,
  notes: "首批稽核通过",
});

async function load() {
  loading.value = true;
  try {
    asset.value = await getAsset(Number(route.params.id));
  } finally {
    loading.value = false;
  }
}

async function onCertify() {
  if (!asset.value) return;
  await certifyAsset(asset.value.id);
  ElMessage.success("已入库存证");
  await load();
}

async function onAddQuality() {
  if (!asset.value) return;
  await addQuality(asset.value.id, newQuality.value);
  ElMessage.success("已记录稽核");
  await load();
}

onMounted(load);
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <el-button @click="router.back()">返回</el-button>
      <h2 class="page-title">数据资产详情</h2>
      <div>
        <el-button v-if="!asset?.is_certified" type="primary" @click="onCertify">
          入库存证（生成 cert_hash）
        </el-button>
      </div>
    </div>

    <el-card v-if="asset">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="编码">{{ asset.code }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ asset.name }}</el-descriptions-item>
        <el-descriptions-item label="业务域">{{ asset.domain }}</el-descriptions-item>
        <el-descriptions-item label="数据集">{{ asset.dataset }}</el-descriptions-item>
        <el-descriptions-item label="刷新频率">{{ asset.refresh_freq }}</el-descriptions-item>
        <el-descriptions-item label="共享范围">
          <el-tag>{{ asset.share_scope }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数据源">{{ asset.owner || "—" }}</el-descriptions-item>
        <el-descriptions-item label="系统">{{ asset.source_system || "—" }}</el-descriptions-item>
        <el-descriptions-item label="SLA">{{ asset.sla || "—" }}</el-descriptions-item>
        <el-descriptions-item label="价值评分">{{ asset.value_score }}</el-descriptions-item>
        <el-descriptions-item label="质量评分">{{ asset.quality_score }}</el-descriptions-item>
        <el-descriptions-item label="入存证">
          <el-tag v-if="asset.is_certified" type="success">已认证</el-tag>
          <el-tag v-else type="info">未认证</el-tag>
          <span v-if="asset.cert_hash" class="hash"> {{ asset.cert_hash.slice(0, 16) }}…</span>
        </el-descriptions-item>
        <el-descriptions-item label="说明" :span="3">{{ asset.description }}</el-descriptions-item>
      </el-descriptions>

      <h3 style="margin-top: 20px">字段定义（Schema）</h3>
      <el-table :data="asset.schema_json" border>
        <el-table-column prop="name" label="字段名" width="140" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column label="主键" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.primary" type="success" size="small">主键</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="敏感" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.sensitive" type="danger" size="small">敏感</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上链" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.on_chain" type="warning" size="small">上链</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" />
      </el-table>

      <h3 style="margin-top: 20px">质量稽核记录</h3>
      <el-table :data="asset.qualities || []" border>
        <el-table-column prop="check_date" label="稽核时间" width="180" />
        <el-table-column prop="completeness" label="完整率" />
        <el-table-column prop="accuracy" label="准确率" />
        <el-table-column prop="timeliness" label="及时率" />
        <el-table-column prop="consistency" label="一致性" />
        <el-table-column prop="notes" label="备注" />
      </el-table>

      <h3 style="margin-top: 20px">新增稽核</h3>
      <el-form :inline="true" :model="newQuality">
        <el-form-item label="完整率">
          <el-input-number v-model="newQuality.completeness" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="准确率">
          <el-input-number v-model="newQuality.accuracy" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="及时率">
          <el-input-number v-model="newQuality.timeliness" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="一致性">
          <el-input-number v-model="newQuality.consistency" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="newQuality.notes" style="width: 220px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onAddQuality">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.hash {
  color: #999;
  font-family: monospace;
  font-size: 12px;
  margin-left: 8px;
}
</style>