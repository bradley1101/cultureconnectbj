// ─────────────────────────────────────────────────────────────
// Dessins des aperçus de partage (1200 × 630).
// Attention : ce n'est pas du HTML de page web. Le moteur d'image
// ne comprend qu'une partie du CSS : on écrit les styles en « style={{…}} »
// (pas de classes Tailwind) et chaque bloc à plusieurs enfants doit être en display: flex.
// ─────────────────────────────────────────────────────────────
import { C, FriseOg, MarqueOg, SansPhoto } from "@/lib/og";

// ── Œuvre : photo à gauche, titre / artiste / prix à droite ──
export function ApercuOeuvre({ titre, artiste, categorie, prix, photo }: {
  titre: string; artiste: string; categorie: string; prix: string; photo: string | null;
}) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: C.ebene, fontFamily: "DM Sans" }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} width={560} height={630} alt="" style={{ objectFit: "cover" }} />
      ) : (
        <SansPhoto largeur={560} hauteur={630} />
      )}

      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "56px 60px 72px" }}>
        <MarqueOg />
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.or }}>
            {categorie}
          </div>
          {/* Titre : plus petit s'il est long, 3 lignes maximum */}
          <div
            style={{
              fontFamily: "Bricolage", fontSize: titre.length > 50 ? 46 : titre.length > 28 ? 54 : 64, lineHeight: 1.02,
              letterSpacing: -1.5, color: C.sable, marginTop: 14, lineClamp: 3,
            }}
          >
            {titre}
          </div>
          <div style={{ fontSize: 28, color: C.sableClair, marginTop: 18 }}>{`par ${artiste}`}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 34 }}>
            <div
              style={{
                display: "flex", fontFamily: "Bricolage", fontSize: 40, color: C.ebene,
                background: C.ocre, borderRadius: 999, padding: "10px 28px",
                whiteSpace: "nowrap", flexShrink: 0, // le prix tient toujours sur une ligne
              }}
            >
              {prix}
            </div>
            <div style={{ fontSize: 22, color: C.sableClair }}>Commande sur WhatsApp</div>
          </div>
        </div>
      </div>
      <FriseOg />
    </div>
  );
}

// ── Artiste : photo ronde, nom, disciplines, ville ──
export function ApercuArtiste({ nom, disciplines, ville, photo, nbOeuvres }: {
  nom: string; disciplines: string; ville: string | null; photo: string | null; nbOeuvres: number;
}) {
  return (
    <div
      style={{
        display: "flex", width: "100%", height: "100%", background: C.ebene,
        fontFamily: "DM Sans", alignItems: "center", padding: "0 80px 16px", gap: 64,
      }}
    >
      {/* Photo dans un double cercle ocre / or */}
      <div style={{ display: "flex", padding: 10, borderRadius: 999, background: `linear-gradient(135deg, ${C.ocre}, ${C.or})` }}>
        <div style={{ display: "flex", borderRadius: 999, overflow: "hidden", border: `8px solid ${C.ebene}` }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} width={340} height={340} alt="" style={{ objectFit: "cover" }} />
          ) : (
            // Pas de photo : la première lettre du nom
            <div
              style={{
                display: "flex", width: 340, height: 340, alignItems: "center", justifyContent: "center",
                background: C.terre, color: C.sable, fontFamily: "Bricolage", fontSize: 140,
              }}
            >
              {nom.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <MarqueOg taille={28} />
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.or, marginTop: 44 }}>
          {disciplines}
        </div>
        <div
          style={{
            fontFamily: "Bricolage", fontSize: nom.length > 22 ? 62 : 78, lineHeight: 1,
            letterSpacing: -2, color: C.sable, marginTop: 14, lineClamp: 2,
          }}
        >
          {nom}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 26, fontSize: 26, color: C.sableClair }}>
          {ville && <span>{`${ville}, Bénin`}</span>}
          {ville && nbOeuvres > 0 && <span style={{ color: C.ocre }}>·</span>}
          {nbOeuvres > 0 && <span>{`${nbOeuvres} œuvre${nbOeuvres > 1 ? "s" : ""} en vente`}</span>}
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12, alignSelf: "flex-start", marginTop: 40, fontSize: 24, fontWeight: 700,
            color: C.ebene, background: C.or, borderRadius: 999, padding: "12px 28px",
          }}
        >
          Découvrir son univers
          {/* Flèche dessinée (la police n'a pas le caractère « → ») */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.ebene} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
      </div>
      <FriseOg />
    </div>
  );
}

// ── Site (accueil et toutes les autres pages) : la photo du bandeau + voile brun ──
export function ApercuSite({ photo }: { photo: string | null }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: C.ebene, fontFamily: "DM Sans" }}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} width={1200} height={630} alt="" style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }} />
      )}
      {/* Voile brun, plus foncé à gauche pour lire le texte (comme sur l'accueil) */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex",
          background: "linear-gradient(90deg, rgba(43,26,16,0.92) 0%, rgba(43,26,16,0.72) 50%, rgba(43,26,16,0.35) 100%)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px 16px", width: 820 }}>
        <MarqueOg taille={34} />
        <div style={{ fontFamily: "Bricolage", fontSize: 76, lineHeight: 1, letterSpacing: -2, color: C.sable, marginTop: 40 }}>
          La création béninoise à votre portée
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.4, color: C.sableClair, marginTop: 26 }}>
          Artistes, œuvres à acheter, agenda culturel et opportunités.
        </div>
      </div>
      <FriseOg />
    </div>
  );
}