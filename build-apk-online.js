// PWABuilder Cloud APK Generator with hosted manifest
import fs from 'fs';
import path from 'path';

async function generateApk() {
  console.log("Requesting APK compilation from PWABuilder Cloud Generator...");

  const manifestData = JSON.parse(fs.readFileSync(path.resolve('./public/manifest.json'), 'utf8'));

  const payload = {
    appUrl: "https://pawlytics-demo.web.app",
    name: "Pawlytics",
    packageId: "com.pawlytics.app",
    themeColor: "#1a2744",
    navColor: "#1a2744",
    backgroundColor: "#09090b",
    manifest: manifestData,
    manifestUrl: "https://raw.githubusercontent.com/pwabuilder/manifest/main/manifest.json",
    signingMode: "none",
    fallbackType: "customtabs",
    enableSiteSettingsShortcut: true,
    display: "standalone"
  };

  try {
    const res = await fetch("https://pwabuilder-cloud-apk.azurewebsites.net/generateAppPackage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Cloud response status:", res.status, res.statusText);
    const contentType = res.headers.get("content-type");

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const dest = "C:\\Users\\ujjva\\Desktop\\Pawlytics-Android-v1.0.apk";
      fs.writeFileSync(dest, Buffer.from(buffer));
      console.log(`SUCCESS! Created real APK at ${dest} (${buffer.byteLength} bytes)`);
    } else {
      const text = await res.text();
      console.log("Error details:", text);
    }
  } catch (err) {
    console.error("PWABuilder API error:", err);
  }
}

generateApk();
