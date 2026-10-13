<script setup lang="ts">
import { ref } from "vue";

/** 经营演示数据（客户端 mock，v1.0 对接 PC 端账本同步） */
const summary = [
  { label: "本月收入", value: "¥ 48,600", delta: "+12.4%", up: true },
  { label: "本月支出", value: "¥ 21,340", delta: "-3.2%", up: false },
  { label: "本月净利", value: "¥ 27,260", delta: "+21.8%", up: true },
];

const bills = [
  { date: "10-12", title: "番茄批发 · 万邦市场", amount: 18600, in_: true },
  { date: "10-10", title: "水溶肥采购 × 10 袋", amount: 4500, in_: false },
  { date: "10-08", title: "黄瓜零售 · 社区团购", amount: 8200, in_: true },
  { date: "10-06", title: "人工工资（采摘临时工）", amount: 6800, in_: false },
  { date: "10-03", title: "有机肥采购 × 30 袋", amount: 2640, in_: false },
  { date: "10-01", title: "菜心批发 · 新发地", amount: 21800, in_: true },
];

const orders = [
  { code: "SO-20261012-01", buyer: "鲜丰水果（郑州 3 店）", goods: "番茄 2000kg", amount: 13600, status: "配送中" },
  { code: "SO-20261008-03", buyer: "美团买菜 · 仓配", goods: "黄瓜 800kg", amount: 5440, status: "已签收" },
  { code: "SO-20261005-02", buyer: "本地商超 · 万家乐", goods: "普通白菜 1200kg", amount: 3120, status: "已签收" },
];

/** 投入产出比例条（纯 CSS） */
const ratio = [
  { label: "农资投入", pct: 38, cls: "c1" },
  { label: "人工成本", pct: 27, cls: "c2" },
  { label: "物流包装", pct: 12, cls: "c3" },
  { label: "净收益", pct: 23, cls: "c4" },
];

const toast = ref("");
function say(m: string) {
  toast.value = m;
  setTimeout(() => (toast.value = ""), 1800);
}
</script>

<template>
  <div>
    <header class="navbar">
      <button class="back" @click="$router.back()">‹</button>
      <div class="title">经营账本</div>
    </header>

    <div class="page">
      <!-- 收支总览 -->
      <div class="card">
        <div class="stat3">
          <div v-for="s in summary" :key="s.label" class="st">
            <div class="muted" style="font-size: 13px">{{ s.label }}</div>
            <div style="font-size: 19px; font-weight: 700">{{ s.value }}</div>
            <div class="delta" :class="{ neg: !s.up }">{{ s.delta }}</div>
          </div>
        </div>
      </div>

      <!-- 投入产出结构 -->
      <div class="card">
        <b style="font-size: 17px">投入产出结构（本月）</b>
        <div class="bar mt8">
          <div v-for="r in ratio" :key="r.label" :class="r.cls" :style="{ width: r.pct + '%' }"></div>
        </div>
        <div class="legend">
          <span v-for="r in ratio" :key="r.label" class="lg">
            <i :class="r.cls"></i>{{ r.label }} {{ r.pct }}%
          </span>
        </div>
      </div>

      <!-- 收支流水 -->
      <div class="card">
        <div class="row" style="margin-bottom: 6px">
          <b style="font-size: 17px">收支流水</b>
          <span class="grow"></span>
          <span class="muted" style="font-size: 13px">与 PC 端账本同步</span>
        </div>
        <div v-for="(b, i) in bills" :key="i" class="bill">
          <div class="grow">
            <div style="font-size: 16px">{{ b.title }}</div>
            <div class="muted" style="font-size: 13px">{{ b.date }}</div>
          </div>
          <b :class="b.in_ ? 'up' : 'down'" style="font-size: 17px">
            {{ b.in_ ? "+" : "−" }} ¥{{ Math.abs(b.amount).toLocaleString() }}
          </b>
        </div>
      </div>

      <!-- 卖货订单 -->
      <div class="card">
        <b style="font-size: 17px">卖货订单（撮合）</b>
        <div v-for="o in orders" :key="o.code" class="bill" style="align-items: flex-start">
          <div class="grow">
            <div style="font-size: 16px">{{ o.goods }}</div>
            <div class="muted" style="font-size: 13px">{{ o.buyer }} · {{ o.code }}</div>
          </div>
          <div class="right">
            <b style="font-size: 16px">¥{{ o.amount.toLocaleString() }}</b>
            <div>
              <span class="tag" :class="o.status === '配送中' ? 'tag-warn' : 'tag-green'">{{ o.status }}</span>
            </div>
          </div>
        </div>
        <button class="btn btn-soft btn-block mt8" @click="say('撮合大厅规划于 v1.0，敬请期待')">🤝 发布供货（即将上线）</button>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.stat3 {
  display: flex;
  justify-content: space-between;
  text-align: center;
}
.st {
  flex: 1;
}
.delta {
  font-size: 13px;
  color: var(--zy-danger);
  font-weight: 600;
}
.delta.neg {
  color: var(--zy-primary);
}
.bar {
  display: flex;
  height: 16px;
  border-radius: 8px;
  overflow: hidden;
}
.c1 {
  background: #2f7d4f;
}
.c2 {
  background: #6aa84f;
}
.c3 {
  background: #a2c465;
}
.c4 {
  background: #ffd666;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin-top: 10px;
  font-size: 13px;
}
.lg i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 4px;
}
.lg:nth-child(1) i {
  background: #2f7d4f;
}
.lg:nth-child(2) i {
  background: #6aa84f;
}
.lg:nth-child(3) i {
  background: #a2c465;
}
.lg:nth-child(4) i {
  background: #ffd666;
}
.bill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--zy-line);
}
.bill:last-of-type {
  border-bottom: none;
}
.up {
  color: var(--zy-danger);
}
.down {
  color: var(--zy-primary);
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
