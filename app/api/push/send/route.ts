import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Nettoyer les cles VAPID des caracteres parasites
    const publicKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim().replace(/[\r\n\s]/g, "");
    const privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim().replace(/[\r\n\s]/g, "");
    const subject = (process.env.VAPID_SUBJECT || "mailto:contact@kayjend.sn").trim().replace(/[\r\n]/g, "");

    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: "VAPID keys manquantes" }, { status: 500 });
    }

    // Configurer VAPID au runtime (pas au build)
    webpush.setVapidDetails(subject, publicKey, privateKey);

    const { userId, title, body, url } = await req.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: "Parametres manquants" }, { status: 400 });
    }

    const { data: subs, error } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, message: "Aucun abonnement" });
    }

    const payload = JSON.stringify({ title, body, url: url || "/", tag: "kayjend-" + Date.now() });
    let sent = 0;
    const toDelete: string[] = [];

    for (const sub of subs) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }, payload);
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          toDelete.push(sub.id);
        }
        console.error("Push send error:", err.message);
      }
    }

    if (toDelete.length > 0) {
      await admin.from("push_subscriptions").delete().in("id", toDelete);
    }

    return NextResponse.json({ sent, total: subs.length });
  } catch (err: any) {
    console.error("Push API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}