"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TbUser, TbPackage, TbHeart, TbMapPin, TbLogout,
  TbShoppingBag, TbChevronRight, TbBuildingStore,
  TbLoader2, TbEdit, TbLayoutDashboard,
} from "react-icons/tb";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isVendor, setIsVendor] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      setUser(user);

      // Verifier si vendeur directement via Supabase (plus fiable)
      const { data: vendors } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1);
      if (vendors && vendors.length > 0) setIsVendor(true);

      // Compter commandes acheteur
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("buyer_id", user.id);
      setOrderCount(count || 0);

      setLoading(false);
    };
    load();
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <TbLoader2 className="animate-spin text-primary" size={36} />
    </div>
  );

  const firstName = user?.user_metadata?.firstName || user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Utilisateur";
  const lastName = user?.user_metadata?.lastName || user?.user_metadata?.full_name?.split(" ")[1] || "";
  const initials = (firstName[0] + (lastName[0] || "")).toUpperCase();

  const menuItems = [
    { icon: TbShoppingBag, label: "Mes commandes", sub: "Suivre et gerer vos achats", href: "/user/commandes", color: "bg-blue-50 text-blue-500" },
    { icon: TbHeart, label: "Mes favoris", sub: "Produits sauvegardes", href: "/user/favoris", color: "bg-red-50 text-red-500" },
    { icon: TbMapPin, label: "Mes adresses", sub: "Gerer vos adresses de livraison", href: "/user/adresses", color: "bg-green-50 text-green-500" },
    { icon: TbUser, label: "Mon profil", sub: "Modifier vos informations", href: "/user/profil", color: "bg-purple-50 text-purple-500" },
    isVendor
      ? { icon: TbLayoutDashboard, label: "Mon espace vendeur", sub: "Gerer votre boutique et vos ventes", href: "/vendor/dashboard", color: "bg-orange-50 text-primary" }
      : { icon: TbBuildingStore, label: "Devenir vendeur", sub: "Creez votre boutique campus", href: "/devenir-vendeur", color: "bg-orange-50 text-primary" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-6 pt-10 pb-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Mon espace</p>
            <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
            <p className="text-white/60 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {initials}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10">
        {/* Carte profil */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg">
              {initials}
            </div>
            <div>
              <p className="font-bold text-gray-800">{firstName} {lastName}</p>
              <p className="text-xs text-gray-400">
                {isVendor ? "✓ Vendeur actif" : "Compte verifie"}
              </p>
            </div>
          </div>
          <Link href="/user/profil" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors">
            <TbEdit size={18} />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Commandes", value: orderCount },
            { label: "Favoris", value: 0 },
            { label: "Avis", value: 0 },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Bouton espace vendeur prominent */}
        {isVendor && (
          <Link href="/vendor/dashboard"
            className="flex items-center gap-4 bg-primary text-white rounded-2xl px-5 py-4 mb-4 shadow-sm hover:bg-primary/90 transition-colors">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <TbLayoutDashboard size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Mon espace vendeur</p>
              <p className="text-xs text-white/70">Tableau de bord, produits, commandes</p>
            </div>
            <TbChevronRight size={18} className="text-white/60" />
          </Link>
        )}

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {menuItems.map((item, i) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${i < menuItems.length - 1 ? "border-b border-gray-50" : ""}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <TbChevronRight size={18} className="text-gray-300" />
            </Link>
          ))}
        </div>

        {/* Deconnexion */}
        <button onClick={logout}
          className="w-full bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:bg-red-50 transition-colors group mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
            <TbLogout size={20} />
          </div>
          <span className="font-medium text-red-500 text-sm">Se deconnecter</span>
        </button>
      </div>
    </div>
  );
}