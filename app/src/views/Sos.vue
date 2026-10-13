<script setup lang="ts">
import { ref } from "vue";

const geo = ref("");
const locating = ref(false);

function locate() {
  locating.value = true;
  // 演示：模拟 GPS 定位
  setTimeout(() => {
    geo.value = "34.7466°N, 113.6254°E（郑州·智耘示范园区 东区）";
    locating.value = false;
  }, 800);
}

function call(number: string) {
  window.location.href = `tel:${number}`;
}

const toast = ref("");
function say(m: string) {
  toast.value = m;
  setTimeout(() => (toast.value = ""), 2000);
}

const hotlines = [
  { icon: "🚑", label: "医疗急救", num: "120", cls: "c-red" },
  { icon: "🔥", label: "火警", num: "119", cls: "c-red" },
  { icon: "🚓", label: "报警", num: "110", cls: "c-red" },
  { icon: "🌾", label: "农技服务热线", num: "0371-65901234", cls: "c-green" },
  { icon: "☎️", label: "园区值班电话", num: "0371-65905678", cls: "c-green" },
];
</script>

<template>
  <div>
    <header class="navbar">
      <button class="back" @click="$router.back()">‹</button>
      <div class="title">紧急求助</div>
    </header>

    <div class="page">
      <!-- 一键定位 -->
      <div class="card">
        <b style="font-size: 17px">📍 我的位置</b>
        <p class="geo" :class="{ none: !geo }">
          {{ geo || (locating ? "正在定位…" : "点击下方按钮获取定位，便于救援/服务人员快速找到你") }}
        </p>
        <button class="btn btn-primary btn-block" :disabled="locating" @click="locate">
          {{ locating ? "定位中…" : "获取当前定位" }}
        </button>
      </div>

      <!-- 一键呼救 -->
      <div class="card">
        <b style="font-size: 17px">🆘 一键呼救</b>
        <div class="sos-grid mt8">
          <button
            v-for="h in hotlines"
            :key="h.num"
            class="sos"
            :class="h.cls"
            @click="call(h.num)"
          >
            <span style="font-size: 34px">{{ h.icon }}</span>
            <span style="font-size: 16px">{{ h.label }}</span>
            <span class="num">{{ h.num }}</span>
          </button>
        </div>
        <p class="muted" style="font-size: 12px; margin-bottom: 0">
          点击直接拨号（演示环境可能无法真实呼出）
        </p>
      </div>

      <!-- 语音求助 -->
      <div class="card">
        <b style="font-size: 17px">🎙️ 语音留言求助</b>
        <p class="muted" style="font-size: 14px; margin: 8px 0 12px">
          说清「发生了什么 + 在哪个地块」，值班人员将第一时间回电
        </p>
        <div class="row">
          <button class="btn btn-soft grow" style="min-height: 64px" @click="say('语音留言为 v1.0 规划能力，演示版请直接拨打卡片上的电话')">
            🎙️ 按住说话（演示）
          </button>
        </div>
      </div>

      <p class="muted center" style="font-size: 12px">
        紧急情况请优先拨打 120 / 119 / 110
      </p>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.geo {
  margin: 10px 0;
  padding: 10px 12px;
  background: #f6f9f7;
  border-radius: 10px;
  font-size: 15px;
  min-height: 44px;
}
.geo.none {
  color: var(--zy-text-2);
}
.sos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}
.sos {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 4px;
  border: none;
  border-radius: 14px;
  color: #fff;
  cursor: pointer;
}
.sos .num {
  font-size: 13px;
  opacity: 0.85;
}
.c-red {
  background: var(--zy-danger);
}
.c-green {
  background: var(--zy-primary);
}
.sos:nth-child(4),
.sos:nth-child(5) {
  grid-column: span 1;
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
