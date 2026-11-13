// ─────────────────────────────────────────────────────────────
// Back-office › Artistes, adresse : /admin/artistes
// Liste de TOUS les artistes (validés, en attente, refusés),
// avec recherche par nom/ville et filtre par statut.
// Les filtres sont dans l'adresse : /admin/artistes?q=…&statut=approved
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { Pastille, STATUTS_VALIDATION, type StatutValidation } from "@/lib/statuts";
import { storageUrl } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Artistes" };

type Props = { searchParams: Promise<{ q?: string; statut?: string }> };

// ── La page : titre tout de suite, liste dans un Suspense (navigation instantanée).
export default function ArtistesAdminPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">Artistes</h1>
        <p className="text-taupe">Tous les comptes artistes, quel que soit leur statut. Cliquez sur un artiste pour voir sa fiche complète.</p>
      </div>
      <Suspense fallback={<Squelette />}>
        <Liste searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function Squelette() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">Chargement des artistes…</span>
      <div className="h-12 w-full max-w-2xl animate-pulse rounded-xl bg-[#E9DFD2]" />
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-20 animate-pulse rounded-[18px] bg-creme" />
      ))}
    </div>
  );
}

async function Liste({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const { q = "", statut = "" } = await searchParams;
  // On n'accepte que les statuts connus (sinon : pas de filtre).
  const filtre = statut in STATUTS_VALIDATION ? (statut as StatutValidation) : null;

  // Artistes + leur compte (profiles) + nombre d'œuvres.
  // profiles!inner : jointure obligatoire, ce qui permet de filtrer sur profile.status.
  let requete = supabase
    .from("artists")
    .select(
      "id, slug, stage_name, city, disciplines, avatar_path, is_verified, created_at, profile:profiles!inner(status, full_name, phone), oeuvres:artworks(count)",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  // Recherche : on retire les caractères qui perturberaient le filtre.
  const texte = q.replace(/[%_,()]/g, " ").trim();
  if (texte) requete = requete.or(`stage_name.ilike.%${texte}%,city.ilike.%${texte}%`);
  if (filtre) requete = requete.eq("profile.status", filtre);

  const { data } = await requete;
  const artistes = data ?? [];

  const champ =
    "min-h-11 rounded-[10px] border border-ligne bg-creme px-3.5 text-[15px] text-ebene focus-visible:outline-2 focus-visible:outline-ocre";

  return (
    <>
      {/* ── Recherche + filtre (sans rechargement de page) ── */}
      <Form action="/admin/artistes" scroll={false} role="search" className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-[2_1_260px] flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-bold">Nom de scène ou ville</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Ex. Cotonou, Zinsou…" className={champ} />
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

      <p aria-live="polite" className="text-taupe">
        {artistes.length} artiste{artistes.length > 1 ? "s" : ""}
      </p>

      {artistes.length === 0 ? (
        <p className="rounded-[20px] bg-creme p-6 text-taupe">Aucun artiste ne correspond.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {artistes.map((a) => {
            const nbOeuvres = a.oeuvres[0]?.count ?? 0;
            return (
              <li key={a.id}>
                {/* Toute la ligne est cliquable : elle mène à la fiche détaillée. */}
                <Link
                  href={`/admin/artistes/${a.id}`}
                  className="flex flex-wrap items-center gap-4 rounded-[18px] bg-creme p-4 transition-colors hover:bg-white"
                >
                  {/* Photo */}
                  <span className="hachure relative size-14 flex-none overflow-hidden rounded-xl">
                    {a.avatar_path && (
                      <Image src={storageUrl("avatars", a.avatar_path)} alt="" fill sizes="56px" className="object-cover" />
                    )}
                  </span>

                  {/* Nom, nom réel, ville, disciplines */}
                  <span className="flex min-w-0 flex-[1_1_240px] flex-col gap-0.5">
                    <span className="font-bold">
                      {a.stage_name}
                      {a.is_verified && <span className="ml-2 text-sm text-indigo">✓ vérifié</span>}
                    </span>
                    <span className="text-sm text-taupe">
                      {[a.profile.full_name, a.city, a.disciplines.join(", ")].filter(Boolean).join(" · ")}
                    </span>
                  </span>

                  {/* Œuvres et date d'inscription */}
                  <span className="text-sm text-taupe">
                    {nbOeuvres} œuvre{nbOeuvres > 1 ? "s" : ""} · inscrit le {formatDate(a.created_at)}
                  </span>

                  <Pastille statut={a.profile.status} />
                  <span aria-hidden="true" className="font-bold text-terre">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}