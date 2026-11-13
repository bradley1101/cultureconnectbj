// Page publique des conditions de vente, adresse : /conditions-de-vente
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Conditions de vente" };

export default function Page() {
  return <LegalPage titre="Conditions de vente" champ="terms_of_sale" />;
}