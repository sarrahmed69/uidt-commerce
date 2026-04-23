"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TbArrowLeft, TbTrash, TbMinus, TbPlus,
  TbShoppingBag, TbBuildingStore, TbLoader2,
  TbPhone, TbLock, TbUserPlus, TbX, TbUser, TbMapPin,
  TbHome, TbCheck, TbAlertCircle,
} from "react-icons/tb";
import { useCartStore } from "@/lib/zustand/cart-store";
import { sendPushToUser } from "@/lib/push/client";
import { createClient } from "@/lib/supabase/client";

const formatPrice = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

const CAMPUS_SITES = ["VCN", "Hotel du Rail", "Hors Campus"];
const VCN_PAVILLONS = ["Pavillon A", "Pavillon B"];

export default function CartMain() {
  const { items, updateQty, removeItem, clearCart, total } = useCartStore();
  const [ordering, setOrdering] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const router = useRouter();
  const totalAmount = total();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [site, setSite] = useState("");
  const [pavillon, setPavillon] = useState("");
  const [chambre, setChambre] = useState("");
  const [hotelChambre, setHotelChambre] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        const name = data.user.user_metadata?.full_name || data.user.user_metadata?.firstName || "";
        if (name) setNom(name);
      }
    });
  }, []);

  const getAdresse = () => {
    if (site === "Hors Campus") return "Hors Campus";
    if (site === "Hotel du Rail") return `Hotel du Rail — Chambre ${hotelChambre}`;
    if (site === "VCN") return `VCN — ${pavillon} — Chambre ${chambre}`;
    return "";
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!nom.trim()) errors.nom = "Le nom complet est obligatoire";
    if (!telephone.trim()) errors.telephone = "Le numero de telephone est obligatoire";
    else if (!/^(\+221|00221)?[0-9]{9}$/.test(telephone.replace(/\s/g, "")))
      errors.telephone = "Numero invalide (ex: 77 123 45 67)";
    if (!site) errors.site = "Choisissez votre campus";
    if (site === "VCN") {
      if (!pavillon) errors.pavillon = "Choisissez un pavillon";
      if (!chambre) errors.chambre = "Entrez votre numero de chambre";
      else if (parseInt(chambre) < 1 || parseInt(chambre) > 60)
        errors.chambre = "La chambre doit etre entre 1 et 60";
    }
    if (site === "Hotel du Rail") {
      if (!hotelChambre) errors.hotelChambre = "Choisissez votre chambre";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCommander = async () => {
    if (!items.length) return;
    if (!user) { setShowAuthModal(true); return; }
    if (!validate()) return;
    setOrdering(true);
    try {
      const supabase = createClient();
      const adresse = getAdresse();

      // 1) Decrementer le stock
      for (const item of items) {
        const { data: prod } = await supabase.from("products").select("stock").eq("id", item.id).single();
        if (prod) await supabase.from("products").update({ stock: Math.max(0, (prod.stock || 0) - item.qty) }).eq("id", item.id);
      }

      // 2) Grouper par vendeur
      const vendorGroups: Record<string, typeof items> = {};
      for (const item of items) {
        if (!vendorGroups[item.vendorId]) vendorGroups[item.vendorId] = [];
        vendorGroups[item.vendorId].push(item);
      }

      for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
        const orderTotal = vendorItems.reduce((s, i) => s + i.price * i.qty, 0);

        const orderData: any = {
          vendor_id: vendorId,
          user_id: user?.id || null,
          buyer_id: user?.id || null,
          buyer_name: nom.trim(),
          buyer_whatsapp: telephone.trim(),
          items: vendorItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
          total: orderTotal,
          total_amount: orderTotal,
          message: message || null,
          status: "pending",
        };

        if (site === "Hors Campus") {
          orderData.delivery_off_campus = "Hors Campus";
        } else if (site === "VCN") {
          orderData.delivery_campus = "VCN";
          orderData.delivery_pavillon = pavillon;
          orderData.delivery_room = parseInt(chambre);
        } else if (site === "Hotel du Rail") {
          orderData.delivery_campus = "Hotel du Rail";
          orderData.delivery_pavillon = "A";
          orderData.delivery_room = parseInt(hotelChambre.replace("A", ""));
        }

        // 3) Creer la commande
        const { error } = await supabase.from("orders").insert(orderData);
        if (error) {
          console.error("Erreur insertion commande:", error);
          throw error;
        }

        // 4) Recuperer info vendeur
        const { data: vendorData } = await supabase.from("vendors").select("user_id, shop_name").eq("id", vendorId).single();
        const vendorUserId = vendorData?.user_id;
        const shopName = vendorData?.shop_name || "la boutique";

        if (vendorUserId) {
          // 5) Creer ou retrouver la conversation
          const firstItem = vendorItems[0];
          const { data: existingConv } = await supabase.from("conversations")
            .select("id, unread_vendor, unread_buyer")
            .eq("buyer_id", user.id)
            .eq("vendor_id", vendorId)
            .eq("produit_id", firstItem.id)
            .maybeSingle();

          let convId = existingConv?.id;
          let unreadVendor = existingConv?.unread_vendor || 0;
          let unreadBuyer = existingConv?.unread_buyer || 0;

          if (!convId) {
            const { data: newConv } = await supabase.from("conversations").insert({
              buyer_id: user.id,
              vendor_id: vendorId,
              produit_id: firstItem.id,
              last_message_at: new Date().toISOString(),
            }).select("id").single();
            convId = newConv?.id;
          }

          if (convId) {
            // 6) Message de commande (acheteur -> vendeur)
            const orderMessage =
              "🛒 NOUVELLE COMMANDE\n\n" +
              vendorItems.map(i => "• " + i.name + " x" + i.qty + " = " + formatPrice(i.price * i.qty)).join("\n") +
              "\n\n💰 Total : " + formatPrice(orderTotal) +
              "\n👤 Client : " + nom +
              "\n📞 Tel : " + telephone +
              "\n📍 Livraison : " + adresse +
              (message ? "\n💬 Message : " + message : "");

            await supabase.from("messages").insert({
              conversation_id: convId,
              expediteur_id: user.id,
              destinataire_id: vendorUserId,
              contenu: orderMessage,
              est_lu: false,
            });

            // 7) Message automatique (vendeur -> acheteur)
            await supabase.from("messages").insert({
              conversation_id: convId,
              expediteur_id: vendorUserId,
              destinataire_id: user.id,
              contenu: "✅ Votre commande chez " + shopName + " a bien ete recue !\n\nLe vendeur va la confirmer dans les plus brefs delais.",
              est_lu: false,
            });

            // 8) Mettre a jour la conversation
            await supabase.from("conversations").update({
              last_message: "🛒 Nouvelle commande — " + formatPrice(orderTotal),
              last_message_at: new Date().toISOString(),
              unread_vendor: unreadVendor + 1,
              unread_buyer: unreadBuyer + 1,
            }).eq("id", convId);
          }

          // 9) 🔔 Notification push au vendeur
          try {
            await sendPushToUser(
              vendorUserId,
              "🛒 Nouvelle commande KayJend !",
              nom + " a commande pour " + formatPrice(orderTotal),
              "/vendor/commandes"
            );
          } catch (err) {
            console.error("Push notif error:", err);
          }
        }
      }

      clearCart();
      setOrderSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setOrdering(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
      formErrors[field] ? "border-red-300 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-primary/20"
    }`;

  if (orderSuccess) return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TbCheck className="text-green-600" size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Commande envoyee !</h2>
        <p className="text-gray-500 text-sm mb-2">Le vendeur a recu votre commande et va vous repondre sur la messagerie KayJend.</p>
        <p className="text-xs text-gray-400 mb-6">Livraison a : <span className="font-semibold text-gray-600">{getAdresse()}</span></p>
        <div className="flex flex-col gap-2">
          <Link href="/user/messages" className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-accent transition-colors">
            Voir mes messages
          </Link>
          <Link href="/user/commandes" className="border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary/5 transition-colors">
            Mes commandes
          </Link>
          <Link href="/produits" className="text-gray-500 text-sm mt-2 hover:text-primary">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f4]">

      {/* Modal connexion */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-primary px-6 pt-6 pb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <TbLock className="text-white" size={22} />
                </div>
                <button onClick={() => setShowAuthModal(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20">
                  <TbX size={16} />
                </button>
              </div>
              <h3 className="text-white font-bold text-xl">Connexion requise</h3>
              <p className="text-white/70 text-sm mt-1">Connectez-vous pour finaliser votre commande.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              {items.slice(0, 3).map(i => (
                <div key={i.id} className="flex justify-between text-xs text-gray-600 mb-1">
                  <span className="truncate flex-1 mr-2">{i.name} x{i.qty}</span>
                  <span className="font-semibold">{formatPrice(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm text-gray-800 mt-2 pt-2 border-t border-gray-200">
                <span>Total</span><span className="text-primary">{formatPrice(totalAmount)}</span>
              </div>
            </div>
            <div className="px-6 py-5 space-y-3">
              <button onClick={() => router.push("/auth/sign-in?redirect=/cart")}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-accent transition-colors">
                <TbLock size={18} /> Se connecter
              </button>
              <button onClick={() => router.push("/auth/sign-up?redirect=/cart")}
                className="w-full border-2 border-primary text-primary font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                <TbUserPlus size={18} /> Creer un compte gratuit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/produits" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <TbArrowLeft size={20} />
        </Link>
        <span className="text-sm text-primary font-semibold">Continuer mes achats</span>
        {!user && (
          <Link href="/auth/sign-in?redirect=/cart" className="ml-auto text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
            <TbLock size={13} /> Se connecter
          </Link>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Mon panier
          {items.length > 0 && <span className="text-base text-gray-400 font-normal ml-2">({items.length} article{items.length > 1 ? "s" : ""})</span>}
        </h1>

        {!user && items.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <TbLock className="text-amber-500 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Connexion requise pour commander</p>
              <p className="text-xs text-amber-600">Connectez-vous pour finaliser votre commande.</p>
            </div>
            <Link href="/auth/sign-in?redirect=/cart" className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold whitespace-nowrap">Se connecter</Link>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <TbShoppingBag className="text-gray-200 mx-auto mb-4" size={60} />
            <p className="font-semibold text-gray-500 mb-4">Votre panier est vide</p>
            <Link href="/produits" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm inline-block">Voir les produits</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

            {/* Gauche */}
            <div className="space-y-3">

              {/* Articles */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {items.map((item, idx) => (
                  <div key={item.id} className={idx < items.length - 1 ? "border-b border-gray-100" : ""}>
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                      <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center text-primary font-bold text-xs">{item.vendeur?.[0] ?? "V"}</div>
                      <TbBuildingStore size={13} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">{item.vendeur}</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">{item.name?.[0]}</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                        <p className="text-primary font-bold text-sm mt-0.5">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2 border border-gray-200 rounded-full px-3 py-1 w-fit">
                          <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-primary"><TbMinus size={13} /></button>
                          <span className="text-sm font-bold text-gray-800 w-5 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:text-primary"><TbPlus size={13} /></button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400"><TbTrash size={17} /></button>
                        <p className="text-sm font-bold text-gray-700">{formatPrice(item.price * item.qty)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-500 font-medium">Vider le panier</button>

              {/* Formulaire */}
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <div>
                  <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <TbUser className="text-primary" size={18} /> Informations de livraison <span className="text-red-500">*</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Tous les champs sont obligatoires</p>
                </div>

                {/* Nom */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nom complet <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <TbUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input className={inputClass("nom") + " pl-9"} placeholder="Ex: Cheikh Oumar Fall"
                      value={nom} onChange={e => { setNom(e.target.value); setFormErrors(p => ({...p, nom: ""})); }} />
                  </div>
                  {formErrors.nom && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><TbAlertCircle size={12} />{formErrors.nom}</p>}
                </div>

                {/* Telephone */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Numero de telephone <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <TbPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input className={inputClass("telephone") + " pl-9"} placeholder="Ex: 77 123 45 67" type="tel"
                      value={telephone} onChange={e => { setTelephone(e.target.value); setFormErrors(p => ({...p, telephone: ""})); }} />
                  </div>
                  {formErrors.telephone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><TbAlertCircle size={12} />{formErrors.telephone}</p>}
                </div>

                {/* Site */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Campus / Site <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {CAMPUS_SITES.map(s => (
                      <button key={s} type="button"
                        onClick={() => { setSite(s); setPavillon(""); setChambre(""); setHotelChambre(""); setFormErrors(p => ({...p, site: "", pavillon: "", chambre: "", hotelChambre: ""})); }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all text-center leading-tight ${
                          site === s ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}>
                        <TbHome className="mx-auto mb-0.5" size={14} />
                        {s}
                      </button>
                    ))}
                  </div>
                  {formErrors.site && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><TbAlertCircle size={12} />{formErrors.site}</p>}
                </div>

                {/* VCN : Pavillon + Chambre 1-60 */}
                {site === "VCN" && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Pavillon <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        {VCN_PAVILLONS.map(p => (
                          <button key={p} type="button"
                            onClick={() => { setPavillon(p); setFormErrors(prev => ({...prev, pavillon: ""})); }}
                            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              pavillon === p ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      {formErrors.pavillon && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><TbAlertCircle size={12} />{formErrors.pavillon}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Numero de chambre (1 - 60) <span className="text-red-500">*</span></label>
                      <input className={inputClass("chambre")} placeholder="Ex: 24" type="number" min="1" max="60"
                        value={chambre} onChange={e => { setChambre(e.target.value); setFormErrors(p => ({...p, chambre: ""})); }} />
                      {formErrors.chambre && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><TbAlertCircle size={12} />{formErrors.chambre}</p>}
                    </div>
                  </>
                )}

                {/* Hotel du Rail : A1 a A50 */}
                {site === "Hotel du Rail" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Numero de chambre <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {Array.from({ length: 50 }, (_, i) => `A${i + 1}`).map(c => (
                        <button key={c} type="button"
                          onClick={() => { setHotelChambre(c); setFormErrors(p => ({...p, hotelChambre: ""})); }}
                          className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                            hotelChambre === c ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-primary/5"
                          }`}>
                          {c}
                        </button>
                      ))}
                    </div>
                    {formErrors.hotelChambre && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><TbAlertCircle size={12} />{formErrors.hotelChambre}</p>}
                  </div>
                )}

                {/* Apercu adresse */}
                {site && (site === "Hors Campus" || (site === "VCN" && pavillon) || (site === "Hotel du Rail" && hotelChambre)) && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-2">
                    <TbMapPin className="text-primary flex-shrink-0" size={16} />
                    <p className="text-xs text-primary font-semibold">{getAdresse()}</p>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Message au vendeur (optionnel)</label>
                  <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    rows={2} placeholder="Ex: Je suis disponible de 14h a 18h..." value={message} onChange={e => setMessage(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Droite : recap */}
            <div className="space-y-3">
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                <h2 className="font-bold text-gray-800">Recapitulatif</h2>
                <div className="space-y-2">
                  {items.map(i => (
                    <div key={i.id} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate flex-1 mr-4">{i.name} <span className="text-gray-400">x{i.qty}</span></span>
                      <span className="whitespace-nowrap font-medium">{formatPrice(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1">
                  <div className="flex justify-between text-sm text-gray-500"><span>Sous-total</span><span>{formatPrice(totalAmount)}</span></div>
                  <div className="flex justify-between text-sm text-gray-500"><span>Livraison</span><span className="text-primary font-semibold">A convenir</span></div>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span><span className="text-primary">{formatPrice(totalAmount)}</span>
                </div>
                <button onClick={handleCommander} disabled={ordering}
                  className="w-full bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70">
                  {ordering ? <><TbLoader2 size={20} className="animate-spin" /> Envoi...</>
                    : user ? <><TbShoppingBag size={20} /> Passer commande</>
                    : <><TbLock size={20} /> Se connecter pour commander</>}
                </button>
                {!user && (
                  <Link href="/auth/sign-up?redirect=/cart"
                    className="w-full border-2 border-primary text-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors text-sm">
                    <TbUserPlus size={18} /> Creer un compte gratuit
                  </Link>
                )}
                <p className="text-xs text-center text-gray-400">{user ? "Commande envoyee sur KayJend." : "Inscription gratuite — moins de 1 minute."}</p>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 mb-2 text-center">Paiements acceptes</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg">Cash</span>
                    <span className="bg-[#0070E0] text-white text-xs font-bold px-3 py-1.5 rounded-lg">Wave</span>
                    <span className="bg-[#FF6600] text-white text-xs font-bold px-3 py-1.5 rounded-lg">Orange Money</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}