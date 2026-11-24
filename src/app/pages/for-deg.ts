import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AktivitetKort } from '../components/aktivitet-kort';
import { MALGRUPPER, Malgruppe } from '../models/aktivitet';
import { AktivitetService } from '../services/aktivitet.service';

/**
 * Tips for deg: skriv inn alder og få lag, nettverk og arrangement som passar.
 * Alderen ligg i adressa (`/for-deg?alder=30`), same som filtra på dei andre sidene.
 */
@Component({
  selector: 'app-for-deg',
  // Innhaldet avheng av dagens dato, så det vert teikna på nytt i nettlesaren.
  host: { ngSkipHydration: 'true' },
  imports: [AktivitetKort, RouterLink],
  template: `
    <div class="innhald seksjon">
      <h1>Tips for deg</h1>
      <p class="ingress">
        Skriv inn alderen din, så viser vi lag, nettverk og arrangement i Gloppen som passar for
        deg.
      </p>

      <form class="alder-sok" (submit)="$event.preventDefault()">
        <label for="alder">Kor gamal er du?</label>
        <input
          id="alder"
          type="number"
          inputmode="numeric"
          min="0"
          max="120"
          [value]="alderTal() ?? ''"
          (input)="settAlder($any($event.target).value)"
          placeholder="T.d. 32"
        />
      </form>

      @if (tilraading(); as t) {
        <p class="brikker" aria-live="polite">
          @for (m of t.malgrupper; track m) {
            <span class="brikke">{{ namn(m) }}</span>
          }
        </p>

        @if (t.faste.length > 0) {
          <h2>Lag og nettverk for deg</h2>
          <p class="treff">Faste treffpunkt der du kan bli kjend med folk.</p>
          <ul class="kort-liste">
            @for (a of t.faste; track a.id) {
              <li><app-aktivitet-kort [aktivitet]="a" /></li>
            }
          </ul>
        }

        @if (t.arrangement.length > 0) {
          <h2>Arrangement for deg</h2>
          <ul class="kort-liste">
            @for (a of t.arrangement; track a.id) {
              <li><app-aktivitet-kort [aktivitet]="a" /></li>
            }
          </ul>
        }

        @if (t.faste.length === 0 && t.arrangement.length === 0) {
          <div class="boks">
            <p>
              Vi har ikkje lagt inn noko som er laga spesielt for {{ gruppeTekst() }} enno. Under
              finn du arrangement som er opne for alle.
            </p>
          </div>
        }

        @if (t.opne.length > 0) {
          <div class="seksjon-topp">
            <h2>Opne for alle</h2>
            <a routerLink="/aktivitetar" [queryParams]="{ malgruppe: spesifikk() }">
              Alt som passar for {{ gruppeTekst() }} →
            </a>
          </div>
          <ul class="kort-liste">
            @for (a of t.opne; track a.id) {
              <li><app-aktivitet-kort [aktivitet]="a" /></li>
            }
          </ul>
        }

        <div class="boks tips">
          <h2>Veit du om noko for {{ gruppeTekst() }}?</h2>
          <p>
            Lag, foreiningar og nettverk som manglar her, legg vi gjerne inn. Send oss namn, kven
            det er for og korleis ein blir med.
          </p>
          <a class="knapp" [href]="tipsLenkje" target="_blank" rel="noopener"
            >Tips oss om ein aktivitet</a
          >
        </div>
      } @else {
        <ul class="brikker alder-snarvegar">
          @for (s of snarvegar; track s.alder) {
            <li>
              <a class="knapp knapp-sekundar" routerLink="." [queryParams]="{ alder: s.alder }">{{
                s.tekst
              }}</a>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ForDeg {
  private readonly router = inject(Router);
  private readonly service = inject(AktivitetService);

  // Kjem frå query-parameteren via withComponentInputBinding().
  readonly alder = input<string>();

  protected readonly tipsLenkje =
    'https://github.com/Nesdal/buigloppen/issues/new?title=' + encodeURIComponent('Ny aktivitet: ');

  /** Døme-aldrar for den som ikkje vil skrive. */
  protected readonly snarvegar = [
    { alder: 8, tekst: 'Barn' },
    { alder: 15, tekst: 'Ungdom' },
    { alder: 30, tekst: 'Unge vaksne' },
    { alder: 50, tekst: 'Vaksne' },
    { alder: 70, tekst: 'Seniorar' },
  ];

  protected readonly alderTal = computed(() => {
    const tal = Number(this.alder());
    return this.alder() && Number.isInteger(tal) && tal >= 0 && tal <= 120 ? tal : null;
  });

  protected readonly tilraading = computed(() => {
    const alder = this.alderTal();
    return alder === null ? null : this.service.tilraad(alder);
  });

  /** Den mest presise målgruppa, t.d. «unge vaksne» framfor «vaksne» for ein på 30. */
  protected readonly spesifikk = computed<Malgruppe | null>(() => {
    const grupper = this.tilraading()?.malgrupper ?? [];
    return grupper.find((m) => m !== 'vaksne') ?? grupper[0] ?? null;
  });

  protected readonly gruppeTekst = computed(() => {
    const m = this.spesifikk();
    return m ? this.namn(m).toLowerCase() : 'alle';
  });

  protected namn(id: Malgruppe): string {
    return MALGRUPPER.find((m) => m.id === id)?.namn ?? id;
  }

  protected settAlder(verdi: string): void {
    this.router.navigate([], {
      queryParams: { alder: verdi.trim() || null },
      replaceUrl: true,
    });
  }
}
