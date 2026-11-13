// ─────────────────────────────────────────────────────────────
// Section « Acheter une œuvre, en 3 étapes » de la page d'accueil.
// Explique simplement le circuit de commande WhatsApp + Mobile Money.
// Contenu fixe : aucune donnée lue dans la base.
// ─────────────────────────────────────────────────────────────

// Les 3 étapes, rangées dans un tableau. Pour modifier un texte,
// il suffit de changer la ligne correspondante ici.
const etapes = [
  {
    numero: "01",
    titre: "Choisissez une œuvre",
        // \u00a0 = espace insécable : empêche le guillemet de se retrouver seul en bout de ligne.
    texte: "Parcourez la marketplace et cliquez sur «\u00a0Commander sur WhatsApp\u00a0».",
  },
  {
    numero: "02",
    titre: "Confirmez et payez",
    texte:
      "Notre équipe confirme la disponibilité puis vous envoie le numéro MTN MoMo ou Moov Money.",
  },
  {
    numero: "03",
    titre: "Recevez votre œuvre",
    texte:
      "Livraison ou remise en main propre, fichier envoyé pour les œuvres numériques. L'artiste est payé.",
  },
];

// Composant simple (pas « async ») : il n'attend aucune donnée.
export function HowToBuy() {
  return (
    // Conteneur centré, largeur max 1280 px, grandes marges verticales (72 px).
    <section className="mx-auto max-w-7xl px-6 py-[72px]">
      <h2 data-reveal="titre" className="mb-8 font-display text-[40px] font-extrabold tracking-[-0.02em]">
        Acheter une œuvre, en 3 étapes
      </h2>

      {/* <ol> : liste numérotée, car l'ordre des étapes compte.
          La grille place les cartes côte à côte ; chaque carte fait au moins
          260 px de large, sinon elles passent automatiquement à la ligne
          (une seule colonne sur téléphone). */}
      <ol data-reveal="vague" className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {/* On répète une carte pour chaque étape du tableau. */}
        {etapes.map((etape) => (
          <li
            key={etape.numero}
            data-tremble className="lumineux flex flex-col gap-3 rounded-[20px] border border-ligne p-7"
          >
            {/* Grand numéro ocre. aria-hidden : les lecteurs d'écran annoncent
                déjà la position grâce à la liste numérotée <ol>. */}
            <span
              aria-hidden="true"
              className="font-display text-[44px] font-extrabold leading-none text-ocre"
            >
              {etape.numero}
            </span>
            <h3 className="text-xl font-bold">{etape.titre}</h3>
            <p className="leading-[1.55] text-taupe">{etape.texte}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}