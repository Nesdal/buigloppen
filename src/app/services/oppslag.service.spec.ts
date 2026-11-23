import { OPPSLAG_TYPAR, Oppslag } from '../models/oppslag';
import oppslagData from '../data/oppslag.json';
import bedrifterData from '../data/bedrifter.json';
import { TING_A_GJERE } from '../data/ting-a-gjere';
import { aktiveOppslag, erAktivt, erFerskt, leggTilDagar, sisteDag } from './oppslag.service';

const idag = '2026-12-01';

const testdata: Oppslag[] = [
  {
    id: 'meny',
    bedriftId: 'kafe',
    type: 'ny-meny',
    tittel: 'Ny meny',
    tekst: 'Suppe',
    fra: '2026-11-28',
  },
  {
    id: 'gammal',
    bedriftId: 'kafe',
    type: 'nyheit',
    tittel: 'Gammal nyheit',
    tekst: 'Utgått',
    fra: '2026-10-01',
  },
  {
    id: 'tilbod',
    bedriftId: 'restaurant',
    type: 'tilbod',
    tittel: 'Tilbod',
    tekst: 'Billeg',
    fra: '2026-11-01',
    til: '2026-12-24',
  },
  {
    id: 'seinare',
    bedriftId: 'restaurant',
    type: 'spesial',
    tittel: 'Julebord',
    tekst: 'Kjem',
    fra: '2026-12-10',
  },
];

const ids = (liste: Oppslag[]) => liste.map((o) => o.id);

describe('oppslag', () => {
  it('reknar ut dagar over månadsskifte', () => {
    expect(leggTilDagar('2026-11-28', 5)).toBe('2026-12-03');
    expect(leggTilDagar('2026-12-01', -7)).toBe('2026-11-24');
  });

  it('varer i 30 dagar når til-dato manglar', () => {
    expect(sisteDag(testdata[0])).toBe('2026-12-27');
    expect(sisteDag(testdata[2])).toBe('2026-12-24');
  });

  it('viser berre oppslag som har starta og ikkje er utgått', () => {
    expect(testdata.map((o) => erAktivt(o, idag))).toEqual([true, false, true, false]);
  });

  it('merkjer nye oppslag som ferske', () => {
    expect(erFerskt(testdata[0], idag)).toBe(true);
    expect(erFerskt(testdata[2], idag)).toBe(false);
  });

  it('sorterer aktive oppslag med nyaste først', () => {
    expect(ids(aktiveOppslag(testdata, idag))).toEqual(['meny', 'tilbod']);
  });
});

describe('oppslag.json', () => {
  const oppslag = oppslagData as Oppslag[];
  const bedriftIds = bedrifterData.map((b) => b.id);
  const typar = OPPSLAG_TYPAR.map((t) => t.id) as string[];
  const dato = /^\d{4}-\d{2}-\d{2}$/;

  it('har unike id-ar med gyldige teikn', () => {
    const idar = oppslag.map((o) => o.id);
    expect(new Set(idar).size).toBe(idar.length);
    for (const id of idar) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('har gyldige felt', () => {
    for (const o of oppslag) {
      const kva = o.id;
      expect(typar, kva).toContain(o.type);
      expect(bedriftIds, kva).toContain(o.bedriftId);
      expect(o.tittel.trim(), kva).not.toBe('');
      expect(o.tekst.trim(), kva).not.toBe('');
      expect(o.fra, kva).toMatch(dato);
      if (o.til) {
        expect(o.til, kva).toMatch(dato);
        expect(o.til >= o.fra, kva).toBe(true);
      }
      for (const url of [o.lenkje, o.kjelde]) if (url) expect(url, kva).toMatch(/^https:\/\//);
    }
  });

  it('har kjelde på alle ekte oppslag', () => {
    for (const o of oppslag.filter((x) => !x.eksempel)) {
      expect(o.kjelde, o.id).toMatch(/^https:\/\//);
    }
  });
});

describe('ting-a-gjere', () => {
  it('peikar berre til bedrifter som finst', () => {
    const bedriftIds = bedrifterData.map((b) => b.id);
    for (const f of TING_A_GJERE) expect(bedriftIds).toContain(f.bedriftId);
  });
});
