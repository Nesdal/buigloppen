/**
 * Lokalmat: kva slag mat ei bedrift lagar eller sel, og korleis ein får kjøpt han.
 *
 * Felta ligg på {@link Bedrift} (`lokalmat`, `sal`, `kjopTekst`, `sesong`), slik at
 * ein gard med hytter eller eit bakeri med kafé kan stå i sin vanlege kategori og
 * likevel kome med på lokalmatsida (`/lokalmat`).
 */

export type Matslag =
  | 'kjot'
  | 'meieri'
  | 'egg'
  | 'frukt-og-bar'
  | 'gront'
  | 'honning'
  | 'fisk'
  | 'drikke'
  | 'bakst'
  | 'anna';

export interface MatslagInfo {
  id: Matslag;
  namn: string;
  ikon: string;
}

export const MATSLAG: readonly MatslagInfo[] = [
  { id: 'kjot', namn: 'Kjøt', ikon: '🥩' },
  { id: 'meieri', namn: 'Ost og meieri', ikon: '🧀' },
  { id: 'egg', namn: 'Egg', ikon: '🥚' },
  { id: 'frukt-og-bar', namn: 'Frukt og bær', ikon: '🍎' },
  { id: 'gront', namn: 'Grønsaker og poteter', ikon: '🥕' },
  { id: 'honning', namn: 'Honning', ikon: '🍯' },
  { id: 'fisk', namn: 'Fisk og sjømat', ikon: '🐟' },
  { id: 'drikke', namn: 'Saft, most og drikke', ikon: '🧃' },
  { id: 'bakst', namn: 'Bakst og flatbrød', ikon: '🥖' },
  { id: 'anna', namn: 'Anna', ikon: '🧺' },
];

export type Salskanal = 'gardsutsal' | 'sjolvbetent' | 'butikk' | 'reko' | 'bestilling' | 'marknad';

export interface SalskanalInfo {
  id: Salskanal;
  namn: string;
  /** Kort forklaring til filteret og bedriftssida. */
  forklaring: string;
}

export const SALSKANALAR: readonly SalskanalInfo[] = [
  { id: 'gardsutsal', namn: 'Gardsutsal', forklaring: 'Kjøp på garden' },
  {
    id: 'sjolvbetent',
    namn: 'Sjølvbetent',
    forklaring: 'Utsal utan betjening, ofte ope heile dagen',
  },
  { id: 'butikk', namn: 'I butikk', forklaring: 'Vert selt i butikkar' },
  { id: 'reko', namn: 'REKO-ring', forklaring: 'Bestill og hent på REKO-ringen' },
  { id: 'bestilling', namn: 'Bestilling', forklaring: 'Bestill og hent eller få levert' },
  { id: 'marknad', namn: 'Marknad', forklaring: 'Står på marknader' },
];

/**
 * Filteret «Kjøp på garden» skal òg finne sjølvbetente utsal.
 * Dei andre kanalane må treffe nøyaktig.
 */
export function harSalskanal(sal: readonly Salskanal[] | undefined, kanal: Salskanal): boolean {
  if (!sal) return false;
  if (kanal === 'gardsutsal') return sal.includes('gardsutsal') || sal.includes('sjolvbetent');
  return sal.includes(kanal);
}

export function finnMatslag(id: Matslag): MatslagInfo {
  return MATSLAG.find((m) => m.id === id) ?? MATSLAG[MATSLAG.length - 1];
}

export function finnSalskanal(id: Salskanal): SalskanalInfo {
  return SALSKANALAR.find((s) => s.id === id) ?? SALSKANALAR[0];
}
