import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartesReactives } from "@/components/motion/cartes-reactives";
import { Curseur } from "@/components/motion/curseur";
import { OG_BASE } from "@/lib/constants";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  // Adresse du site : sert à écrire l'adresse complète des aperçus de partage.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "CultureConnectBJ — La plateforme des artistes du Bénin",
    template: "%s · CultureConnectBJ",
  },
  description:
    "Découvrez, soutenez et achetez la création béninoise : artistes, œuvres, agenda culturel et opportunités.",
    openGraph: OG_BASE, // nom du site et langue sur les aperçus de partage

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
    // suppressHydrationWarning : le petit script ci-dessous peut ajouter un attribut à <html>.
    <html lang="fr" className={`${bricolage.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="bg-creme text-ebene font-sans antialiased">
        {/* Exécuté avant l'affichage : si l'intro a déjà été vue pendant cette visite,
            on la masque tout de suite (évite un flash de l'écran d'intro). */}
        <Script id="intro-deja-vue" strategy="beforeInteractive">
          {`try{if(sessionStorage.getItem("ccbj-intro-vue"))document.documentElement.setAttribute("data-intro-vue","")}catch(e){}`}
        </Script>
        {children}
        {/* Cartes qui s'inclinent vers la souris (toutes les pages). */}
        <CartesReactives />
                {/* Curseur personnalisé (souris uniquement) */}
        <Curseur />
      </body>
    </html>
  );
}