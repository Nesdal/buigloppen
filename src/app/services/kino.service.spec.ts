import { Kinoprogram } from '../models/kino';
import kinoData from '../data/kino.json';
import {
  aldersTekst,
  dagTekst,
  grupperPerDag,
  komandeFilmar,
  komandeFramsyningar,
  kortDagTekst,
  lengdTekst,
} from './kino.service';

const idag = '2026-11-27';

const program: Kinoprogram = {
  henta: '2026-11-24',
  kjelde: 'https://ebillett.no/trivselshagen/events/daily',
  filmar: [
    {
      id: 'seinare',
      tittel: 'Seinare film',
      aldersgrense: '12',
      lengd: 120,
      visingar: [
        { dato: '2026-11-28', tid: '19:30', billett: 'https://ebillett.no/trivselshagen/3' },
        { dato: '2026-11-27', tid: '19:30', billett: 'https://ebillett.no/trivselshagen/2' },
      ],
    },
    {
      id: 'barnefilm',
      tittel: 'Barnefilm',
      aldersgrense: 'A',
      visingar: [
        { dato: '2026-11-26', tid: '17:00', billett: 'https://ebillett.no/trivselshagen/0' },
        { dato: '2026-11-27', tid: '17:00', billett: 'https://ebillett.no/trivselshagen/1' },
      ],
    },
    {
      id: 'ferdig',
      tittel: 'Gått ut',
      visingar: [
        { dato: '2026-11-20', tid: '19:00', billett: 'https://ebillett.no/trivselshagen/9' },
      ],
    },
  ],
};

describe('kinoprogrammet', () => {
  it('viser berre komande framsyningar i tidsrekkjefølgje', () => {
    const f = komandeFramsyningar(program, idag);
    expect(f.map((x) => x.vising.billett.at(-1))).toEqual(['1', '2', '3']);
    expect(f[0].film.tittel).toBe('Barnefilm');
  });

  it('grupperer per dag med «I dag» og «I morgon»', () => {
    const dagar = grupperPerDag(komandeFramsyningar(program, idag), idag);
    expect(dagar.map((d) => d.overskrift)).toEqual(['I dag', 'I morgon']);
    expect(dagar[0].framsyningar).toHaveLength(2);
  });

  it('tek bort filmar som er gått ut, og sorterer etter første framsyning', () => {
    const filmar = komandeFilmar(program, idag);
    expect(filmar.map((f) => f.id)).toEqual(['barnefilm', 'seinare']);
    expect(filmar[0].visingar).toHaveLength(1);
    // Originalen vert ikkje endra.
    expect(program.filmar[1].visingar).toHaveLength(2);
  });

  it('skriv dagar, alder og lengd på nynorsk', () => {
    expect(dagTekst('2026-12-04', idag)).toBe('Fredag 4. desember');
    expect(kortDagTekst(idag, idag)).toBe('i dag');
    expect(kortDagTekst('2026-11-28', idag)).toBe('i morgon');
    expect(aldersTekst('A')).toBe('For alle');
    expect(aldersTekst('15')).toBe('15 år');
    expect(aldersTekst(undefined)).toBe('');
    expect(lengdTekst(158)).toBe('2 t 38 min');
    expect(lengdTekst(120)).toBe('2 t');
    expect(lengdTekst(45)).toBe('45 min');
  });
});

describe('kino.json', () => {
  const data = kinoData as Kinoprogram;

  it('har gyldige filmar og framsyningar', () => {
    expect(data.henta).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const idar = data.filmar.map((f) => f.id);
    expect(new Set(idar).size).toBe(idar.length);
    for (const f of data.filmar) {
      expect(f.id, f.tittel).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(f.tittel).toBeTruthy();
      if (f.aldersgrense) expect(f.aldersgrense, f.tittel).toMatch(/^(A|\d{1,2})$/);
      expect(f.visingar.length, f.tittel).toBeGreaterThan(0);
      for (const v of f.visingar) {
        expect(v.dato, f.tittel).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(v.tid, f.tittel).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
        expect(v.billett, f.tittel).toMatch(/^https:\/\//);
      }
    }
  });
});
