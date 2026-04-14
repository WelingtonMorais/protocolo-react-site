type ConnectionInfo = {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: ConnectionInfo;
  mozConnection?: ConnectionInfo;
  webkitConnection?: ConnectionInfo;
};

interface OptimizePlan {
  maxSide: number;
  quality: number;
  mimeType: "image/webp" | "image/jpeg";
}

export interface OptimizeImageResult {
  file: File;
  wasOptimized: boolean;
}

function getConnectionInfo(): ConnectionInfo | undefined {
  const nav = navigator as NavigatorWithHints;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

function pickPlan(file: File, width: number, height: number): OptimizePlan {
  const nav = navigator as NavigatorWithHints;
  const memoryGb = typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined;
  const connection = getConnectionInfo();
  const isDataSaver = connection?.saveData === true;
  const network = connection?.effectiveType ?? "";
  const biggestSide = Math.max(width, height);
  const megaPixels = (width * height) / 1_000_000;
  const veryLargeSource = biggestSide > 2500 || megaPixels > 5;
  const fileMb = file.size / (1024 * 1024);

  // Speed-first profile for mobile upload, with adaptive fallback.
  let maxSide = 1280;
  let quality = 0.74;
  let mimeType: "image/webp" | "image/jpeg" = "image/webp";

  if (isDataSaver || network.includes("2g") || network === "slow-2g") {
    maxSide = 960;
    quality = 0.68;
  } else if (network.includes("3g")) {
    maxSide = 1120;
    quality = 0.72;
  }

  if (memoryGb !== undefined && memoryGb <= 2) {
    maxSide = Math.min(maxSide, 1024);
    quality = Math.min(quality, 0.7);
  }

  if (!veryLargeSource && fileMb < 1.4) {
    maxSide = Math.min(1600, Math.max(maxSide, 1440));
    quality = Math.max(quality, 0.78);
  }

  // iOS Safari may not support webp encoding consistently via canvas.
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    mimeType = "image/jpeg";
  }

  return { maxSide, quality, mimeType };
}

export async function optimizeImageForUpload(file: File): Promise<OptimizeImageResult> {
  const bitmap = await createImageBitmap(file);
  const plan = pickPlan(file, bitmap.width, bitmap.height);
  const ratio = Math.min(1, plan.maxSide / Math.max(bitmap.width, bitmap.height));
  const targetWidth = Math.max(1, Math.round(bitmap.width * ratio));
  const targetHeight = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    bitmap.close();
    return { file, wasOptimized: false };
  }
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, plan.mimeType, plan.quality);
  });
  if (!blob) return { file, wasOptimized: false };

  const ext = plan.mimeType === "image/webp" ? "webp" : "jpg";
  const output = new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, {
    type: plan.mimeType,
    lastModified: Date.now(),
  });

  if (output.size >= file.size && ratio >= 1) {
    return { file, wasOptimized: false };
  }
  return { file: output, wasOptimized: true };
}
