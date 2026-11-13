// Page publique des mentions légales, adresse : /mentions-legales
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Mentions légales" };

export default function Page() {
  return <LegalPage titre="Mentions légales" champ="legal_mentions" />;
}