/**
 * Datamodellen for dei statiske karta (sjå `components/kart.ts` og `data/kart-*.ts`).
 *
 * Alle koordinatar er i viewBox-einingar: x frå 0 til `breidd`, y frå 0 til `hogd`, nord opp.
 * Stiane er vanlege SVG `d`-strengar.
 */

export type KartNamnType =
  /** Hovudstaden på kartet: stor tekst (med prikk om `prikk` er sett). */
  | 'sentrum'
  /** Bygdelag eller grend, utan prikk. */
  | 'omrade'
  /** Bustadfelt: mindre tekst, skjult på små skjermar. */
  | 'felt'
  /** Tettstad eller bygd med prikk. */
  | 'tettstad'
  /** Større bygd/område utan prikk, med sperra store bokstavar. */
  | 'bygd'
  /** Fjord, vik eller innsjø. */
  | 'vatn'
  /** Dal eller fjell: dempa kursiv. */
  | 'terreng'
  /** Nabokommune utanfor grensa, dempa tekst. */
  | 'nabo';

export interface KartNamn {
  namn: string;
  x: number;
  y: number;
  type: KartNamnType;
  /** Teikn ein prikk på (x, y) og set teksten ved sida av. */
  prikk?: boolean;
  /** Kvar teksten står i høve til prikken. Standard er `middle` (sentrert). */
  anker?: 'start' | 'middle' | 'end';
  /** Rotasjon i grader med klokka, t.d. for å leggje namnet langs ein fjord. */
  rot?: number;
}

export interface Kart {
  /** Brukt i CSS-klassen `kart-<id>` og for unike id-ar i SVG-en. */
  id: string;
  /** Kort skildring for skjermlesarar. */
  tittel: string;
  breidd: number;
  hogd: number;
  /** Kor mange viewBox-einingar som er 1 km. */
  km: number;
  malestokk: { meter: number; tekst: string };
  sjo: string;
  innsjoar?: string;
  holmar?: string;
  elvar?: string;
  /** Mindre vegar (fylkesvegar), tynne kvite linjer. */
  smavegar?: string;
  vegar?: string;
  /** Europaveg, oransje. */
  hovudvegar?: string;
  /** Høgdekurver, tynne og tjukke (kvar 100. meter). */
  koter?: string;
  koterHundre?: string;
  /** Gråtone/alfa-PNG som vert lagt oppå landet som skuggerelieff. */
  relieff?: string;
  /** Gråtone-JPEG brukt som maske for skugge (kvitt = mest skugge). */
  skugge?: string;
  /** Kommunegrensa. Området utanfor vert dempa. */
  grense?: string;
  skilt?: readonly { tekst: string; x: number; y: number }[];
  namn: readonly KartNamn[];
  /** Ekstra tekst i biletteksten, t.d. om høgdekurvene. */
  merknad?: string;
}
