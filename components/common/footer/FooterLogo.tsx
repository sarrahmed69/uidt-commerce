"use client";
import { motion } from "framer-motion";

function FooterLogo() {
  const logoVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="footer-logo-container">
      <motion.div
        className="mb-5"
        variants={logoVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col">
          <span className="font-black text-2xl tracking-tight leading-none select-none" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
            <span style={{ color: "#1e4a9e" }}>Kay</span><span style={{ color: "#F5A623" }}>Jënd</span>
          </span>
          <span className="text-[9px] text-gray-500 font-semibold tracking-[0.2em] uppercase mt-1.5">
            Le marche du campus
          </span>
        </div>
      </motion.div>

      <motion.p
        className="text-[13px] text-white/70 mb-6 leading-relaxed max-w-xs"
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
        <h3 className="mb-3 font-semibold text-white text-sm">
          Paiements acceptes
        </h3>

        <div className="flex flex-wrap gap-3 items-center">

          {/* WAVE */}
          <div title="Wave" className="bg-[#29ABE2] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm cursor-default">
            <svg width="22" height="22" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="22" fill="#29ABE2"/>
              <ellipse cx="22" cy="28" rx="10" ry="12" fill="white"/>
              <ellipse cx="22" cy="26" rx="7" ry="9" fill="#1a1a2e"/>
              <ellipse cx="22" cy="28" rx="5" ry="6" fill="white"/>
              <path d="M16 14 Q19 10 22 14 Q25 10 28 14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <circle cx="18" cy="20" r="1.5" fill="white"/>
              <circle cx="26" cy="20" r="1.5" fill="white"/>
            </svg>
            <span className="text-white text-xs font-bold tracking-wide">Wave</span>
          </div>

          {/* ORANGE MONEY */}
          <div title="Orange Money" className="bg-white rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm cursor-default">
            <svg width="22" height="22" viewBox="0 0 44 44" fill="none">
              <path d="M8 8 L26 8 L36 20 L18 20 Z" fill="#1a1a1a"/>
              <path d="M18 24 L36 24 L28 36 L10 36 Z" fill="#FF6600"/>
            </svg>
            <span className="text-gray-800 text-xs font-bold tracking-wide">Orange Money</span>
          </div>

          {/* CASH */}
          <div title="Cash FCFA" className="bg-[#2d8a2d] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm cursor-default">
            <svg width="24" height="18" viewBox="0 0 48 32" fill="none">
              <rect x="2" y="6" width="44" height="22" rx="3" fill="#1a5c1a" stroke="#4ade80" strokeWidth="1"/>
              <rect x="1" y="3" width="44" height="22" rx="3" fill="#2d8a2d" stroke="#4ade80" strokeWidth="1"/>
              <circle cx="23" cy="14" r="7" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="23" y="18" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="bold">F</text>
              <rect x="3" y="5" width="5" height="3" rx="1" fill="#4ade80" opacity="0.5"/>
              <rect x="38" y="16" width="5" height="3" rx="1" fill="#4ade80" opacity="0.5"/>
            </svg>
            <span className="text-white text-xs font-bold tracking-wide">Cash FCFA</span>
          </div>

        </div>

        <p className="text-xs text-white/50 mt-3 leading-relaxed">
          Paiements en FCFA — La plateforme met en relation, le paiement se fait
          directement entre acheteur et vendeur.
        </p>
      </motion.div>
    </div>
  );
}
export default FooterLogo;