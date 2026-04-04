"use client";
import Link from "next/link";
import {
  TbDeviceLaptop, TbShirt, TbHome2, TbBook2,
  TbToolsKitchen2, TbBrush, TbBriefcase, TbCategory2,
} from "react-icons/tb";

const categories = [
  { label: "Electronique", icon: TbDeviceLaptop, color: "bg-blue-50 text-blue-500", border: "border-blue-100", href: "/produits?cat=Electronique" },
  { label: "Vetements", icon: TbShirt, color: "bg-purple-50 text-purple-500", border: "border-purple-100", href: "/produits?cat=Vetements" },
  { label: "Logement", icon: TbHome2, color: "bg-green-50 text-green-600", border: "border-green-100", href: "/produits?cat=Logement" },
  { label: "Livres & Cours", icon: TbBook2, color: "bg-orange-50 text-orange-500", border: "border-orange-100", href: "/produits?cat=Livres" },
  { label: "Alimentation", icon: TbToolsKitchen2, color: "bg-red-50 text-red-500", border: "border-red-100", href: "/produits?cat=Alimentation" },
  { label: "Beaute", icon: TbBrush, color: "bg-pink-50 text-pink-500", border: "border-pink-100", href: "/produits?cat=Beaute" },
  { label: "Services", icon: TbBriefcase, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-100", href: "/produits?cat=Services" },
  { label: "Tout voir", icon: TbCategory2, color: "bg-gray-100 text-gray-500", border: "border-gray-200", href: "/produits" },
];

const TopCategories = () => (
  <section className="bg-gray-50 border-y border-gray-100 py-10 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#2B3090]">Categories populaires</h2>
          <p className="text-sm text-gray-400 mt-0.5">Explorez par type de produit</p>
        </div>
        <Link href="/produits" className="text-xs text-[#2B3090] font-semibold hover:underline">Voir tout</Link>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <Link key={cat.label} href={cat.href}
            className="flex flex-col items-center gap-2.5 group cursor-pointer">
            <div className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center ${cat.color} border ${cat.border} group-hover:scale-110 group-hover:shadow-md transition-all duration-200`}>
              <cat.icon size={28} />
            </div>
            <span className="text-xs font-semibold text-gray-600 text-center leading-tight group-hover:text-[#2B3090] transition-colors">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default TopCategories;