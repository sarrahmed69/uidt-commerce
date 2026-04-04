import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!email || !password || !firstName) {
      return NextResponse.json({ success: false, message: "Champs obligatoires manquants" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Le mot de passe doit contenir au moins 8 caracteres" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName, fullName: `${firstName} ${lastName}`.trim() },
      },
    });

    if (error) {
      let message = "Echec de l inscription";
      if (error.message.includes("already registered")) message = "Cet email est deja utilise";
      if (error.message.includes("invalid email")) message = "Format d email invalide";
      if (error.message.includes("weak password")) message = "Mot de passe trop faible";
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Compte cree avec succes",
      user: { id: data.user?.id, email: data.user?.email },
    });

  } catch (e) {
    console.error("Sign-up error:", e);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}