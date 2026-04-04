"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbPackage, TbBuildingStore, TbArrowLeft, TbUser, TbBrandWhatsapp, TbLoader2, TbCheck } from "react-icons/tb";

export default function VendorParametres() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ shopName: "", whatsapp: "", description: "" });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setForm({ shopName: user.user_metadata?.shopName || "", whatsapp: user.user_metadata?.whatsapp || "", description: "" });
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><TbLoader2 className="animate-spin text-primary" size={36} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 fixed h-full hidden lg:flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <TbBuildingStore className="text-white" size={20} />
            </div>
            <div><p className="font-bold text-gray-800 text-sm">Ma Boutique</p><p className="text-xs text-gray-400">Espace vendeur</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: "Tableau de bord", href: "/vendor/dashboard" },
            { label: "Mes produits", href: "/vendor/produits" },
            { label: "Commandes", href: "/vendor/commandes" },
            { label: "Parametres", href: "/vendor/parametres", active: true },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${item.active ? "bg-primary text-white font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
              <TbPackage size={17} /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 lg:ml-64 p-6 md:p-10 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/dashboard" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
            <TbArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div><h1 className="text-2xl font-bold text-gray-900">Parametres</h1><p className="text-sm text-gray-500">Configurez votre boutique</p></div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><TbUser className="text-primary" size={20} /> Informations du compte</h2>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500" value={user?.email || ""} disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nom de la boutique</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="Ma boutique campus" value={form.shopName} onChange={e => setForm(f => ({...f, shopName: e.target.value}))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1"><TbBrandWhatsapp size={15} className="text-green-500" /> WhatsApp</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="+221 77 123 45 67" value={form.whatsapp} onChange={e => setForm(f => ({...f, whatsapp: e.target.value}))} />
            </div>
          </div>

          <button onClick={save} disabled={saving}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <><TbLoader2 size={20} className="animate-spin" /> Enregistrement...</> : saved ? <><TbCheck size={20} /> Enregistre !</> : "Enregistrer les modifications"}
          </button>
        </div>
      </main>
    </div>
  );
}