import { Injectable } from '@angular/core';
import { Film, Kinoprogram, Vising } from '../models/kino';
import kinoData from '../data/kino.json';
import { isoDato } from './aktivitet.service';
import { leggTilDagar } from './oppslag.service';
import { nynorskDato, storForbokstav } from '../dato';

/** Ei framsyning saman med filmen ho høyrer til. */
export interface Framsyning {
  film: Film;
  vising: Vising;
}

export interface Kinodag {
  dato: string;
  /** "I dag", "I morgon" eller t.d. "Fredag 27. november". */
  overskrift: string;
  framsyningar: Framsyning[];
}

/** Alle framsyningar frå og med `idag`, i tidsrekkjefølgje. */
export function komandeFramsyningar(program: Kinoprogram, idag: string): Framsyning[] {
  return program.filmar
    .flatMap((film) => film.visingar.map((vising) => ({ film, vising })))
    .filter((f) => f.vising.dato >= idag)
    .sort((a, b) => (a.vising.dato + a.vising.tid).localeCompare(b.vising.dato + b.vising.tid));
}

/** Framsyningane gruppert per dag. */
export function grupperPerDag(framsyningar: readonly Framsyning[], idag: string): Kinodag[] {
  const dagar: Kinodag[] = [];
  for (const f of framsyningar) {
    let dag = dagar.at(-1);
    if (dag?.dato !== f.vising.dato) {
      dag = { dato: f.vising.dato, overskrift: dagTekst(f.vising.dato, idag), framsyningar: [] };
      dagar.push(dag);
    }
    dag.framsyningar.push(f);
  }
  return dagar;
}

/** Filmane som har minst éi komande framsyning, med berre dei komande framsyningane. */
export function komandeFilmar(program: Kinoprogram, idag: string): Film[] {
  return program.filmar
    .map((film) => ({ ...film, visingar: film.visingar.filter((v) => v.dato >= idag) }))
    .filter((film) => film.visingar.length > 0)
    .sort((a, b) =>
      (a.visingar[0].dato + a.visingar[0].tid).localeCompare(
        b.visingar[0].dato + b.visingar[0].tid,
      ),
    );
}

/** "I dag", "I morgon" eller t.d. "Fredag 27. november". */
export function dagTekst(dato: string, idag: string): string {
  if (dato === idag) return 'I dag';
  if (dato === leggTilDagar(idag, 1)) return 'I morgon';
  return storForbokstav(nynorskDato(dato, { vekedag: 'lang' }));
}

/** Kort dag til bruk i ei setning: "i dag", "i morgon" eller t.d. "fr. 27. nov". */
export function kortDagTekst(dato: string, idag: string): string {
  if (dato === idag) return 'i dag';
  if (dato === leggTilDagar(idag, 1)) return 'i morgon';
  return nynorskDato(dato, { vekedag: 'kort', manad: 'kort' });
}

/** "A" → "For alle", "12" → "12 år". */
export function aldersTekst(aldersgrense: string | undefined): string {
  if (!aldersgrense) return '';
  return aldersgrense === 'A' ? 'For alle' : `${aldersgrense} år`;
}

/** 158 → "2 t 38 min", 90 → "1 t 30 min", 45 → "45 min". */
export function lengdTekst(minutt: number | undefined): string {
  if (!minutt) return '';
  const t = Math.floor(minutt / 60);
  const m = minutt % 60;
  return [t ? `${t} t` : '', m ? `${m} min` : ''].filter(Boolean).join(' ');
}

@Injectable({ providedIn: 'root' })
export class KinoService {
  readonly program = kinoData as Kinoprogram;

  framsyningar(idag = isoDato()): Framsyning[] {
    return komandeFramsyningar(this.program, idag);
  }

  dagar(idag = isoDato()): Kinodag[] {
    return grupperPerDag(this.framsyningar(idag), idag);
  }

  filmar(idag = isoDato()): Film[] {
    return komandeFilmar(this.program, idag);
  }

  /** Den neste framsyninga, til framsida og sida til kinoen. */
  neste(idag = isoDato()): Framsyning | undefined {
    return this.framsyningar(idag)[0];
  }
}
