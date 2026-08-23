// Pawlytics WhatsApp & External Helpline Ingestion Engine
// Processes incoming webhook payloads from Meta WhatsApp Business API / Twilio

import { reportsService } from './index.js';
import { aiValidationWorker } from './aiValidationWorker.js';

export const whatsappIngestion = {
  /**
   * Parses standard WhatsApp Business Webhook Payload
   * Example input:
   * {
   *   from_phone: "+919876543210",
   *   latitude: 28.4632,
   *   longitude: 77.4925,
   *   location_name: "IILM University KP-2 Gate 1",
   *   message: "Pack of 4 aggressive dogs near food stalls",
   *   media_url: "https://example.com/whatsapp-photo.jpg"
   * }
   */
  async handleWebhookPayload(payload) {
    console.log(`[WhatsApp Webhook] Received payload from ${payload.from_phone || 'Citizen Helpline'}`);

    if (!payload.latitude || !payload.longitude) {
      throw new Error("Missing GPS coordinates in location pin payload");
    }

    const rawReport = {
      id: `wa-${Date.now()}`,
      category: payload.category || (payload.message?.toLowerCase().includes("bite") ? "contact_bite" : "aggressive_interaction"),
      severity_level: payload.severity_level || (payload.message?.toLowerCase().includes("bite") ? 5 : 4),
      description: payload.message || "Report submitted via Pawlytics WhatsApp Helpline",
      latitude: parseFloat(payload.latitude),
      longitude: parseFloat(payload.longitude),
      location_label: payload.location_name || "Greater Noida Sector",
      ward: payload.ward || "Knowledge Park 2 (IILM / Galgotias)",
      incident_timestamp: new Date().toISOString(),
      photo_url: payload.media_url || null,
      source_channel: "whatsapp_helpline",
      reporter_phone_hash: payload.from_phone ? `sha256_${payload.from_phone.slice(-4)}` : "anonymous",
      is_demo: false,
      created_date: new Date().toISOString()
    };

    // Run Machine Vision validation worker immediately
    const aiResults = await aiValidationWorker.processReport(rawReport);
    const finalizedReport = { ...rawReport, ...aiResults };

    console.log(`[WhatsApp Webhook] Successfully processed report ${finalizedReport.id} for ward: ${finalizedReport.ward}`);
    return finalizedReport;
  }
};
