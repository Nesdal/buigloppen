import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Fritid } from './fritid';

async function teikn(inputs: Record<string, string> = {}): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Fritid);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  await fixture.whenStable();
  return fixture.nativeElement;
}

const titlar = (el: HTMLElement) =>
  [...el.querySelectorAll('.kort-tittel')].map((t) => t.textContent?.trim());

describe('Fritid', () => {
  it('viser berre faste aktivitetar', async () => {
    const el = await teikn();
    expect(titlar(el)).toContain('Gloppen U40');
    // Datoblokka høyrer til arrangement, som berre skal stå under «Kampar og stemne».
    const liste = el.querySelector('h2 + .kort-liste');
    expect(liste?.querySelector('.datoblokk')).toBeNull();
  });

  it('viser ingenting når filteret ikkje passar', async () => {
    const el = await teikn({ sok: 'finst-ikkje-xyz' });
    expect(el.querySelector('.treff')?.textContent).toContain('0 treff');
  });
});

describe('grupperPerGren', () => {
  it('samlar same gren og legg det utan gren sist', async () => {
    const { grupperPerGren } = await import('./fritid');
    const lag = (id: string, gren?: string) =>
      ({
        id,
        tittel: id,
        type: 'fast',
        kategori: 'idrett',
        stad: 'Sandane',
        kortSkildring: '',
        naar: 'x',
        gren,
      }) as const;
    const g = grupperPerGren([
      lag('b', 'Skyting'),
      lag('c'),
      lag('a', 'Handball'),
      lag('d', 'skyting'),
    ]);
    expect(g.map((x) => [x.namn, x.aktivitetar.map((a) => a.id)])).toEqual([
      ['Handball', ['a']],
      ['Skyting', ['b', 'd']],
      [null, ['c']],
    ]);
  });
});
