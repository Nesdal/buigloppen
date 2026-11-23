import { Injectable } from '@angular/core';
import { Aktivitet, AktivitetKategoriId, AktivitetType, Malgruppe } from '../models/aktivitet';
import { Stad } from '../models/bedrift';
import aktivitetarData from '../data/aktivitetar.json';
import { normaliser } from './bedrift.service';

export interface AktivitetFilter {
  sok?: string;
  kategori?: AktivitetKategoriId | null;
  stad?: Stad | null;
  type?: AktivitetType | null;
  malgruppe?: Malgruppe | null;
}

/** Dagens dato som ÅÅÅÅ-MM-DD i lokal tid. */
export function isoDato(d: Date = new Date()): string {
  const to = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${to(d.getMonth() + 1)}-${to(d.getDate())}`;
}

/** Faste aktivitetar er alltid aktuelle. Arrangement er aktuelle til og med siste dag. */
export function erAktuell(a: Aktivitet, idag: string): boolean {
  if (a.type === 'fast') return true;
  const siste = a.sluttdato ?? a.dato;
  return !!siste && siste >= idag;
}

/**
 * Filtrerer og sorterer. Arrangement som er over, vert tekne bort.
 * Arrangement kjem først i datorekkjefølgje, så faste aktivitetar alfabetisk.
 */
export function filtrerAktivitetar(
  aktivitetar: readonly Aktivitet[],
  filter: AktivitetFilter,
  idag: string,
): Aktivitet[] {
  const ord = normaliser(filter.sok ?? '')
    .split(/\s+/)
    .filter(Boolean);

  return (
    aktivitetar
      .filter((a) => erAktuell(a, idag))
      .filter((a) => !filter.type || a.type === filter.type)
      .filter((a) => !filter.kategori || a.kategori === filter.kategori)
      .filter((a) => !filter.stad || a.stad === filter.stad)
      // Aktivitetar utan målgruppe er opne for alle og passar difor alle filter.
      .filter(
        (a) => !filter.malgruppe || !a.malgruppe?.length || a.malgruppe.includes(filter.malgruppe),
      )
      .filter((a) => {
        if (ord.length === 0) return true;
        const tekst = normaliser(
          [
            a.tittel,
            a.kortSkildring,
            a.skildring,
            a.stad,
            a.lokale,
            a.arrangor,
            ...(a.stikkord ?? []),
          ]
            .filter(Boolean)
            .join(' '),
        );
        return ord.every((o) => tekst.includes(o));
      })
      .sort(samanlikn)
  );
}

function samanlikn(a: Aktivitet, b: Aktivitet): number {
  if (a.type !== b.type) return a.type === 'arrangement' ? -1 : 1;
  if (a.type === 'arrangement') {
    const dato = (a.dato ?? '').localeCompare(b.dato ?? '');
    if (dato !== 0) return dato;
    const tid = (a.starttid ?? '').localeCompare(b.starttid ?? '');
    if (tid !== 0) return tid;
  }
  return a.tittel.localeCompare(b.tittel, 'nn');
}

function somDato(iso: string): Date {
  // Midt på dagen, så tidssone aldri flyttar datoen.
  return new Date(iso + 'T12:00:00');
}

/** T.d. "laurdag 12. desember" eller "12.–14. desember". Tom tekst for faste aktivitetar. */
export function datoTekst(a: Aktivitet, medAar = false): string {
  if (!a.dato) return '';
  const fra = somDato(a.dato);
  const aar = medAar ? { year: 'numeric' as const } : {};
  if (!a.sluttdato || a.sluttdato === a.dato) {
    return fra.toLocaleDateString('nn-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      ...aar,
    });
  }
  const til = somDato(a.sluttdato);
  const sameManad = fra.getMonth() === til.getMonth() && fra.getFullYear() === til.getFullYear();
  const start = sameManad
    ? `${fra.getDate()}.`
    : fra.toLocaleDateString('nn-NO', { day: 'numeric', month: 'long' });
  return `${start}–${til.toLocaleDateString('nn-NO', { day: 'numeric', month: 'long', ...aar })}`;
}

/** T.d. "kl. 19:00–22:00" eller "kl. 19:00". */
export function tidTekst(a: Aktivitet): string {
  if (!a.starttid) return '';
  return `kl. ${a.starttid}${a.sluttid ? '–' + a.sluttid : ''}`;
}

/** Når-teksten som vert vist på kort og detaljside. */
export function naarTekst(a: Aktivitet): string {
  if (a.type === 'fast') return a.naar ?? '';
  return [datoTekst(a), tidTekst(a)].filter(Boolean).join(', ');
}

/** Delar ei sortert liste med arrangement i grupper per månad, t.d. "desember 2026". */
export function grupperPerManad(
  arrangement: readonly Aktivitet[],
): { manad: string; aktivitetar: Aktivitet[] }[] {
  const grupper: { nokkel: string; manad: string; aktivitetar: Aktivitet[] }[] = [];
  for (const a of arrangement) {
    if (!a.dato) continue;
    const nokkel = a.dato.slice(0, 7);
    let gruppe = grupper.find((g) => g.nokkel === nokkel);
    if (!gruppe) {
      const manad = somDato(a.dato).toLocaleDateString('nn-NO', { month: 'long', year: 'numeric' });
      gruppe = { nokkel, manad: manad.charAt(0).toUpperCase() + manad.slice(1), aktivitetar: [] };
      grupper.push(gruppe);
    }
    gruppe.aktivitetar.push(a);
  }
  return grupper.map(({ manad, aktivitetar }) => ({ manad, aktivitetar }));
}

/** Lagar ei .ics-fil (iCalendar) for eit arrangement, så det kan leggjast i kalenderen. */
export function lagIcs(a: Aktivitet, url: string): string {
  if (a.type !== 'arrangement' || !a.dato) return '';
  const dato = (iso: string) => iso.replaceAll('-', '');
  const tid = (t: string) => t.replace(':', '') + '00';
  const nesteDag = (iso: string) => {
    const d = somDato(iso);
    d.setDate(d.getDate() + 1);
    return isoDato(d);
  };
  const tekst = (t: string) =>
    t
      .replaceAll('\\', '\\\\')
      .replaceAll(';', '\\;')
      .replaceAll(',', '\\,')
      .replaceAll('\n', '\\n');

  let start: string;
  let slutt: string;
  if (a.starttid) {
    // Lokal tid utan tidssone ("floating"), så kalenderen viser same klokkeslett som her.
    start = `DTSTART:${dato(a.dato)}T${tid(a.starttid)}`;
    // Utan sluttdato og med sluttid før starttid (t.d. julebord 18:00–02:30) sluttar det dagen etter.
    const overNatta = !a.sluttdato && !!a.sluttid && a.sluttid < a.starttid;
    const sluttDag = a.sluttdato ?? (overNatta ? nesteDag(a.dato) : a.dato);
    slutt =`DTEND:${dato(sluttDag)}T${tid(a.sluttid ?? a.starttid)}`;
  } else {
    start = `DTSTART;VALUE=DATE:${dato(a.dato)}`;
    slutt = `DTEND;VALUE=DATE:${dato(nesteDag(a.sluttdato ?? a.dato))}`;
  }

  const stad = [a.lokale, a.stad].filter(Boolean).join(', ');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bu i Gloppen//NN',
    'BEGIN:VEVENT',
    `UID:${a.id}@buigloppen`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    start,
    slutt,
    `SUMMARY:${tekst(a.tittel)}`,
    `LOCATION:${tekst(stad)}`,
    `DESCRIPTION:${tekst(a.kortSkildring + '\n' + url)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

@Injectable({ providedIn: 'root' })
export class AktivitetService {
  private readonly aktivitetar: readonly Aktivitet[] = aktivitetarData as Aktivitet[];

  alle(): readonly Aktivitet[] {
    return this.aktivitetar;
  }

  hent(id: string): Aktivitet | undefined {
    return this.aktivitetar.find((a) => a.id === id);
  }

  sok(filter: AktivitetFilter, idag = isoDato()): Aktivitet[] {
    return filtrerAktivitetar(this.aktivitetar, filter, idag);
  }

  /** Dei neste arrangementa, til framsida. */
  neste(tal: number, idag = isoDato()): Aktivitet[] {
    return this.sok({ type: 'arrangement' }, idag).slice(0, tal);
  }

  /** Aktuelle aktivitetar som ei bedrift står bak. */
  forBedrift(bedriftId: string, idag = isoDato()): Aktivitet[] {
    return this.sok({}, idag).filter((a) => a.bedriftId === bedriftId);
  }
}
