<script setup lang="ts">
import { ref } from "vue";
import { reportEmergency } from "@/api/ext";

const types = ["病虫害", "药害/肥害", "环境污染", "自然灾害", "农产品质量安全", "其他"];
const type = ref(types[0]);
const desc = ref("");
const geo = ref("");
const photo = ref("");
const voice = ref("");
const locating = ref(false);
const submitting = ref(false);
const result = ref<{ id: string; dispatch_to: string; sla_min: number } | null>(null);
const error = ref("");

function locate() {
  locating.value = true;
  setTimeout(() => {
    geo.value = "34.7466°N, 113.6254°E（自动定位）";
    locating.value = false;
  }, 700);
}

function takePhoto() {
  photo.value = `IMG_${Date.now()}.jpg（模拟现场照片）`;
}

function onVoice() {
  voice.value = "「西区 3 号地块发现成片死苗，叶子发黄卷曲，怀疑昨天打药浓度过高。」（语音转写演示）";
}

async function submit() {
  if (!desc.value.trim() && !voice.value) {
    error.value = "请填写文字描述或使用语音描述";
    return;
  }
  error.value = "";
  submitting.value = true;
  try {
    const r = await reportEmergency({
      type: type.value,
      desc: desc.value || voice.value,
      geo: geo.value || undefined,
      photo_name: photo.value || undefined,
      voice_text: voice.value || undefined,
    });
    result.value = { id: r.id, dispatch_to: r.dispatch_to, sla_min: r.sla_min };
  } catch (e: any) {
    error.value = e.message || "提交失败";
  } finally {
    submitting.value = false;
  }
}

function reset() {
  type.value = types[0];
  desc.value = "";
  geo.value = "";
  photo.value = "";
  voice.value = "";
  result.value = null;
}
</script>

<template>
  <div>
    <header class="navbar g-navbar">
      <div class="title">应急上报</div>
      <span class="tag" style="background: rgba(255,255,255,0.2); color: #fff">拍照+定位 闭环</span>
    </header>

    <div class="page">
      <!-- 提交成功回执 -->
      <div v-if="result" class="card done">
        <div style="font-size: 46px">✅</div>
        <b style="font-size: 20px; margin: 8px 0">上报成功，已自动派单</b>
        <div class="kv"><span>事件编号</span><span>{{ result.id }}</span></div>
        <div class="kv"><span>派单单位</span><span>{{ result.dispatch_to }}</span></div>
        <div class="kv"><span>处置时限</span><span>{{ result.sla_min }} 分钟内响应</span></div>
        <div class="kv"><span>回执流转</span><span>PC 端应急指挥 → 处置回执 → 闭环</span></div>
        <button class="btn btn-primary btn-block mt16" @click="reset">继续上报</button>
      </div>

      <!-- 上报表单 -->
      <template v-else>
        <div class="card">
          <b style="font-size: 17px">1️⃣ 事件类型</b>
          <div class="chips mt8">
            <button
              v-for="t in types"
              :key="t"
              class="chip"
              :class="{ on: type === t }"
              @click="type = t"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <div class="card">
          <b style="font-size: 17px">2️⃣ 现场取证</b>
          <div class="row mt8">
            <button class="evid" :class="{ got: photo }" @click="takePhoto">
              {{ photo ? "✅ " + photo.slice(0, 14) + "…" : "📷 拍照 / 选图" }}
            </button>
            <button class="evid" :class="{ got: geo }" @click="locate">
              {{ geo ? "✅ 已定位" : locating ? "定位中…" : "📍 获取定位" }}
            </button>
          </div>
          <button class="btn btn-ghost btn-block mt8" @click="onVoice">
            🎙️ 语音描述（演示自动转写）
          </button>
          <p v-if="voice" class="voice">{{ voice }}</p>
        </div>

        <div class="card">
          <b style="font-size: 17px">3️⃣ 情况说明</b>
          <textarea
            v-model="desc"
            class="input mt8"
            rows="4"
            style="resize: none"
            placeholder="补充事件发生时间、地块位置、影响范围等（可与语音描述二选一）"
          ></textarea>
          <p v-if="error" class="err">{{ error }}</p>
          <button class="btn btn-primary btn-block mt8" style="background: #d9463e" :disabled="submitting" @click="submit">
            {{ submitting ? "提交中…" : "🚨 提交并派单" }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.g-navbar {
  background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1.5px solid transparent;
  border-radius: 999px;
  font-size: 15px;
  cursor: pointer;
}
.chip.on {
  background: #fee2e2;
  border-color: #ef4444;
  color: #b91c1c;
  font-weight: 600;
}
.evid {
  flex: 1;
  min-height: 72px;
  border: 1.5px dashed var(--zy-line);
  border-radius: 12px;
  background: #fafbfc;
  font-size: 15px;
  cursor: pointer;
  padding: 8px;
}
.evid.got {
  border-style: solid;
  border-color: #22c55e;
  background: #f0fdf4;
}
.voice {
  margin: 10px 0 0;
  padding: 10px 12px;
  background: #f5f8ff;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
}
.err {
  color: var(--zy-danger);
  font-size: 14px;
  margin: 8px 0 0;
}
.done {
  text-align: center;
}
.kv {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  padding: 8px 0;
  text-align: left;
  border-bottom: 1px dashed var(--zy-line);
}
.kv:last-of-type {
  border-bottom: none;
}
.kv span:first-child {
  color: var(--zy-text-2);
  flex-shrink: 0;
}
.kv span:last-child {
  text-align: right;
  font-weight: 500;
}
</style>
