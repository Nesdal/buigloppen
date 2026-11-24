import { Bedrift, STADER } from '../models/bedrift';
import { FASILITETAR, LOKALE_SLAG, Lokale } from '../models/lokale';
import bedrifterData from '../data/bedrifter.json';
import lokaleData from '../data/lokale.json';
import { filtrerLokale } from './lokale.service';

const lokale = (l: Partial<Lokale> & Pick<Lokale, 'id' | 'namn'>): Lokale => ({
  slag: 'grendehus',
  stad: 'Sandane',
  kortSkildring: 'Test',
  kjelde: 'https://example.no',
  sjekka: '2026-11-24',
  ...l,
});

const testdata: Lokale[] = [
  lokale({ id: 'stor', namn: 'Storsalen', plassar: 250, fasilitetar: ['scene', 'kjokken'] }),
  lokale({ id: 'liten', namn: 'Grendehuset', stad: 'Hyen', plassar: 60, fasilitetar: ['kjokken'] }),
  lokale({ id: 'ukjend', namn: 'Bedehuset', stad: 'Hyen' }),
];

describe('filtrerLokale', () => {
  it('sorterer alfabetisk', () => {
    expect(filtrerLokale(testdata, {}).map((l) => l.id)).toEqual(['ukjend', 'liten', 'stor']);
  });

  it('filtrerer på stad, gjester og fasilitet', () => {
    expect(filtrerLokale(testdata, { stad: 'Hyen' }).map((l) => l.id)).toEqual([
      'ukjend',
      'liten',
    ]);
    expect(filtrerLokale(testdata, { gjester: 100 }).map((l) => l.id)).toEqual(['stor']);
    expect(filtrerLokale(testdata, { gjester: 50 }).map((l) => l.id)).toEqual(['liten', 'stor']);
    expect(filtrerLokale(testdata, { fasilitet: 'scene' }).map((l) => l.id)).toEqual(['stor']);
    expect(filtrerLokale(testdata, { stad: 'Hyen', fasilitet: 'scene' })).toEqual([]);
  });
});

describe('lokale.json', () => {
  const liste = lokaleData as Lokale[];
  const bedriftIdar = new Set((bedrifterData as Bedrift[]).map((b) => b.id));
  const slag = LOKALE_SLAG.map((s) => s.id) as string[];
  const fasilitetar = FASILITETAR.map((f) => f.id) as string[];

  it('har minst eitt lokale', () => {
    expect(liste.length).toBeGreaterThan(0);
  });

  it('har unike, gyldige id-ar', () => {
    const idar = liste.map((l) => l.id);
    expect(new Set(idar).size).toBe(idar.length);
    for (const id of idar) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('brukar berre kjende slag, stader og fasilitetar', () => {
    for (const l of liste) {
      expect(slag, l.id).toContain(l.slag);
      expect(STADER as readonly string[], l.id).toContain(l.stad);
      for (const f of l.fasilitetar ?? []) expect(fasilitetar, l.id).toContain(f);
    }
  });

  it('har kjelde, sjekka-dato og fornuftig storleik', () => {
    for (const l of liste) {
      expect(l.kjelde, l.id).toMatch(/^https:\/\//);
      expect(l.sjekka, l.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(l.sjekka)), l.id).toBe(false);
      if (l.plassar !== undefined) {
        expect(Number.isInteger(l.plassar) && l.plassar > 0, l.id).toBe(true);
      }
      for (const url of [l.nettstad, l.booking].filter(Boolean)) {
        expect(url, l.id).toMatch(/^https:\/\//);
      }
    }
  });

  it('peikar berre til bedrifter som finst', () => {
    for (const l of liste) if (l.bedriftId) expect(bedriftIdar.has(l.bedriftId), l.id).toBe(true);
  });
});
