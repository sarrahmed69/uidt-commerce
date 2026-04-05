"use client";
import MainLayout from "../layouts/main/MainLayout";
import Link from "next/link";
import { TbHome, TbSparkles } from "react-icons/tb";
import { WordRotate } from "@/components/ui/word-rotate";
import { cn } from "@/lib/utils";

interface NavbarTopProps { stickToTop?: boolean; }

const NavbarTop: React.FC<NavbarTopProps> = ({ stickToTop = false }) => {
  return (
    <div className={cn("relative bg-[#2B3090] overflow-hidden", stickToTop && "sticky top-0 z-50")}>
      <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 0% 50%, #818cf8 0%, transparent 40%), radial-gradient(circle at 100% 50%, #6366f1 0%, transparent 40%)"}} />
      <div className="absolute inset-0" style={{backgroundImage:"repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 60px)"}} />
      <MainLayout className="relative">
        <div className="flex justify-between items-center text-white h-9 text-xs">

          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-5 h-5 bg-white/15 rounded-md flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <TbHome size={12} className="text-white" />
            </div>
            <span className="hidden sm:inline-block font-bold tracking-wide text-white/90 group-hover:text-white transition-colors">
              UIDT Commerce
            </span>
          </Link>

          <div className="flex items-center gap-3 flex-1 justify-center px-4">
            <TbSparkles size={11} className="text-indigo-300 flex-shrink-0 hidden md:block" />
            <div className="hidden md:flex items-center gap-2">
              <WordRotate
                className="text-xs font-medium text-white/85"
                words={[
                  "Bienvenue sur UIDT Commerce — Campus Marketplace",
                  "Paiement Wave & Orange Money acceptes",
                  "Commandez directement via WhatsApp",
                  "Achetez & vendez entre etudiants",
                  "Abonnement vendeur : 1 000 FCFA/mois",
                  "La marketplace de votre campus",
                ]}
              />
              <span className="text-white/30 mx-1">·</span>
              <Link href="/produits" className="text-white/70 hover:text-white font-semibold transition-colors whitespace-nowrap hover:underline underline-offset-2">
                Voir les produits
              </Link>
            </div>
            <Link href="/produits" className="md:hidden text-white/80 hover:text-white font-semibold transition-colors">
              Produits
            </Link>
          </div>

          <div className="flex-shrink-0 w-[80px]" />

        </div>
      </MainLayout>
    </div>
  );
};
export default NavbarTop;