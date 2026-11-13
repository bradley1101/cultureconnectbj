// ─────────────────────────────────────────────────────────────
// Page d'accueil (adresse « / »).
// Elle assemble les sections dans l'ordre de la maquette.
// Chaque section est un composant rangé dans components/home/.
// ─────────────────────────────────────────────────────────────

// En-tête et pied de page communs.
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
// Sections de l'accueil.
import { Hero } from "@/components/home/hero"; // grand bandeau brun + recherche
import { Disciplines } from "@/components/home/disciplines"; // pastilles des disciplines
import { FeaturedArtists } from "@/components/home/featured-artists"; // artistes à la une
import { LatestArtworks } from "@/components/home/latest-artworks"; // œuvres à acquérir
import { HowToBuy } from "@/components/home/how-to-buy"; // acheter en 3 étapes
import { AgendaOpportunities } from "@/components/home/agenda-opportunities"; // agenda + opportunités
import { Resources } from "@/components/home/resources"; // guides pour les artistes
import { IntroVideo } from "@/components/motion/intro-video"; // vidéo d'ouverture
import { ScrollReveal } from "@/components/motion/scroll-reveal"; // révélations au défilement
import { ArtistCta } from "@/components/home/artist-cta"; // bandeau ocre « Vous êtes artiste ? »
import { Separateur } from "@/components/motifs/motif"; // ligne — motif d'Abomey — ligne
import { BandeauDisciplines } from "@/components/home/bandeau-disciplines"; // disciplines qui défilent

export default function Home() {
  return (
    // <> … </> : « fragment », regroupe plusieurs éléments sans ajouter de balise.
    <>
      {/* Vidéo d'ouverture (une fois par visite). */}
     <IntroVideo />
     <SiteHeader />
      {/* id="contenu" : permet aux lecteurs d'écran de sauter directement au contenu. */}
      <main id="contenu">
                <Hero />
        <Disciplines />
        {/* Séparateurs : motifs royaux d'Abomey qui se dessinent à l'arrivée */}
        <Separateur nom="requin" />
        <FeaturedArtists />
        <LatestArtworks />
        <Separateur nom="cameleon" />
        <HowToBuy />
        <AgendaOpportunities />
        <Separateur nom="poisson" />
        <Resources />
                {/* Grand bandeau défilant juste avant l'appel aux artistes */}
        <BandeauDisciplines />
        <ArtistCta />
      </main>
      <SiteFooter />
            {/* Anime les éléments marqués data-reveal="…" quand on défile. */}
      <ScrollReveal />
    </>
  );
}