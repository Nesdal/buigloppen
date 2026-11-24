import { describe, expect, it } from 'vitest';
import { nynorskDato, storForbokstav } from './dato';

describe('nynorskDato', () => {
  it('skriv dag og månad som standard', () => {
    expect(nynorskDato('2026-11-27')).toBe('27. november');
  });

  it('kan ta med vekedag og år', () => {
    expect(nynorskDato('2026-11-28', { vekedag: 'lang', aar: true })).toBe(
      'laurdag 28. november 2026',
    );
    expect(nynorskDato('2026-12-01', { vekedag: 'lang' })).toBe('tysdag 1. desember');
  });

  it('har korte former', () => {
    expect(nynorskDato('2026-11-29', { vekedag: 'kort', manad: 'kort' })).toBe('sø. 29. nov');
    expect(nynorskDato('2026-05-03', { dag: false, manad: 'kort' })).toBe('mai');
  });

  it('kan skrive berre månad og år', () => {
    expect(storForbokstav(nynorskDato('2027-01-15', { dag: false, aar: true }))).toBe(
      'Januar 2027',
    );
  });

  it('godtek Date-objekt', () => {
    expect(nynorskDato(new Date(2026, 6, 4), { vekedag: 'lang' })).toBe('laurdag 4. juli');
  });
});
