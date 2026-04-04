"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbSearch, TbLoader2, TbBrandWhatsapp, TbPackage } from "react-icons/tb";

const CATEGORIES = ["Tous", "Alimentation", "Fournitures scolaires", "Vetements", "Electronique", "Livres & Cours", "Services", "Beaute", "Autre"];

const formatPrice = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function ProduitsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tous");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").eq("status", "active").order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "Tous" || p.category === cat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1A1F6B] to-[#2B3090] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Tous les produits</h1>
          <p className="text-white/70 mb-6">Trouvez ce dont vous avez besoin sur le campus</p>
          <div className="relative max-w-md mx-auto">
            <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filtres catégories */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === c ? "bg-[#2B3090] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grille produits */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-24"><TbLoader2 className="animate-spin text-[#2B3090]" size={36} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <TbPackage className="text-gray-300 mx-auto mb-4" size={60} />
            <p className="text-gray-500 font-medium">Aucun produit trouvé</p>
            <p className="text-gray-400 text-sm mt-1">Essayez une autre recherche ou catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => (
              <Link key={p.id} href={`/produits/${p.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <TbPackage className="text-gray-300" size={48} />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                  {p.category && <span className="text-xs bg-blue-50 text-[#2B3090] px-2 py-0.5 rounded-full">{p.category}</span>}
                  <p className="text-[#2B3090] font-bold mt-2">{formatPrice(p.price)}</p>
                  {p.delivery_available && <p className="text-xs text-green-600 mt-1">✓ Livraison campus</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 bg-[#2B3090] hover:bg-[#1A1F6B] text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition-colors">
                      <TbBrandWhatsapp size={14} /> Commander
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}