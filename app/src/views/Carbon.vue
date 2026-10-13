<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getCarbonAccount, redeemCarbon, type CarbonAccount } from "@/api/ext";

const acct = ref<CarbonAccount | null>(null);
const loading = ref(true);
const toast = ref("");
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function say(m: string) {
  toast.value = m;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 2200);
}

async function load() {
  try {
    acct.value = await getCarbonAccount();
  } finally {
    loading.value = false;
  }
}

async function redeem(id: string) {
  try {
    const r = await redeemCarbon(id);
    if (acct.value) acct.value.points = r.points_balance;
    say(r.message);
  } catch (e: any) {
    say(e.message || "兑换失败");
  }
}

const tasks = [
  { icon: "🛒", title: "低碳买菜", desc: "购买本地直采产品，每单 +10 分", done: "今日已领" },
  { icon: "🚶", title: "绿色出行", desc: "步行/骑行到店自提，每次 +5 分", done: "去完成" },
  { icon: "♻️", title: "包装回收", desc: "归还生鲜包装盒，每个 +15 分", done: "去完成" },
];

onMounted(load);
</script>

<template>
  <div>
    <header class="navbar c-navbar">
      <div class="title">碳账户</div>
      <span class="tag" style="background: rgba(255,255,255,0.2); color: #fff">碳中和 · 人人有份</span>
    </header>

    <div class="page">
      <div v-if="loading" class="empty">加载中…</div>
      <template v-else-if="acct">
        <!-- 积分主卡 -->
        <div class="hero">
          <div class="muted" style="color: rgba(255,255,255,0.85); font-size: 14px">我的碳积分</div>
          <div class="big">{{ acct.points.toLocaleString() }}</div>
          <div class="hero-row">
            <div>
              <div style="font-size: 20px; font-weight: 700">{{ acct.total_footprint_kg }} kg</div>
              <div style="font-size: 13px; color: rgba(255,255,255,0.8)">累计碳足迹</div>
            </div>
            <div>
              <div style="font-size: 20px; font-weight: 700">{{ acct.total_saved_kg }} kg</div>
              <div style="font-size: 13px; color: rgba(255,255,255,0.8)">累计碳减排</div>
            </div>
          </div>
        </div>

        <!-- 攒积分任务 -->
        <div class="card">
          <b style="font-size: 17px">攒积分任务</b>
          <div v-for="t in tasks" :key="t.title" class="task">
            <span style="font-size: 28px">{{ t.icon }}</span>
            <div class="grow">
              <b style="font-size: 16px">{{ t.title }}</b>
              <div class="muted" style="font-size: 13px">{{ t.desc }}</div>
            </div>
            <span class="tag" :class="t.done === '今日已领' ? 'tag-gray' : 'tag-green'">{{ t.done }}</span>
          </div>
        </div>

        <!-- 兑换商城 -->
        <div class="card">
          <b style="font-size: 17px">积分兑换</b>
          <div class="shop">
            <div v-for="i in acct.redeem_items" :key="i.id" class="shop-item">
              <div style="font-size: 32px">{{ i.icon }}</div>
              <b style="font-size: 14px; line-height: 1.4; display: block; min-height: 40px">{{ i.name }}</b>
              <div class="need">{{ i.points }} 分 · 剩 {{ i.stock }}</div>
              <button
                class="btn btn-block"
                :class="acct.points >= i.points ? 'btn-primary' : 'btn-ghost'"
                style="min-height: 40px; font-size: 15px"
                :disabled="acct.points < i.points"
                @click="redeem(i.id)"
              >
                {{ acct.points >= i.points ? "兑换" : "积分不足" }}
              </button>
            </div>
          </div>
        </div>

        <!-- 明细 -->
        <div class="card">
          <b style="font-size: 17px">积分明细</b>
          <div v-for="(h, i) in acct.history" :key="i" class="hist">
            <div class="grow">
              <div style="font-size: 15px">{{ h.title }}</div>
              <div class="muted" style="font-size: 12px">{{ h.date }}</div>
            </div>
            <b style="color: var(--zy-primary)">+{{ h.points }}</b>
          </div>
        </div>

        <p class="muted center" style="font-size: 12px">
          碳积分由 B 端碳汇核算 → 产品碳足迹 → C 端扫码累积（演示闭环）
        </p>
      </template>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.c-navbar {
  background: linear-gradient(135deg, #1e8f5a 0%, #27b071 100%);
}
.hero {
  background: linear-gradient(135deg, #14684a 0%, #1e8f5a 60%, #27b071 100%);
  color: #fff;
  border-radius: 18px;
  padding: 22px 18px;
  box-shadow: 0 6px 20px rgba(20, 104, 74, 0.3);
}
.big {
  font-size: 46px;
  font-weight: 800;
  margin: 4px 0 12px;
}
.hero-row {
  display: flex;
  gap: 36px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  padding-top: 12px;
}
.task {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--zy-line);
}
.task:last-child {
  border-bottom: none;
}
.shop {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}
.shop-item {
  background: #f8faf9;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.need {
  font-size: 13px;
  color: var(--zy-primary);
  font-weight: 600;
}
.hist {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--zy-line);
}
.hist:last-child {
  border-bottom: none;
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
