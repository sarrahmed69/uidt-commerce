"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  TbArrowLeft, TbPhoto, TbX, TbTag, TbAlignLeft,
  TbCurrencyDollar, TbBrandWhatsapp, TbStack2,
  TbCheck, TbLoader2, TbLock, TbCreditCard,
} from "react-icons/tb";

const CATEGORIES = [
  "Alimentation", "Fournitures scolaires", "Vetements",
  "Electronique", "Livres & Cours", "Services", "Beaute", "Autre",
];

export default function ModifierProduitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [checking, setChecking] = useState(true);
  const [suspended, setSuspended] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    nom: "", description: "", prix: "",
    categorie: "", stock: "1", whatsapp: "", livraison: false,
  });

  const set = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }

      const vendorId = localStorage.getItem("vendor_selected_id");
      if (!vendorId) { router.push("/vendor/dashboard"); return; }

      // Verification abonnement
      const { data: vendor } = await supabase
        .from("vendors")
        .select("subscription_status, subscription_expires_at")
        .eq("id", vendorId)
        .eq("user_id", user.id)
        .single();

      if (!vendor) { router.push("/vendor/dashboard"); return; }

      const expired = !vendor.subscription_expires_at ||
        new Date(vendor.subscription_expires_at) <= new Date();
      const isOk =
        (vendor.subscription_status === "active" && !expired) ||
        (vendor.subscription_status === "trial" && !expired) ||
        vendor.subscription_status === "pending";

      if (!isOk) { setSuspended(true); setChecking(false); return; }

      // Charger le produit
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("vendor_id", vendorId)
        .single();

      if (!product) { router.push("/vendor/produits"); return; }

      setForm({
        nom: product.name || "",
        description: product.description || "",
        prix: product.price?.toString() || "",
        categorie: product.category || "",
        stock: product.stock?.toString() || "1",
        whatsapp: product.whatsapp_contact || "",
        livraison: product.delivery_available || false,
      });
      setExistingImages(product.images || []);
      setChecking(false);
    })();
  }, [id]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const total = existingImages.length + newFiles.length;
    const newF = Array.from(e.target.files || []).slice(0, 4 - total);
    newF.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setNewPreviews(prev => [...prev, ev.target?.result as string].slice(0, 4));
      reader.readAsDataURL(file);
    });
    setNewFiles(prev => [...prev, ...newF].slice(0, 4));
  };

  const removeExisting = (url: string) => {
    setExistingImages(prev => prev.filter(u => u !== url));
    setRemovedImages(prev => [...prev, url]);
  };

  const removeNew = (i: number) => {
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i));
    setNewFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prix || !form.categorie) {
      alert("Veuillez remplir le nom, le prix et la categorie.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Supprimer les images retirees
      if (removedImages.length) {
        const paths = removedImages.map(url => url.split("/products/")[1]).filter(Boolean);
        if (paths.length) await supabase.storage.from("products").remove(paths);
      }

      // Upload nouvelles images
      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("products").upload(path, file, { upsert: true });
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        }
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      const { error } = await supabase.from("products").update({
        name: form.nom,
        description: form.description,
        price: parseFloat(form.prix),
        category: form.categorie,
        stock: parseInt(form.stock),
        whatsapp_contact: form.whatsapp || null,
        delivery_available: form.livraison,
        images: finalImages,
      }).eq("id", id);

      if (error) { alert("Erreur: " + error.message); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push("/vendor/produits"), 1800);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <TbLoader2 className="animate-spin text-primary" size={36} />
    </div>
  );

  if (suspended) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-red-500 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <TbLock className="text-white" size={40} />
          </div>
          <h2 className="text-white font-bold text-xl">Acces bloque</h2>
          <p className="text-white/70 text-sm mt-1">Abonnement expire ou inactif</p>
        </div>
        <div className="p-6 space-y-4 text-center">
          <p className="text-gray-600 text-sm">
            Vous ne pouvez pas modifier ce produit car votre boutique est suspendue.
            Renouvelez votre abonnement pour retrouver l acces complet.
          </p>
          <Link href="/vendor/abonnement"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <TbCreditCard size={18} /> Renouveler mon abonnement
          </Link>
          <Link href="/vendor/produits" className="block text-sm text-gray-400 hover:text-gray-600">
            Retour a mes produits
          </Link>
        </div>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TbCheck className="text-green-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Produit modifie !</h2>
        <p className="text-gray-500">Redirection vers vos produits...</p>
      </div>
    </div>
  );

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-10 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vendor/produits"
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
          <TbArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
          <p className="text-sm text-gray-500">Modifiez les informations de votre produit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TbPhoto className="text-primary" size={20} /> Photos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {existingImages.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeExisting(url)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <TbX size={14} />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-md font-medium">Principale</span>}
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={"new-" + i} className="relative aspect-square rounded-xl overflow-hidden border border-blue-200 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeNew(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <TbX size={14} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">Nouvelle</span>
                </div>
              ))}
              {totalImages < 4 && (
                <button onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors">
                  <TbPhoto size={24} />
                  <span className="text-xs font-medium">Ajouter</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
            <p className="text-xs text-gray-400">4 photos max.</p>
          </div>

          {/* Infos de base */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <TbTag className="text-primary" size={20} /> Informations
            </h2>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nom du produit <span className="text-red-500">*</span></label>
              <input className={inputClass} value={form.nom} onChange={e => set("nom", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block"><TbAlignLeft size={15} className="inline mr-1" />Description</label>
              <textarea className={inputClass + " resize-none"} rows={4} value={form.description} onChange={e => set("description", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Categorie <span className="text-red-500">*</span></label>
              <select className={inputClass} value={form.categorie} onChange={e => set("categorie", e.target.value)}>
                <option value="">Choisir une categorie</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Prix & Stock */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TbCurrencyDollar className="text-primary" size={20} /> Prix & Stock
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Prix (FCFA) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input className={inputClass + " pr-14"} type="number" min="0" value={form.prix} onChange={e => set("prix", e.target.value)} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">FCFA</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block"><TbStack2 size={15} className="inline mr-1" />Stock</label>
                <input className={inputClass} type="number" min="1" value={form.stock} onChange={e => set("stock", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <TbBrandWhatsapp className="text-green-500" size={20} /> Contact & Livraison
            </h2>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">WhatsApp (optionnel)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+221</span>
                <input className={inputClass + " pl-14"} type="tel" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={form.livraison} onChange={e => set("livraison", e.target.checked)} />
                <div className={`w-11 h-6 rounded-full transition-colors ${form.livraison ? "bg-primary" : "bg-gray-200"}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.livraison ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm text-gray-700 font-medium">Livraison disponible sur le campus</span>
            </label>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Apercu</h2>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              {existingImages[0] ? (
                <img src={existingImages[0]} alt="" className="w-full aspect-square object-cover" />
              ) : newPreviews[0] ? (
                <img src={newPreviews[0]} alt="" className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-gray-50 flex flex-col items-center justify-center text-gray-300">
                  <TbPhoto size={48} /><p className="text-xs mt-2">Photo principale</p>
                </div>
              )}
            </div>
            <p className="font-bold text-gray-900 truncate">{form.nom || "Nom du produit"}</p>
            <p className="text-primary font-bold text-xl">{form.prix ? parseInt(form.prix).toLocaleString("fr-FR") + " FCFA" : "— FCFA"}</p>
            {form.categorie && <span className="text-xs bg-orange-100 text-primary px-2 py-1 rounded-full font-medium inline-block">{form.categorie}</span>}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><TbLoader2 size={20} className="animate-spin" /> Sauvegarde...</> : <><TbCheck size={20} /> Sauvegarder</>}
            </button>
            <Link href="/vendor/produits" className="block text-center text-sm text-gray-400 hover:text-gray-600">Annuler</Link>
          </div>
        </div>
      </div>
    </div>
  );
}