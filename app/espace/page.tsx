// ─────────────────────────────────────────────────────────────
// Tableau de bord de l'artiste, adresse : /espace
// Bandeau d'état + 4 chiffres clés + tableau des demandes de commande.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { Compteur } from "@/components/motion/compteur";
import { formatFcfa } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Tableau de bord" };

// Statut d'une commande dans la base → texte et couleurs de la pastille.
const STATUTS = {
  new: { texte: "Nouvelle", style: "bg-sable text-ebene" },
  confirmed: { texte: "Confirmée", style: "bg-[#FBE7C6] text-[#6B3E00]" },
  paid: { texte: "Payée", style: "bg-[#DCE4F0] text-indigo" },
  delivered: { texte: "Livrée", style: "bg-[#E3EEDC] text-[#2E5A1C]" },
  artist_paid: { texte: "Artiste payé", style: "bg-ebene text-or" },
  cancelled: { texte: "Annulée", style: "bg-[#F3E1DC] text-terre" },
} as const;

export default async function TableauDeBord() {
  const { supabase, user, profil, artiste } = await getSession();

  // Premier jour du mois en cours à minuit (pour compter les demandes du mois).
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  // Lecture des œuvres et des commandes de l'artiste.
  // La sécurité de la base (RLS) garantit qu'il ne voit QUE les siennes.
  const [oeuvres, commandes] = await Promise.all([
    supabase.from("artworks").select("status").eq("artist_id", user.id),
    supabase
      .from("orders")
      .select("id, reference, price_fcfa, artist_net_fcfa, status, created_at, artwork:artworks(title)")
      .eq("artist_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const listeOeuvres = oeuvres.data ?? [];
  const listeCommandes = commandes.data ?? [];

  // Les 4 chiffres clés.
  const chiffres = [
    { label: "Œuvres en ligne", valeur: listeOeuvres.filter((o) => o.status === "approved").length },
    { label: "En attente de validation", valeur: listeOeuvres.filter((o) => o.status === "pending").length },
    { label: "Demandes ce mois", valeur: listeCommandes.filter((c) => new Date(c.created_at) >= debutMois).length },
    {
      // Somme des montants nets des commandes payées ou livrées mais pas encore reversées.
      // reduce() additionne les montants un par un, en partant de 0.
      label: "Montant à recevoir",
      valeur: formatFcfa(
        listeCommandes
          .filter((c) => c.status === "paid" || c.status === "delivered")
          .reduce((total, c) => total + c.artist_net_fcfa, 0),
      ),
    },
  ];

  // Prénom = premier mot du nom complet.
  const prenom = (profil.full_name ?? "").split(" ")[0];

  return (
    <div className="flex flex-col gap-7">
      {/* ── En-tête : salutation + bouton « Publier une œuvre » ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[36px] font-extrabold leading-none">Bonjour {prenom}</h1>
          <p className="text-taupe">Voici l&apos;activité de votre profil.</p>
        </div>
        {/* On ne peut publier une œuvre qu'une fois la fiche artiste créée. */}
        {artiste && (
          <Link href="/espace/oeuvres/nouvelle" className="inline-flex min-h-12 items-center rounded-full bg-ebene px-[22px] font-bold text-creme hover:bg-terre">
            + Publier une œuvre
          </Link>
        )}
      </div>

      {/* ── Bandeau d'état : 3 cas possibles ── */}
      {!artiste ? (
        // Cas 1 : la fiche artiste n'existe pas encore.
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ocre px-6 py-5 text-ebene">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold">Première étape : créez votre profil d&apos;artiste</span>
            <span>Nom de scène, disciplines, ville, biographie et photo. Il sera visible après validation.</span>
          </div>
          <Link href="/espace/profil" className="inline-flex min-h-11 items-center rounded-full bg-ebene px-5 font-bold text-creme hover:bg-terre">
            Créer mon profil
          </Link>
        </div>
      ) : profil.status === "approved" ? (
        // Cas 2 : profil validé par l'admin (bandeau indigo comme la maquette).
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-indigo px-5 py-4 text-sable">
          <span>
            Votre profil est validé.{artiste.is_verified ? " Badge « Artiste vérifié » actif." : ""}
          </span>
          {!artiste.bio && (
            <Link href="/espace/profil" className="font-bold text-or hover:underline">Compléter ma bio</Link>
          )}
        </div>
      ) : (
        // Cas 3 : fiche créée, en attente de validation.
        <div className="rounded-2xl border-2 border-dashed border-ocre px-5 py-4">
          <strong>Profil en attente de validation.</strong> Notre équipe vérifie votre profil sous 48 h. En attendant,
          vous pouvez préparer votre portfolio et vos œuvres.
        </div>
      )}

      {/* ── 4 chiffres clés ── */}
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {chiffres.map((c) => (
          <li key={c.label} className="flex flex-col gap-1.5 rounded-[18px] bg-creme p-5">
            <span className="text-sm text-taupe">{c.label}</span>
            <span className="font-display text-[30px] font-extrabold leading-tight"><Compteur valeur={c.valeur} /></span>
          </li>
        ))}
      </ul>

      {/* ── Tableau des demandes de commande ── */}
      <section className="flex flex-col gap-4 rounded-[20px] bg-creme p-6">
        <h2 className="text-xl font-bold">Demandes de commande</h2>
        {listeCommandes.length > 0 ? (
          // overflow-x-auto : sur téléphone, le tableau défile horizontalement.
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[15px]">
              <thead>
                <tr className="text-left text-[13px] text-taupe">
                  <th className="px-3 py-2.5 font-bold">Référence</th>
                  <th className="px-3 py-2.5 font-bold">Œuvre</th>
                  <th className="px-3 py-2.5 font-bold">Date</th>
                  <th className="px-3 py-2.5 font-bold">Montant net</th>
                  <th className="px-3 py-2.5 font-bold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {listeCommandes.map((c) => (
                  <tr key={c.id} className="border-t border-[#EFE3D2]">
                    <td className="px-3 py-3.5 font-bold">{c.reference}</td>
                    <td className="px-3 py-3.5">{c.artwork?.title}</td>
                    <td className="px-3 py-3.5 text-taupe">
                      {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                    </td>
                    <td className="px-3 py-3.5">{formatFcfa(c.artist_net_fcfa)}</td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[13px] font-bold ${STATUTS[c.status].style}`}>
                        {STATUTS[c.status].texte}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-taupe">
            Aucune demande pour le moment. Elles apparaîtront ici dès qu&apos;un acheteur cliquera sur « Commander sur WhatsApp ».
          </p>
        )}
        <p className="text-sm text-taupe">
          Le montant net correspond au prix de vente moins la commission de la plateforme. Il vous est reversé après livraison.
        </p>
      </section>
    </div>
  );
}