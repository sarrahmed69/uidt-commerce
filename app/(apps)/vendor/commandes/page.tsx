"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendPushToUser } from "@/lib/push/client";
import { useRouter } from "next/navigation";

import {
  TbShoppingBag, TbLoader2, TbClock, TbCheck, TbX,
  TbBrandWhatsapp, TbPackage, TbUser, TbArrowLeft,
  TbTruck, TbSearch, TbBell, TbMessageCircle,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

type Order = {
  id: string; buyer_name: string; buyer_phone: string | null;
  buyer_id: string | null;
  items: { id: string; name: string; price: number; qty: number; image: string }[];
  total: number; total_price: number | null; delivery_address: string | null;
  message: string | null; status: string; whatsapp: string | null;
  created_at: string; tracking_token: string | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: "En attente", color: "bg-amber-100 text-amber-700",    icon: TbClock },
  confirmed: { label: "Confirmee",  color: "bg-blue-100 text-blue-700",      icon: TbCheck },
  delivered: { label: "Livree",     color: "bg-emerald-100 text-emerald-700", icon: TbTruck },
  cancelled: { label: "Annulee",    color: "bg-red-100 text-red-500",        icon: TbX },
};

const FILTERS = ["Toutes", "En attente", "Confirmee", "Livree", "Annulee"];
const FILTER_MAP: Record<string, string> = {
  "En attente": "pending", "Confirmee": "confirmed",
  "Livree": "delivered", "Annulee": "cancelled",
};

export default function VendorCommandes() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [newAlert, setNewAlert] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      setCurrentUserId(user.id);
      const { data: vendors } = await supabase.from("vendors").select("id").eq("user_id", user.id);
      if (!vendors?.length) { setLoading(false); return; }
      const vids = vendors.map((v: any) => v.id);
      setVendorIds(vids);
      const { data } = await supabase.from("orders").select("*").in("vendor_id", vids).order("created_at", { ascending: false });
      setOrders(data || []);

      // Compter messages non lus par commande
      const { data: unread } = await supabase
        .from("messages")
        .select("order_id")
        .eq("sender_role", "buyer")
        .is("read_at", null);
      const counts: Record<string, number> = {};
      (unread || []).forEach((m: any) => { counts[m.order_id] = (counts[m.order_id] || 0) + 1; });
      setUnreadCounts(counts);

      setLoading(false);
      localStorage.setItem("vendor_last_seen_orders", new Date().toISOString());

      const channel = supabase.channel("vendor-orders")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
          if (!vids.includes(payload.new.vendor_id)) return;
          setOrders(prev => [payload.new as Order, ...prev]);
          setNewAlert(true);
          setTimeout(() => setNewAlert(false), 4000);
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
          if (!vids.includes(payload.new.vendor_id)) return;
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
          const msg = payload.new as any;
          if (msg.sender_role === "buyer") {
            setUnreadCounts(prev => ({ ...prev, [msg.order_id]: (prev[msg.order_id] || 0) + 1 }));
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    })();
  }, []);

  const openChat = (order: Order) => {
    setChatOrder(order);
    // Marquer les messages de cet acheteur comme lus
    setUnreadCounts(prev => ({ ...prev, [order.id]: 0 }));
    const supabase = createClient();
    supabase.from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("order_id", order.id)
      .eq("sender_role", "buyer")
      .is("read_at", null)
      .then(() => {});
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const supabase = createClient();
    const order = orders.find(o => o.id === id);
    await supabase.from("orders").update({ status }).eq("id", id);

    // 🔔 Notifier l acheteur du changement de statut
    if (order?.buyer_id) {
      const labels: Record<string, string> = {
        confirmed: "✅ Votre commande a ete confirmee !",
        delivered: "📦 Votre commande a ete livree !",
        cancelled: "❌ Votre commande a ete annulee",
      };
      const msg = labels[status];
      if (msg) {
        sendPushToUser(order.buyer_id, "KayJend", msg, "/user/commandes");
      }
    }
    if (status === "confirmed" && order?.items?.length) {
      for (const item of order.items) {
        const { data: p } = await supabase.from("products").select("stock").eq("id", item.id).single();
        if (p) await supabase.from("products").update({ stock: Math.max(0, (p.stock || 0) - item.qty) }).eq("id", item.id);
      }
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdating(null);
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === "Toutes" || o.status === FILTER_MAP[filter];
    const matchSearch = !search || o.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.delivery_address?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendingCount = orders.filter(o => o.status === "pending").length;

  if (loading) return <div className="flex justify-center py-24"><TbLoader2 className="text-[#2B3090] animate-spin" size={36} /></div>;

  

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

      {newAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2B3090] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <TbBell size={18} /> Nouvelle commande recue !
        </div>
      )}

      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors mb-4 group">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200"><TbArrowLeft size={17} /></div>
          Retour
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Commandes</h1>
            <p className="text-sm text-gray-500 mt-0.5">{orders.length} commande{orders.length > 1 ? "s" : ""}</p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <TbClock size={14} /> {pendingCount} en attente
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2B3090]/20" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={"flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all " +
              (filter === f ? "bg-[#2B3090] text-white" : "bg-white border border-gray-200 text-gray-500")}>
            {f}
            {f === "En attente" && pendingCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <TbShoppingBag className="text-gray-300 mx-auto mb-4" size={40} />
          <p className="text-gray-400 text-sm">Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
            const Icon = st.icon;
            const date = new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
            const unread = unreadCounts[order.id] || 0;
            return (
              <div key={order.id} className={"bg-white rounded-2xl shadow-sm overflow-hidden border " + (order.status === "pending" ? "border-amber-200" : "border-gray-100")}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#2B3090]/10 rounded-xl flex items-center justify-center">
                      <TbUser className="text-[#2B3090]" size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{order.buyer_name}</p>
                      <p className="text-xs text-gray-400">{date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={"flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold " + st.color}>
                      <Icon size={11} /> {st.label}
                    </span>
                    <p className="font-bold text-[#2B3090] text-sm">{fmt(order.total_price || order.total || 0)}</p>
                  </div>
                </div>

                <div className="px-5 py-3 space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">{item.name?.[0]}</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">x{item.qty} · {fmt(item.price)}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-700">{fmt(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>

                {order.delivery_address && (
                  <div className="mx-5 mb-3 bg-gray-50 rounded-xl px-4 py-2.5 text-xs text-gray-500">
                    📍 {order.delivery_address}
                  </div>
                )}
                {order.message && (
                  <div className="mx-5 mb-3 bg-blue-50 rounded-xl px-4 py-2.5 text-sm text-gray-600 italic">
                    "{order.message}"
                  </div>
                )}

                <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-50 flex-wrap">
                  {/* Lien Messages */}
                  <button onClick={() => router.push("/user/messages")}
                    className="relative flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-200">
                    <TbMessageCircle size={16} /> Messages
                  </button>

                  {order.buyer_phone && (
                    <button onClick={() => router.push("/user/messages")} className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-accent"><TbMessageCircle size={16} /> Chat</button>
                  )}
                  {order.status === "pending" && (
                    <button onClick={() => updateStatus(order.id, "confirmed")} disabled={updating === order.id}
                      className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-600 disabled:opacity-60">
                      {updating === order.id ? <TbLoader2 size={14} className="animate-spin" /> : <TbCheck size={14} />} Confirmer
                    </button>
                  )}
                  {order.status === "confirmed" && (
                    <button onClick={() => updateStatus(order.id, "delivered")} disabled={updating === order.id}
                      className="flex items-center gap-1.5 bg-[#2B3090] text-white text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-90 disabled:opacity-60">
                      {updating === order.id ? <TbLoader2 size={14} className="animate-spin" /> : <TbPackage size={14} />} Livree
                    </button>
                  )}
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <button onClick={() => updateStatus(order.id, "cancelled")} disabled={updating === order.id}
                      className="flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-red-100 disabled:opacity-60">
                      {updating === order.id ? <TbLoader2 size={14} className="animate-spin" /> : <TbX size={14} />} Annuler
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}