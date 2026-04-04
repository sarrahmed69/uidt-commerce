"use client";
import { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { createBrowserClient } from "@supabase/ssr";
import MainLayout from "@/components/common/layouts/main/MainLayout";
import { motion } from "framer-motion";
import {
  TbShieldCheck, TbBrandWhatsapp, TbUsers,
  TbStar, TbCurrencyDollar, TbArrowRight, TbBuildingStore,
  TbUser, TbMail, TbPhone, TbLock, TbEye, TbEyeOff,
} from "react-icons/tb";
import Link from "next/link";

export default function DevenirVendeurPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    nom: "", email: "", telephone: "", password: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async () => {
    setError(null);
    if (!form.nom || !form.email || !form.password) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      // Creer le compte uniquement — pas de boutique ici
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.nom,
            phone: form.telephone || null,
            is_vendor: true,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already")) {
          // Compte existe -> connecter
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });
          if (signInError) {
            setError("Ce compte existe deja. Verifiez votre mot de passe.");
            setLoading(false);
            return;
          }
          // Marquer comme vendeur
          await supabase.auth.updateUser({ data: { is_vendor: true } });
        } else {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
      } else {
        // Nouveau compte — marquer comme vendeur
        await supabase.auth.updateUser({ data: { is_vendor: true } });
      }

      // Enregistrer dans vendor_accounts (permanent)
      await supabase.from("vendor_accounts").upsert({ user_id: (await supabase.auth.getUser()).data.user?.id }, { onConflict: "user_id" });
      router.push("/vendor/dashboard");
    } catch (e) {
      console.error(e);
      setError("Une erreur est survenue. Reessayez.");
    }
    setLoading(false);
  };

  const advantages = [
    { icon: TbCurrencyDollar, title: "1 000 FCFA/mois seulement", desc: "Abonnement mensuel fixe — aucune commission sur vos ventes." },
    { icon: TbBrandWhatsapp, title: "Commandes via WhatsApp", desc: "Recevez les commandes directement sur votre WhatsApp." },
    { icon: TbShieldCheck, title: "Paiement Wave & Orange Money", desc: "Recevez vos paiements directement sur votre mobile." },
    { icon: TbUsers, title: "Communaute etudiante", desc: "Acces immediat a toute la communaute du campus." },
    { icon: TbStar, title: "Badge vendeur verifie", desc: "Badge apres validation de votre profil par UIDT Commerce." },
    { icon: TbBuildingStore, title: "Boutique personnalisee", desc: "Votre propre page produits avec photo et description." },
  ];

  const steps = [
    { n: "01", title: "Creez votre compte", desc: "Inscrivez-vous avec votre e-mail et un mot de passe." },
    { n: "02", title: "Ouvrez votre boutique", desc: "Depuis votre dashboard, creez votre boutique en 1 clic." },
    { n: "03", title: "Ajoutez vos produits", desc: "Photos, descriptions, prix en FCFA — en quelques clics." },
    { n: "04", title: "Recevez vos commandes", desc: "Les acheteurs vous contactent directement via WhatsApp." },
  ];

  const inputClass = "w-full bg-[#f5f0eb] rounded-xl px-4 py-3 pl-10 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-primary py-20">
        <MainLayout>
          <motion.div className="text-center text-white"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="bg-white/20 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
              UIDT Commerce — Campus Marketplace
            </span>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mt-4 mb-6 leading-tight">
              Ouvrez votre boutique<br />sur le campus
            </h1>
            <p className="text-orange-100 text-lg max-w-2xl mx-auto mb-8">
              Vendez vos cours, creations et services a toute la communaute.
              Abonnement a seulement 1 000 FCFA/mois — aucune commission.
            </p>
          </motion.div>
        </MainLayout>
      </div>

      {/* Formulaire — compte uniquement */}
      <div className="bg-[#f5f0eb] py-16">
        <div className="max-w-sm mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <TbBuildingStore className="text-white" size={22} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">UIDT Commerce</p>
              <p className="text-xs text-gray-500">Espace Vendeur</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between mb-8 shadow-sm">
            <div className="flex items-center gap-2">
              <span>🎉</span>
              <div>
                <p className="text-primary font-bold text-sm">1er mois GRATUIT !</p>
                <p className="text-xs text-gray-500">puis 1 000 FCFA/mois</p>
              </div>
            </div>
            <div className="text-xs text-gray-600 text-right space-y-1">
              <p>Sans commission</p>
              <p>Produits illimites</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Creer mon compte vendeur</h2>
          <p className="text-gray-500 text-sm mb-6">
            Etape 1/2 — Vous creerez votre boutique depuis votre dashboard
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Nom */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <TbUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className={inputClass} placeholder="Votre nom"
                  value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <TbMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className={inputClass} type="email" placeholder="email@gmail.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>

            {/* Telephone */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Telephone</label>
              <div className="relative">
                <TbPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className={inputClass} placeholder="+221 77 123 45 67"
                  value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <TbLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className={inputClass + " pr-10"}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <TbEyeOff size={18} /> : <TbEye size={18} />}
                </button>
              </div>
            </div>

            <p className="text-primary text-xs font-medium leading-relaxed">
              En vous inscrivant, vous acceptez nos conditions d&apos;utilisation.
              L&apos;abonnement est de 1 000 FCFA/mois apres le 1er mois gratuit.
            </p>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-[#8B5E3C] hover:bg-[#7a5235] disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
              {loading ? "Creation en cours..." : (<>Creer mon compte vendeur <TbArrowRight size={18} /></>)}
            </button>

            <p className="text-center text-sm text-gray-500">
              Deja vendeur ?{" "}
              <Link href="/auth/sign-in" className="text-primary font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Avantages */}
      <MainLayout className="py-16">
        <h2 className="font-heading text-3xl font-bold text-primary text-center mb-10">
          Pourquoi vendre sur UIDT Commerce ?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((adv, i) => (
            <motion.div key={adv.title}
              className="bg-light border border-orange-100 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
              <adv.icon size={32} className="text-primary mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">{adv.title}</h3>
              <p className="text-sm text-gray-500">{adv.desc}</p>
            </motion.div>
          ))}
        </div>
      </MainLayout>

      {/* Etapes */}
      <div className="bg-gray-50 py-16">
        <MainLayout>
          <h2 className="font-heading text-3xl font-bold text-primary text-center mb-12">
            Comment ca marche ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.n} className="text-center"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.15 }}>
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step.n}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </MainLayout>
      </div>

      {/* CTA */}
      <div className="bg-primary py-16 text-center text-white">
        <h2 className="font-heading text-3xl font-bold mb-4">Pret a vendre sur le campus ?</h2>
        <p className="text-orange-100 mb-8 max-w-lg mx-auto">
          Rejoignez UIDT Commerce et commencez a vendre des aujourd&apos;hui.
          1 000 FCFA/mois. Sans commission. Paiements directs.
        </p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-white text-primary font-bold px-10 py-4 rounded-full hover:bg-orange-50 transition-colors inline-flex items-center gap-2">
          Creer mon compte vendeur <TbArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}