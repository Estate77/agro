<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  completeTask,
  createBlock,
  createHarvest,
  createPlanting,
  createTask,
  listBatches,
  listBlocks,
} from "@/api/e2e";
import type { Batch, Block } from "@/api/e2e";

/** 端到端示例：建地块 → 建种植季 → 建任务 → 打卡 → 录入采收（自动生成批次） */

const step = ref(0);

const blockForm = reactive({ code: "D-002", name: "2 号示范田", crop: "水稻", variety: "南粳 9108", area_mu: 80 });
const blockId = ref<number | null>(null);

const plantingForm = reactive({ season: "2026 春", crop: "水稻", variety: "南粳 9108", start_date: "2026-04-10" });
const plantingId = ref<number | null>(null);

const taskForm = reactive({ type: "施肥", plan_date: "2026-05-01", assignee: "王技术员", note: "分蘖期追肥" });
const taskId = ref<number | null>(null);

const harvestForm = reactive({ weight_kg: 1200, quality_grade: "A", operator: "采收员 A" });

const batches = ref<Batch[]>([]);
const blocks = ref<Block[]>([]);

async function onCreateBlock() {
  const r = await createBlock(blockForm);
  blockId.value = r.id;
  step.value = 1;
  ElMessage.success(`已建地块 #${r.id}`);
}

async function onCreatePlanting() {
  if (!blockId.value) return ElMessage.warning("先建地块");
  const r = await createPlanting({
    block_id: blockId.value,
    season: plantingForm.season,
    crop: plantingForm.crop,
    variety: plantingForm.variety,
    start_date: plantingForm.start_date,
  });
  plantingId.value = r.id;
  step.value = 2;
  ElMessage.success(`已建种植季 #${r.id}`);
}

async function onCreateTask() {
  if (!plantingId.value) return ElMessage.warning("先建种植季");
  const r = await createTask({
    planting_id: plantingId.value,
    type: taskForm.type,
    plan_date: taskForm.plan_date,
    assignee: taskForm.assignee,
    note: taskForm.note,
  });
  taskId.value = r.id;
  step.value = 3;
  ElMessage.success(`已建任务 #${r.id}`);
}

async function onCompleteTask() {
  if (!taskId.value) return;
  await completeTask(taskId.value, "已留痕打卡");
  step.value = 4;
  ElMessage.success("任务已完成");
}

async function onHarvest() {
  if (!plantingId.value) return ElMessage.warning("先建种植季");
  await createHarvest({
    planting_id: plantingId.value,
    weight_kg: harvestForm.weight_kg,
    quality_grade: harvestForm.quality_grade,
    operator: harvestForm.operator,
  });
  step.value = 5;
  ElMessage.success("已录入采收（自动生成溯源批次）");
  await reloadBatches();
}

async function reloadBatches() {
  const r = await listBatches({ page: 1, page_size: 10 });
  batches.value = r.items;
}

async function reloadBlocks() {
  const r = await listBlocks({ page: 1, page_size: 10 });
  blocks.value = r.items;
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">端到端业务示例</h2>
      <el-button @click="reloadBatches">刷新批次</el-button>
    </div>

    <el-alert type="success" :closable="false" style="margin-bottom: 12px">
      一笔采收 = 一个溯源批次。本演示点击 6 步按钮即可走完"地块 → 种植季 → 任务 → 打卡 → 采收 → 自动批次"，并在右侧看到新生成的溯源码。
    </el-alert>

    <el-row :gutter="12">
      <el-col :span="14">
        <el-card>
          <el-steps :active="step" finish-status="success" simple>
            <el-step title="建地块" />
            <el-step title="建种植季" />
            <el-step title="建任务" />
            <el-step title="打卡" />
            <el-step title="采收" />
            <el-step title="自动批次" />
          </el-steps>

          <el-divider />

          <el-form label-width="100px">
            <h4>① 新建地块</h4>
            <el-form-item label="编码"><el-input v-model="blockForm.code" /></el-form-item>
            <el-form-item label="名称"><el-input v-model="blockForm.name" /></el-form-item>
            <el-form-item label="作物"><el-input v-model="blockForm.crop" /></el-form-item>
            <el-form-item label="品种"><el-input v-model="blockForm.variety" /></el-form-item>
            <el-form-item label="面积(亩)">
              <el-input-number v-model="blockForm.area_mu" :min="0" />
            </el-form-item>
            <el-button type="primary" :disabled="step > 0" @click="onCreateBlock">创建地块</el-button>
          </el-form>

          <el-divider />

          <el-form label-width="100px">
            <h4>② 新建种植季</h4>
            <el-form-item label="季节"><el-input v-model="plantingForm.season" /></el-form-item>
            <el-form-item label="作物"><el-input v-model="plantingForm.crop" /></el-form-item>
            <el-form-item label="品种"><el-input v-model="plantingForm.variety" /></el-form-item>
            <el-form-item label="开始日期">
              <el-input v-model="plantingForm.start_date" placeholder="YYYY-MM-DD" />
            </el-form-item>
            <el-button type="primary" :disabled="step < 1 || step > 1" @click="onCreatePlanting">创建种植季</el-button>
          </el-form>

          <el-divider />

          <el-form label-width="100px">
            <h4>③ 新建农事任务</h4>
            <el-form-item label="类型"><el-input v-model="taskForm.type" /></el-form-item>
            <el-form-item label="计划日期"><el-input v-model="taskForm.plan_date" /></el-form-item>
            <el-form-item label="执行人"><el-input v-model="taskForm.assignee" /></el-form-item>
            <el-form-item label="备注"><el-input v-model="taskForm.note" /></el-form-item>
            <el-button type="primary" :disabled="step < 2 || step > 2" @click="onCreateTask">创建任务</el-button>
          </el-form>

          <el-divider />

          <h4>④ 任务打卡</h4>
          <el-button type="success" :disabled="step < 3 || step > 3" @click="onCompleteTask">
            标记完成（写入留痕）
          </el-button>

          <el-divider />

          <h4>⑤ 录入采收（自动生成溯源批次）</h4>
          <el-form label-width="100px" :inline="true">
            <el-form-item label="重量(kg)">
              <el-input-number v-model="harvestForm.weight_kg" :min="0" />
            </el-form-item>
            <el-form-item label="等级">
              <el-select v-model="harvestForm.quality_grade" style="width: 100px">
                <el-option value="A" label="A" />
                <el-option value="B" label="B" />
                <el-option value="C" label="C" />
              </el-select>
            </el-form-item>
            <el-form-item label="操作员">
              <el-input v-model="harvestForm.operator" />
            </el-form-item>
          </el-form>
          <el-button
            type="warning"
            :disabled="step < 4 || step > 4"
            @click="onHarvest"
          >
            录入采收
          </el-button>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card>
          <template #header>最近批次（自动入库）</template>
          <el-table :data="batches" stripe>
            <el-table-column prop="code" label="批次码" />
            <el-table-column prop="product_name" label="产品" />
            <el-table-column prop="status" label="状态" width="100" />
          </el-table>
          <p v-if="batches.length === 0" style="text-align: center; color: #999; margin-top: 12px">
            暂无批次，先走左侧流程
          </p>
        </el-card>

        <el-card style="margin-top: 12px">
          <template #header>地块清单</template>
          <el-button size="small" @click="reloadBlocks">刷新</el-button>
          <el-table :data="blocks" stripe size="small" style="margin-top: 8px">
            <el-table-column prop="code" label="编码" width="100" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="crop" label="作物" width="80" />
            <el-table-column prop="area_mu" label="面积" width="80" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>