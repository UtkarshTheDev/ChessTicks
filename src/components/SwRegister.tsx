"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLocalhost = Boolean(
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]"
    );

    if ("serviceWorker" in navigator) {
      // Only register in production builds or when explicitly running over https
      const shouldRegister = process.env.NODE_ENV === "production" || window.location.protocol === "https:" || isLocalhost;
      if (!shouldRegister) return;

      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          // Listen for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  console.info("New content is available; please refresh.");
                } else {
                  console.info("Content is cached for offline use.");
                }
              }
            });
          });
        } catch (err) {
          console.error("Service worker registration failed:", err);
        }
      };

      // Delay to allow page critical work first
      window.addEventListener("load", () => {
        register();
      });
    }
  }, []);

  return null;
}
