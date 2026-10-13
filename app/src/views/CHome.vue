<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { listBatches, type BatchItem } from "@/api/app";
import { getCarbonAccount } from "@/api/ext";

const router = useRouter();
const batches = ref<BatchItem[]>([]);
const points = ref<number | null>(null);
const keyword = ref("");

const news = [
  { icon: "🌱", title: "一棵生菜的低碳之旅：从种子到餐桌 0.8kg 碳排放", tag: "溯源故事" },
  { icon: "🏆", title: "智耘示范园区获评省级生态低碳农场", tag: "资讯" },
  { icon: "🥗", title: "2026 秋冬时令蔬菜指南：这样挑更新鲜", tag: "科普" },
];

async function load() {
  const [b, c] = await Promise.all([
    listBatches({ page: 1, page_size: 6 }),
    getCarbonAccount().catch(() => null),
  ]);
  batches.value = b.items;
  if (c) points.value = c.points;
}

function search() {
  const k = keyword.value.trim();
  router.push(k ? `/trace/${encodeURIComponent(k)}` : "/trace");
}

onMounted(load);
</script>

<template>
  <div>
    <!-- C 端顶栏 -->
    <header class="navbar c-navbar">
      <div class="grow">
        <div class="title" style="font-size: 22px">智耘食</div>
        <div style="font-size: 13px; opacity: 0.9">吃得明白 · 扫码就信</div>
      </div>
      <button class="points" @click="router.push('/carbon')">
        🌱 {{ points === null ? "碳积分" : `${points} 分` }}
      </button>
    </header>

    <div class="page">
      <!-- 扫码大按钮 -->
      <div class="scan-card" @click="router.push('/trace')">
        <div class="scan-ico">📷</div>
        <div>
          <b style="font-size: 20px">扫码溯源</b>
          <div style="font-size: 14px; opacity: 0.9">对准产品包装上的二维码</div>
        </div>
        <span class="scan-arrow">›</span>
      </div>

      <!-- 搜索 -->
      <div class="row mt16">
        <input v-model="keyword" class="input grow" placeholder="搜索产品名 / 产地 / 企业 / 溯源码" @keyup.enter="search" />
        <button class="btn btn-primary" style="min-width: 88px" @click="search">搜索</button>
      </div>

      <!-- 推荐产品 -->
      <div class="row section-head">
        <b style="font-size: 18px" class="grow">为你推荐 · 本地直采</b>
        <a style="color: var(--zy-primary); font-size: 14px; cursor: pointer" @click="router.push('/trace')">更多 ›</a>
      </div>
      <div class="grid2">
        <div v-for="b in batches" :key="b.id" class="p-card" @click="router.push(`/trace/${b.code}`)">
          <div class="p-ico">🥬</div>
          <b style="font-size: 16px; display: block">{{ b.product_name }}</b>
          <div class="muted" style="font-size: 12px; word-break: break-all">{{ b.origin || b.code }}</div>
          <div class="tags">
            <span class="tag tag-green">绿色</span>
            <span class="tag tag-warn">低碳</span>
          </div>
        </div>
      </div>

      <!-- 资讯 -->
      <div class="card" style="margin-top: 16px">
        <b style="font-size: 17px">资讯 · 溯源故事</b>
        <div v-for="(n, i) in news" :key="i" class="news" @click="router.push(`/trace/${batches[0]?.code || ''}`)">
          <span style="font-size: 26px">{{ n.icon }}</span>
          <span class="grow" style="font-size: 15px; line-height: 1.5">{{ n.title }}</span>
          <span class="tag tag-gray">{{ n.tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-navbar {
  background: var(--zy-contour), linear-gradient(140deg, #14532d 0%, #1e8f5a 90%);
}
.points {
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(217, 164, 65, 0.55);
  color: #f7ecd4;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.scan-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--zy-contour), linear-gradient(140deg, #14532d 0%, #1e8f5a 100%);
  color: #fff;
  border-radius: 20px;
  padding: 20px 18px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(20, 83, 45, 0.35);
  animation: cardIn 0.34s ease both;
}
.scan-ico {
  font-size: 40px;
}
.scan-arrow {
  margin-left: auto;
  font-size: 26px;
  opacity: 0.8;
}
.section-head {
  margin: 18px 0 10px;
}
.grid2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.p-card {
  background: #fff;
  border: 1px solid var(--zy-line);
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(36, 51, 40, 0.05);
  transition: transform 0.12s ease;
}
.p-card:active {
  transform: scale(0.97);
}
.p-ico {
  font-size: 34px;
  margin-bottom: 6px;
}
.tags {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.news {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px dashed var(--zy-line);
  cursor: pointer;
}
.news:last-child {
  border-bottom: none;
}
</style>
