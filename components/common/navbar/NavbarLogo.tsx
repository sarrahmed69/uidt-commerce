import Link from "next/link";
import Image from "next/image";
import { TbSmartHome } from "react-icons/tb";

const NavbarLogo = () => (
  <Link href="/" title="Retour a l accueil" aria-label="UIDT Commerce — Accueil"
    className="flex items-center gap-x-3 group">
    <div className="relative">
      <Image src="/images/uidt-logo.png" alt="Universite de Thies" width={40} height={40}
        className="rounded-full object-cover flex-shrink-0" style={{ width: 40, height: 40 }} />
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#F5A623] rounded-full flex items-center justify-center shadow-sm group-hover:bg-[#2B3090] transition-colors">
        <TbSmartHome size={11} className="text-white" />
      </div>
    </div>
    <div className="flex flex-col leading-tight">
      <span className="font-bold text-[#2B3090] text-xl tracking-tight leading-none">
        UIDT Commerce
      </span>
      <span className="hidden sm:block text-[10px] text-[#F5A623] font-semibold tracking-widest uppercase leading-none mt-0.5">
        Campus Marketplace
      </span>
    </div>
  </Link>
);
export default NavbarLogo;