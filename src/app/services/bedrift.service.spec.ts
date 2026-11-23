import { Bedrift, KATEGORIAR, STADER, TYPAR } from '../models/bedrift';
import bedrifterData from '../data/bedrifter.json';
import { filtrer, normaliser } from './bedrift.service';

const testdata: Bedrift[] = [
  {
    id: 'a',
    namn: 'Fjordkafé',
    type: 'bedrift',
    kategori: 'mat-og-servering',
    stad: 'Sandane',
    kortSkildring: 'Kaffi og vaflar',
    tilbyr: ['Lunsj', 'Kaker'],
  },
  {
    id: 'b',
    namn: 'Åsen Bakeri',
    type: 'butikk',
    kategori: 'daglegvare',
    stad: 'Byrkjelo',
    kortSkildring: 'Brød',
    tilbyr: ['Brød', 'Bakevarer'],
  },
  {
    id: 'c',
    namn: 'Bilsenter',
    type: 'bedrift',
    kategori: 'bil-og-transport',
    stad: 'Sandane',
    kortSkildring: 'Bilverkstad',
    tilbyr: ['Service', 'Dekkskift'],
    stikkord: ['EU-kontroll'],
  },
];

describe('normaliser', () => {
  it('gjer om til små bokstavar og fjernar aksentar', () => {
    expect(normaliser('  Kafé ')).toBe('kafe');
  });

  it('held på æ, ø og å', () => {
    expect(normaliser('Æ Ø Å')).toBe('æ ø å');
  });
});

describe('filtrer', () => {
  it('returnerer alle, sorterte på namn, utan filter', () => {
    expect(filtrer(testdata, {}).map((b) => b.id)).toEqual(['c', 'a', 'b']);
  });

  it('søkjer i namn, skildring, tilbyr og stikkord utan omsyn til aksentar', () => {
    expect(filtrer(testdata, { sok: 'kafe' }).map((b) => b.id)).toEqual(['a']);
    expect(filtrer(testdata, { sok: 'LUNSJ' }).map((b) => b.id)).toEqual(['a']);
    expect(filtrer(testdata, { sok: 'dekkskift' }).map((b) => b.id)).toEqual(['c']);
    expect(filtrer(testdata, { sok: 'eu-kontroll' }).map((b) => b.id)).toEqual(['c']);
  });

  it('krev at alle søkjeord treffer', () => {
    expect(filtrer(testdata, { sok: 'service sandane' }).map((b) => b.id)).toEqual(['c']);
    expect(filtrer(testdata, { sok: 'service byrkjelo' })).toEqual([]);
  });

  it('filtrerer på kategori, stad og type', () => {
    expect(filtrer(testdata, { stad: 'Sandane' }).map((b) => b.id)).toEqual(['c', 'a']);
    expect(filtrer(testdata, { kategori: 'daglegvare' }).map((b) => b.id)).toEqual(['b']);
    expect(filtrer(testdata, { type: 'butikk' }).map((b) => b.id)).toEqual(['b']);
    expect(filtrer(testdata, { type: 'bedrift', stad: 'Sandane' }).map((b) => b.id)).toEqual(['c', 'a']);
  });

  it('tek med bedrifter som har kategorien som ekstrakategori', () => {
    const hotell: Bedrift = {
      id: 'h',
      namn: 'Hotell',
      type: 'servering',
      kategori: 'overnatting',
      ekstraKategoriar: ['mat-og-servering'],
      stad: 'Sandane',
      kortSkildring: 'Hotell med restaurant',
      tilbyr: ['Rom', 'Middag'],
    };
    const data = [...testdata, hotell];
    expect(filtrer(data, { kategori: 'mat-og-servering' }).map((b) => b.id)).toEqual(['a', 'h']);
    expect(filtrer(data, { kategori: 'overnatting' }).map((b) => b.id)).toEqual(['h']);
  });
});

describe('bedrifter.json', () => {
  const bedrifter = bedrifterData as Bedrift[];

  it('har unike id-ar med gyldig format', () => {
    const ids = bedrifter.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('har gyldige verdiar i alle obligatoriske felt', () => {
    const kategoriar = KATEGORIAR.map((k) => k.id) as string[];
    const typar = TYPAR.map((t) => t.id) as string[];
    for (const b of bedrifter) {
      const kva = `${b.id}`;
      expect(kategoriar, kva).toContain(b.kategori);
      for (const k of b.ekstraKategoriar ?? []) {
        expect(kategoriar, kva).toContain(k);
        expect(k, `${kva}: ekstrakategori lik hovudkategori`).not.toBe(b.kategori);
      }
      expect(typar, kva).toContain(b.type);
      expect(STADER as readonly string[], kva).toContain(b.stad);
      expect(b.namn.trim(), kva).not.toBe('');
      expect(b.kortSkildring.trim(), kva).not.toBe('');
      expect(b.tilbyr.length, kva).toBeGreaterThan(0);
    }
  });

  it('har kafear og restaurantar som type servering', () => {
    for (const b of bedrifter.filter((x) => x.kategori === 'mat-og-servering')) {
      expect(b.type, b.id).toBe('servering');
    }
  });

  it('har praktiske punkt på forma "Overskrift: tekst" utan semikolon', () => {
    for (const b of bedrifter) {
      for (const p of b.praktisk ?? []) {
        expect(p, b.id).toMatch(/^[^:]+: \S/);
        expect(p, b.id).not.toContain(';');
      }
    }
  });

  it('har kjelde og sjekka-dato på alle ekte oppføringar', () => {
    for (const b of bedrifter.filter((x) => !x.eksempel)) {
      expect(b.kjelde, b.id).toMatch(/^https:\/\//);
      expect(b.sjekka, b.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (b.nettstad) expect(b.nettstad, b.id).toMatch(/^https?:\/\//);
    }
  });
});
