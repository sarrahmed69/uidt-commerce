"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { TbSearch, TbLoader2, TbPackage, TbShoppingBag, TbHeart } from "react-icons/tb";

const CATEGORIES = ["Tous", "Alimentation", "Fournitures scolaires", "Vetements", "Electronique", "Livres & Cours", "Services", "Beaute", "Autre"];
const PAGE_SIZE = 24;
const formatPrice = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

// Carte produit memoisee (ne se re-rend pas quand la liste change)
const ProductCard = ({ p }: { p: any }) => {
  const [loaded, setLoaded] = useState(false);
  const isPromo = p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date();
  
  return (
    <Link href={`/produits/${p.id}`}
      prefetch={false}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
        {p.images?.[0] ? (
          <>
            {!loaded && <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />}
            <Image
              src={p.images[0]}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover group-hover:scale-105 transition-all duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded(true)}
              unoptimized={p.images[0].includes("supabase")}
              loading="lazy"
            />
          </>
        ) : (
          <TbPackage className="text-gray-300" size={48} />
        )}
        {isPromo && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
            -{Math.round((1 - p.promo_price/p.price)*100)}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
        {p.category && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-1">{p.category}</span>}
        
        {isPromo ? (
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-red-500 font-bold text-sm">{formatPrice(p.promo_price)}</p>
            <p className="text-gray-400 text-xs line-through">{formatPrice(p.price)}</p>
          </div>
        ) : (
          <p className="text-primary font-bold text-sm mt-2">{formatPrice(p.price)}</p>
        )}
        
        {p.delivery_available && <p className="text-[10px] text-green-600 mt-1">✓ Livraison campus</p>}
        
        <div className="bg-primary hover:bg-accent text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition-colors mt-3">
          <TbShoppingBag size={14} /> Voir le produit
        </div>
      </div>
    </Link>
  );
};

export default function ProduitsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tous");
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id,name,price,category,images,delivery_available,promo_price,promo_ends_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(200);
      setProducts(data || []);
      setLoading(false);
    };
    load();
  }, []);

  // Filtre memoise - ne recalcule que si search/cat/products change
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = cat === "Tous" || p.category === cat;
      return matchSearch && matchCat;
    });
  }, [products, search, cat]);

  const visible = filtered.slice(0, displayedCount);
  const hasMore = displayedCount < filtered.length;

  const loadMore = useCallback(() => {
    setDisplayedCount(prev => prev + PAGE_SIZE);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1A1F6B] to-[#2B3090] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Tous les produits</h1>
          <p className="text-white/70 mb-6 text-sm">Trouvez ce dont vous avez besoin sur le campus</p>
          <div className="relative max-w-md mx-auto">
            <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => { setSearch(e.target.value); setDisplayedCount(PAGE_SIZE); }}
            />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCat(c); setDisplayedCount(PAGE_SIZE); }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === c ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grille produits */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <TbPackage className="text-gray-300 mx-auto mb-4" size={60} />
            <p className="text-gray-500 font-medium">Aucun produit trouve</p>
            <p className="text-gray-400 text-sm mt-1">Essayez une autre recherche ou categorie</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">{filtered.length} produit{filtered.length > 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button onClick={loadMore}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-accent transition-colors">
                  Voir plus de produits ({filtered.length - displayedCount} restants)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}