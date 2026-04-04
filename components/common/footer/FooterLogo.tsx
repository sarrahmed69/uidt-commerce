"use client";
import { motion } from "framer-motion";
import Image from "next/image";

function FooterLogo() {
  const logoVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="footer-logo-container">
      <motion.div
        className="mb-5 flex items-center gap-4"
        variants={logoVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <Image
          src="/images/uidt-logo.png"
          alt="Universite Iba Der Thiam de Thies"
          width={54}
          height={54}
          className="rounded-full object-cover flex-shrink-0 border-2 border-gray-200 bg-white"
        />
        <div className="flex flex-col">
          <span className="font-bold text-primary text-lg leading-tight tracking-wide">
            UIDT Commerce
          </span>
          <span className="text-[10px] text-gold font-semibold tracking-[0.2em] uppercase mt-0.5">
            Campus Marketplace
          </span>
        </div>
      </motion.div>

      <motion.p
        className="text-[13px] text-gray-500 mb-6 leading-relaxed max-w-xs"
        variants={logoVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        La marketplace de l&apos;Universite Iba Der Thiam de Thies — Achetez et vendez
        facilement entre etudiants en FCFA.
      </motion.p>

      <motion.div
        variants={logoVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h3 className="mb-3 font-semibold text-slate-700 text-sm">
          Paiements acceptes
        </h3>

        <div className="flex flex-wrap gap-3 items-center">

          {/* WAVE — vrai logo SVG */}
          <div title="Wave" className="bg-[#0070E0] rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm cursor-default">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#0070E0"/>
              <path d="M8 22 C10 16, 14 16, 16 20 C18 24, 22 24, 24 20 C26 16, 30 16, 32 20" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M8 27 C10 21, 14 21, 16 25 C18 29, 22 29, 24 25 C26 21, 30 21, 32 25" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
            </svg>
            <span className="text-white text-xs font-bold">Wave</span>
          </div>

          {/* ORANGE MONEY — vrai logo SVG */}
          <div title="Orange Money" className="bg-[#FF6600] rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm cursor-default">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#FF6600"/>
              <circle cx="20" cy="20" r="8" fill="white"/>
              <circle cx="20" cy="20" r="4" fill="#FF6600"/>
              <path d="M20 8 L20 5 M20 32 L20 35 M8 20 L5 20 M32 20 L35 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="text-white text-xs font-bold">Orange Money</span>
          </div>

          {/* CASH — icone billet realiste */}
          <div title="Cash" className="bg-[#2d6a2d] rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm cursor-default">
            <svg width="22" height="16" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="42" height="26" rx="3" fill="#2d6a2d" stroke="white" strokeWidth="1.5"/>
              <rect x="1" y="1" width="42" height="26" rx="3" fill="url(#billGrad)" opacity="0.3"/>
              <circle cx="22" cy="14" r="7" stroke="white" strokeWidth="1.5" fill="none"/>
              <text x="22" y="18.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="serif">F</text>
              <rect x="4" y="4" width="6" height="4" rx="1" fill="white" opacity="0.5"/>
              <rect x="34" y="20" width="6" height="4" rx="1" fill="white" opacity="0.5"/>
              <defs>
                <linearGradient id="billGrad" x1="0" y1="0" x2="44" y2="28">
                  <stop offset="0%" stopColor="white"/>
                  <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-white text-xs font-bold">Cash</span>
          </div>

        </div>

        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          Paiements en FCFA — La plateforme met en relation, le paiement se fait
          directement entre acheteur et vendeur.
        </p>
      </motion.div>
    </div>
  );
}
export default FooterLogo;