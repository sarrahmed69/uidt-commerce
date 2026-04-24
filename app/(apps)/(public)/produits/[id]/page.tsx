"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  TbArrowLeft, TbPackage, TbLoader2,
  TbTruck, TbTag, TbMinus, TbPlus, TbCheck, TbX,
  TbShoppingBag, TbAlertCircle, TbShare, TbHeart,
  TbStar, TbStarFilled, TbMessageCircle, TbSend,
  TbPhone, TbUser, TbMapPin, TbHome, TbLock,
} from "react-icons/tb";

const formatPrice = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

const CAMPUS_SITES = ["VCN", "Hotel du Rail", "Hors Campus"];
const VCN_PAVILLONS = ["Pavillon A", "Pavillon B"];

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(s => (
      <button key={s} onClick={() => onChange(s)} type="button">
        {s <= value
          ? <TbStarFilled size={28} className="text-yellow-400" />
          : <TbStar size={28} className="text-gray-300 hover:text-yellow-300 transition-colors" />}
      </button>
    ))}
  </div>
);

const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      s <= Math.round(rating)
        ? <TbStarFilled key={s} size={size} className="text-yellow-400" />
        : <TbStar key={s} size={size} className="text-gray-200" />
    ))}
  </div>
);

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
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);

  // Formulaire commande
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [site, setSite] = useState("");
  const [pavillon, setPavillon] = useState("");
  const [chambre, setChambre] = useState("");
  const [hotelChambre, setHotelChambre] = useState("");
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*, vendors(id, shop_name, wave_number, logo_url)").eq("id", id).single();
      setProduct(data);
      if (data) await supabase.from("products").update({ views: (data.views || 0) + 1 }).eq("id", id as string);
      const { data: revs } = await supabase.from("reviews").select("*").eq("product_id", id).order("created_at", { ascending: false });
      setReviews(revs || []);
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.firstName || "";
        if (name) setNom(name);
      }
      setLoading(false);
    };
    load();
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setLiked(favs.includes(id));
  }, [id]);

  const avgRating = reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  const getAdresse = () => {
    if (site === "Hors Campus") return "Hors Campus";
    if (site === "Hotel du Rail") return `Hotel du Rail — Chambre ${hotelChambre}`;
    if (site === "VCN") return `VCN — ${pavillon} — Chambre ${chambre}`;
    return "";
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!nom.trim()) errors.nom = "Le nom est obligatoire";
    if (!telephone.trim()) errors.telephone = "Le telephone est obligatoire";
    if (!site) errors.site = "Choisissez votre campus";
    if (site === "VCN") {
      if (!pavillon) errors.pavillon = "Choisissez un pavillon";
      if (!chambre) errors.chambre = "Entrez votre numero de chambre";
      else if (parseInt(chambre) < 1 || parseInt(chambre) > 60) errors.chambre = "Entre 1 et 60";
    }
    if (site === "Hotel du Rail" && !hotelChambre) errors.hotelChambre = "Choisissez votre chambre";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReview = async () => {
    setReviewError("");
    if (!userId) { setReviewError("Connectez-vous pour laisser un avis."); return; }
    if (reviewForm.rating === 0) { setReviewError("Choisissez une note."); return; }
    setReviewSending(true);
    const supabase = createClient();
    const already = reviews.find(r => r.user_id === userId);
    if (already) { setReviewError("Vous avez deja laisse un avis pour ce produit."); setReviewSending(false); return; }
    const { error } = await supabase.from("reviews").insert({
      product_id: id, user_id: userId, rating: reviewForm.rating, comment: reviewForm.comment.trim() || null,
    });
    if (error) { setReviewError("Erreur. Reessayez."); setReviewSending(false); return; }
    const { data: revs } = await supabase.from("reviews").select("*").eq("product_id", id).order("created_at", { ascending: false });
    setReviews(revs || []);
    setReviewForm({ rating: 0, comment: "" });
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
    setReviewSending(false);
  };

  const getPrice = (p: any) => p?.promo_price && p?.promo_ends_at && new Date(p.promo_ends_at) > new Date() ? p.promo_price : p?.price;

  const toggleLike = () => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavs = liked ? favs.filter((f: string) => f !== id) : [...favs, id];
    localStorage.setItem("favorites", JSON.stringify(newFavs));
    setLiked(!liked);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product?.name, text: "Regardez ce produit sur KayJend !", url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleCommander = async () => {
    if (!userId) {
      router.push("/auth/sign-in?redirect=" + encodeURIComponent(window.location.pathname) + "&role=buyer");
      return;
    }
    if (!validate()) return;
    setSending(true);
    try {
      const supabase = createClient();
      const finalPrice = getPrice(product);
      const adresse = getAdresse();
      const { error } = await supabase.from("orders").insert([{
        vendor_id: product.vendor_id,
        buyer_id: userId,
        buyer_name: nom.trim(),
        buyer_phone: telephone.trim(),
        delivery_address: adresse,
        items: [{ id: product.id, name: product.name, price: finalPrice, qty, image: product.images?.[0] || "" }],
        total: finalPrice * qty,
        message: message.trim() || null,
        status: "pending",
        whatsapp: product.vendors?.wave_number || null,
      }]);
      if (error) { alert("Erreur lors de la commande. Reessayez."); setSending(false); return; }

      // Mettre a jour le stock
      const { data: prod } = await supabase.from("products").select("stock").eq("id", product.id).single();
      if (prod) await supabase.from("products").update({ stock: Math.max(0, (prod.stock || 0) - qty) }).eq("id", product.id);

      // Envoyer WhatsApp au vendeur
      const phone = (product.vendors?.wave_number || "").replace(/\D/g, "");
      if (phone) {
        const msg = encodeURIComponent(
          `Bonjour ! Nouvelle commande KayJend.\n\n` +
          `Produit : ${product.name}\n` +
          `Quantite : ${qty}\n` +
          `Total : ${formatPrice(finalPrice * qty)}\n\n` +
          `👤 Nom : ${nom}\n` +
          `📞 Tel : ${telephone}\n` +
          `📍 Adresse : ${adresse}` +
          (message ? `\n💬 Message : ${message}` : "") +
          `\n\nMerci de confirmer !`
        );
        
      }
      setSuccess(true);
      setSending(false);
    } catch (e) { console.error(e); setSending(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><TbLoader2 className="animate-spin text-primary" size={36} /></div>;
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <TbPackage className="text-gray-300" size={60} />
      <p className="text-gray-500">Produit introuvable</p>
      <Link href="/produits" className="text-primary underline text-sm">Retour aux produits</Link>
    </div>
  );

  const images = product.images || [];
  const outOfStock = product.stock !== null && product.stock <= 0;
  const finalPrice = getPrice(product);
  const isPromo = product.promo_price && product.promo_ends_at && new Date(product.promo_ends_at) > new Date();

  const inputCls = (field: string) =>
    `w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
      formErrors[field] ? "border-red-300 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-primary/20"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Modal commande */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-2 pb-2 sm:pb-0">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!sending) { setShowModal(false); setSuccess(false); }}} />
          <div className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[95vh] flex flex-col">

            {success ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"><TbCheck className="text-green-600" size={40} /></div>
                <h3 className="font-bold text-gray-900 text-xl">Commande envoyee !</h3>
                <p className="text-gray-500 text-sm">Le vendeur va vous contacter pour confirmer.</p>
                <p className="text-xs text-gray-400">Livraison a : <span className="font-semibold text-gray-600">{getAdresse()}</span></p>
                <button onClick={() => { setShowModal(false); setSuccess(false); setSite(""); setPavillon(""); setChambre(""); setHotelChambre(""); setMessage(""); }}
                  className="w-full bg-[#2B3090] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1e2570]">Fermer</button>
              </div>
            ) : (
              <>
                {/* Header fixe */}
                <div className="bg-[#2B3090] px-5 pt-5 pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center"><TbShoppingBag className="text-white" size={20} /></div>
                    <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20"><TbX size={16} /></button>
                  </div>
                  <h3 className="text-white font-bold text-lg">Passer une commande</h3>
                  <div className="mt-3 bg-white/10 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                      {images[0] ? <img src={images[0]} alt="" className="w-full h-full object-cover" /> : <TbPackage className="text-white/40 m-2" size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-xs truncate">{product.name}</p>
                      <p className="text-white/60 text-xs">x{qty} · {formatPrice(finalPrice * qty)}</p>
                    </div>
                    <p className="text-white font-bold text-sm flex-shrink-0">{formatPrice(finalPrice * qty)}</p>
                  </div>
                </div>

                {/* Formulaire scrollable */}
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

                  {/* Nom */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nom complet <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <TbUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input className={inputCls("nom") + " pl-9"} placeholder="Ex: Cheikh Oumar Fall"
                        value={nom} onChange={e => { setNom(e.target.value); setFormErrors(p => ({...p, nom: ""})); }} />
                    </div>
                    {formErrors.nom && <p className="text-red-500 text-xs mt-1">{formErrors.nom}</p>}
                  </div>

                  {/* Telephone */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Telephone <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <TbPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input className={inputCls("telephone") + " pl-9"} placeholder="+221 77 123 45 67" type="tel"
                        value={telephone} onChange={e => { setTelephone(e.target.value); setFormErrors(p => ({...p, telephone: ""})); }} />
                    </div>
                    {formErrors.telephone && <p className="text-red-500 text-xs mt-1">{formErrors.telephone}</p>}
                  </div>

                  {/* Campus */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Campus / Site <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {CAMPUS_SITES.map(s => (
                        <button key={s} type="button"
                          onClick={() => { setSite(s); setPavillon(""); setChambre(""); setHotelChambre(""); setFormErrors(p => ({...p, site: "", pavillon: "", chambre: "", hotelChambre: ""})); }}
                          className={`py-2.5 px-1 rounded-xl text-xs font-bold border-2 transition-all text-center leading-tight ${
                            site === s ? "border-[#2B3090] bg-[#2B3090]/5 text-[#2B3090]" : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}>
                          <TbHome className="mx-auto mb-0.5" size={13} />{s}
                        </button>
                      ))}
                    </div>
                    {formErrors.site && <p className="text-red-500 text-xs mt-1">{formErrors.site}</p>}
                  </div>

                  {/* VCN : Pavillon */}
                  {site === "VCN" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Pavillon <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        {VCN_PAVILLONS.map(p => (
                          <button key={p} type="button"
                            onClick={() => { setPavillon(p); setFormErrors(prev => ({...prev, pavillon: ""})); }}
                            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              pavillon === p ? "border-[#2B3090] bg-[#2B3090]/5 text-[#2B3090]" : "border-gray-200 text-gray-500"
                            }`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      {formErrors.pavillon && <p className="text-red-500 text-xs mt-1">{formErrors.pavillon}</p>}
                    </div>
                  )}

                  {/* VCN : Chambre 1-60 */}
                  {site === "VCN" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Numero de chambre (1-60) <span className="text-red-500">*</span></label>
                      <input className={inputCls("chambre")} placeholder="Ex: 24" type="number" min="1" max="60"
                        value={chambre} onChange={e => { setChambre(e.target.value); setFormErrors(p => ({...p, chambre: ""})); }} />
                      {formErrors.chambre && <p className="text-red-500 text-xs mt-1">{formErrors.chambre}</p>}
                    </div>
                  )}

                  {/* Hotel du Rail : A1-A50 */}
                  {site === "Hotel du Rail" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Numero de chambre <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-5 gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {Array.from({ length: 50 }, (_, i) => `A${i + 1}`).map(c => (
                          <button key={c} type="button"
                            onClick={() => { setHotelChambre(c); setFormErrors(p => ({...p, hotelChambre: ""})); }}
                            className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                              hotelChambre === c ? "border-[#2B3090] bg-[#2B3090] text-white" : "border-gray-200 text-gray-600 hover:border-[#2B3090]/50"
                            }`}>
                            {c}
                          </button>
                        ))}
                      </div>
                      {formErrors.hotelChambre && <p className="text-red-500 text-xs mt-1">{formErrors.hotelChambre}</p>}
                    </div>
                  )}

                  {/* Apercu adresse */}
                  {site && (site === "Hors Campus" || (site === "VCN" && pavillon) || (site === "Hotel du Rail" && hotelChambre)) && (
                    <div className="bg-[#2B3090]/5 border border-[#2B3090]/20 rounded-xl px-4 py-3 flex items-center gap-2">
                      <TbMapPin className="text-[#2B3090] flex-shrink-0" size={15} />
                      <p className="text-xs text-[#2B3090] font-semibold">{getAdresse()}</p>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Message (optionnel)</label>
                    <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Ex: Je suis disponible de 14h a 18h..." rows={2}
                      value={message} onChange={e => setMessage(e.target.value)} />
                  </div>
                </div>

                {/* Boutons fixes en bas */}
                <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0 space-y-2">
                  <div className="flex gap-3">
                    <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm text-gray-500 font-medium hover:bg-gray-50">Annuler</button>
                    <button onClick={handleCommander} disabled={sending}
                      className="flex-1 bg-[#2B3090] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-[#1e2570]">
                      {sending ? <TbLoader2 size={16} className="animate-spin" /> : <TbShoppingBag size={16} />}
                      {sending ? "Envoi..." : "Commander"}
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-400">Le vendeur recevra votre commande et vous contactera</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <TbArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-gray-800 truncate flex-1">{product.name}</h1>
        <button onClick={handleShare} title={shared ? "Lien copie !" : "Partager"} className={"w-9 h-9 rounded-xl flex items-center justify-center transition-colors " + (shared ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
          {shared ? <TbCheck size={18} /> : <TbShare size={18} />}
        </button>
        <button onClick={toggleLike} title={liked ? "Retirer des favoris" : "Ajouter aux favoris"} className={"w-9 h-9 rounded-xl flex items-center justify-center transition-colors " + (liked ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
          <TbHeart size={18} className={liked ? "fill-red-500 text-red-500" : ""} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-2xl overflow-hidden aspect-square flex items-center justify-center shadow-sm mb-3 relative">
            {images[imgIdx] ? <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" /> : <TbPackage className="text-gray-200" size={80} />}
            {isPromo && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">PROMO -{Math.round((1-finalPrice/product.price)*100)}%</span>}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setImgIdx(i)} className={"w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors " + (i === imgIdx ? "border-primary" : "border-transparent")}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            {product.category && (
              <span className="text-xs bg-orange-100 text-primary px-2 py-1 rounded-full font-medium">
                <TbTag className="inline mr-1" size={12} />{product.category}
              </span>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mt-2">{product.name}</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRow rating={avgRating} />
                <span className="text-xs text-gray-500">{avgRating}/5 · {reviews.length} avis</span>
              </div>
            )}
            {isPromo ? (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">PROMO</span>
                  <span className="text-xs text-gray-400">Fin le {new Date(product.promo_ends_at).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-red-500">{formatPrice(finalPrice)}</p>
                  <p className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</p>
                  <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-1 rounded-lg">-{Math.round((1-finalPrice/product.price)*100)}%</span>
                </div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-primary mt-2">{formatPrice(product.price)}</p>
            )}
            {product.stock !== null && (
              <div className={"flex items-center gap-1.5 mt-2 text-sm font-medium " + (outOfStock ? "text-red-500" : product.stock <= 3 ? "text-orange-500" : "text-gray-400")}>
                {outOfStock ? <><TbAlertCircle size={15} /> Rupture de stock</> : product.stock <= 3 ? <><TbAlertCircle size={15} /> Plus que {product.stock} en stock</> : <>{product.stock} en stock</>}
              </div>
            )}
            {product.delivery_available && (
              <div className="flex items-center gap-2 mt-2 text-green-600 text-sm"><TbTruck size={16} /><span>Livraison campus disponible</span></div>
            )}
          </div>

          {product.description && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.vendors?.shop_name && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <Link href={"/vendeurs/" + product.vendors.id} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-[#2B3090]/10 rounded-xl overflow-hidden flex items-center justify-center font-bold text-[#2B3090] flex-shrink-0">
                  {product.vendors.logo_url ? <img src={product.vendors.logo_url} alt="" className="w-full h-full object-cover" /> : product.vendors.shop_name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{product.vendors.shop_name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><TbCheck size={11} className="text-green-500" /> Vendeur verifie · Voir la boutique</p>
                </div>
              </Link>
              <button onClick={async () => {
                if (!userId) { router.push("/auth/sign-in?redirect=" + window.location.pathname); return; }
                const supabase = createClient();
                const { data: existing } = await supabase.from("conversations").select("id")
                  .eq("buyer_id", userId).eq("vendor_id", product.vendors.id).eq("produit_id", product.id).maybeSingle();
                let convId = existing?.id;
                if (!convId) {
                  const { data: newConv } = await supabase.from("conversations").insert({
                    buyer_id: userId, vendor_id: product.vendors.id, produit_id: product.id,
                  }).select("id").single();
                  convId = newConv?.id;
                }
                if (convId) router.push("/user/messages?conv=" + convId);
              }} className="w-full mt-3 bg-primary/10 text-primary font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors text-sm">
                <TbMessageCircle size={18} /> Contacter le vendeur
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quantite</span>
              <div className="flex items-center gap-3 border border-gray-200 rounded-full px-4 py-2">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={outOfStock} className="text-gray-500 hover:text-primary transition-colors disabled:opacity-30"><TbMinus size={16} /></button>
                <span className="font-bold text-gray-800 w-5 text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} disabled={outOfStock} className="text-gray-500 hover:text-primary transition-colors disabled:opacity-30"><TbPlus size={16} /></button>
              </div>
            </div>
            {qty > 1 && (
              <div className="flex justify-between text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5">
                <span>Total ({qty} articles)</span>
                <span className="font-bold text-gray-800">{formatPrice(finalPrice * qty)}</span>
              </div>
            )}
            {outOfStock ? (
              <div className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base cursor-not-allowed">
                <TbAlertCircle size={20} /> Rupture de stock
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!userId) {
                    router.push("/auth/sign-in?redirect=" + encodeURIComponent(window.location.pathname) + "&role=buyer");
                  } else {
                    setShowModal(true);
                  }
                }}
                className="w-full bg-[#2B3090] hover:bg-[#1e2570] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors text-base">
                {userId
                  ? <><TbShoppingBag size={22} /> Commander — {formatPrice(finalPrice * qty)}</>
                  : <><TbLock size={22} /> Se connecter pour commander</>}
              </button>
            )}
            <p className="text-xs text-center text-gray-400">Le vendeur confirmera votre commande et vous contactera</p>
          </div>
        </div>
      </div>

      {/* Section Avis */}
      <div className="max-w-4xl mx-auto px-4 pb-10 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <TbMessageCircle className="text-primary" size={22} /> Laisser un avis
          </h3>
          {reviewSuccess ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <TbCheck className="text-green-600" size={20} />
              <p className="text-green-700 font-semibold text-sm">Merci pour votre avis !</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Votre note</p>
                <StarPicker value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
              </div>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                placeholder="Partagez votre experience avec ce produit... (optionnel)"
                rows={3}
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              />
              {reviewError && <p className="text-red-500 text-xs">{reviewError}</p>}
              <button onClick={handleReview} disabled={reviewSending || reviewForm.rating === 0}
                className="flex items-center gap-2 bg-[#2B3090] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1e2570] transition-colors disabled:opacity-40">
                {reviewSending ? <TbLoader2 size={16} className="animate-spin" /> : <TbSend size={16} />}
                {reviewSending ? "Envoi..." : "Publier mon avis"}
              </button>
              {!userId && <p className="text-xs text-gray-400">Connectez-vous pour laisser un avis.</p>}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
              <TbStarFilled className="text-yellow-400" size={20} /> {reviews.length} Avis · {avgRating}/5
            </h3>
            <div className="space-y-4 mt-4">
              {reviews.map((r, i) => (
                <div key={r.id || i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <StarRow rating={r.rating} />
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}