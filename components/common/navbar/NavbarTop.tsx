"use client";
import MainLayout from "../layouts/main/MainLayout";
import Link from "next/link";
import { useRef } from "react";
import { TbArrowLeft, TbSmartHome } from "react-icons/tb";
import { WordRotate } from "@/components/ui/word-rotate";
import { cn } from "@/lib/utils";

interface NavbarTopProps {
  stickToTop?: boolean;
}

const currencies = ["FCFA"];
const languages = ["Francais"];

const NavbarTop: React.FC<NavbarTopProps> = ({ stickToTop = false }) => {
  const currencyRef = useRef<HTMLSelectElement>(null);
  const languageRef = useRef<HTMLSelectElement>(null);

  return (
    <MainLayout className={cn("bg-[#2B3090]", stickToTop && "sticky top-0 z-50")}>
      <div className="flex justify-between items-center text-white h-10 text-sm">
        <div>
          <Link
            className="flex items-center gap-x-2 font-semibold"
            href="/"
          >
            <TbArrowLeft size={16} /><TbSmartHome size={16} />
            <span className="hidden sm:inline-block">UIDT Commerce</span>
          </Link>
        </div>

        <div className="flex items-center gap-x-2">
          <div className="hidden md:flex items-center gap-x-2">
            <WordRotate
              className="text-sm font-medium text-white"
              words={[
                "Bienvenue sur UIDT Commerce — Campus Marketplace",
                "Paiement Wave & Orange Money acceptes",
                "Commandez directement via WhatsApp",
                "Achetez & vendez entre etudiants",
                "Abonnement vendeur : 1 000 FCFA/mois",
                "La marketplace de votre campus",
              ]}
            />
            {" | "}
          </div>
          <Link href="/produits" title="Produits">
            Produits
          </Link>
        </div>

        <div className="flex items-center gap-x-3">
          <select
            title="Devise"
            name="currency"
            className="bg-transparent border-none outline-none"
            ref={currencyRef}
          >
            {currencies.map((c) => (
              <option className="text-slate-950" value={c} key={c}>{c}</option>
            ))}
          </select>
          <select
            title="Langue"
            name="language"
            className="bg-transparent border-none outline-none"
            ref={languageRef}
          >
            {languages.map((l) => (
              <option className="text-slate-950" value={l} key={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
    </MainLayout>
  );
};

export default NavbarTop;