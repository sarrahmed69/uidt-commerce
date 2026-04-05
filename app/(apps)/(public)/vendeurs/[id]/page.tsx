$bytes = [System.Text.Encoding]::UTF8.GetBytes(@'
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MainLayout from "@/components/common/layouts/main/MainLayout";
import Link from "next/link";
import { TbBuildingStore, TbStar, TbPhone, TbBrandWhatsapp, TbPackage, TbArrowLeft, TbCheck, TbMapPin, TbLoader2 } from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function VendeurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { id } = await params;
      const { data: v } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
      if (!v) { setLoading(false); return; }
      const { data: p } = await supabase.from("products").select("id,name,price,images,category,stock").eq("vendor_id", v.id).eq("status","active").order("created_at",{ascending:false});
      setVendor(v);
      setProducts(p || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><TbLoader2 className="animate-spin text-primary" size={36} /></div>;
  if (!vendor) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><TbBuildingStore className="text-gray-300" size={60} /><p className="text-gray-500">Boutique introuvable</p><Link href="/vendeurs" className="text-primary underline text-sm">Retour aux vendeurs</Link></div>;

  const initiale = vendor.shop_name?.[0]?.toUpperCase() || "B";
  const phone = vendor.wave_number || vendor.whatsapp || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-40 bg-gradient-to-r from-primary to-accent relative" />
      <MainLayout>
        <Link href="/vendeurs" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mt-4 mb-4"><TbArrowLeft size={16} /> Retour aux vendeurs</Link>
        <div className="bg-white rounded-2xl p-6 shadow-sm -mt-16 relative z-10 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 border-4 border-white shadow text-primary font-bold text-3xl">
              {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.shop_name} className="w-full h-full object-cover rounded-2xl" /> : initiale}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{vendor.shop_name}</h1>
                {vendor.is_verified && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><TbCheck size={12} /> Verifie</span>}
              </div>
              <div className="flex items-center gap-1 text-yellow-400 mb-2">{[1,2,3,4,5].map(s => <TbStar key={s} size={15} />)}<span className="text-gray-400 text-xs ml-1">Nouveau vendeur</span></div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><TbMapPin size={15} /> Campus UIDT, Thies</span>
                <span className="flex items-center gap-1"><TbPackage size={15} /> {products.length} produit{products.length > 1 ? "s" : ""}</span>
              </div>
              {vendor.description && <p className="text-sm text-gray-500 mt-2">{vendor.description}</p>}
            </div>
            {phone && (
              <div className="flex gap-2 flex-shrink-0">
                <a href={"https://wa.me/"+phone.replace(/\D/g,"")} target="_blank" className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><TbBrandWhatsapp size={18} /> WhatsApp</a>
                <a href={"tel:+221"+phone} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><TbPhone size={18} /> Appeler</a>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2"><TbPackage className="text-primary" size={22} /> Produits de la boutique</h2>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center"><TbPackage className="text-gray-300" size={40} /><p className="text-gray-500 mt-2">Aucun produit pour l instant</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <Link key={p.id} href={"/produits/"+p.id} className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <TbPackage className="text-gray-300" size={32} />}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                    <p className="text-primary font-bold text-sm mt-1">{fmt(p.price)}</p>
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
'@)
[System.IO.File]::WriteAllBytes((Join-Path $PWD 'app\(apps)\(public)\vendeurs\[id]\page.tsx'), $bytes)
Write-Host "OK!" -ForegroundColor Green