import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AktivitetKort } from '../components/aktivitet-kort';
import { LokalmatKort } from '../components/lokalmat-kort';
import { STADER, Stad } from '../models/bedrift';
import { MATSLAG, Matslag, SALSKANALAR, Salskanal } from '../models/lokalmat';
import { LokalmatService } from '../services/lokalmat.service';

type Endring = { matslag?: string; sal?: string; stad?: string };

const MELD_INN =
  'https://github.com/Nesdal/buigloppen/issues/new?title=' +
  encodeURIComponent('Lokalmat: ') +
  '&body=' +
  encodeURIComponent(
    [
      'Namn på garden eller produsenten:',
      'Stad i Gloppen:',
      'Kva de sel (kjøt, ost, egg, frukt …):',
      'Korleis ein får kjøpt det (gardsutsal, sjølvbetent, REKO, butikk, bestilling):',
      'Adresse:',
      'Telefon / e-post / nettstad / Facebook:',
      'Sesong eller opningstider:',
    ].join('\n\n'),
  );

/**
 * Lokalmat i Gloppen: gardar og produsentar, og kvar du får kjøpt maten.
 * Filtra ligg i adressa (?matslag=&sal=&stad=), same som på dei andre oversiktene.
 */
@Component({
  selector: 'app-lokalmat',
  // Innhaldet avheng av dagens dato, så det vert teikna på nytt i nettlesaren.
  host: { ngSkipHydration: 'true' },
  imports: [RouterLink, LokalmatKort, AktivitetKort],
  template: `
    <div class="innhald seksjon">
      <h1>Lokalmat i Gloppen</h1>
      <p class="ingress">
        Ost, kjøt, eple, saft og bakst – kjøpt rett frå dei som lagar det. Her finn du gardane og
        produsentane i Gloppen, og kvar du får tak i maten deira.
      </p>

      <div class="matslag-val" role="group" aria-label="Kva vil du kjøpe?">
        <button
          type="button"
          class="matslag-knapp"
          [attr.aria-pressed]="!matslagId()"
          (click)="oppdater({ matslag: '' })"
        >
          Alt
        </button>
        @for (m of matslagMedTal; track m.id) {
          <button
            type="button"
            class="matslag-knapp"
            [attr.aria-pressed]="m.id === matslagId()"
            (click)="oppdater({ matslag: m.id === matslagId() ? '' : m.id })"
          >
            <span aria-hidden="true">{{ m.ikon }}</span> {{ m.namn }}
            <span class="matslag-tal">{{ m.tal }}</span>
          </button>
        }
      </div>

      <form class="filter filter-2" (submit)="$event.preventDefault()">
        <div class="felt">
          <label for="sal">Korleis vil du handle?</label>
          <select id="sal" (change)="oppdater({ sal: $any($event.target).value })">
            <option value="" [selected]="!salId()">Alle måtar</option>
            @for (s of salskanalar; track s.id) {
              <option [value]="s.id" [selected]="s.id === salId()">
                {{ s.namn }} – {{ s.forklaring.toLocaleLowerCase('nn') }}
              </option>
            }
          </select>
        </div>
        <div class="felt">
          <label for="stad">Stad</label>
          <select id="stad" (change)="oppdater({ stad: $any($event.target).value })">
            <option value="" [selected]="!stadNamn()">Heile Gloppen</option>
            @for (s of stader; track s) {
              <option [value]="s" [selected]="s === stadNamn()">{{ s }}</option>
            }
          </select>
        </div>
      </form>

      <p class="treff" aria-live="polite">{{ resultat().length }} treff</p>

      @if (resultat().length > 0) {
        <ul class="kort-liste">
          @for (b of resultat(); track b.id) {
            <li><app-lokalmat-kort [bedrift]="b" /></li>
          }
        </ul>
      } @else {
        <div class="boks">
          <p>Fann ingen som passar. Prøv å fjerne eit filter.</p>
          <button type="button" class="knapp" (click)="nullstill()">Vis alle</button>
        </div>
      }
    </div>

    @if (aktivitetar.length > 0) {
      <section class="innhald seksjon">
        <h2>Marknader og REKO-ring</h2>
        <p class="seksjon-ingress">Her kan du kjøpe frå fleire produsentar på ein gong.</p>
        <ul class="kort-liste">
          @for (a of aktivitetar; track a.id) {
            <li><app-aktivitet-kort [aktivitet]="a" /></li>
          }
        </ul>
      </section>
    }

    <section class="innhald seksjon">
      <div class="lokalmat-tips">
        <div>
          <h2>Slik handlar du lokalmat</h2>
          <dl class="fakta">
            <dt>Gardsutsal</dt>
            <dd>
              Mange gardar sel rett frå tunet. Somme har fast opningstid, andre må du ringje først.
            </dd>
            <dt>Sjølvbetent</dt>
            <dd>
              Eit skur eller kjøleskap ved vegen der du tek det du vil ha og betaler med Vipps eller
              kontantar. Ofte berre i sesongen.
            </dd>
            <dt>REKO-ring</dt>
            <dd>
              Du bestiller i ei Facebook-gruppe og hentar varene hos produsentane på ein fast stad
              og tid.
            </dd>
          </dl>
        </div>
        <div class="boks">
          <h2>Sel du lokalmat?</h2>
          <p>
            Har du gardsutsal, sel på REKO eller lagar mat for sal i Gloppen? Fortel oss om det, så
            kjem du med her – gratis.
          </p>
          <a class="knapp" [href]="meldInn" target="_blank" rel="noopener">Meld deg på</a>
          <p class="kjelde">
            Kafear og butikkar som sel lokalmat finn du òg under
            <a routerLink="/bedrifter" [queryParams]="{ sok: 'lokalmat' }">bedrifter</a>.
          </p>
        </div>
      </div>
    </section>
  `,
})
export class Lokalmat {
  private readonly router = inject(Router);
  private readonly service = inject(LokalmatService);

  // Kjem frå query-parametrane via withComponentInputBinding().
  readonly matslag = input<string>();
  readonly sal = input<string>();
  readonly stad = input<string>();

  protected readonly salskanalar = SALSKANALAR;
  protected readonly stader = STADER;
  protected readonly meldInn = MELD_INN;
  protected readonly aktivitetar = this.service.aktivitetar();

  /** Berre matslag som nokon faktisk sel, så ingen knappar gjev null treff. */
  protected readonly matslagMedTal = (() => {
    const tal = this.service.talPerMatslag();
    return MATSLAG.filter((m) => tal.has(m.id)).map((m) => ({ ...m, tal: tal.get(m.id)! }));
  })();

  protected readonly matslagId = computed(() => {
    const m = this.matslag();
    return MATSLAG.some((x) => x.id === m) ? (m as Matslag) : null;
  });

  protected readonly salId = computed(() => {
    const s = this.sal();
    return SALSKANALAR.some((x) => x.id === s) ? (s as Salskanal) : null;
  });

  protected readonly stadNamn = computed(() => {
    const s = this.stad();
    return (STADER as readonly string[]).includes(s ?? '') ? (s as Stad) : null;
  });

  protected readonly resultat = computed(() =>
    this.service.sok({ matslag: this.matslagId(), sal: this.salId(), stad: this.stadNamn() }),
  );

  protected oppdater(endring: Endring): void {
    const neste = {
      matslag: this.matslagId() ?? '',
      sal: this.salId() ?? '',
      stad: this.stadNamn() ?? '',
      ...endring,
    };
    this.router.navigate([], {
      queryParams: {
        matslag: neste.matslag || null,
        sal: neste.sal || null,
        stad: neste.stad || null,
      },
      replaceUrl: true,
    });
  }

  protected nullstill(): void {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }
}
