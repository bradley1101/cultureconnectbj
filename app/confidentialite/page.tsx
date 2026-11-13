// Page publique de la politique de confidentialité, adresse : /confidentialite
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return <LegalPage titre="Politique de confidentialité" champ="privacy_policy" />;
}