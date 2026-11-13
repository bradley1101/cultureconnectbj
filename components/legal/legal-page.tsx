// ─────────────────────────────────────────────────────────────
// Mise en page commune aux 4 pages légales.
// ─────────────────────────────────────────────────────────────

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatDate } from "@/lib/format";
import { getTexteLegal, type ChampLegal } from "@/lib/legal-data";

export async function LegalPage({ titre, champ }: { titre: string; champ: ChampLegal }) {
  const { texte, majLe } = await getTexteLegal(champ);

  return (
    <>
      <SiteHeader />
      <main id="contenu">
        {/* Colonne étroite, confortable pour lire un long texte. */}
        <article className="mx-auto max-w-3xl px-6 pt-14 pb-[72px]">
          <h1 className="font-display text-[clamp(32px,5vw,48px)] font-extrabold leading-[1.05] tracking-[-0.02em]">{titre}</h1>

          {texte ? (
            <>
              {majLe && <p className="mt-4 text-sm text-taupe">Dernière mise à jour : {formatDate(majLe)}</p>}
              {/* whitespace-pre-line : respecte les paragraphes tapés dans le back-office. */}
              <div className="mt-8 whitespace-pre-line text-[17px] leading-[1.75] text-[#3A2618]">{texte}</div>
            </>
          ) : (
            <p className="mt-8 rounded-[18px] border border-dashed border-ligne px-6 py-10 text-center text-taupe">
              Cette page est en cours de rédaction.
            </p>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}