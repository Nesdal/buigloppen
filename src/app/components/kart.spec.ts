import { TestBed } from '@angular/core/testing';
import { KART_GLOPPEN } from '../data/kart-gloppen';
import { KART_SANDANE } from '../data/kart-sandane';
import { Kart } from '../models/kart';
import { KartVising } from './kart';

async function teikn(kart: Kart): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(KartVising);
  fixture.componentRef.setInput('kart', kart);
  await fixture.whenStable();
  return fixture.nativeElement;
}

describe('KartVising', () => {
  for (const kart of [KART_SANDANE, KART_GLOPPEN]) {
    describe(kart.id, () => {
      it('teiknar sjø, vegar og alle stadnamna', async () => {
        const el = await teikn(kart);

        expect(el.querySelector('svg')?.getAttribute('viewBox')).toBe(
          `0 0 ${kart.breidd} ${kart.hogd}`,
        );
        expect(el.querySelector('path.sjo')?.getAttribute('d')).toMatch(/^M.*Z$/);
        expect(el.querySelectorAll('path.hovudveg').length).toBe(1);

        const namn = [...el.querySelectorAll('text.namn')].map((t) => t.textContent?.trim());
        expect(namn).toEqual(kart.namn.map((n) => n.namn));
        expect(el.querySelectorAll('circle.prikk').length).toBe(
          kart.namn.filter((n) => n.prikk).length,
        );
      });

      it('held alle namna innanfor kartet', () => {
        for (const n of kart.namn) {
          expect(n.x, n.namn).toBeGreaterThan(10);
          expect(n.x, n.namn).toBeLessThan(kart.breidd - 10);
          expect(n.y, n.namn).toBeGreaterThan(10);
          expect(n.y, n.namn).toBeLessThan(kart.hogd - 10);
        }
      });
    });
  }

  it('dempar området utanfor kommunegrensa på oversiktskartet', async () => {
    const el = await teikn(KART_GLOPPEN);
    expect(el.querySelector('path.utanfor')?.getAttribute('fill-rule')).toBe('evenodd');
    expect(el.querySelector('rect.skugge')?.getAttribute('mask')).toMatch(
      /^url\(#kart-\d+-skugge\)$/,
    );
  });
});
