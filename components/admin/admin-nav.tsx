// ─────────────────────────────────────────────────────────────
// Menu du back-office. Rubrique ouverte en doré (bg-or).
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/artistes", label: "Artistes" },
  { href: "/admin/contenus", label: "Contenus" },
  { href: "/admin/commandes", label: "Commandes WhatsApp" },
  { href: "/admin/accueil", label: "Page d'accueil" },
  { href: "/admin/ressources", label: "Ressources" },
  { href: "/admin/reglages", label: "Réglages" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration">
      <ul className="flex flex-col gap-1">
        {LIENS.map((l) => {
          // « Vue d'ensemble » : active seulement sur /admin exactement.
          const actif = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={actif ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-[10px] px-3.5 text-[15px] transition-colors ${
                  actif ? "bg-or font-bold text-ebene" : "text-sable hover:bg-sable/10"
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