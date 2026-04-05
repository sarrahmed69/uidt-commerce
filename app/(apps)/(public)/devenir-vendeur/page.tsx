"use client";
import { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { createBrowserClient } from "@supabase/ssr";
import MainLayout from "@/components/common/layouts/main/MainLayout";
import { motion } from "framer-motion";
import { TbShieldCheck, TbBrandWhatsapp, TbUsers, TbStar, TbCurrencyDollar, TbArrowRight, TbBuildingStore, TbUser, TbMail, TbPhone, TbLock, TbEye, TbEyeOff, TbCheck, TbSparkles, TbRocket, TbTrendingUp } from "react-icons/tb";
import Link from "next/link";

export default function DevenirVendeurPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", password: "" });

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleSubmit = async () => {
    setError(null);
    if (!form.nom || !form.email || !form.password) { setError("Veuillez remplir tous les champs obligatoires"); return; }
    if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caracteres"); return; }
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.nom, phone: form.telephone || null, is_vendor: true } } });
      if (signUpError) {
        if (signUpError.message.includes("already")) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
          if (signInError) { setError("Ce compte existe deja. Verifiez votre mot de passe."); setLoading(false); return; }
        } else { setError(signUpError.message); setLoading(false); return; }
      }
      await supabase.auth.updateUser({ data: { is_vendor: true } });
      await supabase.from("vendor_accounts").upsert({ user_id: (await supabase.auth.getUser()).data.user?.id }, { onConflict: "user_id" });
      router.push("/vendor/dashboard");
    } catch (e) { setError("Une erreur est survenue. Reessayez."); }
    setLoading(false);
  };

  const advantages = [
    { icon: TbCurrencyDollar, title: "1 000 FCFA/mois", desc: "Abonnement fixe, zero commission sur vos ventes.", color: "from-blue-500 to-indigo-600" },
    { icon: TbBrandWhatsapp, title: "Commandes WhatsApp", desc: "Recevez les commandes directement sur votre telephone.", color: "from-indigo-500 to-violet-600" },
    { icon: TbShieldCheck, title: "Paiement Wave & OM", desc: "Recevez vos paiements directement sur mobile.", color: "from-violet-500 to-purple-600" },
    { icon: TbUsers, title: "Communaute campus", desc: "Acces immediat a toute la communaute UIDT.", color: "from-purple-500 to-pink-600" },
    { icon: TbStar, title: "Badge verifie", desc: "Badge officiel apres validation de votre profil.", color: "from-amber-500 to-orange-600" },
    { icon: TbBuildingStore, title: "Boutique dediee", desc: "Votre propre page avec photos et descriptions.", color: "from-rose-500 to-pink-600" },
  ];

  const steps = [
    { icon: TbUser, title: "Creez votre compte", desc: "Inscrivez-vous avec votre e-mail en 30 secondes." },
    { icon: TbBuildingStore, title: "Ouvrez votre boutique", desc: "Depuis votre dashboard, creez votre boutique en 1 clic." },
    { icon: TbSparkles, title: "Ajoutez vos produits", desc: "Photos, descriptions, prix FCFA en quelques clics." },
    { icon: TbRocket, title: "Recevez vos commandes", desc: "Les acheteurs vous contactent via WhatsApp." },
  ];

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pl-11 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#2B3090]/20 focus:border-[#2B3090] transition-all";

  return (
    <div className="min-h-screen bg-white">

      <div className="relative overflow-hidden bg-[#2B3090]">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 20% 50%, #818cf8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)"}} />
        <MainLayout className="relative py-24 md:py-32">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
              <TbSparkles size={14} className="text-yellow-400" /> UIDT Commerce — Campus Marketplace
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">
              Vendez sur<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-200">le campus.</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              Creez votre boutique, publiez vos produits, recevez vos commandes. <span className="text-white font-semibold">1 000 FCFA/mois</span> — aucune commission.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {["1er mois gratuit", "Zero commission", "Produits illimites"].map(t => (
                <span key={t} className="flex items-center gap-1.5 bg-white/10 text-white/80 text-sm px-4 py-2 rounded-full border border-white/15">
                  <TbCheck size={14} className="text-indigo-300" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </MainLayout>
        <div className="h-16 bg-white" style={{clipPath:"ellipse(55% 100% at 50% 100%)"}} />
      </div>

      <div className="bg-white py-4 pb-20">
        <div className="max-w-md mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="bg-white rounded-3xl shadow-[0_8px_60px_rgba(43,48,144,0.12)] border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-[#2B3090] to-[#1e2570] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Etape 1 sur 2</p>
                  <h2 className="text-white text-xl font-black">Creer mon compte</h2>
                  <p className="text-white/50 text-xs mt-0.5">Vous creerez votre boutique depuis le dashboard</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <TbBuildingStore className="text-white" size={22} />
                </div>
              </div>
              <div className="relative mt-4 bg-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <div>
                    <p className="text-indigo-200 font-bold text-sm">1er mois GRATUIT !</p>
                    <p className="text-white/40 text-xs">puis 1 000 FCFA/mois</p>
                  </div>
                </div>
                <div className="text-right text-xs text-white/50 space-y-0.5">
                  <p>Sans commission</p>
                  <p>Produits illimites</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">⚠ {error}</div>}

              {[
                { label: "Nom complet", key: "nom", icon: TbUser, type: "text", placeholder: "Votre nom complet", required: true },
                { label: "Email", key: "email", icon: TbMail, type: "email", placeholder: "email@gmail.com", required: true },
                { label: "Telephone", key: "telephone", icon: TbPhone, type: "text", placeholder: "+221 77 123 45 67", required: false },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{f.label} {f.required && <span className="text-red-400">*</span>}</label>
                  <div className="relative">
                    <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    <input className={inputClass} type={f.type} placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Mot de passe <span className="text-red-400">*</span></label>
                <div className="relative">
                  <TbLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input className={inputClass + " pr-11"} type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <TbEyeOff size={17} /> : <TbEye size={17} />}
                  </button>
                </div>
              </div>

              <p className="text-[#2B3090] text-xs font-medium leading-relaxed bg-[#2B3090]/5 rounded-xl px-4 py-3">
                En vous inscrivant, vous acceptez nos conditions. L&apos;abonnement est de 1 000 FCFA/mois apres le 1er mois gratuit.
              </p>

              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-[#2B3090] hover:bg-[#1e2570] active:scale-[0.98] disabled:opacity-60 text-white font-black py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-[0_4px_20px_rgba(43,48,144,0.35)] hover:shadow-[0_6px_30px_rgba(43,48,144,0.45)]">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creation en cours...</> : <>Creer mon compte vendeur <TbArrowRight size={18} /></>}
              </button>

              <p className="text-center text-sm text-gray-500 pt-1">
                Deja vendeur ? <Link href="/auth/sign-in" className="text-[#2B3090] font-bold hover:underline">Se connecter</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-gray-50 py-20">
        <MainLayout>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block bg-[#2B3090]/10 text-[#2B3090] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">Pourquoi nous choisir</span>
            <h2 className="text-4xl font-black text-gray-900">Tout ce dont vous<br />avez besoin pour vendre</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {advantages.map((adv, i) => (
              <motion.div key={adv.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${adv.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <adv.icon size={22} className="text-white" />
                </div>
                <h3 className="font-black text-gray-900 mb-1.5">{adv.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{adv.desc}</p>
              </motion.div>
            ))}
          </div>
        </MainLayout>
      </div>

      <div className="bg-white py-20">
        <MainLayout>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block bg-[#2B3090]/10 text-[#2B3090] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">Comment ca marche</span>
            <h2 className="text-4xl font-black text-gray-900">4 etapes vers<br />votre premiere vente</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.12 }}
                className="text-center">
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 bg-[#2B3090] text-white rounded-2xl flex items-center justify-center mx-auto shadow-[0_4px_20px_rgba(43,48,144,0.25)]">
                    <step.icon size={26} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-400 text-white text-[10px] font-black rounded-full flex items-center justify-center">{i+1}</span>
                </div>
                <h3 className="font-black text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[160px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </MainLayout>
      </div>

      <div className="relative bg-[#2B3090] overflow-hidden py-20">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 80% 50%, #818cf8 0%, transparent 60%)"}} />
        <MainLayout className="relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
              <TbTrendingUp className="text-indigo-300" size={30} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Pret a vendre<br />sur le campus ?</h2>
            <p className="text-white/50 mb-10 max-w-md mx-auto leading-relaxed">Rejoignez UIDT Commerce. 1 000 FCFA/mois. Sans commission. Paiements directs.</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-white text-[#2B3090] font-black px-10 py-4 rounded-2xl hover:bg-indigo-50 transition-all duration-200 inline-flex items-center gap-2 shadow-[0_4px_30px_rgba(255,255,255,0.15)] active:scale-95">
              Creer mon compte vendeur <TbArrowRight size={20} />
            </button>
          </motion.div>
        </MainLayout>
      </div>

    </div>
  );
}