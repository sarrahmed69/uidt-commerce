"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { TbStar, TbLoader2, TbCheck, TbX } from "react-icons/tb";
import Link from "next/link";

export default function AvisPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: o } = await supabase.from("orders").select("*, vendors(id, shop_name)").eq("id", id).maybeSingle();
      if (!o) { setError("Commande introuvable"); setLoading(false); return; }
      if (o.status !== "delivered") { setError("Vous pouvez laisser un avis uniquement apres livraison"); setLoading(false); return; }
      const { data: existing } = await supabase.from("reviews").select("id").eq("order_id", id).maybeSingle();
      if (existing) { setAlreadyReviewed(true); setLoading(false); return; }
      setOrder(o);
      setLoading(false);
    })();
  }, [id]);

  const submit = async () => {
    if (!rating) { alert("Choisissez une note !"); return; }
    setSubmitting(true);
    const supabase = createClient();
    const items = order.items || [];
    const productId = items[0]?.id || null;
    await supabase.from("reviews").insert({
      order_id: order.id,
      vendor_id: order.vendor_id,
      product_id: productId,
      buyer_name: order.buyer_name,
      buyer_whatsapp: order.whatsapp,
      rating,
      comment: comment.trim() || null,
    });
    setDone(true);
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><TbLoader2 className="animate-spin text-primary" size={36} /></div>;

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"><TbX className="text-red-500" size={32} /></div>
      <p className="text-gray-700 font-semibold text-center">{error}</p>
      <Link href="/" className="text-primary text-sm underline">Retour a laccueil</Link>
    </div>
  );

  if (alreadyReviewed) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"><TbCheck className="text-blue-500" size={32} /></div>
      <p className="text-gray-700 font-semibold text-center">Vous avez deja laisse un avis pour cette commande</p>
      <Link href="/produits" className="text-primary text-sm underline">Voir les produits</Link>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <TbCheck className="text-green-500" size={40} />
      </div>
      <h2 className="text-2xl font-black text-gray-900">Merci !</h2>
      <p className="text-gray-500 text-center">Votre avis a ete publie avec succes.</p>
      <div className="flex gap-3">
        {[1,2,3,4,5].map(s => <TbStar key={s} size={28} className={s <= rating ? "text-yellow-400" : "text-gray-200"} fill={s <= rating ? "#FBBF24" : "none"} />)}
      </div>
      <Link href="/produits" className="bg-[#2B3090] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1e2570]">Voir les produits</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#2B3090] to-[#1e2570] p-6 text-center">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Votre avis</p>
          <h2 className="text-white text-xl font-black">{order.vendors?.shop_name || "La boutique"}</h2>
          <p className="text-white/50 text-xs mt-1">Commande de {order.buyer_name}</p>
          <div className="mt-3 bg-white/10 rounded-xl px-4 py-2 text-white/70 text-xs">
            {(order.items || []).map((i: any) => i.name).join(", ")}
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 mb-3">Quelle note donnez-vous ?</p>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
                  <TbStar size={36} className={"transition-colors " + (s <= (hover || rating) ? "text-yellow-400" : "text-gray-200")} fill={s <= (hover || rating) ? "#FBBF24" : "none"} />
                </button>
              ))}
            </div>
            {rating > 0 && <p className="text-xs text-gray-400 mt-2">{["","Tres mauvais","Mauvais","Moyen","Bien","Excellent !"][rating]}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Commentaire (optionnel)</label>
            <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2B3090]/20 focus:border-[#2B3090] transition-all resize-none"
              placeholder="Decrivez votre experience..." value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          <button onClick={submit} disabled={submitting || !rating}
            className="w-full bg-[#2B3090] hover:bg-[#1e2570] disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg">
            {submitting ? <TbLoader2 size={18} className="animate-spin" /> : <TbStar size={18} />}
            Publier mon avis
          </button>
        </div>
      </div>
    </div>
  );
}