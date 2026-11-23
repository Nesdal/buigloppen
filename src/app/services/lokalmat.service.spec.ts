import { Aktivitet } from '../models/aktivitet';
import { Bedrift } from '../models/bedrift';
import { MATSLAG, SALSKANALAR, harSalskanal } from '../models/lokalmat';
import bedrifterData from '../data/bedrifter.json';
import { erLokalmat, erLokalmatAktivitet, filtrerLokalmat } from './lokalmat.service';

const bedrift = (b: Partial<Bedrift> & Pick<Bedrift, 'id' | 'namn'>): Bedrift => ({
  type: 'butikk',
  kategori: 'lokalmat',
  stad: 'Sandane',
  kortSkildring: 'Test',
  tilbyr: ['Test'],
  ...b,
});

const testdata: Bedrift[] = [
  bedrift({ id: 'ost', namn: 'Ysteriet', stad: 'Kandal', lokalmat: ['meieri'], sal: ['butikk'] }),
  bedrift({
    id: 'eple',
    namn: 'Eplegarden',
    lokalmat: ['frukt-og-bar', 'drikke'],
    sal: ['sjolvbetent'],
  }),
  bedrift({ id: 'kjot', namn: 'Angusgarden', lokalmat: ['kjot'], sal: ['gardsutsal', 'reko'] }),
  bedrift({ id: 'kafe', namn: 'Kafeen', kategori: 'mat-og-servering', type: 'bedrift' }),
];

describe('harSalskanal', () => {
  it('lèt gardsutsal òg treffe sjølvbetente utsal', () => {
    expect(harSalskanal(['sjolvbetent'], 'gardsutsal')).toBe(true);
    expect(harSalskanal(['gardsutsal'], 'sjolvbetent')).toBe(false);
    expect(harSalskanal(undefined, 'reko')).toBe(false);
  });
});

describe('filtrerLokalmat', () => {
  it('tek berre med bedrifter som har lokalmat, med sal på garden først', () => {
    expect(filtrerLokalmat(testdata, {}).map((b) => b.id)).toEqual(['kjot', 'eple', 'ost']);
  });

  it('filtrerer på matslag, salskanal og stad', () => {
    expect(filtrerLokalmat(testdata, { matslag: 'drikke' }).map((b) => b.id)).toEqual(['eple']);
    expect(filtrerLokalmat(testdata, { sal: 'gardsutsal' }).map((b) => b.id)).toEqual([
      'kjot',
      'eple',
    ]);
    expect(filtrerLokalmat(testdata, { sal: 'reko' }).map((b) => b.id)).toEqual(['kjot']);
    expect(filtrerLokalmat(testdata, { stad: 'Kandal' }).map((b) => b.id)).toEqual(['ost']);
    expect(filtrerLokalmat(testdata, { matslag: 'kjot', stad: 'Kandal' })).toEqual([]);
  });
});

describe('erLokalmatAktivitet', () => {
  const aktivitet = (a: Partial<Aktivitet>): Aktivitet => ({
    id: 'x',
    tittel: 'X',
    type: 'fast',
    kategori: 'marknad',
    stad: 'Sandane',
    kortSkildring: 'X',
    naar: 'Kvar veke',
    ...a,
  });
  const idar = new Set(['eple']);

  it('tek med aktivitetar med stikkordet lokalmat', () => {
    expect(
      erLokalmatAktivitet(aktivitet({ kategori: 'sosialt', stikkord: ['Lokalmat'] }), idar),
    ).toBe(true);
  });

  it('tek med marknader som ein lokalmatprodusent står bak', () => {
    expect(erLokalmatAktivitet(aktivitet({ bedriftId: 'eple' }), idar)).toBe(true);
    expect(erLokalmatAktivitet(aktivitet({ bedriftId: 'eple', kategori: 'kultur' }), idar)).toBe(
      false,
    );
    expect(erLokalmatAktivitet(aktivitet({ bedriftId: 'anna' }), idar)).toBe(false);
  });
});

describe('lokalmat i bedrifter.json', () => {
  const bedrifter = bedrifterData as Bedrift[];
  const matslag = MATSLAG.map((m) => m.id) as string[];
  const kanalar = SALSKANALAR.map((s) => s.id) as string[];

  it('brukar berre kjende matslag og salskanalar', () => {
    for (const b of bedrifter) {
      for (const m of b.lokalmat ?? []) expect(matslag, b.id).toContain(m);
      for (const s of b.sal ?? []) expect(kanalar, b.id).toContain(s);
    }
  });

  it('har lokalmat på alle i kategorien lokalmat, og på alle som har sal eller kjøpetekst', () => {
    for (const b of bedrifter) {
      if (b.kategori === 'lokalmat' || b.sal?.length || b.kjopTekst || b.sesong) {
        expect(erLokalmat(b), b.id).toBe(true);
      }
    }
  });

  it('har minst éin produsent', () => {
    expect(bedrifter.filter(erLokalmat).length).toBeGreaterThan(0);
  });
});
