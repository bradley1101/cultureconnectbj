// ─────────────────────────────────────────────────────────────
// Fiche œuvre, adresse : /marketplace/[slug]
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Gallery } from "@/components/artwork/gallery";
import { OrderButton } from "@/components/artwork/order-button";
import { getArtworkBySlug } from "@/lib/artwork-data";
import { formatFcfa } from "@/lib/format";
import { storageUrl } from "@/lib/supabase/public";
import { OG_BASE } from "@/lib/constants";

const hachure =
  "bg-[#E9D9C2] bg-[repeating-linear-gradient(45deg,rgba(43,26,16,0.06)_0_10px,transparent_10px_20px)]";

type Params = { params: Promise<{ slug: string }> };

// Titre de l'onglet et description pour Google.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArtworkBySlug(slug);
  if (!data) return { title: "Œuvre introuvable" };
    const titre = `${data.artwork.title} — ${data.artwork.artist?.stage_name ?? "CultureConnectBJ"}`;
  const description = data.artwork.description?.slice(0, 160) ?? undefined;
  return {
    title: data.artwork.title,
    description,
    // Titre et texte affichés sous l'image quand on partage le lien sur WhatsApp.
    openGraph: { ...OG_BASE, title: titre, description },
  };
}

// En-tête et pied de page tout de suite, la fiche dès que les données arrivent.
export default function ArtworkPage({ params }: Params) {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
                {/* Le message de chargement part vite, la fiche arrive en montant. */}
        <Suspense
          fallback={
            <ViewTransition exit="squelette-part" default="none">
              <div className="mx-auto max-w-7xl px-6 py-24 text-taupe">Chargement de l&apos;œuvre…</div>
            </ViewTransition>
          }
        >
          <ViewTransition enter="contenu-monte" default="none">
            <ArtworkDetail params={params} />
          </ViewTransition>
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function ArtworkDetail({ params }: Params) {
  const { slug } = await params;
  const data = await getArtworkBySlug(slug);
  if (!data) notFound();

  // « o » = l'œuvre, « autres » = les autres œuvres de l'artiste.
  const { artwork: o, autres } = data;
  const artiste = o.artist;
  const prix = formatFcfa(o.price_fcfa);
  const disponible = o.stock > 0;

  // Tableau des détails. filter() retire les lignes vides (ex. pas de dimensions).
  const details = [
    { label: "Technique", valeur: o.technique },
    { label: "Dimensions", valeur: o.dimensions },
    { label: "Année", valeur: o.year?.toString() },
    { label: "Format", valeur: o.kind === "digital" ? "Œuvre numérique" : "Œuvre physique" },
  ].filter((d) => d.valeur);

  return (
    <>
      {/* ── Fil d'Ariane : Accueil / Marketplace / Titre ── */}
      <nav aria-label="Fil d'Ariane" className="mx-auto max-w-7xl px-6 pt-5 text-sm text-taupe">
        <ol className="flex flex-wrap gap-1.5">
          <li><Link href="/" className="text-terre hover:text-ebene">Accueil</Link> /</li>
          <li><Link href="/marketplace" className="text-terre hover:text-ebene">Marketplace</Link> /</li>
          <li aria-current="page">{o.title}</li>
        </ol>
      </nav>

      <section className="mx-auto flex max-w-7xl flex-wrap gap-12 px-6 pt-6 pb-[72px]">
        {/* ═════════ Colonne gauche : galerie ═════════ */}
        <div className="min-w-0 flex-[1_1_520px]">
          <Gallery images={o.image_paths} titre={o.title} slug={slug} />
        </div>

        {/* ═════════ Colonne droite : infos + commande ═════════ */}
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-[22px]">
          {/* Catégorie, + « pièce unique » pour une œuvre physique en 1 exemplaire. */}
          <span className="self-start rounded-full bg-sable px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-terre">
            {o.category}
            {o.stock === 1 && o.kind === "physical" ? " · pièce unique" : ""}
          </span>

          <h1 className="font-display text-[52px] font-extrabold leading-[1.02] tracking-[-0.02em]">{o.title}</h1>

          {/* Artiste : photo ronde + nom, cliquable vers son profil. */}
          {artiste && (
            <Link href={`/artistes/${artiste.slug}`} className="group flex items-center gap-3">
              <span className={`relative size-12 flex-none overflow-hidden rounded-full ${hachure}`}>
                {artiste.avatar_path && (
                  <Image src={storageUrl("avatars", artiste.avatar_path)} alt="" fill sizes="48px" className="object-cover" />
                )}
              </span>
              <span className="flex flex-col">
                <span className="font-bold group-hover:text-terre">{artiste.stage_name}</span>
                <span className="text-sm text-taupe">
                  {[artiste.disciplines[0], artiste.city].filter(Boolean).join(" · ")}
                </span>
              </span>
            </Link>
          )}

          {/* Prix en grand. toLocaleString ajoute les espaces : 150 000. */}
          <p className="font-display text-[40px] font-extrabold">
            {o.price_fcfa.toLocaleString("fr-FR")} <span className="text-[22px]">FCFA</span>
          </p>

          {/* Bouton de commande si l'œuvre est en stock, sinon « Œuvre vendue ». */}
          {disponible ? (
            <OrderButton
              artworkId={o.id}
              titre={o.title}
              artiste={artiste?.stage_name ?? ""}
              prix={prix}
              adresse={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/marketplace/${o.slug}`}
            />
          ) : (
            <p className="rounded-2xl bg-sable px-6 py-[18px] text-center font-bold text-taupe">Œuvre vendue</p>
          )}

          <p className="text-sm leading-[1.55] text-taupe">
            Paiement par MTN MoMo ou Moov Money après confirmation de disponibilité par notre équipe.
            Référence de commande générée automatiquement.
          </p>

          {/* Tableau des détails en 2 colonnes. gap-px + fond « ligne » = fines séparations. */}
          {details.length > 0 && (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ligne bg-ligne">
              {details.map((d) => (
                <div key={d.label} className="bg-creme px-4 py-3.5">
                  <dt className="text-[13px] text-taupe">{d.label}</dt>
                  <dd className="mt-1 font-bold">{d.valeur}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Description écrite par l'artiste. */}
          {o.description && (
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">À propos de l&apos;œuvre</h2>
              <p className="whitespace-pre-line leading-relaxed text-[#4A3426]">{o.description}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═════════ Du même artiste (seulement s'il y en a) ═════════ */}
      {autres.length > 0 && artiste && (
        <section className="bg-sable">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <h2 className="mb-6 font-display text-[32px] font-extrabold">Du même artiste</h2>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {autres.map((a) => (
                <li key={a.id}>
                  <Link href={`/marketplace/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-creme">
                                        {/* Même nom que la grande image de SA fiche → elle s'y agrandit au clic. */}
                    <ViewTransition name={`oeuvre-${a.slug}`} share="morph" default="none">
                      <span className={`relative block aspect-square overflow-hidden ${hachure}`}>
                        {a.image_paths[0] && (
                          <Image src={storageUrl("artworks", a.image_paths[0])} alt="" fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        )}
                      </span>
                    </ViewTransition>
                    <span className="flex flex-col gap-1 px-4 py-3.5">
                      <span className="font-bold group-hover:text-terre">{a.title}</span>
                      <span className="text-sm">{formatFcfa(a.price_fcfa)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}