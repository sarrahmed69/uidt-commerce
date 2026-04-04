"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  TbArrowLeft, TbBrandWhatsapp, TbPackage, TbLoader2,
  TbTruck, TbTag, TbUser, TbMinus, TbPlus, TbCheck, TbX,
  TbShoppingBag, TbAlertCircle,
} from "react-icons/tb";

const formatPrice = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function ProduitDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ nom: "", phone: "", message: "" });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*, vendors(id, shop_name, wave_number)").eq("id", id).single();
      setProduct(data);
      if (data) await supabase.from("products").update({ views: (data.views || 0) + 1 }).eq("id", id as string);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleCommander = async () => {
    if (!form.nom.trim() || !form.phone.trim()) return;
    setSending(true);
    try {
      const supabase = createClient();

      // 1. Enregistrer la commande dans Supabase
      const { error } = await supabase.from("orders").insert([{
        vendor_id: product.vendor_id,
        buyer_name: form.nom.trim(),
        buyer_whatsapp: form.phone.trim(),
        whatsapp: form.phone.trim(),
        items: [{
          id: product.id,
          name: product.name,
          price: product.price,
          qty: qty,
          image: product.images?.[0] || "",
        }],
        total: product.price * qty,
        message: form.message.trim() || null,
        status: "pending",
      }], { count: "exact" });

      if (error) {
        console.error("Erreur commande:", error);
        alert("Erreur lors de la commande. Reessayez.");
        setSending(false);
        return;
      }

      // 2. Ouvrir WhatsApp si le vendeur a un numero
      const phone = (product.whatsapp_contact || product.vendors?.wave_number || "").replace(/\D/g, "");
      if (phone) {
        const msg = encodeURIComponent(
          "Bonjour ! J'ai passe une commande sur UIDT Commerce.\n\n" +
          "Produit : " + product.name + "\n" +
          "Quantite : " + qty + "\n" +
          "Total : " + formatPrice(product.price * qty) + "\n\n" +
          "Mon nom : " + form.nom + "\n" +
          "Mon tel : " + form.phone +
          (form.message ? "\n\nMessage : " + form.message : "") +
          "\n\nMerci de confirmer ma commande !"
        );
        window.open("https://wa.me/" + phone + "?text=" + msg, "_blank");
      }

      setSuccess(true);
      setSending(false);
    } catch (e) {
      console.error(e);
      setSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <TbLoader2 className="animate-spin text-primary" size={36} />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <TbPackage className="text-gray-300" size={60} />
      <p className="text-gray-500">Produit introuvable</p>
      <Link href="/produits" className="text-primary underline text-sm">Retour aux produits</Link>
    </div>
  );

  const images = product.images || [];
  const outOfStock = product.stock !== null && product.stock <= 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Modal Commander */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!sending) { setShowModal(false); setSuccess(false); }}} />
          <div className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">

            {success ? (
              /* Ecran succes */
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <TbCheck className="text-green-600" size={40} />
                </div>
                <h3 className="font-bold text-gray-900 text-xl">Commande envoyee !</h3>
                <p className="text-gray-500 text-sm">
                  Votre commande a ete enregistree. Le vendeur va la confirmer sous peu.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-xs text-yellow-700">
                  Le stock sera mis a jour quand le vendeur confirme votre commande.
                </div>
                <button onClick={() => { setShowModal(false); setSuccess(false); setForm({ nom: "", phone: "", message: "" }); }}
                  className="w-full bg-[#0a2a1f] text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                  Fermer
                </button>
              </div>
            ) : (
              <>
                {/* Header modal */}
                <div className="bg-[#0a2a1f] px-6 pt-6 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <TbShoppingBag className="text-white" size={22} />
                    </div>
                    <button onClick={() => setShowModal(false)}
                      className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors">
                      <TbX size={16} />
                    </button>
                  </div>
                  <h3 className="text-white font-bold text-xl">Passer une commande</h3>
                  <p className="text-white/60 text-sm mt-1">Remplissez vos informations pour commander</p>

                  {/* Recap */}
                  <div className="mt-4 bg-white/10 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                      {images[0]
                        ? <img src={images[0]} alt="" className="w-full h-full object-cover" />
                        : <TbPackage className="text-white/40 m-2.5" size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                      <p className="text-white/60 text-xs">x{qty} · {formatPrice(product.price * qty)}</p>
                    </div>
                    <p className="text-white font-bold text-sm flex-shrink-0">{formatPrice(product.price * qty)}</p>
                  </div>
                </div>

                {/* Formulaire */}
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Prenom et Nom <span className="text-red-500">*</span></label>
                    <input
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      placeholder="Ex: Cheikh Fall"
                      value={form.nom}
                      onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Telephone WhatsApp <span className="text-red-500">*</span></label>
                    <input
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      placeholder="+221 77 123 45 67"
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Message (optionnel)</label>
                    <textarea
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                      placeholder="Ex: Livraison au batiment B7 chambre 204..."
                      rows={2}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setShowModal(false)}
                      className="flex-1 border border-gray-200 py-3 rounded-xl text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors">
                      Annuler
                    </button>
                    <button onClick={handleCommander}
                      disabled={!form.nom.trim() || !form.phone.trim() || sending}
                      className="flex-1 bg-[#0a2a1f] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
                      {sending
                        ? <TbLoader2 size={16} className="animate-spin" />
                        : <TbShoppingBag size={16} />}
                      {sending ? "Envoi..." : "Commander"}
                    </button>
                  </div>

                  <p className="text-xs text-center text-gray-400">
                    Le vendeur recevra votre commande et vous contactera pour confirmer
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <TbArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-gray-800 truncate">{product.name}</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Images */}
        <div>
          <div className="bg-white rounded-2xl overflow-hidden aspect-square flex items-center justify-center shadow-sm mb-3">
            {images[imgIdx]
              ? <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              : <TbPackage className="text-gray-200" size={80} />}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={"w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors " + (i === imgIdx ? "border-primary" : "border-transparent")}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            {product.category && (
              <span className="text-xs bg-orange-100 text-primary px-2 py-1 rounded-full font-medium">
                <TbTag className="inline mr-1" size={12} />{product.category}
              </span>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mt-2">{product.name}</h2>
            <p className="text-3xl font-bold text-primary mt-2">{formatPrice(product.price)}</p>

            {/* Stock */}
            {product.stock !== null && (
              <div className={"flex items-center gap-1.5 mt-2 text-sm font-medium " + (outOfStock ? "text-red-500" : product.stock <= 3 ? "text-orange-500" : "text-gray-400")}>
                {outOfStock
                  ? <><TbAlertCircle size={15} /> Rupture de stock</>
                  : product.stock <= 3
                    ? <><TbAlertCircle size={15} /> Plus que {product.stock} en stock</>
                    : <>{product.stock} en stock</>}
              </div>
            )}

            {product.delivery_available && (
              <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                <TbTruck size={16} /><span>Livraison campus disponible</span>
              </div>
            )}
          </div>

          {product.description && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.vendors?.shop_name && (
            <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0a2a1f]/10 rounded-xl flex items-center justify-center font-bold text-[#0a2a1f]">
                {product.vendors.shop_name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{product.vendors.shop_name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><TbCheck size={11} className="text-green-500" /> Vendeur verifie</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            {/* Quantite */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quantite</span>
              <div className="flex items-center gap-3 border border-gray-200 rounded-full px-4 py-2">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={outOfStock}
                  className="text-gray-500 hover:text-primary transition-colors disabled:opacity-30">
                  <TbMinus size={16} />
                </button>
                <span className="font-bold text-gray-800 w-5 text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} disabled={outOfStock}
                  className="text-gray-500 hover:text-primary transition-colors disabled:opacity-30">
                  <TbPlus size={16} />
                </button>
              </div>
            </div>

            {qty > 1 && (
              <div className="flex justify-between text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5">
                <span>Total ({qty} articles)</span>
                <span className="font-bold text-gray-800">{formatPrice(product.price * qty)}</span>
              </div>
            )}

            {outOfStock ? (
              <div className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base cursor-not-allowed">
                <TbAlertCircle size={20} /> Rupture de stock
              </div>
            ) : (
              <button onClick={() => setShowModal(true)}
                className="w-full bg-[#0a2a1f] hover:opacity-90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-opacity text-base">
                <TbShoppingBag size={22} /> Commander — {formatPrice(product.price * qty)}
              </button>
            )}

            <p className="text-xs text-center text-gray-400">
              Le vendeur confirmera votre commande et vous contactera
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}