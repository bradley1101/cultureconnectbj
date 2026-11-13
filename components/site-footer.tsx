import Link from "next/link";
import { Frise } from "@/components/motion/frise";

const colonnes = [
  {
    titre: "Plateforme",
    liens: [
      { href: "/artistes", label: "Artistes" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/agenda", label: "Agenda" },
    ],
  },
  {
    titre: "Aide",
    liens: [
      { href: "/a-propos", label: "À propos" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact WhatsApp" },
    ],
  },
  {
    titre: "Légal",
    liens: [
            { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/cgu", label: "CGU" },
      { href: "/conditions-de-vente", label: "Conditions de vente" },
      { href: "/confidentialite", label: "Confidentialité" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ebene text-[#D4C6B2]">
            {/* Fine ligne brune : sépare la bande motif d'une section ocre placée juste au-dessus. */}
      <div className="h-1 bg-ebene" />
      {/* Frise vivante : se déroule et glisse au défilement. */}
<Frise />
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-10 px-6 py-12">
        <div className="flex max-w-[340px] flex-1 basis-[280px] flex-col gap-3">
          <span className="font-display text-2xl font-extrabold text-sable">
            CultureConnect<span className="text-or">BJ</span>
          </span>
          <p className="leading-relaxed">La plateforme numérique des artistes béninois.</p>
        </div>

        <nav aria-label="Pied de page" className="flex flex-wrap gap-12">
          {colonnes.map((col) => (
            <div key={col.titre} className="flex flex-col gap-2.5">
              <span className="font-bold text-sable">{col.titre}</span>
              {col.liens.map((l) => (
                <Link key={l.href} href={l.href} className="underline-offset-4 transition-colors hover:text-or hover:underline">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}