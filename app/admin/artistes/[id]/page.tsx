// ─────────────────────────────────────────────────────────────
// Back-office › Artistes › Fiche détaillée, adresse : /admin/artistes/<id>
// Tout ce qui concerne un artiste : compte, contact, profil, réseaux,
// ventes, œuvres (tous statuts), portfolio, événements, commandes.
// + les actions : statut du compte, badge, suppressions.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  basculerBadge,
  changerStatutArtiste,
  changerStatutOeuvre,
  supprimerArtiste,
  supprimerEvenement,
  supprimerOeuvre,
  supprimerPortfolio,
} from "../actions";
import { BoutonSupprimer } from "@/components/admin/bouton-supprimer";
import { requireAdmin } from "@/lib/admin";
import { STATUTS_COMMANDE } from "@/lib/commandes";
import { formatDate, formatDay, formatFcfa } from "@/lib/format";
import { Pastille } from "@/lib/statuts";
import { storageUrl } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Fiche artiste" };

type Props = { params: Promise<{ id: string }> };

// Noms affichés des réseaux sociaux.
const NOMS_RESEAUX: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  audiomack: "Audiomack",
  applemusic: "Apple Music",
  spotify: "Spotify",
};

// ── La page : lien retour tout de suite, fiche dans un Suspense.
export default function FicheArtisteAdmin({ params }: Props) {
  return (
    <div className="flex max-w-5xl flex-col gap-7">
      <Link href="/admin/artistes" className="font-bold text-terre hover:text-ebene">← Tous les artistes</Link>
      <Suspense fallback={<Squelette />}>
        <Fiche params={params} />
      </Suspense>
    </div>
  );
}

function Squelette() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Chargement de la fiche…</span>
      <div className="h-28 animate-pulse rounded-[20px] bg-creme" />
      <div className="h-48 animate-pulse rounded-[20px] bg-creme" />
      <div className="h-64 animate-pulse rounded-[20px] bg-creme" />
    </div>
  );
}

// Styles communs : grandes cartes blanches et boutons.
const bloc = "flex flex-col gap-4 rounded-[20px] bg-creme p-6";
const boutonPlein = "min-h-11 cursor-pointer rounded-full bg-ebene px-5 font-bold text-creme hover:bg-terre";
const boutonContour = "min-h-11 cursor-pointer rounded-full border border-ebene px-5 font-bold hover:bg-ebene hover:text-creme";
const petitBouton = "min-h-10 cursor-pointer rounded-full border border-ligne px-4 text-sm hover:border-ebene";

async function Fiche({ params }: Props) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  // Toutes les lectures en parallèle.
  const [{ data: artiste }, portfolio, oeuvres, evenements, commandes, emails] = await Promise.all([
    supabase
      .from("artists")
      .select("*, profile:profiles!inner(status, full_name, phone, created_at)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("portfolio_items").select("id, title, image_path, media_url, year").eq("artist_id", id).order("position"),
    supabase
      .from("artworks")
      .select("id, slug, title, category, price_fcfa, stock, image_paths, status, created_at")
      .eq("artist_id", id)
      .order("created_at", { ascending: false }),
    // Événements liés à l'artiste OU proposés par lui.
    supabase
      .from("events")
      .select("id, title, starts_at, city, venue, status")
      .or(`artist_id.eq.${id},submitted_by.eq.${id}`)
      .order("starts_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, reference, created_at, price_fcfa, artist_net_fcfa, status, artwork:artworks(title)")
      .eq("artist_id", id)
      .order("created_at", { ascending: false }),
    // E-mail et dernière connexion (fonction réservée aux admins).
    supabase.rpc("admin_emails", { ids: [id] }),
  ]);

  if (!artiste) notFound();

  const compte = emails.data?.[0];
  const reseaux = Object.entries((artiste.social_links ?? {}) as Record<string, string>).filter(([, url]) => url);
  const listeOeuvres = oeuvres.data ?? [];
  const listeCommandes = commandes.data ?? [];

  // Ventes : on ne compte que les commandes réellement payées (ou plus loin).
  const payees = listeCommandes.filter((c) => ["paid", "delivered", "artist_paid"].includes(c.status));
  const chiffreAffaires = payees.reduce((t, c) => t + c.price_fcfa, 0);
  const aReverser = listeCommandes
    .filter((c) => c.status === "paid" || c.status === "delivered")
    .reduce((t, c) => t + c.artist_net_fcfa, 0);

  // Statut actuel du compte (raccourci).
  const statut = artiste.profile.status;

  // Numéro sans espaces pour le lien WhatsApp.
  const tel = artiste.profile.phone?.replace(/\D/g, "");

  return (
    <>
      {/* ── En-tête : photo, nom, statut ── */}
      <section className="flex flex-wrap items-center gap-5 rounded-[20px] bg-creme p-6">
        <span className="hachure relative size-24 flex-none overflow-hidden rounded-full">
          {artiste.avatar_path && (
            <Image src={storageUrl("avatars", artiste.avatar_path)} alt="" fill sizes="96px" className="object-cover" />
          )}
        </span>
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
          <h1 className="font-display text-[32px] font-extrabold leading-none">{artiste.stage_name}</h1>
          <p className="text-taupe">
            {[artiste.city, artiste.disciplines.join(", ")].filter(Boolean).join(" · ")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Pastille statut={artiste.profile.status} />
            {artiste.is_verified && (
              <span className="rounded-full bg-indigo px-2.5 py-1 text-[13px] font-bold text-sable">✓ Artiste vérifié</span>
            )}
          </div>
        </div>
        {/* Profil public : seulement s'il est visible sur le site. */}
        {artiste.profile.status === "approved" && (
          <Link
            href={`/artistes/${artiste.slug}`}
            className="inline-flex min-h-11 items-center rounded-full border border-ebene px-5 font-bold hover:bg-ebene hover:text-creme"
          >
            Voir le profil public
          </Link>
        )}
      </section>

      {/* ── Actions sur le compte ── */}
      <section className={bloc}>
        <h2 className="text-xl font-bold">Actions sur le compte</h2>
        <div className="flex flex-wrap items-start gap-3">
          {/* Valider / suspendre / réactiver (« suspendu » = statut Refusé : invisible sur le site). */}
          {statut !== "approved" && (
            <form action={changerStatutArtiste}>
              <input type="hidden" name="id" value={artiste.id} />
              <input type="hidden" name="statut" value="approved" />
              <button type="submit" className={boutonPlein}>
                {statut === "rejected" ? "Réactiver l'artiste" : "Valider l'artiste"}
              </button>
            </form>
          )}
          {statut !== "rejected" && (
            <form action={changerStatutArtiste}>
              <input type="hidden" name="id" value={artiste.id} />
              <input type="hidden" name="statut" value="rejected" />
              <button type="submit" className={boutonContour}>
                {statut === "approved" ? "Suspendre (masquer du site)" : "Refuser"}
              </button>
            </form>
          )}

          {/* Badge bleu « Artiste vérifié » */}
          <form action={basculerBadge}>
            <input type="hidden" name="id" value={artiste.id} />
            <input type="hidden" name="actuel" value={String(artiste.is_verified)} />
            <button type="submit" className={boutonContour}>
              {artiste.is_verified ? "Retirer le badge vérifié" : "Donner le badge vérifié"}
            </button>
          </form>
        </div>
        <p className="text-sm text-taupe">
          Suspendre masque le profil et toutes ses œuvres du site, sans rien effacer : vous pouvez le réactiver à tout moment.
        </p>

        {/* Zone « danger » : suppression définitive (impossible s'il a des commandes). */}
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-[#E1CEB4] p-4">
          {listeCommandes.length > 0 ? (
            <p className="text-sm text-taupe">
              <strong className="text-ebene">Suppression impossible :</strong> cet artiste a {listeCommandes.length} commande
              {listeCommandes.length > 1 ? "s" : ""}, dont l&apos;historique doit être conservé. Suspendez-le plutôt.
            </p>
          ) : (
            <>
              <p className="text-sm text-taupe">
                Supprimer définitivement le compte, le profil, les œuvres, le portfolio, les événements et toutes les images.
                Cette action est irréversible.
              </p>
              <BoutonSupprimer
                action={supprimerArtiste}
                id={artiste.id}
                libelle="Supprimer l'artiste"
                question={`Supprimer définitivement ${artiste.stage_name} ?`}
                grand
              />
            </>
          )}
        </div>
      </section>

      {/* ── Compte et contact ── */}
      <section className={bloc}>
        <h2 className="text-xl font-bold">Compte et contact</h2>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-6 gap-y-4">
          <Info titre="Nom réel" valeur={artiste.profile.full_name} />
          <Info titre="E-mail" valeur={compte?.email} lien={compte?.email ? `mailto:${compte.email}` : undefined} />
          <Info titre="Téléphone / WhatsApp" valeur={artiste.profile.phone} lien={tel ? `https://wa.me/${tel}` : undefined} />
          <Info titre="Inscrit le" valeur={formatDate(artiste.profile.created_at)} />
          <Info
            titre="Dernière connexion"
            valeur={compte?.last_sign_in_at ? formatDate(compte.last_sign_in_at) : "Jamais"}
          />
          <Info titre="Adresse du profil" valeur={`/artistes/${artiste.slug}`} />
        </dl>
      </section>

      {/* ── Ventes ── */}
      <section className={bloc}>
        <h2 className="text-xl font-bold">Ventes</h2>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <Chiffre titre="Commandes" valeur={String(listeCommandes.length)} />
          <Chiffre titre="Ventes payées" valeur={String(payees.length)} />
          <Chiffre titre="Chiffre d'affaires" valeur={formatFcfa(chiffreAffaires)} />
          <Chiffre titre="Reste à lui reverser" valeur={formatFcfa(aReverser)} />
        </dl>
      </section>

      {/* ── Biographie et réseaux ── */}
      <section className={bloc}>
        <h2 className="text-xl font-bold">Biographie et réseaux</h2>
        {/* whitespace-pre-line : garde les retours à la ligne tapés par l'artiste. */}
        <p className="whitespace-pre-line leading-relaxed text-[#4A3426]">{artiste.bio || "Pas encore de biographie."}</p>
        {reseaux.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {reseaux.map(([nom, url]) => (
              <li key={nom}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full border border-ligne px-4 text-sm hover:border-ebene"
                >
                  {NOMS_RESEAUX[nom] ?? nom} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Œuvres (tous statuts) ── */}
      <section className={bloc}>
        <h2 className="text-xl font-bold">Œuvres ({listeOeuvres.length})</h2>
        {listeOeuvres.length === 0 ? (
          <p className="text-taupe">Aucune œuvre.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {listeOeuvres.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#EFE3D2] p-3">
                <span className="hachure relative size-14 flex-none overflow-hidden rounded-xl">
                  {o.image_paths[0] && (
                    <Image src={storageUrl("artworks", o.image_paths[0])} alt="" fill sizes="56px" className="object-cover" />
                  )}
                </span>
                <span className="flex min-w-0 flex-[1_1_220px] flex-col">
                  <span className="font-bold">{o.title}</span>
                  <span className="text-sm text-taupe">
                    {o.category} · {formatFcfa(o.price_fcfa)} · stock {o.stock}
                  </span>
                </span>
                <Pastille statut={o.status} />
                {o.status === "approved" && (
                  <Link href={`/marketplace/${o.slug}`} className="text-sm font-bold text-terre hover:text-ebene">
                    Voir
                  </Link>
                )}
                {/* Publier / masquer sans supprimer */}
                <form action={changerStatutOeuvre}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="statut" value={o.status === "approved" ? "rejected" : "approved"} />
                  <button type="submit" className={petitBouton}>
                    {o.status === "approved" ? "Masquer" : "Publier"}
                  </button>
                </form>
                <BoutonSupprimer action={supprimerOeuvre} id={o.id} question="Supprimer cette œuvre ?" />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Portfolio ── */}
      <section className={bloc}>
        <h2 className="text-xl font-bold">Portfolio ({portfolio.data?.length ?? 0})</h2>
        {(portfolio.data ?? []).length === 0 ? (
          <p className="text-taupe">Portfolio vide.</p>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
            {(portfolio.data ?? []).map((p) => (
              <li key={p.id} className="flex flex-col gap-1.5">
                {p.image_path ? (
                  <span className="hachure relative block aspect-square overflow-hidden rounded-xl">
                    <Image src={storageUrl("portfolio", p.image_path)} alt={p.title ?? ""} fill sizes="140px" className="object-cover" />
                  </span>
                ) : (
                  <a
                    href={p.media_url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-square items-center justify-center rounded-xl bg-sable p-3 text-center text-sm font-bold text-terre"
                  >
                    Lien audio / vidéo ↗
                  </a>
                )}
                <span className="truncate text-sm">{p.title || "Sans titre"}</span>
                <BoutonSupprimer action={supprimerPortfolio} id={p.id} question="Supprimer ?" />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Événements ── */}
      <section className={bloc}>
        <h2 className="text-xl font-bold">Événements ({evenements.data?.length ?? 0})</h2>
        {(evenements.data ?? []).length === 0 ? (
          <p className="text-taupe">Aucun événement.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {(evenements.data ?? []).map((e) => {
              const d = formatDay(e.starts_at);
              return (
                <li key={e.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#EFE3D2] p-3">
                  <span className="w-20 flex-none text-sm font-bold">
                    {d.day} {d.month}
                  </span>
                  <span className="flex min-w-0 flex-[1_1_220px] flex-col">
                    <span className="font-bold">{e.title}</span>
                    <span className="text-sm text-taupe">{[e.venue, e.city].filter(Boolean).join(", ")}</span>
                  </span>
                  <Pastille statut={e.status} />
                  <BoutonSupprimer action={supprimerEvenement} id={e.id} question="Supprimer cet événement ?" />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Commandes ── */}
      <section className={bloc}>
        <h2 className="text-xl font-bold">Commandes ({listeCommandes.length})</h2>
        {listeCommandes.length === 0 ? (
          <p className="text-taupe">Aucune commande.</p>
        ) : (
          // overflow-x-auto : sur téléphone, le tableau défile horizontalement.
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[15px]">
              <thead>
                <tr className="text-left text-[13px] text-taupe">
                  <th className="px-3 py-2.5 font-bold">Référence</th>
                  <th className="px-3 py-2.5 font-bold">Œuvre</th>
                  <th className="px-3 py-2.5 font-bold">Date</th>
                  <th className="px-3 py-2.5 font-bold">Net artiste</th>
                  <th className="px-3 py-2.5 font-bold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {listeCommandes.map((c) => {
                  const s = STATUTS_COMMANDE[c.status];
                  return (
                    <tr key={c.id} className="border-t border-[#EFE3D2]">
                      <td className="px-3 py-3 font-bold">{c.reference}</td>
                      <td className="px-3 py-3">{c.artwork?.title ?? "—"}</td>
                      <td className="px-3 py-3 text-taupe">{formatDate(c.created_at)}</td>
                      <td className="px-3 py-3">{formatFcfa(c.artist_net_fcfa)}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[13px] font-bold ${s.style}`}>{s.texte}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

// ── Une information (titre gris + valeur), avec lien facultatif.
function Info({ titre, valeur, lien }: { titre: string; valeur?: string | null; lien?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-sm text-taupe">{titre}</dt>
      <dd className="break-words font-bold">
        {valeur ? (
          lien ? (
            <a href={lien} target="_blank" rel="noopener noreferrer" className="text-terre underline underline-offset-4">
              {valeur}
            </a>
          ) : (
            valeur
          )
        ) : (
          <span className="font-normal text-taupe">—</span>
        )}
      </dd>
    </div>
  );
}

// ── Un chiffre clé (petite carte).
function Chiffre({ titre, valeur }: { titre: string; valeur: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-sable p-4">
      <dt className="text-sm text-taupe">{titre}</dt>
      <dd className="font-display text-2xl font-extrabold">{valeur}</dd>
    </div>
  );
}