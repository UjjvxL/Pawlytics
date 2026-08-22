/**
 * Pawlytics Real-Time Supabase WebSocket Broadcast Engine
 * Subscribes to live report pings and emergency high-risk incident alerts.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";

let alertListeners = new Set();

/** Register a listener for real-time conflict emergency pings */
export function subscribeRealtimeAlerts(callback) {
  alertListeners.add(callback);
  return () => alertListeners.delete(callback);
}

/** Broadcast notification to registered UI listeners */
export function broadcastAlert(alertData) {
  alertListeners.forEach((cb) => cb(alertData));
}

/** Initialize Real-Time Supabase Channel */
export function initRealtimeBroadcastChannel() {
  try {
    const channel = supabase
      .channel("pawlytics_conflict_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        (payload) => {
          const newReport = payload.new;
          console.log("Real-time report inserted:", newReport);

          const alertData = {
            id: newReport.id,
            title: newReport.severity_level >= 4 ? "🚨 High Severity Incident Alert" : "📌 New Community Sighting",
            message: `Sector ${newReport.ward_id || "62"}: ${newReport.category_label || "Incident reported"}`,
            severity: newReport.severity_level,
            timestamp: new Date().toLocaleTimeString(),
          };

          broadcastAlert(alertData);
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime status:", status);
      });

    return channel;
  } catch (err) {
    console.warn("Real-time channel init fallback:", err);
    return null;
  }
}

/** React hook for receiving real-time emergency alert toasts */
export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeAlerts((newAlert) => {
      setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
    });
    return unsubscribe;
  }, []);

  return { alerts, dismissAlert: (id) => setAlerts((prev) => prev.filter((a) => a.id !== id)) };
}
