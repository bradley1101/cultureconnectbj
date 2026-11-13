// ─────────────────────────────────────────────────────────────
// « Server Action » : une fonction qui tourne SUR LE SERVEUR,
// appelée quand le visiteur clique sur « Commander sur WhatsApp ».
// Elle enregistre la commande puis prépare le lien WhatsApp.
// ─────────────────────────────────────────────────────────────
"use server";

import { createPublicClient } from "@/lib/supabase/public";

// Ce que la fonction renvoie au bouton : soit le lien WhatsApp, soit un message d'erreur.
export type ResultatCommande = { ok: true; lien: string } | { ok: false; erreur: string };

export async function commanderSurWhatsapp(
  artworkId: string,
  titre: string,
  artiste: string,
  prix: string,
  adresse: string,
): Promise<ResultatCommande> {
  // Appelle la fonction « create_order » de la base. C'est ELLE qui :
  // - vérifie que l'œuvre est validée et en stock,
  // - calcule la commission (le visiteur ne peut pas la modifier),
  // - crée la commande avec une référence CCBJ-00001…
  // - renvoie la référence et le numéro WhatsApp officiel.
  const { data, error } = await createPublicClient().rpc("create_order", {
    p_artwork_id: artworkId,
  });

  // Œuvre vendue entre-temps ou problème réseau.
  if (error || !data?.[0]) {
    return { ok: false, erreur: "Cette œuvre n'est plus disponible. Rechargez la page." };
  }

  const { reference, whatsapp_number } = data[0];

  // Message pré-rempli que le client enverra sur WhatsApp ("\n" = retour à la ligne).
  const message = [
    "Bonjour CultureConnectBJ,",
    "je souhaite commander cette œuvre :",
    "",
    `• Référence : ${reference}`,
    `• Œuvre : ${titre}`,
    `• Artiste : ${artiste}`,
    `• Prix : ${prix}`,
    "",
    adresse,
  ].join("\n");

  // Lien wa.me : numéro sans « + » ni espaces, message encodé pour l'adresse web.
  return {
    ok: true,
    lien: `https://wa.me/${whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
  };
}