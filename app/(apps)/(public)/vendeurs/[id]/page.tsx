"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MainLayout from "@/components/common/layouts/main/MainLayout";
import Link from "next/link";
import { TbBuildingStore, TbStar, TbStarFilled, TbPhone, TbBrandWhatsapp, TbPackage, TbArrowLeft, TbCheck, TbMapPin, TbLoader2, TbMessageCircle, TbShare, TbShieldCheck } from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function VendeurDetailPage() {
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.split("/").pop();
    if (!id) { setLoading(false); return; }
    (async () => {
      const supabase = createClient();
      const { data: v } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
      if (!v) { setLoading(false); return; }
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("products").select("id,name,price,images,category,stock,promo_price,promo_ends_at").eq("vendor_id", v.id).eq("status","active").order("created_at",{ascending:false}),
        supabase.from("reviews").select("*").eq("vendor_id", v.id).order("created_at",{ascending:false}),
      ]);
      setVendor(v);
      setProducts(p || []);
      setReviews(r || []);
      setLoading(false);
    })();
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: vendor?.shop_name, text: "Decouvrez cette boutique sur UIDT Commerce", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><TbLoader2 className="animate-spin text-primary" size={36} /></div>;
  if (!vendor) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><TbBuildingStore className="text-gray-300" size={60} /><p className="text-gray-500">Boutique introuvable</p><Link href="/vendeurs" className="text-primary underline text-sm">Retour aux vendeurs</Link></div>;

  const initiale = vendor.shop_name?.[0]?.toUpperCase() || "B";
  const phone = vendor.wave_number || vendor.whatsapp || "";
  const avgRating = reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;
  const isPromo = (p: any) => p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date();

  const StarRow = ({ rating, size = 15 }: { rating: number; size?: number }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        s <= Math.round(rating)
          ? <TbStarFilled key={s} size={size} className="text-yellow-400" />
          : <TbStar key={s} size={size} className="text-gray-200" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-40 bg-gradient-to-r from-primary to-accent relative" />
      <MainLayout>
        <Link href="/vendeurs" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mt-4 mb-4"><TbArrowLeft size={16} /> Retour aux vendeurs</Link>

        {/* Header boutique */}
        <div className="bg-white rounded-2xl p-6 shadow-sm -mt-16 relative z-10 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 border-4 border-white shadow text-primary font-bold text-3xl overflow-hidden">
              {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.shop_name} className="w-full h-full object-cover" /> : initiale}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{vendor.shop_name}</h1>
                {vendor.is_verified && (
                  <span className="bg-blue-50 text-blue-600 border border-blue-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                    <TbShieldCheck size={13} /> Vendeur verifie
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <StarRow rating={avgRating} />
                {reviews.length > 0 ? (
                  <span className="text-gray-500 text-xs">{avgRating}/5 · {reviews.length} avis</span>
                ) : (
                  <span className="text-gray-400 text-xs">Aucun avis pour l instant</span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><TbMapPin size={15} /> Campus UIDT, Thies</span>
                <span className="flex items-center gap-1"><TbPackage size={15} /> {products.length} produit{products.length > 1 ? "s" : ""}</span>
                {reviews.length > 0 && <span className="flex items-center gap-1"><TbMessageCircle size={15} /> {reviews.length} avis</span>}
              </div>
              {vendor.description && <p className="text-sm text-gray-500 mt-2">{vendor.description}</p>}
            </div>

            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {phone && (
                <>
                  <a href={"https://wa.me/"+phone.replace(/\D/g,"")} target="_blank" className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><TbBrandWhatsapp size={18} /> WhatsApp</a>
                  <a href={"tel:+221"+phone} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><TbPhone size={18} /> Appeler</a>
                </>
              )}
              <button onClick={handleShare} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                {copied ? <><TbCheck size={18} className="text-green-600" /> Copie !</> : <><TbShare size={18} /> Partager</>}
              </button>
            </div>
          </div>
        </div>

        {/* Produits */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2"><TbPackage className="text-primary" size={22} /> Produits de la boutique</h2>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center"><TbPackage className="text-gray-300" size={40} /><p className="text-gray-500 mt-2">Aucun produit pour l instant</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <Link key={p.id} href={"/produits/"+p.id} className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <TbPackage className="text-gray-300" size={32} />}
                    {isPromo(p) && <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">PROMO</span>}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                    {isPromo(p) ? (
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-red-500 font-bold text-sm">{fmt(p.promo_price)}</p>
                        <p className="text-gray-400 text-xs line-through">{fmt(p.price)}</p>
                      </div>
                    ) : (
                      <p className="text-primary font-bold text-sm mt-1">{fmt(p.price)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </div>
  );
}