<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getPermissions, getRoles, getUsers, type RbacPermission, type RbacRole, type RbacUser } from "@/api/center";

/** 系统设置：组织与用户 / 角色与权限（真实 RBAC 接口）/ 字典与审计 */

const loading = ref(false);
const activeTab = ref("users");

const users = ref<RbacUser[]>([]);
const roles = ref<RbacRole[]>([]);
const perms = ref<RbacPermission[]>([]);

const permsByModule = computed(() => {
  const map = new Map<string, RbacPermission[]>();
  for (const p of perms.value) {
    const list = map.get(p.module) ?? [];
    list.push(p);
    map.set(p.module, list);
  }
  return Array.from(map.entries()).map(([module, items]) => ({ module, items }));
});

const fmtDate = (s: string | null) => (s ? s.slice(0, 10) : "—");

onMounted(async () => {
  loading.value = true;
  try {
    [users.value, roles.value, perms.value] = await Promise.all([getUsers(), getRoles(), getPermissions()]);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
      <el-tag type="success" effect="plain">真实 RBAC 接口 · 多租户隔离</el-tag>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 组织与用户 -->
      <el-tab-pane label="组织与用户" name="users">
        <el-table :data="users" border stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column label="姓名" width="110">
            <template #default="{ row }">{{ row.display_name ?? "—" }}</template>
          </el-table-column>
          <el-table-column label="所属租户" min-width="140">
            <template #default="{ row }">{{ row.tenant_name ?? `租户 #${row.tenant_id}` }}</template>
          </el-table-column>
          <el-table-column label="角色" min-width="160">
            <template #default="{ row }">
              <el-tag v-for="r in row.role_codes" :key="r" size="small" effect="plain" style="margin-right: 4px">{{ r }}</el-tag>
              <span v-if="!row.role_codes.length" class="muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="平台管理员" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.is_platform_admin" type="danger" size="small" effect="dark">是</el-tag>
              <span v-else class="muted">否</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.is_active ? 'success' : 'info'" size="small" effect="light">{{ row.is_active ? "启用" : "停用" }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="110">
            <template #default="{ row }">{{ fmtDate(row.created_at) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 角色与权限 -->
      <el-tab-pane label="角色与权限" name="roles">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>角色（{{ roles.length }}）</template>
              <el-table :data="roles" size="small" border>
                <el-table-column prop="code" label="角色编码" width="130" />
                <el-table-column prop="name" label="角色名称" width="110" />
                <el-table-column prop="description" label="说明" min-width="130" show-overflow-tooltip />
                <el-table-column label="权限数" width="80">
                  <template #default="{ row }">{{ row.permission_codes.length }}</template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>权限点（{{ perms.length }}）· 按模块</template>
              <div v-for="g in permsByModule" :key="g.module" class="perm-group">
                <div class="perm-module">{{ g.module }}</div>
                <el-tag v-for="p in g.items" :key="p.code" size="small" effect="plain" class="perm-tag" :title="p.name">{{ p.code }}</el-tag>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 字典与审计 -->
      <el-tab-pane label="字典与审计" name="dict">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>数据字典与统计口径</template>
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="地块面积">亩（666.67 m²），地块台账维护</el-descriptions-item>
                <el-descriptions-item label="产量单位">千克（kg），采收单录入</el-descriptions-item>
                <el-descriptions-item label="碳核算口径">IPCC 2019 清单 / 省级温室气体清单指南</el-descriptions-item>
                <el-descriptions-item label="溯源编码">采收自动生成批次码，一物一码</el-descriptions-item>
                <el-descriptions-item label="农事任务状态">待执行 → 进行中 → 已完成 / 已取消</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>审计日志</template>
              <el-alert type="info" :closable="false" show-icon title="关键操作留痕" description="登录、地块/种植季变更、采收建批、角色授权、补贴申报等操作均写入审计日志（app.core.audit），可在后端日志中检索，v0.6 计划提供查询界面。" />
              <el-descriptions :column="1" border size="small" style="margin-top: 12px">
                <el-descriptions-item label="登录认证">JWT 双令牌，access 2h / refresh 30d</el-descriptions-item>
                <el-descriptions-item label="密码策略">bcrypt 加盐哈希存储</el-descriptions-item>
                <el-descriptions-item label="租户隔离">所有业务查询强制 tenant_id 过滤</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.muted { color: #909399; }
.perm-group { margin-bottom: 14px; }
.perm-module { font-size: 13px; font-weight: 700; color: #303133; margin-bottom: 6px; }
.perm-tag { margin: 0 6px 6px 0; font-family: monospace; }
</style>
