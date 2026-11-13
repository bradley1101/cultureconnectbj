// ─────────────────────────────────────────────────────────────
// Back-office › Réglages
// Numéro WhatsApp de commande, taux de commission et textes légaux.
//
// Navigation INSTANTANÉE : le titre s'affiche tout de suite,
// le formulaire (rempli avec les réglages lus dans la base) arrive dans un <Suspense>.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { Suspense } from "react";
import { FormReglages } from "@/components/admin/form-reglages";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Réglages" };

// ── La page : titre seulement → affichage immédiat.
export default function ReglagesPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">Réglages</h1>
        <p className="text-taupe">Numéro de commande, commission et textes légaux du site.</p>
      </div>

      {/* Squelette pendant le chargement, puis le formulaire. */}
      <Suspense fallback={<Squelette />}>
        <Formulaire />
      </Suspense>
    </div>
  );
}

// ── Squelette : 2 champs + une grande zone de texte qui « pulsent ».
function Squelette() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Chargement des réglages…</span>
      <div className="h-14 animate-pulse rounded-xl bg-creme" />
      <div className="h-14 animate-pulse rounded-xl bg-creme" />
      <div className="h-72 animate-pulse rounded-[20px] bg-creme" />
    </div>
  );
}

// ── Formulaire (lecture des réglages dans la base, dans le Suspense).
async function Formulaire() {
  // Vérifie que l'utilisateur est admin (sinon redirection).
  const { supabase } = await requireAdmin();

  // La table settings ne contient qu'une seule ligne.
  const { data } = await supabase
    .from("settings")
    .select("whatsapp_number, commission_rate, legal_mentions, terms_of_use, terms_of_sale, privacy_policy")
    .single();

  if (!data) return <p className="text-terre">Impossible de lire les réglages.</p>;

  // commission_rate est stocké en fraction (0.1) → on l'affiche en pourcentage (10).
  return <FormReglages reglages={{ ...data, commission: Math.round(Number(data.commission_rate) * 1000) / 10 }} />;
}