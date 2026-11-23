import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AktivitetKort } from '../components/aktivitet-kort';
import { AKTIVITET_KATEGORIAR, AKTIVITET_TYPAR, MALGRUPPER } from '../models/aktivitet';
import { STADER } from '../models/bedrift';
import { AktivitetService, grupperPerManad } from '../services/aktivitet.service';

type Endring = {
  sok?: string;
  type?: string;
  kategori?: string;
  stad?: string;
  malgruppe?: string;
};

/**
 * Kva skjer i Gloppen: komande arrangement og faste aktivitetar.
 * Filtra ligg i adressa, same som på bedriftsoversikta.
 */
@Component({
  selector: 'app-aktivitetar',
  imports: [AktivitetKort],
  template: `
    <div class="innhald seksjon">
      <h1>Kva skjer i Gloppen?</h1>
      <p class="ingress">
        Konsertar, marknader, møte, trening, kurs og treffpunkt for deg som bur i Gloppen.
      </p>

      <form class="filter filter-4" role="search" (submit)="$event.preventDefault()">
        <div class="felt felt-brei">
          <label for="sok">Søk</label>
          <input
            id="sok"
            type="search"
            [value]="sok() ?? ''"
            (input)="oppdater({ sok: $any($event.target).value })"
            placeholder="T.d. konsert, fotball, kor, marknad …"
            autocomplete="off"
          />
        </div>
        <div class="felt">
          <label for="type">Vis</label>
          <select id="type" (change)="oppdater({ type: $any($event.target).value })">
            <option value="" [selected]="!typeId()">Alt</option>
            @for (t of typar; track t.id) {
              <option [value]="t.id" [selected]="t.id === typeId()">{{ t.fleirtal }}</option>
            }
          </select>
        </div>
        <div class="felt">
          <label for="kategori">Kategori</label>
          <select id="kategori" (change)="oppdater({ kategori: $any($event.target).value })">
            <option value="" [selected]="!kategoriId()">Alle kategoriar</option>
            @for (k of kategoriar; track k.id) {
              <option [value]="k.id" [selected]="k.id === kategoriId()">{{ k.namn }}</option>
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
        <div class="felt">
          <label for="malgruppe">For</label>
          <select id="malgruppe" (change)="oppdater({ malgruppe: $any($event.target).value })">
            <option value="" [selected]="!malgruppeId()">Alle</option>
            @for (m of malgrupper; track m.id) {
              <option [value]="m.id" [selected]="m.id === malgruppeId()">{{ m.namn }}</option>
            }
          </select>
        </div>
      </form>

      <p class="treff" aria-live="polite">{{ resultat().length }} treff</p>

      @if (resultat().length === 0) {
        <div class="boks">
          <p>Fann ingen aktivitetar som passar. Prøv eit anna søkjeord eller fjern eit filter.</p>
          <button type="button" class="knapp" (click)="nullstill()">Vis alle</button>
        </div>
      }

      @if (manadar().length > 0) {
        <h2>Arrangement</h2>
        @for (g of manadar(); track g.manad) {
          <h3 class="manad">{{ g.manad }}</h3>
          <ul class="kort-liste">
            @for (a of g.aktivitetar; track a.id) {
              <li><app-aktivitet-kort [aktivitet]="a" /></li>
            }
          </ul>
        }
      }

      @if (faste().length > 0) {
        <h2>Faste aktivitetar</h2>
        <p class="treff">Lag, klubbar og treffpunkt som går att gjennom året.</p>
        <ul class="kort-liste">
          @for (a of faste(); track a.id) {
            <li><app-aktivitet-kort [aktivitet]="a" /></li>
          }
        </ul>
      }

      <div class="boks tips">
        <h2>Manglar det noko?</h2>
        <p>
          Skal laget, foreininga eller bedrifta di ha noko på gang? Send oss tittel, dato, stad og
          ei kort skildring, så legg vi det inn.
        </p>
        <a class="knapp" [href]="tipsLenkje" target="_blank" rel="noopener"
          >Tips oss om ein aktivitet</a
        >
      </div>
    </div>
  `,
})
export class Aktivitetar {
  private readonly router = inject(Router);
  private readonly service = inject(AktivitetService);

  // Kjem frå query-parametrane via withComponentInputBinding().
  readonly sok = input<string>();
  readonly type = input<string>();
  readonly kategori = input<string>();
  readonly stad = input<string>();
  readonly malgruppe = input<string>();

  protected readonly typar = AKTIVITET_TYPAR;
  protected readonly kategoriar = AKTIVITET_KATEGORIAR;
  protected readonly stader = STADER;
  protected readonly malgrupper = MALGRUPPER;
  protected readonly tipsLenkje =
    'https://github.com/Nesdal/buigloppen/issues/new?title=' + encodeURIComponent('Ny aktivitet: ');

  protected readonly typeId = computed(() =>
    gyldig(
      this.type(),
      AKTIVITET_TYPAR.map((t) => t.id),
    ),
  );
  protected readonly kategoriId = computed(() =>
    gyldig(
      this.kategori(),
      AKTIVITET_KATEGORIAR.map((k) => k.id),
    ),
  );
  protected readonly stadNamn = computed(() => gyldig(this.stad(), STADER));
  protected readonly malgruppeId = computed(() =>
    gyldig(
      this.malgruppe(),
      MALGRUPPER.map((m) => m.id),
    ),
  );

  protected readonly resultat = computed(() =>
    this.service.sok({
      sok: this.sok(),
      type: this.typeId(),
      kategori: this.kategoriId(),
      stad: this.stadNamn(),
      malgruppe: this.malgruppeId(),
    }),
  );

  protected readonly manadar = computed(() =>
    grupperPerManad(this.resultat().filter((a) => a.type === 'arrangement')),
  );
  protected readonly faste = computed(() => this.resultat().filter((a) => a.type === 'fast'));

  protected oppdater(endring: Endring): void {
    const neste: Required<Endring> = {
      sok: this.sok() ?? '',
      type: this.typeId() ?? '',
      kategori: this.kategoriId() ?? '',
      stad: this.stadNamn() ?? '',
      malgruppe: this.malgruppeId() ?? '',
      ...endring,
    };
    this.router.navigate([], {
      queryParams: {
        sok: neste.sok.trim() || null,
        type: neste.type || null,
        kategori: neste.kategori || null,
        stad: neste.stad || null,
        malgruppe: neste.malgruppe || null,
      },
      replaceUrl: true,
    });
  }

  protected nullstill(): void {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }
}

function gyldig<T extends string>(verdi: string | undefined, lovlege: readonly T[]): T | null {
  return (lovlege as readonly string[]).includes(verdi ?? '') ? (verdi as T) : null;
}
