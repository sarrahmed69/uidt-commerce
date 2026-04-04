"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  TbLayoutDashboard, TbPackage, TbShoppingBag,
  TbSettings, TbLogout, TbMenu2, TbX, TbBuildingStore,
  TbCreditCard, TbLoader2, TbHome,
} from "react-icons/tb";

const NAV = [
  { label: "Tableau de bord", href: "/vendor/dashboard", icon: TbLayoutDashboard },
  { label: "Mes produits", href: "/vendor/produits", icon: TbPackage },
  { label: "Commandes", href: "/vendor/commandes", icon: TbShoppingBag },
  { label: "Abonnement", href: "/vendor/abonnement", icon: TbCreditCard },
  { label: "Parametres", href: "/vendor/parametres", icon: TbSettings },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [shopName, setShopName] = useState("Espace Vendeur");

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }
      // Charger le nom boutique en arriere-plan seulement
      createClient()
        .from("vendors")
        .select("id, shop_name")
        .eq("user_id", user.id)
        .limit(1)
        .then(({ data }) => {
          const saved = localStorage.getItem("vendor_selected_id");
          const selected = data?.find((v: any) => v.id === saved) ?? data?.[0];
          if (selected?.shop_name) setShopName(selected.shop_name);
        })
        .catch(() => {});
      setReady(true);
    });
  }, []);

  const logout = async () => {
    await createClient().auth.signOut();
    localStorage.removeItem("vendor_selected_id");
    router.push("/");
  };

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <TbLoader2 className="animate-spin text-primary" size={36} />
    </div>
  );

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={mobile
      ? "flex flex-col h-full"
      : "w-64 bg-white border-r border-gray-100 fixed h-full hidden lg:flex flex-col z-20"}>
      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0a2a1f] rounded-xl flex items-center justify-center flex-shrink-0">
          <TbBuildingStore className="text-white" size={20} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{shopName}</p>
          <p className="text-xs text-gray-400">Espace vendeur</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active ? "bg-[#0a2a1f] text-white font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}>
              <item.icon size={18} className="flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link href="/user/dashboard" onClick={() => setOpen(false)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <TbHome size={18} /> Espace acheteur
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
          <TbLogout size={18} /> Se deconnecter
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0a2a1f] rounded-lg flex items-center justify-center">
            <TbBuildingStore className="text-white" size={16} />
          </div>
          <span className="font-bold text-gray-800 text-sm truncate max-w-[180px]">{shopName}</span>
        </div>
        <button onClick={() => setOpen(true)}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
          <TbMenu2 size={20} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="absolute top-4 right-4">
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <TbX size={18} />
              </button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}