"use client";
import Link from "next/link";
import MainLayout from "@/components/common/layouts/main/MainLayout";
import { motion } from "framer-motion";
import { TbSearch, TbArrowRight } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const Hero = () => {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [isVendor, setIsVendor] = useState(false);
  const [stats, setStats] = useState([
    { value: "...", label: "Produits" },
    { value: "100%", label: "Campus UIDT" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const [{ count: produits }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
      ]);
      setStats([
        { value: produits ? `${produits}` : "0", label: "Produits" },
        { value: "100%", label: "Campus UIDT" },
      ]);
      if (user) {
        const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).single();
        if (vendor) setIsVendor(true);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    if (q.trim()) router.push(`/produits?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="relative bg-gradient-to-br from-[#1A1F6B] via-[#2B3090] to-[#3D44B5] overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
      <MainLayout className="relative z-10 py-14 md:py-20">
        <div className="max-w-2xl text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              <span className="w-2 h-2 bg-[#F5A623] rounded-full animate-pulse" />
              Marketplace officiel du Campus UIDT
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Achetez & Vendez
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-[#fcd280]">
                sur le Campus
              </span>
            </h1>
            <p className="text-white/70 text-base mb-6 max-w-lg leading-relaxed">
              La plateforme des etudiants de l&apos;UIDT — trouvez des produits, des services et des opportunites directement sur votre campus.
            </p>

            <div className="flex gap-3 mb-6">
              {stats.map((s) => (
                <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-center">
                  <p className="font-black text-lg text-[#F5A623] leading-none">{s.value}</p>
                  <p className="text-white/60 text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-xl max-w-lg mb-5">
              <div className="flex items-center gap-2 flex-1 px-3">
                <TbSearch className="text-gray-400 flex-shrink-0" size={18} />
                <input
                  className="flex-1 outline-none text-gray-800 text-sm placeholder:text-gray-400 bg-transparent"
                  placeholder="Rechercher un produit, un vendeur..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                />
              </div>
              <button onClick={handleSearch}
                className="bg-[#F5A623] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#d4891a] transition-colors whitespace-nowrap">
                Rechercher
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/produits"
                className="flex items-center gap-2 bg-[#F5A623] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#d4891a] transition-colors shadow">
                Voir les produits <TbArrowRight size={16} />
              </Link>
              {!isVendor && (
                <Link href="/devenir-vendeur"
                  className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/20 transition-colors backdrop-blur-sm">
                  Devenir vendeur
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </MainLayout>
    </div>
  );
};

export default Hero;