import { Bedrift, KATEGORIAR, STADER } from '../models/bedrift';
import bedrifterData from '../data/bedrifter.json';
import { filtrer, normaliser } from './bedrift.service';

const testdata: Bedrift[] = [
  { id: 'a', namn: 'Fjordkafé', kategori: 'mat-og-servering', stad: 'Sandane', kortSkildring: 'Kaffi og vaflar', stikkord: ['lunsj'] },
  { id: 'b', namn: 'Åsen Bakeri', kategori: 'daglegvare', stad: 'Byrkjelo', kortSkildring: 'Brød' },
  { id: 'c', namn: 'Bilsenter', kategori: 'bil-og-transport', stad: 'Sandane', kortSkildring: 'Service og dekk' },
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

  it('søkjer i namn, skildring og stikkord utan omsyn til aksentar', () => {
    expect(filtrer(testdata, { sok: 'kafe' }).map((b) => b.id)).toEqual(['a']);
    expect(filtrer(testdata, { sok: 'LUNSJ' }).map((b) => b.id)).toEqual(['a']);
    expect(filtrer(testdata, { sok: 'dekk' }).map((b) => b.id)).toEqual(['c']);
  });

  it('krev at alle søkjeord treffer', () => {
    expect(filtrer(testdata, { sok: 'service sandane' }).map((b) => b.id)).toEqual(['c']);
    expect(filtrer(testdata, { sok: 'service byrkjelo' })).toEqual([]);
  });

  it('filtrerer på kategori og stad', () => {
    expect(filtrer(testdata, { stad: 'Sandane' }).map((b) => b.id)).toEqual(['c', 'a']);
    expect(filtrer(testdata, { kategori: 'daglegvare' }).map((b) => b.id)).toEqual(['b']);
  });
});

describe('bedrifter.json', () => {
  const bedrifter = bedrifterData as Bedrift[];

  it('har unike id-ar med gyldig format', () => {
    const ids = bedrifter.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('brukar berre kjende kategoriar og stader', () => {
    const kategoriar = KATEGORIAR.map((k) => k.id) as string[];
    for (const b of bedrifter) {
      expect(kategoriar).toContain(b.kategori);
      expect(STADER as readonly string[]).toContain(b.stad);
      expect(b.namn.trim()).not.toBe('');
      expect(b.kortSkildring.trim()).not.toBe('');
    }
  });
});
