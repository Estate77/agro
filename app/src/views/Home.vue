<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getAlerts, getWeather, listTasks, type Alert, type FarmTask, type WeatherToday } from "@/api/app";
import { useAuthStore } from "@/stores/auth";
import { queueSize } from "@/utils/offline";

const router = useRouter();
const auth = useAuthStore();

const weather = ref<WeatherToday | null>(null);
const forecast = ref<any[]>([]);
const alerts = ref<Alert[]>([]);
const todayTasks = ref<FarmTask[]>([]);
const loading = ref(true);

/** 工具九宫格：可用的跳转，未上线的提示 v0.5 */
const tools = [
  { icon: "📷", label: "拍照识病害", to: "/disease" },
  { icon: "📡", label: "设备数据", to: "/devices" },
  { icon: "🔍", label: "扫码溯源", to: "/trace" },
  { icon: "📝", label: "今日任务", to: "/tasks" },
  { icon: "🧴", label: "投入品查询", soon: true },
  { icon: "💹", label: "价格行情", soon: true },
  { icon: "📜", label: "补贴政策", soon: true },
  { icon: "🆘", label: "紧急求助", soon: true },
  { icon: "🤖", label: "AI 问答", soon: true },
];

function onTool(t: (typeof tools)[number]) {
  if (t.soon) {
    toast.value = "该功能规划于 v0.5，敬请期待";
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.value = ""), 1800);
    return;
  }
  router.push(t.to!);
}

const toast = ref("");
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const hour = new Date().getHours();
const greeting = hour < 6 ? "夜深了" : hour < 11 ? "早上好" : hour < 14 ? "中午好" : hour < 19 ? "下午好" : "晚上好";

async function load() {
  loading.value = true;
  try {
    const [w, a, t] = await Promise.all([
      getWeather(),
      getAlerts(),
      listTasks({ status: "待办", page: 1, page_size: 5 }),
    ]);
    weather.value = w.today;
    forecast.value = (w.forecast || []).slice(0, 7);
    alerts.value = a.items.slice(0, 3);
    // 今日任务：计划日期为今天的优先
    const todayStr = new Date().toISOString().slice(0, 10);
    todayTasks.value = t.items.filter((x) => x.plan_date === todayStr).slice(0, 3);
    if (todayTasks.value.length === 0) {
      todayTasks.value = t.items.slice(0, 3);
    }
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <!-- 顶栏 -->
    <header class="navbar">
      <div class="grow">
        <div style="font-size: 13px; opacity: 0.9">
          {{ greeting }}，{{ auth.user?.display_name || auth.user?.username }}
        </div>
        <div class="title" style="font-size: 20px">{{ auth.user?.tenant_name || "智耘示范园区" }}</div>
      </div>
      <span class="tag tag-red" v-if="queueSize() > 0">待同步 {{ queueSize() }}</span>
    </header>

    <div class="page">
      <!-- 天气卡片 -->
      <div class="card weather" v-if="weather">
        <div class="row">
          <div class="emoji">{{ weather.icon }}</div>
          <div class="grow">
            <div style="font-size: 22px; font-weight: 700">
              {{ weather.temp_lo }}~{{ weather.temp_hi }}℃ · {{ weather.condition }}
            </div>
            <div class="muted">湿度 {{ weather.humidity }}% · {{ weather.wind }}风</div>
          </div>
        </div>
        <p class="advice">💡 {{ weather.advice }}</p>
        <div class="row forecast">
          <div v-for="f in forecast" :key="f.date" class="fc">
            <div class="muted" style="font-size: 12px">{{ f.weekday }}</div>
            <div style="font-size: 20px">{{ f.icon }}</div>
            <div style="font-size: 13px">{{ f.temp_lo }}/{{ f.temp_hi }}°</div>
          </div>
        </div>
      </div>

      <!-- 告警 -->
      <div v-if="alerts.length" class="alert-strip" @click="router.push('/tasks')">
        <div v-for="(a, i) in alerts.slice(0, 1)" :key="i" class="line">
          <span class="tag" :class="a.level === '高' ? 'tag-red' : a.level === '中' ? 'tag-warn' : 'tag-gray'">
            {{ a.level }}
          </span>
          <span class="grow">{{ a.msg }}</span>
        </div>
        <div v-if="alerts.length > 1" class="muted" style="font-size: 12px; margin-top: 4px">
          还有 {{ alerts.length - 1 }} 条告警，点击查看任务
        </div>
      </div>

      <!-- 今日任务 -->
      <div class="card">
        <div class="row section-head">
          <b style="font-size: 18px">今日任务</b>
          <span class="grow"></span>
          <a @click="router.push('/tasks')" style="color: var(--zy-primary); font-size: 15px">全部 ›</a>
        </div>
        <div v-if="loading" class="empty">加载中…</div>
        <div v-else-if="todayTasks.length === 0" class="empty">
          <div class="emoji">🎉</div>
          今天没有待办任务
        </div>
        <div v-for="t in todayTasks" :key="t.id" class="task-item" @click="router.push('/tasks')">
          <div class="grow">
            <b style="font-size: 17px">{{ t.type }}</b>
            <div class="muted">{{ t.plan_date }} · 执行人：{{ t.assignee || "未指派" }}</div>
          </div>
          <button class="btn btn-soft" style="min-height: 40px; font-size: 15px">去打卡</button>
        </div>
      </div>

      <!-- 工具九宫格 -->
      <div class="card">
        <b style="font-size: 18px">常用工具</b>
        <div class="grid9">
          <button v-for="t in tools" :key="t.label" class="tool" @click="onTool(t)">
            <span style="font-size: 30px">{{ t.icon }}</span>
            <span style="font-size: 14px">{{ t.label }}</span>
            <span v-if="t.soon" class="tag tag-gray">v0.5</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 轻提示 -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.weather .emoji {
  font-size: 44px;
}
.advice {
  background: var(--zy-primary-soft);
  color: var(--zy-primary-dark);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 15px;
  margin: 12px 0;
}
.forecast {
  justify-content: space-between;
  overflow-x: auto;
}
.fc {
  text-align: center;
  min-width: 42px;
}
.alert-strip {
  background: #fff7e8;
  border: 1px solid #f5deb4;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  font-size: 15px;
  cursor: pointer;
}
.alert-strip .line {
  display: flex;
  gap: 8px;
  align-items: center;
}
.section-head {
  margin-bottom: 10px;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--zy-line);
}
.task-item:last-child {
  border-bottom: none;
}
.grid9 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 14px;
}
.tool {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 4px;
  background: #f8faf9;
  border: none;
  border-radius: 12px;
  color: var(--zy-text);
}
.tool .tag {
  position: absolute;
  top: 6px;
  right: 6px;
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
}
</style>