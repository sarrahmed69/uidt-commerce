import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { nom, imageBase64, imageType } = await req.json();

  const content: any[] = [];

  if (imageBase64 && imageType) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: imageType, data: imageBase64 },
    });
  }

  content.push({
    type: "text",
    text: `Tu es un expert en marketing pour une marketplace d'etudiants au Senegal (UIDT Commerce).
Genere une description courte et attractive (2-3 phrases max, 100 mots max) pour ce produit :
- Nom : ${nom}
${imageBase64 ? "- Analyse l'image fournie et decris ce que tu vois du produit." : ""}
La description doit etre en francais, simple, engageante et adaptee aux etudiants. Ne mets pas de titre, juste la description directement.`,
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  return NextResponse.json({ description: text.trim() });
}