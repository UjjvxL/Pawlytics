import { useCallback, useEffect, useState } from "react";
import { notificationsService } from "@/api/services";
import { supabase } from "@/api/supabaseClient";

async function showSystemNotification(notification) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const registration = await navigator.serviceWorker?.ready;
  if (registration) {
    registration.showNotification(notification.title, {
      body: notification.message,
      tag: `pawlytics-${notification.id}`,
      data: { url: notification.report_id ? "/my-reports" : "/notifications" },
    });
  } else {
    new Notification(notification.title, { body: notification.message });
  }
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setNotifications(await notificationsService.listMine());
    } catch (cause) {
      setError(cause);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("my-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, ({ new: item }) => {
        setNotifications((current) => current.some(({ id }) => id === item.id) ? current : [item, ...current]);
        showSystemNotification(item).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  const markRead = async (id) => {
    const updated = await notificationsService.markRead(id);
    setNotifications((current) => current.map((item) => item.id === id ? updated : item));
  };

  return { notifications, unreadCount: notifications.filter((item) => !item.read_at).length, loading, error, refresh, markRead };
}
