/**
 * 离线打卡队列：
 * - 弱网/断网时打卡请求先存 localStorage，不打断用户操作
 * - 网络恢复（online 事件）或下次启动时自动批量重放
 * - 失败仍继续保留，最多重试 5 次
 */
import { checkIn, type TaskEvidence } from "@/api/app";

const QUEUE_KEY = "zy_offline_checkin_queue";

export interface QueuedCheckIn {
  id: string;
  task_id: number;
  phase: "before" | "after";
  evidences: TaskEvidence[];
  note?: string;
  geo?: string;
  retries: number;
  queued_at: string;
}

function readQueue(): QueuedCheckIn[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedCheckIn[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function queueSize(): number {
  return readQueue().length;
}

export function enqueueCheckIn(item: Omit<QueuedCheckIn, "id" | "retries" | "queued_at">) {
  const q = readQueue();
  q.push({
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    retries: 0,
    queued_at: new Date().toISOString(),
  });
  writeQueue(q);
}

let flushing = false;

/** 同步队列：成功移除；网络仍失败保留；超过 5 次放弃并移除 */
export async function flushQueue(): Promise<{ ok: number; fail: number }> {
  if (flushing) return { ok: 0, fail: 0 };
  flushing = true;
  let ok = 0;
  let fail = 0;
  try {
    const q = readQueue();
    const remain: QueuedCheckIn[] = [];
    for (const item of q) {
      try {
        await checkIn(item.task_id, {
          phase: item.phase,
          evidences: item.evidences,
          note: item.note,
          geo: item.geo,
        });
        ok += 1;
      } catch (e: any) {
        if (e?.isNetworkError && item.retries < 5) {
          remain.push({ ...item, retries: item.retries + 1 });
        }
        fail += 1;
      }
    }
    writeQueue(remain);
  } finally {
    flushing = false;
  }
  return { ok, fail };
}

export function initOfflineQueue() {
  // 启动即尝试同步一次
  flushQueue();
  // 网络恢复自动同步
  window.addEventListener("online", () => {
    flushQueue();
  });
}