"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  TbShoppingBag, TbLoader2, TbClock, TbCheck, TbX,
  TbTruck, TbArrowLeft, TbMessageCircle, TbMapPin,
  TbUser, TbPhone, TbCalendar,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: "En attente", color: "bg-amber-100 text-amber-700",     icon: TbClock },
  confirmed: { label: "Confirmee",  color: "bg-blue-100 text-blue-700",       icon: TbCheck },
  delivered: { label: "Livree",     color: "bg-emerald-100 text-emerald-700", icon: TbTruck },
  cancelled: { label: "Annulee",    color: "bg-red-100 text-red-500",         icon: TbX },
};

// Construire l'adresse depuis les champs separes
const buildAddress = (order: any) => {
  if (order.delivery_address) return order.delivery_address;
  if (order.delivery_off_campus) return order.delivery_off_campus;
  if (order.delivery_campus && order.delivery_room) {
    if (order.delivery_campus === "VCN" && order.delivery_pavillon) {
      return `VCN — ${order.delivery_pavillon} — Chambre ${order.delivery_room}`;
    }
    if (order.delivery_campus === "Hotel du Rail") {
      return `Hotel du Rail — Chambre A${order.delivery_room}`;
    }
    return `${order.delivery_campus} — Chambre ${order.delivery_room}`;
  }
  return null;
};

export default function UserCommandes() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }

      const { data } = await supabase
        .from("orders")
        .select("*, vendors(id, shop_name, wave_number)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);

      // Temps reel : rafraichir si statut change
      const channel = supabase.channel("buyer-orders-" + user.id)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `buyer_id=eq.${user.id}` }, (payload) => {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    })();
  }, []);

  const openMessages = async (order: any) => {
    // Trouver la conversation liee a ce vendeur
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !order.vendor_id) { router.push("/user/messages"); return; }
    const { data: conv } = await supabase.from("conversations")
      .select("id").eq("buyer_id", user.id).eq("vendor_id", order.vendor_id).limit(1).maybeSingle();
    if (conv?.id) router.push(`/user/messages?conv=${conv.id}`);
    else router.push("/user/messages");
  };

  if (loading) return <div className="flex justify-center py-24"><TbLoader2 className="text-primary animate-spin" size={36} /></div>;

  const stats = {
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-4 group">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200"><TbArrowLeft size={17} /></div>
          Retour
        </button>
        <h1 className="text-xl font-bold text-gray-900">Mes commandes</h1>
        <p className="text-sm text-gray-500 mt-0.5">{orders.length} commande{orders.length > 1 ? "s" : ""}</p>
      </div>

      {/* Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-700">{stats.pending}</p>
            <p className="text-[10px] text-amber-600 uppercase tracking-wider mt-0.5">En attente</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-700">{stats.confirmed}</p>
            <p className="text-[10px] text-blue-600 uppercase tracking-wider mt-0.5">Confirmees</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-700">{stats.delivered}</p>
            <p className="text-[10px] text-emerald-600 uppercase tracking-wider mt-0.5">Livrees</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-red-500">{stats.cancelled}</p>
            <p className="text-[10px] text-red-500 uppercase tracking-wider mt-0.5">Annulees</p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <TbShoppingBag className="text-gray-200 mx-auto mb-4" size={50} />
          <p className="font-semibold text-gray-500 mb-4">Aucune commande pour l instant</p>
          <button onClick={() => router.push("/produits")} className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold">
            Voir les produits
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
            const Icon = st.icon;
            const date = new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
            const adresse = buildAddress(order);
            const orderTotal = order.total || order.total_amount || order.total_price || 0;
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{order.vendors?.shop_name || "Boutique"}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <TbCalendar size={11} /> {date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={"flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold " + st.color}>
                      <Icon size={11} /> {st.label}
                    </span>
                    <p className="font-bold text-primary text-sm">{fmt(orderTotal)}</p>
                  </div>
                </div>

                {/* Produits */}
                <div className="px-5 py-3 space-y-2">
                  {order.items?.map((item: any, i: number) => (
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

                {/* Infos livraison */}
                <div className="mx-5 mb-3 space-y-1.5">
                  {adresse && (
                    <div className="bg-gray-50 rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-gray-600">
                      <TbMapPin size={13} className="text-primary flex-shrink-0" />
                      <span className="font-medium">{adresse}</span>
                    </div>
                  )}
                  {order.buyer_whatsapp && (
                    <div className="bg-gray-50 rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-gray-600">
                      <TbPhone size={13} className="text-primary flex-shrink-0" />
                      <span>{order.buyer_whatsapp}</span>
                    </div>
                  )}
                  {order.message && (
                    <div className="bg-blue-50 rounded-xl px-4 py-2 text-xs text-gray-600 italic">
                      💬 {order.message}
                    </div>
                  )}
                </div>

                {/* Messages du statut */}
                {order.status === "pending" && (
                  <div className="mx-5 mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700">
                    ⏳ En attente de confirmation du vendeur
                  </div>
                )}
                {order.status === "confirmed" && (
                  <div className="mx-5 mb-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-700">
                    ✅ Commande confirmee ! En preparation...
                  </div>
                )}
                {order.status === "delivered" && (
                  <div className="mx-5 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-700">
                    📦 Commande livree avec succes
                  </div>
                )}
                {order.status === "cancelled" && (
                  <div className="mx-5 mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-700">
                    ❌ Commande annulee
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 py-3 border-t border-gray-50">
                  <button onClick={() => openMessages(order)}
                    className="flex items-center gap-2 bg-primary/5 border border-primary/20 text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors">
                    <TbMessageCircle size={18} /> Discuter avec le vendeur
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}