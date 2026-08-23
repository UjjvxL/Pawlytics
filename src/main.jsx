import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initOfflineSyncListeners } from '@/lib/offlineSync'

// Initialize offline background auto-sync
initOfflineSyncListeners((res) => {
  console.log(`[Pawlytics PWA] Auto-synced ${res.syncedCount} offline report(s) to Supabase.`);
});

// Register PWA Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('[Pawlytics PWA] Service Worker registered:', reg.scope))
      .catch((err) => console.warn('[Pawlytics PWA] Service Worker registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
