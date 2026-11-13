// ─────────────────────────────────────────────────────────────
// Back-office › Contenus, adresse : /admin/contenus
// Toutes les œuvres, tous les événements et toutes les opportunités,
// quel que soit leur statut, avec recherche et filtre.
// Onglet choisi dans l'adresse : /admin/contenus?type=evenements&statut=approved&q=…
// Pour chaque élément : publier / masquer, ou supprimer.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { changerStatutOeuvre, supprimerEvenement, supprimerOeuvre } from "../artistes/actions";
import { changerStatutEvenement, changerStatutOpportunite, supprimerOpportunite } from "./actions";
import { BoutonSupprimer } from "@/components/admin/bouton-supprimer";
import { requireAdmin } from "@/lib/admin";
import { formatDate, formatDay, formatFcfa, opportunityLabels } from "@/lib/format";
import { Pastille, STATUTS_VALIDATION, type StatutValidation } from "@/lib/statuts";
import { storageUrl } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Contenus" };

// Les 3 onglets.
const ONGLETS = {
  oeuvres: "Œuvres",
  evenements: "Événements",
  opportunites: "Opportunités",
} as const;
type Onglet = keyof typeof ONGLETS;

type Props = { searchParams: Promise<{ type?: string; statut?: string; q?: string }> };

// ── La page : titre tout de suite, contenu dans un Suspense (navigation instantanée).
export default function ContenusPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">Contenus</h1>
        <p className="text-taupe">Toutes les œuvres, tous les événements et toutes les opportunités, quel que soit leur statut.</p>
      </div>
      <Suspense fallback={<Squelette />}>
        <Contenu searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function Squelette() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">Chargement des contenus…</span>
      <div className="h-11 w-full max-w-md animate-pulse rounded-full bg-[#E9DFD2]" />
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-20 animate-pulse rounded-[18px] bg-creme" />
      ))}
    </div>
  );
}

// Styles communs.
const ligne = "flex flex-wrap items-center gap-4 rounded-[18px] bg-creme p-4";
const petitBouton = "min-h-10 cursor-pointer rounded-full border border-ligne px-4 text-sm hover:border-ebene";
const champ =
  "min-h-11 rounded-[10px] border border-ligne bg-creme px-3.5 text-[15px] text-ebene focus-visible:outline-2 focus-visible:outline-ocre";

async function Contenu({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const { type = "", statut = "", q = "" } = await searchParams;

  // Valeurs sûres (on ignore ce qui n'est pas prévu).
  const onglet: Onglet = type in ONGLETS ? (type as Onglet) : "oeuvres";
  const filtre = statut in STATUTS_VALIDATION ? (statut as StatutValidation) : null;
  const texte = q.replace(/[%_,()]/g, " ").trim();

  // Lien vers un onglet (on garde le filtre de statut, on vide la recherche).
  const lienOnglet = (o: Onglet) => `/admin/contenus?type=${o}${filtre ? `&statut=${filtre}` : ""}`;

  return (
    <>
      {/* ── Onglets ── */}
      <nav aria-label="Type de contenu">
        <ul className="flex flex-wrap gap-1.5">
          {(Object.keys(ONGLETS) as Onglet[]).map((o) => (
            <li key={o}>
              <Link
                href={lienOnglet(o)}
                aria-current={o === onglet ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border px-5 text-[15px] ${
                  o === onglet ? "border-ebene bg-ebene font-bold text-creme" : "border-[#D9C7AF] hover:border-ebene"
                }`}
              >
                {ONGLETS[o]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Recherche + statut (sans rechargement de page) ── */}
      <Form action="/admin/contenus" scroll={false} role="search" className="flex flex-wrap items-end gap-3">
        {/* L'onglet en cours est renvoyé avec la recherche. */}
        <input type="hidden" name="type" value={onglet} />
        <div className="flex min-w-0 flex-[2_1_260px] flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-bold">Titre</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Rechercher par titre…" className={champ} />
        </div>
        <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1.5">
          <label htmlFor="statut" className="text-sm font-bold">Statut</label>
          <select id="statut" name="statut" defaultValue={filtre ?? ""} className={champ}>
            <option value="">Tous</option>
            {Object.entries(STATUTS_VALIDATION).map(([valeur, s]) => (
              <option key={valeur} value={valeur}>{s.texte}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="min-h-11 cursor-pointer rounded-[10px] bg-ebene px-6 font-bold text-creme hover:bg-terre">
          Filtrer
        </button>
      </Form>

      {onglet === "oeuvres" && <ListeOeuvres filtre={filtre} texte={texte} supabase={supabase} />}
      {onglet === "evenements" && <ListeEvenements filtre={filtre} texte={texte} supabase={supabase} />}
      {onglet === "opportunites" && <ListeOpportunites filtre={filtre} texte={texte} supabase={supabase} />}
    </>
  );
}

// Paramètres communs aux 3 listes.
type Liste = {
  filtre: StatutValidation | null;
  texte: string;
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"];
};

// ── Bouton Publier / Masquer (formulaire simple) ──
function BoutonVisibilite({
  action,
  id,
  statut,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  statut: StatutValidation;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="statut" value={statut === "approved" ? "rejected" : "approved"} />
      <button type="submit" className={petitBouton}>
        {statut === "approved" ? "Masquer" : "Publier"}
      </button>
    </form>
  );
}

// ── Nombre de résultats ou message vide ──
function Compte({ n, mot }: { n: number; mot: string }) {
  return n === 0 ? (
    <p className="rounded-[20px] bg-creme p-6 text-taupe">Aucun résultat.</p>
  ) : (
    <p aria-live="polite" className="text-taupe">
      {n} {mot}
      {n > 1 ? "s" : ""}
    </p>
  );
}

// ── Onglet Œuvres ──
async function ListeOeuvres({ filtre, texte, supabase }: Liste) {
  let requete = supabase
    .from("artworks")
    .select("id, slug, title, category, price_fcfa, stock, image_paths, status, created_at, artist:artists(id, stage_name)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (filtre) requete = requete.eq("status", filtre);
  if (texte) requete = requete.ilike("title", `%${texte}%`);
  const { data } = await requete;
  const oeuvres = data ?? [];

  return (
    <>
      <Compte n={oeuvres.length} mot="œuvre" />
      <ul className="flex flex-col gap-3">
        {oeuvres.map((o) => (
          <li key={o.id} className={ligne}>
            <span className="hachure relative size-14 flex-none overflow-hidden rounded-xl">
              {o.image_paths[0] && (
                <Image src={storageUrl("artworks", o.image_paths[0])} alt="" fill sizes="56px" className="object-cover" />
              )}
            </span>
            <span className="flex min-w-0 flex-[1_1_240px] flex-col">
              <span className="font-bold">{o.title}</span>
              <span className="text-sm text-taupe">
                {/* Le nom de l'artiste mène à sa fiche admin. */}
                {o.artist ? (
                  <Link href={`/admin/artistes/${o.artist.id}`} className="underline underline-offset-4 hover:text-terre">
                    {o.artist.stage_name}
                  </Link>
                ) : (
                  "—"
                )}{" "}
                · {o.category} · {formatFcfa(o.price_fcfa)} · stock {o.stock}
              </span>
            </span>
            <Pastille statut={o.status} />
            {o.status === "approved" && (
              <Link href={`/marketplace/${o.slug}`} className="text-sm font-bold text-terre hover:text-ebene">
                Voir
              </Link>
            )}
            <BoutonVisibilite action={changerStatutOeuvre} id={o.id} statut={o.status} />
            <BoutonSupprimer action={supprimerOeuvre} id={o.id} question="Supprimer cette œuvre ?" />
          </li>
        ))}
      </ul>
    </>
  );
}

// ── Onglet Événements ──
async function ListeEvenements({ filtre, texte, supabase }: Liste) {
  let requete = supabase
    .from("events")
    .select("id, title, starts_at, city, venue, status, artist:artists(id, stage_name)")
    .order("starts_at", { ascending: false })
    .limit(300);
  if (filtre) requete = requete.eq("status", filtre);
  if (texte) requete = requete.ilike("title", `%${texte}%`);
  const { data } = await requete;
  const evenements = data ?? [];

  return (
    <>
      <Compte n={evenements.length} mot="événement" />
      <ul className="flex flex-col gap-3">
        {evenements.map((e) => {
          const d = formatDay(e.starts_at);
          return (
            <li key={e.id} className={ligne}>
              {/* Pavé date */}
              <span className="flex w-16 flex-none flex-col items-center rounded-xl bg-ebene py-2 text-sable">
                <span className="font-display text-xl font-extrabold leading-none">{d.day}</span>
                <span className="text-xs uppercase">{d.month}</span>
              </span>
              <span className="flex min-w-0 flex-[1_1_240px] flex-col">
                <span className="font-bold">{e.title}</span>
                <span className="text-sm text-taupe">
                  {[e.venue, e.city].filter(Boolean).join(", ")} · {formatDate(e.starts_at)}
                  {e.artist && (
                    <>
                      {" "}
                      ·{" "}
                      <Link href={`/admin/artistes/${e.artist.id}`} className="underline underline-offset-4 hover:text-terre">
                        {e.artist.stage_name}
                      </Link>
                    </>
                  )}
                </span>
              </span>
              <Pastille statut={e.status} />
              <BoutonVisibilite action={changerStatutEvenement} id={e.id} statut={e.status} />
              <BoutonSupprimer action={supprimerEvenement} id={e.id} question="Supprimer cet événement ?" />
            </li>
          );
        })}
      </ul>
    </>
  );
}

// ── Onglet Opportunités ──
async function ListeOpportunites({ filtre, texte, supabase }: Liste) {
  let requete = supabase
    .from("opportunities")
    .select("id, type, title, organizer, deadline, link, status")
    .order("deadline", { ascending: false })
    .limit(300);
  if (filtre) requete = requete.eq("status", filtre);
  if (texte) requete = requete.ilike("title", `%${texte}%`);
  const { data } = await requete;
  const opportunites = data ?? [];

  return (
    <>
      <Compte n={opportunites.length} mot="opportunité" />
      <ul className="flex flex-col gap-3">
        {opportunites.map((o) => (
          <li key={o.id} className={ligne}>
            <span className="flex min-w-0 flex-[1_1_260px] flex-col gap-0.5">
              <span className="text-xs font-bold uppercase tracking-[0.06em] text-terre">{opportunityLabels[o.type]}</span>
              <span className="font-bold">{o.title}</span>
              <span className="text-sm text-taupe">
                {o.organizer} · date limite : {formatDate(o.deadline)}
              </span>
            </span>
            {o.link && (
              <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-terre hover:text-ebene">
                Lien ↗
              </a>
            )}
            <Pastille statut={o.status} />
            <BoutonVisibilite action={changerStatutOpportunite} id={o.id} statut={o.status} />
            <BoutonSupprimer action={supprimerOpportunite} id={o.id} question="Supprimer cette opportunité ?" />
          </li>
        ))}
      </ul>
    </>
  );
}