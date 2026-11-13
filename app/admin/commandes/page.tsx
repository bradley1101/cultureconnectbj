// ─────────────────────────────────────────────────────────────
// Back-office › Commandes WhatsApp
// Suivi des commandes : Nouvelle → Confirmée → Payée → Livrée → Artiste payé.
//
// Pour une navigation INSTANTANÉE :
//  - le titre s'affiche tout de suite ;
//  - les filtres + la liste (qui lisent la base) arrivent dans un <Suspense>.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { annulerCommande, avancerCommande, noterCommande } from "./actions";
import { requireAdmin } from "@/lib/admin";
import { ETAPE_SUIVANTE, STATUTS_COMMANDE, type StatutCommande } from "@/lib/commandes";
import { formatFcfa } from "@/lib/format";

export const metadata: Metadata = { title: "Commandes WhatsApp" };

// Le filtre de statut arrive dans l'URL : /admin/commandes?statut=paid
type Props = { searchParams: Promise<{ statut?: string }> };

// ── La page : seulement le titre, donc affichage immédiat.
export default function CommandesPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">Commandes WhatsApp</h1>
        <p className="text-taupe">
          Nouvelle → Confirmée → Payée → Livrée → Artiste payé. Le stock d&apos;une œuvre physique baisse
          au passage « Payée ».
        </p>
      </div>

      {/* Pendant le chargement : squelette. Ensuite : filtres + liste. */}
      <Suspense fallback={<Squelette />}>
        <ListeCommandes searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// ── Squelette : une barre de filtres + 3 cartes qui « pulsent ».
function Squelette() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">Chargement des commandes…</span>
      <div className="h-10 w-full max-w-xl animate-pulse rounded-full bg-[#E9DFD2]" />
      {[1, 2, 3].map((n) => (
        <div key={n} className="h-36 animate-pulse rounded-[20px] bg-creme" />
      ))}
    </div>
  );
}

// ── Filtres + liste des commandes (lecture de la base, dans le Suspense).
async function ListeCommandes({ searchParams }: Props) {
  // Vérifie que l'utilisateur est admin (sinon redirection).
  const { supabase } = await requireAdmin();

  // Lit le statut demandé dans l'URL ; s'il n'existe pas, pas de filtre.
  const { statut = "" } = await searchParams;
  const filtre = statut in STATUTS_COMMANDE ? (statut as StatutCommande) : null;

  // Les 200 commandes les plus récentes, avec l'œuvre et l'artiste (+ son téléphone).
  let requete = supabase
    .from("orders")
    .select(
      "id, reference, created_at, price_fcfa, commission_fcfa, artist_net_fcfa, status, admin_note, artwork:artworks(title, slug), artist:artists(stage_name, profile:profiles(phone))",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (filtre) requete = requete.eq("status", filtre);

  const { data } = await requete;
  const commandes = data ?? [];

  // Pastilles de filtre : « Toutes » + une par statut.
  const pastilles: [string, string][] = [
    ["", "Toutes"],
    ...Object.entries(STATUTS_COMMANDE).map(([k, v]) => [k, v.texte] as [string, string]),
  ];

  return (
    <>
      {/* Filtres par statut (liens, donc partageables et compatibles « retour arrière »). */}
      <nav aria-label="Filtrer par statut">
        <ul className="flex flex-wrap gap-1.5">
          {pastilles.map(([v, t]) => (
            <li key={v}>
              <Link
                href={v ? `/admin/commandes?statut=${v}` : "/admin/commandes"}
                aria-current={(filtre ?? "") === v ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-[13px] ${
                  (filtre ?? "") === v
                    ? "border-ebene bg-ebene font-bold text-creme"
                    : "border-[#D9C7AF] hover:border-ebene"
                }`}
              >
                {t}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {commandes.length === 0 ? (
        <p className="rounded-[20px] bg-creme p-6 text-taupe">
          Aucune commande{filtre ? " avec ce statut" : ""}.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {commandes.map((c) => {
            const etape = ETAPE_SUIVANTE[c.status]; // bouton « étape suivante »
            const s = STATUTS_COMMANDE[c.status]; // libellé + couleur du badge
            const tel = c.artist?.profile?.phone?.replace(/\D/g, ""); // numéro sans espaces pour wa.me

            return (
              <li key={c.id} className="flex flex-col gap-4 rounded-[20px] bg-creme p-5">
                {/* Ligne 1 : référence, date, statut */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="font-bold">{c.reference}</span>
                  <span className="text-sm text-taupe">
                    {new Date(c.created_at).toLocaleString("fr-FR", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      timeZone: "Africa/Porto-Novo",
                    })}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[13px] font-bold ${s.style}`}>{s.texte}</span>
                </div>

                {/* Ligne 2 : œuvre, artiste, montants */}
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
                  <span>
                    <span className="text-taupe">Œuvre : </span>
                    {c.artwork ? (
                      <Link href={`/marketplace/${c.artwork.slug}`} className="font-bold hover:text-terre">
                        {c.artwork.title}
                      </Link>
                    ) : "—"}
                  </span>
                  <span>
                    <span className="text-taupe">Artiste : </span>
                    <strong>{c.artist?.stage_name}</strong>
                    {tel && (
                      <> · <a href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer" className="text-terre underline">WhatsApp</a></>
                    )}
                  </span>
                  <span><span className="text-taupe">Prix : </span>{formatFcfa(c.price_fcfa)}</span>
                  <span><span className="text-taupe">Commission : </span>{formatFcfa(c.commission_fcfa)}</span>
                  <span><span className="text-taupe">À reverser : </span><strong>{formatFcfa(c.artist_net_fcfa)}</strong></span>
                </div>

                {/* Ligne 3 : actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Passer à l'étape suivante */}
                  {etape && (
                    <form action={avancerCommande}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="actuel" value={c.status} />
                      <button type="submit" className="min-h-10 cursor-pointer rounded-full bg-ebene px-4 text-sm font-bold text-creme hover:bg-terre">
                        {etape.bouton}
                      </button>
                    </form>
                  )}

                  {/* Annuler : possible seulement avant le paiement */}
                  {(c.status === "new" || c.status === "confirmed") && (
                    <form action={annulerCommande}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="min-h-10 cursor-pointer rounded-full border border-[#D9C7AF] px-4 text-sm hover:border-terre hover:text-terre">
                        Annuler
                      </button>
                    </form>
                  )}

                  {/* Note interne (n° de transaction MoMo, livreur…) */}
                  <form action={noterCommande} className="flex min-w-0 flex-[1_1_280px] gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <label htmlFor={`note-${c.id}`} className="sr-only">Note interne</label>
                    <input
                      id={`note-${c.id}`} name="note" defaultValue={c.admin_note ?? ""}
                      placeholder="Note interne (n° de transaction MoMo, livreur…)"
                      className="min-h-10 min-w-0 flex-1 rounded-[10px] border border-ligne bg-creme px-3 text-sm"
                    />
                    <button type="submit" className="min-h-10 cursor-pointer rounded-full border border-ligne px-3 text-sm hover:border-ebene">
                      Enregistrer
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}