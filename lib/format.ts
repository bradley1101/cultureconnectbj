import type { Enums } from "@/lib/supabase/database.types";

const fcfa = new Intl.NumberFormat("fr-FR");

export function formatFcfa(amount: number) {
  return `${fcfa.format(amount)} FCFA`;
}

export function formatDay(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("fr-FR", { day: "2-digit", timeZone: "Africa/Porto-Novo" }),
    month: d.toLocaleDateString("fr-FR", { month: "short", timeZone: "Africa/Porto-Novo" }),
    time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Porto-Novo" }),
  };
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Porto-Novo",
  });
}

export const opportunityLabels: Record<Enums<"opportunity_type">, string> = {
  residence: "Résidence",
  call_for_projects: "Appel à projets",
  contest: "Concours",
  grant: "Bourse",
  training: "Formation",
  other: "Autre",
};
