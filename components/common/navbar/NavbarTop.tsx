"use client";
import MainLayout from "../layouts/main/MainLayout";
import Link from "next/link";
import { TbHome, TbSparkles, TbStar } from "react-icons/tb";
import { WordRotate } from "@/components/ui/word-rotate";
import { cn } from "@/lib/utils";

interface NavbarTopProps { stickToTop?: boolean; }

const NavbarTop: React.FC<NavbarTopProps> = ({ stickToTop = false }) => {
  return (
    <div className={cn("relative overflow-hidden", stickToTop && "sticky top-0 z-50")}
      style={{background: "linear-gradient(135deg, #1a1f6e 0%, #2B3090 50%, #1a1f6e 100%)"}}>
      <div className="absolute inset-0" style={{backgroundImage:"repeating-linear-gradient(90deg, rgba(245,166,35,0.04) 0px, rgba(245,166,35,0.04) 1px, transparent 1px, transparent 80px)"}} />
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{background:"linear-gradient(180deg, transparent, #F5A623, transparent)"}} />
      <div className="absolute right-0 top-0 bottom-0 w-1" style={{background:"linear-gradient(180deg, transparent, #F5A623, transparent)"}} />
      <MainLayout className="relative">
        <div className="flex justify-between items-center text-white h-9 text-xs">

          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-6 h-6 rounded-md flex items-center justify-center transition-all border"
              style={{background:"rgba(245,166,35,0.15)", borderColor:"rgba(245,166,35,0.3)"}}>
              <TbHome size={13} style={{color:"#F5A623"}} />
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="font-black tracking-wider text-white text-xs group-hover:text-white/80 transition-colors">UIDT</span>
              <span className="font-black tracking-wider text-xs" style={{color:"#F5A623"}}>Commerce</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 flex-1 justify-center px-4">
            <TbStar size={10} className="hidden md:block flex-shrink-0" style={{color:"#F5A623"}} />
            <div className="hidden md:flex items-center gap-2">
              <WordRotate
                className="text-xs font-medium text-white/80"
                words={[
                  "Bienvenue sur UIDT Commerce — Campus Marketplace",
                  "Paiement Wave & Orange Money acceptes",
                  "Commandez directement via WhatsApp",
                  "Achetez & vendez entre etudiants",
                  "Abonnement vendeur : 1 000 FCFA/mois",
                  "La marketplace de votre campus",
                ]}
              />
              <span className="text-white/20 mx-1">|</span>
              <Link href="/produits"
                className="font-bold transition-all text-xs px-2.5 py-0.5 rounded-full border"
                style={{color:"#F5A623", borderColor:"rgba(245,166,35,0.35)", background:"rgba(245,166,35,0.08)"}}>
                Produits →
              </Link>
            </div>
            <Link href="/produits" className="md:hidden font-bold text-xs" style={{color:"#F5A623"}}>
              Produits
            </Link>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <TbSparkles size={10} style={{color:"#F5A623"}} className="hidden sm:block" />
            <span className="hidden sm:block text-white/40 text-[10px] font-medium tracking-widest uppercase">Campus</span>
          </div>

        </div>
      </MainLayout>
    </div>
  );
};
export default NavbarTop;