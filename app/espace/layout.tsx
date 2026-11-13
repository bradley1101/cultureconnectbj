// ─────────────────────────────────────────────────────────────
// Cadre commun à toutes les pages /espace/... :
// menu brun à gauche, contenu de la page à droite.
// (Pas d'en-tête ni de pied de page du site public ici.)
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { deconnexion } from "@/app/auth-actions";
import { SidebarNav } from "@/components/espace/sidebar-nav";
import { getSession } from "@/lib/session";
import { storageUrl } from "@/lib/supabase/public";

// « children » = la page affichée (tableau de bord, profil, œuvres…).
export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    // flex-wrap : sur téléphone, le menu passe au-dessus du contenu.
    <div className="flex min-h-screen flex-wrap bg-sable">
      {/* ═════════ MENU DE GAUCHE (fond brun) ═════════ */}
      <aside className="flex max-w-full flex-[1_1_260px] flex-col gap-7 bg-ebene px-5 py-7 text-sable lg:max-w-[280px]">
        {/* Logo → retour au site public */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-[10px] bg-ocre font-display text-lg font-extrabold text-ebene">CC</span>
          <span className="font-display text-xl font-extrabold">
            CultureConnect<span className="text-or">BJ</span>
          </span>
        </Link>

        {/* Photo + nom (lus dans la base, donc dans un Suspense). */}
        <Suspense fallback={<div className="h-11" />}>
          <Identite />
        </Suspense>

                {/* SidebarNav lit l'adresse (usePathname) : Next.js exige un Suspense autour. */}
        <Suspense fallback={<div className="h-[244px]" />}>
          <SidebarNav />
        </Suspense>

        {/* mt-auto : pousse ce bloc tout en bas du menu. */}
        <div className="mt-auto flex flex-col gap-3">
          <Suspense fallback={null}>
            <LienProfilPublic />
          </Suspense>
                    {/* Lien vers le back-office, visible seulement pour les admins. */}
          <Suspense fallback={null}>
            <LienBackOffice />
          </Suspense>
          <form action={deconnexion}>
            <button type="submit" className="min-h-11 cursor-pointer text-[15px] text-[#D4C6B2] hover:text-sable">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* ═════════ CONTENU DE LA PAGE ═════════ */}
      <main id="contenu" className="min-w-0 flex-[999_1_640px] p-6 sm:p-8">
        <Suspense fallback={<p className="text-taupe">Chargement…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}

// Photo ronde + nom de scène (ou nom complet si pas encore de fiche artiste).
async function Identite() {
  const { profil, artiste } = await getSession();
  return (
    <div className="flex items-center gap-3">
      <span className="relative size-11 flex-none overflow-hidden rounded-full bg-[#E9D9C2]">
        {artiste?.avatar_path && (
          <Image src={storageUrl("avatars", artiste.avatar_path)} alt="" fill sizes="44px" className="object-cover" />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        {/* truncate : coupe avec « … » si le nom est trop long. */}
        <span className="truncate font-bold">{artiste?.stage_name ?? profil.full_name}</span>
        <span className="text-[13px] text-[#D4C6B2]">Compte artiste</span>
      </span>
    </div>
  );
}

// Lien vers le profil public, seulement si la fiche artiste existe.
async function LienProfilPublic() {
  const { artiste } = await getSession();
  if (!artiste) return null;
  return (
    <Link href={`/artistes/${artiste.slug}`} className="font-bold text-or hover:underline">
      Voir mon profil public →
    </Link>
  );
}

// Lien doré vers /admin, seulement pour les comptes admin ou super-admin.
async function LienBackOffice() {
  const { profil } = await getSession();
  if (profil.role !== "admin" && profil.role !== "superadmin") return null;
  return (
    <Link href="/admin" className="font-bold text-or hover:underline">
      Back-office →
    </Link>
  );
}