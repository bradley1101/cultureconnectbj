# CultureConnectBJ

**La plateforme numérique des artistes béninois.** Un annuaire, une marketplace, un agenda culturel et des ressources pratiques, gratuits pour les artistes du Bénin.

Site en ligne : [cultureconnectbj.vercel.app](https://cultureconnectbj.vercel.app)

## Pourquoi ce projet

Les artistes béninois (musiciens, peintres, sculpteurs, danseurs, auteurs, photographes, artisans) disposent de peu d'outils numériques adaptés à leur réalité : visibilité en ligne, vente d'œuvres, paiement local, accès aux financements et à la gestion des droits d'auteur. CultureConnectBJ cherche à combler ce manque avec une plateforme simple, en français, pensée pour le Bénin.

## Fonctionnalités

- **Annuaire d'artistes** : profils professionnels, recherche par discipline et par ville.
- **Marketplace** : œuvres physiques et numériques, commande via WhatsApp, paiement par Mobile Money (MTN MoMo, Moov Money).
- **Agenda culturel** : événements à venir.
- **Opportunités** : résidences, bourses et appels à projets.
- **Ressources** : guides pratiques (financements, publication en streaming, inscription au BUBEDRA pour les droits d'auteur).
- **Espace artiste** et **back-office d'administration** pour valider les profils.

## Stack technique

- [Next.js](https://nextjs.org) (App Router) et React, en TypeScript
- [Tailwind CSS](https://tailwindcss.com) et [GSAP](https://gsap.com) pour l'interface et les animations
- [Supabase](https://supabase.com) pour l'authentification, la base de données (PostgreSQL) et le stockage
- Déploiement sur [Vercel](https://vercel.com)

## Démarrage en local

Prérequis : Node.js 20 ou plus récent, et un projet Supabase.

```bash
git clone https://github.com/bradley1101/cultureconnectbj.git
cd cultureconnectbj
npm install
```

Crée un fichier `.env.local` à la racine :

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=<url de ton projet Supabase>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<clé publique (publishable) de ton projet Supabase>
```

Applique ensuite les migrations du dossier `supabase/migrations` sur ton projet Supabase, puis lance le serveur :

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Ne commite jamais de clé secrète (`service_role`) : seules les clés publiques ci-dessus sont nécessaires côté client.

## Structure du projet

```
app/          Pages et routes (artistes, marketplace, agenda, opportunités, ressources, admin…)
components/   Composants d'interface réutilisables
lib/          Utilitaires et clients Supabase
supabase/     Migrations de la base de données
public/       Fichiers statiques
```

## Contribuer

Les contributions sont les bienvenues : corrections de bugs, traductions (langues locales du Bénin), accessibilité, performance, documentation.

1. Ouvre une *issue* pour proposer un changement ou signaler un problème.
2. Crée une branche à partir de `main`, puis ouvre une *pull request*.
3. Vérifie que `npm run lint` passe avant de proposer ton code.

## Licence

Distribué sous licence [MIT](LICENSE).
