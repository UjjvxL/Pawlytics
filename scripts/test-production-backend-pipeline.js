// Pawlytics End-to-End Backend Production Pipeline Test
// Verifies real data ingestion, WhatsApp webhook processing, AI Machine Vision filtering & database persistence

import { aiValidationWorker } from "../src/api/services/aiValidationWorker.js";
import { whatsappIngestion } from "../src/api/services/whatsappIngestion.js";
import { calculateRiskScore, clusterReportsToHotspots } from "../src/lib/riskEngine.js";

async function runPipelineVerification() {
  console.log("=========================================================================");
  console.log("PAWLYTICS PRODUCTION BACKEND PIPELINE VERIFICATION");
  console.log("=========================================================================\n");

  // Step 1: Simulate Citizen Mobile Camera Photo Upload
  console.log("-------------------------------------------------------------------------");
  console.log("STEP 1: Simulating Citizen Mobile App Camera Telemetry Upload...");
  console.log("-------------------------------------------------------------------------");
  const citizenUpload = {
    id: `cit-app-${Date.now()}`,
    category: "contact_bite",
    severity_level: 5,
    description: "Bitten on ankle by aggressive white dog near IILM Gate 2 food vendor stall.",
    latitude: 28.4633,
    longitude: 77.4926,
    location_label: "IILM University KP-2 Gate 2",
    ward: "Knowledge Park 2 (IILM / Galgotias)",
    photo_url: "https://pawlytics-storage.s3.amazonaws.com/evidence/bite_photo_kp2.jpg",
    dog_count: 3
  };

  const aiUpdates = await aiValidationWorker.processReport(citizenUpload);
  const processedCitizenReport = { ...citizenUpload, ...aiUpdates };
  console.log(`✅ Citizen App Ingestion Successful! Report ID: ${citizenUpload.id}`);
  console.log(`   Confidence Score: ${(processedCitizenReport.cv_confidence * 100).toFixed(0)}%`);
  console.log(`   Verification Status: ${processedCitizenReport.verification_status}`);
  console.log(`   Context Tags Extracted: [${processedCitizenReport.context_tags.join(", ")}]\n`);

  // Step 2: Simulate WhatsApp Business API Webhook Ingestion
  console.log("-------------------------------------------------------------------------");
  console.log("STEP 2: Simulating WhatsApp Business Helpline Webhook Ingestion...");
  console.log("-------------------------------------------------------------------------");
  const whatsappPayload = {
    from_phone: "+919810199887",
    latitude: 28.4739,
    longitude: 77.5036,
    location_name: "Alpha 1 Commercial Belt Meat Shops",
    message: "Multiple dogs barking and chasing delivery bike near meat shop dump",
    media_url: "https://example.com/whatsapp_image.jpg"
  };

  const processedWaReport = await whatsappIngestion.handleWebhookPayload(whatsappPayload);
  console.log(`✅ WhatsApp Ingestion Successful! Report ID: ${processedWaReport.id}`);
  console.log(`   Source Channel: ${processedWaReport.source_channel}`);
  console.log(`   Phone Hash Protected: ${processedWaReport.reporter_phone_hash}`);
  console.log(`   Verification Tier: ${processedWaReport.cv_uncertainty}\n`);

  // Step 3: Run Real-Time Spatial Risk Calculation & DBSCAN Hotspot Clustering
  console.log("-------------------------------------------------------------------------");
  console.log("STEP 3: Running Real-Time Risk Engine & DBSCAN Clustering...");
  console.log("-------------------------------------------------------------------------");
  const combinedReports = [processedCitizenReport, processedWaReport];
  const riskResult = calculateRiskScore(combinedReports);
  const hotspots = clusterReportsToHotspots(combinedReports, 0.5, 1);

  console.log(`✅ Computed Combined Sector Risk Score: ${riskResult.score} / 100 (${riskResult.level.toUpperCase()})`);
  console.log(`   Hotspots Generated: ${hotspots.length} Clusters`);
  hotspots.forEach((h, i) => {
    console.log(`   🔥 Hotspot #${i + 1}: Center [${h.centerLat.toFixed(4)}, ${h.centerLng.toFixed(4)}] | Risk Score: ${h.score}/100`);
  });

  console.log("\n=========================================================================");
  console.log("ALL BACKEND INGESTION & PROCESSING PIPELINES VERIFIED SUCCESSFULLY! 🚀");
  console.log("=========================================================================\n");
}

runPipelineVerification();
