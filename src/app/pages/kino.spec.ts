import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Kino } from './kino';
import { KinoService } from '../services/kino.service';
import { Kinoprogram } from '../models/kino';

const program: Kinoprogram = {
  henta: '2026-11-24',
  kjelde: 'https://ebillett.no/trivselshagen/events/daily',
  filmar: [
    {
      id: 'barnefilm',
      tittel: 'Barnefilm',
      aldersgrense: 'A',
      lengd: 74,
      omtale: 'Første avsnitt.\n\nAndre avsnitt.',
      visingar: [
        {
          dato: '2099-01-02',
          tid: '17:00',
          sal: 'Kultursalen',
          tale: 'Norsk tale',
          billett: 'https://ebillett.no/trivselshagen/1',
        },
        {
          dato: '2099-01-03',
          tid: '13:00',
          sal: 'Gloppen Kino',
          utselt: true,
          billett: 'https://ebillett.no/trivselshagen/2',
        },
      ],
    },
  ],
};

describe('Kino', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Kino],
      providers: [provideRouter([])],
    }).compileComponents();
    const service = TestBed.inject(KinoService);
    (service as { program: Kinoprogram }).program = program;
  });

  it('viser programmet dag for dag med billettlenkje', async () => {
    const fixture = TestBed.createComponent(Kino);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const rader = el.querySelectorAll('.kino-rad');
    expect(rader).toHaveLength(2);
    expect(rader[0].textContent).toContain('17:00');
    expect(rader[0].textContent).toContain('Barnefilm');
    expect(rader[0].textContent).toContain('For alle · 1 t 14 min · Norsk tale · Kultursalen');
    expect(rader[0].querySelector('a.kino-billett')?.getAttribute('href')).toBe(
      'https://ebillett.no/trivselshagen/1',
    );
    expect(rader[1].textContent).toContain('Utseld');
  });

  it('viser filmane med omtale og framsyningar', async () => {
    const fixture = TestBed.createComponent(Kino);
    fixture.componentRef.setInput('vis', 'filmar');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const film = el.querySelector('#barnefilm');
    expect(film?.querySelector('.film-tittel')?.textContent).toContain('Barnefilm');
    expect(film?.querySelectorAll('.film-omtale p')).toHaveLength(2);
    expect(film?.querySelectorAll('.film-vising')).toHaveLength(2);
  });
});
