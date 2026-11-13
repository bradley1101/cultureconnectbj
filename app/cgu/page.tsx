// Page publique des CGU, adresse : /cgu
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Conditions générales d'utilisation" };

export default function Page() {
  return <LegalPage titre="Conditions générales d'utilisation" champ="terms_of_use" />;
}