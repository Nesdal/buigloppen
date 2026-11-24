/**
 * Kinoprogrammet i Trivselshagen. Dataa ligg i `src/app/data/kino.json` og vert henta frå
 * eBillett med `npm run import:trivselshagen`. Ikkje rediger fila for hand: ho vert skriven
 * heilt på nytt ved kvar import.
 */
export interface Kinoprogram {
  /** Datoen programmet vart henta, ÅÅÅÅ-MM-DD. */
  henta: string;
  /** Sida programmet er henta frå. */
  kjelde: string;
  filmar: Film[];
}

export interface Film {
  /** Laga frå tittelen. Berre a-z, 0-9 og bindestrek. */
  id: string;
  tittel: string;
  /** T.d. "Familiefilm, Eventyr". */
  sjanger?: string;
  /** "A" (for alle) eller alder, t.d. "12". */
  aldersgrense?: string;
  /** Lengd i minutt. */
  lengd?: number;
  /** Omtale frå eBillett. Avsnitt er skilde med tom linje. */
  omtale?: string;
  /** Plakat-bilete frå eBillett. */
  plakat?: string;
  visingar: Vising[];
}

export interface Vising {
  /** ÅÅÅÅ-MM-DD */
  dato: string;
  /** TT:MM */
  tid: string;
  sluttid?: string;
  /** Salen, t.d. "Gloppen Kino" eller "Kultursalen". */
  sal?: string;
  /** T.d. "2D" eller "3D". */
  format?: string;
  /** "Norsk tale" eller "Original tale". */
  tale?: string;
  /** T.d. "Norsk tekst". */
  tekst?: string;
  utselt?: boolean;
  /** Lenkje til billettkjøp på eBillett. */
  billett: string;
}

/** Bedrifta i `bedrifter.json` som kinoprogrammet høyrer til. */
export const KINO_BEDRIFT_ID = 'trivselshagen-kino';

/** Salen dei fleste filmane går i. Andre salar vert nemnde ved framsyninga. */
export const KINOSAL = 'Gloppen Kino';
