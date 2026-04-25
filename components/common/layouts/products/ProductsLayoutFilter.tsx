"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BiFilter, BiX } from "react-icons/bi";
import MainLayout from "../main/MainLayout";

const categories = [
  "Livres & Cours", "Electronique", "Vetements & Mode",
  "Alimentation", "Fournitures", "Logement",
  "Services etudiants", "Sport & Loisirs",
];

const prices = [
  { label: "Moins de 2 000 F", value: "0-2000" },
  { label: "2 000 - 5 000 F", value: "2000-5000" },
  { label: "5 000 - 15 000 F", value: "5000-15000" },
  { label: "Plus de 15 000 F", value: "15000+" },
];

export default function ProductsLayoutFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [categorie, setCategorie] = useState(searchParams.get("categorie") || "");
  const [price, setPrice] = useState(searchParams.get("price") || "");
  const [search] = useState(searchParams.get("search") || "");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categorie) params.set("categorie", categorie);
    if (price) params.set("price", price);
    router.push(`/produits?${params.toString()}`);
    setOpen(false);
  };

  const clearFilters = () => {
    setCategorie("");
    setPrice("");
    router.push("/produits");
  };

  const activeCount = [categorie, price].filter(Boolean).length;

  return (
    <MainLayout className="bg-white mt-3">
      <section className="border-t border-b border-gray-200">
        <div className="flex items-center gap-4 py-3 px-2 text-sm">
          <button onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 font-medium text-gray-700 hover:text-[#2B3090] transition-colors">
            <BiFilter size={20} />
            Filtrer
            {activeCount > 0 && (
              <span className="bg-[#F5A623] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {activeCount > 0 && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors text-xs">
              <BiX size={16} /> Effacer tout
            </button>
          )}

          {categorie && (
            <span className="bg-[#2B3090]/10 text-[#2B3090] text-xs px-2.5 py-1 rounded-full font-medium">
              {categorie}
            </span>
          )}
          {price && (
            <span className="bg-[#F5A623]/10 text-[#d4891a] text-xs px-2.5 py-1 rounded-full font-medium">
              {prices.find(p => p.value === price)?.label}
            </span>
          )}
        </div>

        {open && (
          <div className="border-t border-gray-100 py-6 px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="font-semibold text-gray-800 mb-3 text-sm">Categorie</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategorie(cat === categorie ? "" : cat)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                        categorie === cat
                          ? "bg-[#2B3090] text-white border-[#2B3090]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#2B3090]"
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-3 text-sm">Prix</p>
                <div className="flex flex-wrap gap-2">
                  {prices.map(p => (
                    <button key={p.value} onClick={() => setPrice(p.value === price ? "" : p.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                        price === p.value
                          ? "bg-[#F5A623] text-white border-[#F5A623]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#F5A623]"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={applyFilters}
              className="mt-6 bg-[#2B3090] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[#1a1f6e] transition-colors">
              Appliquer les filtres
            </button>
          </div>
        )}
      </section>
    </MainLayout>
  );
}