"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("✅ Service Worker enregistre:", reg.scope);
        })
        .catch((err) => {
          console.error("❌ SW error:", err);
        });
    }
  }, []);
  return null;
}