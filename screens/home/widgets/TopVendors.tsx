"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbBuildingStore, TbArrowRight, TbCheck } from "react-icons/tb";

export default function TopVendors() {
  const [vendeurs, setVendeurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("vendors")
        .select("id, shop_name, logo_url, is_verified, description")
        .eq("status", "active")
        .limit(6);
      setVendeurs(data || []);
      setLoading(false);
    })();
  }, []);

  if (!loading && !vendeurs.length) return null;

  return (
    <section className="px-4 py-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#2B3090]">Nos vendeurs</h2>
          <p className="text-sm text-gray-400 mt-0.5">Boutiques actives sur le campus</p>
        </div>
        <Link href="/vendeurs" className="text-xs text-[#2B3090] font-semibold hover:underline flex items-center gap-1">
          Voir tout <TbArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-3" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto mb-2" />
              <div className="h-2 bg-gray-100 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {vendeurs.map(v => (
            <Link key={v.id} href={`/vendeurs/${v.id}`}
              className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all border border-gray-100 group hover:-translate-y-0.5">
              <div className="w-14 h-14 bg-[#2B3090]/10 rounded-2xl flex items-center justify-center text-[#2B3090] font-bold text-2xl mx-auto mb-3 group-hover:bg-[#2B3090] group-hover:text-white transition-colors overflow-hidden">
                {v.logo_url
                  ? <img src={v.logo_url} alt={v.shop_name} className="w-full h-full object-cover" />
                  : v.shop_name?.[0]?.toUpperCase()}
              </div>
              <p className="font-bold text-gray-800 text-xs truncate">{v.shop_name}</p>
              {v.is_verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 font-semibold mt-1">
                  <TbCheck size={10} /> Verifie
                </span>
              )}
              {v.description && (
                <p className="text-gray-400 text-[10px] mt-1 line-clamp-2 leading-tight">{v.description}</p>
              )}
              <div className="mt-3 flex items-center justify-center gap-1 text-[#2B3090]">
                <TbBuildingStore size={12} />
                <span className="text-[10px] font-semibold">Voir la boutique</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CTA devenir vendeur */}
      <div className="mt-6 bg-gradient-to-r from-[#1A1F6B] to-[#2B3090] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-white">
          <h3 className="font-bold text-base">Vous voulez vendre sur le campus ?</h3>
          <p className="text-white/60 text-sm mt-0.5">Creez votre boutique gratuitement en 2 minutes</p>
        </div>
        <Link href="/devenir-vendeur"
          className="bg-[#F5A623] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#d4891a] transition-colors whitespace-nowrap flex-shrink-0">
          Devenir vendeur →
        </Link>
      </div>
    </section>
  );
}