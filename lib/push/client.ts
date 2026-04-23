"use client";
import { createClient } from "@/lib/supabase/client";

const VAPID_PUBLIC_KEY = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim().replace(/[\r\n\s]/g, "");

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function isPushSupported(): Promise<boolean> {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function getPushPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

export async function registerPush(): Promise<{ success: boolean; message: string }> {
  if (!(await isPushSupported())) {
    return { success: false, message: "Votre navigateur ne supporte pas les notifications" };
  }

  try {
    // Demander permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, message: "Permission refusee" };
    }

    // Enregistrer le service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // Creer l abonnement push
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const sub = subscription.toJSON() as any;

    // Sauvegarder dans Supabase
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Vous devez etre connecte" };

    await supabase.from("push_subscriptions").upsert({
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      user_agent: navigator.userAgent,
    }, { onConflict: "user_id,endpoint" });

    return { success: true, message: "Notifications activees !" };
  } catch (err: any) {
    console.error("Push error:", err);
    return { success: false, message: err.message || "Erreur" };
  }
}

export async function unregisterPush(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", subscription.endpoint);
    }
  }
}

// Envoyer une notification a un user specifique
export async function sendPushToUser(userId: string, title: string, body: string, url?: string) {
  try {
    await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, body, url }),
    });
  } catch (err) {
    console.error("Send push error:", err);
  }
}