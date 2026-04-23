"use client";
import { useEffect, useState } from "react";
import { TbBell, TbBellOff, TbBellRinging, TbCheck, TbX } from "react-icons/tb";
import { registerPush, unregisterPush, getPushPermission, isPushSupported } from "@/lib/push/client";
import { toast } from "react-toastify";

export default function EnableNotificationsButton() {
  const [status, setStatus] = useState<"loading" | "unsupported" | "default" | "granted" | "denied">("loading");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const supported = await isPushSupported();
      if (!supported) { setStatus("unsupported"); return; }
      const perm = await getPushPermission();
      setStatus(perm);
    })();
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const result = await registerPush();
    setLoading(false);
    if (result.success) {
      setStatus("granted");
      toast.success("🔔 " + result.message);
    } else {
      toast.error(result.message);
      if (result.message.includes("refusee")) setStatus("denied");
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    await unregisterPush();
    setStatus("default");
    setLoading(false);
    toast.info("Notifications desactivees");
  };

  if (status === "loading") return null;
  if (status === "unsupported") return null;

  if (status === "granted") {
    return (
      <button onClick={handleDisable} disabled={loading}
        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-60">
        <TbCheck size={16} /> Notifications activees
        <TbBellOff size={14} className="ml-1 opacity-60" />
      </button>
    );
  }

  if (status === "denied") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-700 flex items-center gap-2">
        <TbX size={14} /> Notifications bloquees — activez-les dans les parametres du navigateur
      </div>
    );
  }

  return (
    <button onClick={handleEnable} disabled={loading}
      className="flex items-center gap-2 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-60 animate-pulse">
      <TbBellRinging size={18} /> Activer les notifications
    </button>
  );
}