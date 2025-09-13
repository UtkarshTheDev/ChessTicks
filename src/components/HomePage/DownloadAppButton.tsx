"use client";

import React from "react";
import GlowButton from "@/components/ui/GlowButton";
import { Smartphone } from "lucide-react";

const variant =  {
        name: 'green',
        color: '#48bb78'
}

interface DownloadAppButtonProps {
  apkUrl: string; // absolute or relative URL to the APK
  fileName?: string; // optional filename for the download attribute
  className?: string;
}

const triggerDownload = async (url: string, suggestedName?: string) => {
  try {
    // Prefer using an anchor with download attribute when possible.
    // Some mobile browsers (esp. Android/Chrome) handle direct links better.
    const a = document.createElement("a");
    a.href = url;
    if (suggestedName) a.download = suggestedName;
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error("APK download failed:", e);
  }
};

const DownloadAppButton: React.FC<DownloadAppButtonProps> = ({ apkUrl, fileName = "chessticks.apk", className }) => {
  return (
    <div className="w-full">
      <GlowButton
        variant={variant.name}
        disableChevron
        className={`w-full  justify-center py-1 text-xl font-unbounded font-semibold text-white ${className ?? ""}`}
        onClick={() => triggerDownload(apkUrl, fileName)}
      >
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <Smartphone className="!w-5 !h-5" />
          Play on App
        </span>
      </GlowButton>
    </div>
  );
};

export default DownloadAppButton;
