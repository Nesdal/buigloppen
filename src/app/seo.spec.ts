import { describe, expect, it } from 'vitest';
import { Aktivitet } from './models/aktivitet';
import { aktivitetJsonLd, delAdresse, kortTekst } from './seo';

describe('kortTekst', () => {
  it('lèt korte tekstar vere', () => {
    expect(kortTekst('Bakeri på Sandane.')).toBe('Bakeri på Sandane.');
  });

  it('kuttar lange tekstar ved eit ordskil', () => {
    const tekst = 'ord '.repeat(60);
    const kort = kortTekst(tekst, 50);
    expect(kort.length).toBeLessThanOrEqual(50);
    expect(kort.endsWith('ord…')).toBe(true);
  });
});

describe('delAdresse', () => {
  it('finn gate, postnummer og stad', () => {
    expect(delAdresse('Industrivegen 23, 6823 Sandane', 'Sandane')).toMatchObject({
      streetAddress: 'Industrivegen 23',
      postalCode: '6823',
      addressLocality: 'Sandane',
    });
  });

  it('brukar staden når adressa manglar postnummer', () => {
    expect(delAdresse('Gimmestad', 'Breim')).toMatchObject({
      streetAddress: 'Gimmestad',
      addressLocality: 'Breim',
    });
  });
});

describe('aktivitetJsonLd', () => {
  const grunn: Aktivitet = {
    id: 'konsert',
    tittel: 'Konsert',
    type: 'arrangement',
    kategori: 'kultur',
    stad: 'Sandane',
    kortSkildring: 'Ein konsert.',
    dato: '2026-12-01',
    starttid: '19:00',
  } as Aktivitet;

  it('lagar Event med starttid for arrangement', () => {
    expect(aktivitetJsonLd(grunn)).toMatchObject({
      '@type': 'Event',
      startDate: '2026-12-01T19:00',
    });
  });

  it('gjev ingenting for faste aktivitetar', () => {
    expect(aktivitetJsonLd({ ...grunn, type: 'fast', dato: undefined })).toBeUndefined();
  });
});
