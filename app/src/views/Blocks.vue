<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { listBlocks, type Block } from "@/api/app";

const router = useRouter();
const blocks = ref<Block[]>([]);
const loading = ref(true);

const seasonInfo: Record<string, string> = {
  番茄: "秋延后茬 · 8 月定植，11 月始收",
  黄瓜: "秋冬茬 · 9 月定植，10 月始收",
  普通白菜: "速生叶菜 · 全年多茬滚动种植",
  辣椒: "越夏茬 · 5 月定植，7 月始收",
};

function season(crop: string | null): string {
  if (!crop) return "暂未关联种植季";
  return seasonInfo[crop] || `${crop} · 种植季进行中`;
}

onMounted(async () => {
  try {
    const r = await listBlocks({ page: 1, page_size: 50 });
    blocks.value = r.items;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <header class="navbar">
      <button class="back" @click="$router.back()">‹</button>
      <div class="title">我的地块</div>
      <span class="tag" style="background: rgba(255,255,255,0.2); color: #fff">{{ blocks.length }} 块</span>
    </header>

    <div class="page">
      <div v-if="loading" class="empty">加载中…</div>
      <div v-else-if="blocks.length === 0" class="empty">
        <div class="emoji">🗺️</div>
        暂无地块数据
      </div>

      <div v-for="b in blocks" :key="b.id" class="card">
        <div class="row">
          <div class="bicon">🏞️</div>
          <div class="grow">
            <b style="font-size: 18px">{{ b.name }}</b>
            <div class="muted" style="font-size: 13px">{{ b.code }} · {{ b.area_mu }} 亩</div>
          </div>
          <span class="tag tag-green" v-if="b.crop">{{ b.crop }}</span>
        </div>
        <div class="season">🌱 {{ season(b.crop) }}<template v-if="b.variety"> · 品种 {{ b.variety }}</template></div>
        <div class="row mt8">
          <button class="btn btn-soft" style="flex: 1" @click="router.push({ path: '/devices' })">
            📡 物联网数据
          </button>
          <button class="btn btn-soft" style="flex: 1" @click="router.push('/tasks')">
            📝 农事任务
          </button>
        </div>
      </div>

      <p class="muted center" style="font-size: 12px">
        地图模式（高德/天地图 SDK）规划于 v1.0，当前为列表模式
      </p>
    </div>
  </div>
</template>

<style scoped>
.bicon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--zy-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}
.season {
  margin-top: 10px;
  padding: 8px 10px;
  background: #f6f9f7;
  border-radius: 8px;
  font-size: 14px;
  color: var(--zy-text-2);
}
</style>
