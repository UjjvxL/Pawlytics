/**
 * Pawlytics Image Quality Gate Module
 * Evaluates image blur, luminance exposure, and minimum resolution before AI inference.
 */

export function evaluateImageQuality(canvasElement, imageElement) {
  try {
    const width = imageElement.naturalWidth || imageElement.videoWidth || imageElement.width || 640;
    const height = imageElement.naturalHeight || imageElement.videoHeight || imageElement.height || 480;

    // Gate 1: Resolution & Dimension Check
    if (width < 120 || height < 120) {
      return {
        passed: false,
        reason: "Image resolution too low for reliable AI animal detection (minimum 120x120px required).",
        metrics: { blurScore: 0, meanLuminance: 0, width, height },
      };
    }

    if (!canvasElement) {
      return { passed: true, reason: "Quality check bypassed (no canvas)", metrics: { width, height } };
    }

    const ctx = canvasElement.getContext("2d", { willReadFrequently: true });
    canvasElement.width = width;
    canvasElement.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const pixelCount = pixels.length / 4;

    let totalLuminance = 0;
    const lumArray = new Float32Array(pixelCount);

    for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      lumArray[j] = lum;
      totalLuminance += lum;
    }

    const meanLuminance = totalLuminance / pixelCount;

    // Gate 2: Extreme Underexposure (Dark) or Overexposure (Blown-out)
    if (meanLuminance < 15) {
      return {
        passed: false,
        reason: "Image is extremely dark. Please ensure adequate lighting or turn on flash.",
        metrics: { blurScore: 100, meanLuminance, width, height },
      };
    }

    if (meanLuminance > 245) {
      return {
        passed: false,
        reason: "Image is overexposed / washed out. Please adjust camera angle.",
        metrics: { blurScore: 100, meanLuminance, width, height },
      };
    }

    // Gate 3: Laplacian Gradient Blur Estimation
    let blurVariance = 0;
    const step = Math.max(1, Math.floor(width / 160));
    let sampleCount = 0;

    for (let y = step; y < height - step; y += step) {
      for (let x = step; x < width - step; x += step) {
        const idx = y * width + x;
        const center = lumArray[idx];
        const left = lumArray[idx - step];
        const right = lumArray[idx + step];
        const top = lumArray[(y - step) * width + x];
        const bottom = lumArray[(y + step) * width + x];

        // Laplacian operator response
        const laplacian = Math.abs(4 * center - left - right - top - bottom);
        blurVariance += laplacian;
        sampleCount++;
      }
    }

    const blurScore = sampleCount > 0 ? Math.round(blurVariance / sampleCount) : 100;

    // Severe blur threshold check
    if (blurScore < 4) {
      return {
        passed: false,
        reason: "Image appears significantly blurred or out of focus. Please hold device steady.",
        metrics: { blurScore, meanLuminance, width, height },
      };
    }

    return {
      passed: true,
      reason: "Image quality verified.",
      metrics: { blurScore, meanLuminance: Math.round(meanLuminance), width, height },
    };
  } catch (err) {
    console.warn("Quality gate exception:", err);
    return { passed: true, reason: "Quality check exception fallback", metrics: {} };
  }
}
