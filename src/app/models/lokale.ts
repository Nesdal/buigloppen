import { Stad } from './bedrift';

/**
 * Eit lokale ein kan leige: grendehus, samfunnshus, kulturhus, selskapslokale m.m.
 * Lista ligg i `data/lokale.json` og vert vist på `/lokale`.
 *
 * Felta er flate med vilje, same som for bedrifter, så lista kan eksporterast til CSV.
 */
export interface Lokale {
  /** Unik nøkkel, berre a-z, 0-9 og bindestrek. */
  id: string;
  namn: string;
  slag: LokaleSlag;
  stad: Stad;
  /** Grenda, når ho er meir presis enn `stad`, t.d. "Rygg" for Nordstranda. */
  bygd?: string;
  /** Kort tekst (1–2 setningar) på kortet. */
  kortSkildring: string;
  /**
   * Om lag kor mange som får plass i den største salen, ved bord når det er oppgitt.
   * Vert brukt i filteret «Kor mange gjester?».
   */
  plassar?: number;
  /** Utfyllande om plassen, t.d. "ca. 120 ved bord, 250 på konsert". */
  plassarTekst?: string;
  fasilitetar?: Fasilitet[];
  /** Anna praktisk, eitt punkt per tema, t.d. "Servise: til 100 personar." */
  praktisk?: string[];
  /** Kven som eig og leiger ut lokalet, t.d. "Hyen grendalag". */
  utleigar?: string;
  /** Kven ein skal kontakte, t.d. "Utleigeansvarleg i grendalaget" eller eit namn. */
  kontakt?: string;
  telefon?: string;
  epost?: string;
  /** Full adresse med https://. */
  nettstad?: string;
  /** Lenkje til bookingsystem eller leigeskjema, når det finst. */
  booking?: string;
  adresse?: string;
  /** Peikar til ei bedrift i `bedrifter.json`, t.d. hotell med selskapslokale. */
  bedriftId?: string;
  /** Kvar opplysningane er henta frå (URL). */
  kjelde: string;
  /** Datoen opplysningane sist vart sjekka, ÅÅÅÅ-MM-DD. */
  sjekka: string;
}

export type LokaleSlag =
  | 'grendehus'
  | 'kulturhus'
  | 'selskapslokale'
  | 'leirstad'
  | 'bedehus'
  | 'anna';

export interface LokaleSlagInfo {
  id: LokaleSlag;
  namn: string;
  ikon: string;
}

export const LOKALE_SLAG: readonly LokaleSlagInfo[] = [
  { id: 'grendehus', namn: 'Grendehus og samfunnshus', ikon: '🏠' },
  { id: 'kulturhus', namn: 'Kulturhus og storsal', ikon: '🎭' },
  { id: 'selskapslokale', namn: 'Selskapslokale', ikon: '🥂' },
  { id: 'leirstad', namn: 'Leirstad', ikon: '🏕️' },
  { id: 'bedehus', namn: 'Bedehus og kyrkjelydshus', ikon: '⛪' },
  { id: 'anna', namn: 'Anna lokale', ikon: '🚪' },
];

export type Fasilitet =
  | 'kjokken'
  | 'scene'
  | 'lyd'
  | 'prosjektor'
  | 'servise'
  | 'hc'
  | 'overnatting'
  | 'uteomrade'
  | 'servering';

export interface FasilitetInfo {
  id: Fasilitet;
  namn: string;
}

export const FASILITETAR: readonly FasilitetInfo[] = [
  { id: 'kjokken', namn: 'Kjøkken' },
  { id: 'servise', namn: 'Servise' },
  { id: 'scene', namn: 'Scene' },
  { id: 'lyd', namn: 'Lydanlegg' },
  { id: 'prosjektor', namn: 'Prosjektor/skjerm' },
  { id: 'hc', namn: 'Tilrettelagt for rullestol' },
  { id: 'overnatting', namn: 'Overnatting' },
  { id: 'uteomrade', namn: 'Uteområde' },
  { id: 'servering', namn: 'Mat kan bestillast' },
];

/** Val i filteret «Kor mange gjester?». */
export const GJESTAR = [20, 50, 100, 200] as const;

export function finnLokaleSlag(id: LokaleSlag): LokaleSlagInfo {
  return LOKALE_SLAG.find((s) => s.id === id) ?? LOKALE_SLAG[LOKALE_SLAG.length - 1];
}

export function finnFasilitet(id: Fasilitet): FasilitetInfo {
  return FASILITETAR.find((f) => f.id === id) ?? { id, namn: id };
}
