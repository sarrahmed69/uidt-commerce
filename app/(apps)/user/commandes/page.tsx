"use client";
import Link from "next/link";
import { TbArrowLeft, TbShoppingBag, TbBrandWhatsapp } from "react-icons/tb";
export default function UserCommandes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/user/dashboard" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
          <TbArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-gray-800">Mes commandes</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TbShoppingBag className="text-gray-300" size={48} />
        </div>
        <p className="font-semibold text-gray-600 text-lg mb-2">Aucune commande pour l instant</p>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">
          Vos commandes passees via WhatsApp apparaitront ici prochainement.
        </p>
        <Link href="/produits"
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-accent transition-colors">
          <TbBrandWhatsapp size={18} /> Voir les produits
        </Link>
      </div>
    </div>
  );
}