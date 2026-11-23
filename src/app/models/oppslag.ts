/**
 * Eit oppslag er noko ei bedrift vil at folk i Gloppen skal få med seg:
 * ny meny, ein spesialitet denne veka, eit tilbod, nyopning …
 *
 * Oppslaget vert vist på framsida, på sida til bedrifta og som eit merke på
 * bedriftskortet, frå `fra` og til og med `til`. Utan `til` varer det i
 * {@link STANDARD_VARIGHEIT_DAGAR} dagar, så gamle nyheiter forsvinn av seg sjølv.
 *
 * Felta er flate med vilje, same som for bedrifter og aktivitetar, slik at lista
 * kan eksporterast til CSV (`npm run eksport:csv`).
 */
export interface Oppslag {
  /** Unik nøkkel. Berre a-z, 0-9 og bindestrek. */
  id: string;
  /** Id til bedrifta i `bedrifter.json` som står bak oppslaget. */
  bedriftId: string;
  type: OppslagType;
  /** Kort overskrift, t.d. "Ny vintermeny". */
  tittel: string;
  /** 1–3 setningar om kva som er nytt. */
  tekst: string;
  /** Første dag oppslaget vert vist, ÅÅÅÅ-MM-DD. */
  fra: string;
  /** Siste dag oppslaget vert vist, ÅÅÅÅ-MM-DD. Valfri. */
  til?: string;
  /** Full adresse med https:// til meny, bestilling e.l. Valfri. */
  lenkje?: string;
  /** Kvar opplysningane er henta frå (URL), t.d. bedrifta si Facebook-side. */
  kjelde?: string;
  /** true for oppdikta døme som skal bytast ut med ekte oppslag. */
  eksempel?: boolean;
}

export type OppslagType = 'ny-meny' | 'spesial' | 'tilbod' | 'nyopna' | 'nyheit';

export interface OppslagTypeInfo {
  id: OppslagType;
  namn: string;
  ikon: string;
}

export const OPPSLAG_TYPAR: readonly OppslagTypeInfo[] = [
  { id: 'ny-meny', namn: 'Ny meny', ikon: '🍽️' },
  { id: 'spesial', namn: 'Spesialitet', ikon: '⭐' },
  { id: 'tilbod', namn: 'Tilbod', ikon: '🏷️' },
  { id: 'nyopna', namn: 'Nyopna', ikon: '🎉' },
  { id: 'nyheit', namn: 'Nytt', ikon: '✨' },
];

export function finnOppslagType(id: OppslagType): OppslagTypeInfo {
  return OPPSLAG_TYPAR.find((t) => t.id === id) ?? OPPSLAG_TYPAR[OPPSLAG_TYPAR.length - 1];
}

/** Kor lenge eit oppslag utan `til` vert vist. */
export const STANDARD_VARIGHEIT_DAGAR = 30;

/** Oppslag som er lagde ut dei siste så mange dagane, får eit ekstra «Nytt!»-merke. */
export const FERSK_DAGAR = 7;
