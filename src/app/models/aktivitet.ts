import { Stad } from './bedrift';

/**
 * Datamodellen for ein aktivitet eller eit arrangement for innbyggjarane i Gloppen.
 *
 * Felta er flate med vilje, same som for bedrifter, slik at lista kan eksporterast
 * til CSV (`npm run eksport:csv`).
 *
 * Det finst to slag:
 * - **arrangement** skjer på ein bestemt dato (konsert, marknad, folkemøte …).
 *   Krev `dato`. Kan ha `sluttdato`, `starttid` og `sluttid`.
 * - **fast** går att, t.d. kvar veke (kor, trening, språkkafé …).
 *   Krev `naar` (fri tekst). Kan ha `sesong` og `gren`.
 *
 * Faste aktivitetar vert viste under «Trening og fritid» (`/fritid`), arrangement under
 * «Kva skjer» (`/aktivitetar`). Arrangement i kategorien `idrett` er kampar og stemne og
 * får ein eigen seksjon der.
 */
export interface Aktivitet {
  /** Unik nøkkel som vert brukt i adressa. Berre a-z, 0-9 og bindestrek. */
  id: string;
  tittel: string;
  type: AktivitetType;
  kategori: AktivitetKategoriId;
  /** Bygd/tettstad i Gloppen. */
  stad: Stad;
  /** Kvar det skjer, t.d. "Gloppen kulturhus" eller "Klubbhuset på Byrkjelo". */
  lokale?: string;
  /** Kort tekst (1–2 setningar) som vert vist på korta i oversikta. */
  kortSkildring: string;
  /** Lengre tekst på sida til aktiviteten. Valfri. */
  skildring?: string;

  /** Arrangement: datoen det skjer, ÅÅÅÅ-MM-DD. */
  dato?: string;
  /** Arrangement over fleire dagar: siste dag, ÅÅÅÅ-MM-DD. */
  sluttdato?: string;
  /** Klokkeslett, TT:MM, t.d. "19:00". */
  starttid?: string;
  sluttid?: string;

  /** Fast aktivitet: når han går, t.d. "Kvar tysdag kl. 18–20". */
  naar?: string;
  /** Fast aktivitet: kva del av året, t.d. "September–mai". */
  sesong?: string;
  /**
   * Idretten eller hobbyen, t.d. "Fotball", "Turn" eller "Dart". Vert brukt til å gruppere
   * og filtrere på «Trening og fritid». Skriv det likt for alle lag med same idrett.
   */
  gren?: string;

  /** Kven aktiviteten er for. Tom eller manglar = open for alle. */
  malgruppe?: Malgruppe[];
  /** Kven som står bak, t.d. "Sandane skulekorps". */
  arrangor?: string;
  /** Id til ei bedrift i katalogen dersom arrangøren er der. Gjev lenkje begge vegar. */
  bedriftId?: string;
  /** Full adresse med https:// til påmelding eller billettar. */
  pamelding?: string;
  /** Full adresse med https:// til meir informasjon. */
  nettstad?: string;
  telefon?: string;
  epost?: string;
  /** Søkjeord som ikkje står i tittelen eller skildringa. */
  stikkord?: string[];
  /** Kvar opplysningane er henta frå (URL). */
  kjelde?: string;
  /** Datoen opplysningane sist vart sjekka, ÅÅÅÅ-MM-DD. */
  sjekka?: string;
  /** true for oppdikta døme som skal bytast ut med ekte aktivitetar. */
  eksempel?: boolean;
}

export type AktivitetType = 'arrangement' | 'fast';

export const AKTIVITET_TYPAR: readonly { id: AktivitetType; namn: string; fleirtal: string }[] = [
  { id: 'arrangement', namn: 'Arrangement', fleirtal: 'Arrangement' },
  { id: 'fast', namn: 'Fast aktivitet', fleirtal: 'Faste aktivitetar' },
];

export type AktivitetKategoriId =
  | 'kultur'
  | 'idrett'
  | 'friluft'
  | 'hobby'
  | 'kurs'
  | 'sosialt'
  | 'marknad'
  | 'frivillig'
  | 'samfunn';

export interface AktivitetKategori {
  id: AktivitetKategoriId;
  namn: string;
  ikon: string;
}

export const AKTIVITET_KATEGORIAR: readonly AktivitetKategori[] = [
  { id: 'kultur', namn: 'Kultur og konsert', ikon: '🎭' },
  { id: 'idrett', namn: 'Idrett og trening', ikon: '⚽' },
  { id: 'friluft', namn: 'Tur og friluftsliv', ikon: '🥾' },
  { id: 'hobby', namn: 'Hobby og spel', ikon: '🎲' },
  { id: 'kurs', namn: 'Kurs og foredrag', ikon: '📚' },
  { id: 'sosialt', namn: 'Sosialt og treff', ikon: '☕' },
  { id: 'marknad', namn: 'Marknad og sal', ikon: '🧺' },
  { id: 'frivillig', namn: 'Dugnad og frivillig', ikon: '🤝' },
  { id: 'samfunn', namn: 'Møte og samfunn', ikon: '🏛️' },
];

export function finnAktivitetKategori(id: AktivitetKategoriId): AktivitetKategori {
  return AKTIVITET_KATEGORIAR.find((k) => k.id === id) ?? AKTIVITET_KATEGORIAR[0];
}

/** Kampar, løp og stemne: arrangement i kategorien idrett. */
export function erKamp(a: Aktivitet): boolean {
  return a.type === 'arrangement' && a.kategori === 'idrett';
}

export type Malgruppe = 'barn' | 'ungdom' | 'unge-vaksne' | 'vaksne' | 'seniorar';

/**
 * Målgruppene med aldersspenn (begge ender med). Spenna overlappar med vilje:
 * ein på 30 er både «unge vaksne» og «vaksne», og ein på 70 er både «vaksne» og «seniorar».
 */
export const MALGRUPPER: readonly { id: Malgruppe; namn: string; fra: number; til: number }[] = [
  { id: 'barn', namn: 'Barn', fra: 0, til: 12 },
  { id: 'ungdom', namn: 'Ungdom', fra: 13, til: 19 },
  { id: 'unge-vaksne', namn: 'Unge vaksne', fra: 18, til: 39 },
  { id: 'vaksne', namn: 'Vaksne', fra: 18, til: 130 },
  { id: 'seniorar', namn: 'Seniorar', fra: 65, til: 130 },
];

/** Målgruppene ein person på `alder` år høyrer til. */
export function malgrupperForAlder(alder: number): Malgruppe[] {
  return MALGRUPPER.filter((m) => alder >= m.fra && alder <= m.til).map((m) => m.id);
}

export function malgruppeTekst(malgruppe: readonly Malgruppe[] | undefined): string {
  if (!malgruppe?.length) return 'Open for alle';
  const namn = MALGRUPPER.filter((m) => malgruppe.includes(m.id)).map((m) => m.namn.toLowerCase());
  const tekst = namn.length > 1 ? `${namn.slice(0, -1).join(', ')} og ${namn.at(-1)}` : namn[0];
  return 'For ' + tekst;
}
