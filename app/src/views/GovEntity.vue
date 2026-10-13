<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getGovEntities, getGovEntity, type GovEntity, type GovEntityDetail } from "@/api/ext";

const list = ref<GovEntity[]>([]);
const detail = ref<GovEntityDetail | null>(null);
const loading = ref(true);
const loadingDetail = ref(false);

function levelClass(l: string) {
  return l === "红" ? "tag-red" : l === "黄" ? "tag-warn" : "tag-green";
}

async function load() {
  try {
    const r = await getGovEntities();
    list.value = r.items;
  } finally {
    loading.value = false;
  }
}

async function open(e: GovEntity) {
  loadingDetail.value = true;
  try {
    detail.value = await getGovEntity(e.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } finally {
    loadingDetail.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <header class="navbar g-navbar">
      <button v-if="detail" class="back" @click="detail = null">‹</button>
      <div class="title">{{ detail ? detail.name : "主体核查" }}</div>
    </header>

    <div class="page">
      <!-- 主体详情（台账 / 告警 / 存证） -->
      <template v-if="detail">
        <div v-if="loadingDetail" class="empty">加载中…</div>
        <template v-else>
          <!-- 台账 -->
          <div class="card">
            <div class="row">
              <b style="font-size: 18px" class="grow">主体台账</b>
              <span class="tag" :class="levelClass(detail.risk_level)">风险 {{ detail.risk_score }} · {{ detail.risk_level }}级</span>
            </div>
            <div class="kv" v-for="(v, k) in detail.ledger" :key="k">
              <span>{{ k }}</span><span>{{ v }}</span>
            </div>
            <div class="kv"><span>主体类型</span><span>{{ detail.kind }}</span></div>
          </div>

          <!-- 历史告警 -->
          <div class="card">
            <b style="font-size: 17px">历史告警（{{ detail.alerts.length }}）</b>
            <div v-for="(a, i) in detail.alerts" :key="i" class="al">
              <span class="tag" :class="a.level === '高' ? 'tag-red' : a.level === '中' ? 'tag-warn' : 'tag-gray'">
                {{ a.level }}
              </span>
              <div class="grow">
                <div style="font-size: 15px"><b>{{ a.type }}</b> · {{ a.msg }}</div>
                <div class="muted" style="font-size: 12px">{{ a.date }}</div>
              </div>
            </div>
            <div v-if="detail.alerts.length === 0" class="muted" style="padding: 10px 0">近 30 天无告警 🎉</div>
          </div>

          <!-- 区块链存证 -->
          <div class="card">
            <b style="font-size: 17px">🔗 区块链存证</b>
            <div class="kv"><span>存证链</span><span>{{ detail.blockchain.chain }}</span></div>
            <div class="kv"><span>最新区块</span><span>#{{ detail.blockchain.last_block_height }}</span></div>
            <div class="kv"><span>最近锚定</span><span>{{ detail.blockchain.last_anchor_at }}</span></div>
            <div class="hash">SHA256：{{ detail.blockchain.cert_hash }}…</div>
            <p class="muted" style="font-size: 12px; margin-bottom: 0">
              存证内容：主体档案 / 投入品台账 / 采收批次 / 检测报告（演示哈希）
            </p>
          </div>
        </template>
      </template>

      <!-- 主体列表 -->
      <template v-else>
        <div v-if="loading" class="empty">加载中…</div>
        <div
          v-for="e in list"
          :key="e.id"
          class="card"
          style="cursor: pointer"
          @click="open(e)"
        >
          <div class="row">
            <div class="eicon">{{ e.kind === "合作社" ? "🤝" : e.kind === "家庭农场" ? "🏡" : "🏢" }}</div>
            <div class="grow">
              <b style="font-size: 17px">{{ e.name }}</b>
              <div class="muted" style="font-size: 13px">
                {{ e.kind }} · {{ e.blocks }} 地块 · {{ e.area_mu }} 亩
              </div>
            </div>
            <span class="tag" :class="levelClass(e.risk_level)">{{ e.risk_level }} {{ e.risk_score }}</span>
          </div>
          <div class="row mt8" style="justify-content: space-between; font-size: 13px">
            <span class="muted">历史告警 {{ e.alerts_total }} 条</span>
            <span style="color: var(--zy-primary)">查看台账 ›</span>
          </div>
        </div>
        <p class="muted center" style="font-size: 12px">
          扫主体二维码核查功能规划于 v1.5（对接现场核验）
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.g-navbar {
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
}
.eicon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #eef3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.kv {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  padding: 6px 0;
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
.al {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--zy-line);
}
.al:last-child {
  border-bottom: none;
}
.hash {
  margin: 10px 0;
  padding: 10px 12px;
  background: #0f172a;
  color: #7ee2a8;
  border-radius: 10px;
  font-size: 12px;
  font-family: Consolas, monospace;
  word-break: break-all;
}
</style>
