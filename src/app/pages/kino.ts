import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AktivitetKort } from '../components/aktivitet-kort';
import { KINOSAL, KINO_BEDRIFT_ID, Vising } from '../models/kino';
import { AktivitetService, isoDato } from '../services/aktivitet.service';
import { KinoService, aldersTekst, kortDagTekst, lengdTekst } from '../services/kino.service';
import { nynorskDato } from '../dato';

/**
 * Kinoprogrammet i Trivselshagen, dag for dag eller film for film (?vis=filmar),
 * og dei neste arrangementa i kultursalen.
 */
@Component({
  selector: 'app-kino',
  // Innhaldet avheng av dagens dato, så det vert teikna på nytt i nettlesaren.
  host: { ngSkipHydration: 'true' },
  imports: [AktivitetKort, RouterLink],
  template: `
    <div class="innhald seksjon">
      <h1>Kino og kultursal</h1>
      <p class="ingress">
        Gloppen kino og Kultursalen ligg i kulturhuset Trivselshagen på Sandane. Billettar kjøper du
        på eBillett, i Trivselskafeen eller på Servicetorget.
        <a [routerLink]="['/bedrift', kinoBedriftId]">Kinoklubb og praktisk info</a>.
      </p>

      <div class="kino-topp">
        <h2>Kinoprogram</h2>
        <div class="kino-vis" role="group" aria-label="Vis programmet">
          <a
            routerLink="/kino"
            [class.aktiv]="!visFilmar()"
            [attr.aria-current]="!visFilmar() ? 'page' : null"
            >Dag for dag</a
          >
          <a
            routerLink="/kino"
            [queryParams]="{ vis: 'filmar' }"
            [class.aktiv]="visFilmar()"
            [attr.aria-current]="visFilmar() ? 'page' : null"
            >Film for film</a
          >
        </div>
      </div>

      @if (filmar().length === 0) {
        <div class="boks">
          <p>Det ligg ingen filmar på programmet akkurat no.</p>
          <a class="knapp" [href]="program.kjelde" target="_blank" rel="noopener">Sjå eBillett</a>
        </div>
      } @else if (visFilmar()) {
        <ul class="film-liste">
          @for (f of filmar(); track f.id) {
            <li class="film" [id]="f.id">
              @if (f.plakat) {
                <img class="film-plakat" [src]="f.plakat" alt="" loading="lazy" width="120" />
              }
              <div class="film-innhald">
                <h3 class="film-tittel">{{ f.tittel }}</h3>
                <p class="kino-meta">
                  {{ meta(f.sjanger, alder(f.aldersgrense), lengd(f.lengd)) }}
                </p>
                @if (f.omtale) {
                  <details class="film-omtale">
                    <summary>Les omtale</summary>
                    @for (del of avsnitt(f.omtale); track $index) {
                      <p>{{ del }}</p>
                    }
                  </details>
                }
                <ul class="film-visingar" aria-label="Framsyningar">
                  @for (v of f.visingar; track v.billett) {
                    <li>
                      @if (v.utselt) {
                        <span class="film-vising utselt">
                          {{ kortDag(v.dato) }} kl. {{ v.tid }} · Utseld
                        </span>
                      } @else {
                        <a class="film-vising" [href]="v.billett" target="_blank" rel="noopener">
                          {{ kortDag(v.dato) }} kl. {{ v.tid }}
                          @if (detaljar(v); as d) {
                            <span class="film-vising-detalj">{{ d }}</span>
                          }
                        </a>
                      }
                    </li>
                  }
                </ul>
              </div>
            </li>
          }
        </ul>
      } @else {
        @for (dag of dagar(); track dag.dato) {
          <h3 class="manad">{{ dag.overskrift }}</h3>
          <ul class="kino-liste">
            @for (f of dag.framsyningar; track f.vising.billett) {
              <li class="kino-rad">
                <span class="kino-tid">{{ f.vising.tid }}</span>
                <span class="kino-film">
                  <a
                    class="kino-tittel"
                    routerLink="/kino"
                    [queryParams]="{ vis: 'filmar' }"
                    [fragment]="f.film.id"
                    >{{ f.film.tittel }}</a
                  >
                  <span class="kino-meta">
                    {{ meta(alder(f.film.aldersgrense), lengd(f.film.lengd), detaljar(f.vising)) }}
                  </span>
                </span>
                @if (f.vising.utselt) {
                  <span class="brikke">Utseld</span>
                } @else {
                  <a
                    class="knapp knapp-sekundar kino-billett"
                    [href]="f.vising.billett"
                    target="_blank"
                    rel="noopener"
                    [attr.aria-label]="'Kjøp billett til ' + f.film.tittel + ' kl. ' + f.vising.tid"
                    >Billett</a
                  >
                }
              </li>
            }
          </ul>
        }
      }

      <p class="kjelde">
        Programmet er henta frå
        <a [href]="program.kjelde" target="_blank" rel="noopener">eBillett</a>
        {{ henta }}. Det kan kome endringar, så sjekk gjerne der før du dreg.
      </p>

      @if (arrangement().length > 0) {
        <div class="seksjon-topp kino-arrangement">
          <h2>Konsertar og teater i Trivselshagen</h2>
          <a routerLink="/aktivitetar" [queryParams]="{ sok: 'Trivselshagen' }">Sjå alle →</a>
        </div>
        <ul class="kort-liste">
          @for (a of arrangement(); track a.id) {
            <li><app-aktivitet-kort [aktivitet]="a" /></li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .kino-topp {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-top: 2rem;

      h2 {
        margin: 0;
      }
    }

    .kino-vis {
      display: inline-flex;
      border: 1px solid var(--kant);
      border-radius: 999px;
      background: var(--flate);
      padding: 0.2rem;

      a {
        padding: 0.35rem 0.9rem;
        border-radius: 999px;
        text-decoration: none;
        color: var(--tekst-svak);
        font-weight: 600;
        font-size: 0.95rem;
      }

      a.aktiv {
        background: var(--fjord);
        color: var(--flate);
      }
    }

    .kino-liste,
    .film-liste,
    .film-visingar {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .kino-liste {
      background: var(--flate);
      border: 1px solid var(--kant);
      border-radius: var(--radius);
      box-shadow: var(--skugge);
    }

    .kino-rad {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1.1rem;

      & + & {
        border-top: 1px solid var(--kant);
      }
    }

    .kino-tid {
      flex: none;
      width: 3.2rem;
      font-weight: 700;
      font-size: 1.1rem;
      font-variant-numeric: tabular-nums;
      color: var(--gras);
    }

    .kino-film {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .kino-tittel {
      font-weight: 700;
      color: var(--fjord-mork);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .kino-meta {
      font-size: 0.9rem;
      color: var(--tekst-svak);
      margin: 0;
    }

    .kino-billett {
      flex: none;
      padding: 0.4rem 0.9rem;
    }

    .film-liste {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }

    .film {
      display: flex;
      gap: 1.25rem;
      padding: 1.25rem;
      background: var(--flate);
      border: 1px solid var(--kant);
      border-radius: var(--radius);
      box-shadow: var(--skugge);
      scroll-margin-top: 1rem;
    }

    .film-plakat {
      flex: none;
      width: 7.5rem;
      height: auto;
      align-self: flex-start;
      border-radius: var(--radius-liten);
      background: var(--fjord-lys);
    }

    .film-innhald {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .film-tittel {
      margin: 0;
      font-size: 1.25rem;
      color: var(--fjord-mork);
    }

    .film-omtale summary {
      cursor: pointer;
      color: var(--fjord);
      font-weight: 600;
    }

    .film-visingar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.4rem;
    }

    .film-vising {
      display: inline-flex;
      flex-direction: column;
      padding: 0.35rem 0.75rem;
      border: 1px solid var(--fjord);
      border-radius: var(--radius-liten);
      text-decoration: none;
      color: var(--fjord);
      font-weight: 600;
      font-size: 0.95rem;

      &::first-letter {
        text-transform: uppercase;
      }

      &:hover {
        background: var(--fjord-lys);
      }

      &.utselt {
        border-color: var(--kant);
        color: var(--tekst-svak);
      }
    }

    .film-vising-detalj {
      font-weight: 400;
      font-size: 0.8rem;
      color: var(--tekst-svak);
    }

    .kino-arrangement {
      margin-top: 3rem;
    }

    @media (max-width: 30rem) {
      .kino-rad {
        gap: 0.75rem;
        padding: 0.75rem 0.85rem;
      }

      .film {
        flex-direction: column;
      }

      .film-plakat {
        width: 6rem;
      }
    }
  `,
})
export class Kino {
  private readonly kino = inject(KinoService);
  private readonly aktivitetar = inject(AktivitetService);

  // Kjem frå query-parameteren via withComponentInputBinding().
  readonly vis = input<string>();

  protected readonly program = this.kino.program;
  protected readonly kinoBedriftId = KINO_BEDRIFT_ID;
  protected readonly henta = nynorskDato(this.program.henta, { aar: true });

  protected readonly visFilmar = computed(() => this.vis() === 'filmar');
  protected readonly dagar = computed(() => this.kino.dagar());
  protected readonly filmar = computed(() => this.kino.filmar());
  protected readonly arrangement = computed(() =>
    this.aktivitetar
      .sok({ type: 'arrangement' })
      .filter((a) => a.lokale?.startsWith('Trivselshagen'))
      .slice(0, 6),
  );

  protected readonly alder = aldersTekst;
  protected readonly lengd = lengdTekst;

  protected kortDag(dato: string): string {
    return kortDagTekst(dato, isoDato());
  }

  protected avsnitt(omtale: string): string[] {
    return omtale.split('\n\n');
  }

  /** Tale og sal når dei skil seg frå det vanlege. */
  protected detaljar(v: Vising): string {
    return this.meta(v.tale === 'Norsk tale' ? v.tale : '', v.sal !== KINOSAL ? v.sal : '');
  }

  /** Slår saman dei delane som finst, med « · » imellom. */
  protected meta(...delar: (string | undefined)[]): string {
    return delar.filter(Boolean).join(' · ');
  }
}
