"use client";

// ─────────────────────────────────────────────────────────────
// En-tête du site public : logo, 5 liens, Connexion, « Inscrire mon art »
// et menu ☰ sur téléphone.
//
// Le lien de la page actuelle est souligné en ocre. Pour le savoir, on lit
// l'adresse avec usePathname(). Next.js demande que cette lecture soit placée
// dans un <Suspense> : en attendant, on affiche le MÊME en-tête, sans soulignement.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";

const liens = [
  { href: "/artistes", label: "Artistes" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/agenda", label: "Agenda" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/ressources", label: "Ressources" },
];

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-2.5">
      <span className="lumineux flex size-10 items-center justify-center rounded-[10px] bg-ebene font-display text-lg font-extrabold text-or">
        CC
      </span>
      <span className="font-display text-[22px] font-extrabold tracking-tight">
        CultureConnect<span className="text-terre">BJ</span>
      </span>
    </Link>
  );
}

// ── Ce que les pages utilisent : <SiteHeader />
export function SiteHeader() {
  return (
    // Fallback = l'en-tête sans lien souligné (affiché un court instant au chargement).
    <Suspense fallback={<EnTete pathname={null} />}>
      <EnTeteAvecAdresse />
    </Suspense>
  );
}

// ── Lit l'adresse actuelle, puis affiche l'en-tête avec le bon lien souligné.
function EnTeteAvecAdresse() {
  const pathname = usePathname();
  return <EnTete pathname={pathname} />;
}

// ── L'en-tête lui-même. pathname = null → aucun lien souligné.
function EnTete({ pathname }: { pathname: string | null }) {
  const [ouvert, setOuvert] = useState(false);
  const fermer = () => setOuvert(false);
  const estActif = (href: string) =>
    pathname !== null && (pathname === href || pathname.startsWith(href + "/"));

  return (
        
    <header className="sticky top-0 z-50 border-b border-ligne bg-creme">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-[18px]">
        <Logo onClick={fermer} />

        {/* Liens (ordinateur) */}
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex gap-2 text-[15px] font-medium">
            {liens.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={estActif(l.href) ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full px-3.5 transition-colors hover:bg-sable ${
                    estActif(l.href) ? "bg-sable font-bold" : ""
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Boutons (ordinateur) */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/connexion" className="inline-flex min-h-11 items-center rounded-full border border-ligne px-5 font-medium hover:text-terre">
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="lumineux inline-flex min-h-11 items-center rounded-full bg-ebene px-5 font-bold text-creme transition-colors hover:bg-terre"
          >
            Inscrire mon art
          </Link>
        </div>

        {/* Bouton ☰ / ✕ (téléphone) */}
        <button
          type="button"
          onClick={() => setOuvert(!ouvert)}
          aria-expanded={ouvert}
          aria-controls="menu-mobile"
          aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
          className="flex size-11 items-center justify-center rounded-full border border-ligne lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {ouvert ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Menu déroulant (téléphone) */}
      {ouvert && (
        <nav id="menu-mobile" aria-label="Navigation mobile" className="border-t border-ligne bg-creme px-6 pb-6 lg:hidden">
          <ul className="flex flex-col py-2">
            {liens.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={fermer}
                  aria-current={estActif(l.href) ? "page" : undefined}
                  className="block border-b border-ligne py-4 text-lg font-medium"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/connexion" onClick={fermer} className="rounded-full border border-ebene py-3 text-center font-bold">
              Connexion
            </Link>
            <Link href="/inscription" onClick={fermer} className="lumineuxrounded-full bg-ebene py-3 text-center font-bold text-creme">
              Inscrire mon art
            </Link>
          </div>
        </nav>
      )}
        </header>
    
  );
}