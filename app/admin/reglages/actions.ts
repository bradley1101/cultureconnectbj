// ─────────────────────────────────────────────────────────────
// Action serveur : enregistre les réglages du site
// (numéro WhatsApp, commission, textes légaux).
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export type EtatReglages = { erreur?: string; succes?: string };

export async function enregistrerReglages(_: EtatReglages, formData: FormData): Promise<EtatReglages> {
  const { supabase } = await requireAdmin();

  // Numéro : on retire espaces, points et tirets (« +229 01 97… » → « +22901 97… »).
  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/[\s.-]/g, "");
  // Commission en % ; on accepte la virgule française (« 12,5 »).
  const commission = Number(String(formData.get("commission") ?? "").replace(",", "."));

  // « + » obligatoire suivi de 8 à 15 chiffres (format international).
  if (!/^\+\d{8,15}$/.test(whatsapp)) {
    return { erreur: "Numéro WhatsApp invalide : indicatif compris, ex. +229 01 97 00 00 00." };
  }
  if (!Number.isFinite(commission) || commission < 0 || commission > 50) {
    return { erreur: "La commission doit être comprise entre 0 et 50 %." };
  }

  // Petit raccourci : lit un texte, et renvoie null s'il est vide.
  const texte = (nom: string) => String(formData.get(nom) ?? "").trim() || null;

  const { error } = await supabase
    .from("settings")
    .update({
      whatsapp_number: whatsapp,
      // La base stocke 10 % sous la forme 0.1. Arrondi au 1/10e de % (12,5 % → 0.125).
      commission_rate: Math.round(commission * 10) / 1000,
      legal_mentions: texte("mentions"),
      terms_of_use: texte("cgu"),
      terms_of_sale: texte("cgv"),
      privacy_policy: texte("confidentialite"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true); // la table n'a qu'une seule ligne (id = true)

  if (error) return { erreur: "L'enregistrement a échoué. Réessayez." };

  // Les pages qui lisent les réglages (fiches, profils, pages légales) se mettent à jour.
  updateTag("settings");
  return { succes: "Réglages enregistrés." };
}