/**
 * Pawlytics Offline-First PWA Background Sync Engine
 * Stores pending report submissions locally when offline and syncs with Supabase when reconnected.
 */

import { reportsService } from "@/api/services";

const OFFLINE_QUEUE_KEY = "pawlytics_offline_pending_reports";

/** Get stored offline queue */
export function getOfflinePendingQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save report submission offline */
export function saveReportOffline(reportPayload) {
  try {
    const queue = getOfflinePendingQueue();
    const offlineItem = {
      ...reportPayload,
      offline_id: `offline-${Date.now()}`,
      created_at_offline: new Date().toISOString(),
      sync_status: "pending",
    };
    queue.push(offlineItem);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log("Report saved offline for background sync:", offlineItem);
    return offlineItem;
  } catch (err) {
    console.warn("Failed to save report offline:", err);
    return null;
  }
}

/** Synchronize all pending offline reports to Supabase */
export async function syncOfflineReports() {
  const queue = getOfflinePendingQueue();
  if (queue.length === 0) return { syncedCount: 0 };

  console.log(`Attempting background sync for ${queue.length} offline report(s)...`);
  let syncedCount = 0;
  const remainingQueue = [];

  for (const item of queue) {
    try {
      const { offline_id, created_at_offline, sync_status, ...validPayload } = item;
      await reportsService.create(validPayload);
      syncedCount++;
    } catch (err) {
      console.warn("Failed to sync item:", item, err);
      remainingQueue.push(item);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  return { syncedCount, remainingCount: remainingQueue.length };
}

/** Initialize Auto-Sync Event Listeners */
export function initOfflineSyncListeners(onSyncComplete) {
  window.addEventListener("online", async () => {
    console.log("Device reconnected to network. Triggering background sync...");
    const res = await syncOfflineReports();
    if (res.syncedCount > 0 && onSyncComplete) {
      onSyncComplete(res);
    }
  });
}
