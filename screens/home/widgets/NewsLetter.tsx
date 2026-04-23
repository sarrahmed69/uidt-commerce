"use client";
import { useEffect, useState } from "react";
import { TbX, TbBuildingStore, TbArrowRight } from "react-icons/tb";
import Link from "next/link";

export default function NewsLetter() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("banner_seen");
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem("banner_seen", "1");
  };

  if (!visible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        {/* Barre colorée top */}
        <div className="h-1.5 bg-gradient-to-r from-[#2B3090] to-[#F5A623]" />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#2B3090]/10 rounded-xl flex items-center justify-center">
              <TbBuildingStore className="text-[#2B3090]" size={22} />
            </div>
            <button onClick={close} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
              <TbX size={16} />
            </button>
          </div>

          <p className="text-xs font-semibold text-[#2B3090] uppercase tracking-wider mb-1">KayJend</p>
          <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
            Vendez sur le campus pour seulement <span className="text-[#F5A623]">1 000 FCFA/mois</span>
          </h3>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Rejoignez des centaines d etudiants qui vendent leurs produits directement sur la plateforme KayJend.
          </p>

          <div className="flex gap-2">
            <Link href="/devenir-vendeur" onClick={close}
              className="flex-1 bg-[#2B3090] text-white text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1A1F6B] transition-colors">
              Creer ma boutique <TbArrowRight size={16} />
            </Link>
            <button onClick={close}
              className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}