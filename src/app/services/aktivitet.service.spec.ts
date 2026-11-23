import { AKTIVITET_KATEGORIAR, Aktivitet, MALGRUPPER, malgruppeTekst } from '../models/aktivitet';
import { STADER } from '../models/bedrift';
import aktivitetarData from '../data/aktivitetar.json';
import bedrifterData from '../data/bedrifter.json';
import {
  datoTekst,
  erAktuell,
  filtrerAktivitetar,
  grupperPerManad,
  lagIcs,
  naarTekst,
} from './aktivitet.service';

const idag = '2026-12-01';

const testdata: Aktivitet[] = [
  {
    id: 'konsert',
    tittel: 'Julekonsert',
    type: 'arrangement',
    kategori: 'kultur',
    stad: 'Sandane',
    kortSkildring: 'Kor og korps',
    dato: '2026-12-13',
    starttid: '18:00',
    sluttid: '19:30',
  },
  {
    id: 'marknad',
    tittel: 'Marknad',
    type: 'arrangement',
    kategori: 'marknad',
    stad: 'Byrkjelo',
    kortSkildring: 'Lokal mat',
    dato: '2026-12-05',
    arrangor: 'Handelslaget',
  },
  {
    id: 'over',
    tittel: 'Haustfest',
    type: 'arrangement',
    kategori: 'sosialt',
    stad: 'Sandane',
    kortSkildring: 'Ferdig',
    dato: '2026-11-20',
  },
  {
    id: 'festival',
    tittel: 'Filmhelg',
    type: 'arrangement',
    kategori: 'kultur',
    stad: 'Sandane',
    kortSkildring: 'Film',
    dato: '2026-11-29',
    sluttdato: '2026-12-01',
  },
  {
    id: 'fotball',
    tittel: 'Fotball for born',
    type: 'fast',
    kategori: 'idrett',
    stad: 'Byrkjelo',
    kortSkildring: 'Trening',
    naar: 'Kvar tysdag kl. 17',
    malgruppe: ['barn'],
  },
  {
    id: 'kor',
    tittel: 'Bygdekor',
    type: 'fast',
    kategori: 'kultur',
    stad: 'Hyen',
    kortSkildring: 'Song',
    naar: 'Kvar torsdag',
  },
];

const ids = (liste: Aktivitet[]) => liste.map((a) => a.id);

describe('erAktuell', () => {
  it('tek med faste aktivitetar og arrangement som ikkje er over', () => {
    const [konsert, , over, festival, fotball] = testdata;
    expect(erAktuell(konsert, idag)).toBe(true);
    expect(erAktuell(over, idag)).toBe(false);
    expect(erAktuell(festival, idag)).toBe(true); // siste dag er i dag
    expect(erAktuell(fotball, idag)).toBe(true);
  });
});

describe('filtrerAktivitetar', () => {
  it('viser arrangement i datorekkjefølgje før faste aktivitetar, og skjuler gamle', () => {
    expect(ids(filtrerAktivitetar(testdata, {}, idag))).toEqual([
      'festival',
      'marknad',
      'konsert',
      'kor',
      'fotball',
    ]);
  });

  it('filtrerer på type, kategori og stad', () => {
    expect(ids(filtrerAktivitetar(testdata, { type: 'fast' }, idag))).toEqual(['kor', 'fotball']);
    expect(ids(filtrerAktivitetar(testdata, { kategori: 'kultur' }, idag))).toEqual([
      'festival',
      'konsert',
      'kor',
    ]);
    expect(ids(filtrerAktivitetar(testdata, { stad: 'Byrkjelo' }, idag))).toEqual([
      'marknad',
      'fotball',
    ]);
  });

  it('reknar aktivitetar utan målgruppe som opne for alle', () => {
    expect(ids(filtrerAktivitetar(testdata, { malgruppe: 'barn', type: 'fast' }, idag))).toEqual([
      'kor',
      'fotball',
    ]);
    expect(
      ids(filtrerAktivitetar(testdata, { malgruppe: 'seniorar', type: 'fast' }, idag)),
    ).toEqual(['kor']);
  });

  it('søkjer i tittel, skildring og arrangør', () => {
    expect(ids(filtrerAktivitetar(testdata, { sok: 'handelslaget' }, idag))).toEqual(['marknad']);
    expect(ids(filtrerAktivitetar(testdata, { sok: 'JULEKONSERT sandane' }, idag))).toEqual([
      'konsert',
    ]);
  });
});

describe('tekstar', () => {
  it('lagar dato- og tidstekst', () => {
    const [konsert, , , festival, fotball] = testdata;
    // Vekedagen kjem frå nettlesaren, som kan skrive anten søndag eller sundag.
    expect(naarTekst(konsert)).toMatch(/^(søndag|sundag) 13\. desember, kl\. 18:00–19:30$/);
    expect(datoTekst(festival)).toBe('29. november–1. desember');
    expect(naarTekst(fotball)).toBe('Kvar tysdag kl. 17');
  });

  it('lagar tekst for målgruppe', () => {
    expect(malgruppeTekst(undefined)).toBe('Open for alle');
    expect(malgruppeTekst(['barn'])).toBe('For barn');
    expect(malgruppeTekst(['seniorar', 'barn', 'ungdom'])).toBe('For barn, ungdom og seniorar');
  });

  it('grupperer arrangement per månad', () => {
    const arrangement = filtrerAktivitetar(testdata, { type: 'arrangement' }, idag);
    expect(grupperPerManad(arrangement).map((g) => [g.manad, ids(g.aktivitetar)])).toEqual([
      ['November 2026', ['festival']],
      ['Desember 2026', ['marknad', 'konsert']],
    ]);
  });
});

describe('lagIcs', () => {
  it('lagar kalenderoppføring med klokkeslett', () => {
    const ics = lagIcs(testdata[0], 'https://example.no/aktivitet/konsert');
    expect(ics).toContain('DTSTART:20261213T180000');
    expect(ics).toContain('DTEND:20261213T193000');
    expect(ics).toContain('SUMMARY:Julekonsert');
  });

  it('lagar heildagsoppføring når klokkeslett manglar, med sluttdato dagen etter', () => {
    const ics = lagIcs(testdata[3], '');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261129');
    expect(ics).toContain('DTEND;VALUE=DATE:20261202');
  });

  it('lèt kveldsarrangement som går over midnatt slutte dagen etter', () => {
    const julebord: Aktivitet = {
      ...testdata[0],
      sluttdato: undefined,
      starttid: '18:00',
      sluttid: '02:30',
    };
    const ics = lagIcs(julebord, '');
    expect(ics).toContain('DTSTART:20261213T180000');
    expect(ics).toContain('DTEND:20261214T023000');
  });

  it('lagar ingenting for faste aktivitetar', () => {
    expect(lagIcs(testdata[4], '')).toBe('');
  });
});

describe('aktivitetar.json', () => {
  const aktivitetar = aktivitetarData as Aktivitet[];
  const bedriftIds = (bedrifterData as { id: string }[]).map((b) => b.id);
  const dato = /^\d{4}-\d{2}-\d{2}$/;
  const tid = /^([01]\d|2[0-3]):[0-5]\d$/;

  it('har unike og gyldige id-ar', () => {
    const alle = aktivitetar.map((a) => a.id);
    expect(new Set(alle).size).toBe(alle.length);
    for (const id of alle) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('har gyldige verdiar i alle felt', () => {
    const kategoriar = AKTIVITET_KATEGORIAR.map((k) => k.id) as string[];
    const malgrupper = MALGRUPPER.map((m) => m.id) as string[];
    for (const a of aktivitetar) {
      const kva = a.id;
      expect(['arrangement', 'fast'], kva).toContain(a.type);
      expect(kategoriar, kva).toContain(a.kategori);
      expect(STADER as readonly string[], kva).toContain(a.stad);
      expect(a.tittel.trim(), kva).not.toBe('');
      expect(a.kortSkildring.trim(), kva).not.toBe('');
      for (const m of a.malgruppe ?? []) expect(malgrupper, kva).toContain(m);
      if (a.starttid) expect(a.starttid, kva).toMatch(tid);
      if (a.sluttid) expect(a.sluttid, kva).toMatch(tid);
      if (a.bedriftId) expect(bedriftIds, kva).toContain(a.bedriftId);
      for (const url of [a.pamelding, a.nettstad]) if (url) expect(url, kva).toMatch(/^https:\/\//);
    }
  });

  it('har dato på arrangement og når-tekst på faste aktivitetar', () => {
    for (const a of aktivitetar) {
      if (a.type === 'arrangement') {
        expect(a.dato, a.id).toMatch(dato);
        if (a.sluttdato) expect(a.sluttdato >= a.dato!, a.id).toBe(true);
      } else {
        expect(a.naar?.trim(), a.id).toBeTruthy();
      }
    }
  });

  it('har kjelde og sjekka-dato på alle ekte oppføringar', () => {
    for (const a of aktivitetar.filter((x) => !x.eksempel)) {
      expect(a.kjelde, a.id).toMatch(/^https:\/\//);
      expect(a.sjekka, a.id).toMatch(dato);
    }
  });
});
