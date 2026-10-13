<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getInputs, getPrices, getPolicies, type InputItem, type MarketPrice, type Policy } from "@/api/ext";

const route = useRoute();
const tab = ref<"price" | "policy" | "inputs">(
  (route.query.tab as any) === "policy" ? "policy" : (route.query.tab as any) === "inputs" ? "inputs" : "price"
);

const prices = ref<MarketPrice[]>([]);
const policies = ref<Policy[]>([]);
const inputs = ref<InputItem[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [p, pl, ip] = await Promise.all([getPrices(), getPolicies(), getInputs()]);
    prices.value = p.items;
    policies.value = pl.items;
    inputs.value = ip.items;
  } finally {
    loading.value = false;
  }
});

function money(n: number) {
  return n.toFixed(2);
}

// ---------- 用药计算器 ----------
const calcInput = ref<InputItem | null>(null);
const calcMu = ref<number>(5);
const calcResult = ref("");
function calc() {
  if (!calcInput.value) {
    calcResult.value = "请先选择投入品";
    return;
  }
  const perMu = calcInput.value.dosage.match(/([\d.]+)\s*(kg|g|ml|L|张|袋)/);
  if (!perMu) {
    calcResult.value = `参考用量：${calcInput.value.dosage}（${calcInput.value.name}）`;
    return;
  }
  const qty = (parseFloat(perMu[1]) * (calcMu.value || 0)).toFixed(1);
  calcResult.value = `${calcInput.value.name}：${calcMu.value} 亩约需 ${qty} ${perMu[2]}（${calcInput.value.dosage}）。${
    calcInput.value.withdraw_days ? `安全间隔期 ${calcInput.value.withdraw_days} 天。` : ""
  }`;
}

const tabs = [
  { key: "price", label: "价格行情" },
  { key: "policy", label: "补贴政策" },
  { key: "inputs", label: "投入品查询" },
] as const;
const activeTab = computed(() => tabs.find((t) => t.key === tab.value)!);
</script>

<template>
  <div>
    <header class="navbar">
      <button class="back" @click="$router.back()">‹</button>
      <div class="title">{{ activeTab.label }}</div>
    </header>

    <div class="seg">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="seg-item"
        :class="{ on: tab === t.key }"
        @click="tab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="page" style="padding-top: 8px">
      <div v-if="loading" class="empty">加载中…</div>

      <!-- 价格行情 -->
      <template v-else-if="tab === 'price'">
        <div v-for="p in prices" :key="p.name" class="card">
          <div class="row">
            <div class="grow">
              <b style="font-size: 17px">{{ p.name }}</b>
              <div class="muted" style="font-size: 13px">{{ p.market }}</div>
            </div>
            <div class="right">
              <b style="font-size: 22px" :class="p.change_pct >= 0 ? 'up' : 'down'">
                {{ money(p.price) }}
              </b>
              <span class="muted" style="font-size: 13px"> {{ p.unit }}</span>
              <div class="tag" :class="p.change_pct >= 0 ? 'tag-red' : 'tag-green'">
                {{ p.change_pct >= 0 ? "↑" : "↓" }} {{ Math.abs(p.change_pct) }}%
              </div>
            </div>
          </div>
        </div>
        <p class="muted center" style="font-size: 12px">演示数据 · 更新于 {{ prices[0]?.date || "-" }}</p>
      </template>

      <!-- 补贴政策 -->
      <template v-else-if="tab === 'policy'">
        <div v-for="p in policies" :key="p.id" class="card">
          <div class="row">
            <b style="font-size: 17px" class="grow">{{ p.title }}</b>
            <span class="tag tag-green">{{ p.level }}</span>
          </div>
          <div class="amount">{{ p.amount_desc }}</div>
          <div class="kv"><span>适用地区</span><span>{{ p.region }}</span></div>
          <div class="kv"><span>申报条件</span><span>{{ p.requirement }}</span></div>
          <div class="kv"><span>截止时间</span><span>{{ p.deadline }}</span></div>
          <button class="btn btn-soft btn-block mt8" @click="$router.push('/sos')">咨询申报 ›</button>
        </div>
      </template>

      <!-- 投入品查询 -->
      <template v-else>
        <div class="card">
          <b style="font-size: 17px">🧮 用药计算器</b>
          <div class="row mt8">
            <select v-model="calcInput" class="input grow" style="min-height: 44px">
              <option :value="null" disabled>选择投入品</option>
              <option v-for="i in inputs" :key="i.id" :value="i">{{ i.name }}</option>
            </select>
            <input v-model.number="calcMu" type="number" min="0" class="input" style="width: 90px" />
            <span class="muted">亩</span>
          </div>
          <button class="btn btn-primary btn-block mt8" @click="calc">计算用量</button>
          <p v-if="calcResult" class="calc-out">{{ calcResult }}</p>
        </div>

        <div v-for="i in inputs" :key="i.id" class="card">
          <div class="row">
            <b style="font-size: 17px" class="grow">{{ i.name }}</b>
            <span class="tag tag-gray">{{ i.category }}</span>
          </div>
          <div class="kv"><span>防治对象</span><span>{{ i.target }}</span></div>
          <div class="kv"><span>推荐用法</span><span>{{ i.dosage }}</span></div>
          <div class="kv">
            <span>安全间隔期</span>
            <span>{{ i.withdraw_days ? `${i.withdraw_days} 天` : "无" }}</span>
          </div>
          <div class="kv"><span>参考价</span><span class="price">{{ i.price }}</span></div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.seg {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  background: #fff;
  border-bottom: 1px solid var(--zy-line);
  padding-top: env(safe-area-inset-top, 0px);
}
.seg-item {
  flex: 1;
  padding: 13px 0;
  font-size: 16px;
  border: none;
  background: none;
  color: var(--zy-text-2);
  border-bottom: 3px solid transparent;
  cursor: pointer;
}
.seg-item.on {
  color: var(--zy-primary);
  font-weight: 700;
  border-bottom-color: var(--zy-primary);
}
.up {
  color: var(--zy-danger);
}
.down {
  color: var(--zy-primary);
}
.amount {
  margin: 10px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--zy-primary);
}
.kv {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  padding: 4px 0;
}
.kv span:first-child {
  color: var(--zy-text-2);
  flex-shrink: 0;
}
.kv span:last-child {
  text-align: right;
}
.price {
  color: var(--zy-danger);
  font-weight: 700;
}
.calc-out {
  background: var(--zy-primary-soft);
  color: var(--zy-primary-dark);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
