"use client";

import { useEffect, useState } from "react";

export function useAppInstallState() {
  const [isStandaloneDisplay, setIsStandaloneDisplay] = useState(false);
  const [isIosStandalone, setIsIosStandalone] = useState(false);
  const [isAndroidTWAReferrer, setIsAndroidTWAReferrer] = useState(false);

  useEffect(() => {
    const check = () => {
      const standalone = window.matchMedia?.("(display-mode: standalone)").matches ||
        window.matchMedia?.("(display-mode: fullscreen)").matches ||
        false;
      setIsStandaloneDisplay(standalone);
      setIsIosStandalone((navigator as any).standalone === true);
      setIsAndroidTWAReferrer(document.referrer?.startsWith("android-app://") ?? false);
    };

    check();

    const media1 = window.matchMedia?.("(display-mode: standalone)");
    const media2 = window.matchMedia?.("(display-mode: fullscreen)");

    const onChange = () => check();
    media1?.addEventListener?.("change", onChange);
    media2?.addEventListener?.("change", onChange);

    window.addEventListener("appinstalled", check);

    return () => {
      media1?.removeEventListener?.("change", onChange);
      media2?.removeEventListener?.("change", onChange);
      window.removeEventListener("appinstalled", check);
    };
  }, []);

  const isInstalled = isStandaloneDisplay || isIosStandalone || isAndroidTWAReferrer;

  return {
    isInstalled,
    isStandaloneDisplay,
    isIosStandalone,
    isAndroidTWAReferrer,
  } as const;
}
