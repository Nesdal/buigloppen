/**
 * Stader som vert framheva under «Ting å gjere» på framsida.
 * Kvar framheving peikar til ei bedrift i `bedrifter.json`, så detaljane
 * (adresse, opningstider, kjelde) berre ligg éin stad.
 */
export interface Framheving {
  bedriftId: string;
  /** Eiga side kortet skal lenkje til i staden for sida til bedrifta, t.d. "/kino". */
  lenkje?: string;
  ikon: string;
  overskrift: string;
  tekst: string;
}

export const TING_A_GJERE: readonly Framheving[] = [
  {
    bedriftId: 'trivselshagen-bad-og-idrett',
    ikon: '🏊',
    overskrift: 'Symjehallen',
    tekst: 'Basseng, varmtvassbasseng, sklie og klatrevegg i Trivselshagen.',
  },
  {
    bedriftId: 'trivselsskogen',
    ikon: '🌲',
    overskrift: 'Trivselsskogen',
    tekst: 'Familievenlege turstiar, gapahukar og bålplassar – og utsikt over Holvikfossen.',
  },
  {
    bedriftId: 'trivselshagen-kino',
    lenkje: '/kino',
    ikon: '🎬',
    overskrift: 'Kino og kultursal',
    tekst: 'Film, konsertar og teater i kulturhuset Trivselshagen.',
  },
];
