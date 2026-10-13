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

/** 工具九宫格 */
const tools = [
  { icon: "📷", label: "拍照识病害", to: "/disease" },
  { icon: "🤖", label: "AI 问答", to: "/qa" },
  { icon: "🧴", label: "投入品查询", to: "/market?tab=inputs" },
  { icon: "🔍", label: "扫码溯源", to: "/trace" },
  { icon: "💹", label: "价格行情", to: "/market?tab=price" },
  { icon: "📜", label: "补贴政策", to: "/market?tab=policy" },
  { icon: "🗺️", label: "我的地块", to: "/blocks" },
  { icon: "💰", label: "经营账本", to: "/farm" },
  { icon: "🆘", label: "紧急求助", to: "/sos" },
];

function onTool(t: (typeof tools)[number]) {
  router.push(t.to);
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
      <button class="nav-ico" @click="router.push('/messages')">🔔</button>
      <span class="tag tag-red" v-if="queueSize() > 0">待同步 {{ queueSize() }}</span>
    </header>

    <div class="page">
      <!-- 天气 hero 面板 -->
      <div class="hero-weather" v-if="weather">
        <div class="row">
          <div class="emoji">{{ weather.icon }}</div>
          <div class="grow">
            <div class="temp">{{ weather.temp_lo }}<i>~</i>{{ weather.temp_hi }}<span>℃</span></div>
            <div class="cond">{{ weather.condition }} · 湿度 {{ weather.humidity }}% · {{ weather.wind }}风</div>
          </div>
        </div>
        <p class="advice">💡 {{ weather.advice }}</p>
        <div class="row forecast">
          <div v-for="f in forecast" :key="f.date" class="fc">
            <div class="fc-wd">{{ f.weekday }}</div>
            <div class="fc-ico">{{ f.icon }}</div>
            <div class="fc-temp">{{ f.temp_lo }}/{{ f.temp_hi }}°</div>
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
.nav-ico {
  font-size: 22px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  border: none;
  cursor: pointer;
}
/* 天气 hero：松林绿渐变面板 */
.hero-weather {
  background: var(--zy-contour), linear-gradient(150deg, #1c4433 0%, #2f7d4f 100%);
  color: #fff;
  border-radius: 20px;
  padding: 18px 16px 14px;
  margin-bottom: 12px;
  box-shadow: 0 8px 24px rgba(28, 68, 51, 0.35);
  animation: cardIn 0.34s ease both;
}
.hero-weather .emoji {
  font-size: 46px;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.3));
}
.temp {
  font-family: var(--zy-display);
  font-size: 34px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 1px;
}
.temp i {
  font-style: normal;
  color: #d9a441;
  margin: 0 2px;
}
.temp span {
  font-size: 18px;
  margin-left: 3px;
  color: #cfe3d2;
}
.cond {
  font-size: 14px;
  color: #cfe3d2;
  margin-top: 3px;
}
.advice {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #f4f0e1;
  border-radius: 11px;
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
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 6px 4px;
}
.fc-wd {
  font-size: 12px;
  color: #a8c7ad;
}
.fc-ico {
  font-size: 20px;
}
.fc-temp {
  font-size: 12px;
  color: #e6efe4;
}
.alert-strip {
  background: #fdf6e7;
  border: 1px solid #eedbb0;
  border-left: 4px solid var(--zy-accent);
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
  border-bottom: 1px dashed var(--zy-line);
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
  background: #faf9f2;
  border: 1px solid #eee9d8;
  border-radius: 13px;
  color: var(--zy-text);
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s;
}
.tool:active {
  transform: scale(0.95);
  background: var(--zy-primary-soft);
}
.tool .tag {
  position: absolute;
  top: 6px;
  right: 6px;
}
.toast {
  position: fixed;
  bottom: 116px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(36, 51, 40, 0.88);
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 15px;
  z-index: 99;
}
</style>