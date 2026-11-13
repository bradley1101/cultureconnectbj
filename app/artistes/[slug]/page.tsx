// ─────────────────────────────────────────────────────────────
// Page Profil artiste, adresse : /artistes/[slug]
// [slug] change selon l'artiste (ex. /artistes/kofi-mensah).
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Image from "next/image";
// notFound() affiche la page 404 si l'artiste n'existe pas.
import { notFound } from "next/navigation";
// Suspense : affiche un message de chargement pendant la lecture des données.
import { Suspense, ViewTransition } from "react";
import { SiteHeader } from "@/components/site-header";
import { Frise } from "@/components/motion/frise";
import { SiteFooter } from "@/components/site-footer";
import { ProfileTabs } from "@/components/artist/profile-tabs";
import { getArtistBySlug, getWhatsappNumber } from "@/lib/artist-data";
import { storageUrl } from "@/lib/supabase/public";
import { OG_BASE } from "@/lib/constants";

const hachure =
  "bg-[#E9D9C2] bg-[repeating-linear-gradient(45deg,rgba(43,26,16,0.06)_0_10px,transparent_10px_20px)]";

  // Noms affichés des réseaux (code enregistré → texte lisible).
const NOMS_RESEAUX: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  audiomack: "Audiomack",
  applemusic: "Apple Music",
  spotify: "Spotify",
};

// Next.js donne le « slug » de l'adresse dans « params ».
type Params = { params: Promise<{ slug: string }> };

// Titre de l'onglet du navigateur et description pour Google,
// ex. « Kofi Mensah · CultureConnectBJ ».
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArtistBySlug(slug);
  if (!data) return { title: "Artiste introuvable" };
  const description = data.artist.bio?.slice(0, 160) ?? undefined;
  return {
    title: data.artist.stage_name,
    description,
    // Titre et texte affichés sous l'image quand on partage le lien sur WhatsApp.
    openGraph: { ...OG_BASE, title: `${data.artist.stage_name} — artiste sur CultureConnectBJ`, description, type: "profile" },
  };
}
// La page : en-tête et pied de page s'affichent tout de suite,
// le profil arrive dès que les données sont lues.
export default function ArtistPage({ params }: Params) {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
                {/* Le message de chargement part vite, le profil arrive en montant. */}
        <Suspense
          fallback={
            <ViewTransition exit="squelette-part" default="none">
              <div className="mx-auto max-w-7xl px-6 py-24 text-taupe">Chargement du profil…</div>
            </ViewTransition>
          }
        >
          <ViewTransition enter="contenu-monte" default="none">
            <ArtistProfile params={params} />
          </ViewTransition>
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

// Le contenu du profil.
async function ArtistProfile({ params }: Params) {
  const { slug } = await params;
  // On lit l'artiste et le numéro WhatsApp en même temps.
  const [data, whatsapp] = await Promise.all([getArtistBySlug(slug), getWhatsappNumber()]);
  if (!data) notFound();
  const { artist, portfolio, artworks, events } = data;

  // Réseaux sociaux de l'artiste : on ne garde que les vrais liens (commençant par http).
  const reseaux = Object.entries((artist.social_links ?? {}) as Record<string, string>).filter(
    ([, url]) => typeof url === "string" && url.startsWith("http"),
  );

  // Lien WhatsApp vers le numéro officiel, avec un message déjà écrit.
  // replace(/\D/g, "") retire tout ce qui n'est pas un chiffre (+, espaces).
  const message = encodeURIComponent(
    `Bonjour, je souhaite contacter l'artiste ${artist.stage_name} (profil CultureConnectBJ).`,
  );
  const lienWhatsapp = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${message}`;

  return (
    <>
      {/* ═════════ EN-TÊTE DU PROFIL ═════════ */}
      <section>
        {/* Bannière (280 px de haut). priority : chargée en premier. */}
        <div className={`relative h-[280px] ${hachure}`}>
          {artist.banner_path && (
            <Image src={storageUrl("covers", artist.banner_path)} alt="" fill priority sizes="100vw" className="object-cover" />
          )}
        </div>
        <Frise />

        <div className="mx-auto flex max-w-7xl flex-wrap items-end gap-8 px-6">
          {/* Photo ronde qui « déborde » sur la bannière (-mt-[90px] la remonte). */}
                    {/* Même nom que la photo de la carte cliquée → elle « voyage » jusqu'ici. */}
          <ViewTransition name={`artiste-${artist.slug}`} share="morph" default="none">
            <div className={`relative -mt-[90px] size-[180px] flex-none overflow-hidden rounded-full border-[6px] border-creme ${hachure}`}>
              {artist.avatar_path && (
                <Image src={storageUrl("avatars", artist.avatar_path)} alt={`Portrait de ${artist.stage_name}`} fill sizes="180px" className="object-cover" />
              )}
            </div>
          </ViewTransition>

          {/* Nom, badge, discipline et ville. */}
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5 pt-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-5xl font-extrabold leading-none tracking-[-0.02em]">{artist.stage_name}</h1>
              {/* Badge affiché seulement si l'admin a vérifié l'artiste. */}
              {artist.is_verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo px-3 py-1.5 text-[13px] font-bold text-sable">
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Artiste vérifié
                </span>
              )}
            </div>
            <p className="text-[17px] text-taupe">
              {/* Ex. « Peinture · Porto-Novo, Bénin ». filter(Boolean) retire les infos vides. */}
              {[artist.disciplines[0], artist.city ? `${artist.city}, Bénin` : null].filter(Boolean).join(" · ")}
            </p>
          </div>

          {/* Bouton WhatsApp. target="_blank" : ouvre WhatsApp dans un nouvel onglet. */}
          <div className="flex flex-wrap gap-2.5 pt-6">
            <a
              href={lienWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ocre px-[22px] font-bold text-ebene transition-colors hover:bg-or"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8L4 20z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              Contacter sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ═════════ CORPS : onglets à gauche, encadrés à droite ═════════ */}
      <section className="mx-auto flex max-w-7xl flex-wrap gap-10 px-6 pt-10 pb-[72px]">
        <div className="min-w-0 flex-[999_1_620px]">
          <ProfileTabs portfolio={portfolio} artworks={artworks} events={events} />
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          {/* Biographie (si renseignée). whitespace-pre-line garde les retours à la ligne. */}
          {artist.bio && (
            <div className="flex flex-col gap-3 rounded-[20px] bg-sable p-6">
              <h2 className="text-lg font-bold">Biographie</h2>
              <p className="whitespace-pre-line leading-relaxed text-[#4A3426]">{artist.bio}</p>
            </div>
          )}

          {/* Disciplines sous forme de pastilles. */}
          {artist.disciplines.length > 0 && (
            <div className="flex flex-col gap-3 rounded-[20px] border border-ligne p-6">
              <h2 className="text-lg font-bold">Disciplines</h2>
              <ul className="flex flex-wrap gap-2">
                {artist.disciplines.map((d) => (
                  <li key={d} className="rounded-full bg-sable px-3 py-1.5 text-sm">{d}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Liens vers les réseaux (YouTube, Instagram…). */}
          {reseaux.length > 0 && (
            <div className="flex flex-col gap-3 rounded-[20px] border border-ligne p-6">
              <h2 className="text-lg font-bold">Écouter et suivre</h2>
              <ul className="flex flex-col gap-2">
                {reseaux.map(([nom, url]) => (
                  <li key={nom}>
                                        {/* Nom lisible du réseau ; si un code est inconnu, on affiche le code tel quel. */}
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-terre hover:text-ebene">
                      {NOMS_RESEAUX[nom] ?? nom}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}