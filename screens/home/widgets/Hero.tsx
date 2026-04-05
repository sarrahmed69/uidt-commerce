"use client";
import Link from "next/link";
import MainLayout from "@/components/common/layouts/main/MainLayout";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  PiBookOpenThin, PiLaptopThin, PiTShirtThin, PiBagSimpleThin,
  PiHouseLineThin, PiStudentThin, PiForkKnifeThin, PiSoccerBallThin,
  PiGraduationCapThin, PiStorefrontThin,
} from "react-icons/pi";
import { MdOutlineWhatsapp } from "react-icons/md";
import { TbCurrencyDollar, TbShieldCheck, TbHeadset, TbSearch, TbArrowRight } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const categories = [
  { name: "Livres & Cours", icon: PiBookOpenThin },
  { name: "Electronique", icon: PiLaptopThin },
  { name: "Vetements & Mode", icon: PiTShirtThin },
  { name: "Alimentation", icon: PiForkKnifeThin },
  { name: "Fournitures", icon: PiBagSimpleThin },
  { name: "Logement", icon: PiHouseLineThin },
  { name: "Services etudiants", icon: PiStudentThin },
  { name: "Sport & Loisirs", icon: PiSoccerBallThin },
  { name: "Vendeurs verifies", icon: PiStorefrontThin },
  { name: "Espace vendeur", icon: PiGraduationCapThin },
  { name: "Voir toutes les categories", icon: null },
];

const features = [
  { icon: MdOutlineWhatsapp, title: "Commande via WhatsApp", description: "Contactez le vendeur directement" },
  { icon: TbCurrencyDollar, title: "Wave & Orange Money", description: "Paiement mobile en FCFA" },
  { icon: TbShieldCheck, title: "Vendeurs verifies", description: "Profils valides sur le campus" },
  { icon: TbHeadset, title: "Support rapide", description: "Reponse en moins d1h" },
];

const Hero = () => {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [stats, setStats] = useState([
    { value: "...", label: "Produits" },
    { value: "...", label: "Vendeurs" },
    { value: "...", label: "Etudiants" },
    { value: "100%", label: "Campus UIDT" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const [{ count: produits }, { count: vendeurs }, { count: users }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("vendors").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setStats([
        { value: produits ? `${produits}` : "0", label: "Produits" },
        { value: vendeurs ? `${vendeurs}` : "0", label: "Vendeurs" },
        { value: users ? `${users}+` : "0", label: "Etudiants" },
        { value: "100%", label: "Campus UIDT" },
      ]);
    };
    fetchStats();
  }, []);

  const handleSearch = () => {
    if (q.trim()) router.push(`/produits?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div>
      <div className="relative bg-gradient-to-br from-[#1A1F6B] via-[#2B3090] to-[#3D44B5] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <MainLayout className="relative z-10 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 text-white">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-[#F5A623] rounded-full animate-pulse" />
                  Marketplace officiel du Campus UIDT
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                  Achetez & Vendez
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-[#fcd280]">
                    sur le Campus
                  </span>
                </h1>
                <p className="text-white/70 text-base md:text-lg mb-6 max-w-lg leading-relaxed">
                  La plateforme des etudiants de l&apos;UIDT — trouvez des produits, des services et des opportunites directement sur votre campus.
                </p>

                {/* Stats reelles */}
                <div className="grid grid-cols-4 gap-3 mb-7">
                  {stats.map((s) => (
                    <motion.div key={s.label}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2.5 text-center">
                      <p className="font-black text-lg text-[#F5A623] leading-none">{s.value}</p>
                      <p className="text-white/60 text-[10px] mt-0.5">{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-xl max-w-lg">
                  <div className="flex items-center gap-2 flex-1 px-3">
                    <TbSearch className="text-gray-400 flex-shrink-0" size={18} />
                    <input className="flex-1 outline-none text-gray-800 text-sm placeholder:text-gray-400 bg-transparent"
                      placeholder="Rechercher un produit, un vendeur..."
                      value={q} onChange={e => setQ(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSearch(); }} />
                  </div>
                  <button onClick={handleSearch}
                    className="bg-[#F5A623] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#d4891a] transition-colors whitespace-nowrap">
                    Rechercher
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <Link href="/produits"
                    className="flex items-center gap-2 bg-[#F5A623] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#d4891a] transition-colors shadow">
                    Voir les produits <TbArrowRight size={16} />
                  </Link>
                  <Link href="/devenir-vendeur"
                    className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/20 transition-colors backdrop-blur-sm">
                    Devenir vendeur
                  </Link>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5 max-lg:hidden">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white font-semibold text-sm">Categories</p>
                </div>
                <ul className="py-2">
                  {categories.map((item, index) => (
                    <li key={index}>
                      <Link href={index < categories.length - 1 ? `/produits?categorie=${encodeURIComponent(item.name)}` : "/produits"}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${index === categories.length - 1 ? "text-[#F5A623] font-bold border-t border-white/10 mt-1" : "text-white/80"}`}>
                        {item.icon && <item.icon size={16} className="flex-shrink-0 text-white/60" />}
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </MainLayout>
      </div>

      <div className="bg-white border-b border-gray-100 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <Swiper spaceBetween={16} slidesPerView={1}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}>
            {features.map((feature, index) => (
              <SwiperSlide key={index}>
                <div className="flex items-center gap-x-3 py-2">
                  <feature.icon size={36} className="text-[#2B3090] flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{feature.title}</h4>
                    <p className="text-gray-500 text-xs">{feature.description}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Hero;