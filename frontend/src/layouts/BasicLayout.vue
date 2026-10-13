<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  allowedPortals,
  categoriesFor,
  firstPathFor,
  portalMeta,
  PORTALS,
  type PortalId,
} from "@/config/portal";

/**
 * 顶部导航布局：品牌区 + 5 大分类下拉 + 端口视角切换 + 用户菜单。
 * 视觉方向「数字农政 · 田野工作台」：深松绿顶栏（等高线纹理）+ 米纸画布 + 麦秆琥珀点缀。
 */

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

// ---------- 端口视角 ----------
const rolePortals = computed<PortalId[]>(() => allowedPortals(auth.user?.role_codes));
const storedPortal = localStorage.getItem("zy_portal") as PortalId | null;
const activePortal = ref<PortalId>(
  storedPortal && rolePortals.value.includes(storedPortal) ? storedPortal : rolePortals.value[0]
);
const portal = computed(() => portalMeta(activePortal.value));

const cats = computed(() => categoriesFor(activePortal.value));

function onSwitchPortal(p: PortalId) {
  if (p === activePortal.value) return;
  activePortal.value = p;
  localStorage.setItem("zy_portal", p);
  router.replace(firstPathFor(p));
}

// ---------- 导航状态 ----------
const activeCatId = computed(() => {
  const cat = cats.value.find((c) => c.items.some((i) => i.path === route.path));
  return cat?.id ?? "";
});

function goFirst(itemPath: string) {
  router.push(itemPath);
}

function onLogout() {
  auth.logout();
  router.replace("/login");
}

const userInitial = computed(() => (auth.user?.display_name || auth.user?.username || "·").slice(0, 1));

const ROLE_LABELS: Record<string, string> = {
  platform_admin: "平台超管",
  tenant_admin: "租户管理员",
  farm_operator: "农场操作员",
  viewer: "只读访客",
  gov_regulator: "G端监管员",
  c_operator: "C端运营",
};
const roleLabel = computed(() => {
  const codes = auth.user?.role_codes ?? [];
  return codes.map((c) => ROLE_LABELS[c] ?? c).join(" / ") || "成员";
});
</script>

<template>
  <div class="shell">
    <!-- ===== 顶部导航栏 ===== -->
    <header class="topbar">
      <!-- 品牌 -->
      <div class="brand" @click="goFirst(firstPathFor(activePortal))">
        <svg class="brand-mark" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#d9a441" stroke-width="1.6" />
          <path d="M18 27 C18 21 18 17 18 12" stroke="#eaf3e6" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <path d="M18 17 C13.5 17 10.5 14 10.5 9 C15.5 9 18 12.5 18 17 Z" fill="#9fce8f" />
          <path d="M18 13.5 C18 9.5 21 7 26 7 C26 12 22.5 14 18 13.5 Z" fill="#d9a441" />
        </svg>
        <div class="brand-text">
          <b>智耘云</b>
          <i>SMART AGRI CLOUD</i>
        </div>
      </div>

      <!-- 分类导航 -->
      <nav class="cats">
        <div
          v-for="cat in cats"
          :key="cat.id"
          class="cat"
          :class="{ active: activeCatId === cat.id }"
        >
          <button class="cat-btn" type="button" @click="goFirst(cat.items[0].path)">
            {{ cat.name }}
            <svg class="caret" viewBox="0 0 10 6"><path d="M1 1 L5 5 L9 1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
          </button>

          <!-- 下拉面板 -->
          <div class="panel">
            <div class="panel-head">
              <b>{{ cat.name }}</b>
              <span>{{ cat.en }}</span>
            </div>
            <div class="panel-grid">
              <RouterLink
                v-for="item in cat.items"
                :key="item.path"
                class="p-item"
                :class="{ current: route.path === item.path }"
                :to="item.path"
              >
                <el-icon class="p-icon"><component :is="item.icon" /></el-icon>
                <span class="p-text">
                  <b>{{ item.label }}</b>
                  <i>{{ item.desc }}</i>
                </span>
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>

      <!-- 右侧：端口切换 + 用户 -->
      <div class="right">
        <el-dropdown v-if="rolePortals.length > 1" trigger="click" @command="onSwitchPortal">
          <button class="portal-chip" type="button">
            <span class="portal-dot" :class="'p-' + activePortal.toLowerCase()" />
            {{ portal.full }}
            <el-icon class="chip-caret"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="p in rolePortals"
                :key="p"
                :command="p"
                :class="{ 'is-cur': p === activePortal }"
              >
                <span class="portal-dot" :class="'p-' + p.toLowerCase()" />
                <div class="pm-item">
                  <b>{{ PORTALS[p].full }}</b>
                  <i>{{ PORTALS[p].desc }}</i>
                </div>
                <el-icon v-if="p === activePortal" class="pm-check"><Check /></el-icon>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span v-else class="portal-chip static">
          <span class="portal-dot" :class="'p-' + activePortal.toLowerCase()" />
          {{ portal.full }}
        </span>

        <el-dropdown trigger="click">
          <button class="user-chip" type="button">
            <span class="avatar">{{ userInitial }}</span>
            <span class="user-meta">
              <b>{{ auth.user?.display_name || auth.user?.username }}</b>
              <i>{{ roleLabel }}</i>
            </span>
            <el-icon class="chip-caret"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>
                <div class="pm-item">
                  <b>{{ auth.user?.tenant_name || "默认租户" }}</b>
                  <i>{{ auth.user?.is_platform_admin ? "跨租户管理员" : "租户成员" }}</i>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="" @click="onLogout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- ===== 内容画布 ===== -->
    <main class="canvas">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ---------- 顶栏 ---------- */
.topbar {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 0 20px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='60' viewBox='0 0 420 60'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.05'%3E%3Cpath d='M0 48 Q 60 28 130 42 T 260 38 T 420 46'/%3E%3Cpath d='M0 36 Q 70 16 150 32 T 300 28 T 420 34'/%3E%3Cpath d='M0 24 Q 80 6 170 22 T 340 18 T 420 24'/%3E%3C/g%3E%3C/svg%3E"),
    linear-gradient(180deg, #1c4433 0%, #16382a 100%);
  border-bottom: 1px solid #0e2419;
  box-shadow: 0 2px 12px rgba(14, 36, 25, 0.35);
  position: relative;
  z-index: 50;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding-right: 18px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  margin-right: 6px;
  flex-shrink: 0;
}
.brand-mark { width: 32px; height: 32px; }
.brand-text { display: flex; flex-direction: column; line-height: 1.15; }
.brand-text b {
  font-family: var(--zy-display);
  font-size: 19px;
  letter-spacing: 2px;
  color: #f4f0e1;
}
.brand-text i {
  font-style: normal;
  font-size: 9px;
  letter-spacing: 2.5px;
  color: #d9a441;
  font-weight: 600;
}

/* ---------- 分类 ---------- */
.cats {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
}
.cat { position: relative; display: flex; }
.cat-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 16px;
  background: none;
  border: 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #cfd8c8;
  position: relative;
  transition: color 0.2s;
}
.cat-btn:hover { color: #f4f0e1; }
.cat-btn .caret { width: 8px; height: 5px; opacity: 0.55; transition: transform 0.25s; }
.cat::after {
  content: "";
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #d9a441;
  transform: scaleX(0);
  transition: transform 0.22s ease;
}
.cat:hover::after,
.cat.active::after { transform: scaleX(1); }
.cat:hover .caret { transform: rotate(180deg); }
.cat.active .cat-btn { color: #f4f0e1; }

/* ---------- 下拉面板 ---------- */
.panel {
  position: absolute;
  top: 100%;
  left: 0;
  padding-top: 10px;
  visibility: hidden;
  opacity: 0;
  transform: translateY(6px);
  transition: all 0.22s ease;
  pointer-events: none;
  z-index: 60;
}
.cat:hover .panel {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.panel::before {
  content: "";
  position: absolute;
  top: 6px;
  left: 12px;
  width: 190px;
  height: 6px;
  background: transparent;
}
.panel > * { position: relative; }
.panel-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 12px 16px 8px;
}
.panel-head b {
  font-family: var(--zy-display);
  font-size: 15px;
  letter-spacing: 1.5px;
  color: #274434;
}
.panel-head span {
  font-size: 9px;
  letter-spacing: 2px;
  color: #b0a880;
  font-weight: 700;
}
.panel-grid {
  width: 384px;
  background: #fbf9f1;
  border: 1px solid #e3ddc8;
  border-top: 2px solid #d9a441;
  border-radius: 0 10px 10px 10px;
  box-shadow: 0 14px 34px rgba(20, 40, 28, 0.22);
  padding: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
.p-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s;
}
.p-item:hover { background: #eef3e4; }
.p-item.current { background: var(--zy-primary-soft); box-shadow: inset 0 0 0 1px #bcd9bd; }
.p-icon {
  font-size: 18px;
  color: var(--zy-primary);
  background: #fff;
  border: 1px solid #e0e8d5;
  border-radius: 7px;
  padding: 6px;
  flex-shrink: 0;
}
.p-text { display: flex; flex-direction: column; min-width: 0; }
.p-text b { font-size: 13px; color: #2c3a2e; font-weight: 700; }
.p-text i {
  font-style: normal;
  font-size: 11px;
  color: #97a08a;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- 右侧 ---------- */
.right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.portal-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 12px;
  border-radius: 16px;
  border: 1px solid rgba(217, 164, 65, 0.45);
  background: rgba(217, 164, 65, 0.12);
  color: #ecd9a8;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  outline: none;
}
.portal-chip.static { cursor: default; }
.portal-chip:hover { background: rgba(217, 164, 65, 0.22); }
.portal-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.portal-dot.p-b { background: #8fd47c; box-shadow: 0 0 6px #8fd47c; }
.portal-dot.p-g { background: #d9a441; box-shadow: 0 0 6px #d9a441; }
.portal-dot.p-c { background: #e08d6d; box-shadow: 0 0 6px #e08d6d; }
.chip-caret { font-size: 12px; opacity: 0.7; }

.user-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 40px;
  padding: 0 8px;
  background: none;
  border: 0;
  cursor: pointer;
  outline: none;
  border-radius: 8px;
  transition: background 0.2s;
}
.user-chip:hover { background: rgba(255, 255, 255, 0.07); }
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d9a441, #b57f22);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-meta { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
.user-meta b { font-size: 13px; color: #f4f0e1; font-weight: 600; }
.user-meta i { font-style: normal; font-size: 10px; color: #9fb49b; }
.user-chip .chip-caret { color: #cfd8c8; }

/* ---------- 画布 ---------- */
.canvas {
  flex: 1;
  overflow-y: auto;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.045'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E"),
    var(--zy-canvas);
}

/* 页面切换动效 */
.page-enter-active,
.page-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-4px); }

/* 下拉菜单内部排版（portal 弹层） */
.pm-item { display: flex; flex-direction: column; line-height: 1.25; }
.pm-item b { font-size: 13px; }
.pm-item i { font-style: normal; font-size: 11px; color: #97a08a; }
.pm-check { margin-left: auto; color: var(--zy-primary); }
</style>

<style>
/* portal 弹层挂载在 body 下，需全局样式 */
.el-dropdown__popper .el-dropdown-menu__item.is-cur {
  background: var(--zy-primary-soft);
}
</style>
