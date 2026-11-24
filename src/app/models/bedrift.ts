import { Matslag, Salskanal } from './lokalmat';

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
  /**
   * "butikk" sel varer over disk, "servering" er kafear, restaurantar og bakeri med
   * servering, "bedrift" er alt anna (tenester, overnatting, handverk …).
   */
  type: BedriftType;
  kategori: KategoriId;
  /**
   * Andre kategoriar bedrifta òg skal dukke opp under, t.d. eit hotell med
   * restaurant: kategori "overnatting" og ekstraKategoriar ["mat-og-servering"].
   */
  ekstraKategoriar?: KategoriId[];
  /** Bygd/tettstad i Gloppen, t.d. "Sandane". */
  stad: Stad;
  /** Kort tekst (1–2 setningar) som vert vist på korta i oversikta. */
  kortSkildring: string;
  /** Lengre tekst på sida til bedrifta. Valfri. */
  skildring?: string;
  /** Kva bedrifta sel eller tilbyr, korte punkt, t.d. ["Daglegvarer", "Post i butikk"]. */
  tilbyr: string[];
  /**
   * Praktisk informasjon for den som skal dit, eitt punkt per tema på forma
   * "Overskrift: tekst", t.d. "Parkering: Bak bygget, ved inngangen." Unngå semikolon,
   * sidan CSV-eksporten skil punkta med det.
   */
  praktisk?: string[];
  adresse?: string;
  telefon?: string;
  epost?: string;
  /** Full adresse med https://. */
  nettstad?: string;
  /** Fri tekst, t.d. "Måndag–fredag 9–17, laurdag 10–15". */
  opningstider?: string;
  /** Søkjeord som ikkje står i namnet eller skildringa. */
  stikkord?: string[];
  /**
   * Lokalmat bedrifta lagar eller sel, t.d. ["kjot", "egg"]. Bedrifter med dette feltet
   * kjem med på lokalmatsida. Sjå `models/lokalmat.ts`.
   */
  lokalmat?: Matslag[];
  /** Korleis ein får kjøpt lokalmaten, t.d. ["sjolvbetent", "reko"]. */
  sal?: Salskanal[];
  /** Fri tekst om kvar og korleis ein kjøper, t.d. "Også i hylla hos Bakar Jon." */
  kjopTekst?: string;
  /** Når maten er å få, t.d. "Eple frå september til november". */
  sesong?: string;
  /** Kvar opplysningane er henta frå (URL). */
  kjelde?: string;
  /** Datoen opplysningane sist vart sjekka, ÅÅÅÅ-MM-DD. */
  sjekka?: string;
  /** true for oppdikta døme som skal bytast ut med ekte bedrifter. */
  eksempel?: boolean;
}

export type BedriftType = 'butikk' | 'servering' | 'bedrift';

export const TYPAR: readonly { id: BedriftType; namn: string; fleirtal: string }[] = [
  { id: 'butikk', namn: 'Butikk', fleirtal: 'Butikkar' },
  { id: 'servering', namn: 'Kafé/restaurant', fleirtal: 'Kafear og restaurantar' },
  { id: 'bedrift', namn: 'Bedrift', fleirtal: 'Bedrifter og tenester' },
];

export function typeNamn(type: BedriftType): string {
  return TYPAR.find((t) => t.id === type)?.namn ?? type;
}

export type KategoriId =
  | 'daglegvare'
  | 'mat-og-servering'
  | 'lokalmat'
  | 'butikk-og-handel'
  | 'helse-og-velvere'
  | 'bygg-og-handverk'
  | 'industri'
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
  { id: 'lokalmat', namn: 'Lokalmat og gardsutsal', ikon: '🧺' },
  { id: 'butikk-og-handel', namn: 'Butikkar og handel', ikon: '🛍️' },
  { id: 'helse-og-velvere', namn: 'Helse og velvære', ikon: '💆' },
  { id: 'bygg-og-handverk', namn: 'Bygg og handverk', ikon: '🔨' },
  { id: 'industri', namn: 'Industri og produksjon', ikon: '🏭' },
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
  'Kandal',
  'Nordstranda',
  'Sørstranda',
  'Anna stad i Gloppen',
] as const;

export type Stad = (typeof STADER)[number];

/** Delar eit praktisk punkt "Parkering: Bak bygget, ved inngangen." i overskrift og tekst. */
export function delPraktisk(punkt: string): { overskrift: string; tekst: string } {
  const i = punkt.indexOf(': ');
  if (i < 0) return { overskrift: '', tekst: punkt };
  return { overskrift: punkt.slice(0, i), tekst: punkt.slice(i + 2) };
}

/** true om bedrifta høyrer til kategorien, anten som hovudkategori eller ekstrakategori. */
export function harKategori(b: Pick<Bedrift, 'kategori' | 'ekstraKategoriar'>, id: KategoriId): boolean {
  return b.kategori === id || (b.ekstraKategoriar ?? []).includes(id);
}

export function finnKategori(id: KategoriId): Kategori {
  return KATEGORIAR.find((k) => k.id === id) ?? KATEGORIAR[KATEGORIAR.length - 1];
}
