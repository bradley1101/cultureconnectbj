// ─────────────────────────────────────────────────────────────
// Cadre commun à toutes les pages /admin/... :
// menu bleu indigo à gauche + contrôle d'accès admin.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { deconnexion } from "@/app/auth-actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s · Back-office CultureConnectBJ" },
  // robots index: false → Google ne doit pas référencer le back-office.
  robots: { index: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-wrap bg-[#F3EEE7]">
      {/* ═════════ MENU (fond indigo) ═════════ */}
      <aside className="flex max-w-full flex-[1_1_240px] flex-col gap-7 bg-indigo px-5 py-7 text-sable lg:max-w-[260px]">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-[10px] bg-or font-display text-lg font-extrabold text-ebene">CC</span>
          <span className="flex flex-col">
            <span className="font-display text-lg font-extrabold">Back-office</span>
            <span className="text-[13px] text-[#C9D3E2]">Administration</span>
          </span>
        </div>

                {/* Le menu lit l'adresse de la page : il doit être dans un Suspense,
            sinon les pages à adresse variable (ex. /admin/ressources/[id]) ne s'affichent pas. */}
        <Suspense fallback={<div className="h-48" />}>
          <AdminNav />
        </Suspense>

        <div className="mt-auto flex flex-col gap-3 text-[15px]">
          <Link href="/espace" className="text-[#C9D3E2] hover:text-sable">Mon espace artiste</Link>
          <Link href="/" className="text-[#C9D3E2] hover:text-sable">Voir le site</Link>
          <form action={deconnexion}>
            <button type="submit" className="min-h-11 cursor-pointer text-[#C9D3E2] hover:text-sable">Se déconnecter</button>
          </form>
        </div>
      </aside>

      {/* ═════════ CONTENU ═════════ */}
      <main id="contenu" className="min-w-0 flex-[999_1_640px] p-6 sm:p-8">
        <Suspense fallback={<p className="text-taupe">Chargement…</p>}>
          {/* La garde vérifie le rôle AVANT d'afficher la page. */}
          <Garde>{children}</Garde>
        </Suspense>
      </main>
    </div>
  );
}

// Si la personne n'est pas admin, requireAdmin() la renvoie vers /espace.
async function Garde({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}