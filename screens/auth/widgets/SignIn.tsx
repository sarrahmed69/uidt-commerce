"use client";
import AuthInput from "../components/AuthInput";
import { HiAtSymbol } from "react-icons/hi";
import { BiLock } from "react-icons/bi";
import { TbShoppingBag, TbBuildingStore, TbArrowRight } from "react-icons/tb";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AuthLayout from "../layout/AuthLayout";
import { useSignInUser } from "@/features/auth/sign-in-user";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import SignInWithGoogle from "../components/SignInWithGoogle";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const signInSchema = z.object({
  email: z.string().email("Format d'e-mail invalide").nonempty("L'e-mail est requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres").nonempty("Le mot de passe est requis"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const signInUser = useSignInUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"buyer" | "seller" | null>(null);

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) });

  // Pre-selectionner le role depuis URL (?role=buyer ou ?role=seller)
  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "buyer" || r === "seller") setRole(r);
  }, [searchParams]);

  const onSubmit = async (data: SignInFormData) => {
    if (!role) {
      toast.warning("Choisissez d abord si vous etes Acheteur ou Vendeur");
      return;
    }
    const id = toast.loading("Connexion en cours...");
    try {
      const response = await signInUser.mutateAsync(data);
      if (response?.success) {
        toast.success("Connexion reussie !");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const redirect = searchParams.get("redirect");

        if (role === "seller") {
          // Verifier si vendeur
          const { data: vendors } = await supabase
            .from("vendors").select("id").eq("user_id", user?.id).limit(1);
          if (vendors && vendors.length > 0) {
            router.push(redirect || "/vendor/dashboard");
          } else {
            toast.info("Vous n avez pas encore de boutique. Creez-en une !");
            router.push("/devenir-vendeur");
          }
        } else {
          router.push(redirect || "/user/dashboard");
        }
      } else {
        toast.error(response?.message || "Echec de la connexion.");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      toast.done(id);
    }
  };

  // ETAPE 1 : Choix du profil
  if (!role) {
    return (
      <AuthLayout title="Bienvenue" subtitle="Comment souhaitez-vous vous connecter ?">
        <div className="max-w-96 w-full mt-6 space-y-3">

          {/* Acheteur */}
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className="w-full bg-white border-2 border-primary rounded-2xl p-4 flex items-center gap-4 hover:bg-primary/5 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <TbShoppingBag className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">Je suis Acheteur</p>
              <p className="text-xs text-gray-500 mt-0.5">Acheter sur le campus UIDT</p>
            </div>
            <TbArrowRight className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
          </button>

          {/* Vendeur */}
          <button
            type="button"
            onClick={() => setRole("seller")}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-400 hover:bg-amber-50 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <TbBuildingStore className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">Je suis Vendeur</p>
              <p className="text-xs text-gray-500 mt-0.5">Acceder a ma boutique</p>
            </div>
            <TbArrowRight className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
          </button>

          {/* Lien vers inscription */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              Pas encore de compte ?{" "}
              <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">S inscrire</Link>
              <span className="mx-2 text-gray-300">·</span>
              <Link href="/devenir-vendeur" className="font-semibold text-amber-600 hover:underline">Devenir vendeur</Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // ETAPE 2 : Formulaire connexion
  const isSeller = role === "seller";
  return (
    <AuthLayout
      title={isSeller ? "Connexion Vendeur" : "Connexion Acheteur"}
      subtitle={isSeller ? "Acceder a votre boutique KayJend" : "Acheter sur le campus UIDT"}
    >
      <div className="max-w-96 w-full mt-4">

        {/* Badge role + bouton retour */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
            isSeller ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
          }`}>
            {isSeller ? <TbBuildingStore size={14} /> : <TbShoppingBag size={14} />}
            {isSeller ? "Espace Vendeur" : "Espace Acheteur"}
          </div>
          <button onClick={() => setRole(null)} className="text-xs text-gray-500 hover:text-gray-700 underline">
            Changer
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AuthInput type="email" label="Adresse e-mail *" icon={<HiAtSymbol />} {...register("email")} />
          {errors.email && <div className="text-red-600 font-semibold text-sm mt-2">{errors.email.message}</div>}

          <AuthInput type="password" label="Mot de passe *" icon={<BiLock />} {...register("password")} />
          {errors.password && <div className="text-red-600 font-semibold text-sm mt-2">{errors.password.message}</div>}

          <div className="flex justify-end mt-1">
            <Link href="/auth/forget-password" className="text-xs text-primary hover:underline">
              Mot de passe oublie ?
            </Link>
          </div>

          <div className="flex flex-col justify-center items-center mt-6 gap-3">
            <button
              type="submit"
              className={`w-full h-11 rounded-md text-sm flex justify-center items-center gap-x-3 transition-colors text-white font-semibold ${
                isSeller ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-accent"
              }`}
              disabled={isSubmitting || signInUser.isPending}
            >
              {isSubmitting ? (
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                `Se connecter en tant que ${isSeller ? "Vendeur" : "Acheteur"}`
              )}
            </button>

            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <SignInWithGoogle />

            <p className="mt-4 text-xs text-center text-gray-700">
              Pas encore de compte ?
              <Link href={isSeller ? "/devenir-vendeur" : "/auth/sign-up"} className="font-semibold ml-2 text-primary">
                {isSeller ? "Devenir vendeur" : "S inscrire"}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignIn;