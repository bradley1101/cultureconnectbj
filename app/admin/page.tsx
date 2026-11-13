// ─────────────────────────────────────────────────────────────
// Back-office : vue d'ensemble, adresse : /admin
// 4 chiffres clés + listes de tout ce qui attend une validation.
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { Compteur } from "@/components/motion/compteur";
import { deciderEvenement, deciderOeuvre, deciderOpportunite, deciderProfil } from "./actions";
import { BoutonsDecision } from "@/components/admin/boutons-decision";
import { requireAdmin } from "@/lib/admin";
import { formatDate, formatDay, formatFcfa, opportunityLabels } from "@/lib/format";
import { storageUrl } from "@/lib/supabase/public";

export default async function VueEnsemble() {
  const { supabase } = await requireAdmin();

  // Premier jour du mois à minuit.
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  // Toutes les lectures en même temps. En tant qu'admin, la base
  // nous laisse voir les éléments « en attente » de tout le monde.
  const [artistes, profils, oeuvres, evenements, opportunites, commandesMois] = await Promise.all([
    // Nombre total d'artistes (count sans télécharger les lignes).
    supabase.from("artists").select("id", { count: "exact", head: true }),
    // Comptes en attente, avec leur fiche artiste ou professionnelle.
    supabase
      .from("profiles")
      .select("id, role, full_name, phone, created_at, artist:artists(slug, stage_name, city, disciplines), pro:professionals(organization)")
      .eq("status", "pending")
      .in("role", ["artist", "pro"])
      .order("created_at"),
    supabase.from("artworks").select("id, title, category, price_fcfa, image_paths, artist:artists(stage_name)").eq("status", "pending").order("created_at"),
    supabase.from("events").select("id, title, starts_at, city, venue").eq("status", "pending").order("created_at"),
    supabase.from("opportunities").select("id, type, title, organizer, deadline").eq("status", "pending").order("created_at"),
    supabase.from("orders").select("status, commission_fcfa").gte("created_at", debutMois.toISOString()),
  ]);

  // Raccourcis (listes vides si rien).
  const p = profils.data ?? [];
  const o = oeuvres.data ?? [];
  const e = evenements.data ?? [];
  const op = opportunites.data ?? [];
  const cm = commandesMois.data ?? [];
  const aValider = p.length + o.length + e.length + op.length;

  // 4 chiffres clés.
  const chiffres = [
    { label: "Artistes inscrits", valeur: String(artistes.count ?? 0) },
    { label: "À valider", valeur: String(aValider), alerte: aValider > 0 },
    { label: "Commandes du mois", valeur: String(cm.filter((c) => c.status !== "cancelled").length) },
    {
      // Commission gagnée = commandes payées, livrées ou déjà reversées.
      label: "Commissions du mois",
      valeur: formatFcfa(
        cm.filter((c) => ["paid", "delivered", "artist_paid"].includes(c.status)).reduce((t, c) => t + c.commission_fcfa, 0),
      ),
    },
  ];

  // Style commun d'une ligne à valider.
  const carte = "flex flex-wrap items-center gap-4 rounded-2xl border border-[#EFE3D2] p-4";

  return (
    <div className="flex flex-col gap-7">
      <h1 className="font-display text-[36px] font-extrabold leading-none">Vue d&apos;ensemble</h1>

      {/* ── Chiffres ── (« À valider » en terre cuite s'il y a du travail) */}
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {chiffres.map((c) => (
          <li key={c.label} className="flex flex-col gap-1.5 rounded-[18px] bg-creme p-5">
            <span className="text-sm text-taupe">{c.label}</span>
            <span className={`font-display text-[30px] font-extrabold leading-tight ${c.alerte ? "text-terre" : ""}`}><Compteur valeur={c.valeur} /></span>
          </li>
        ))}
      </ul>

      {aValider === 0 && <p className="rounded-[20px] bg-creme p-6 text-taupe">Rien à valider pour le moment.</p>}

      {/* ══════ COMPTES ══════ */}
      {p.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[20px] bg-creme p-6">
          <h2 className="text-xl font-bold">Comptes à valider ({p.length})</h2>
          {p.map((x) => (
            <div key={x.id} className={carte}>
              <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-terre">{x.role === "pro" ? "Professionnel" : "Artiste"}</span>
                {/* Nom de scène, sinon nom de la structure, sinon nom complet. */}
                <span className="font-bold">
                  {x.artist?.stage_name ?? x.pro?.organization ?? x.full_name}
                  {x.artist && (
                    <Link href={`/artistes/${x.artist.slug}`} className="ml-2 text-sm font-normal text-terre underline">fiche</Link>
                  )}
                </span>
                <span className="text-sm text-taupe">
                  {[x.full_name, x.phone, x.artist?.city, x.artist?.disciplines?.join(", ")].filter(Boolean).join(" · ")}
                  {x.role === "artist" && !x.artist ? " · fiche artiste pas encore créée" : ""}
                </span>
              </div>
              {/* Case « Badge vérifié » seulement si une fiche artiste existe. */}
              <BoutonsDecision action={deciderProfil} id={x.id} avecBadge={Boolean(x.artist)} />
            </div>
          ))}
        </section>
      )}

      {/* ══════ ŒUVRES ══════ */}
      {o.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[20px] bg-creme p-6">
          <h2 className="text-xl font-bold">Œuvres à publier ({o.length})</h2>
          {o.map((x) => (
            <div key={x.id} className={carte}>
              <span className="relative size-16 flex-none overflow-hidden rounded-xl bg-[#E9D9C2]">
                {x.image_paths[0] && <Image src={storageUrl("artworks", x.image_paths[0])} alt="" fill sizes="64px" className="object-cover" />}
              </span>
              <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
                <span className="font-bold">{x.title}</span>
                <span className="text-sm text-taupe">{x.artist?.stage_name} · {x.category} · {formatFcfa(x.price_fcfa)}</span>
              </div>
              <BoutonsDecision action={deciderOeuvre} id={x.id} />
            </div>
          ))}
        </section>
      )}

      {/* ══════ ÉVÉNEMENTS ══════ */}
      {e.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[20px] bg-creme p-6">
          <h2 className="text-xl font-bold">Événements proposés ({e.length})</h2>
          {e.map((x) => {
            const d = formatDay(x.starts_at);
            return (
              <div key={x.id} className={carte}>
                <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
                  <span className="font-bold">{x.title}</span>
                  <span className="text-sm text-taupe">
                    {d.day} {d.month} à {d.time} · {x.venue ? `${x.venue}, ` : ""}{x.city}
                  </span>
                </div>
                <BoutonsDecision action={deciderEvenement} id={x.id} />
              </div>
            );
          })}
        </section>
      )}

      {/* ══════ OPPORTUNITÉS ══════ */}
      {op.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[20px] bg-creme p-6">
          <h2 className="text-xl font-bold">Opportunités proposées ({op.length})</h2>
          {op.map((x) => (
            <div key={x.id} className={carte}>
              <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-terre">{opportunityLabels[x.type]}</span>
                <span className="font-bold">{x.title}</span>
                <span className="text-sm text-taupe">{x.organizer} · jusqu&apos;au {formatDate(x.deadline)}</span>
              </div>
              <BoutonsDecision action={deciderOpportunite} id={x.id} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}