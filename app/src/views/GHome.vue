<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getGovTodos, type GovTodo } from "@/api/ext";

const router = useRouter();
const auth = useAuthStore();
const items = ref<GovTodo[]>([]);
const highCount = ref(0);
const loading = ref(true);

function levelClass(l: string) {
  return l === "高" ? "tag-red" : l === "中" ? "tag-warn" : "tag-gray";
}

function open(t: GovTodo) {
  if (t.link === "entities") router.push("/gov/entities");
  else if (t.link === "report") router.push("/gov/report");
}

onMounted(async () => {
  try {
    const r = await getGovTodos();
    items.value = r.items;
    highCount.value = r.high_count;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <header class="navbar g-navbar">
      <div class="grow">
        <div class="title" style="font-size: 22px">智耘政</div>
        <div style="font-size: 13px; opacity: 0.9">{{ auth.user?.display_name || "监管员" }} · 乡镇监管站</div>
      </div>
      <button class="me-btn" @click="router.push('/me')">👤</button>
    </header>

    <div class="page">
      <!-- 高亮条 -->
      <div v-if="highCount > 0" class="red-strip">
        ⚠️ 有 {{ highCount }} 件高优先级应急事件待处置
      </div>

      <div class="card" style="display: flex; gap: 10px">
        <button class="entry" @click="router.push('/gov/entities')">
          <span style="font-size: 30px">🏭</span>
          <span>主体核查</span>
        </button>
        <button class="entry" @click="router.push('/gov/report')">
          <span style="font-size: 30px">🚨</span>
          <span>应急上报</span>
        </button>
        <button class="entry" @click="router.push('/gov/board')">
          <span style="font-size: 30px">📊</span>
          <span>领导看板</span>
        </button>
      </div>

      <!-- 待办列表 -->
      <div class="row section-head">
        <b style="font-size: 18px" class="grow">待办事项</b>
        <span class="muted" style="font-size: 14px">{{ items.length }} 件</span>
      </div>

      <div v-if="loading" class="empty">加载中…</div>
      <div v-else-if="items.length === 0" class="empty">
        <div class="emoji">✅</div>
        暂无待办
      </div>

      <div v-for="t in items" :key="t.id" class="card todo" @click="open(t)">
        <div class="row" style="align-items: flex-start">
          <div class="grow">
            <div class="row" style="margin-bottom: 4px">
              <span class="tag" :class="levelClass(t.level)">{{ t.level }}</span>
              <span class="tag tag-gray">{{ t.type }}</span>
            </div>
            <b style="font-size: 17px">{{ t.title }}</b>
            <div class="muted" style="font-size: 14px; margin-top: 4px">{{ t.detail }}</div>
            <div class="muted" style="font-size: 12px; margin-top: 6px">⏰ 办理期限：{{ t.deadline }}</div>
          </div>
          <span style="font-size: 20px; color: var(--zy-text-2)">›</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.g-navbar {
  background: var(--zy-contour), linear-gradient(140deg, #1e3a5f 0%, #2d5a8e 90%);
}
.me-btn {
  font-size: 20px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 10px;
  cursor: pointer;
}
.red-strip {
  background: #fdeceb;
  color: var(--zy-danger);
  border: 1px solid #f5c8c5;
  border-left: 4px solid var(--zy-danger);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  animation: cardIn 0.34s ease both;
}
.entry {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 4px;
  background: #f0f4fa;
  border: 1px solid #dde6f0;
  border-radius: 14px;
  color: #1e3a5f;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s ease;
}
.entry:active {
  transform: scale(0.95);
}
.section-head {
  margin: 16px 0 10px;
}
.todo {
  cursor: pointer;
}
</style>
