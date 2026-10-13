<script setup lang="ts">
import { ref } from "vue";

interface Msg {
  id: number;
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  kind: "告警" | "任务" | "系统" | "行情";
}

const msgs = ref<Msg[]>([
  {
    id: 1,
    icon: "🚨",
    title: "设备离线告警",
    body: "3 号地块土壤墒情传感器已离线 2 小时，请检查电池或信号。",
    time: "09:12",
    read: false,
    kind: "告警",
  },
  {
    id: 2,
    icon: "📝",
    title: "新任务指派",
    body: "「番茄整枝打杈」已指派给你，计划今天 16:00 前完成，记得扫码打卡。",
    time: "08:30",
    read: false,
    kind: "任务",
  },
  {
    id: 3,
    icon: "💹",
    title: "行情早报",
    body: "今日番茄批发价 5.4 元/kg，较昨日 +3.8%；黄瓜 6.9 元/kg 持平。",
    time: "07:00",
    read: false,
    kind: "行情",
  },
  {
    id: 4,
    icon: "📜",
    title: "补贴申报提醒",
    body: "农机购置补贴申报截止 11-30，您有一台微耕机可申报。",
    time: "昨天",
    read: true,
    kind: "系统",
  },
  {
    id: 5,
    icon: "🌧️",
    title: "天气提醒",
    body: "明日小雨，喷药作业请避开，注意清沟排水。",
    time: "昨天",
    read: true,
    kind: "告警",
  },
]);

const unread = msgs.value.filter((m) => !m.read).length;

function open(m: Msg) {
  m.read = true;
}

function kindClass(k: Msg["kind"]) {
  return k === "告警" ? "tag-red" : k === "任务" ? "tag-warn" : k === "行情" ? "tag-green" : "tag-gray";
}
</script>

<template>
  <div>
    <header class="navbar">
      <button class="back" @click="$router.back()">‹</button>
      <div class="title">消息</div>
      <span class="tag" style="background: rgba(255,255,255,0.2); color: #fff" v-if="unread">{{ unread }} 未读</span>
    </header>

    <div class="page">
      <div
        v-for="m in msgs"
        :key="m.id"
        class="card"
        style="cursor: pointer"
        :style="m.read ? 'opacity: 0.72' : ''"
        @click="open(m)"
      >
        <div class="row" style="align-items: flex-start">
          <div class="micon">{{ m.icon }}</div>
          <div class="grow">
            <div class="row">
              <b style="font-size: 17px" class="grow">{{ m.title }}</b>
              <span class="muted" style="font-size: 12px">{{ m.time }}</span>
            </div>
            <p style="margin: 6px 0 0; font-size: 15px; line-height: 1.5; color: var(--zy-text-2)">
              {{ m.body }}
            </p>
            <div class="mt8"><span class="tag" :class="kindClass(m.kind)">{{ m.kind }}</span></div>
          </div>
          <span v-if="!m.read" class="dot"></span>
        </div>
      </div>

      <p class="muted center" style="font-size: 12px">
        WebSocket 实时推送规划于 v1.0，当前为演示数据
      </p>
    </div>
  </div>
</template>

<style scoped>
.micon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--zy-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--zy-danger);
  margin-top: 6px;
  flex-shrink: 0;
}
</style>
