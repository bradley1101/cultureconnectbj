// ─────────────────────────────────────────────────────────────
// Bloc d'une section de l'accueil dans le back-office :
// - ce qui est affiché en ce moment (dans l'ordre),
// - bouton « Désépingler » sur les éléments épinglés,
// - formulaire pour épingler un nouvel élément.
// Même composant pour les 5 sections.
// ─────────────────────────────────────────────────────────────

import { desepingler, epingler } from "@/app/admin/accueil/actions";
import { formatDate } from "@/lib/format";

type Element = { id: string; libelle: string; featured_until: string | null };
type Props = {
  section: string; // code de la section (artistes, oeuvres…)
  titre: string;
  regle: string; // texte décrivant la règle automatique
  affiches: Element[]; // ce que l'accueil montre actuellement
  candidats: { id: string; libelle: string }[]; // ce qu'on peut épingler
  maximum: number; // nombre de places de la section
};

export function SectionAccueil({ section, titre, regle, affiches, candidats, maximum }: Props) {
  const maintenant = Date.now();
  // Épinglé = date de fin de mise en avant encore dans le futur.
  const estEpingle = (e: Element) => e.featured_until !== null && new Date(e.featured_until).getTime() > maintenant;

   // Dans la liste « Épingler », on propose tout SAUF ce qui est déjà épinglé.
  // Un élément affiché automatiquement peut être épinglé : il passe alors en tête
  // et reste garanti sur l'accueil même quand de nouveaux éléments arrivent.
  const idsEpingles = new Set(affiches.filter(estEpingle).map((a) => a.id));
  const disponibles = candidats.filter((c) => !idsEpingles.has(c.id));

  return (
    <section className="flex flex-col gap-4 rounded-[20px] bg-creme p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">{titre}</h2>
        <p className="text-sm text-taupe">Règle automatique : {regle} · {maximum} affichés.</p>
      </div>

      {/* ── Ce qui est affiché maintenant ── */}
      {affiches.length === 0 ? (
        <p className="text-taupe">Rien n&apos;est affiché pour le moment (message d&apos;attente sur l&apos;accueil).</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {affiches.map((e, i) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#EFE3D2] px-4 py-3">
              {/* Position sur l'accueil : 1, 2, 3… */}
              <span className="w-6 font-display font-extrabold text-ocre">{i + 1}</span>
              <span className="min-w-0 flex-[1_1_200px] font-bold">{e.libelle}</span>

              {estEpingle(e) ? (
                <>
                  {/* Badge indigo. Année ≥ 2100 = « sans limite ». */}
                  <span className="rounded-full bg-indigo px-2.5 py-1 text-xs font-bold text-sable">
                    Épinglé{" "}
                    {new Date(e.featured_until!).getFullYear() >= 2100 ? "sans limite" : `jusqu'au ${formatDate(e.featured_until!)}`}
                  </span>
                  <form action={desepingler}>
                    <input type="hidden" name="section" value={section} />
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="min-h-9 cursor-pointer rounded-full border border-[#D9C7AF] px-3 text-sm hover:border-terre hover:text-terre">
                      Désépingler
                    </button>
                  </form>
                </>
              ) : (
                <span className="rounded-full bg-sable px-2.5 py-1 text-xs font-bold text-taupe">Automatique</span>
              )}
            </li>
          ))}
        </ol>
      )}

      {/* ── Épingler un nouvel élément ── */}
      {disponibles.length > 0 && (
        <form action={epingler} className="flex flex-wrap items-end gap-3 border-t border-[#EFE3D2] pt-4">
          <input type="hidden" name="section" value={section} />
          <div className="flex min-w-0 flex-[2_1_240px] flex-col gap-1.5">
            {/* id unique par section : il y a 5 formulaires sur la même page. */}
            <label htmlFor={`id-${section}`} className="text-sm font-bold">Épingler à l&apos;accueil</label>
            <select id={`id-${section}`} name="id" required defaultValue="" className="min-h-11 rounded-[10px] border border-ligne bg-creme px-3">
              <option value="" disabled>Choisir…</option>
              {disponibles.map((c) => (
                <option key={c.id} value={c.id}>{c.libelle}</option>
              ))}
            </select>
          </div>
          <div className="flex min-w-0 flex-[1_1_140px] flex-col gap-1.5">
            <label htmlFor={`duree-${section}`} className="text-sm font-bold">Durée</label>
            <select id={`duree-${section}`} name="duree" defaultValue="7" className="min-h-11 rounded-[10px] border border-ligne bg-creme px-3">
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="0">Sans limite</option>
            </select>
          </div>
          <button type="submit" className="min-h-11 cursor-pointer rounded-full bg-ebene px-5 font-bold text-creme hover:bg-terre">
            Épingler
          </button>
        </form>
      )}
    </section>
  );
}