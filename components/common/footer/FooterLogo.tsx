"use client";
import { motion } from "framer-motion";

function FooterLogo() {
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col">
        <span className="font-black text-2xl tracking-tight leading-none select-none">
          <span style={{ color: "#1e4a9e" }}>Kay</span>
          <span style={{ color: "#F5A623" }}>Jend</span>
        </span>
        <span className="text-[9px] text-gray-500 font-semibold tracking-[0.2em] uppercase mt-1.5">
          Le marche du campus
        </span>
      </div>

      <p className="text-[13px] text-gray-500 leading-relaxed max-w-xs">
        La marketplace de l&apos;Universite Iba Der Thiam de Thies.
        Achetez et vendez facilement entre etudiants.
      </p>
    </motion.div>
  );
}

export default FooterLogo;