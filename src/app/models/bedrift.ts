/**
 * Datamodellen for ei bedrift i katalogen.
 *
 * Felta er flate (ingen nøsta objekt) med vilje, slik at lista kan
 * eksporterast til CSV og importerast i andre system, t.d. Wix CMS
 * som visit-gloppen.no brukar. Sjå `npm run eksport:csv`.
 */
export interface Bedrift {
  /** Unik nøkkel som vert brukt i adressa, t.d. "sandane-bakeri". Berre a-z, 0-9 og bindestrek. */
  id: string;
  namn: string;
  kategori: KategoriId;
  /** Bygd/tettstad i Gloppen, t.d. "Sandane". */
  stad: Stad;
  /** Kort tekst (1–2 setningar) som vert vist på korta i oversikta. */
  kortSkildring: string;
  /** Lengre tekst på sida til bedrifta. Valfri. */
  skildring?: string;
  adresse?: string;
  telefon?: string;
  epost?: string;
  /** Full adresse med https://. */
  nettstad?: string;
  /** Fri tekst, t.d. "Måndag–fredag 9–17, laurdag 10–15". */
  opningstider?: string;
  /** Søkjeord som ikkje står i namnet eller skildringa. */
  stikkord?: string[];
  /** true for oppdikta døme som skal bytast ut med ekte bedrifter. */
  eksempel?: boolean;
}

export type KategoriId =
  | 'daglegvare'
  | 'mat-og-servering'
  | 'butikk-og-handel'
  | 'helse-og-velvere'
  | 'bygg-og-handverk'
  | 'bil-og-transport'
  | 'overnatting'
  | 'opplevingar'
  | 'tenester';

export interface Kategori {
  id: KategoriId;
  namn: string;
  ikon: string;
}

export const KATEGORIAR: readonly Kategori[] = [
  { id: 'daglegvare', namn: 'Daglegvare', ikon: '🛒' },
  { id: 'mat-og-servering', namn: 'Kafé og restaurant', ikon: '☕' },
  { id: 'butikk-og-handel', namn: 'Butikkar og handel', ikon: '🛍️' },
  { id: 'helse-og-velvere', namn: 'Helse og velvære', ikon: '💆' },
  { id: 'bygg-og-handverk', namn: 'Bygg og handverk', ikon: '🔨' },
  { id: 'bil-og-transport', namn: 'Bil og transport', ikon: '🚗' },
  { id: 'overnatting', namn: 'Overnatting', ikon: '🛏️' },
  { id: 'opplevingar', namn: 'Opplevingar og fritid', ikon: '⛰️' },
  { id: 'tenester', namn: 'Tenester', ikon: '🧰' },
];

export const STADER = [
  'Sandane',
  'Byrkjelo',
  'Breim',
  'Hyen',
  'Vereide',
  'Hestenesøyri',
  'Anna stad i Gloppen',
] as const;

export type Stad = (typeof STADER)[number];

export function finnKategori(id: KategoriId): Kategori {
  return KATEGORIAR.find((k) => k.id === id) ?? KATEGORIAR[KATEGORIAR.length - 1];
}
