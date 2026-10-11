<script setup lang="ts">
import { ref } from "vue";
import { diagnose, type DiseaseResult } from "@/api/app";
import { compressImage } from "@/utils/image";

const photo = ref<string | null>(null);
const photoName = ref("");
const crop = ref("水稻");
const crops = ["水稻", "小麦", "玉米", "番茄", "黄瓜", "通用"];
const analyzing = ref(false);
const result = ref<DiseaseResult | null>(null);

// 本地识别历史（演示）
interface HistoryItem {
  ts: string;
  name: string;
  confidence: number;
  photo?: string | null;
}
const history = ref<HistoryItem[]>(
  (() => {
    try {
      return JSON.parse(localStorage.getItem("zy_disease_history") || "[]");
    } catch {
      return [];
    }
  })()
);

function saveHistory() {
  localStorage.setItem("zy_disease_history", JSON.stringify(history.value.slice(0, 20)));
}

async function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  photoName.value = file.name;
  photo.value = await compressImage(file, 640, 0.7);
  result.value = null;
}

async function onAnalyze() {
  if (!photo.value && !photoName.value) return;
  analyzing.value = true;
  try {
    // 演示版：文件名 + 作物 → 后端确定性知识库结果
    result.value = await diagnose(photoName.value || `IMG_${Date.now()}.jpg`, crop.value);
    history.value.unshift({
      ts: new Date().toLocaleString("zh-CN", { hour12: false }),
      name: result.value.name,
      confidence: result.value.confidence,
      photo: photo.value,
    });
    saveHistory();
  } finally {
    analyzing.value = false;
  }
}

function severityTag(s: string) {
  return s === "重度" ? "tag-red" : s === "中度" ? "tag-warn" : "tag-green";
}
</script>

<template>
  <div>
    <header class="navbar">
      <div class="grow">
        <div class="title">拍照识病虫害</div>
        <div style="font-size: 13px; opacity: 0.9">对准叶片/果实拍一张，AI 帮你诊断</div>
      </div>
    </header>

    <div class="page">
      <!-- 拍照区 -->
      <label class="camera">
        <input type="file" accept="image/*" capture="environment" hidden @change="onPick" />
        <template v-if="!photo">
          <span style="font-size: 52px">📷</span>
          <span style="font-size: 18px; font-weight: 600">点击拍照 / 选图</span>
          <span class="muted" style="font-size: 14px">支持叶片病斑、虫体、整株照片</span>
        </template>
        <img v-else :src="photo" style="width: 100%; max-height: 260px; object-fit: cover; border-radius: 12px" />
      </label>

      <div class="row mt8">
        <span class="muted">作物：</span>
        <select v-model="crop" class="input" style="min-height: 44px; flex: 1">
          <option v-for="c in crops" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <button
        class="btn btn-primary btn-block mt16"
        :disabled="analyzing || (!photo && !photoName)"
        @click="onAnalyze"
      >
        {{ analyzing ? "AI 分析中…" : "开始识别" }}
      </button>

      <!-- 识别结果 -->
      <div v-if="result" class="card mt16 result">
        <div class="row">
          <b class="grow" style="font-size: 22px">{{ result.name }}</b>
          <span class="tag" :class="severityTag(result.severity)">{{ result.severity }}</span>
        </div>
        <div class="muted mt8">{{ result.type }} · 常见宿主：{{ result.host }}</div>

        <div class="conf mt16">
          <div class="row" style="justify-content: space-between">
            <span style="font-size: 15px">识别置信度</span>
            <b style="font-size: 18px; color: var(--zy-primary)">{{ result.confidence }}%</b>
          </div>
          <div class="bar">
            <i :style="{ width: result.confidence + '%' }"></i>
          </div>
        </div>

        <b class="mt16" style="display: block; font-size: 17px">防治建议</b>
        <ol class="advice">
          <li v-for="(a, i) in result.advice" :key="i">{{ a }}</li>
        </ol>

        <div class="med mt16">
          💊 推荐用药：<b>{{ result.medicine }}</b>
          <span v-if="result.withdraw_period_days > 0" class="tag tag-warn" style="margin-left: 8px">
            安全间隔期 {{ result.withdraw_period_days }} 天
          </span>
        </div>
        <p class="muted" style="font-size: 12px; margin: 8px 0 0">
          演示模式：结果由内置知识库生成（{{ result.model }}），v0.5 将接入真实识别模型
        </p>
      </div>

      <!-- 识别历史 -->
      <div v-if="history.length" class="card mt16">
        <b style="font-size: 17px">最近识别</b>
        <div v-for="(h, i) in history.slice(0, 6)" :key="i" class="hitem">
          <img v-if="h.photo" :src="h.photo" />
          <div class="grow">
            <div style="font-size: 16px; font-weight: 600">{{ h.name }}</div>
            <div class="muted" style="font-size: 13px">{{ h.ts }} · 置信度 {{ h.confidence }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.camera {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 220px;
  background: #fff;
  border: 2px dashed var(--zy-line);
  border-radius: 18px;
  cursor: pointer;
  padding: 18px;
}
.result {
  border: 1.5px solid var(--zy-primary-soft);
}
.conf .bar {
  height: 10px;
  background: #eef1f4;
  border-radius: 999px;
  margin-top: 6px;
  overflow: hidden;
}
.conf .bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #3f9d68, #2f7d4f);
  border-radius: 999px;
}
.advice {
  padding-left: 20px;
  margin: 8px 0 0;
  line-height: 1.8;
  font-size: 16px;
}
.med {
  background: var(--zy-primary-soft);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 15px;
}
.hitem {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--zy-line);
}
.hitem:last-child {
  border-bottom: none;
}
.hitem img {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 8px;
}
</style>