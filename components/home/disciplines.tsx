import Link from "next/link";

const disciplines = [
  "Musique",
  "Arts visuels",
  "Sculpture",
  "Danse",
  "Théâtre",
  "Littérature",
  "Photographie",
  "Artisanat d'art",
];

export function Disciplines() {
  return (
    <section aria-label="Disciplines" className="mx-auto max-w-7xl px-6 pt-10 pb-2">
      <ul data-reveal="vague" className="flex flex-wrap gap-2.5">
        {disciplines.map((d) => (
          <li key={d}>
            <Link
              href={`/artistes?discipline=${encodeURIComponent(d)}`}
              className="inline-flex min-h-11 items-center rounded-full border border-ligne bg-sable px-5 font-medium transition-colors hover:border-ocre"
            >
              {d}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}