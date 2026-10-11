<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { checkIn, listTasks, type FarmTask, type TaskEvidence } from "@/api/app";
import { compressImage } from "@/utils/image";
import { enqueueCheckIn, queueSize } from "@/utils/offline";

const tasks = ref<FarmTask[]>([]);
const loading = ref(false);
const filter = ref<string>("待办");
const filters = ["待办", "进行中", "已完成", "全部"];

const toast = ref("");
let toastTimer: ReturnType<typeof setTimeout> | null = null;
function say(msg: string) {
  toast.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 2200);
}

async function load() {
  loading.value = true;
  try {
    const r = await listTasks({
      status: filter.value === "全部" ? undefined : filter.value,
      page: 1,
      page_size: 30,
    });
    tasks.value = r.items;
  } finally {
    loading.value = false;
  }
}

function setFilter(f: string) {
  filter.value = f;
  load();
}

// ---------- 打卡弹层 ----------
const sheet = ref<FarmTask | null>(null);
const phase = ref<"before" | "after">("before");
const note = ref("");
const photoDataUrl = ref<string | null>(null);
const photoName = ref("");
const geo = ref<string>("");
const submitting = ref(false);

function openSheet(t: FarmTask) {
  sheet.value = t;
  phase.value = t.status === "待办" ? "before" : "after";
  note.value = "";
  photoDataUrl.value = null;
  photoName.value = "";
  geo.value = "";
}

async function onPickPhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  photoName.value = file.name;
  photoDataUrl.value = await compressImage(file);
}

async function onSubmit() {
  if (!sheet.value) return;
  submitting.value = true;
  const evidences: TaskEvidence[] = [];
  if (photoDataUrl.value) {
    evidences.push({ type: "photo", name: photoName.value, data_url: photoDataUrl.value });
  }
  if (geo.value) {
    evidences.push({ type: "note", name: "定位", data_url: geo.value });
  }
  const payload = {
    phase: phase.value,
    evidences,
    note: note.value || undefined,
    geo: geo.value || undefined,
  };
  try {
    await checkIn(sheet.value.id, payload);
    say(phase.value === "before" ? "打卡成功，任务已开始" : "打卡成功，任务已完成");
    sheet.value = null;
    await load();
  } catch (e: any) {
    if (e?.isNetworkError) {
      // 弱网/离线：暂存本地队列
      enqueueCheckIn({ task_id: sheet.value!.id, ...payload });
      say(`网络不佳，已暂存（待同步 ${queueSize()} 条）`);
      sheet.value = null;
    } else {
      say(e.message || "打卡失败");
    }
  } finally {
    submitting.value = false;
  }
}

/** 演示定位：浏览器 geolocation，失败不影响打卡 */
const locating = ref(false);
function onLocate() {
  if (!navigator.geolocation) {
    say("当前环境不支持定位");
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      geo.value = `${pos.coords.longitude.toFixed(4)},${pos.coords.latitude.toFixed(4)}`;
      say("定位成功");
      locating.value = false;
    },
    () => {
      say("未授权定位，可手动跳过");
      locating.value = false;
    },
    { timeout: 5000 }
  );
}

const doneCount = computed(() => tasks.value.filter((t) => t.status === "已完成").length);

onMounted(load);
</script>

<template>
  <div>
    <header class="navbar">
      <div class="grow">
        <div class="title">今日任务</div>
        <div style="font-size: 13px; opacity: 0.9">共 {{ tasks.length }} 条 · 已完成 {{ doneCount }}</div>
      </div>
    </header>

    <div class="page">
      <!-- 状态筛选 -->
      <div class="row" style="margin-bottom: 12px; overflow-x: auto">
        <button
          v-for="f in filters"
          :key="f"
          class="btn"
          :class="filter === f ? 'btn-primary' : 'btn-ghost'"
          style="min-height: 40px; font-size: 15px; padding: 0 14px"
          @click="setFilter(f)"
        >
          {{ f }}
        </button>
      </div>

      <div v-if="loading" class="empty">加载中…</div>
      <div v-else-if="tasks.length === 0" class="empty">
        <div class="emoji">🌾</div>
        没有相关任务
      </div>

      <div v-for="t in tasks" :key="t.id" class="card" @click="openSheet(t)">
        <div class="row">
          <div class="grow">
            <b style="font-size: 18px">{{ t.type }}</b>
            <div class="muted mt8" style="font-size: 14px">
              计划 {{ t.plan_date }} · 执行人 {{ t.assignee || "未指派" }}
            </div>
          </div>
          <span
            class="tag"
            :class="t.status === '已完成' ? 'tag-green' : t.status === '进行中' ? 'tag-warn' : 'tag-gray'"
          >
            {{ t.status }}
          </span>
        </div>
        <div v-if="t.evidences?.length" class="muted mt8" style="font-size: 13px">
          已留痕 {{ t.evidences.length }} 条（{{ t.evidences[0]?.ts?.slice(0, 10) || "" }}）
        </div>
        <button class="btn btn-primary btn-block mt8" style="min-height: 44px" v-if="t.status !== '已完成'">
          扫码打卡
        </button>
      </div>
    </div>

    <!-- 打卡底部弹层 -->
    <div v-if="sheet" class="mask" @click.self="sheet = null">
      <div class="sheet">
        <div class="row">
          <b class="grow" style="font-size: 19px">{{ sheet.type }}</b>
          <button class="btn btn-ghost" style="min-height: 36px; font-size: 14px" @click="sheet = null">
            关闭
          </button>
        </div>

        <p class="muted" style="font-size: 14px">选择打卡阶段（拍照留痕更完整）</p>
        <div class="row">
          <button
            class="btn grow"
            :class="phase === 'before' ? 'btn-primary' : 'btn-ghost'"
            @click="phase = 'before'"
          >
            任务前 · 开始
          </button>
          <button
            class="btn grow"
            :class="phase === 'after' ? 'btn-primary' : 'btn-ghost'"
            @click="phase = 'after'"
          >
            任务后 · 完成
          </button>
        </div>

        <div class="mt16">
          <label class="photo-btn">
            <input type="file" accept="image/*" capture="environment" hidden @change="onPickPhoto" />
            <span v-if="!photoDataUrl">📸 拍照留痕</span>
            <span v-else>✅ 已拍照（{{ photoName }}）</span>
          </label>
          <img v-if="photoDataUrl" :src="photoDataUrl" class="preview" />
        </div>

        <div class="row mt8">
          <button class="btn btn-ghost grow" style="min-height: 44px; font-size: 15px" @click="onLocate">
            {{ locating ? "定位中…" : geo ? "已定位" : "📍 上报位置" }}
          </button>
        </div>

        <textarea
          v-model="note"
          class="input mt8"
          rows="2"
          placeholder="备注（可语音转文字，v0.5 支持）"
          style="resize: none"
        ></textarea>

        <button class="btn btn-primary btn-block mt16" :disabled="submitting" @click="onSubmit">
          {{ submitting ? "提交中…" : phase === "before" ? "打卡：开始任务" : "打卡：完成任务" }}
        </button>
        <p class="muted center" style="font-size: 13px; margin: 10px 0 0">
          弱网自动暂存，恢复网络后自动同步
        </p>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.card {
  cursor: pointer;
}
.mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 31, 0.5);
  z-index: 50;
  display: flex;
  align-items: flex-end;
}
.sheet {
  width: 100%;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 18px 18px calc(20px + env(safe-area-inset-bottom));
}
.photo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border: 2px dashed var(--zy-line);
  border-radius: 12px;
  font-size: 17px;
  color: var(--zy-primary);
  background: var(--zy-primary-soft);
  cursor: pointer;
}
.preview {
  display: block;
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 10px;
}
.toast {
  position: fixed;
  bottom: 96px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(31, 45, 61, 0.85);
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 15px;
  z-index: 99;
  max-width: 86vw;
}
</style>