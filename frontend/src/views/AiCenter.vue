<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { aiDisease, aiQa, getAlerts, type AlertItem, type DiseaseResult, type QaResult } from "@/api/cockpit";
import { listBlocks, type Block } from "@/api/e2e";

/** AI 决策中心：农情识别 + 农技问答 + 产量预测（演示） + 灾害预警 */

const CROPS = ["番茄", "黄瓜", "水稻", "小麦", "玉米"];

// ---------- 农情识别 ----------
const fileName = ref("");
const crop = ref<string>("");
const diagnosing = ref(false);
const diagnosis = ref<DiseaseResult | null>(null);

function onFileChange(file: { name: string }) {
  fileName.value = file.name;
  diagnosis.value = null;
}

function onUploadChange(file: { name: string }) {
  onFileChange(file);
}

async function onDiagnose() {
  if (!fileName.value) {
    ElMessage.warning("请先选择一张作物照片");
    return;
  }
  diagnosing.value = true;
  try {
    diagnosis.value = await aiDisease({ image_name: fileName.value, crop: crop.value || undefined });
  } finally {
    diagnosing.value = false;
  }
}

const severityTag = (s: string) => (s === "重度" ? "danger" : s === "中度" ? "warning" : s === "正常" ? "success" : "info");

// ---------- 农技问答 ----------
interface ChatMsg { role: "user" | "ai"; text: string; matched?: boolean }
const question = ref("");
const chatting = ref(false);
const chat = ref<ChatMsg[]>([
  { role: "ai", text: "你好，我是智耘农技师（演示模型 demo-mock-v0.1）。可以问我番茄/黄瓜管理、施肥、浇水、病虫害防治、补贴申报等问题。" },
]);

const SUGGESTIONS = ["番茄白粉病怎么治？", "一亩地底肥用多少？", "寒潮来了怎么防冻？", "滴灌多久浇一次？", "如何申报农机补贴？"];

async function ask(q?: string) {
  const text = (q ?? question.value).trim();
  if (!text || chatting.value) return;
  chat.value.push({ role: "user", text });
  question.value = "";
  chatting.value = true;
  try {
    const r: QaResult = await aiQa(text);
    chat.value.push({ role: "ai", text: r.answer, matched: r.matched });
  } catch (e) {
    chat.value.push({ role: "ai", text: (e as Error).message || "服务异常" });
  } finally {
    chatting.value = false;
  }
}

// ---------- 产量预测（前端确定性演示） ----------
const blocks = ref<Block[]>([]);

function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const YIELD_PER_MU: Record<string, [number, number]> = {
  水稻: [550, 650],
  小麦: [420, 520],
  玉米: [600, 720],
  番茄: [4500, 6000],
  黄瓜: [4000, 5500],
};

interface Forecast { block: Block; yieldKg: number; perMu: number; trend: number; confidence: number }
const forecasts = computed<Forecast[]>(() =>
  blocks.value
    .filter((b) => b.current_planting_id && b.crop)
    .map((b) => {
      const [lo, hi] = YIELD_PER_MU[b.crop || ""] ?? [400, 600];
      const r = (hash32(`fc|${b.code}|2026`) % 1000) / 1000;
      const perMu = Math.round(lo + r * (hi - lo));
      const trend = Math.round((hash32(`trend|${b.code}`) % 140) - 60) / 10;
      const confidence = Math.round(78 + (hash32(`conf|${b.code}`) % 15));
      return { block: b, perMu, yieldKg: Math.round(perMu * b.area_mu), trend, confidence };
    })
);

// ---------- 灾害预警 ----------
const disasterAlerts = ref<AlertItem[]>([]);

onMounted(async () => {
  const [b, a] = await Promise.all([listBlocks({ page: 1, page_size: 50 }), getAlerts()]);
  blocks.value = b.items;
  disasterAlerts.value = a.items;
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">AI 决策中心</h2>
      <el-tag type="info" effect="plain">演示模型 demo-mock-v0.1 · v1.0 接入伏羲大脑等真实大模型</el-tag>
    </div>

    <el-row :gutter="12">
      <!-- 农情识别 -->
      <el-col :span="11">
        <el-card shadow="never">
          <template #header>农情识别 · 拍照识病虫害</template>
          <el-upload
            drag
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="onUploadChange"
          >
            <div class="upload-hint">
              <div style="font-size: 30px">📷</div>
              <div>点击或拖拽照片到此处（演示环境不上传原图，仅取文件名作为识别输入）</div>
            </div>
          </el-upload>

          <el-form inline style="margin-top: 12px">
            <el-form-item label="文件名">
              <el-input :model-value="fileName" placeholder="尚未选择图片" disabled style="width: 200px" />
            </el-form-item>
            <el-form-item label="作物">
              <el-select v-model="crop" placeholder="自动匹配" clearable style="width: 130px">
                <el-option v-for="c in CROPS" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="diagnosing" @click="onDiagnose">开始识别</el-button>
            </el-form-item>
          </el-form>

          <el-result v-if="diagnosis" :icon="diagnosis.code === 'healthy' ? 'success' : 'warning'"
                     :title="diagnosis.name" :sub-title="`${diagnosis.type} · 寄主：${diagnosis.host}`">
            <template #extra>
              <div class="diag">
                <div class="diag-row">
                  <el-tag :type="severityTag(diagnosis.severity)">{{ diagnosis.severity }}</el-tag>
                  <el-progress type="dashboard" :percentage="diagnosis.confidence" :width="72"
                               :color="diagnosis.confidence >= 90 ? '#2e7d32' : '#f57c00'" />
                </div>
                <div class="diag-block">
                  <div class="diag-title">防治建议</div>
                  <ul class="diag-list"><li v-for="(a, i) in diagnosis.advice" :key="i">{{ a }}</li></ul>
                </div>
                <el-descriptions :column="2" size="small" border>
                  <el-descriptions-item label="推荐用药">{{ diagnosis.medicine }}</el-descriptions-item>
                  <el-descriptions-item label="安全间隔期">{{ diagnosis.withdraw_period_days }} 天</el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-result>
        </el-card>
      </el-col>

      <!-- 农技问答 -->
      <el-col :span="13">
        <el-card shadow="never">
          <template #header>AI 农技问答</template>
          <div class="chat">
            <div v-for="(m, i) in chat" :key="i" class="chat-msg" :class="m.role">
              <div class="bubble">
                <div class="bubble-text">{{ m.text }}</div>
                <div v-if="m.matched === false" class="muted">未命中知识库，为兜底回答</div>
              </div>
            </div>
            <div v-if="chatting" class="chat-msg ai"><div class="bubble">思考中…</div></div>
          </div>
          <div class="chips">
            <el-tag v-for="s in SUGGESTIONS" :key="s" class="chip" effect="plain" @click="ask(s)">{{ s }}</el-tag>
          </div>
          <div class="chat-input">
            <el-input v-model="question" placeholder="输入农技问题，回车发送" @keyup.enter="ask()" />
            <el-button type="primary" :loading="chatting" @click="ask()">发送</el-button>
          </div>
        </el-card>

        <!-- 产量预测 -->
        <el-card shadow="never" style="margin-top: 12px">
          <template #header>产量预测（物候 + 长势回归 · 演示数据）</template>
          <el-table :data="forecasts" size="small">
            <el-table-column prop="block.name" label="地块" width="130" />
            <el-table-column prop="block.crop" label="作物" width="80" />
            <el-table-column label="亩产预测(kg)" width="120">
              <template #default="{ row }">{{ row.perMu }}</template>
            </el-table-column>
            <el-table-column label="总产预测(吨)" width="120">
              <template #default="{ row }">{{ (row.yieldKg / 1000).toFixed(1) }}</template>
            </el-table-column>
            <el-table-column label="同比">
              <template #default="{ row }">
                <span :style="{ color: row.trend >= 0 ? '#2e7d32' : '#e53935' }">
                  {{ row.trend >= 0 ? "▲" : "▼" }} {{ Math.abs(row.trend) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column label="模型置信度" width="140">
              <template #default="{ row }"><el-progress :percentage="row.confidence" :stroke-width="8" /></template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 灾害预警 -->
        <el-card shadow="never" style="margin-top: 12px">
          <template #header>灾害与农情感知预警（气象 + 设备 + 农事联动）</template>
          <el-table :data="disasterAlerts" size="small">
            <el-table-column label="等级" width="70">
              <template #default="{ row }">
                <el-tag size="small" :type="row.level === '高' ? 'danger' : row.level === '中' ? 'warning' : 'info'">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="msg" label="内容" min-width="220" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.muted { color: #909399; font-size: 12px; }
.upload-hint { padding: 18px 0; color: #607d8b; font-size: 13px; }
.diag { text-align: left; width: 100%; }
.diag-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.diag-block { margin-bottom: 10px; }
.diag-title { font-weight: 600; margin-bottom: 6px; }
.diag-list { margin: 0; padding-left: 18px; color: #455a64; font-size: 13px; line-height: 1.9; }
.chat { max-height: 300px; overflow-y: auto; padding: 4px 2px; }
.chat-msg { display: flex; margin-bottom: 10px; }
.chat-msg.user { justify-content: flex-end; }
.chat-msg.ai { justify-content: flex-start; }
.bubble { max-width: 78%; padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.7; white-space: pre-wrap; }
.chat-msg.user .bubble { background: #2e7d32; color: #fff; }
.chat-msg.ai .bubble { background: #f0f4f1; color: #263238; }
.chips { margin: 10px 0; display: flex; flex-wrap: wrap; gap: 6px; }
.chip { cursor: pointer; }
.chat-input { display: flex; gap: 8px; }
</style>
