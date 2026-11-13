// ─────────────────────────────────────────────────────────────
// Back-office : nouveau guide, adresse : /admin/ressources/nouvelle
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { FormRessource } from "@/components/admin/form-ressource";

export const metadata: Metadata = { title: "Nouveau guide" };

export default function NouveauGuidePage() {
  return (
    <div className="flex max-w-4xl flex-col gap-7">
      <Link href="/admin/ressources" className="font-bold text-terre hover:text-ebene">← Ressources</Link>
      <h1 className="font-display text-[36px] font-extrabold leading-none">Nouveau guide</h1>
      {/* ressource={null} : formulaire vide (création). */}
      <FormRessource ressource={null} />
    </div>
  );
}