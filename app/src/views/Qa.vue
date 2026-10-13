<script setup lang="ts">
import { nextTick, ref } from "vue";
import { aiQa } from "@/api/ext";

interface ChatMsg {
  role: "user" | "ai";
  text: string;
}

const msgs = ref<ChatMsg[]>([
  {
    role: "ai",
    text: "你好，我是智耘农技助手 🌾\n可以问我种植、施肥、病虫害、补贴政策等问题；也可以点下面的常见问题直接提问。",
  },
]);
const input = ref("");
const loading = ref(false);
const chips = ref(["番茄白粉病怎么治？", "一亩地底肥用多少？", "寒潮来了怎么防冻？", "蚜虫怎么防治？"]);
const listEl = ref<HTMLElement | null>(null);

async function scrollBottom() {
  await nextTick();
  listEl.value?.scrollTo({ top: listEl.value.scrollHeight, behavior: "smooth" });
}

async function send(q?: string) {
  const text = (q ?? input.value).trim();
  if (!text || loading.value) return;
  input.value = "";
  msgs.value.push({ role: "user", text });
  scrollBottom();
  loading.value = true;
  try {
    const r = await aiQa(text);
    msgs.value.push({ role: "ai", text: r.answer });
    if (r.suggestions?.length) chips.value = r.suggestions;
  } catch (e: any) {
    msgs.value.push({ role: "ai", text: `出错了：${e.message || "网络异常，请稍后再试"}` });
  } finally {
    loading.value = false;
    scrollBottom();
  }
}

function onVoice() {
  msgs.value.push({ role: "ai", text: "🎙️ 语音提问为 v1.0 规划能力（普通话 + 河南/山东/四川方言），演示版请先用文字提问。" });
  scrollBottom();
}
</script>

<template>
  <div>
    <header class="navbar">
      <button class="back" @click="$router.back()">‹</button>
      <div class="title">AI 农技问答</div>
      <span class="tag" style="background: rgba(255,255,255,0.2); color: #fff">演示版</span>
    </header>

    <div class="page" style="display: flex; flex-direction: column">
      <div ref="listEl" class="chat-list">
        <div v-for="(m, i) in msgs" :key="i" class="msg" :class="m.role">
          <div class="bubble">{{ m.text }}</div>
        </div>
        <div v-if="loading" class="msg ai">
          <div class="bubble typing">正在思考…</div>
        </div>
      </div>

      <div class="chips">
        <button v-for="c in chips" :key="c" class="chip" @click="send(c)">{{ c }}</button>
      </div>

      <div class="row input-row">
        <button class="mic" @click="onVoice">🎤</button>
        <input
          v-model="input"
          class="input grow"
          placeholder="输入问题，如：黄瓜叶片发黄怎么办"
          @keyup.enter="send()"
        />
        <button class="btn btn-primary" style="min-width: 84px" :disabled="loading" @click="send()">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
  min-height: 46vh;
}
.msg {
  display: flex;
  margin-bottom: 12px;
}
.msg.user {
  justify-content: flex-end;
}
.bubble {
  max-width: 82%;
  white-space: pre-wrap;
  font-size: 16px;
  line-height: 1.6;
  padding: 12px 14px;
  border-radius: 14px;
}
.msg.ai .bubble {
  background: #fff;
  border: 1px solid var(--zy-line);
  border-top-left-radius: 4px;
}
.msg.user .bubble {
  background: var(--zy-primary);
  color: #fff;
  border-top-right-radius: 4px;
}
.typing {
  opacity: 0.7;
}
.chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 6px 0 10px;
}
.chip {
  flex-shrink: 0;
  padding: 8px 14px;
  background: var(--zy-primary-soft);
  color: var(--zy-primary);
  border: none;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
}
.input-row {
  position: sticky;
  bottom: 0;
  padding-bottom: 4px;
}
.mic {
  font-size: 22px;
  min-width: 48px;
  min-height: 48px;
  border: none;
  border-radius: 12px;
  background: #fff;
  border: 1.5px solid var(--zy-line);
  cursor: pointer;
}
</style>
