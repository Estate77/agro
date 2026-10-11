<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { listBatches, type BatchItem } from "@/api/app";

const router = useRouter();
const code = ref("");
const batches = ref<BatchItem[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const r = await listBatches({ page: 1, page_size: 20 });
    batches.value = r.items;
  } finally {
    loading.value = false;
  }
}

function search() {
  const c = code.value.trim();
  if (!c) return;
  router.push(`/trace/${encodeURIComponent(c)}`);
}

onMounted(load);
</script>

<template>
  <div>
    <header class="navbar">
      <button class="back" @click="router.back()">‹</button>
      <div class="title">扫码溯源</div>
    </header>

    <div class="page">
      <div class="card">
        <p style="margin: 0 0 10px; font-size: 16px">输入或粘贴产品包装上的溯源码：</p>
        <div class="row">
          <input v-model="code" class="input grow" placeholder="如 TB-DEMO-20260315-A1" @keyup.enter="search" />
          <button class="btn btn-primary" style="min-width: 96px" @click="search">查询</button>
        </div>
        <p class="muted mt8" style="font-size: 13px; margin-bottom: 0">
          演示提示：也可以直接点下方任意批次查看溯源故事页（C 端免登录）
        </p>
      </div>

      <div v-if="loading" class="empty">加载中…</div>
      <div v-else-if="batches.length === 0" class="empty">
        <div class="emoji">📦</div>
        暂无批次
      </div>

      <div
        v-for="b in batches"
        :key="b.id"
        class="card"
        style="cursor: pointer"
        @click="router.push(`/trace/${b.code}`)"
      >
        <div class="row">
          <div style="font-size: 34px">🥬</div>
          <div class="grow">
            <b style="font-size: 18px">{{ b.product_name }}</b>
            <div class="muted" style="font-size: 13px; word-break: break-all">{{ b.code }}</div>
          </div>
          <span class="tag tag-green">{{ b.status }}</span>
        </div>
        <div class="muted mt8" style="font-size: 13px">{{ b.origin }}</div>
      </div>
    </div>
  </div>
</template>