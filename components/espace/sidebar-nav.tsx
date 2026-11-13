// ─────────────────────────────────────────────────────────────
// Menu de gauche de l'espace artiste.
// "use client" : il lit l'adresse actuelle pour mettre en ocre la rubrique ouverte.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Rubriques du menu (les pages seront créées aux étapes suivantes).
const LIENS = [
  { href: "/espace", label: "Tableau de bord" },
  { href: "/espace/profil", label: "Mon profil" },
  { href: "/espace/portfolio", label: "Portfolio" },
  { href: "/espace/oeuvres", label: "Mes œuvres en vente" },
  { href: "/espace/evenements", label: "Mes événements" },
];

export function SidebarNav() {
  const pathname = usePathname(); // adresse actuelle, ex. "/espace/oeuvres/nouvelle"

  return (
    <nav aria-label="Espace artiste">
      <ul className="flex flex-col gap-1">
        {LIENS.map((l) => {
          // « Tableau de bord » : actif seulement sur /espace exactement.
          // Les autres : actifs aussi sur leurs sous-pages (startsWith).
          const actif = l.href === "/espace" ? pathname === "/espace" : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={actif ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-[10px] px-3.5 text-[15px] transition-colors ${
                  actif ? "bg-ocre font-bold text-ebene" : "text-sable hover:bg-sable/10"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}