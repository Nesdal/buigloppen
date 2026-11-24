import { Injectable } from '@angular/core';
import { FERSK_DAGAR, Oppslag, STANDARD_VARIGHEIT_DAGAR } from '../models/oppslag';
import oppslagData from '../data/oppslag.json';
import { isoDato } from './aktivitet.service';
import { nynorskDato } from '../dato';

function somDato(iso: string): Date {
  // Midt på dagen, så tidssone aldri flyttar datoen.
  return new Date(iso + 'T12:00:00');
}

/** Legg til (eller trekk frå) dagar på ein ÅÅÅÅ-MM-DD-dato. */
export function leggTilDagar(iso: string, dagar: number): string {
  const d = somDato(iso);
  d.setDate(d.getDate() + dagar);
  return isoDato(d);
}

/** Siste dag oppslaget vert vist. */
export function sisteDag(o: Oppslag): string {
  return o.til ?? leggTilDagar(o.fra, STANDARD_VARIGHEIT_DAGAR - 1);
}

/** Oppslaget vert vist frå og med `fra` til og med siste dag. */
export function erAktivt(o: Oppslag, idag: string): boolean {
  return o.fra <= idag && sisteDag(o) >= idag;
}

/** Lagt ut dei siste {@link FERSK_DAGAR} dagane. */
export function erFerskt(o: Oppslag, idag: string): boolean {
  return erAktivt(o, idag) && o.fra > leggTilDagar(idag, -FERSK_DAGAR);
}

/** Aktive oppslag, nyaste først. */
export function aktiveOppslag(oppslag: readonly Oppslag[], idag: string): Oppslag[] {
  return oppslag
    .filter((o) => erAktivt(o, idag))
    .sort((a, b) => b.fra.localeCompare(a.fra) || a.tittel.localeCompare(b.tittel, 'nn'));
}

/** T.d. "20. november". */
export function kortDato(iso: string): string {
  return nynorskDato(iso);
}

/**
 * Lenkje der ei bedrift kan sende inn eit nytt oppslag. Opnar eit ferdig utfylt
 * skjema (GitHub-sak) som den som held lista ved like, legg inn i `oppslag.json`.
 */
export function sendInnLenkje(bedriftNamn = ''): string {
  const tittel = `Nytt oppslag${bedriftNamn ? ': ' + bedriftNamn : ''}`;
  const tekst = [
    `Bedrift: ${bedriftNamn}`,
    'Kva slag: ny meny / spesialitet / tilbod / nyopna / anna nytt',
    'Overskrift: ',
    'Kort tekst (1–3 setningar): ',
    'Vis frå dato: ',
    'Vis til dato (valfritt, elles 30 dagar): ',
    'Lenkje til meny, Facebook-innlegg e.l. (valfritt): ',
  ].join('\n');
  return (
    'https://github.com/Nesdal/buigloppen/issues/new?title=' +
    encodeURIComponent(tittel) +
    '&body=' +
    encodeURIComponent(tekst)
  );
}

@Injectable({ providedIn: 'root' })
export class OppslagService {
  private readonly oppslag: readonly Oppslag[] = oppslagData as Oppslag[];

  alle(): readonly Oppslag[] {
    return this.oppslag;
  }

  /** Alle oppslag som vert viste i dag, nyaste først. */
  aktive(idag = isoDato()): Oppslag[] {
    return aktiveOppslag(this.oppslag, idag);
  }

  forBedrift(bedriftId: string, idag = isoDato()): Oppslag[] {
    return this.aktive(idag).filter((o) => o.bedriftId === bedriftId);
  }

  /** Det nyaste aktive oppslaget til ei bedrift, til merket på bedriftskortet. */
  nyasteForBedrift(bedriftId: string, idag = isoDato()): Oppslag | undefined {
    return this.forBedrift(bedriftId, idag)[0];
  }
}
