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
 *   Krev `naar` (fri tekst). Kan ha `sesong`.
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

  /** Kven aktiviteten er for. Tom eller manglar = open for alle. */
  malgruppe?: Malgruppe[];
  /** Fri tekst, t.d. "Gratis", "150 kr, barn gratis". */
  pris?: string;
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
  'kultur' | 'idrett' | 'friluft' | 'kurs' | 'sosialt' | 'marknad' | 'frivillig' | 'samfunn';

export interface AktivitetKategori {
  id: AktivitetKategoriId;
  namn: string;
  ikon: string;
}

export const AKTIVITET_KATEGORIAR: readonly AktivitetKategori[] = [
  { id: 'kultur', namn: 'Kultur og konsert', ikon: '🎭' },
  { id: 'idrett', namn: 'Idrett og trening', ikon: '⚽' },
  { id: 'friluft', namn: 'Tur og friluftsliv', ikon: '🥾' },
  { id: 'kurs', namn: 'Kurs og foredrag', ikon: '📚' },
  { id: 'sosialt', namn: 'Sosialt og treff', ikon: '☕' },
  { id: 'marknad', namn: 'Marknad og sal', ikon: '🧺' },
  { id: 'frivillig', namn: 'Dugnad og frivillig', ikon: '🤝' },
  { id: 'samfunn', namn: 'Møte og samfunn', ikon: '🏛️' },
];

export function finnAktivitetKategori(id: AktivitetKategoriId): AktivitetKategori {
  return AKTIVITET_KATEGORIAR.find((k) => k.id === id) ?? AKTIVITET_KATEGORIAR[0];
}

export type Malgruppe = 'barn' | 'ungdom' | 'vaksne' | 'seniorar';

export const MALGRUPPER: readonly { id: Malgruppe; namn: string }[] = [
  { id: 'barn', namn: 'Barn' },
  { id: 'ungdom', namn: 'Ungdom' },
  { id: 'vaksne', namn: 'Vaksne' },
  { id: 'seniorar', namn: 'Seniorar' },
];

export function malgruppeTekst(malgruppe: readonly Malgruppe[] | undefined): string {
  if (!malgruppe?.length) return 'Open for alle';
  const namn = MALGRUPPER.filter((m) => malgruppe.includes(m.id)).map((m) => m.namn.toLowerCase());
  const tekst = namn.length > 1 ? `${namn.slice(0, -1).join(', ')} og ${namn.at(-1)}` : namn[0];
  return 'For ' + tekst;
}
