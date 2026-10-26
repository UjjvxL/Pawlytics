import { Bell, BellRing, Check, ChevronLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { requestNotificationPermission, useNotifications } from "@/lib/notifications";

export default function Notifications() {
  const { notifications, unreadCount, loading, error, refresh, markRead } = useNotifications();

  return (
    <div className="min-h-full bg-zinc-50">
      <header className="bg-[#1a2744] px-5 pt-8 pb-5 text-white">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/" aria-label="Back to home" className="p-2 rounded-full bg-white/10"><ChevronLeft /></Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Notifications</h1>
            <p className="text-xs text-zinc-300">{unreadCount} unread safety update{unreadCount === 1 ? "" : "s"}</p>
          </div>
          <button onClick={refresh} aria-label="Refresh notifications" className="p-2 rounded-full bg-white/10"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-3">
        <button
          onClick={requestNotificationPermission}
          className="w-full flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left"
        >
          <BellRing className="w-5 h-5 text-emerald-700" />
          <span><strong className="block text-sm text-emerald-950">Enable device alerts</strong><span className="text-xs text-emerald-700">Receive verified nearby risks and report status changes.</span></span>
        </button>

        {loading && <div role="status" className="p-8 text-center text-sm text-zinc-500">Loading notifications…</div>}
        {error && <div role="alert" className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800">Notifications could not be loaded. Check your connection and try again.</div>}
        {!loading && !error && notifications.length === 0 && (
          <div className="p-10 text-center rounded-xl border border-zinc-200 bg-white">
            <Bell className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <h2 className="font-semibold text-zinc-800">No notifications yet</h2>
            <p className="text-xs text-zinc-500 mt-1">Verified local risks and updates to your reports will appear here.</p>
          </div>
        )}
        {notifications.map((item) => (
          <article key={item.id} className={`rounded-xl border p-4 ${item.read_at ? "bg-white border-zinc-200" : "bg-sky-50 border-sky-200"}`}>
            <div className="flex gap-3">
              <Bell className="w-4 h-4 mt-1 text-sky-700" />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm text-zinc-900">{item.title}</h2>
                <p className="text-xs leading-relaxed text-zinc-600 mt-1">{item.message}</p>
                <time className="block text-[11px] text-zinc-400 mt-2">{new Date(item.created_at).toLocaleString("en-IN")}</time>
              </div>
              {!item.read_at && <button onClick={() => markRead(item.id)} aria-label={`Mark ${item.title} as read`} className="p-2 self-start text-sky-700"><Check className="w-4 h-4" /></button>}
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
