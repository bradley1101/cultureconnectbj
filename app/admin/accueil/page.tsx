// ─────────────────────────────────────────────────────────────
// Back-office › Page d'accueil
// L'admin voit ce qui s'affiche sur l'accueil et peut épingler des éléments.
//
// Pour une navigation INSTANTANÉE :
//  - le titre et l'explication s'affichent tout de suite ;
//  - les 5 sections (qui lisent la base) arrivent ensuite,
//    à l'intérieur d'un <Suspense> qui montre un squelette en attendant.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { SectionAccueil } from "@/components/admin/section-accueil";
import { requireAdmin } from "@/lib/admin";
import { formatDay } from "@/lib/format";
import {
  getFeaturedArtists,
  getHomeResources,
  getLatestArtworks,
  getOpenOpportunities,
  getUpcomingEvents,
} from "@/lib/home-data";

export const metadata: Metadata = { title: "Page d'accueil" };

// ── La page : aucune lecture de données ici, elle s'affiche donc immédiatement.
export default function AccueilAdminPage() {
  return (
    <div className="flex max-w-5xl flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">Page d&apos;accueil</h1>
        <p className="text-taupe">
          Par défaut, l&apos;accueil se remplit tout seul. Épinglez un élément pour le placer en tête de
          sa section pendant la durée choisie ; les places restantes suivent la règle automatique.
        </p>
      </div>

      {/* Tant que les sections chargent, on affiche le squelette ci-dessous. */}
      <Suspense fallback={<SqueletteSections />}>
        <Sections />
      </Suspense>
    </div>
  );
}

// ── Squelette : 5 blocs qui « pulsent » à la place des 5 sections.
function SqueletteSections() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-7">
      <span className="sr-only">Chargement des sections…</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="h-48 animate-pulse rounded-[20px] bg-creme" />
      ))}
    </div>
  );
}

// ── Les 5 sections : c'est ici qu'on lit la base (donc à l'intérieur du Suspense).
async function Sections() {
  // Vérifie que l'utilisateur est admin (sinon redirection).
  const { supabase } = await requireAdmin();
  // Indique que ce code dépend de l'heure actuelle (calculée à chaque requête).
  await connection();
  const maintenant = new Date().toISOString();
  const aujourdhui = maintenant.slice(0, 10);

  // 5 lectures « ce qui est affiché » + 5 lectures « ce qu'on peut épingler », en parallèle.
  const [
    artistes, oeuvres, evenements, opportunites, ressources,
    cArtistes, cOeuvres, cEvenements, cOpportunites, cRessources,
  ] = await Promise.all([
    getFeaturedArtists(),
    getLatestArtworks(),
    getUpcomingEvents(),
    getOpenOpportunities(),
    getHomeResources(),
    supabase.from("artists").select("id, stage_name, city, profile:profiles!inner(status)")
      .eq("profile.status", "approved").order("stage_name"),
    supabase.from("artworks").select("id, title, artist:artists(stage_name)")
      .eq("status", "approved").gt("stock", 0).order("created_at", { ascending: false }),
    supabase.from("events").select("id, title, starts_at")
      .eq("status", "approved").gte("starts_at", maintenant).order("starts_at"),
    supabase.from("opportunities").select("id, title, organizer")
      .eq("status", "approved").gte("deadline", aujourdhui).order("deadline"),
    supabase.from("resources").select("id, title")
      .eq("published", true).order("published_at", { ascending: false }),
  ]);

  // Petit utilitaire : « 12 nov. » à partir d'une date ISO.
  const jour = (iso: string) => {
    const d = formatDay(iso);
    return `${d.day} ${d.month}`;
  };

  return (
    <>
      <SectionAccueil
        section="artistes" titre="Artistes à la une" maximum={4}
        regle="artistes vérifiés d'abord, puis les derniers inscrits"
        affiches={artistes.map((a) => ({ id: a.id, libelle: `${a.stage_name}${a.city ? ` · ${a.city}` : ""}`, featured_until: a.featured_until }))}
        candidats={(cArtistes.data ?? []).map((a) => ({ id: a.id, libelle: `${a.stage_name}${a.city ? ` · ${a.city}` : ""}` }))}
      />
      <SectionAccueil
        section="oeuvres" titre="Œuvres à acquérir" maximum={4}
        regle="les dernières œuvres validées et en stock"
        affiches={oeuvres.map((o) => ({ id: o.id, libelle: `${o.title}${o.artist ? ` · ${o.artist.stage_name}` : ""}`, featured_until: o.featured_until }))}
        candidats={(cOeuvres.data ?? []).map((o) => ({ id: o.id, libelle: `${o.title}${o.artist ? ` · ${o.artist.stage_name}` : ""}` }))}
      />
      <SectionAccueil
        section="agenda" titre="Agenda culturel" maximum={3}
        regle="les prochains événements validés"
        affiches={evenements.map((e) => ({ id: e.id, libelle: `${jour(e.starts_at)} · ${e.title}`, featured_until: e.featured_until }))}
        candidats={(cEvenements.data ?? []).map((e) => ({ id: e.id, libelle: `${jour(e.starts_at)} · ${e.title}` }))}
      />
      <SectionAccueil
        section="opportunites" titre="Opportunités" maximum={3}
        regle="les dates limites les plus proches"
        affiches={opportunites.map((o) => ({ id: o.id, libelle: `${o.title} · ${o.organizer}`, featured_until: o.featured_until }))}
        candidats={(cOpportunites.data ?? []).map((o) => ({ id: o.id, libelle: `${o.title} · ${o.organizer}` }))}
      />
      <SectionAccueil
        section="ressources" titre="Ressources pour les artistes" maximum={3}
        regle="les derniers guides publiés (3 guides par défaut si aucun)"
        affiches={ressources.map((r) => ({ id: r.id, libelle: r.title, featured_until: r.featured_until }))}
        candidats={(cRessources.data ?? []).map((r) => ({ id: r.id, libelle: r.title }))}
      />
    </>
  );
}