"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MainLayout from "@/components/common/layouts/main/MainLayout";
import Link from "next/link";
import { TbBuildingStore, TbStar, TbArrowRight, TbLoader2, TbSearch, TbPackage } from "react-icons/tb";

export default function VendeursPage() {
  const [vendeurs, setVendeurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("vendors")
        .select("*, products(count)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setVendeurs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = vendeurs.filter(v =>
    v.shop_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1A1F6B] to-[#2B3090] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Nos Vendeurs</h1>
          <p className="text-white/60 mb-6">Decouvrez les boutiques des etudiants UIDT</p>
          <div className="relative max-w-md">
            <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              className="w-full bg-white pl-11 pr-4 py-3 rounded-xl text-sm outline-none text-gray-800"
              placeholder="Rechercher une boutique..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <MainLayout className="py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <TbLoader2 className="animate-spin text-[#2B3090]" size={36} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <TbBuildingStore className="text-gray-200 mx-auto mb-4" size={60} />
            <p className="font-semibold text-gray-500 mb-2">
              {search ? "Aucune boutique trouvee" : "Aucun vendeur pour le moment"}
            </p>
            <p className="text-sm text-gray-400 mb-6">Soyez le premier a vendre sur le campus !</p>
            <Link href="/devenir-vendeur"
              className="bg-[#F5A623] text-white px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2 hover:bg-[#d4891a] transition-colors">
              <TbBuildingStore size={18} /> Creer ma boutique
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">{filtered.length} boutique{filtered.length > 1 ? "s" : ""} active{filtered.length > 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((v) => {
                const initiale = v.shop_name?.[0]?.toUpperCase() || "B";
                const nbProduits = v.products?.[0]?.count || 0;
                return (
                  <div key={v.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-[#2B3090]/10 rounded-xl flex items-center justify-center text-[#2B3090] font-bold text-2xl group-hover:bg-[#2B3090] group-hover:text-white transition-colors">
                        {v.logo_url ? (
                          <img src={v.logo_url} alt={v.shop_name} className="w-full h-full object-cover rounded-xl" />
                        ) : initiale}
                      </div>
                      {v.is_verified && (
                        <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-1 rounded-full">Verifie</span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg mb-1">{v.shop_name}</h3>

                    <div className="flex items-center gap-1 text-yellow-400 text-sm mb-2">
                      <TbStar size={14} />
                      <span className="text-gray-400 text-xs">
                        {v.rating ? `${v.rating}/5` : "Nouveau vendeur"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                      <TbPackage size={14} />
                      <span>{nbProduits} produit{nbProduits > 1 ? "s" : ""} en ligne</span>
                    </div>

                    {v.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{v.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <Link href={`/vendeurs/${v.id}`}
                        className="flex items-center gap-1 text-[#2B3090] text-sm font-semibold hover:underline">
                        Voir la boutique <TbArrowRight size={16} />
                      </Link>
                      <span className="text-xs text-gray-300">
                        {new Date(v.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link href="/devenir-vendeur"
                className="bg-[#2B3090] text-white px-8 py-3 rounded-full font-bold hover:bg-[#1A1F6B] transition-colors inline-flex items-center gap-2">
                Devenir vendeur <TbArrowRight size={18} />
              </Link>
            </div>
          </>
        )}
      </MainLayout>
    </div>
  );
}