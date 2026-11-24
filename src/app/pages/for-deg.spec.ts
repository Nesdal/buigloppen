import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ForDeg } from './for-deg';

async function teikn(alder?: string): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(ForDeg);
  if (alder !== undefined) fixture.componentRef.setInput('alder', alder);
  await fixture.whenStable();
  return fixture.nativeElement;
}

const titlar = (el: HTMLElement) =>
  [...el.querySelectorAll('.kort-tittel')].map((t) => t.textContent?.trim());

describe('ForDeg', () => {
  it('viser snarvegar når alderen manglar', async () => {
    const el = await teikn();
    expect(el.querySelectorAll('.alder-snarvegar a').length).toBe(5);
    expect(el.querySelector('.kort')).toBeNull();
  });

  it('tilrår Gloppen U40 for unge vaksne', async () => {
    const el = await teikn('30');
    const brikker = [...el.querySelectorAll('.brikke')].map((b) => b.textContent?.trim());
    expect(brikker).toContain('Unge vaksne');
    expect(titlar(el)).toContain('Gloppen U40');
  });

  it('tilrår ikkje Gloppen U40 for barn', async () => {
    const el = await teikn('8');
    expect(titlar(el)).not.toContain('Gloppen U40');
  });

  it('godtek ikkje ugyldig alder', async () => {
    const el = await teikn('abc');
    expect(el.querySelector('.alder-snarvegar')).not.toBeNull();
  });
});
