/**
 * Datoar på nynorsk.
 *
 * Vi skriv namna sjølve i staden for å bruke `toLocaleDateString('nn-NO')`, fordi Chrome
 * og andre nettlesarar ikkje har nynorsk og då fell tilbake til engelsk ("Friday 27 November").
 * Då vert teksten òg lik på serveren (førehandsrendering) og i nettlesaren.
 */

const MANADER = [
  'januar',
  'februar',
  'mars',
  'april',
  'mai',
  'juni',
  'juli',
  'august',
  'september',
  'oktober',
  'november',
  'desember',
];
const MANADER_KORT = MANADER.map((m) => m.slice(0, 3));
const VEKEDAGAR = ['søndag', 'måndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag'];
const VEKEDAGAR_KORT = ['sø.', 'må.', 'ty.', 'on.', 'to.', 'fr.', 'la.'];

export interface DatoVal {
  /** Ta med vekedagen, t.d. "fredag" (lang) eller "fr." (kort). */
  vekedag?: 'lang' | 'kort';
  /** Ta med dag i månaden, t.d. "27.". Standard: true. */
  dag?: boolean;
  /** "november" (lang, standard), "nov" (kort) eller false for ingen månad. */
  manad?: 'lang' | 'kort' | false;
  /** Ta med årstalet. */
  aar?: boolean;
}

/** Les "ÅÅÅÅ-MM-DD" som ein lokal dato, eller brukar Date-objektet som det er. */
function lesDato(dato: Date | string): Date {
  if (dato instanceof Date) return dato;
  const [aar, manad, dag] = dato.split('-').map(Number);
  return new Date(aar, manad - 1, dag);
}

/**
 * Skriv ein dato på nynorsk, t.d. "fredag 27. november 2026" eller "fr. 27. nov".
 * Standard er "27. november".
 */
export function nynorskDato(dato: Date | string, val: DatoVal = {}): string {
  const d = lesDato(dato);
  const { vekedag, dag = true, manad = 'lang', aar = false } = val;
  const delar: string[] = [];
  if (vekedag) delar.push((vekedag === 'lang' ? VEKEDAGAR : VEKEDAGAR_KORT)[d.getDay()]);
  if (dag) delar.push(`${d.getDate()}.`);
  if (manad) delar.push((manad === 'lang' ? MANADER : MANADER_KORT)[d.getMonth()]);
  if (aar) delar.push(String(d.getFullYear()));
  return delar.join(' ');
}

/** Stor forbokstav, t.d. for "Fredag 27. november" i ei overskrift. */
export function storForbokstav(tekst: string): string {
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}
