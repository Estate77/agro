<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPublicTrace, type TracePublic } from "@/api/app";

const route = useRoute();
const router = useRouter();
const trace = ref<TracePublic | null>(null);
const loading = ref(true);
const error = ref("");

async function load() {
  loading.value = true;
  error.value = "";
  try {
    trace.value = await getPublicTrace(route.params.code as string);
  } catch (e: any) {
    error.value = e.message || "溯源码无效";
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function fmtDate(s: string | null): string {
  if (!s) return "--";
  return s.slice(0, 10);
}
</script>

<template>
  <div>
    <header class="navbar">
      <button class="back" @click="router.back()">‹</button>
      <div class="title">溯源故事</div>
    </header>

    <div class="page">
      <div v-if="loading" class="empty">查询中…</div>

      <div v-else-if="error" class="empty">
        <div class="emoji">🔍</div>
        {{ error }}
        <div class="mt16">
          <button class="btn btn-primary" @click="router.push('/trace')">换个溯源码</button>
        </div>
      </div>

      <template v-else-if="trace">
        <!-- 产品头卡 -->
        <div class="card hero">
          <div style="font-size: 52px; text-align: center">🥬</div>
          <h2 style="margin: 8px 0 4px; text-align: center; font-size: 26px">
            {{ trace.product_name }}
          </h2>
          <p class="muted center" style="margin: 0; font-size: 14px">
            {{ trace.variety || "优良品种" }} · {{ trace.season || "" }}
          </p>
          <div class="codes">
            <span class="tag tag-green">溯源码 {{ trace.code }}</span>
            <span class="tag tag-warn">{{ trace.status }}</span>
            <span v-if="trace.quality_grade" class="tag tag-gray">品质等级 {{ trace.quality_grade }}</span>
          </div>
        </div>

        <!-- 全链路时间线 -->
        <div class="card">
          <b style="font-size: 18px">全链路档案</b>
          <div class="timeline mt16">
            <div class="titem">
              <div class="dot">🌱</div>
              <div class="grow">
                <b>种植 · {{ trace.block_name || trace.origin }}</b>
                <div class="muted">
                  {{ trace.block_code }} · {{ trace.crop }} · 始于 {{ fmtDate(trace.planting_start) }}
                </div>
              </div>
            </div>
            <div class="titem">
              <div class="dot">🌾</div>
              <div class="grow">
                <b>采收</b>
                <div class="muted">
                  {{ fmtDate(trace.harvested_at) }} · {{ trace.operator || "采收班组" }} ·
                  {{ trace.weight_kg ?? "--" }} kg
                </div>
              </div>
            </div>
            <div class="titem">
              <div class="dot">🏭</div>
              <div class="grow">
                <b>加工分拣</b>
                <div class="muted">清洗、分级、包装（演示节点）</div>
              </div>
            </div>
            <div class="titem">
              <div class="dot">🚚</div>
              <div class="grow">
                <b>仓储物流</b>
                <div class="muted">冷链运输，全程温控（演示节点）</div>
              </div>
            </div>
            <div class="titem">
              <div class="dot">🏪</div>
              <div class="grow">
                <b>销售上架</b>
                <div class="muted">状态：{{ trace.status }}</div>
              </div>
            </div>
          </div>
          <div class="chain">
            <b>🔗 区块链存证</b>
            <p class="muted" style="font-size: 13px; margin: 6px 0 0">
              {{ trace.cert_chain
                ? `交易哈希：${trace.cert_chain}`
                : "演示环境未接链；v0.5 接入长安链/BSN 后此节点展示批次哈希与区块高度" }}
            </p>
          </div>
        </div>

        <p class="muted center" style="font-size: 13px; padding: 4px 0 20px">
          数据来自种植端真实记录（演示）· 消费者无需登录即可查验
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.hero {
  padding: 22px 16px;
}
.codes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 14px;
}
.timeline {
  position: relative;
  padding-left: 4px;
}
.titem {
  display: flex;
  gap: 14px;
  padding: 10px 0;
}
.dot {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--zy-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  z-index: 1;
}
.titem b {
  font-size: 17px;
}
.chain {
  margin-top: 12px;
  background: #f6f8f9;
  border-radius: 12px;
  padding: 12px 14px;
}
</style>